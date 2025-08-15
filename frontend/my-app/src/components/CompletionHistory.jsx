import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CompletionHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/todos/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        // Group todos by date using completedAt
        const groupedData = data.reduce((acc, todo) => {
          const date = new Date(todo.completedAt).toDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(todo);
          return acc;
        }, {});

        setHistory(Object.entries(groupedData).sort((a, b) => 
          new Date(b[0]) - new Date(a[0])
        ));
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Completion History</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No completed todos yet
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(([date, todos]) => (
                <div key={date} className="flex justify-between items-start p-4 hover:bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-lg">{formatDate(date)}</h3>
                    <div className="text-sm text-gray-500 space-y-2 mt-2">
                      {todos.map(todo => (
                        <div key={todo._id} className="flex items-center space-x-2">
                          <span className="line-through">{todo.text}</span>
                          <span className="text-xs text-gray-400">
                            {formatTime(todo.completedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {todos.length} completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompletionHistory;
