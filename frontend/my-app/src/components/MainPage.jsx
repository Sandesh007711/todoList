import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function MainPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  // Get completion stats
  const getCompletionStats = () => {
    const today = new Date().toLocaleDateString();
    return todos.reduce((acc, todo) => {
      if (todo.completed) {
        acc[today] = (acc[today] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div ref={sidebarRef} className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}>
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <div>
                  <p className="font-medium">User Name</p>
                  <p className="text-sm text-gray-500">user@example.com</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>

          <div>
            <Link to="/completion-history" className="block">
              <h2 className="text-xl font-bold text-gray-800 mb-4 hover:text-blue-600 cursor-pointer">
                Completion History
              </h2>
            </Link>
            <div className="space-y-2">
              {Object.entries(getCompletionStats()).slice(0, 3).map(([date, count]) => (
                <div key={date} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{date}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {count} completed
                  </span>
                </div>
              ))}
              <Link 
                to="/completion-history"
                className="block text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                View full history →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0">
        <div className="p-6">
          {/* Top section with menu and title */}
          <div className="flex items-center mb-8 relative">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 absolute left-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex-1 text-center">
              My Todo List
            </h1>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={addTodo} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add new task..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Todo
            </button>
          </form>

          {/* Todo Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todos.map(todo => (
                  <tr key={todo.id}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                        {todo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        todo.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {todos.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No todos yet. Add one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
