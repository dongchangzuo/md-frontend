import React, { useState, useEffect } from 'react';
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
  margin-bottom: 0.5rem;
`;

const RequestName = styled.div`
  font-weight: 500;
  color: #006064;
  font-size: 0.85rem;
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
  const [activeTab, setActiveTab] = useState('headers');
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

  const handleSave = () => {
    const requestData = {
      name: requestName,
      method,
      url,
      headers,
      body: requestBody,
      contentType,
      timestamp: new Date().toISOString()
    };

    const updatedRequests = [...savedRequests];
    const existingIndex = updatedRequests.findIndex(req => req.name === requestName);
    
    if (existingIndex !== -1) {
      updatedRequests[existingIndex] = requestData;
    } else {
      updatedRequests.push(requestData);
    }

    localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
    setSavedRequests(updatedRequests);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteRequest = (name, e) => {
    e.stopPropagation();
    const updatedRequests = savedRequests.filter(req => req.name !== name);
    localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
    setSavedRequests(updatedRequests);
    if (activeRequest === name) {
      setActiveRequest(null);
      resetForm();
    }
  };

  const handleRequestClick = (request) => {
    setActiveRequest(request.name);
    setRequestName(request.name);
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
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
    if (!requestName || !url) return;

    const requestData = {
      name: requestName,
      method,
      url,
      headers,
      body: requestBody,
      contentType,
      timestamp: new Date().toISOString()
    };

    // 更新请求列表
    const updatedRequests = [...savedRequests];
    const existingIndex = updatedRequests.findIndex(req => req.name === requestName);
    if (existingIndex !== -1) {
      updatedRequests[existingIndex] = requestData;
    } else {
      updatedRequests.push(requestData);
    }
    localStorage.setItem('savedRequests', JSON.stringify(updatedRequests));
    setSavedRequests(updatedRequests);

    // 更新集合
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: [...new Set([...collection.requests, requestName])]
        };
      }
      return collection;
    });
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    setCollections(updatedCollections);
  };

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Collections</SidebarTitle>
          <NewCollectionButton onClick={() => setShowNewCollectionDialog(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Collection
          </NewCollectionButton>
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
                    disabled={!requestName || !url}
                    title="Add Current Request"
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
                  .filter(request => collection.requests.includes(request.name))
                  .map((request) => (
                    <RequestItem
                      key={request.name}
                      $active={activeRequest === request.name}
                      onClick={() => handleRequestClick(request)}
                    >
                      <RequestItemHeader>
                        <RequestName>{request.name}</RequestName>
                        <DeleteButton onClick={(e) => handleDeleteRequest(request.name, e)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </DeleteButton>
                      </RequestItemHeader>
                      <RequestMethod $method={request.method}>{request.method}</RequestMethod>
                      <RequestUrl>{request.url}</RequestUrl>
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
                $active={activeTab === 'headers'}
                onClick={() => setActiveTab('headers')}
              >
                {t.apiTester.headers}
              </Tab>
              <Tab
                $active={activeTab === 'body'}
                onClick={() => setActiveTab('body')}
              >
                {t.apiTester.requestBody}
              </Tab>
            </TabsContainer>

            <EditorContainer>
              <EditorSection $isResponse={false}>
                <SectionHeader>
                  <SectionLabel>
                    {activeTab === 'body' ? t.apiTester.requestBody : t.apiTester.headers}
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
                {activeTab === 'body' ? (
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
                ) : (
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
    </Container>
  );
};

export default ApiTester; 