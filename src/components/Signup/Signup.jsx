import React, { useState } from 'react';
import styled from 'styled-components';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';
import './Signup.css';

const Signup = ({ onSignup, language, setLanguage }) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const t = lang[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password || !confirmPassword) {
      setError(t.allFieldsRequired);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    try {
      await onSignup(email, username, password);
    } catch (err) {
      setError(t.signupFailed);
    }
  };

  return (
    <div className="signup">
      <div className="signup-container">
        <div className="signup-header">
          <h1>{t.signup}</h1>
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
            <label htmlFor="username">{t.username}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.usernamePlaceholder}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPasswordPlaceholder}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="submit-button">
            {t.signup}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup; 