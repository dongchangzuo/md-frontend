import { useState, useEffect } from 'react';
import { tokenManager } from '../../services/api';
import { lang } from '../../i18n/lang';
import './FileTree.css';

function FileTree({ onFileSelect, isLocalMode, language = 'en' }) {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const t = lang[language] || lang.en;

  // 本地文件树 key
  const LOCAL_FILES_KEY = 'local-md-files';

  // 加载本地文件树
  const loadLocalFiles = () => {
    try {
      const data = localStorage.getItem(LOCAL_FILES_KEY);
      if (data) {
        setFiles(JSON.parse(data));
      } else {
        setFiles([]);
      }
    } catch (e) {
      setFiles([]);
    }
  };

  // 保存本地文件树
  const saveLocalFiles = (tree) => {
    localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(tree));
  };

  // 保存文件内容
  const saveFile = async (path, content) => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8080/api/filesystem/files?path=${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      if (error.message === 'No authentication token found') {
        alert('Please login first');
      } else if (error.message === 'Authentication failed') {
        alert('Authentication failed. Please login again');
      } else {
        alert('Failed to save file');
      }
      throw error;
    }
  };

  // 构建文件树结构
  const buildFileTree = (items) => {
    const tree = [];
    const itemMap = new Map();

    // 首先创建所有项目的映射
    items.forEach(item => {
      itemMap.set(item.path, {
        ...item,
        type: item.directory ? 'folder' : 'file',
        children: []
      });
    });

    // 构建树结构
    items.forEach(item => {
      const pathParts = item.path.split('/').filter(Boolean);
      const currentPath = item.path;
      const node = itemMap.get(currentPath);

      if (pathParts.length === 1) {
        // 根级项目
        tree.push(node);
      } else {
        // 子项目，找到父项目并添加到其children中
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        const parent = itemMap.get(parentPath);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return tree;
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8080/api/filesystem/items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          loadLocalFiles();
          return;
        }
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      const tree = buildFileTree(data);
      setFiles(tree);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error.message);
      loadLocalFiles();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLocalMode) {
      loadLocalFiles();
    } else {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocalMode]);

  const handleCreateItem = async (type, parentPath = '/') => {
    const name = prompt(type === 'folder' ? t.enterFolderName : t.enterFileName);
    if (!name) return;

    if (isLocalMode) {
      // 本地模式：直接操作 localStorage
      let tree = [];
      try {
        const data = localStorage.getItem(LOCAL_FILES_KEY);
        if (data) tree = JSON.parse(data);
      } catch {}

      // 递归查找 parentPath
      const addItem = (nodes, parentPath, item) => {
        if (parentPath === '/' || parentPath === '') {
          nodes.push(item);
          return true;
        }
        for (let node of nodes) {
          if (node.path === parentPath && node.type === 'folder') {
            node.children = node.children || [];
            node.children.push(item);
            return true;
          }
          if (node.children && addItem(node.children, parentPath, item)) return true;
        }
        return false;
      };

      const fullPath = type === 'folder'
        ? (parentPath === '/' ? `/${name}` : `${parentPath}/${name}`)
        : (parentPath === '/' ? `/${name}.md` : `${parentPath}/${name}.md`);

      const newItem = {
        id: Date.now() + Math.random(),
        name: type === 'folder' ? name : name + (name.endsWith('.md') ? '' : '.md'),
        path: fullPath,
        type: type === 'folder' ? 'folder' : 'file',
        directory: type === 'folder',
        children: type === 'folder' ? [] : undefined,
      };
      addItem(tree, parentPath, newItem);
      localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(tree));
      setFiles([...tree]);
      return;
    }

    // 云端模式：原有逻辑
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (type === 'folder') {
        const fullPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
        const response = await fetch('http://localhost:8080/api/filesystem/directories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name,
            path: fullPath
          })
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed');
          }
          throw new Error('Failed to create directory');
        }
        await fetchFiles();
      } else {
        const fullPath = parentPath === '/' ? `/${name}.md` : `${parentPath}/${name}.md`;
        const response = await fetch('http://localhost:8080/api/filesystem/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name,
            path: fullPath,
            content: ''
          })
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed');
          }
          throw new Error('Failed to create file');
        }
        await fetchFiles();
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      if (error.message === 'No authentication token found') {
        alert('Please login first');
      } else if (error.message === 'Authentication failed') {
        alert('Authentication failed. Please login again');
      } else {
        alert(`Failed to create ${type}`);
      }
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
            {item.children.map(child => renderTreeItem(child))}
            <div className="tree-item-actions">
              <button onClick={() => handleCreateItem('file', item.path)}>{t.newFile}</button>
              <button onClick={() => handleCreateItem('folder', item.path)}>{t.newFolder}</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="file-tree">{t.loading}</div>;
  }

  if (error && !isLocalMode) {
    return <div className="file-tree">{t.error}: {error}</div>;
  }

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h3>{t.files}</h3>
        <span style={{
          marginLeft: 12,
          padding: '2px 10px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          background: isLocalMode ? '#ffe082' : '#e3f2fd',
          color: isLocalMode ? '#b26a00' : '#1976d2',
          border: isLocalMode ? '1px solid #ffd54f' : '1px solid #90caf9',
          verticalAlign: 'middle'
        }}>
          {isLocalMode ? t.localMode : t.cloudMode}
        </span>
        <div className="file-tree-actions">
          <button onClick={() => handleCreateItem('file')}>{t.newFile}</button>
          <button onClick={() => handleCreateItem('folder')}>{t.newFolder}</button>
        </div>
      </div>
      <div className="tree-items">
        {files.map(item => renderTreeItem(item))}
        {files.length === 0 && (
          <div className="tree-item-actions">
            <button onClick={() => handleCreateItem('file')}>{t.newFile}</button>
            <button onClick={() => handleCreateItem('folder')}>{t.newFolder}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileTree; 