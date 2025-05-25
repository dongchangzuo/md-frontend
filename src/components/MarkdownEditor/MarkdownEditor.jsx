import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import FileTree from '../FileTree/FileTree';
import { tokenManager } from '../../services/api';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import './MarkdownEditor.css';
import { useTheme } from '../../theme/ThemeContext';

// 布局类型
const LAYOUT_TYPES = {
  SPLIT_HORIZONTAL: 'split-horizontal', // 左右布局
  SPLIT_VERTICAL: 'split-vertical',     // 上下布局
  EDITOR_ONLY: 'editor-only',           // 仅编辑器
  PREVIEW_ONLY: 'preview-only'          // 仅预览
};

const EditorWrapper = styled.div`
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const EditorLayout = styled.div`
  display: flex;
  height: 100%;
  position: relative;
`;

const FileTreeWrapper = styled.div`
  width: var(--sidebar-width, 280px);
  min-width: 200px;
  max-width: 500px;
  background: ${({ theme }) => theme.sidebarBg};
  border-right: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  transition: width 0.2s ease;
  flex-shrink: 0;
  position: relative;
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.border};
    transform: translateX(-50%);
    transition: all 0.2s;
  }

  &:hover::before,
  &:active::before {
    background: ${({ theme }) => theme.primary};
    width: 4px;
  }
`;

const EditorMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.card};
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 8px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
`;

const EditorHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  background: ${({ theme }) => theme.card};
`;

const SplitHorizontal = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const SplitVertical = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.card};
  border-right: 1px solid ${({ theme }) => theme.border};
`;

const MarkdownTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: 300px;
  padding: 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  resize: vertical;
  border-radius: 0 0 8px 8px;
`;

const PreviewContainer = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  overflow: auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const LayoutButton = styled.button`
  background: ${({ $active, theme }) => $active ? theme.accent : theme.card};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 4px 10px;
  margin-right: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: #fff;
  }
`;

const ModeButton = styled.button`
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-right: 4px;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: wave 1.5s infinite;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &.active {
    background: #1a1a1a;
    color: white;
    border-color: #1a1a1a;

    &::after {
      opacity: 1;
    }
  }

  @keyframes wave {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

// Markdown 主题定义
const markdownThemes = {
  default: {
    name: '默认主题',
    styles: {
      background: ({ theme }) => theme.markdownBg,
      text: ({ theme }) => theme.markdownText,
      codeBg: ({ theme }) => theme.markdownCodeBg,
      codeText: ({ theme }) => theme.markdownCodeText,
      blockquoteBg: ({ theme }) => theme.markdownBlockquoteBg,
      blockquoteBorder: ({ theme }) => theme.markdownBlockquoteBorder,
      hr: ({ theme }) => theme.markdownHr,
      link: ({ theme }) => theme.markdownLink,
      tableBorder: ({ theme }) => theme.markdownTableBorder
    }
  },
  github: {
    name: 'GitHub',
    styles: {
      background: '#ffffff',
      text: '#24292e',
      codeBg: '#f6f8fa',
      codeText: '#24292e',
      blockquoteBg: '#f6f8fa',
      blockquoteBorder: '#dfe2e5',
      hr: '#e1e4e8',
      link: '#0366d6',
      tableBorder: '#dfe2e5'
    }
  },
  dark: {
    name: '暗色主题',
    styles: {
      background: '#1a1a1a',
      text: '#e6e6e6',
      codeBg: '#2d2d2d',
      codeText: '#e6e6e6',
      blockquoteBg: '#2d2d2d',
      blockquoteBorder: '#404040',
      hr: '#404040',
      link: '#58a6ff',
      tableBorder: '#404040'
    }
  },
  solarized: {
    name: 'Solarized',
    styles: {
      background: '#fdf6e3',
      text: '#657b83',
      codeBg: '#eee8d5',
      codeText: '#657b83',
      blockquoteBg: '#eee8d5',
      blockquoteBorder: '#93a1a1',
      hr: '#93a1a1',
      link: '#268bd2',
      tableBorder: '#93a1a1'
    }
  },
  nord: {
    name: 'Nord',
    styles: {
      background: '#2e3440',
      text: '#eceff4',
      codeBg: '#3b4252',
      codeText: '#eceff4',
      blockquoteBg: '#3b4252',
      blockquoteBorder: '#4c566a',
      hr: '#4c566a',
      link: '#88c0d0',
      tableBorder: '#4c566a'
    }
  }
};

const ThemeSelector = styled.select`
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  margin-left: 8px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}20;
  }
`;

const MarkdownPreview = styled.div`
  font-size: 16px;
  line-height: 1.75;
  color: ${props => props.theme.text};
  background: ${props => props.theme.background};
  border-radius: 8px;
  padding: 24px;
  flex: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.text};
    font-weight: 700;
    margin: 1.5em 0 0.7em 0;
    line-height: 1.2;
  }
  h1 { font-size: 2.2em; border-bottom: 2px solid ${props => props.theme.hr}; padding-bottom: 0.2em; }
  h2 { font-size: 1.7em; border-bottom: 1px solid ${props => props.theme.hr}; padding-bottom: 0.15em; }
  h3 { font-size: 1.3em; }
  h4, h5, h6 { font-size: 1.1em; }
  p { margin: 1em 0; }
  ul, ol { margin: 1em 0 1em 2em; }
  li { margin: 0.3em 0; }
  code {
    background: ${props => props.theme.codeBg};
    color: ${props => props.theme.codeText};
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.97em;
    border-radius: 4px;
    padding: 2px 6px;
  }
  pre {
    background: ${props => props.theme.codeBg};
    color: ${props => props.theme.codeText};
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.97em;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 1.2em 0;
    overflow-x: auto;
  }
  blockquote {
    background: ${props => props.theme.blockquoteBg};
    border-left: 4px solid ${props => props.theme.blockquoteBorder};
    color: ${props => props.theme.text};
    margin: 1.2em 0;
    padding: 0.7em 1.2em;
    border-radius: 4px;
    font-style: italic;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.2em 0;
    background: ${props => props.theme.background};
  }
  th, td {
    border: 1px solid ${props => props.theme.tableBorder};
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: ${props => props.theme.blockquoteBg};
    color: ${props => props.theme.text};
  }
  a {
    color: ${props => props.theme.link};
    text-decoration: underline;
    &:hover { text-decoration: underline wavy; }
  }
  hr {
    border: none;
    border-top: 1.5px solid ${props => props.theme.hr};
    margin: 2em 0;
  }
`;

function MarkdownEditor({ language: propLanguage, setLanguage: propSetLanguage }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [internalLanguage, setInternalLanguage] = useState(propLanguage || 'en');
  const language = propLanguage || internalLanguage;
  const setLanguage = propSetLanguage || setInternalLanguage;
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [cloudMode, setCloudMode] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const t = lang[language];
  const navigate = useNavigate();
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const [markdownTheme, setMarkdownTheme] = useState('default');

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  const handleSplitToggle = () => {
    setSplitMode(!splitMode);
  };

  const handleCloudModeToggle = () => {
    setCloudMode(!cloudMode);
  };

  const handleNewFile = () => {
    const fileName = prompt(t.newFile);
    if (fileName) {
      setFiles([...files, { name: fileName, content: '' }]);
    }
  };

  const handleNewFolder = () => {
    const folderName = prompt(t.newFolder);
    if (folderName) {
      setFiles([...files, { name: folderName, type: 'folder', children: [] }]);
    }
  };

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setContent(file.content || '');
  };

  const handleFileRename = (file) => {
    const newName = prompt(t.rename, file.name);
    if (newName) {
      const newFiles = files.map(f => 
        f === file ? { ...f, name: newName } : f
      );
      setFiles(newFiles);
    }
  };

  const handleFileDelete = (file) => {
    if (confirm(t.deleteConfirm)) {
      const newFiles = files.filter(f => f !== file);
      setFiles(newFiles);
      if (currentFile === file) {
        setCurrentFile(null);
        setContent('');
      }
    }
  };

  // 保存文件内容
  const saveFileContent = async () => {
    if (!currentFile) return;

    if (cloudMode) {
      // 云端模式：原有逻辑
      try {
        setError(null);
        const response = await fetch(`http://localhost:8080/api/filesystem/files?path=${encodeURIComponent(currentFile.path)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenManager.getToken()}`
          },
          body: JSON.stringify({
            content: content
          })
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed');
          }
          throw new Error('Failed to save file');
        }
      } catch (error) {
        console.error('Error saving file:', error);
        setError(error.message);
        if (error.message === 'Authentication failed') {
          alert('Authentication failed. Please login again');
        } else {
          alert('Failed to save file');
        }
      }
    } else {
      // 本地模式：保存到 localStorage
      try {
        let tree = [];
        const data = localStorage.getItem('local-md-files');
        if (data) tree = JSON.parse(data);
        // 递归查找并更新内容
        const updateContent = (nodes, path, content) => {
          for (let node of nodes) {
            if (node.path === path && node.type === 'file') {
              node.content = content;
              return true;
            }
            if (node.children && updateContent(node.children, path, content)) return true;
          }
          return false;
        };
        updateContent(tree, currentFile.path, content);
        localStorage.setItem('local-md-files', JSON.stringify(tree));
      } catch (e) {
        setError('本地保存失败');
      }
    }
  };

  // 自动保存
  useEffect(() => {
    if (!currentFile) return;

    const saveTimeout = setTimeout(() => {
      saveFileContent();
    }, 1000); // 1秒后自动保存

    return () => clearTimeout(saveTimeout);
  }, [content, currentFile]);

  // 模式切换
  const handleModeSwitch = (mode) => {
    if (mode === 'cloud') {
      const token = tokenManager.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      setCloudMode(true);
    } else {
      setCloudMode(false);
    }
  };

  // 处理拖动开始
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理拖动
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth < 200) {
      setIsCollapsed(true);
      setSidebarWidth(0);
    } else if (newWidth > 500) {
      setSidebarWidth(500);
    } else {
      setIsCollapsed(false);
      setSidebarWidth(newWidth);
    }

    // 更新 CSS 变量
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  };

  // 处理拖动结束
  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 展开侧边栏
  const handleExpand = () => {
    setIsCollapsed(false);
    setSidebarWidth(280);
    document.documentElement.style.setProperty('--sidebar-width', '280px');
  };

  // 初始化时设置侧边栏宽度
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '280px');
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, []);

  const renderLayoutControls = () => (
    <EditorHeaderActions>
      <LayoutButton
        $active={splitMode === LAYOUT_TYPES.SPLIT_HORIZONTAL}
        onClick={() => setSplitMode(LAYOUT_TYPES.SPLIT_HORIZONTAL)}
        title="左右布局"
      >⇄</LayoutButton>
      <LayoutButton
        $active={splitMode === LAYOUT_TYPES.SPLIT_VERTICAL}
        onClick={() => setSplitMode(LAYOUT_TYPES.SPLIT_VERTICAL)}
        title="上下布局"
      >⇅</LayoutButton>
      <LayoutButton
        $active={splitMode === LAYOUT_TYPES.EDITOR_ONLY}
        onClick={() => setSplitMode(LAYOUT_TYPES.EDITOR_ONLY)}
        title="仅编辑器"
      >📝</LayoutButton>
      <LayoutButton
        $active={splitMode === LAYOUT_TYPES.PREVIEW_ONLY}
        onClick={() => setSplitMode(LAYOUT_TYPES.PREVIEW_ONLY)}
        title="仅预览"
      >👁️</LayoutButton>
    </EditorHeaderActions>
  );

  const renderThemeSwitcher = () => (
    <div style={{ marginLeft: 'auto', marginRight: 0, display: 'flex', alignItems: 'center' }}>
      <ThemeSelector
        value={markdownTheme}
        onChange={(e) => setMarkdownTheme(e.target.value)}
      >
        {Object.entries(markdownThemes).map(([key, theme]) => (
          <option key={key} value={key}>
            {theme.name}
          </option>
        ))}
      </ThemeSelector>
      <select
        value={themeMode}
        onChange={e => toggleTheme(e.target.value)}
        style={{ 
          fontSize: 15, 
          padding: '4px 12px', 
          borderRadius: 6, 
          border: `1px solid ${theme.border}`, 
          background: theme.card, 
          color: theme.text, 
          outline: 'none', 
          marginLeft: 16 
        }}
      >
        <option value="light">☀️ {t.light}</option>
        <option value="dark">🌙 {t.dark}</option>
        <option value="auto">🖥️ {t.auto}</option>
      </select>
    </div>
  );

  const renderEditor = () => (
    <EditorContainer>
      <MarkdownTextarea
        value={content}
        onChange={handleContentChange}
        placeholder={t.writeMarkdown}
      />
    </EditorContainer>
  );

  const renderPreview = () => (
    <PreviewContainer>
      <MarkdownPreview theme={markdownThemes[markdownTheme].styles}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({node, ...props}) => <h1 {...props} />,
            h2: ({node, ...props}) => <h2 {...props} />,
            h3: ({node, ...props}) => <h3 {...props} />,
            p: ({node, ...props}) => <p {...props} />,
            ul: ({node, ...props}) => <ul {...props} />,
            ol: ({node, ...props}) => <ol {...props} />,
            li: ({node, ...props}) => <li {...props} />,
            code: ({node, inline, ...props}) => 
              inline ? <code {...props} /> : <pre><code {...props} /></pre>,
            blockquote: ({node, ...props}) => <blockquote {...props} />,
            img: ({node, ...props}) => <img {...props} />,
            table: ({node, ...props}) => <table {...props} />,
            thead: ({node, ...props}) => <thead {...props} />,
            tbody: ({node, ...props}) => <tbody {...props} />,
            tr: ({node, ...props}) => <tr {...props} />,
            th: ({node, ...props}) => <th {...props} />,
            td: ({node, ...props}) => <td {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </MarkdownPreview>
    </PreviewContainer>
  );

  const renderContent = () => {
    switch (splitMode) {
      case LAYOUT_TYPES.SPLIT_HORIZONTAL:
        return (
          <div className="split-horizontal">
            {renderEditor()}
            {renderPreview()}
          </div>
        );
      case LAYOUT_TYPES.SPLIT_VERTICAL:
        return (
          <div className="split-vertical">
            {renderEditor()}
            {renderPreview()}
          </div>
        );
      case LAYOUT_TYPES.EDITOR_ONLY:
        return renderEditor();
      case LAYOUT_TYPES.PREVIEW_ONLY:
        return renderPreview();
      default:
        return null;
    }
  };

  return (
    <EditorWrapper>
      <Container>
        <EditorLayout>
          <FileTreeWrapper ref={sidebarRef}>
            <FileTree 
              onFileSelect={handleFileSelect} 
              isLocalMode={!cloudMode} 
              language={language}
            />
            {!isCollapsed && (
              <ResizeHandle onMouseDown={handleMouseDown} />
            )}
          </FileTreeWrapper>
          {isCollapsed && (
            <button 
              className="expand-button"
              onClick={handleExpand}
              title={t.expandSidebar}
            >
              ▶
            </button>
          )}
          <EditorMain>
            <EditorHeader>
              <h2>{currentFile ? currentFile.name : t.markdownEditorTitle}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)} 
                  style={{ 
                    fontSize: 15, 
                    padding: '4px 12px', 
                    borderRadius: 6, 
                    border: '1px solid #ddd', 
                    background: '#f5f5f5', 
                    color: '#222', 
                    outline: 'none', 
                    marginRight: 12 
                  }}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
                <ModeButton
                  className={cloudMode ? 'active' : ''}
                  onClick={() => handleModeSwitch('cloud')}
                >
                  {t.cloudMode}
                </ModeButton>
                <ModeButton
                  className={!cloudMode ? 'active' : ''}
                  onClick={() => handleModeSwitch('local')}
                >
                  {t.localMode}
                </ModeButton>
                {renderLayoutControls()}
                {renderThemeSwitcher()}
              </div>
            </EditorHeader>
            <EditorContent>
              {splitMode === LAYOUT_TYPES.SPLIT_HORIZONTAL && (
                <SplitHorizontal>
                  {renderEditor()}
                  {renderPreview()}
                </SplitHorizontal>
              )}
              {splitMode === LAYOUT_TYPES.SPLIT_VERTICAL && (
                <SplitVertical>
                  {renderEditor()}
                  {renderPreview()}
                </SplitVertical>
              )}
              {splitMode === LAYOUT_TYPES.EDITOR_ONLY && renderEditor()}
              {splitMode === LAYOUT_TYPES.PREVIEW_ONLY && renderPreview()}
            </EditorContent>
          </EditorMain>
        </EditorLayout>
      </Container>
    </EditorWrapper>
  );
}

export default MarkdownEditor; 