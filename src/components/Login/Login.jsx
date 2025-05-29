import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { lang } from '../../i18n/lang';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.6s ease-out;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 32px;
  font-size: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  padding-left: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: white;
  color: #764ba2;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SwitchText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 24px;
  font-size: 14px;

  span {
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LanguageSwitch = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
`;

const LangButton = styled.button`
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

  &.active {
    background: white;
    color: #764ba2;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`;

const Login = ({ onLogin, onSwitchToSignup, language, setLanguage }) => {
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
    <LoginContainer>
      <LanguageSwitch>
        <LangButton
          className={language === 'zh' ? 'active' : ''}
          onClick={() => setLanguage('zh')}
        >
          中文
        </LangButton>
        <LangButton
          className={language === 'en' ? 'active' : ''}
          onClick={() => setLanguage('en')}
        >
          English
        </LangButton>
      </LanguageSwitch>

      <LoginCard>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </InputIcon>
            <Input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </InputIcon>
            <Input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <Button type="submit">
            {t.login}
          </Button>
        </Form>

        <SwitchText>
          {t.noAccount}{' '}
          <span onClick={onSwitchToSignup}>
            {t.signup}
          </span>
        </SwitchText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 