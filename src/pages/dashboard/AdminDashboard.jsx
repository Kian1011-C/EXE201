import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
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
  const { user, logout } = useAuth();
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

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const NAV_TABS = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'dashboard',
      desc: 'KPI Cockpit & Health',
    },
    {
      id: 'quotes',
      label: 'Match Queue',
      icon: 'contact_support',
      badge: quotes.filter((q) => q.status === 'New Inquiry').length || '14',
      badgeColor: 'bg-rose-500 text-white',
      desc: 'Consumer lead dispatch',
    },
    {
      id: 'accounts',
      label: 'Accounts & NPN',
      icon: 'manage_accounts',
      badge: accounts.filter((a) => a.role === 'agent' && a.status.includes('Pending')).length || '1',
      badgeColor: 'bg-amber-500 text-white',
      desc: 'Staff & Agent roster',
    },
    {
      id: 'deals',
      label: 'Master Deals & NPN',
      icon: 'handshake',
      desc: 'Agency AOR & SSS rules',
    },
    {
      id: 'commissions',
      label: 'Commission Ledger',
      icon: 'payments',
      desc: 'SSS split settlement',
    },
    {
      id: 'system',
      label: 'System & Audit',
      icon: 'terminal',
      desc: 'Docker, Postgres, Logs',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-rose-100 selection:text-rose-950">
      {/* ── Top Bar Header ─────────────────────────────────────────────── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-2xs">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard/admin" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <img
                src="/images/insurmatch-logo.png"
                alt="InsurMatch"
                className="w-8 h-8 object-contain rounded-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white ring-1 ring-rose-500/20" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-[14px] font-black tracking-tight text-slate-900">
                  INSUR<span className="text-blue-600 font-extrabold">MATCH</span>
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border tracking-wide uppercase bg-rose-50 text-rose-700 border-rose-200 shadow-2xs">
                  Administrator 👑
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
                Platform Operations &amp; Agency Governance
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Quick Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs">
            <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-medium font-mono">{dbStatus === 'connected' ? 'DB Online' : 'DB Standby'}</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Live Data"
          >
            <span className={`material-symbols-outlined text-[20px] ${refreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>View Public Site</span>
          </Link>

          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* User profile avatar & logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.avatar || 'SA'}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition px-2 py-1 rounded-md hover:bg-rose-50 cursor-pointer"
              title="Sign Out"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="material-symbols-outlined sm:hidden text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Secondary Navigation Bar (Segmented Tabs) ───────────────────── */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-8 py-2 sticky top-14 z-30 shadow-2xs overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
        <div className="flex items-center gap-1.5 min-w-max">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-slate-900' : tab.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <main className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-7xl mx-auto w-full">
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
      </main>
    </div>
  );
}
