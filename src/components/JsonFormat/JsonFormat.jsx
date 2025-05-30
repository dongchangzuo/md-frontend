import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册 JSON 语言
SyntaxHighlighter.registerLanguage('json', json);

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
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 0.5rem;
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
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: #006064;
  text-align: left;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.25rem 0;
`;

const EditorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: calc(100vh - 100px);
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
`;

const SectionLabel = styled.label`
  color: #006064;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  padding: 0 0.25rem;
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
  min-height: 400px;
  overflow-y: scroll;

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
  gap: 0.75rem;
  align-items: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$secondary ? '#e0f7fa' : '#00acc1'};
  color: ${props => props.$secondary ? '#006064' : 'white'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: ${props => props.$secondary ? '#b2ebf2' : '#0097a7'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

const OutputContainer = styled.div`
  flex: 1;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  background: white;
  overflow: auto;
  position: relative;

  .hljs {
    background: transparent !important;
    padding: 1rem;
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    line-height: 1.6;
  }

  .hljs-string {
    color: #00897b !important;
  }

  .hljs-number {
    color: #f57c00 !important;
  }

  .hljs-literal {
    color: #7b1fa2 !important;
  }

  .hljs-keyword {
    color: #7b1fa2 !important;
  }

  .hljs-property {
    color: #006064 !important;
  }

  .hljs-punctuation {
    color: #006064 !important;
  }

  .hljs-operator {
    color: #7b1fa2 !important;
  }

  .hljs-comment {
    color: #78909c !important;
  }
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
        <Header>
          <Title>{t.jsonFormatTitle}</Title>
          <ButtonGroup>
            <Button onClick={handleFormat}>{t.format}</Button>
            <Button onClick={handleMinify}>{t.minify}</Button>
            <Button onClick={handleCopy} disabled={!output}>{t.copy}</Button>
            <Button onClick={handleClear} $secondary>{t.clear}</Button>
          </ButtonGroup>
        </Header>
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
            <OutputContainer>
              {error ? (
                <ErrorMessage>{error}</ErrorMessage>
              ) : output ? (
                <SyntaxHighlighter
                  language="json"
                  style={docco}
                  customStyle={{
                    background: 'transparent',
                    padding: '0.5rem',
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontFamily: "'Fira Code', monospace",
                  }}
                  wrapLines={true}
                  wrapLongLines={true}
                  useInlineStyles={false}
                  showLineNumbers={false}
                >
                  {output}
                </SyntaxHighlighter>
              ) : (
                <TextArea
                  readOnly
                  placeholder={t.jsonOutputPlaceholder}
                  style={{ border: 'none', background: 'transparent' }}
                />
              )}
            </OutputContainer>
          </EditorSection>
        </EditorContainer>
      </ContentCard>
    </JsonFormatContainer>
  );
};

export default JsonFormat; 