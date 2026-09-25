import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffCrmLayout from './staff/StaffCrmLayout';
import StaffContactsList from './staff/StaffContactsList';
import StaffContactDetail from './staff/StaffContactDetail';
import StaffDealsList from './staff/StaffDealsList';
import StaffDealDetail from './staff/StaffDealDetail';
import StaffCustomerDocumentDetail from './staff/StaffCustomerDocumentDetail';
import StaffTicketsList from './staff/StaffTicketsList';
import StaffTicketDetail from './staff/StaffTicketDetail';
import StaffTasksList from './staff/StaffTasksList';
import StaffTaskDetail from './staff/StaffTaskDetail';

import AdminOverviewTab from './admin/AdminOverviewTab';
import AdminQuotesTab from './admin/AdminQuotesTab';
import AdminAccountsTab from './admin/AdminAccountsTab';
import AdminDealsTab from './admin/AdminDealsTab';
import AdminCommissionTab from './admin/AdminCommissionTab';
import AdminSystemTab from './admin/AdminSystemTab';

import {
  MOCK_CONTACTS,
  SAMPLE_CONTACTS,
  CONTACT_DETAIL_DATA,
  DEAL_DETAIL_DATA,
  CUSTOMER_DOCUMENT_DATA,
} from '../../data/mockCrmData';

import {
  INITIAL_ADMIN_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ADMIN_STATS,
  INITIAL_ADMIN_QUOTES,
  INITIAL_ADMIN_DEALS,
  INITIAL_ADMIN_COMMISSIONS,
} from '../../data/mockAdminAccounts';

import {
  getAdminStats,
  getAdminAccounts,
  getDeals,
  getAdminQuotes,
  getCommissions,
  getAdminAuditLogs,
  checkBackendHealth,
  getContact,
  getDeal,
  getDocument,
  updateDeal as apiUpdateDeal,
  getTicket,
  getTask,
} from '../../services/api';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab state: 'overview' | 'contacts' | 'deals' | 'tickets' | 'tasks' | 'quotes' | 'accounts' | 'commissions' | 'system'
  const [activeTab, setActiveTab] = useState('overview');
  // Current View state: 'overview' | 'contacts-list' | 'contact-detail' | 'deals-list' | 'deal-detail' | 'customer-document-detail' | 'tickets-list' | 'ticket-detail' | 'tasks-list' | 'task-detail' | 'quotes' | 'accounts' | 'commissions' | 'system'
  const [currentView, setCurrentView] = useState('overview');
  // Sub-view mode for Deals in Admin: 'pipeline' (Kanban/Table) | 'governance' (Master Deals AOR)
  const [dealsViewMode, setDealsViewMode] = useState('pipeline');

  // Selected Entities
  const [selectedContact, setSelectedContact] = useState(CONTACT_DETAIL_DATA);
  const [selectedDeal, setSelectedDeal] = useState(DEAL_DETAIL_DATA);
  const [selectedDocument, setSelectedDocument] = useState(CUSTOMER_DOCUMENT_DATA);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Administrative Data states
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'offline'
  const [stats, setStats] = useState(INITIAL_ADMIN_STATS);
  const [accounts, setAccounts] = useState(INITIAL_ADMIN_ACCOUNTS);
  const [deals, setDeals] = useState(INITIAL_ADMIN_DEALS);
  const [quotes, setQuotes] = useState(INITIAL_ADMIN_QUOTES);
  const [commissions, setCommissions] = useState(INITIAL_ADMIN_COMMISSIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // ── Sync state with URL path ───────────────────────────────────────────────
  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/dashboard/admin/tickets/')) {
      const parts = path.split('/dashboard/admin/tickets/');
      const ticketId = parts[1];
      if (ticketId) {
        getTicket(ticketId)
          .then((res) => { if (res) setSelectedTicket(res); })
          .catch(() => {});
      }
      setActiveTab('tickets');
      setCurrentView('ticket-detail');
    } else if (path.endsWith('/dashboard/admin/tickets') || path.endsWith('/dashboard/admin/tickets/')) {
      setActiveTab('tickets');
      setCurrentView('tickets-list');
    } else if (path.includes('/dashboard/admin/tasks/')) {
      const parts = path.split('/dashboard/admin/tasks/');
      const taskId = parts[1];
      if (taskId) {
        getTask(taskId)
          .then((res) => { if (res) setSelectedTask(res); })
          .catch(() => {});
      }
      setActiveTab('tasks');
      setCurrentView('task-detail');
    } else if (path.endsWith('/dashboard/admin/tasks') || path.endsWith('/dashboard/admin/tasks/')) {
      setActiveTab('tasks');
      setCurrentView('tasks-list');
    } else if (path.includes('/dashboard/admin/documents/')) {
      const parts = path.split('/dashboard/admin/documents/');
      const docId = parts[1];
      if (docId) {
        getDocument(docId)
          .then((res) => { if (res) setSelectedDocument((prev) => ({ ...prev, ...res })); })
          .catch(() => {});
      }
      setActiveTab('contacts');
      setCurrentView('customer-document-detail');
    } else if (path.includes('/dashboard/admin/deals/')) {
      const parts = path.split('/dashboard/admin/deals/');
      const dealId = parts[1];
      if (dealId) {
        getDeal(dealId)
          .then((res) => { if (res) setSelectedDeal((prev) => ({ ...prev, ...res })); })
          .catch(() => {});
      }
      setActiveTab('deals');
      setCurrentView('deal-detail');
    } else if (path.endsWith('/dashboard/admin/deals') || path.endsWith('/dashboard/admin/deals/')) {
      setActiveTab('deals');
      setCurrentView('deals-list');
    } else if (path.includes('/dashboard/admin/contacts/')) {
      const parts = path.split('/dashboard/admin/contacts/');
      const contactId = parts[1];
      if (contactId) {
        getContact(contactId)
          .then((data) => { if (data) handleSelectContact(data, false); })
          .catch(() => {
            const found = SAMPLE_CONTACTS.find((c) => c.id === contactId || c.code === contactId);
            if (found) handleSelectContact(found, false);
          });
      }
      setActiveTab('contacts');
      setCurrentView('contact-detail');
    } else if (path.endsWith('/dashboard/admin/contacts') || path.endsWith('/dashboard/admin/contacts/')) {
      setActiveTab('contacts');
      setCurrentView('contacts-list');
    } else if (path.endsWith('/dashboard/admin/quotes') || path.endsWith('/dashboard/admin/quotes/')) {
      setActiveTab('quotes');
      setCurrentView('quotes');
    } else if (path.endsWith('/dashboard/admin/accounts') || path.endsWith('/dashboard/admin/accounts/')) {
      setActiveTab('accounts');
      setCurrentView('accounts');
    } else if (
      path.endsWith('/dashboard/admin/commissions') ||
      path.endsWith('/dashboard/admin/commission') ||
      path.endsWith('/dashboard/admin/analytics')
    ) {
      setActiveTab('commissions');
      setCurrentView('commissions');
    } else if (
      path.endsWith('/dashboard/admin/system') ||
      path.endsWith('/dashboard/admin/settings')
    ) {
      setActiveTab('system');
      setCurrentView('system');
    } else {
      setActiveTab('overview');
      setCurrentView('overview');
    }
  }, [location.pathname]);

  // ── Load backend data ──────────────────────────────────────────────────────
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

  // ── Tab Selection Handlers ─────────────────────────────────────────────────
  function handleSelectTab(tabId) {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      setCurrentView('overview');
      navigate('/dashboard/admin');
    } else if (tabId === 'contacts') {
      setCurrentView('contacts-list');
      navigate('/dashboard/admin/contacts');
    } else if (tabId === 'deals') {
      setCurrentView('deals-list');
      navigate('/dashboard/admin/deals');
    } else if (tabId === 'tickets') {
      setCurrentView('tickets-list');
      navigate('/dashboard/admin/tickets');
    } else if (tabId === 'tasks') {
      setCurrentView('tasks-list');
      navigate('/dashboard/admin/tasks');
    } else if (tabId === 'quotes') {
      setCurrentView('quotes');
      navigate('/dashboard/admin/quotes');
    } else if (tabId === 'accounts') {
      setCurrentView('accounts');
      navigate('/dashboard/admin/accounts');
    } else if (tabId === 'commissions') {
      setCurrentView('commissions');
      navigate('/dashboard/admin/commissions');
    } else if (tabId === 'system') {
      setCurrentView('system');
      navigate('/dashboard/admin/system');
    }
  }

  // ── Contact Handlers ───────────────────────────────────────────────────────
  function handleSelectContact(contact, updateUrl = true) {
    const p = contact.primary || {};
    let firstName = contact.firstName || p.firstName;
    let middleName = contact.middleName || p.middleName || '';
    let lastName = contact.lastName || p.lastName;

    if (!firstName && !lastName && contact.fullName) {
      const parts = contact.fullName.trim().split(/\s+/);
      if (parts.length === 1) { firstName = parts[0]; lastName = ''; }
      else if (parts.length === 2) { firstName = parts[0]; lastName = parts[1]; }
      else { firstName = parts.slice(0, -1).join(' '); lastName = parts[parts.length - 1]; }
    }

    const mergedContact = {
      ...CONTACT_DETAIL_DATA,
      ...contact,
      firstName: firstName || 'Nhat Huu Tuan',
      middleName: middleName || '',
      lastName: lastName || 'Dang',
      fullName: contact.fullName || [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Nhat Huu Tuan Dang',
      primary: {
        ...(CONTACT_DETAIL_DATA.primary || {}),
        ...(contact.primary || {}),
        firstName: firstName || 'Nhat Huu Tuan',
        middleName: middleName || '',
        lastName: lastName || 'Dang',
      },
      sourceOfLead: {
        ...(CONTACT_DETAIL_DATA.sourceOfLead || {}),
        ...(contact.sourceOfLead || {}),
        howDoYouKnowUs: contact.howDoYouKnowUs || (contact.sourceOfLead?.howDoYouKnowUs || '---'),
        whoReferClient: contact.whoReferClient || (contact.sourceOfLead?.whoReferClient || ''),
        contactOwner: contact.contactOwner?.name || contact.contactOwner || CONTACT_DETAIL_DATA.sourceOfLead.contactOwner,
        supportAgent: contact.supportAgent || CONTACT_DETAIL_DATA.sourceOfLead.supportAgent,
      },
      initials: (contact.fullName || 'ND')
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    };

    setSelectedContact(mergedContact);
    setActiveTab('contacts');
    setCurrentView('contact-detail');
    if (updateUrl && location.pathname !== `/dashboard/admin/contacts/${contact.id}`) {
      navigate(`/dashboard/admin/contacts/${contact.id}`, { replace: false });
    }
  }

  // ── Deal Handlers ──────────────────────────────────────────────────────────
  function handleSelectDeal(deal) {
    setSelectedDeal({ ...DEAL_DETAIL_DATA, ...(deal || {}) });
    setActiveTab('deals');
    setCurrentView('deal-detail');
    navigate(`/dashboard/admin/deals/${deal?.id || 'D26005033'}`, { replace: false });
  }

  // ── Document Handler ───────────────────────────────────────────────────────
  function handleSelectCustomerDocument(doc) {
    setSelectedDocument({ ...CUSTOMER_DOCUMENT_DATA, ...(doc || {}) });
    setActiveTab('contacts');
    setCurrentView('customer-document-detail');
    navigate(`/dashboard/admin/documents/${doc?.id || 'DOC-01'}`, { replace: false });
  }

  // ── Ticket Handlers ────────────────────────────────────────────────────────
  function handleSelectTicket(ticket) {
    setSelectedTicket(ticket);
    setActiveTab('tickets');
    setCurrentView('ticket-detail');
    navigate(`/dashboard/admin/tickets/${ticket?.id || ticket}`, { replace: false });
  }

  // ── Task Handlers ──────────────────────────────────────────────────────────
  function handleSelectTask(task) {
    setSelectedTask(task);
    setActiveTab('tasks');
    setCurrentView('task-detail');
    navigate(`/dashboard/admin/tasks/${task?.id || task}`, { replace: false });
  }

  // ── Back Navigation Handlers ───────────────────────────────────────────────
  function handleBackToContacts() {
    setActiveTab('contacts');
    setCurrentView('contacts-list');
    navigate('/dashboard/admin/contacts', { replace: false });
  }

  function handleBackToContactDetail() {
    setActiveTab('contacts');
    setCurrentView('contact-detail');
    navigate(`/dashboard/admin/contacts/${selectedContact?.id || 'CT26002600'}`, { replace: false });
  }

  function handleBackFromDeal() {
    if (activeTab === 'deals') {
      setCurrentView('deals-list');
      navigate('/dashboard/admin/deals', { replace: false });
    } else {
      handleBackToContactDetail();
    }
  }

  function handleBackFromTicket() {
    setActiveTab('tickets');
    setCurrentView('tickets-list');
    navigate('/dashboard/admin/tickets', { replace: false });
  }

  function handleBackFromTask() {
    setActiveTab('tasks');
    setCurrentView('tasks-list');
    navigate('/dashboard/admin/tasks', { replace: false });
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
      {/* ── Overview Cockpit ──────────────────────────────────────────────── */}
      {currentView === 'overview' && (
        <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
          <AdminOverviewTab
            stats={stats}
            accounts={accounts}
            deals={deals}
            quotes={quotes}
            commissions={commissions}
            dbStatus={dbStatus}
            onNavigateTab={handleSelectTab}
          />
        </div>
      )}

      {/* ── Operational Contacts Views ────────────────────────────────────── */}
      {currentView === 'contacts-list' && (
        <StaffContactsList onSelectContact={handleSelectContact} />
      )}

      {currentView === 'contact-detail' && (
        <StaffContactDetail
          contact={selectedContact}
          onBack={handleBackToContacts}
          onSelectDeal={handleSelectDeal}
          onSelectCustomerDocument={handleSelectCustomerDocument}
          onSelectTicket={handleSelectTicket}
          onSelectTask={handleSelectTask}
          onUpdateContact={(updated) => {
            setSelectedContact((prev) => ({ ...prev, ...updated }));
          }}
        />
      )}

      {/* ── Customer Documents Detail View ────────────────────────────────── */}
      {currentView === 'customer-document-detail' && (
        <StaffCustomerDocumentDetail
          documentData={selectedDocument}
          onBack={handleBackToContactDetail}
          onSelectContact={() => handleSelectContact(selectedContact)}
          onSelectDeal={() => handleSelectDeal(selectedDeal)}
        />
      )}

      {/* ── Deals Workspace Views ─────────────────────────────────────────── */}
      {currentView === 'deals-list' && (
        <div className="flex flex-col flex-grow">
          {/* Sub-tab switcher: Pipeline vs Governance */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">
                admin_panel_settings
              </span>
              <span className="text-xs font-bold text-slate-800">Deals Operations &amp; Governance:</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDealsViewMode('pipeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  dealsViewMode === 'pipeline'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                <span>Pipeline Deals (Kanban &amp; Table)</span>
              </button>
              <button
                type="button"
                onClick={() => setDealsViewMode('governance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  dealsViewMode === 'governance'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
                <span>Master Deals &amp; AOR Governance</span>
              </button>
            </div>
          </div>

          {dealsViewMode === 'pipeline' ? (
            <StaffDealsList
              onSelectDeal={handleSelectDeal}
              onSelectContact={handleSelectContact}
            />
          ) : (
            <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
              <AdminDealsTab
                deals={deals}
                onRefresh={loadData}
                onSelectDeal={handleSelectDeal}
              />
            </div>
          )}
        </div>
      )}

      {currentView === 'deal-detail' && (
        <StaffDealDetail
          deal={selectedDeal}
          onBack={handleBackFromDeal}
          onSelectContact={() => handleSelectContact(selectedContact)}
          onSelectCustomerDocument={handleSelectCustomerDocument}
          onSelectTicket={handleSelectTicket}
          onSelectTask={handleSelectTask}
          onUpdateDeal={(updated) => {
            setSelectedDeal((prev) => ({ ...prev, ...updated }));
            if (updated?.id) {
              apiUpdateDeal(updated.id, updated).catch((err) =>
                console.warn('[AdminDashboard] Could not persist deal update:', err)
              );
            }
          }}
        />
      )}

      {/* ── Operational Tickets Views ─────────────────────────────────────── */}
      {currentView === 'tickets-list' && (
        <StaffTicketsList
          onSelectTicket={handleSelectTicket}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {currentView === 'ticket-detail' && (
        <StaffTicketDetail
          ticket={selectedTicket}
          onBack={handleBackFromTicket}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
          onUpdateTicket={(updated) => {
            setSelectedTicket((prev) => ({ ...prev, ...updated }));
            if (updated?.pipeline === 'ACA account' && updated?.status) {
              setSelectedContact((prev) => ({
                ...prev,
                acaAccountStatus: updated.status,
                acaAccount: {
                  ...(prev?.acaAccount || {}),
                  acaAccountStatus: updated.status,
                  status: updated.status,
                },
              }));
            }
          }}
        />
      )}

      {/* ── Operational Tasks Views ───────────────────────────────────────── */}
      {currentView === 'tasks-list' && (
        <StaffTasksList
          onSelectTask={handleSelectTask}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {currentView === 'task-detail' && (
        <StaffTaskDetail
          task={selectedTask}
          onBack={handleBackFromTask}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
          onSelectTicket={handleSelectTicket}
        />
      )}

      {/* ── Match Queue / Inquiries View ──────────────────────────────────── */}
      {currentView === 'quotes' && (
        <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
          <AdminQuotesTab
            quotes={quotes}
            accounts={accounts}
            onRefresh={loadData}
          />
        </div>
      )}

      {/* ── User & NPN Accounts View ──────────────────────────────────────── */}
      {currentView === 'accounts' && (
        <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
          <AdminAccountsTab
            accounts={accounts}
            onRefresh={loadData}
          />
        </div>
      )}

      {/* ── Master Commission Ledger View (All Agents) ────────────────────── */}
      {currentView === 'commissions' && (
        <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
          <AdminCommissionTab
            commissions={commissions}
            accounts={accounts}
            onRefresh={loadData}
          />
        </div>
      )}

      {/* ── System Infrastructure & Audit Logs View ───────────────────────── */}
      {currentView === 'system' && (
        <div className="flex-grow p-3.5 sm:p-4 lg:p-8 max-w-[1700px] mx-auto w-full">
          <AdminSystemTab
            auditLogs={auditLogs}
            dbStatus={dbStatus}
            onRefresh={loadData}
          />
        </div>
      )}
    </StaffCrmLayout>
  );
}
