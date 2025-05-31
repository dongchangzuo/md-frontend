import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册 JSON 语言
SyntaxHighlighter.registerLanguage('json', json);

// 随机数据生成函数
const generateRandomData = (type) => {
  // 处理特殊类型标记
  if (type.startsWith('string (')) {
    const subtype = type.slice(8, -1);
    if (subtype === 'ISO 8601') {
      return new Date().toISOString();
    }
    if (subtype === 'enum') {
      const enums = ['option1', 'option2', 'option3', 'option4', 'option5'];
      return enums[Math.floor(Math.random() * enums.length)];
    }
  }

  // 处理基本类型
  switch (type) {
    case 'string':
      return Math.random().toString(36).substring(7);
    case 'number':
      return Number((Math.random() * 1000).toFixed(2));
    case 'integer':
      return Math.floor(Math.random() * 1000);
    case 'boolean':
      return Math.random() > 0.5;
    case 'null':
      return null;
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return '';
  }
};

// 根据模板生成 JSON
const generateJsonFromTemplate = (template) => {
  const generateValue = (value) => {
    if (Array.isArray(value)) {
      // 处理数组
      if (value.length === 0) return [];
      // 对于混合类型数组，直接使用数组中的类型标记
      return value.map(type => generateValue(type));
    }
    
    if (typeof value === 'object' && value !== null) {
      // 处理对象
      if (Object.keys(value).length === 0) return {};
      const obj = {};
      for (const [key, type] of Object.entries(value)) {
        obj[key] = generateValue(type);
      }
      return obj;
    }
    
    // 处理基本类型
    return generateRandomData(value);
  };

  return JSON.stringify(generateValue(template), null, 2);
};

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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 0.5rem;
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
  height: calc(100vh - 120px);
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
  overflow: hidden;
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
  height: 100%;
  overflow-y: auto;

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
  background: ${props => props.$active ? '#00acc1' : props.$secondary ? '#e0f7fa' : '#00acc1'};
  color: ${props => props.$active || !props.$secondary ? 'white' : '#006064'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: ${props => props.$active ? '#0097a7' : props.$secondary ? '#b2ebf2' : '#0097a7'};
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

const JsonViewer = styled.div`
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #006064;
  padding: 1rem;
`;

const JsonLine = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 2px 0;
  padding-left: ${props => props.$level * 20}px;
`;

const JsonKey = styled.span`
  color: #006064;
  margin-right: 8px;
  user-select: none;
`;

const JsonValue = styled.span`
  color: ${props => {
    if (props.$type === 'string') return '#2e7d32';
    if (props.$type === 'number') return '#1976d2';
    if (props.$type === 'boolean') return '#f57c00';
    if (props.$type === 'null') return '#757575';
    return '#006064';
  }};
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #424242;
  cursor: pointer;
  padding: 0 4px;
  margin-right: 4px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;

  &:hover {
    color: #212121;
  }

  svg {
    width: 12px;
    height: 12px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const JsonArray = styled.div`
  margin-left: 20px;
`;

const JsonObject = styled.div`
  margin-left: 20px;
`;

const JsonString = styled.span`
  color: #2e7d32;
  &::before, &::after {
    content: '"';
  }
`;

const JsonNumber = styled.span`
  color: #1976d2;
`;

const JsonBoolean = styled.span`
  color: #f57c00;
`;

const JsonNull = styled.span`
  color: #757575;
`;

const JsonFormat = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const language = 'zh';
  const t = lang[language];

  const handleTemplateClick = () => {
    setIsTemplateMode(!isTemplateMode);
    if (!isTemplateMode) {
      // 切换到模板模式时，清空输入和输出
      setInput('');
      setOutput('');
      setError('');
    }
  };

  const handleGenerate = () => {
    if (!isTemplateMode) return;
    
    try {
      const template = JSON.parse(input);
      const generatedJson = generateJsonFromTemplate(template);
      setOutput(generatedJson);
      setError('');
    } catch (err) {
      setError(t.jsonParseError);
    }
  };

  const formatJson = (jsonString, minify = false) => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = minify 
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      
      setOutput(formatted);
      setError('');
    } catch (err) {
      let errorMessage = err.message;
      
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
    if (value.trim() && !isTemplateMode) {
      formatJson(value, false);
    } else {
      setOutput('');
      setError('');
    }
  };

  const handleFormat = () => {
    if (input.trim() && !isTemplateMode) {
      formatJson(input, false);
    }
  };

  const handleMinify = () => {
    if (input.trim() && !isTemplateMode) {
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

  const toggleNode = (path) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderJsonValue = (value, level = 0, path = '') => {
    if (value === null) {
      return <JsonNull>null</JsonNull>;
    }

    if (typeof value === 'boolean') {
      return <JsonBoolean>{value.toString()}</JsonBoolean>;
    }

    if (typeof value === 'number') {
      return <JsonNumber>{value}</JsonNumber>;
    }

    if (typeof value === 'string') {
      return <JsonString>{value}</JsonString>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedNodes.has(path);
      return (
        <>
          <CollapseButton
            $expanded={isExpanded}
            onClick={() => toggleNode(path)}
          >
            <svg viewBox="0 0 24 24" fill="none">
              {isExpanded ? (
                <path d="M6 12h12" />
              ) : (
                <>
                  <path d="M12 6v12" />
                  <path d="M6 12h12" />
                </>
              )}
            </svg>
          </CollapseButton>
          <span>[</span>
          {isExpanded ? (
            <>
              <JsonArray>
                {value.map((item, index) => (
                  <div key={index} style={{ marginLeft: '20px' }}>
                    {renderJsonValue(item, level + 1, `${path}[${index}]`)}
                    {index < value.length - 1 && <span>,</span>}
                  </div>
                ))}
              </JsonArray>
              <div style={{ marginLeft: '0px' }}>]</div>
            </>
          ) : (
            <span>...</span>
          )}
          {!isExpanded && <span>]</span>}
        </>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expandedNodes.has(path);
      const entries = Object.entries(value);
      return (
        <>
          <CollapseButton
            $expanded={isExpanded}
            onClick={() => toggleNode(path)}
          >
            <svg viewBox="0 0 24 24" fill="none">
              {isExpanded ? (
                <path d="M6 12h12" />
              ) : (
                <>
                  <path d="M12 6v12" />
                  <path d="M6 12h12" />
                </>
              )}
            </svg>
          </CollapseButton>
          <span>{'{'}</span>
          {isExpanded ? (
            <>
              <JsonObject>
                {entries.map(([key, val], index) => (
                  <div key={key} style={{ marginLeft: '20px' }}>
                    <JsonKey>"{key}"</JsonKey>: {renderJsonValue(val, level + 1, `${path}.${key}`)}
                    {index < entries.length - 1 && <span>,</span>}
                  </div>
                ))}
              </JsonObject>
              <div style={{ marginLeft: '0px' }}>{'}'}</div>
            </>
          ) : (
            <span>...</span>
          )}
          {!isExpanded && <span>{'}'}</span>}
        </>
      );
    }

    return null;
  };

  return (
    <JsonFormatContainer>
      <ContentCard>
        <Header>
          <Title>{t.jsonFormatTitle}</Title>
          <ButtonGroup>
            <Button 
              onClick={handleTemplateClick} 
              $active={isTemplateMode}
            >
              {t.template}
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={!isTemplateMode}
            >
              {t.generate}
            </Button>
            {!isTemplateMode && (
              <>
                <Button onClick={handleFormat}>{t.format}</Button>
                <Button onClick={handleMinify}>{t.minify}</Button>
              </>
            )}
            <Button onClick={handleCopy} disabled={!output}>{t.copy}</Button>
            <Button onClick={handleClear} $secondary>{t.clear}</Button>
          </ButtonGroup>
        </Header>
        <EditorContainer>
          <EditorSection>
            <SectionLabel>{isTemplateMode ? t.template : t.input}</SectionLabel>
            <TextArea
              value={input}
              onChange={handleInputChange}
              placeholder={isTemplateMode ? t.templatePlaceholder : t.jsonPlaceholder}
              style={{
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                tabSize: 2
              }}
            />
          </EditorSection>
          <EditorSection>
            <SectionLabel>{t.output}</SectionLabel>
            <OutputContainer>
              {error ? (
                <ErrorMessage>{error}</ErrorMessage>
              ) : output ? (
                <JsonViewer>
                  {(() => {
                    try {
                      const jsonData = JSON.parse(output);
                      return (
                        <div style={{ 
                          fontFamily: 'monospace',
                          whiteSpace: 'pre',
                          tabSize: 2
                        }}>
                          {renderJsonValue(jsonData)}
                        </div>
                      );
                    } catch (e) {
                      return (
                        <SyntaxHighlighter
                          language="json"
                          style={docco}
                          customStyle={{
                            background: 'transparent',
                            padding: 0,
                            margin: 0,
                            fontSize: '14px',
                            lineHeight: '1.6',
                            fontFamily: "'Fira Code', monospace",
                          }}
                        >
                          {output}
                        </SyntaxHighlighter>
                      );
                    }
                  })()}
                </JsonViewer>
              ) : (
                <TextArea
                  readOnly
                  placeholder={isTemplateMode ? t.templateOutputPlaceholder : t.jsonOutputPlaceholder}
                  style={{ 
                    border: 'none', 
                    background: 'transparent',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre',
                    tabSize: 2
                  }}
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