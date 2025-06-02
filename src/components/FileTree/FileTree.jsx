import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FileTreeContainer = styled.div`
  width: 280px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-right: 1px solid #b2ebf2;
`;

const ContentCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #b2ebf2;
`;

const Title = styled.h1`
  color: #006064;
  text-align: left;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 28px;
    height: 28px;
    color: #00acc1;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: #00acc1;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #0097a7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TreeContainer = styled.div`
  padding: 1rem;
  overflow: auto;
  height: 100%;

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

  /* 横向滚动条样式 */
  &::-webkit-scrollbar:horizontal {
    height: 8px;
  }

  &::-webkit-scrollbar-track:horizontal {
    background: ${({ theme }) => theme.bg};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:horizontal {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:horizontal:hover {
    background: ${({ theme }) => theme.primary};
  }
`;

const TreeNode = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 0.25rem 0;
  color: #006064;

  &:hover {
    background: #e0f7fa;
  }

  &.selected {
    background: #b2ebf2;
    color: #006064;
  }
`;

const TreeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
  color: #00acc1;
`;

const TreeLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

const TreeChildren = styled.div`
  margin-left: 2rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  margin-top: 1rem;
`;

const ControlButton = styled.button`
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #00acc1;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #0097a7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

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
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 2px solid #b2ebf2;
`;

const ModalTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #006064;
  font-size: 1.2rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  font-size: 1rem;
  color: #006064;
  background: white;
  margin-bottom: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &.primary {
    background: #00acc1;
    color: white;
    &:hover {
      background: #0097a7;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  &.secondary {
    background: #e0f7fa;
    color: #006064;
    &:hover {
      background: #b2ebf2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
`;

const ContextMenu = styled.div`
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #b2ebf2;
  padding: 0.5rem;
  z-index: 1000;
  min-width: 160px;
`;

const ContextMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  color: #006064;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #e0f7fa;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #00acc1;
  }

  &.danger {
    color: #d32f2f;
    svg {
      color: #d32f2f;
    }
    &:hover {
      background: #ffebee;
    }
  }
`;

function FileTree({ onFileSelect, isLocalMode, language = 'en' }) {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [modal, setModal] = useState({ show: false, type: '', parentPath: '' });
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, path: '', type: '' });
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

  useEffect(() => {
    if (isLocalMode) {
      loadLocalFiles();
    }
  }, [isLocalMode]);

  const handleCreateItem = (type, parentPath = '/') => {
    setModal({ show: true, type, parentPath });
  };

  const handleModalSubmit = (name) => {
    if (!name) {
      setModal({ show: false, type: '', parentPath: '' });
      return;
    }

    const { type, parentPath } = modal;
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

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      path: item.path,
      type: item.type
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, path: '', type: '' });
  };

  const handleDelete = (path, type) => {
    if (!window.confirm(t.confirmDelete || 'Are you sure you want to delete this item?')) {
      return;
    }

    const deleteItem = (nodes, path) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].path === path) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && deleteItem(nodes[i].children, path)) {
          return true;
        }
      }
      return false;
    };

    const newFiles = [...files];
    if (deleteItem(newFiles, path)) {
      setFiles(newFiles);
      localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(newFiles));
      if (selectedFile?.path === path) {
        setSelectedFile(null);
      }
    }
    closeContextMenu();
  };

  // 点击其他地方时关闭右键菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const renderTreeItem = (item) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedFile?.path === item.path;

    return (
      <div key={item.id}>
        <TreeNode
          className={isSelected ? 'selected' : ''}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path);
            } else {
              setSelectedFile(item);
              onFileSelect(item);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          <TreeIcon>
            {item.type === 'folder' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            )}
          </TreeIcon>
          <TreeLabel>{item.name}</TreeLabel>
        </TreeNode>
        {item.type === 'folder' && isExpanded && (
          <TreeChildren>
            {item.children.map(child => renderTreeItem(child))}
          </TreeChildren>
        )}
      </div>
    );
  };

  return (
    <FileTreeContainer>
      <ContentCard>
        <Header>
          <Title>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            {t.files}
          </Title>
          <HeaderActions>
            <ActionButton onClick={() => handleCreateItem('file', '/')} title={t.newFile}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </ActionButton>
            <ActionButton onClick={() => handleCreateItem('folder', '/')} title={t.newFolder}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </ActionButton>
          </HeaderActions>
        </Header>

        <TreeContainer>
          {files.map(item => renderTreeItem(item))}
        </TreeContainer>

        {contextMenu.show && (
          <ContextMenu style={{ top: contextMenu.y, left: contextMenu.x }}>
            {contextMenu.type === 'folder' && (
              <>
                <ContextMenuItem onClick={() => {
                  handleCreateItem('file', contextMenu.path);
                  closeContextMenu();
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {t.newFile}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => {
                  handleCreateItem('folder', contextMenu.path);
                  closeContextMenu();
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {t.newFolder}
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem 
              className="danger"
              onClick={() => handleDelete(contextMenu.path, contextMenu.type)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {t.delete}
            </ContextMenuItem>
          </ContextMenu>
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
                  {t.cancel}
                </Button>
                <Button 
                  className="primary"
                  onClick={() => {
                    const input = document.querySelector('input');
                    handleModalSubmit(input.value);
                  }}
                >
                  {t.create}
                </Button>
              </ButtonGroup>
            </ModalContent>
          </ModalOverlay>
        )}
      </ContentCard>
    </FileTreeContainer>
  );
}

export default FileTree; 