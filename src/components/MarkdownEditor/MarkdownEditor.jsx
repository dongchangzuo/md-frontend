import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownEditor.css';

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nStart writing your markdown here...');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleMarkdownChange = (e) => {
    setMarkdown(e.target.value);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="markdown-editor-container">
      <div className="editor-header">
        <h2>Markdown Editor</h2>
        <button 
          className="preview-toggle-button"
          onClick={togglePreviewMode}
        >
          {isPreviewMode ? 'Edit' : 'Preview'}
        </button>
      </div>
      
      <div className="editor-content">
        {isPreviewMode ? (
          <div className="preview-container">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="markdown-preview"
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="editor-container">
            <textarea
              value={markdown}
              onChange={handleMarkdownChange}
              className="markdown-textarea"
              placeholder="Write your markdown here..."
            />
          </div>
        )}
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