import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownEditor.css';

// 布局类型
const LAYOUT_TYPES = {
  SPLIT_HORIZONTAL: 'split-horizontal', // 左右布局
  SPLIT_VERTICAL: 'split-vertical',     // 上下布局
  EDITOR_ONLY: 'editor-only',           // 仅编辑器
  PREVIEW_ONLY: 'preview-only'          // 仅预览
};

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nStart writing your markdown here...');
  const [layout, setLayout] = useState(LAYOUT_TYPES.SPLIT_HORIZONTAL);

  const handleMarkdownChange = (e) => {
    setMarkdown(e.target.value);
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
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        className="markdown-preview"
      >
        {markdown}
      </ReactMarkdown>
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
      <div className="editor-header">
        <h2>Markdown Editor</h2>
        {renderLayoutControls()}
      </div>
      
      <div className="editor-content">
        {renderContent()}
      </div>
      
      <div className="editor-footer">
        <div className="markdown-tips">
          <h4>Markdown Tips:</h4>
          <ul>
            <li><code># Heading 1</code></li>
            <li><code>## Heading 2</code></li>
            <li><code>*italic*</code> or <code>_italic_</code></li>
            <li><code>**bold**</code> or <code>__bold__</code></li>
            <li><code>- List item</code></li>
            <li><code>[Link text](URL)</code></li>
            <li><code>![Alt text](image URL)</code></li>
            <li><code>`code`</code> or <code>```code block```</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MarkdownEditor; 