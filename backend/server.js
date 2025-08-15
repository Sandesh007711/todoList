const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const config = require('./config/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Todo = require('./models/Todo');
const auth = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Temporarily hardcode for development
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
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

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

// User Logout
app.post('/api/users/logout', auth, async (req, res) => {
    try {
        // You could add token to a blacklist here if implementing full token invalidation
        // For now, we'll just send a success response
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout' });
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

// Get Current User Profile
app.get('/api/users/me', auth, async (req, res) => {
    try {
        // Get user without password
        const user = await User.findById(req.user._id)
            .select('-password');

        // Get user statistics
        const stats = await Todo.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalTodos: { $sum: 1 },
                    completedTodos: {
                        $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] }
                    },
                    pendingTodos: {
                        $sum: { $cond: [{ $eq: ["$completed", false] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            user,
            stats: stats[0] || { totalTodos: 0, completedTodos: 0, pendingTodos: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: config.nodeEnv === 'production' ? 'Something went wrong' : err.message,
        stack: config.nodeEnv === 'development' ? err.stack : undefined
});
});
