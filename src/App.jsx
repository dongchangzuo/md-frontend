import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Home from './components/Home/Home'
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor'
import { authAPI, tokenManager } from './services/api'

// 安全存储实现
const secureStorage = {
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (token) {
          const storedUser = secureStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setAuthToken(token);
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up token expiration check interval
    const checkInterval = setInterval(() => {
      if (tokenManager.isTokenExpired()) {
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, []);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    const userInfo = userData.user || userData;
    setUser(userInfo);
    setAuthToken(userData.token);
    secureStorage.setItem('user', JSON.stringify(userInfo));
  };

  const handleSignup = (userData) => {
    console.log('User signed up:', userData);
    const userInfo = userData.user || userData;
    setUser(userInfo);
    setAuthToken(userData.token);
    secureStorage.setItem('user', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    tokenManager.clearToken();
    secureStorage.removeItem('user');
  };

  const toggleAuthMode = () => {
    setShowSignup(!showSignup);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render the appropriate component based on authentication and current page
  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (!user) {
      return showSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={toggleAuthMode} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={toggleAuthMode} />
      );
    }

    // User is authenticated, show the appropriate page
    switch (currentPage) {
      case 'markdown':
        return <MarkdownEditor />;
      case 'home':
      default:
        return (
          <Home 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={navigateTo}
          />
        );
    }
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App
