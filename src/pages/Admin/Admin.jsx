import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import { tokenManager } from '../../services/api';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-size: 16px;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-size: 16px;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  background: ${({ theme }) => theme.primary}20;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;

  &.edit {
    background: ${({ theme }) => theme.primary}20;
    color: ${({ theme }) => theme.primary};
    &:hover {
      background: ${({ theme }) => theme.primary}40;
    }
  }

  &.delete {
    background: #dc354520;
    color: #dc3545;
    &:hover {
      background: #dc354540;
    }
  }

  &.toggle {
    background: ${({ theme }) => theme.success}20;
    color: ${({ theme }) => theme.success};
    &:hover {
      background: ${({ theme }) => theme.success}40;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.active {
    background: ${({ theme }) => theme.success}20;
    color: ${({ theme }) => theme.success};
  }

  &.inactive {
    background: ${({ theme }) => theme.danger}20;
    color: ${({ theme }) => theme.danger};
  }

  &.premium {
    background: ${({ theme }) => theme.primary}20;
    color: ${({ theme }) => theme.primary};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary}20;
  }

  &.active {
    background: ${({ theme }) => theme.primary};
    color: white;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function Admin({ language }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const t = lang[language];

  useEffect(() => {
    const checkAdmin = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.isAdmin) {
        navigate('/home');
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/users?page=${currentPage}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${tokenManager.getToken()}`
        }
      });
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t.confirmDeleteUser || 'Are you sure you want to delete this user?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${tokenManager.getToken()}`
          }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getToken()}`
        },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleTogglePremium = async (userId, isPremium) => {
    try {
      await fetch(`http://localhost:8080/api/admin/users/${userId}/premium`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getToken()}`
        },
        body: JSON.stringify({ isPremium: !isPremium })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling premium status:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {t.loading || 'Loading...'}
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title>{t.adminPanel || 'Admin Panel'}</Title>
      </Header>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder={t.searchUsers || 'Search users...'}
          value={searchTerm}
          onChange={handleSearch}
        />
        <FilterSelect value={statusFilter} onChange={handleStatusChange}>
          <option value="all">{t.allUsers || 'All Users'}</option>
          <option value="active">{t.activeUsers || 'Active Users'}</option>
          <option value="inactive">{t.inactiveUsers || 'Inactive Users'}</option>
          <option value="premium">{t.premiumUsers || 'Premium Users'}</option>
        </FilterSelect>
      </SearchBar>

      <Table>
        <thead>
          <tr>
            <TableHeader>{t.name || 'Name'}</TableHeader>
            <TableHeader>{t.email || 'Email'}</TableHeader>
            <TableHeader>{t.status || 'Status'}</TableHeader>
            <TableHeader>{t.membership || 'Membership'}</TableHeader>
            <TableHeader>{t.actions || 'Actions'}</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <StatusBadge className={user.status}>
                  {user.status === 'active' ? t.active : t.inactive}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <StatusBadge className={user.isPremium ? 'premium' : ''}>
                  {user.isPremium ? t.premium : t.free}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <ActionButton
                  className="edit"
                  onClick={() => handleEditUser(user.id)}
                >
                  {t.edit || 'Edit'}
                </ActionButton>
                <ActionButton
                  className="toggle"
                  onClick={() => handleToggleStatus(user.id, user.status)}
                >
                  {user.status === 'active' ? t.deactivate : t.activate}
                </ActionButton>
                <ActionButton
                  className="toggle"
                  onClick={() => handleTogglePremium(user.id, user.isPremium)}
                >
                  {user.isPremium ? t.removePremium : t.makePremium}
                </ActionButton>
                <ActionButton
                  className="delete"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  {t.delete || 'Delete'}
                </ActionButton>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        <PageButton
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          {t.previous || 'Previous'}
        </PageButton>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <PageButton
            key={page}
            className={currentPage === page ? 'active' : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </PageButton>
        ))}
        <PageButton
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {t.next || 'Next'}
        </PageButton>
      </Pagination>
    </AdminContainer>
  );
}

export default Admin; 