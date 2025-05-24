import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Home from './components/Home/Home'
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor'
import OCR from './components/OCR/OCR'
import ShapeEditor from './components/ShapeEditor'
import { authAPI, tokenManager } from './services/api'

// 安全存储实现
const secureStorage = {
  setItem: (key, value) => {
    try {
      // 添加时间戳和签名
      const data = {
        value,
        timestamp: Date.now(),
        // 简单的签名机制，实际应用中应该使用更复杂的加密
        signature: btoa(value + Date.now())
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: (key) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsedData = JSON.parse(data);
      // 验证数据完整性
      if (parsedData.signature !== btoa(parsedData.value + parsedData.timestamp)) {
        console.error('Data integrity check failed');
        secureStorage.removeItem(key);
        return null;
      }
      return parsedData.value;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  clear: () => {
    try {
      // 只清除认证相关的数据
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('user');
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
    setCurrentPage('home');
  };

  const toggleAuthMode = () => {
    setShowSignup(!showSignup);
  };

  const navigateTo = (page) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
  };

  // Render the appropriate component based on authentication and current page
  const renderContent = () => {
    console.log('Current page:', currentPage);
    console.log('User:', user);
    
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
        console.log('Rendering MarkdownEditor');
        return <MarkdownEditor />;
      case 'ocr':
        console.log('Rendering OCR');
        return <OCR />;
      case 'shapes':
        console.log('Rendering ShapeEditor');
        return <ShapeEditor />;
      case 'home':
      default:
        console.log('Rendering Home');
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
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
          <Route path="/" element={renderContent()} />
          <Route path="/editor" element={<ShapeEditor />} />
          <Route path="/editor/map" element={<ShapeEditor defaultTab="map" />} />
          <Route path="/editor/tree" element={<ShapeEditor defaultTab="tree" />} />
          <Route path="/markdown" element={<MarkdownEditor />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="/home" element={<Home user={user} onLogout={handleLogout} onNavigate={navigateTo} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
