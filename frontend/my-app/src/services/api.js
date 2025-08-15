const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
      throw error;
    }
  }

  static async login(credentials) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async getUserInfo() {
    return this.request('/users/me');
  }

  static async getTodos() {
    return this.request('/todos');
  }

  static async createTodo(text) {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  static async updateTodo(id, updates) {
    return this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteTodo(id) {
    return this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiService;
