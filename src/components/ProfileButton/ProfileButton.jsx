import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { tokenManager } from '../../services/api';
import { lang } from '../../i18n/lang';

const ProfileButtonWrapper = styled.div`
  position: relative;
  margin-left: 16px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: white;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.text};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary}20;
  }

  &.danger {
    color: #dc3545;
    &:hover {
      background: #dc354520;
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
  margin: 4px 0;
`;

const UserInfo = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const UserName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
`;

function ProfileButton({ language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const t = lang[language];

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // 点击外部关闭下拉菜单
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    tokenManager.removeToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <ProfileButtonWrapper ref={dropdownRef}>
      <Button onClick={() => setIsOpen(!isOpen)}>
        <Avatar>{getInitials(user.name)}</Avatar>
        <span>{user.name}</span>
      </Button>
      
      {isOpen && (
        <Dropdown>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
          
          <DropdownItem onClick={() => navigate('/profile')}>
            👤 {t.profile || 'Profile'}
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>
            ⚙️ {t.settings || 'Settings'}
          </DropdownItem>
          
          <Divider />
          
          <DropdownItem className="danger" onClick={handleLogout}>
            🚪 {t.logout || 'Logout'}
          </DropdownItem>
        </Dropdown>
      )}
    </ProfileButtonWrapper>
  );
}

export default ProfileButton; 