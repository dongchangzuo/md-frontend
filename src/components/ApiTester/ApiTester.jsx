import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { lang } from '../../i18n/lang';

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

const ApiTesterContainer = styled.div`
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

const RequestSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
`;

const UrlBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const MethodSelect = styled.select`
  padding: 0.5rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #00acc1;
  color: white;
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
    background: #0097a7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #b2ebf2;
  padding-bottom: 0.5rem;
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.$active ? '#00acc1' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#006064'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#0097a7' : '#e0f7fa'};
  }
`;

const EditorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;

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

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }

  &::placeholder {
    color: #80deea;
  }
`;

const ResponseContainer = styled.div`
  flex: 1;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  background: white;
  overflow: auto;
  position: relative;
  padding: 1rem;

  .hljs {
    background: transparent !important;
    padding: 0;
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #b2ebf2;
`;

const StatusCode = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => {
    const code = parseInt(props.$code);
    if (code >= 200 && code < 300) return '#4caf50';
    if (code >= 300 && code < 400) return '#2196f3';
    if (code >= 400 && code < 500) return '#ff9800';
    if (code >= 500) return '#f44336';
    return '#006064';
  }};
`;

const ResponseTime = styled.span`
  font-size: 0.9rem;
  color: #006064;
`;

const ApiTester = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('body');
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const language = 'zh';
  const t = lang[language];

  const handleSend = async () => {
    if (!url) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const headersObj = JSON.parse(headers);
      const options = {
        method,
        headers: headersObj,
      };

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const responseData = await response.text();
      let formattedResponse;
      try {
        formattedResponse = JSON.stringify(JSON.parse(responseData), null, 2);
      } catch {
        formattedResponse = responseData;
      }

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: formattedResponse,
        time: responseTime,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: error.message,
        time: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiTesterContainer>
      <ContentCard>
        <Header>
          <Title>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            {t.apiTester.title}
          </Title>
        </Header>
        <RequestSection>
          <UrlBar>
            <MethodSelect value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </MethodSelect>
            <UrlInput
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.urlPlaceholder}
            />
            <SendButton onClick={handleSend} disabled={loading || !url}>
              {loading ? t.sending : t.send}
            </SendButton>
          </UrlBar>

          <TabsContainer>
            <Tab
              $active={activeTab === 'body'}
              onClick={() => setActiveTab('body')}
            >
              {t.requestBody}
            </Tab>
            <Tab
              $active={activeTab === 'headers'}
              onClick={() => setActiveTab('headers')}
            >
              {t.headers}
            </Tab>
          </TabsContainer>

          <EditorContainer>
            <EditorSection>
              <SectionLabel>
                {activeTab === 'body' ? t.requestBody : t.headers}
              </SectionLabel>
              <TextArea
                value={activeTab === 'body' ? requestBody : headers}
                onChange={(e) => {
                  if (activeTab === 'body') {
                    setRequestBody(e.target.value);
                  } else {
                    setHeaders(e.target.value);
                  }
                }}
                placeholder={
                  activeTab === 'body'
                    ? t.requestBodyPlaceholder
                    : t.headersPlaceholder
                }
                style={{
                  fontFamily: 'monospace',
                  whiteSpace: 'pre',
                  tabSize: 2
                }}
              />
            </EditorSection>

            <EditorSection>
              <SectionLabel>{t.response}</SectionLabel>
              <ResponseContainer>
                {response && (
                  <>
                    <StatusBar>
                      <StatusCode $code={response.status}>
                        {response.status} {response.statusText}
                      </StatusCode>
                      <ResponseTime>{response.time}ms</ResponseTime>
                    </StatusBar>
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
                      wrapLines={true}
                      wrapLongLines={true}
                      useInlineStyles={false}
                      showLineNumbers={true}
                    >
                      {response.body}
                    </SyntaxHighlighter>
                  </>
                )}
              </ResponseContainer>
            </EditorSection>
          </EditorContainer>
        </RequestSection>
      </ContentCard>
    </ApiTesterContainer>
  );
};

export default ApiTester; 