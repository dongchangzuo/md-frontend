import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';

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

const JsonFormatContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const EditorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionLabel = styled.label`
  color: white;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.1)' : 'white'};
  color: ${props => props.secondary ? 'white' : '#1a1a2e'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.9)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
`;

const JsonFormat = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const language = 'zh'; // 默认使用中文
  const t = lang[language];

  const formatJson = (jsonString, minify = false) => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = minify 
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      
      setOutput(formatted);
      setError('');
    } catch (err) {
      // 提取具体的错误信息
      let errorMessage = err.message;
      
      // 处理常见的 JSON 解析错误
      if (errorMessage.includes('Unexpected token')) {
        const position = errorMessage.match(/position (\d+)/);
        if (position) {
          const pos = parseInt(position[1]);
          const lines = jsonString.slice(0, pos).split('\n');
          const lineNumber = lines.length;
          const columnNumber = lines[lines.length - 1].length + 1;
          errorMessage = `${t.jsonParseError} (${t.line}: ${lineNumber}, ${t.column}: ${columnNumber})`;
        }
      } else if (errorMessage.includes('Unexpected end of JSON input')) {
        errorMessage = t.jsonIncompleteError;
      } else if (errorMessage.includes('Unexpected number')) {
        errorMessage = t.jsonNumberError;
      } else if (errorMessage.includes('Unexpected string')) {
        errorMessage = t.jsonStringError;
      } else if (errorMessage.includes('Unexpected identifier')) {
        errorMessage = t.jsonIdentifierError;
      }
      
      setError(errorMessage);
      setOutput('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      formatJson(value, false);
    } else {
      setOutput('');
      setError('');
    }
  };

  const handleFormat = () => {
    if (input.trim()) {
      formatJson(input, false);
    }
  };

  const handleMinify = () => {
    if (input.trim()) {
      formatJson(input, true);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <JsonFormatContainer>
      <ContentCard>
        <Title>{t.jsonFormatTitle}</Title>
        <EditorContainer>
          <EditorSection>
            <SectionLabel>{t.input}</SectionLabel>
            <TextArea
              value={input}
              onChange={handleInputChange}
              placeholder={t.jsonPlaceholder}
            />
          </EditorSection>
          <EditorSection>
            <SectionLabel>{t.output}</SectionLabel>
            <TextArea
              value={output}
              readOnly
              placeholder={t.jsonOutputPlaceholder}
            />
          </EditorSection>
        </EditorContainer>
        <ButtonGroup>
          <Button onClick={handleFormat}>{t.format}</Button>
          <Button onClick={handleMinify}>{t.minify}</Button>
          <Button onClick={handleCopy} disabled={!output}>{t.copy}</Button>
          <Button onClick={handleClear} secondary>{t.clear}</Button>
        </ButtonGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ContentCard>
    </JsonFormatContainer>
  );
};

export default JsonFormat; 