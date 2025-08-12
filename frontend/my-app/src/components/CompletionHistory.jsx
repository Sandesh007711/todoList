import { useNavigate } from 'react-router-dom';

function CompletionHistory() {
  const navigate = useNavigate();

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
          <div className="space-y-4">
            {/* Add your detailed completion history here */}
            <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Today</h3>
                <p className="text-sm text-gray-500">March 15, 2024</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                5 completed
              </span>
            </div>
            {/* Add more history items as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompletionHistory;
