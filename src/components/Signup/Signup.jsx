import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import './Signup.css';
import { authAPI } from '../../services/api';

function Signup({ onSignup, onSwitchToLogin, language, setLanguage }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const t = lang[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t.emailRequired);
      return;
    }
    if (!username) {
      setError(t.usernameRequired);
      return;
    }
    if (!password) {
      setError(t.passwordRequired);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    try {
      await onSignup(email, username, password);
      navigate('/home');
    } catch (err) {
      setError(t.signupFailed);
    }
  };

  return (
    <div className="signup-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f5f5', color: '#222', outline: 'none' }}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="signup-box">
        <h2>{t.signup}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">{t.username}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.username}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPassword}
            />
          </div>
          <button type="submit" className="signup-button">
            {t.signup}
          </button>
        </form>
        <div className="switch-auth">
          <span>{t.alreadyHaveAccount}</span>
          <button onClick={onSwitchToLogin} className="switch-button">
            {t.switchToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup; 