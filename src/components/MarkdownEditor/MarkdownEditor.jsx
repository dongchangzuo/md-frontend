import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import 'katex/dist/katex.min.css';
import FileTree from '../FileTree/FileTree';
import { tokenManager } from '../../services/api';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import './MarkdownEditor.css';
import { useTheme } from '../../theme/ThemeContext';
import { marked } from 'marked';
import emoji from 'emoji-toolkit';

// 配置 emoji-toolkit
emoji.allow_native = true;
emoji.replace_mode = 'unified';

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
  height: 100vh;
  overflow: hidden;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
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
  background: ${({ theme }) => theme.bg};
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
  background: ${({ theme }) => theme.sidebarBg};
  border-right: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
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
  background: ${({ theme }) => theme.card};
  overflow: hidden;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.card};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.primary};
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
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: white;
    border-color: ${({ theme }) => theme.primary};
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
  background: ${({ theme }) => theme.card};
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
    background: ${({ theme }) => theme.border};
    box-shadow: 0 0 4px ${({ theme }) => theme.border};
    z-index: 1;
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.card};
  border-right: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  position: relative;

  ${SplitVertical} & {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const MarkdownTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  resize: none;
  border-radius: 0 0 8px 8px;
  overflow-y: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.bg};
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

const PreviewContainer = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  ${SplitVertical} & {
    border-top: 1px solid ${({ theme }) => theme.border};
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.bg};
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

const ActionButton = styled.button`
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
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-sizing: border-box;

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
  pre {
    background: ${props => props.theme.codeBg};
    color: ${props => props.theme.codeText};
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.97em;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 1.2em 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: visible;
  }
  pre code {
    padding: 0;
    margin: 0;
    background-color: transparent;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
  }
  code {
    background: ${props => props.theme.codeBg};
    color: ${props => props.theme.codeText};
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.97em;
    border-radius: 4px;
    padding: 2px 6px;
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
  img.emoji {
    height: 1.2em;
    width: 1.2em;
    margin: 0 .05em 0 .1em;
    vertical-align: -0.1em;
  }
  mark {
    background-color: #ffeb3b;
    color: #000;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  del {
    text-decoration: line-through;
    color: ${({ theme }) => theme.text};
    opacity: 0.7;
  }
  .math-inline {
    padding: 0 0.2em;
  }

  .math-display {
    margin: 1em 0;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .frontmatter {
    background: ${({ theme }) => theme.codeBg};
    padding: 1em;
    margin-bottom: 1em;
    border-radius: 4px;
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.9em;
    color: ${({ theme }) => theme.codeText};
    white-space: pre;
    overflow-x: auto;
  }
`;

function MarkdownEditor() {
  const { theme, themeMode, toggleTheme } = useTheme();
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
  const [markdownTheme, setMarkdownTheme] = useState('default');
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
    <PreviewContainer>
      <MarkdownPreview theme={markdownThemes[markdownTheme].styles}>
        <ReactMarkdown 
          remarkPlugins={[
            [remarkGfm, {
              strikethrough: true,
              singleTilde: true,
              autolink: true,
              taskList: true,
              table: true
            }],
            remarkMath,
            [remarkEmoji, { padSpaceAfter: true }],
            [remarkFrontmatter, ['yaml']]
          ]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            h1: ({node, ...props}) => <h1 {...props} />,
            h2: ({node, ...props}) => <h2 {...props} />,
            h3: ({node, ...props}) => <h3 {...props} />,
            p: ({node, ...props}) => <p {...props} />,
            ul: ({node, ...props}) => <ul {...props} />,
            ol: ({node, ...props}) => <ol {...props} />,
            li: ({node, ...props}) => <li {...props} />,
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <pre>
                  <code className={className} {...props}>
                    {String(children).replace(/\n$/, '')}
                  </code>
                </pre>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            blockquote: ({node, ...props}) => <blockquote {...props} />,
            img: ({node, ...props}) => <img {...props} />,
            table: ({node, ...props}) => <table {...props} />,
            thead: ({node, ...props}) => <thead {...props} />,
            tbody: ({node, ...props}) => <tbody {...props} />,
            tr: ({node, ...props}) => <tr {...props} />,
            th: ({node, ...props}) => <th {...props} />,
            td: ({node, ...props}) => <td {...props} />,
            del: ({node, ...props}) => <del {...props} />,
            mark: ({node, ...props}) => <mark {...props} />,
            math: ({node, inline, ...props}) => (
              <span className={inline ? 'math-inline' : 'math-display'} {...props} />
            ),
            yaml: ({node, ...props}) => (
              <div className="frontmatter" {...props} />
            ),
            a: ({node, ...props}) => (
              <a 
                {...props} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: props.theme?.link || '#0366d6',
                  textDecoration: 'none'
                }}
              />
            )
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

  const handleExportHtml = () => {
    try {
      // 使用 marked 将 markdown 转换为 HTML，并处理 emoji
      const htmlContent = marked(emoji.toImage(content));
      
      // 创建完整的 HTML 文档，使用内联样式
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentFile ? currentFile.name : 'Markdown Export'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="font-size: 16px; line-height: 1.75;">
    ${htmlContent.split('\n').map(line => {
      // 处理标题
      if (line.startsWith('<h1')) {
        return line.replace('<h1', '<h1 style="font-size: 2em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; border-bottom: 2px solid #dfe2e5; padding-bottom: 0.2em;"');
      }
      if (line.startsWith('<h2')) {
        return line.replace('<h2', '<h2 style="font-size: 1.5em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; border-bottom: 1px solid #dfe2e5; padding-bottom: 0.15em;"');
      }
      if (line.startsWith('<h3')) {
        return line.replace('<h3', '<h3 style="font-size: 1.25em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25;"');
      }
      // 处理段落
      if (line.startsWith('<p')) {
        return line.replace('<p', '<p style="margin-bottom: 16px;"');
      }
      // 处理代码块
      if (line.startsWith('<pre')) {
        return line.replace('<pre', '<pre style="padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px;"');
      }
      if (line.includes('<code') && !line.includes('<pre')) {
        return line.replace('<code', '<code style="font-family: \'SFMono-Regular\', Consolas, \'Liberation Mono\', Menlo, monospace; padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px;"');
      }
      // 处理引用块
      if (line.startsWith('<blockquote')) {
        return line.replace('<blockquote', '<blockquote style="padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 0 0 16px 0;"');
      }
      // 处理表格
      if (line.startsWith('<table')) {
        return line.replace('<table', '<table style="border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; width: 100%;"');
      }
      if (line.includes('<th') || line.includes('<td')) {
        return line.replace(/<(th|td)/g, '<$1 style="padding: 6px 13px; border: 1px solid #dfe2e5;"');
      }
      if (line.includes('<tr')) {
        return line.replace('<tr', '<tr style="background-color: #fff; border-top: 1px solid #c6cbd1;"');
      }
      // 处理图片
      if (line.includes('<img')) {
        return line.replace('<img', '<img style="max-width: 100%; box-sizing: border-box;"');
      }
      // 处理链接
      if (line.includes('<a')) {
        return line.replace('<a', '<a style="color: #0366d6; text-decoration: none;"');
      }
      // 处理水平线
      if (line.startsWith('<hr')) {
        return line.replace('<hr', '<hr style="border: none; border-top: 1.5px solid #dfe2e5; margin: 2em 0;"');
      }
      // 处理列表
      if (line.startsWith('<ul') || line.startsWith('<ol')) {
        return line.replace(/<(ul|ol)/g, '<$1 style="margin: 1em 0 1em 2em;"');
      }
      if (line.startsWith('<li')) {
        return line.replace('<li', '<li style="margin: 0.3em 0;"');
      }
      return line;
    }).join('\n')}
  </div>
</body>
</html>`;

      // 复制到剪贴板
      navigator.clipboard.writeText(fullHtml).then(() => {
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 2000);
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderExportButton = () => (
    <ActionButton onClick={handleExportHtml} title="Export as HTML">
      {showExportSuccess ? (lang.en.exportSuccess || 'Copied!') : (lang.en.exportHtml || 'Export HTML')}
    </ActionButton>
  );

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
                {renderExportButton()}
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