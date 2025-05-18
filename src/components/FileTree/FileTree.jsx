import { useState, useEffect } from 'react';
import { tokenManager } from '../../services/api';
import './FileTree.css';

function FileTree({ onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    // Load files from localStorage on component mount
    const savedFiles = localStorage.getItem('markdownFiles');
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  const saveFiles = (updatedFiles) => {
    setFiles(updatedFiles);
    localStorage.setItem('markdownFiles', JSON.stringify(updatedFiles));
  };

  const handleCreateItem = async (type, parentPath = '/') => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;

    if (type === 'folder') {
      try {
        const token = tokenManager.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8080/api/filesystem/directories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name,
            path: parentPath
          })
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed');
          }
          throw new Error('Failed to create directory');
        }

        const newItem = {
          id: Date.now().toString(),
          name,
          type,
          path: `${parentPath}${name}/`,
          content: null,
          parentPath
        };

        const updatedFiles = [...files, newItem];
        saveFiles(updatedFiles);
      } catch (error) {
        console.error('Error creating directory:', error);
        if (error.message === 'No authentication token found') {
          alert('Please login first');
        } else if (error.message === 'Authentication failed') {
          alert('Authentication failed. Please login again');
        } else {
          alert('Failed to create directory');
        }
      }
    } else {
      // Handle file creation (keeping existing logic for files)
      const newItem = {
        id: Date.now().toString(),
        name,
        type,
        path: `${parentPath}${name}${type === 'file' ? '.md' : '/'}`,
        content: type === 'file' ? '' : null,
        parentPath
      };

      const updatedFiles = [...files, newItem];
      saveFiles(updatedFiles);
    }
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const renderTreeItem = (item) => {
    const isExpanded = expandedFolders.has(item.path);
    const children = files.filter(f => f.parentPath === item.path);

    return (
      <div key={item.id} className="tree-item">
        <div 
          className={`tree-item-content ${item.type}`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path);
            } else {
              onFileSelect(item);
            }
          }}
        >
          <span className="tree-item-icon">
            {item.type === 'folder' ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          <span className="tree-item-name">{item.name}</span>
        </div>
        {item.type === 'folder' && isExpanded && (
          <div className="tree-item-children">
            {children.map(child => renderTreeItem(child))}
            <div className="tree-item-actions">
              <button onClick={() => handleCreateItem('file', item.path)}>+ File</button>
              <button onClick={() => handleCreateItem('folder', item.path)}>+ Folder</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const rootItems = files.filter(f => f.parentPath === '/');

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h3>Files</h3>
        <div className="file-tree-actions">
          <button onClick={() => handleCreateItem('file')}>New File</button>
          <button onClick={() => handleCreateItem('folder')}>New Folder</button>
        </div>
      </div>
      <div className="tree-items">
        {rootItems.map(item => renderTreeItem(item))}
        {rootItems.length === 0 && (
          <div className="tree-item-actions">
            <button onClick={() => handleCreateItem('file')}>+ File</button>
            <button onClick={() => handleCreateItem('folder')}>+ Folder</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileTree; 