import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../theme/ThemeContext';
import { lang } from '../../i18n/lang';
import './JsonFormat.css';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: white;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  padding: 24px;
  gap: 24px;
  overflow: hidden;
`;

const EditorSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreviewSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  tab-size: 2;
  -moz-tab-size: 2;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}20;
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.card};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primary};
  }
`;

const PreviewArea = styled.div`
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;

  .json-key {
    color: #61dafb;
  }

  .json-string {
    color: #ff7b72;
  }

  .json-number {
    color: #79c0ff;
  }

  .json-boolean {
    color: #ff7b72;
  }

  .json-null {
    color: #ff7b72;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 8px;
`;

const JsonFormat = ({ language: propLanguage }) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isMinified, setIsMinified] = useState(false);
  const language = propLanguage || 'en';
  const t = lang[language];

  const formatJson = (jsonString, minify = false) => {
    try {
      // 先尝试解析 JSON
      const parsed = JSON.parse(jsonString);
      
      // 根据 minify 参数决定格式化方式
      const formatted = minify 
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      
      setOutput(formatted);
      setError('');
      setIsMinified(minify);
    } catch (err) {
      setError(t.jsonFormatError);
      setOutput('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      formatJson(value, isMinified);
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

  // 语法高亮函数
  const highlightJson = (json) => {
    if (!json) return '';
    
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  };

  return (
    <Container>
      <Header>
        <Title>{t.jsonFormatTitle}</Title>
        <Actions>
          <Button onClick={handleFormat}>{t.format}</Button>
          <Button onClick={handleMinify}>{t.minify}</Button>
          <Button onClick={handleCopy} disabled={!output}>{t.copy}</Button>
          <Button onClick={handleClear}>{t.clear}</Button>
        </Actions>
      </Header>
      <MainContent>
        <EditorSection>
          <SectionTitle>{t.input}</SectionTitle>
          <TextArea
            value={input}
            onChange={handleInputChange}
            placeholder="Paste your JSON here..."
          />
        </EditorSection>
        <PreviewSection>
          <SectionTitle>{t.output}</SectionTitle>
          <PreviewArea>
            {error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <pre dangerouslySetInnerHTML={{ __html: highlightJson(output) }} />
            )}
          </PreviewArea>
        </PreviewSection>
      </MainContent>
    </Container>
  );
};

export default JsonFormat; 