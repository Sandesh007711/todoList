import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import MainPage from './components/MainPage';
import CompletionHistory from './components/CompletionHistory';
import SignUp from './components/SignUp';

// Move AppRoutes inside App component
function App() {
  function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/main" replace /> : <Login />
        } />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/main" element={
          isAuthenticated ? <MainPage /> : <Navigate to="/" replace />
        } />
        <Route path="/completion-history" element={
          isAuthenticated ? <CompletionHistory /> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

