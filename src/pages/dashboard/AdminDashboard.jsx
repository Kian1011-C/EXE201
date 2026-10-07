import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffCrmLayout from './staff/StaffCrmLayout';
import StaffContactsList from './staff/StaffContactsList';
import StaffContactDetail from './staff/StaffContactDetail';
import StaffDealsList from './staff/StaffDealsList';
import StaffDealDetail from './staff/StaffDealDetail';
import StaffCustomerDocumentsList from './staff/StaffCustomerDocumentsList';
import StaffCustomerDocumentDetail from './staff/StaffCustomerDocumentDetail';
import StaffTicketsList from './staff/StaffTicketsList';
import StaffTicketDetail from './staff/StaffTicketDetail';
import StaffTasksList from './staff/StaffTasksList';
import StaffTaskDetail from './staff/StaffTaskDetail';

import StaffCrmDashboard from './staff/StaffCrmDashboard';
import AdminQuotesTab from './admin/AdminQuotesTab';
import AdminAccountsTab from './admin/AdminAccountsTab';
import AdminDealsTab from './admin/AdminDealsTab';
import AdminCommissionTab from './admin/AdminCommissionTab';
import AdminSystemTab from './admin/AdminSystemTab';

const INITIAL_ADMIN_STATS = { totalUsers: 0, activeDeals: 0, monthlyRevenue: 0, openTickets: 0 };
const INITIAL_ADMIN_ACCOUNTS = [];
const INITIAL_ADMIN_DEALS = [];
const INITIAL_ADMIN_QUOTES = [];
const INITIAL_ADMIN_COMMISSIONS = [];
const INITIAL_AUDIT_LOGS = [];



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
  updateContact as apiUpdateContact,
  updateDeal as apiUpdateDeal,
  getTicket,
  updateTicket as apiUpdateTicket,
  getTask,
  updateTask as apiUpdateTask,
  updateCustomerDocumentInStore,
} from '../../services/api';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab state: 'dashboard' | 'contacts' | 'deals' | 'tickets' | 'tasks' | 'quotes' | 'accounts' | 'commissions' | 'system'
  const [activeTab, setActiveTab] = useState('dashboard');
  // Current View state: 'dashboard' | 'contacts-list' | 'contact-detail' | 'deals-list' | 'deal-detail' | 'customer-document-detail' | 'tickets-list' | 'ticket-detail' | 'tasks-list' | 'task-detail' | 'quotes' | 'accounts' | 'commissions' | 'system'
  const [currentView, setCurrentView] = useState('dashboard');
  // Sub-view mode for Deals in Admin: 'pipeline' (Kanban/Table) | 'governance' (Master Deals AOR)
  const [dealsViewMode, setDealsViewMode] = useState('pipeline');

  // Selected Entities
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(({ filesByCategory: {} }));
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Navigation history stack for seamless cross-entity return
  const [navHistory, setNavHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('insurmatch_nav_history_admin');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('insurmatch_nav_history_admin', JSON.stringify(navHistory));
    } catch {
      // ignore
    }
  }, [navHistory]);

  function pushHistory() {
    setNavHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.pathname === location.pathname && last.view === currentView) {
        return prev;
      }
      return [
        ...prev,
        {
          view: currentView,
          tab: activeTab,
          pathname: location.pathname,
          contact: selectedContact,
          deal: selectedDeal,
          ticket: selectedTicket,
          task: selectedTask,
          document: selectedDocument,
        },
      ];
    });
  }

  function handleGoBack(fallbackFn) {
    if (navHistory.length > 0) {
      const last = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));

      if (last.contact) setSelectedContact(last.contact);
      if (last.deal) setSelectedDeal(last.deal);
      if (last.ticket) setSelectedTicket(last.ticket);
      if (last.task) setSelectedTask(last.task);
      if (last.document) setSelectedDocument(last.document);

      setActiveTab(last.tab);
      setCurrentView(last.view);

      if (last.pathname && last.pathname !== location.pathname) {
        navigate(last.pathname, { replace: false });
      }
      return true;
    }

    if (fallbackFn) {
      fallbackFn();
    }
    return false;
  }

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
      const parts = path?.split('/dashboard/admin/tickets/');
      const ticketId = parts[1];
      if (ticketId) {
        const cleanId = String(ticketId)?.replace(/\/$/, '');
        const dynContacts = [];
        const dynDeals = [];
        const contactTickets = [...dynContacts, ...[]].flatMap((c) => c.associatedTickets || c.tickets || []);
        const dealTickets = [...dynDeals, ...[]].flatMap((d) => d.associatedTickets || d.tickets || []);
        const allTickets = [
          ...[],
          ...[],
          ...(selectedContact?.associatedTickets || selectedContact?.tickets || []),
          ...(selectedDeal?.associatedTickets || selectedDeal?.tickets || []),
          ...contactTickets,
          ...dealTickets,
        ];
        const localFound = allTickets.find((t) => t.id === cleanId || t.code === cleanId);
        if (localFound) {
          setSelectedTicket((prev) => ({ ...localFound, ...(prev?.id === cleanId ? prev : {}) }));
        } else {
          setSelectedTicket((prev) => (prev?.id === cleanId ? prev : {
            id: cleanId,
            code: cleanId,
            title: cleanId.startsWith('TC26') ? `Ticket ACA - ${cleanId}` : `Support Ticket - ${cleanId}`,
            pipeline: cleanId?.toLowerCase().includes('upload') ? 'Upload document' : 'ACA account',
            status: 'Need Create ACA Account',
            stage: 'Need Create ACA Account (ACA account)',
            priority: 'High',
            ticketOwner: '',
            serviceAgent: 'Platform Staff',
          }));
        }
        getTicket(cleanId)
          .then((res) => { if (res) setSelectedTicket((prev) => ({ ...(prev || {}), ...res })); })
          .catch(() => {});
      }
      setActiveTab('tickets');
      setCurrentView('ticket-detail');
    } else if (path.endsWith('/dashboard/admin/tickets') || path.endsWith('/dashboard/admin/tickets/')) {
      setActiveTab('tickets');
      setCurrentView('tickets-list');
    } else if (path.includes('/dashboard/admin/tasks/')) {
      const parts = path?.split('/dashboard/admin/tasks/');
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
      const parts = path?.split('/dashboard/admin/documents/');
      const docId = parts[1];
      if (docId) {
        getDocument(docId)
          .then((res) => { if (res) setSelectedDocument((prev) => ({ ...prev, ...res })); })
          .catch(() => {});
      }
      setActiveTab('documents');
      setCurrentView('customer-document-detail');
    } else if (path.endsWith('/dashboard/admin/documents') || path.endsWith('/dashboard/admin/documents/')) {
      setActiveTab('documents');
      setCurrentView('customer-documents-list');
    } else if (path.includes('/dashboard/admin/deals/')) {
      const parts = path?.split('/dashboard/admin/deals/');
      const dealId = parts[1];
      if (dealId) {
        const allDeals = [...[], ...[]];
        const localFound = allDeals.find((d) => d.id === dealId || d.code === dealId);
        if (localFound) {
          setSelectedDeal({ ...{}, ...localFound });
        }
        getDeal(dealId)
          .then((res) => { if (res) setSelectedDeal((prev) => ({ ...{}, ...res })); })
          .catch(() => {});
      }
      setActiveTab('deals');
      setCurrentView('deal-detail');
    } else if (path.endsWith('/dashboard/admin/deals') || path.endsWith('/dashboard/admin/deals/')) {
      setActiveTab('deals');
      setCurrentView('deals-list');
    } else if (path.includes('/dashboard/admin/contacts/')) {
      const parts = path?.split('/dashboard/admin/contacts/');
      const contactId = parts[1];
      if (contactId) {
        const allContacts = [...[], ...[]];
        const localFound = allContacts.find((c) => c.id === contactId || c.code === contactId);
        if (localFound) {
          handleSelectContact(localFound, false);
        }
        getContact(contactId)
          .then((data) => { if (data) handleSelectContact(data, false); })
          .catch(() => {
            const found = allContacts.find((c) => c.id === contactId || c.code === contactId);
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
      setActiveTab('dashboard');
      setCurrentView('dashboard');
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
    setNavHistory([]);
    try {
      sessionStorage.removeItem('insurmatch_nav_history_admin');
    } catch {}
    setActiveTab(tabId === 'overview' ? 'dashboard' : tabId);
    if (tabId === 'dashboard' || tabId === 'overview') {
      setCurrentView('dashboard');
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
    } else if (tabId === 'documents') {
      setCurrentView('customer-documents-list');
      navigate('/dashboard/admin/documents');
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
    if (updateUrl) {
      pushHistory();
    }
    const p = contact.primary || {};
    let firstName = contact.firstName || p.firstName;
    let middleName = contact.middleName || p.middleName || '';
    let lastName = contact.lastName || p.lastName;

    if (!firstName && !lastName && contact.fullName) {
      const parts = contact.fullName?.trim()?.split(/\s+/);
      if (parts.length === 1) { firstName = parts[0]; lastName = ''; }
      else if (parts.length === 2) { firstName = parts[0]; lastName = parts[1]; }
      else { firstName = parts.slice(0, -1).join(' '); lastName = parts[parts.length - 1]; }
    }

    const defaultData = {
      primary: {},
      contactFields: {},
      acaAccount: {
        theBestRateEmail: '',
        acaAccountStatus: '',
        acaAccount: '',
        acaPass: '',
        acaStatusSpecial: '',
        acaAccountSpecial: '',
        acaPassSpecial: '',
        enrollCallRep: '',
      },
      sourceOfLead: {},
      associatedDeals: [],
      associatedTickets: [],
      associatedDocuments: [],
      activities: [],
      notes: [],
      tasks: [],
      members: [],
    };

    const mergedContact = {
      ...defaultData,
      ...contact,
      firstName: firstName || '',
      middleName: middleName || '',
      lastName: lastName || '',
      fullName: contact.fullName || [firstName, middleName, lastName]?.filter(Boolean).join(' ') || '',
      primary: {
        ...(defaultData.primary || {}),
        ...(contact.primary || {}),
        firstName: firstName || '',
        middleName: middleName || '',
        lastName: lastName || '',
      },
      contactFields: {
        ...(defaultData.contactFields || {}),
        ...(contact.contactFields || {}),
      },
      acaAccount: {
        ...(defaultData.acaAccount || {}),
        ...(contact.acaAccount || {}),
        acaAccountStatus: contact.acaAccountStatus || contact.acaAccount?.acaAccountStatus || '',
      },
      sourceOfLead: {
        ...(defaultData.sourceOfLead || {}),
        ...(contact.sourceOfLead || {}),
        howDoYouKnowUs: contact.howDoYouKnowUs || (contact.sourceOfLead?.howDoYouKnowUs || '---'),
        whoReferClient: contact.whoReferClient || (contact.sourceOfLead?.whoReferClient || ''),
        contactOwner: contact.contactOwner?.name || contact.contactOwner || 'The Best Rate Insurance',
      },
      initials: (contact.fullName || (firstName ? firstName[0] : 'CT'))
        ?.split(' ')
        ?.filter(Boolean)
        ?.map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    };

    // Ensure all matching deals from dynamic store and sample data are linked
    const resolvedContactId = String(contact.id || contact.code || '')?.trim();
    const resolvedContactName = String(
      mergedContact.fullName || contact.fullName || [firstName, middleName, lastName]?.filter(Boolean).join(' ') || ''
    )?.trim()?.toLowerCase();

    const existingDeals = Array.isArray(contact.associatedDeals) && contact.associatedDeals.length > 0
      ? contact.associatedDeals
      : (Array.isArray(contact.deals) && contact.deals.length > 0 ? contact.deals : []);

    const matchingLocalDeals = [...[], ...[]]?.filter((d) => {
      const dCId = String(d.contactId || d.contact?.id || d.contact?.code || '')?.trim();
      const dCName = String(d.contactName || d.contact?.fullName || d.contact?.name || '')?.trim()?.toLowerCase();
      const dTitle = String(d.title || d.dealName || '')?.trim()?.toLowerCase();
      return (
        (resolvedContactId && (dCId === resolvedContactId || dCId?.toLowerCase() === resolvedContactId?.toLowerCase())) ||
        (resolvedContactName && dCName && dCName === resolvedContactName) ||
        (resolvedContactName && (dTitle.startsWith(resolvedContactName) || dTitle.includes(resolvedContactName)))
      );
    });

    const allResolvedDeals = [...existingDeals, ...matchingLocalDeals];
    const seenDealKeys = new Set();
    const finalAssociatedDeals = allResolvedDeals?.filter((d) => {
      const key = d.id || d.code;
      if (!key || seenDealKeys.has(key)) return false;
      seenDealKeys.add(key);
      return true;
    });

    mergedContact.associatedDeals = finalAssociatedDeals;
    mergedContact.deals = finalAssociatedDeals;

    setSelectedContact(mergedContact);
    setActiveTab('contacts');
    setCurrentView('contact-detail');
    if (updateUrl && location.pathname !== `/dashboard/admin/contacts/${contact.id}`) {
      navigate(`/dashboard/admin/contacts/${contact.id}`, { replace: false });
    }
  }

  // ── Deal Handlers ──────────────────────────────────────────────────────────
  function handleSelectDeal(deal) {
    pushHistory();
    const dealWithContact = {
      ...{},
      ...(deal || {}),
      contactId: deal?.contactId || (selectedContact ? selectedContact.id || selectedContact.code : ''),
      contactName: deal?.contactName || (selectedContact ? selectedContact.fullName : ''),
      contact: deal?.contact || selectedContact,
    };
    setSelectedDeal(dealWithContact);
    setActiveTab('deals');
    setCurrentView('deal-detail');
    navigate(`/dashboard/admin/deals/${deal?.id || ''}`, { replace: false });
  }

  // ── Document Handler ───────────────────────────────────────────────────────
  function handleSelectCustomerDocument(doc) {
    pushHistory();
    const targetDoc = doc || selectedContact?.customerDocument || {
      id: `doc-${selectedContact?.id || Date.now()}`,
      name: selectedContact?.fullName || '',
      contactOwner:
        selectedContact?.contactOwner ||
        selectedContact?.leadOwner ||
        '',
      associatedContact: {
        id: selectedContact?.code || selectedContact?.id || '',
        name: selectedContact?.fullName || '',
        phone: selectedContact?.phone || '',
        email: selectedContact?.email || '',
        leadOwner:
          selectedContact?.contactOwner ||
          selectedContact?.leadOwner ||
          '',
        language: selectedContact?.language || 'Vietnamese',
      },
      filesByCategory: {
        consentFormMkp: [],
        consentFormText: [],
        identity: [],
        insuranceRecord: [],
        otherDocument: [],
        paymentInformation: [],
        tax: [],
      },
      lastModifiedTime: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      lastModifiedBy: selectedContact?.contactOwner || '',
    };
    setSelectedDocument(targetDoc);
    setActiveTab('contacts');
    setCurrentView('customer-document-detail');
    navigate(`/dashboard/admin/documents/${targetDoc?.id || 'DOC-01'}`, { replace: false });
  }

  function handleUpdateDocument(updatedDoc) {
    setSelectedDocument(updatedDoc);
    updateDocument(updatedDoc);
    if (selectedContact) {
      setSelectedContact((prev) => {
        if (!prev) return prev;
        const prevDocs = prev.customerDocuments || [];
        const idx = prevDocs.findIndex(
          (d) => d.id === updatedDoc.id || d.name === updatedDoc.name
        );
        const updatedList = idx >= 0
          ? prevDocs?.map((d, i) => (i === idx ? updatedDoc : d))
          : [updatedDoc, ...prevDocs];
        return {
          ...prev,
          customerDocument: updatedDoc,
          customerDocuments: updatedList,
        };
      });
    }
  }

  // ── Ticket Handlers ────────────────────────────────────────────────────────
  function handleSelectTicket(ticket) {
    if (!ticket) return;
    pushHistory();
    const ticketObj = typeof ticket === 'string' ? { id: ticket, code: ticket } : ticket;
    const enriched = {
      ...ticketObj,
      dealId: ticketObj.dealId || (selectedDeal ? selectedDeal.id || selectedDeal.code : ''),
      dealTitle: ticketObj.dealTitle || (selectedDeal ? selectedDeal.title : ''),
      contactId: ticketObj.contactId || (selectedContact ? selectedContact.id || selectedContact.code : ''),
      contactName: ticketObj.contactName || (selectedContact ? selectedContact.fullName : ''),
    };
    null;
    setSelectedTicket(enriched);
    setActiveTab('tickets');
    setCurrentView('ticket-detail');
    navigate(`/dashboard/admin/tickets/${enriched.id || enriched.code}`, { replace: false });
  }

  // ── Task Handlers ──────────────────────────────────────────────────────────
  function handleSelectTask(task) {
    if (!task) return;
    pushHistory();
    const enriched = {
      ...(typeof task === 'object' ? task : { id: task, title: task }),
      dealId: task?.dealId || (selectedDeal ? selectedDeal.id || selectedDeal.code : ''),
      contactId: task?.contactId || (selectedContact ? selectedContact.id || selectedContact.code : ''),
      ticketId: task?.ticketId || (selectedTicket ? selectedTicket.id || selectedTicket.code : ''),
    };
    setSelectedTask(enriched);
    setActiveTab('tasks');
    setCurrentView('task-detail');
    navigate(`/dashboard/admin/tasks/${enriched?.id || task}`, { replace: false });
  }

  // ── Back Navigation Handlers ───────────────────────────────────────────────
  function handleBackToContacts() {
    handleGoBack(() => {
      setActiveTab('contacts');
      setCurrentView('contacts-list');
      navigate('/dashboard/admin/contacts', { replace: false });
    });
  }

  function handleBackToContactDetail() {
    setActiveTab('contacts');
    setCurrentView('contact-detail');
    navigate(`/dashboard/admin/contacts/${selectedContact?.id || ''}`, { replace: false });
  }

  function handleBackToDealDetail() {
    setActiveTab('deals');
    setCurrentView('deal-detail');
    navigate(`/dashboard/admin/deals/${selectedDeal?.id || ''}`, { replace: false });
  }

  function handleBackToTicketDetail() {
    setActiveTab('tickets');
    setCurrentView('ticket-detail');
    navigate(`/dashboard/admin/tickets/${selectedTicket?.id || ''}`, { replace: false });
  }

  function handleBackFromCustomerDocument() {
    handleGoBack(() => {
      if (activeTab === 'documents') {
        setCurrentView('customer-documents-list');
        navigate('/dashboard/admin/documents', { replace: false });
      } else {
        handleBackToContactDetail();
      }
    });
  }

  function handleBackFromDeal() {
    handleGoBack(() => {
      if (
        selectedContact &&
        (
          (selectedDeal?.contactId && (selectedDeal.contactId === selectedContact.id || selectedDeal.contactId === selectedContact.code)) ||
          (selectedDeal?.contactName && (selectedContact.fullName || '')?.toLowerCase().includes(selectedDeal.contactName?.toLowerCase())) ||
          (selectedDeal?.title && (selectedContact.fullName || '')?.toLowerCase().includes(selectedDeal.title?.toLowerCase()))
        )
      ) {
        handleBackToContactDetail();
      } else {
        setActiveTab('deals');
        setCurrentView('deals-list');
        navigate('/dashboard/admin/deals', { replace: false });
      }
    });
  }

  function handleBackFromTicket() {
    handleGoBack(() => {
      if (selectedDeal && selectedDeal.id && (selectedTicket?.dealId === selectedDeal.id || selectedTicket?.dealId === selectedDeal.code)) {
        handleBackToDealDetail();
      } else if (selectedContact && selectedContact.id && (selectedTicket?.contactId === selectedContact.id || selectedTicket?.contactId === selectedContact.code)) {
        handleBackToContactDetail();
      } else {
        setActiveTab('tickets');
        setCurrentView('tickets-list');
        navigate('/dashboard/admin/tickets', { replace: false });
      }
    });
  }

  function handleBackFromTask() {
    handleGoBack(() => {
      if (selectedDeal && selectedDeal.id && (selectedTask?.dealId === selectedDeal.id || selectedTask?.dealId === selectedDeal.code)) {
        handleBackToDealDetail();
      } else if (selectedContact && selectedContact.id && (selectedTask?.contactId === selectedContact.id || selectedTask?.contactId === selectedContact.code)) {
        handleBackToContactDetail();
      } else if (selectedTicket && selectedTicket.id && (selectedTask?.ticketId === selectedTicket.id || selectedTask?.ticketId === selectedTicket.code)) {
        handleBackToTicketDetail();
      } else {
        setActiveTab('tasks');
        setCurrentView('tasks-list');
        navigate('/dashboard/admin/tasks', { replace: false });
      }
    });
  }

  return (
    <StaffCrmLayout
      isAdmin={true}
      currentTab={activeTab}
      onSelectTab={handleSelectTab}
      quotesBadge={quotes?.filter((q) => q.status === 'New Inquiry').length || '14'}
      accountsBadge={accounts?.filter((a) => a.role === 'agent' && a.status.includes('Pending')).length || '1'}
      onManualRefresh={handleManualRefresh}
      isRefreshing={refreshing}
    >
      {/* ── Dashboard Tổng (Giống Staff) ─────────────────────────────────── */}
      {(currentView === 'dashboard' || currentView === 'overview') && (
        <StaffCrmDashboard
          onSelectTab={handleSelectTab}
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
          onSelectTicket={handleSelectTicket}
          onSelectTask={handleSelectTask}
        />
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
            if (updated?.id) {
              apiUpdateContact(updated.id, updated).catch((err) =>
                console.warn('[AdminDashboard] Could not update contact:', err)
              );
            }
          }}
        />
      )}

      {/* ── Customer Documents Views ────────────────────────────────────────── */}
      {currentView === 'customer-documents-list' && (
        <StaffCustomerDocumentsList
          onSelectCustomerDocument={handleSelectCustomerDocument}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {currentView === 'customer-document-detail' && (
        <StaffCustomerDocumentDetail
          documentData={selectedDocument}
          onBack={handleBackFromCustomerDocument}
          onSelectContact={(contact) => handleSelectContact(contact || selectedContact)}
          onSelectDeal={() => handleSelectDeal(selectedDeal)}
          onUpdateDocument={handleUpdateDocument}
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
          onSelectContact={(contact) => handleSelectContact(contact || selectedContact)}
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
            if (updated?.id) {
              apiUpdateTicket(updated.id, updated).catch((err) =>
                console.warn('[AdminDashboard] Could not update ticket:', err)
              );
            }
            setSelectedContact((prev) => {
              if (!prev) return prev;
              const tList = prev.associatedTickets || prev.tickets || [];
              const nextTickets = tList?.map((t) => (t.id === updated.id || t.code === updated.code ? { ...t, ...updated } : t));
              const isAca = updated?.pipeline === 'ACA account';
              const nextContact = {
                ...prev,
                associatedTickets: nextTickets,
                tickets: nextTickets,
                ...(isAca && updated?.status ? {
                  acaAccountStatus: updated.status,
                  acaAccount: {
                    ...(prev?.acaAccount || {}),
                    acaAccountStatus: updated.status,
                    status: updated.status,
                  },
                } : {}),
              };
              null;
              return nextContact;
            });
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
          onUpdateTask={(updated) => {
            setSelectedTask((prev) => ({ ...prev, ...updated }));
            if (updated?.id) {
              apiUpdateTask(updated.id, updated).catch((err) =>
                console.warn('[AdminDashboard] Could not update task:', err)
              );
            }
          }}
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
