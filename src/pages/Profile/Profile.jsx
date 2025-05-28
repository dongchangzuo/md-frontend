import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import { tokenManager } from '../../services/api';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  margin: 0 0 8px 0;
  font-size: 24px;
  color: ${({ theme }) => theme.text};
`;

const Email = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 16px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ theme }) => theme.primary};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DangerZone = styled.div`
  margin-top: 40px;
  padding: 24px;
  border: 1px solid #dc3545;
  border-radius: 8px;
  background: #dc354510;
`;

const DangerButton = styled(Button)`
  background: #dc3545;
  margin-top: 16px;
`;

function Profile({ language }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const t = lang[language];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          setFormData(prev => ({
            ...prev,
            name: parsedUser.name || '',
            email: parsedUser.email || ''
          }));
        } else {
          // If no user data is found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setMessage({ type: 'error', text: 'Failed to load user data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 这里添加更新个人资料的 API 调用
      const response = await fetch('http://localhost:8080/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getToken()}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // 更新本地存储的用户信息
      const updatedUser = { ...user, name: formData.name, email: formData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: 'success', text: t.profileUpdateSuccess || 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t.passwordsDoNotMatch || 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 这里添加更改密码的 API 调用
      const response = await fetch('http://localhost:8080/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getToken()}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) throw new Error('Failed to change password');

      setMessage({ type: 'success', text: t.passwordChangeSuccess || 'Password changed successfully' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.deleteAccountConfirm || 'Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenManager.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete account');

      localStorage.removeItem('user');
      tokenManager.removeToken();
      navigate('/login');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {t.loading || 'Loading...'}
        </div>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {t.userNotFound || 'User not found'}
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header>
        <Avatar>
          {user.name ? user.name.split(' ').map(word => word[0]).join('').toUpperCase() : '?'}
        </Avatar>
        <UserInfo>
          <Name>{user.name || t.noName}</Name>
          <Email>{user.email || t.noEmail}</Email>
        </UserInfo>
      </Header>

      {message.text && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '20px', 
          borderRadius: '6px',
          background: message.type === 'error' ? '#dc354520' : '#28a74520',
          color: message.type === 'error' ? '#dc3545' : '#28a745'
        }}>
          {message.text}
        </div>
      )}

      <Section>
        <SectionTitle>{t.profileInformation || 'Profile Information'}</SectionTitle>
        <Form onSubmit={handleProfileUpdate}>
          <FormGroup>
            <Label>{t.name || 'Name'}</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>{t.email || 'Email'}</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t.saving || 'Saving...' : t.saveChanges || 'Save Changes'}
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>{t.changePassword || 'Change Password'}</SectionTitle>
        <Form onSubmit={handlePasswordChange}>
          <FormGroup>
            <Label>{t.currentPassword || 'Current Password'}</Label>
            <Input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>{t.newPassword || 'New Password'}</Label>
            <Input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>{t.confirmPassword || 'Confirm Password'}</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t.changing || 'Changing...' : t.changePassword || 'Change Password'}
          </Button>
        </Form>
      </Section>

      <DangerZone>
        <SectionTitle style={{ color: '#dc3545' }}>{t.dangerZone || 'Danger Zone'}</SectionTitle>
        <p>{t.deleteAccountWarning || 'Once you delete your account, there is no going back. Please be certain.'}</p>
        <DangerButton onClick={handleDeleteAccount} disabled={isLoading}>
          {t.deleteAccount || 'Delete Account'}
        </DangerButton>
      </DangerZone>
    </ProfileContainer>
  );
}

export default Profile; 