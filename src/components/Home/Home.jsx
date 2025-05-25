import React from 'react';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import './Home.css';

const Home = ({ user, onLogout, onNavigate, language, setLanguage }) => {
  const navigate = useNavigate();
  const t = lang[language];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f5f5', color: '#222', outline: 'none' }}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="home-content">
        <h1>{t.welcome(user?.username)}</h1>
        <div className="user-info">
          <h2>{t.userInfo}</h2>
          <p>{t.userId}: {user?.id}</p>
          <p>{t.roles}: {user?.roles?.join(', ')}</p>
        </div>
        <div className="app-grid">
          <div className="app-card" onClick={() => onNavigate('markdown')}>
            <h3>{t.markdownEditor}</h3>
            <p>Create and edit markdown documents</p>
          </div>
          <div className="app-card" onClick={() => onNavigate('ocr')}>
            <h3>{t.ocr}</h3>
            <p>Extract text from images</p>
          </div>
          <div className="app-card" onClick={() => onNavigate('shape')}>
            <h3>{t.shapeEditor}</h3>
            <p>Create and edit shapes</p>
          </div>
          <div className="app-card" onClick={() => onNavigate('json')}>
            <h3>{t.jsonFormatter}</h3>
            <p>{t.formatAndValidateJson}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default Home; 