import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { lang } from '../../i18n/lang';
import { parse } from 'yaml';

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

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 0.5rem;
  gap: 0.5rem;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 280px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #b2ebf2;
`;

const SidebarTitle = styled.h2`
  color: #006064;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const NewCollectionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #00acc1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;

  &:hover {
    color: #0097a7;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #b2ebf2;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #00acc1;
  }
`;

const RequestItem = styled.div`
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  background: ${props => props.$active ? '#e0f7fa' : 'white'};
  border: 1px solid ${props => props.$active ? '#00acc1' : '#b2ebf2'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e0f7fa;
    border-color: #00acc1;
  }
`;

const RequestItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RequestName = styled.div`
  font-weight: 500;
  color: #006064;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequestMethod = styled.span`
  font-size: 0.75rem;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  background: ${props => {
    switch (props.$method) {
      case 'GET': return '#e3f2fd';
      case 'POST': return '#e8f5e9';
      case 'PUT': return '#fff3e0';
      case 'DELETE': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.$method) {
      case 'GET': return '#1976d2';
      case 'POST': return '#2e7d32';
      case 'PUT': return '#f57c00';
      case 'DELETE': return '#c62828';
      default: return '#616161';
    }
  }};
`;

const RequestUrl = styled.div`
  font-size: 0.75rem;
  color: #78909c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.15rem;
`;

const DeleteButton = styled.button`
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: #b0bec5;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ef5350;
  }
`;

const ApiTesterContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
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

const RequestSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const RequestNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequestNameInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  width: 300px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }

  &::placeholder {
    color: #80deea;
  }
`;

const UrlBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const MethodSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  height: 42px;
  min-width: 120px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  height: 42px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #00acc1;
  color: white;
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
  height: ${props => props.$isResponse ? '80%' : '20%'};
  min-height: ${props => props.$isResponse ? '300px' : '150px'};
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

const ResponseContainer = styled.div`
  flex: 1;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  background: white;
  overflow: auto;
  position: relative;
  padding: 1rem;
  min-height: 300px;

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

const HeadersGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
  min-height: 120px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #b2ebf2;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #00acc1;
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: center;
`;

const HeaderInput = styled.input`
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

const RemoveButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: #ffebee;
  color: #d32f2f;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    background: #ffcdd2;
  }
`;

const AddHeaderButton = styled.button`
  padding: 0.5rem;
  border: 2px dashed #b2ebf2;
  border-radius: 8px;
  background: transparent;
  color: #00acc1;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;

  &:hover {
    background: #e0f7fa;
    border-color: #00acc1;
  }
`;

const ContentTypeSelect = styled.select`
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
  width: 180px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #4caf50;
  color: white;
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
    background: #43a047;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Dialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const DialogTitle = styled.h3`
  color: #006064;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const DialogInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const DialogButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: #00acc1;
    color: white;

    &:hover {
      background: #0097a7;
    }
  }

  &.secondary {
    background: #e0f7fa;
    color: #006064;

    &:hover {
      background: #b2ebf2;
    }
  }
`;

const CollectionItem = styled.div`
  margin-bottom: 0.25rem;
`;

const CollectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.5rem;
  background: #e0f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #b2ebf2;
  }
`;

const CollectionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AddRequestButton = styled.button`
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: #00acc1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;

  &:hover {
    background: #b2ebf2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const CollectionName = styled.div`
  font-weight: 500;
  color: #006064;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.3s ease;
    transform: rotate(${props => props.$expanded ? '90deg' : '0deg'});
  }
`;

const CollectionRequests = styled.div`
  margin-top: 0.15rem;
  padding-left: 0.75rem;
  display: ${props => props.$expanded ? 'block' : 'none'};
`;

const ApiTester = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [requestName, setRequestName] = useState('Untitled');
  const [activeTab, setActiveTab] = useState('parameters');
  const [requestBody, setRequestBody] = useState('');
  const [contentType, setContentType] = useState('application/json');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRequests, setSavedRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collections, setCollections] = useState([]);
  const [expandedCollections, setExpandedCollections] = useState({});
  const [parameters, setParameters] = useState([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importError, setImportError] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const language = 'zh';
  const t = lang[language];

  // 加载保存的集合和请求
  useEffect(() => {
    const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    const savedRequests = JSON.parse(localStorage.getItem('savedRequests') || '[]');
    setCollections(savedCollections);
    setSavedRequests(savedRequests);
  }, []);

  const contentTypes = [
    { value: 'none', label: 'None' },
    { value: 'application/json', label: 'JSON' },
    { value: 'application/xml', label: 'XML' },
    { value: 'text/plain', label: 'Text' },
    { value: 'application/x-www-form-urlencoded', label: 'Form URL Encoded' },
    { value: 'multipart/form-data', label: 'Form Data' },
    { value: 'application/javascript', label: 'JavaScript' },
    { value: 'text/html', label: 'HTML' },
    { value: 'text/css', label: 'CSS' },
    { value: 'text/markdown', label: 'Markdown' },
    { value: 'application/yaml', label: 'YAML' },
  ];

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    // 更新 Content-Type header
    const newHeaders = headers.filter(header => header.key !== 'Content-Type');
    if (newType !== 'none') {
      newHeaders.push({ key: 'Content-Type', value: newType });
    }
    setHeaders(newHeaders);
  };

  const handleParameterChange = (index, field, value) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    setParameters(newParameters);
  };

  const addParameter = () => {
    setParameters([...parameters, { key: '', value: '' }]);
  };

  const removeParameter = (index) => {
    const newParameters = parameters.filter((_, i) => i !== index);
    setParameters(newParameters);
  };

  const buildUrlWithParameters = () => {
    if (!parameters.length) return url;
    const queryString = parameters
      .filter(param => param.key && param.value)
      .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
      .join('&');
    return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  };

  const handleSend = async () => {
    if (!url) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const options = {
        method,
        headers: headersObj,
      };

      if (method !== 'GET' && requestBody && contentType !== 'none') {
        options.body = requestBody;
      }

      const finalUrl = buildUrlWithParameters();
      const response = await fetch(finalUrl, options);
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

  const handleSave = () => {
    const requestData = {
      id: activeRequest || `req_${Date.now()}`,
      name: requestName,
      method,
      url,
      headers,
      parameters,
      body: requestBody,
      contentType,
      timestamp: new Date().toISOString()
    };

    const updatedRequests = [...savedRequests];
    const existingIndex = updatedRequests.findIndex(req => req.id === requestData.id);
    
    if (existingIndex !== -1) {
      updatedRequests[existingIndex] = requestData;
    } else {
      updatedRequests.push(requestData);
    }

    localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
    setSavedRequests(updatedRequests);
    setActiveRequest(requestData.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteRequest = (requestId, e) => {
    e.stopPropagation();
    const updatedRequests = savedRequests.filter(req => req.id !== requestId);
    localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
    setSavedRequests(updatedRequests);

    // 从所有集合中移除该请求
    const updatedCollections = collections.map(collection => ({
      ...collection,
      requests: collection.requests.filter(id => id !== requestId)
    }));
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    setCollections(updatedCollections);

    if (activeRequest === requestId) {
      setActiveRequest(null);
      resetForm();
    }
  };

  const handleRequestClick = (request) => {
    setActiveRequest(request.id);
    setRequestName(request.name);
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setParameters(request.parameters || []);
    setRequestBody(request.body);
    setContentType(request.contentType);
  };

  const resetForm = () => {
    setRequestName('Untitled');
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: 'Content-Type', value: 'application/json' }]);
    setRequestBody('');
    setContentType('application/json');
    setResponse(null);
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      requests: []
    };

    const updatedCollections = [...collections, newCollection];
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    setCollections(updatedCollections);
    setNewCollectionName('');
    setShowNewCollectionDialog(false);
  };

  const toggleCollection = (collectionId) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const handleAddRequestToCollection = (collectionId) => {
    const requestId = `req_${Date.now()}`;
    const newRequest = {
      id: requestId,
      name: 'Untitled',
      method: 'GET',
      url: '',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      parameters: [],
      body: '',
      contentType: 'application/json',
      timestamp: new Date().toISOString()
    };

    // 更新请求列表
    const updatedRequests = [...savedRequests, newRequest];
    localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
    setSavedRequests(updatedRequests);

    // 更新集合
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: [...new Set([...collection.requests, requestId])]
        };
      }
      return collection;
    });
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    setCollections(updatedCollections);

    // 激活新创建的请求
    setActiveRequest(requestId);
    setRequestName('Untitled');
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: 'Content-Type', value: 'application/json' }]);
    setRequestBody('');
    setContentType('application/json');
    setResponse(null);
  };

  const parseOpenApiContent = (content) => {
    try {
      // 尝试解析为 JSON
      return JSON.parse(content);
    } catch (e) {
      try {
        // 如果不是 JSON，尝试解析为 YAML
        return parse(content);
      } catch (e) {
        throw new Error('Invalid OpenAPI specification format. Please provide valid JSON or YAML.');
      }
    }
  };

  const extractSecuritySchemes = (spec) => {
    const schemes = {};
    if (spec.components?.securitySchemes) {
      Object.entries(spec.components.securitySchemes).forEach(([name, scheme]) => {
        schemes[name] = {
          type: scheme.type,
          name: name,
          description: scheme.description,
          in: scheme.in,
          scheme: scheme.scheme,
          bearerFormat: scheme.bearerFormat,
          flows: scheme.flows
        };
      });
    }
    return schemes;
  };

  const createAuthHeader = (scheme) => {
    switch (scheme.type) {
      case 'http':
        if (scheme.scheme === 'bearer') {
          return { key: 'Authorization', value: 'Bearer YOUR_TOKEN' };
        }
        if (scheme.scheme === 'basic') {
          return { key: 'Authorization', value: 'Basic YOUR_CREDENTIALS' };
        }
        break;
      case 'apiKey':
        return { key: scheme.name, value: 'YOUR_API_KEY' };
      case 'oauth2':
        return { key: 'Authorization', value: 'Bearer YOUR_ACCESS_TOKEN' };
      default:
        return null;
    }
  };

  const resolveSchema = (schema, spec) => {
    if (!schema) return null;

    // 处理引用
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let resolved = spec;
      for (const part of refPath) {
        resolved = resolved[part];
      }
      // 递归解析引用的 schema
      return resolveSchema(resolved, spec);
    }

    // 处理数组
    if (schema.type === 'array') {
      const items = resolveSchema(schema.items, spec);
      return {
        type: 'array',
        items: items,
        xml: schema.xml
      };
    }

    // 处理对象
    if (schema.type === 'object' || schema.properties) {
      const properties = {};
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, value]) => {
          // 递归解析每个属性
          properties[key] = resolveSchema(value, spec);
        });
      }
      return {
        type: 'object',
        properties: properties,
        required: schema.required || [],
        xml: schema.xml
      };
    }

    // 处理基本类型
    return {
      type: schema.type || 'string',
      format: schema.format,
      example: schema.example,
      default: schema.default,
      enum: schema.enum,
      description: schema.description,
      xml: schema.xml
    };
  };

  const generateExampleValue = (schema) => {
    if (!schema) return null;

    switch (schema.type) {
      case 'string':
        if (schema.enum) return schema.enum[0];
        if (schema.format === 'date-time') return new Date().toISOString();
        if (schema.format === 'date') return new Date().toISOString().split('T')[0];
        if (schema.format === 'email') return 'example@email.com';
        if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
        return schema.example || 'string';
      
      case 'number':
      case 'integer':
        if (schema.format === 'int64') return schema.example || 9223372036854775807;
        return schema.example || 0;
      
      case 'boolean':
        return schema.example || false;
      
      case 'array':
        const itemExample = generateExampleValue(schema.items);
        // 对于必需字段，生成至少一个示例值
        return itemExample ? [itemExample] : [];
      
      case 'object':
        if (!schema.properties) return {};
        const example = {};
        // 处理所有属性，不再只处理必需字段
        Object.entries(schema.properties).forEach(([key, value]) => {
          example[key] = generateExampleValue(value);
        });
        return example;
      
      default:
        return null;
    }
  };

  const parseOpenApiFile = async (content) => {
    setImporting(true);
    setImportError('');
    setImportProgress(0);

    try {
      const spec = parseOpenApiContent(content);
      
      // 验证基本结构
      if (!spec.openapi && !spec.swagger) {
        throw new Error('Invalid OpenAPI specification: missing openapi/swagger version');
      }

      // 预处理所有 schema 引用
      if (spec.components?.schemas) {
        Object.entries(spec.components.schemas).forEach(([name, schema]) => {
          spec.components.schemas[name] = resolveSchema(schema, spec);
        });
      }

      // 提取安全方案
      const securitySchemes = extractSecuritySchemes(spec);
      setImportProgress(10);

      const collectionName = spec.info?.title || 'Imported API';
      const collectionId = `collection_${Date.now()}`;
      const requests = [];

      // 获取所有路径和方法
      const paths = Object.entries(spec.paths || {});
      const totalOperations = paths.reduce((count, [_, pathItem]) => {
        return count + Object.keys(pathItem).filter(method => 
          ['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())
        ).length;
      }, 0);

      let processedOperations = 0;

      // 遍历所有路径
      for (const [path, pathItem] of paths) {
        // 遍历每个路径的所有方法
        for (const [method, operation] of Object.entries(pathItem)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const requestName = operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`;
            
            // 构建请求参数
            const parameters = [];
            if (operation.parameters) {
              operation.parameters.forEach(param => {
                if (param.in === 'query') {
                  parameters.push({
                    key: param.name,
                    value: param.schema?.default || ''
                  });
                }
              });
            }

            // 构建请求头
            const headers = [
              { key: 'Content-Type', value: 'application/json' }
            ];

            // 添加安全认证头
            if (operation.security) {
              operation.security.forEach(security => {
                Object.entries(security).forEach(([schemeName, _]) => {
                  const scheme = securitySchemes[schemeName];
                  if (scheme) {
                    const authHeader = createAuthHeader(scheme);
                    if (authHeader) {
                      headers.push(authHeader);
                    }
                  }
                });
              });
            }

            // 构建请求体
            let body = '';
            if (operation.requestBody?.content?.['application/json']?.schema) {
              const resolvedSchema = resolveSchema(operation.requestBody.content['application/json'].schema, spec);
              const exampleValue = generateExampleValue(resolvedSchema);
              // 确保必需字段存在
              if (resolvedSchema.required) {
                resolvedSchema.required.forEach(field => {
                  if (!exampleValue[field]) {
                    exampleValue[field] = generateExampleValue(resolvedSchema.properties[field]);
                  }
                });
              }
              body = JSON.stringify(exampleValue, null, 2);
            }

            requests.push({
              id: requestId,
              name: requestName,
              method: method.toUpperCase(),
              url: path,
              headers,
              parameters,
              body,
              contentType: 'application/json',
              timestamp: new Date().toISOString()
            });

            processedOperations++;
            setImportProgress(10 + Math.floor((processedOperations / totalOperations) * 80));
          }
        }
      }

      // 创建新集合
      const newCollection = {
        id: collectionId,
        name: collectionName,
        requests: requests.map(req => req.id),
        description: spec.info?.description || '',
        version: spec.info?.version || '1.0.0'
      };

      setImportProgress(90);

      // 更新状态
      const updatedCollections = [...collections, newCollection];
      const updatedRequests = [...savedRequests, ...requests];

      localStorage.setItem('collections', JSON.stringify(updatedCollections));
      localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
      
      setCollections(updatedCollections);
      setSavedRequests(updatedRequests);
      setImportProgress(100);

      setTimeout(() => {
        setShowImportDialog(false);
        setImportContent('');
        setImportProgress(0);
        setImporting(false);
      }, 500);

      return true;
    } catch (error) {
      console.error('Error parsing OpenAPI file:', error);
      setImportError(error.message);
      setImportProgress(0);
      setImporting(false);
      return false;
    }
  };

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Collections</SidebarTitle>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <NewCollectionButton onClick={() => setShowImportDialog(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import
            </NewCollectionButton>
            <NewCollectionButton onClick={() => setShowNewCollectionDialog(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Collection
            </NewCollectionButton>
          </div>
        </SidebarHeader>
        <RequestList>
          {collections.map((collection) => (
            <CollectionItem key={collection.id}>
              <CollectionHeader onClick={() => toggleCollection(collection.id)}>
                <CollectionName $expanded={expandedCollections[collection.id]}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  {collection.name}
                </CollectionName>
                <CollectionControls>
                  <AddRequestButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddRequestToCollection(collection.id);
                    }}
                    title="Create New Request"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </AddRequestButton>
                  <DeleteButton onClick={(e) => {
                    e.stopPropagation();
                    const updatedCollections = collections.filter(c => c.id !== collection.id);
                    localStorage.setItem('collections', JSON.stringify(updatedCollections));
                    setCollections(updatedCollections);
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </DeleteButton>
                </CollectionControls>
              </CollectionHeader>
              <CollectionRequests $expanded={expandedCollections[collection.id]}>
                {savedRequests
                  .filter(request => collection.requests.includes(request.id))
                  .map((request) => (
                    <RequestItem
                      key={request.id}
                      $active={activeRequest === request.id}
                      onClick={() => handleRequestClick(request)}
                    >
                      <RequestItemHeader>
                        <RequestName>
                          {request.name}
                          <RequestMethod $method={request.method}>{request.method}</RequestMethod>
                        </RequestName>
                        <DeleteButton onClick={(e) => handleDeleteRequest(request.id, e)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </DeleteButton>
                      </RequestItemHeader>
                    </RequestItem>
                  ))}
              </CollectionRequests>
            </CollectionItem>
          ))}
        </RequestList>
      </Sidebar>
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
            <RequestNameContainer>
              <RequestNameInput
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="Request Name"
              />
              <SaveButton onClick={handleSave} disabled={saved}>
                {saved ? 'Saved!' : 'Save'}
              </SaveButton>
            </RequestNameContainer>
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
                placeholder={t.apiTester.urlPlaceholder}
              />
              <SendButton onClick={handleSend} disabled={loading || !url}>
                {loading ? t.apiTester.sending : t.apiTester.send}
              </SendButton>
            </UrlBar>

            <TabsContainer>
              <Tab
                $active={activeTab === 'parameters'}
                onClick={() => setActiveTab('parameters')}
              >
                Parameters
              </Tab>
              <Tab
                $active={activeTab === 'headers'}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </Tab>
              <Tab
                $active={activeTab === 'body'}
                onClick={() => setActiveTab('body')}
              >
                Body
              </Tab>
            </TabsContainer>

            <EditorContainer>
              <EditorSection $isResponse={false}>
                <SectionHeader>
                  <SectionLabel>
                    {activeTab === 'parameters' ? 'Parameters' :
                     activeTab === 'headers' ? 'Headers' :
                     'Body'}
                  </SectionLabel>
                  {activeTab === 'body' && (
                    <ContentTypeSelect
                      value={contentType}
                      onChange={(e) => handleContentTypeChange(e.target.value)}
                    >
                      {contentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </ContentTypeSelect>
                  )}
                </SectionHeader>
                {activeTab === 'parameters' ? (
                  <HeadersGrid>
                    {parameters.map((param, index) => (
                      <HeaderRow key={index}>
                        <HeaderInput
                          value={param.key}
                          onChange={(e) => handleParameterChange(index, 'key', e.target.value)}
                          placeholder="Key"
                        />
                        <HeaderInput
                          value={param.value}
                          onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                          placeholder="Value"
                        />
                        <RemoveButton onClick={() => removeParameter(index)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </RemoveButton>
                      </HeaderRow>
                    ))}
                    <AddHeaderButton onClick={addParameter}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Parameter
                    </AddHeaderButton>
                  </HeadersGrid>
                ) : activeTab === 'headers' ? (
                  <HeadersGrid>
                    {headers.map((header, index) => (
                      <HeaderRow key={index}>
                        <HeaderInput
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                          placeholder="Key"
                        />
                        <HeaderInput
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                          placeholder="Value"
                        />
                        <RemoveButton onClick={() => removeHeader(index)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </RemoveButton>
                      </HeaderRow>
                    ))}
                    <AddHeaderButton onClick={addHeader}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Header
                    </AddHeaderButton>
                  </HeadersGrid>
                ) : (
                  <TextArea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder={t.apiTester.requestBodyPlaceholder}
                    style={{
                      fontFamily: 'monospace',
                      whiteSpace: 'pre',
                      tabSize: 2
                    }}
                  />
                )}
              </EditorSection>

              <EditorSection $isResponse={true}>
                <SectionHeader>
                  <SectionLabel>{t.apiTester.response}</SectionLabel>
                </SectionHeader>
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

      {showNewCollectionDialog && (
        <Dialog>
          <DialogContent>
            <DialogTitle>New Collection</DialogTitle>
            <DialogInput
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection Name"
              autoFocus
            />
            <DialogButtons>
              <DialogButton
                className="secondary"
                onClick={() => setShowNewCollectionDialog(false)}
              >
                Cancel
              </DialogButton>
              <DialogButton
                className="primary"
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
              >
                Create
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </Dialog>
      )}

      {showImportDialog && (
        <Dialog>
          <DialogContent>
            <DialogTitle>Import OpenAPI Specification</DialogTitle>
            <TextArea
              value={importContent}
              onChange={(e) => {
                setImportContent(e.target.value);
                setImportError('');
              }}
              placeholder="Paste your OpenAPI JSON or YAML content here..."
              style={{
                height: '300px',
                marginBottom: '1rem',
                fontFamily: 'monospace'
              }}
            />
            {importError && (
              <div style={{ 
                color: '#d32f2f', 
                marginBottom: '1rem', 
                padding: '0.5rem',
                backgroundColor: '#ffebee',
                borderRadius: '4px'
              }}>
                {importError}
              </div>
            )}
            {importing && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  height: '4px', 
                  backgroundColor: '#e0f7fa',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#00acc1',
                    width: `${importProgress}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '0.5rem',
                  color: '#006064',
                  fontSize: '0.9rem'
                }}>
                  Importing... {importProgress}%
                </div>
              </div>
            )}
            <DialogButtons>
              <DialogButton
                className="secondary"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportContent('');
                  setImportError('');
                  setImportProgress(0);
                }}
              >
                Cancel
              </DialogButton>
              <DialogButton
                className="primary"
                onClick={() => parseOpenApiFile(importContent)}
                disabled={!importContent.trim() || importing}
              >
                {importing ? 'Importing...' : 'Import'}
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default ApiTester; 