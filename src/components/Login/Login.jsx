import React, { useState } from 'react';
import styled from 'styled-components';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { authAPI } from '../../services/api';

const Login = ({ onLogin, onSwitchToSignup, language, setLanguage }) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const t = lang[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t.allFieldsRequired);
      return;
    }

    try {
      const response = await authAPI.login({ email, password });
      await onLogin(response);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t.loginFailed);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <h1>{t.login}</h1>
          <div className="controls">
            <button onClick={toggleTheme}>
              {themeMode === 'dark' ? t.lightMode : t.darkMode}
            </button>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="submit-button">
            {t.login}
          </button>
        </form>
        <div className="switch-auth">
          <span>{t.noAccount}</span>
          <button onClick={onSwitchToSignup} className="switch-button">
            {t.switchToSignup}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 