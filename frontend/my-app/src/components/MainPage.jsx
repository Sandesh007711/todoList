import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function MainPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
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

  const handleDelete = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleUpdate = (id) => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editText } : todo
      ));
      setEditingId(null);
      setEditText('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Sidebar */}
      <div ref={sidebarRef} className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white/80 backdrop-blur-lg shadow-2xl transition-transform duration-300 ease-in-out z-20 border-r border-gray-100`}>
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">User Name</p>
                  <p className="text-sm text-gray-500">user@example.com</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 shadow-sm hover:shadow-md"
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
              className="p-3 rounded-lg hover:bg-white/50 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex-1 text-center">
              My Todo List
            </h1>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={addTodo} className="mb-6 flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200"
              placeholder="Add new task..."
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Add Todo
            </button>
          </form>

          {/* Todo Table */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="w-12 px-6 py-4"></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todos.map(todo => (
                  <tr key={todo.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md transition-colors duration-150"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {editingId === todo.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-gray-700 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                          {todo.text}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        todo.completed 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                          : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800'
                      }`}>
                        {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingId === todo.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(todo.id)}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-150"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(todo)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-150"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-150"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {todos.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <p className="text-lg">No todos yet. Add one above! ✨</p>
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
