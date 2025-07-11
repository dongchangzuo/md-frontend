import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { lang } from '../../i18n/lang';
import DrawBoard from '../DrawBoard/DrawBoard'; // 仅用于 IDE 跳转提示，实际不在 Home 渲染

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const ContentCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 32px;
  margin: 0;
`;

const LanguageSelect = styled.select`
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  option {
    background: #764ba2;
    color: white;
  }
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const ToolCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ToolIcon = styled.div`
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #764ba2;
`;

const ToolTitle = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 20px;
`;

const ToolDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Home = ({ user, onLogout, onNavigate, language, setLanguage }) => {
  const navigate = useNavigate();
  const t = lang[language];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const tools = [
    {
      title: t.markdownEditor,
      description: t.createAndEditMarkdown,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      path: '/markdown'
    },
    {
      title: t.ocr,
      description: t.extractTextFromImages,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      path: '/ocr'
    },
    {
      title: t.shapeEditor,
      description: t.createAndEditShapes,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      path: '/editor'
    },
    {
      title: t.jsonFormat,
      description: t.formatAndValidateJson,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      path: '/json'
    },
    {
      title: 'Base64',
      description: 'Encode and decode Base64 strings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7V4h16v3" />
          <path d="M9 20h6" />
          <path d="M12 4v16" />
        </svg>
      ),
      path: '/base64'
    },
    {
      title: t.apiTester.title,
      description: t.apiTester.description,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      path: '/api-tester'
    },
    {
      title: t.drawBoard.title,
      description: t.drawBoard.description,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
          <path d="M15.28 15.28A5.001 5.001 0 0012 13a5 5 0 00-3.28 2.28"></path>
          <path d="M12 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path>
          <path d="M12 8c-2.28 0-4.46.9-6.08 2.48"></path>
          <path d="M12 8c2.28 0 4.46.9 6.08 2.48"></path>
        </svg>
      ),
      path: '/draw'
    }
  ];

  return (
    <HomeContainer>
      <ContentCard>
        <Header>
          <WelcomeText>{t.welcome(user.username)}</WelcomeText>
          <LanguageSelect value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </LanguageSelect>
          <LogoutButton onClick={handleLogout}>{t.logout}</LogoutButton>
        </Header>
        <ToolsGrid>
          {tools.map(tool => (
            <ToolCard key={tool.path} onClick={() => navigate(tool.path)}>
              <ToolIcon>{tool.icon}</ToolIcon>
              <ToolTitle>{tool.title}</ToolTitle>
              <ToolDescription>{tool.description}</ToolDescription>
            </ToolCard>
          ))}
        </ToolsGrid>
      </ContentCard>
    </HomeContainer>
  );
};

export default Home; 