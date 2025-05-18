import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Home from './components/Home/Home'
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor'
import { authAPI } from './services/api'

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          // 这里可以添加一个验证token的API调用
          // 暂时使用存储的用户信息
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setAuthToken(storedToken);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // 如果验证失败，清除存储的信息
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    if (userData.token) {
      setAuthToken(userData.token);
    }
    const userInfo = userData.user || userData;
    setUser(userInfo);
    // 存储用户信息到localStorage
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const handleSignup = (userData) => {
    console.log('User signed up:', userData);
    if (userData.token) {
      setAuthToken(userData.token);
    }
    const userInfo = userData.user || userData;
    setUser(userInfo);
    // 存储用户信息到localStorage
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
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
