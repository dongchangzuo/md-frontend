import { useState, useEffect, useRef } from 'react';
import { tokenManager } from '../../services/api';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';
import './FileTree.css';
import styled from 'styled-components';

// 图标组件
const FolderIcon = ({ isOpen }) => (
  <span className="tree-item-icon" style={{ color: 'var(--primary)' }}>
    {isOpen ? '📂' : '📁'}
  </span>
);

const FileIcon = () => (
  <span className="tree-item-icon" style={{ color: 'var(--text-secondary)' }}>
    📄
  </span>
);

const ChevronIcon = ({ isOpen }) => (
  <span className="tree-item-icon" style={{ 
    fontSize: '0.875rem',
    transition: 'transform 0.2s',
    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1rem',
    height: '1rem',
    marginRight: '0.25rem'
  }}>
    ▶
  </span>
);

const FileTreeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.sidebarBg};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background: ${({ theme }) => theme.hover};
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 添加模态框相关样式组件
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.sidebarBg};
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.border};
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.bg};
  margin-bottom: 16px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}20;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.primary {
    background: #333;
    color: white;
    &:hover {
      background: #444;
      transform: translateY(-1px);
    }
    &:active {
      transform: translateY(0);
    }
  }

  &.secondary {
    background: #333;
    color: white;
    &:hover {
      background: #444;
    }
  }
`;

function FileTree({ onFileSelect, isLocalMode, language = 'en' }) {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, path: '', depth: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const t = lang[language] || lang.en;
  const [modal, setModal] = useState({ show: false, type: '', parentPath: '' });

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

  // 计算文件夹深度
  const getFolderDepth = (path) => {
    if (!path || path === '/') return 0;
    return path.split('/').filter(Boolean).length;
  };

  const handleCreateItem = async (type, parentPath = '/') => {
    const depth = getFolderDepth(parentPath);
    
    if (type === 'folder' && depth >= 4) {
      alert(t.maxFolderDepthReached || 'Maximum folder depth (4) reached');
      return;
    }

    setModal({ show: true, type, parentPath });
  };

  const handleModalSubmit = async (name) => {
    if (!name) {
      setModal({ show: false, type: '', parentPath: '' });
      return;
    }

    const { type, parentPath } = modal;

    if (isLocalMode) {
      // 本地模式逻辑
      let tree = [];
      try {
        const data = localStorage.getItem(LOCAL_FILES_KEY);
        if (data) tree = JSON.parse(data);
      } catch {}

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
    } else {
      // 云端模式逻辑
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
    }

    setModal({ show: false, type: '', parentPath: '' });
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

  // 处理右键菜单
  const handleContextMenu = (e, path) => {
    e.preventDefault();
    const depth = getFolderDepth(path);
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      path: path,
      depth: depth
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, path: '', depth: 0 });
  };

  // 点击其他地方时关闭右键菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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

  const renderTreeItem = (item) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedFile?.path === item.path;
    const depth = getFolderDepth(item.path);

    return (
      <div key={item.id} className="tree-item">
        <div 
          className={`tree-item-content ${item.type} ${isSelected ? 'active' : ''}`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path);
            } else {
              setSelectedFile(item);
              onFileSelect(item);
            }
          }}
          onContextMenu={(e) => {
            if (item.type === 'folder') {
              handleContextMenu(e, item.path);
            }
          }}
        >
          {item.type === 'folder' && <ChevronIcon isOpen={isExpanded} />}
          {item.type === 'folder' ? <FolderIcon isOpen={isExpanded} /> : <FileIcon />}
          <span className="tree-item-name" title={item.name}>{item.name}</span>
        </div>
        {item.type === 'folder' && isExpanded && (
          <div className="tree-item-children">
            {item.children.map(child => renderTreeItem(child))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="file-tree loading">{t.loading}</div>;
  }

  if (error && !isLocalMode) {
    return <div className="file-tree error">{t.error}: {error}</div>;
  }

  return (
    <div className="file-tree-container">
      <div 
        ref={sidebarRef}
        className={`file-tree ${isCollapsed ? 'collapsed' : ''}`}
        style={{ width: isCollapsed ? '0' : `${sidebarWidth}px` }}
      >
        <FileTreeHeader>
          <HeaderTitle>
            <span>📁</span>
            {t.files}
          </HeaderTitle>
          <HeaderActions>
            <ActionButton 
              onClick={() => handleCreateItem('file', '/')} 
              title={t.newFile}
            >
              📄
            </ActionButton>
            <ActionButton 
              onClick={() => handleCreateItem('folder', '/')} 
              title={t.newFolder}
            >
              📁
            </ActionButton>
          </HeaderActions>
        </FileTreeHeader>
        <div className="tree-items">
          {files.map(item => renderTreeItem(item))}
        </div>
        {contextMenu.show && (
          <div 
            className="context-menu"
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000
            }}
          >
            <button onClick={() => {
              handleCreateItem('file', contextMenu.path);
              closeContextMenu();
            }}>
              {t.newFile}
            </button>
            <button 
              onClick={() => {
                handleCreateItem('folder', contextMenu.path);
                closeContextMenu();
              }}
              disabled={contextMenu.depth >= 4}
              className={contextMenu.depth >= 4 ? 'disabled' : ''}
            >
              {t.newFolder}
              {contextMenu.depth >= 4 && (
                <span className="tooltip">Maximum depth reached</span>
              )}
            </button>
          </div>
        )}
      </div>
      {!isCollapsed && (
        <div 
          className="resize-handle"
          onMouseDown={handleMouseDown}
        />
      )}
      {isCollapsed && (
        <button 
          className="expand-button"
          onClick={handleExpand}
          title={t.expandSidebar}
        >
          ▶
        </button>
      )}
      {modal.show && (
        <ModalOverlay onClick={() => setModal({ show: false, type: '', parentPath: '' })}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>
              {modal.type === 'file' ? t.newFile : t.newFolder}
            </ModalTitle>
            <Input
              type="text"
              placeholder={modal.type === 'file' ? t.enterFileName : t.enterFolderName}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleModalSubmit(e.target.value);
                } else if (e.key === 'Escape') {
                  setModal({ show: false, type: '', parentPath: '' });
                }
              }}
            />
            <ButtonGroup>
              <Button 
                className="secondary"
                onClick={() => setModal({ show: false, type: '', parentPath: '' })}
              >
                取消
              </Button>
              <Button 
                className="primary"
                onClick={() => {
                  const input = document.querySelector('input');
                  handleModalSubmit(input.value);
                }}
              >
                创建
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}

export default FileTree; 