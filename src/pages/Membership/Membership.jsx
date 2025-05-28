import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { lang } from '../../i18n/lang';
import { tokenManager } from '../../services/api';

const MembershipContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const Title = styled.h1`
  font-size: 36px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 600px;
  margin: 0 auto;
`;

const PlansContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
`;

const PlanCard = styled.div`
  background: ${({ theme, $isPremium }) => $isPremium ? theme.primary : theme.card};
  color: ${({ theme, $isPremium }) => $isPremium ? '#fff' : theme.text};
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
  }

  ${({ $isPremium }) => $isPremium && `
    &::before {
      content: '推荐';
      position: absolute;
      top: 12px;
      right: -30px;
      background: #ffd700;
      color: #000;
      padding: 4px 40px;
      transform: rotate(45deg);
      font-size: 14px;
      font-weight: bold;
    }
  `}
`;

const PlanName = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
`;

const PlanPrice = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 24px;

  span {
    font-size: 16px;
    font-weight: normal;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme, $isPremium }) => $isPremium ? 'rgba(255,255,255,0.1)' : theme.border};
  display: flex;
  align-items: center;
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }

  svg {
    color: ${({ theme, $isPremium }) => $isPremium ? '#fff' : theme.primary};
  }
`;

const UpgradeButton = styled.button`
  background: ${({ theme, $isPremium }) => $isPremium ? '#fff' : theme.primary};
  color: ${({ theme, $isPremium }) => $isPremium ? theme.primary : '#fff'};
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ComparisonTable = styled.div`
  margin-top: 64px;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  padding: 32px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};

  &:first-child {
    font-weight: 500;
  }
`;

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function Membership({ language }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const t = lang[language];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleUpgrade = async () => {
    try {
      // 这里添加升级会员的 API 调用
      const response = await fetch('http://localhost:8080/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to upgrade membership');

      // 更新本地用户信息
      const updatedUser = { ...user, isPremium: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert(t.upgradeSuccess || 'Successfully upgraded to premium!');
    } catch (error) {
      alert(error.message);
    }
  };

  if (isLoading) {
    return (
      <MembershipContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {t.loading || 'Loading...'}
        </div>
      </MembershipContainer>
    );
  }

  return (
    <MembershipContainer>
      <Header>
        <Title>{t.membershipTitle || 'Choose Your Plan'}</Title>
        <Subtitle>
          {t.membershipSubtitle || 'Upgrade to premium to unlock all features and get unlimited access to all tools.'}
        </Subtitle>
      </Header>

      <PlansContainer>
        <PlanCard>
          <PlanName>{t.freePlan || 'Free Plan'}</PlanName>
          <PlanPrice>
            ¥0<span>/{t.month || 'month'}</span>
          </PlanPrice>
          <FeatureList>
            <FeatureItem>
              <CheckIcon />
              {t.freeFeature1 || 'Basic Markdown Editor'}
            </FeatureItem>
            <FeatureItem>
              <CheckIcon />
              {t.freeFeature2 || 'Basic File Management'}
            </FeatureItem>
            <FeatureItem>
              <CheckIcon />
              {t.freeFeature3 || 'Standard Support'}
            </FeatureItem>
            <FeatureItem>
              <CrossIcon />
              {t.premiumFeature1 || 'Advanced Features'}
            </FeatureItem>
            <FeatureItem>
              <CrossIcon />
              {t.premiumFeature2 || 'Priority Support'}
            </FeatureItem>
          </FeatureList>
          <UpgradeButton
            onClick={() => handleUpgrade()}
            disabled={user?.isPremium}
          >
            {user?.isPremium ? t.currentPlan || 'Current Plan' : t.upgrade || 'Upgrade to Premium'}
          </UpgradeButton>
        </PlanCard>

        <PlanCard $isPremium>
          <PlanName>{t.premiumPlan || 'Premium Plan'}</PlanName>
          <PlanPrice>
            ¥29<span>/{t.month || 'month'}</span>
          </PlanPrice>
          <FeatureList>
            <FeatureItem $isPremium>
              <CheckIcon />
              {t.premiumFeature1 || 'Advanced Markdown Editor'}
            </FeatureItem>
            <FeatureItem $isPremium>
              <CheckIcon />
              {t.premiumFeature2 || 'Unlimited File Storage'}
            </FeatureItem>
            <FeatureItem $isPremium>
              <CheckIcon />
              {t.premiumFeature3 || 'Priority Support'}
            </FeatureItem>
            <FeatureItem $isPremium>
              <CheckIcon />
              {t.premiumFeature4 || 'Custom Themes'}
            </FeatureItem>
            <FeatureItem $isPremium>
              <CheckIcon />
              {t.premiumFeature5 || 'API Access'}
            </FeatureItem>
          </FeatureList>
          <UpgradeButton
            $isPremium
            onClick={() => handleUpgrade()}
            disabled={user?.isPremium}
          >
            {user?.isPremium ? t.currentPlan || 'Current Plan' : t.upgrade || 'Upgrade Now'}
          </UpgradeButton>
        </PlanCard>
      </PlansContainer>

      <ComparisonTable>
        <Table>
          <thead>
            <tr>
              <TableHeader>{t.feature || 'Feature'}</TableHeader>
              <TableHeader>{t.freePlan || 'Free Plan'}</TableHeader>
              <TableHeader>{t.premiumPlan || 'Premium Plan'}</TableHeader>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TableCell>{t.storage || 'Storage'}</TableCell>
              <TableCell>1GB</TableCell>
              <TableCell>{t.unlimited || 'Unlimited'}</TableCell>
            </tr>
            <tr>
              <TableCell>{t.fileSize || 'Max File Size'}</TableCell>
              <TableCell>10MB</TableCell>
              <TableCell>100MB</TableCell>
            </tr>
            <tr>
              <TableCell>{t.support || 'Support'}</TableCell>
              <TableCell>{t.standardSupport || 'Standard'}</TableCell>
              <TableCell>{t.prioritySupport || 'Priority'}</TableCell>
            </tr>
            <tr>
              <TableCell>{t.themes || 'Custom Themes'}</TableCell>
              <TableCell>{t.no || 'No'}</TableCell>
              <TableCell>{t.yes || 'Yes'}</TableCell>
            </tr>
            <tr>
              <TableCell>{t.apiAccess || 'API Access'}</TableCell>
              <TableCell>{t.no || 'No'}</TableCell>
              <TableCell>{t.yes || 'Yes'}</TableCell>
            </tr>
          </tbody>
        </Table>
      </ComparisonTable>
    </MembershipContainer>
  );
}

export default Membership; 