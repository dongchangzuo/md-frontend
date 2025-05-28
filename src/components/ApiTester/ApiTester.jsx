import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../theme/ThemeContext';

const Container = styled.div`
  padding: 20px;
  height: 100vh;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
`;

const RequestContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

const MethodSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  width: 100px;
`;

const UrlInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  flex: 1;
`;

const RequestHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
`;

const KeyValueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const KeyValueRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  flex: 1;
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  width: 100%;
  min-height: 150px;
  resize: vertical;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const ResponseContainer = styled.div`
  margin-top: 20px;
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background: ${({ status }) => {
    if (status >= 200 && status < 300) return '#4caf50';
    if (status >= 400 && status < 500) return '#f44336';
    if (status >= 500) return '#ff9800';
    return '#9e9e9e';
  }};
  color: white;
`;

const ResponseBody = styled.pre`
  background: ${({ theme }) => theme.bg};
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid ${({ theme, $active }) => $active ? theme.primary : theme.border};
  background: ${({ theme, $active }) => $active ? theme.primary : theme.card};
  color: ${({ theme, $active }) => $active ? 'white' : theme.text};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

function ApiTester() {
  const { theme } = useTheme();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('body');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleSendRequest = async () => {
    if (!url) {
      setError('请输入URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // 确保URL格式正确
      let requestUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        requestUrl = `https://${url}`;
      }

      // 构建请求头
      const headerObj = headers.reduce((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      // 添加默认请求头
      const defaultHeaders = {
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'User-Agent': navigator.userAgent,
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest'
      };

      // 合并自定义请求头和默认请求头
      const finalHeaders = {
        ...defaultHeaders,
        ...headerObj
      };

      // 添加CORS代理
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const finalUrl = `${proxyUrl}${requestUrl}`;

      const options = {
        method,
        headers: finalHeaders,
        mode: 'cors',
        credentials: 'omit'
      };

      // 如果是POST、PUT或PATCH请求，添加请求体
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        try {
          const parsedBody = JSON.parse(body);
          options.body = JSON.stringify(parsedBody);
          finalHeaders['Content-Type'] = 'application/json';
        } catch (e) {
          setError('请求体格式错误，请使用有效的JSON格式');
          setLoading(false);
          return;
        }
      }

      const response = await fetch(finalUrl, options);
      const responseData = await response.text();
      
      // 尝试解析响应为JSON
      let formattedResponse;
      try {
        formattedResponse = JSON.parse(responseData);
      } catch {
        formattedResponse = responseData;
      }

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: formattedResponse
      });
    } catch (error) {
      console.error('Request failed:', error);
      setError(error.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = () => {
    if (!response) return '';
    try {
      return JSON.stringify(JSON.parse(response.data), null, 2);
    } catch {
      return response.data;
    }
  };

  return (
    <Container>
      <RequestContainer>
        <RequestHeader>
          <MethodSelect value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </MethodSelect>
          <UrlInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL"
          />
          <Button onClick={handleSendRequest} disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </RequestHeader>

        <Section>
          <SectionTitle>Headers</SectionTitle>
          <KeyValueList>
            {headers.map((header, index) => (
              <KeyValueRow key={index}>
                <Input
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  placeholder="Key"
                />
                <Input
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Value"
                />
                <Button onClick={() => handleRemoveHeader(index)}>Remove</Button>
              </KeyValueRow>
            ))}
            <Button onClick={handleAddHeader}>Add Header</Button>
          </KeyValueList>
        </Section>

        <Section>
          <TabContainer>
            <Tab 
              $active={activeTab === 'body'} 
              onClick={() => setActiveTab('body')}
            >
              Body
            </Tab>
            <Tab 
              $active={activeTab === 'form-data'} 
              onClick={() => setActiveTab('form-data')}
            >
              Form Data
            </Tab>
          </TabContainer>
          {activeTab === 'body' && (
            <TextArea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter request body (JSON)"
            />
          )}
          {activeTab === 'form-data' && (
            <KeyValueList>
              {/* Form data implementation can be added here */}
              <div>Form data implementation coming soon...</div>
            </KeyValueList>
          )}
        </Section>

        {response && (
          <ResponseContainer>
            <ResponseHeader>
              <StatusBadge status={response.status}>
                {response.status} {response.statusText}
              </StatusBadge>
            </ResponseHeader>
            <ResponseBody>{formatResponse()}</ResponseBody>
          </ResponseContainer>
        )}
      </RequestContainer>
    </Container>
  );
}

export default ApiTester; 