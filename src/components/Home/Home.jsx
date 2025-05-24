import React from 'react';
import styled from 'styled-components';
import './Home.css';

const HomeWrapper = styled.div`
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
`;

const Container = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 4px;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

const Home = ({ user, onLogout, onNavigate }) => {
  const handleMarkdownClick = () => {
    console.log('Markdown button clicked');
    onNavigate('markdown');
  };

  const handleOCRClick = () => {
    console.log('OCR button clicked');
    onNavigate('ocr');
  };

  const handleShapeEditorClick = () => {
    console.log('Shape Editor button clicked');
    onNavigate('shapes');
  };

  return (
    <HomeWrapper>
      <Container>
        <h1>Welcome, {user?.username || 'User'}!</h1>
        <div>
          <Button onClick={handleMarkdownClick}>Markdown Editor</Button>
          <Button onClick={handleOCRClick}>OCR</Button>
          <Button onClick={handleShapeEditorClick}>Shape Editor</Button>
          <Button onClick={onLogout}>Logout</Button>
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
      </Container>
    </HomeWrapper>
  );
};

export default Home; 