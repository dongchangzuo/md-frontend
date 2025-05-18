import React from 'react';
import './Home.css';

const Home = ({ user, onLogout, onNavigate }) => {
  const handleMarkdownClick = () => {
    console.log('Markdown button clicked');
    onNavigate('markdown');
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome, {user.username}!</h1>
        <div className="header-actions">
          <button 
            className="nav-button"
            onClick={handleMarkdownClick}
          >
            Markdown Editor
          </button>
          <button 
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="user-info-panel">
        <h2>User Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Username:</label>
            <span>{user.username}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-item">
            <label>User ID:</label>
            <span>{user.id}</span>
          </div>
          <div className="info-item">
            <label>Roles:</label>
            <span>{user.roles?.join(', ') || 'User'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 