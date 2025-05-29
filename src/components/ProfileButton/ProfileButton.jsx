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

const PremiumBadge = styled.span`
  background: ${({ theme }) => theme.primary};
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            👤 {t.profile || 'Profile'}
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/membership')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            🎫 {t.membership || 'Membership'}
            {user.isPremium && <PremiumBadge>{t.premium || 'Premium'}</PremiumBadge>}
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            ⚙️ {t.settings || 'Settings'}
          </DropdownItem>
          
          <Divider />
          
          <DropdownItem className="danger" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            🚪 {t.logout || 'Logout'}
          </DropdownItem>
        </Dropdown>
      )}
    </ProfileButtonWrapper>
  );
}

export default ProfileButton; 