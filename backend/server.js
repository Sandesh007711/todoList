const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Todo = require('./models/Todo');
const auth = require('./middleware/auth');

const app = express();

// Detailed CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Enhanced request logging middleware
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        path: req.url,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Basic route validation
app.use('/api', (req, res, next) => {
    if (!req.accepts('json')) {
        return res.status(406).json({ message: 'Only JSON requests are accepted' });
    }
    next();
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Registration
app.post('/api/users/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User Login
app.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new Error('Invalid login credentials');
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Protected Todo Routes
app.get('/api/todos', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/todos', auth, async (req, res) => {
    try {
        const todo = new Todo({
            ...req.body,
            user: req.user._id
        });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/todos/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        if (req.body.completed && !todo.completed) {
            req.body.completedAt = new Date();
        }
        
        Object.assign(todo, req.body);
        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/todos/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user._id 
        });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Todo Completion History
app.get('/api/todos/history', auth, async (req, res) => {
    try {
        const completedTodos = await Todo.find({
            user: req.user._id,
            completed: true,
            completedAt: { $ne: null }
        }).sort({ completedAt: -1 });
        res.json(completedTodos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Todo Completion History by Date Range
app.get('/api/todos/history/byDate', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {
            user: req.user._id,
            completed: true,
            completedAt: { 
                $ne: null,
                $gte: new Date(startDate || '1970-01-01'),
                $lte: new Date(endDate || Date.now())
            }
        };

        const completionHistory = await Todo.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
                    todos: { 
                        $push: {
                            _id: "$_id",
                            text: "$text",
                            completedAt: "$completedAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": -1 } }
        ]);

        res.json(completionHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET    /api/todos');
    console.log('- POST   /api/todos');
    console.log('- PUT    /api/todos/:id');
    console.log('- DELETE /api/todos/:id');
});
