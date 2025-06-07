import React, { useState, useRef, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import emoji from 'emoji-toolkit';
import markdownItMathjax3 from 'markdown-it-mathjax3';
import FileTree from '../FileTree/FileTree';
import { tokenManager } from '../../services/api';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import { marked } from 'marked';
import katex from 'katex';

// 配置 emoji-toolkit
emoji.allow_native = true;
emoji.replace_mode = 'unified';

// 配置 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
  breaks: false
})
  .use(markdownItMathjax3);

// 添加 emoji 支持
md.use((md) => {
  const defaultRender = md.renderer.rules.text || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    const content = tokens[idx].content;
    return emoji.shortnameToUnicode(content);
  };
});

// 布局类型
const LAYOUT_TYPES = {
  SPLIT_HORIZONTAL: 'split-horizontal', // 左右布局
  SPLIT_VERTICAL: 'split-vertical',     // 上下布局
  EDITOR_ONLY: 'editor-only',           // 仅编辑器
  PREVIEW_ONLY: 'preview-only'          // 仅预览
};

const EditorWrapper = styled.div`
  background: #f5f5f5;
  color: #333;
  height: 100vh;
  overflow: hidden;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
`;

const EditorLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #f5f5f5;
`;

const EditorHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
`;

const FileTreeWrapper = styled.div`
  width: var(--sidebar-width, 280px);
  min-width: 200px;
  max-width: 500px;
  background: white;
  border-right: 1px solid #e0e0e0;
  color: #333;
  transition: width 0.2s ease;
  flex-shrink: 0;
  position: relative;
  height: 100%;
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
  background: white;
  overflow: hidden;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 24px;
    height: 24px;
    color: #00acc1;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #00acc1;
    color: white;
    border-color: #00acc1;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HeaderSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
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

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  background: #f5f5f5;
  overflow: hidden;
`;

const SplitHorizontal = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SplitVertical = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: #e0e0e0;
    box-shadow: 0 0 4px #e0e0e0;
    z-index: 1;
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
  position: relative;

  ${SplitVertical} & {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const MarkdownTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
  border: none;
  outline: none;
  background: #f5f5f5;
  color: #333;
  resize: none;
  font-family: 'Fira Code', 'Menlo', 'Consolas', monospace;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #00acc1;
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: white;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1em; }
  h5 { font-size: 0.875em; }
  h6 { font-size: 0.85em; }

  p {
    margin: 1em 0;
  }

  a {
    color: #0366d6;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  code {
    background: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 85%;
  }

  pre {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
    margin: 1em 0;

    code {
      background: none;
      padding: 0;
      font-size: 100%;
    }
  }

  blockquote {
    margin: 1em 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;

    th, td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  ul, ol {
    margin-left: 2em;
    padding-left: 1.5em;
  }

  ul ul, ol ul, ul ol, ol ol {
    margin-left: 1.5em;
    padding-left: 1.5em;
  }
`;

const LayoutButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  background: ${({ $active }) => $active ? '#00acc1' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#333'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #00acc1;
    color: white;
    border-color: #00acc1;
  }

  svg {
    width: 16px;
    height: 16px;
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

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
  background: white;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #00acc1;
    color: white;
    border-color: #00acc1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

function MarkdownEditor() {
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [splitMode, setSplitMode] = useState(LAYOUT_TYPES.SPLIT_HORIZONTAL);
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
  const navigate = useNavigate();
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

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
    const fileName = prompt('Enter the file name');
    if (fileName) {
      setFiles([...files, { name: fileName, content: '' }]);
    }
  };

  const handleNewFolder = () => {
    const folderName = prompt('Enter the folder name');
    if (folderName) {
      setFiles([...files, { name: folderName, type: 'folder', children: [] }]);
    }
  };

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setContent(file.content || '');
  };

  const handleFileRename = (file) => {
    const newName = prompt('Enter the new name', file.name);
    if (newName) {
      const newFiles = files.map(f => 
        f === file ? { ...f, name: newName } : f
      );
      setFiles(newFiles);
    }
  };

  const handleFileDelete = (file) => {
    if (confirm('Are you sure you want to delete this file?')) {
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

  const renderEditor = () => (
    <EditorContainer>
      <MarkdownTextarea
        value={content}
        onChange={handleContentChange}
        placeholder="Write markdown here..."
      />
    </EditorContainer>
  );

  const renderPreview = () => (
    <PreviewContent
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
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
            />
            {!isCollapsed && (
              <ResizeHandle onMouseDown={handleMouseDown} />
            )}
          </FileTreeWrapper>
          {isCollapsed && (
            <button 
              className="expand-button"
              onClick={handleExpand}
              title={lang.en.expandSidebar}
            >
              ▶
            </button>
          )}
          <EditorMain>
            <EditorHeader>
              <HeaderTitle>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                {currentFile ? currentFile.name : 'Markdown Editor'}
              </HeaderTitle>
              <HeaderActions>
                <HeaderButton
                  className={cloudMode ? 'active' : ''}
                  onClick={() => handleModeSwitch('cloud')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                  </svg>
                  Cloud Mode
                </HeaderButton>
                <HeaderButton
                  className={!cloudMode ? 'active' : ''}
                  onClick={() => handleModeSwitch('local')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
                  </svg>
                  Local Mode
                </HeaderButton>
                {renderLayoutControls()}
              </HeaderActions>
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