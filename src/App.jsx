import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Home from './components/Home/Home'
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor'
import OCR from './components/OCR/OCR'
import ShapeEditor from './components/ShapeEditor'
import JsonFormat from './components/JsonFormat/JsonFormat'
import ApiTester from './components/ApiTester/ApiTester'
import { authAPI, tokenManager } from './services/api'
import { ThemeProvider } from './theme/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useTheme } from './theme/ThemeContext';
import { GlobalStyle } from './styles/globalStyle';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Membership from './pages/Membership/Membership';
import Admin from './pages/Admin/Admin';

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

// 添加一个受保护的路由组件
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('zh');
  
  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (token) {
          const storedUser = secureStorage.getItem('user');
          if (storedUser) {
            const userInfo = JSON.parse(storedUser);
            setUser(userInfo);
            setAuthToken(token);
          } else {
            handleLogout();
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

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/home" replace /> : (
                showSignup ? (
                  <Signup onSignup={handleSignup} onSwitchToLogin={toggleAuthMode} language={language} setLanguage={setLanguage} />
                ) : (
                  <Login onLogin={handleLogin} onSwitchToSignup={toggleAuthMode} language={language} setLanguage={setLanguage} />
                )
              )
            } />
            <Route path="/signup" element={
              user ? <Navigate to="/home" replace /> : (
                <Signup onSignup={handleSignup} onSwitchToLogin={toggleAuthMode} language={language} setLanguage={setLanguage} />
              )
            } />
            <Route path="/" element={
              <ProtectedRoute user={user}>
                <Home 
                  user={user} 
                  onLogout={handleLogout} 
                  onNavigate={navigateTo}
                  language={language}
                  setLanguage={setLanguage}
                />
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute user={user}>
                <Home 
                  user={user} 
                  onLogout={handleLogout} 
                  onNavigate={navigateTo}
                  language={language}
                  setLanguage={setLanguage}
                />
              </ProtectedRoute>
            } />
            <Route path="/markdown" element={
              <ProtectedRoute user={user}>
                <MarkdownEditor language={language} setLanguage={setLanguage} />
              </ProtectedRoute>
            } />
            <Route path="/ocr" element={
              <ProtectedRoute user={user}>
                <OCR language={language} setLanguage={setLanguage} />
              </ProtectedRoute>
            } />
            <Route path="/editor" element={
              <ProtectedRoute user={user}>
                <ShapeEditor language={language} setLanguage={setLanguage} />
              </ProtectedRoute>
            } />
            <Route path="/editor/map" element={
              <ProtectedRoute user={user}>
                <ShapeEditor defaultTab="map" language={language} setLanguage={setLanguage} />
              </ProtectedRoute>
            } />
            <Route path="/editor/tree" element={
              <ProtectedRoute user={user}>
                <ShapeEditor defaultTab="tree" language={language} setLanguage={setLanguage} />
              </ProtectedRoute>
            } />
            <Route path="/json" element={
              <ProtectedRoute user={user}>
                <JsonFormat language={language} />
              </ProtectedRoute>
            } />
            <Route path="/api" element={
              <ProtectedRoute user={user}>
                <ApiTester language={language} setLanguage={setLanguage} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<Profile language={language} />} />
            <Route path="/settings" element={<Settings language={language} />} />
            <Route path="/membership" element={
              <ProtectedRoute user={user}>
                <Membership language={language} />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute user={user}>
                <Admin language={language} />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </StyledThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App
