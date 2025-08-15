import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MainPage from './components/MainPage';
import CompletionHistory from './components/CompletionHistory';
import SignUp from './components/SignUp';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (credentials) => {
    if (credentials.email && credentials.password) {
      setIsLoggedIn(true);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isLoggedIn ? (
            <Navigate to="/MainPage" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        } />
        <Route path="/MainPage" element={
          isLoggedIn ? (
            <MainPage />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route 
          path="/completion-history" 
          element={
            isLoggedIn ? (
              <CompletionHistory />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
