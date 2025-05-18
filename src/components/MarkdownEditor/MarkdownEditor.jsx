import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import FileTree from '../FileTree/FileTree';
import './MarkdownEditor.css';

// 布局类型
const LAYOUT_TYPES = {
  SPLIT_HORIZONTAL: 'split-horizontal', // 左右布局
  SPLIT_VERTICAL: 'split-vertical',     // 上下布局
  EDITOR_ONLY: 'editor-only',           // 仅编辑器
  PREVIEW_ONLY: 'preview-only'          // 仅预览
};

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('');
  const [layout, setLayout] = useState(LAYOUT_TYPES.SPLIT_HORIZONTAL);
  const [currentFile, setCurrentFile] = useState(null);

  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setMarkdown(file.content || '');
  };

  const handleMarkdownChange = (e) => {
    const newContent = e.target.value;
    setMarkdown(newContent);
    
    // Update file content in localStorage
    if (currentFile) {
      const savedFiles = JSON.parse(localStorage.getItem('markdownFiles') || '[]');
      const updatedFiles = savedFiles.map(file => 
        file.id === currentFile.id ? { ...file, content: newContent } : file
      );
      localStorage.setItem('markdownFiles', JSON.stringify(updatedFiles));
    }
  };

  const renderLayoutControls = () => (
    <div className="layout-controls">
      <button
        className={`layout-button ${layout === LAYOUT_TYPES.SPLIT_HORIZONTAL ? 'active' : ''}`}
        onClick={() => setLayout(LAYOUT_TYPES.SPLIT_HORIZONTAL)}
        title="左右布局"
      >
        <span className="layout-icon">⇄</span>
      </button>
      <button
        className={`layout-button ${layout === LAYOUT_TYPES.SPLIT_VERTICAL ? 'active' : ''}`}
        onClick={() => setLayout(LAYOUT_TYPES.SPLIT_VERTICAL)}
        title="上下布局"
      >
        <span className="layout-icon">⇅</span>
      </button>
      <button
        className={`layout-button ${layout === LAYOUT_TYPES.EDITOR_ONLY ? 'active' : ''}`}
        onClick={() => setLayout(LAYOUT_TYPES.EDITOR_ONLY)}
        title="仅编辑器"
      >
        <span className="layout-icon">📝</span>
      </button>
      <button
        className={`layout-button ${layout === LAYOUT_TYPES.PREVIEW_ONLY ? 'active' : ''}`}
        onClick={() => setLayout(LAYOUT_TYPES.PREVIEW_ONLY)}
        title="仅预览"
      >
        <span className="layout-icon">👁️</span>
      </button>
    </div>
  );

  const renderEditor = () => (
    <div className="editor-container">
      <textarea
        value={markdown}
        onChange={handleMarkdownChange}
        className="markdown-textarea"
        placeholder="Write your markdown here..."
      />
    </div>
  );

  const renderPreview = () => (
    <div className="preview-container">
      <div className="markdown-preview">
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
      </div>
    </div>
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
    <div className="markdown-editor-container">
      <div className="editor-layout">
        <FileTree onFileSelect={handleFileSelect} />
        <div className="editor-main">
          <div className="editor-header">
            <h2>{currentFile ? currentFile.name : 'Markdown Editor'}</h2>
            {renderLayoutControls()}
          </div>
          <div className="editor-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkdownEditor; 