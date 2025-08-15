// API functions for your frontend

export const todoApi = {
    // Get all todos
    getAllTodos: async () => {
        const response = await fetch('http://localhost:5000/api/todos');
        return response.json();
    },

    // Create new todo
    createTodo: async (text) => {
        const response = await fetch('http://localhost:5000/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        return response.json();
    },

    // Update todo
    updateTodo: async (id, updates) => {
        const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        return response.json();
    },

    // Delete todo
    deleteTodo: async (id) => {
        await fetch(`http://localhost:5000/api/todos/${id}`, {
            method: 'DELETE'
        });
    }
};
