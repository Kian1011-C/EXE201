import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffCrmLayout from './staff/StaffCrmLayout';
import {
  getAdminStats,
  getAdminAccounts,
  getDeals,
  getAdminQuotes,
  getCommissions,
  getAdminAuditLogs,
  checkBackendHealth,
} from '../../services/api';
import {
  INITIAL_ADMIN_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ADMIN_STATS,
  INITIAL_ADMIN_QUOTES,
  INITIAL_ADMIN_DEALS,
  INITIAL_ADMIN_COMMISSIONS,
} from '../../data/mockAdminAccounts';

import AdminOverviewTab from './admin/AdminOverviewTab';
import AdminQuotesTab from './admin/AdminQuotesTab';
import AdminAccountsTab from './admin/AdminAccountsTab';
import AdminDealsTab from './admin/AdminDealsTab';
import AdminCommissionTab from './admin/AdminCommissionTab';
import AdminSystemTab from './admin/AdminSystemTab';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab state: 'overview' | 'quotes' | 'accounts' | 'deals' | 'commissions' | 'system'
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'offline'

  // Data states with rich default mock data
  const [stats, setStats] = useState(INITIAL_ADMIN_STATS);
  const [accounts, setAccounts] = useState(INITIAL_ADMIN_ACCOUNTS);
  const [deals, setDeals] = useState(INITIAL_ADMIN_DEALS);
  const [quotes, setQuotes] = useState(INITIAL_ADMIN_QUOTES);
  const [commissions, setCommissions] = useState(INITIAL_ADMIN_COMMISSIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Sync state with URL path
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    if (path.endsWith('/quotes')) setActiveTab('quotes');
    else if (path.endsWith('/accounts')) setActiveTab('accounts');
    else if (path.endsWith('/deals')) setActiveTab('deals');
    else if (path.endsWith('/commissions') || path.endsWith('/analytics')) setActiveTab('commissions');
    else if (path.endsWith('/system') || path.endsWith('/settings')) setActiveTab('system');
    else setActiveTab('overview');
  }, [location.pathname]);

  // Handle Tab navigation
  function handleSelectTab(tabId) {
    setActiveTab(tabId);
    if (tabId === 'overview') navigate('/dashboard/admin');
    else navigate(`/dashboard/admin/${tabId}`);
  }

  // Load backend data
  async function loadData() {
    try {
      const [healthRes, statsRes, accsRes, dealsRes, quotesRes, commsRes, logsRes] =
        await Promise.all([
          checkBackendHealth().catch(() => ({ status: 'offline' })),
          getAdminStats().catch(() => null),
          getAdminAccounts().catch(() => null),
          getDeals().catch(() => []),
          getAdminQuotes().catch(() => null),
          getCommissions().catch(() => []),
          getAdminAuditLogs().catch(() => null),
        ]);

      setDbStatus(healthRes.status === 'ok' && healthRes.database === 'connected' ? 'connected' : 'offline');
      if (statsRes) setStats(statsRes);
      if (Array.isArray(accsRes) && accsRes.length > 0) setAccounts(accsRes);
      if (Array.isArray(dealsRes) && dealsRes.length > 0) setDeals(dealsRes);
      if (Array.isArray(quotesRes) && quotesRes.length > 0) setQuotes(quotesRes);
      if (Array.isArray(commsRes) && commsRes.length > 0) setCommissions(commsRes);
      if (Array.isArray(logsRes) && logsRes.length > 0) setAuditLogs(logsRes);
    } catch (err) {
      console.warn('[AdminDashboard] Could not fetch live data:', err);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  function handleManualRefresh() {
    setRefreshing(true);
    loadData().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  }

  return (
    <StaffCrmLayout
      isAdmin={true}
      currentTab={activeTab}
      onSelectTab={handleSelectTab}
      quotesBadge={quotes.filter((q) => q.status === 'New Inquiry').length || '14'}
      accountsBadge={accounts.filter((a) => a.role === 'agent' && a.status.includes('Pending')).length || '1'}
      onManualRefresh={handleManualRefresh}
      isRefreshing={refreshing}
    >
      <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            stats={stats}
            accounts={accounts}
            deals={deals}
            quotes={quotes}
            commissions={commissions}
            dbStatus={dbStatus}
            onNavigateTab={handleSelectTab}
          />
        )}

        {activeTab === 'quotes' && (
          <AdminQuotesTab
            quotes={quotes}
            accounts={accounts}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'accounts' && (
          <AdminAccountsTab
            accounts={accounts}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'deals' && (
          <AdminDealsTab
            deals={deals}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'commissions' && (
          <AdminCommissionTab
            commissions={commissions}
            accounts={accounts}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'system' && (
          <AdminSystemTab
            auditLogs={auditLogs}
            dbStatus={dbStatus}
            onRefresh={loadData}
          />
        )}
      </div>
    </StaffCrmLayout>
  );
}
