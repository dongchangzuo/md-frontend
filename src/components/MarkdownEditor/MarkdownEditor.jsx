import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import FileTree from '../FileTree/FileTree';
import { tokenManager } from '../../services/api';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
`;

const FileTreeWrapper = styled.div`
  width: 220px;
  background: ${({ theme }) => theme.sidebarBg};
  border-right: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
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
  padding: 16px;
  overflow: auto;
`;

const LayoutButton = styled.button`
  background: ${({ active, theme }) => active ? theme.accent : theme.card};
  color: ${({ active, theme }) => active ? '#fff' : theme.text};
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

const MarkdownPreview = styled.div`
  font-size: 16px;
  line-height: 1.75;
  color: ${({ theme }) => theme.markdownText};
  background: ${({ theme }) => theme.markdownBg};
  border-radius: 8px;
  padding: 0;
  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.markdownText};
    font-weight: 700;
    margin: 1.5em 0 0.7em 0;
    line-height: 1.2;
  }
  h1 { font-size: 2.2em; border-bottom: 2px solid ${({ theme }) => theme.markdownHr}; padding-bottom: 0.2em; }
  h2 { font-size: 1.7em; border-bottom: 1px solid ${({ theme }) => theme.markdownHr}; padding-bottom: 0.15em; }
  h3 { font-size: 1.3em; }
  h4, h5, h6 { font-size: 1.1em; }
  p { margin: 1em 0; }
  ul, ol { margin: 1em 0 1em 2em; }
  li { margin: 0.3em 0; }
  code {
    background: ${({ theme }) => theme.markdownCodeBg};
    color: ${({ theme }) => theme.markdownCodeText};
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.97em;
    border-radius: 4px;
    padding: 2px 6px;
  }
  pre {
    background: ${({ theme }) => theme.markdownCodeBg};
    color: ${({ theme }) => theme.markdownCodeText};
    font-family: 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.97em;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 1.2em 0;
    overflow-x: auto;
  }
  blockquote {
    background: ${({ theme }) => theme.markdownBlockquoteBg};
    border-left: 4px solid ${({ theme }) => theme.markdownBlockquoteBorder};
    color: ${({ theme }) => theme.markdownText};
    margin: 1.2em 0;
    padding: 0.7em 1.2em;
    border-radius: 4px;
    font-style: italic;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.2em 0;
    background: ${({ theme }) => theme.markdownBg};
  }
  th, td {
    border: 1px solid ${({ theme }) => theme.markdownTableBorder};
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: ${({ theme }) => theme.markdownBlockquoteBg};
    color: ${({ theme }) => theme.markdownText};
  }
  a {
    color: ${({ theme }) => theme.markdownLink};
    text-decoration: underline;
    &:hover { text-decoration: underline wavy; }
  }
  hr {
    border: none;
    border-top: 1.5px solid ${({ theme }) => theme.markdownHr};
    margin: 2em 0;
  }
`;

function MarkdownEditor({ themeMode, setThemeMode }) {
  const [markdown, setMarkdown] = useState('');
  const [layout, setLayout] = useState(LAYOUT_TYPES.SPLIT_HORIZONTAL);
  const [currentFile, setCurrentFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const navigate = useNavigate();
  const [isLocalMode, setIsLocalMode] = useState(false);

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setMarkdown(file.content || '');
  };

  const handleMarkdownChange = (e) => {
    const newContent = e.target.value;
    setMarkdown(newContent);
  };

  // 保存文件内容
  const saveFileContent = async () => {
    if (!currentFile) return;

    if (isLocalMode) {
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
        updateContent(tree, currentFile.path, markdown);
        localStorage.setItem('local-md-files', JSON.stringify(tree));
        setIsSaving(false);
      } catch (e) {
        setSaveError('本地保存失败');
        setIsSaving(false);
      }
      return;
    }

    // 云端模式：原有逻辑
    try {
      setIsSaving(true);
      setSaveError(null);
      const response = await fetch(`http://localhost:8080/api/filesystem/files?path=${encodeURIComponent(currentFile.path)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getToken()}`
        },
        body: JSON.stringify({
          content: markdown
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
      setSaveError(error.message);
      if (error.message === 'Authentication failed') {
        alert('Authentication failed. Please login again');
      } else {
        alert('Failed to save file');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 自动保存
  useEffect(() => {
    if (!currentFile) return;

    const saveTimeout = setTimeout(() => {
      saveFileContent();
    }, 1000); // 1秒后自动保存

    return () => clearTimeout(saveTimeout);
  }, [markdown, currentFile]);

  // 模式切换
  const handleModeSwitch = (mode) => {
    if (mode === 'cloud') {
      const token = tokenManager.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      setIsLocalMode(false);
      // TODO: 这里可触发云端数据拉取逻辑
    } else {
      setIsLocalMode(true);
      // TODO: 这里可触发本地数据拉取逻辑
    }
  };

  const renderLayoutControls = () => (
    <EditorHeaderActions>
      <LayoutButton
        active={layout === LAYOUT_TYPES.SPLIT_HORIZONTAL}
        onClick={() => setLayout(LAYOUT_TYPES.SPLIT_HORIZONTAL)}
        title="左右布局"
      >⇄</LayoutButton>
      <LayoutButton
        active={layout === LAYOUT_TYPES.SPLIT_VERTICAL}
        onClick={() => setLayout(LAYOUT_TYPES.SPLIT_VERTICAL)}
        title="上下布局"
      >⇅</LayoutButton>
      <LayoutButton
        active={layout === LAYOUT_TYPES.EDITOR_ONLY}
        onClick={() => setLayout(LAYOUT_TYPES.EDITOR_ONLY)}
        title="仅编辑器"
      >📝</LayoutButton>
      <LayoutButton
        active={layout === LAYOUT_TYPES.PREVIEW_ONLY}
        onClick={() => setLayout(LAYOUT_TYPES.PREVIEW_ONLY)}
        title="仅预览"
      >👁️</LayoutButton>
    </EditorHeaderActions>
  );

  const renderThemeSwitcher = () => (
    <div style={{ marginLeft: 'auto', marginRight: 0 }}>
      <select
        value={themeMode}
        onChange={e => setThemeMode(e.target.value)}
        style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: themeMode==='dark'? '#232733' : '#f5f5f5', color: 'inherit', outline: 'none', marginLeft: 16 }}
      >
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option value="auto">🖥️ Auto</option>
      </select>
    </div>
  );

  const renderEditor = () => (
    <EditorContainer>
      <MarkdownTextarea
        value={markdown}
        onChange={handleMarkdownChange}
        placeholder="Write your markdown here..."
      />
    </EditorContainer>
  );

  const renderPreview = () => (
    <PreviewContainer>
      <MarkdownPreview>
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
          {markdown}
        </ReactMarkdown>
      </MarkdownPreview>
    </PreviewContainer>
  );

  const renderContent = () => {
    switch (layout) {
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
          <FileTreeWrapper>
            <FileTree onFileSelect={handleFileSelect} isLocalMode={isLocalMode} />
          </FileTreeWrapper>
          <EditorMain>
            <EditorHeader>
              <h2>{currentFile ? currentFile.name : 'Markdown Editor'}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => handleModeSwitch('cloud')}
                  style={{
                    padding: '6px 16px',
                    background: !isLocalMode ? '#1976d2' : '#e3f2fd',
                    color: !isLocalMode ? '#fff' : '#1976d2',
                    border: !isLocalMode ? '1.5px solid #1976d2' : '1.5px solid #90caf9',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    marginRight: 4,
                    cursor: 'pointer',
                    transition: 'all 0.18s'
                  }}
                >
                  云端模式
                </button>
                <button
                  onClick={() => handleModeSwitch('local')}
                  style={{
                    padding: '6px 16px',
                    background: isLocalMode ? '#ffd54f' : '#fffde7',
                    color: isLocalMode ? '#b26a00' : '#b26a00',
                    border: isLocalMode ? '1.5px solid #ffd54f' : '1.5px solid #ffe082',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    marginRight: 16,
                    cursor: 'pointer',
                    transition: 'all 0.18s'
                  }}
                >
                  本地模式
                </button>
                {renderLayoutControls()}
                {renderThemeSwitcher()}
              </div>
            </EditorHeader>
            <EditorContent>
              {layout === LAYOUT_TYPES.SPLIT_HORIZONTAL && (
                <SplitHorizontal>
                  {renderEditor()}
                  {renderPreview()}
                </SplitHorizontal>
              )}
              {layout === LAYOUT_TYPES.SPLIT_VERTICAL && (
                <SplitVertical>
                  {renderEditor()}
                  {renderPreview()}
                </SplitVertical>
              )}
              {layout === LAYOUT_TYPES.EDITOR_ONLY && renderEditor()}
              {layout === LAYOUT_TYPES.PREVIEW_ONLY && renderPreview()}
            </EditorContent>
          </EditorMain>
        </EditorLayout>
      </Container>
    </EditorWrapper>
  );
}

export default MarkdownEditor; 