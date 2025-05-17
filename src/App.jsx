import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Home from './components/Home/Home'

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  
  // Check for existing authentication on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setAuthToken(storedToken);
      // In a real app, you'd verify the token and fetch user data
      // For now, we'll just assume it's valid
    }
  }, []);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    if (userData.token) {
      setAuthToken(userData.token);
    }
    setUser(userData.user || userData);
  };

  const handleSignup = (userData) => {
    console.log('User signed up:', userData);
    if (userData.token) {
      setAuthToken(userData.token);
    }
    setUser(userData.user || userData);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
  };

  const toggleAuthMode = () => {
    setShowSignup(!showSignup);
  };

  return (
    <div className="app">
      {user ? (
        <Home user={user} onLogout={handleLogout} />
      ) : showSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={toggleAuthMode} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={toggleAuthMode} />
      )}
    </div>
  );
}

export default App
