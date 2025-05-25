import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import './Login.css';
import { authAPI } from '../../services/api';

function Login({ onLogin, onSwitchToSignup, language, setLanguage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!password) {
      setError(t.passwordRequired);
      return;
    }

    try {
      await onLogin(email, password);
      navigate('/home');
    } catch (err) {
      setError(t.loginFailed);
    }
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f5f5', color: '#222', outline: 'none' }}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="login-box">
        <h2>{t.login}</h2>
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
            <label htmlFor="password">{t.password}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
            />
          </div>
          <button type="submit" className="login-button">
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
}

export default Login; 