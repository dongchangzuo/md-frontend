import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';
import './OCR.css';
import { useNavigate } from 'react-router-dom';
import { tokenManager } from '../../services/api';

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

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 0.5rem;
  gap: 0.5rem;
  overflow: hidden;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #b2ebf2;
`;

const Title = styled.h1`
  color: #006064;
  text-align: left;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 28px;
    height: 28px;
    color: #00acc1;
  }
`;

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  min-width: 0;
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: ${props => props.$isOutput ? '50%' : '50%'};
  min-height: ${props => props.$isOutput ? '200px' : '200px'};
  overflow: hidden;
`;

const SectionLabel = styled.label`
  color: #006064;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  padding: 0 0.25rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ImagePreview = styled.div`
  flex: 1;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  background: white;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 200px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: ${props => props.$isDragging ? 'block' : 'none'};
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  background: white;
  color: #006064;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
  min-height: 120px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }

  &::placeholder {
    color: #80deea;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$primary ? '#00acc1' : '#e0f7fa'};
  color: ${props => props.$primary ? 'white' : '#006064'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  justify-content: center;
  height: 42px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: ${props => props.$primary ? '#0097a7' : '#b2ebf2'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  border: 1px solid rgba(211, 47, 47, 0.2);
`;

const OCR = ({ language, setLanguage }) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const t = lang[language];
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setError(t.unsupportedFormat);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError(t.imageTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRecognize = async () => {
    if (!image) {
      setError(t.noImageSelected);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const base64Response = await fetch(image);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const response = await fetch('http://localhost:8080/api/ocr/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenManager.getToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Recognition failed');
      }

      const data = await response.json();
      setText(data.text || '');
    } catch (error) {
      console.error('OCR recognition error:', error);
      setError(error.message === 'Authentication failed' ? t.authFailed : t.recognitionFailed);
      if (error.message === 'Authentication failed') {
        navigate('/login');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setText('');
    setError('');
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Container>
      <ContentCard>
        <Header>
          <Title>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {t.ocrTitle}
          </Title>
          <div className="controls">
            <button onClick={toggleTheme}>
              {themeMode === 'dark' ? t.lightMode : t.darkMode}
            </button>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </Header>
        <EditorContainer>
          <EditorSection>
            <SectionHeader>
              <SectionLabel>{t.selectImage}</SectionLabel>
              <ButtonGroup>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {t.selectImage}
                </Button>
                <Button onClick={handleClear}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {t.clear}
                </Button>
              </ButtonGroup>
            </SectionHeader>
            <ImagePreview
              $isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="Preview" />
              ) : (
                <div style={{ color: '#80deea', textAlign: 'center', padding: '2rem' }}>
                  {t.selectImage}
                </div>
              )}
            </ImagePreview>
          </EditorSection>

          <EditorSection $isOutput>
            <SectionHeader>
              <SectionLabel>{t.recognizedText}</SectionLabel>
              <ButtonGroup>
                <Button onClick={handleCopy} disabled={!text}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {t.copy}
                </Button>
              </ButtonGroup>
            </SectionHeader>
            <TextArea
              value={text}
              readOnly
              placeholder={t.recognizedText}
            />
          </EditorSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <Button
              $primary
              onClick={handleRecognize}
              disabled={!image || isProcessing}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 5 17 10" />
                <line x1="12" y1="15" x2="12" y2="5" />
              </svg>
              {isProcessing ? t.recognizing : t.recognizeText}
            </Button>
          </ButtonGroup>
        </EditorContainer>
      </ContentCard>
    </Container>
  );
};

export default OCR; 