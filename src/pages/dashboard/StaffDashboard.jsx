import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffCrmLayout from './staff/StaffCrmLayout';
import StaffContactsList from './staff/StaffContactsList';
import StaffContactDetail from './staff/StaffContactDetail';
import StaffDealDetail from './staff/StaffDealDetail';
import StaffDealsList from './staff/StaffDealsList';
import StaffCustomerDocumentDetail from './staff/StaffCustomerDocumentDetail';
import StaffCrmDashboard from './staff/StaffCrmDashboard';
import StaffTicketsList from './staff/StaffTicketsList';
import StaffTicketDetail from './staff/StaffTicketDetail';
import StaffTasksList from './staff/StaffTasksList';
import StaffTaskDetail from './staff/StaffTaskDetail';
import StaffCommissionView from './staff/StaffCommissionView';
import {
  MOCK_CONTACTS,
  SAMPLE_CONTACTS,
  CONTACT_DETAIL_DATA,
  DEAL_DETAIL_DATA,
  CUSTOMER_DOCUMENT_DATA,
} from '../../data/mockCrmData';
import {
  getContact,
  getDeal,
  getDocument,
  updateDeal as apiUpdateDeal,
  getTicket,
  getTask,
} from '../../services/api';

export default function StaffDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Current view: 'dashboard' | 'list' | 'contact-detail' | 'deals-list' | 'deal-detail' | 'customer-document-detail' | 'tickets-list' | 'ticket-detail' | 'tasks-list' | 'task-detail'
  const [currentTab, setCurrentTab] = useState('contacts');
  const [currentView, setCurrentView] = useState('list');
  const [selectedContact, setSelectedContact] = useState(CONTACT_DETAIL_DATA);
  const [selectedDeal, setSelectedDeal] = useState(DEAL_DETAIL_DATA);
  const [selectedDocument, setSelectedDocument] = useState(CUSTOMER_DOCUMENT_DATA);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Sync state with URL path
  useEffect(() => {
    const path = location.pathname;

    if (path.endsWith('/dashboard/staff/dashboard') || path.endsWith('/dashboard/staff/dashboard/')) {
      setCurrentTab('dashboard');
      setCurrentView('dashboard');
    } else if (path.includes('/dashboard/staff/tickets/')) {
      const parts = path.split('/dashboard/staff/tickets/');
      const ticketId = parts[1];
      if (ticketId) {
        getTicket(ticketId)
          .then((res) => { if (res) setSelectedTicket(res); })
          .catch(() => {});
      }
      setCurrentTab('tickets');
      setCurrentView('ticket-detail');
    } else if (path.endsWith('/dashboard/staff/tickets') || path.endsWith('/dashboard/staff/tickets/')) {
      setCurrentTab('tickets');
      setCurrentView('tickets-list');
    } else if (path.includes('/dashboard/staff/tasks/')) {
      const parts = path.split('/dashboard/staff/tasks/');
      const taskId = parts[1];
      if (taskId) {
        getTask(taskId)
          .then((res) => { if (res) setSelectedTask(res); })
          .catch(() => {});
      }
      setCurrentTab('tasks');
      setCurrentView('task-detail');
    } else if (path.endsWith('/dashboard/staff/tasks') || path.endsWith('/dashboard/staff/tasks/')) {
      setCurrentTab('tasks');
      setCurrentView('tasks-list');
    } else if (path.includes('/dashboard/staff/documents/')) {
      const parts = path.split('/dashboard/staff/documents/');
      const docId = parts[1];
      if (docId) {
        getDocument(docId)
          .then((res) => { if (res) setSelectedDocument((prev) => ({ ...prev, ...res })); })
          .catch(() => {});
      }
      setCurrentTab('contacts');
      setCurrentView('customer-document-detail');
    } else if (path.includes('/dashboard/staff/deals/')) {
      const parts = path.split('/dashboard/staff/deals/');
      const dealId = parts[1];
      if (dealId) {
        getDeal(dealId)
          .then((res) => { if (res) setSelectedDeal((prev) => ({ ...prev, ...res })); })
          .catch(() => {});
      }
      setCurrentTab('deals');
      setCurrentView('deal-detail');
    } else if (path.endsWith('/dashboard/staff/deals') || path.endsWith('/dashboard/staff/deals/')) {
      setCurrentTab('deals');
      setCurrentView('deals-list');
    } else if (path.endsWith('/dashboard/staff/commission') || path.endsWith('/dashboard/staff/commission/')) {
      setCurrentTab('commission');
      setCurrentView('commission-ledger');
    } else if (path.includes('/dashboard/staff/contacts/')) {
      const parts = path.split('/dashboard/staff/contacts/');
      const contactId = parts[1];
      if (contactId) {
        getContact(contactId)
          .then((data) => { if (data) handleSelectContact(data, false); })
          .catch(() => {
            const found = SAMPLE_CONTACTS.find((c) => c.id === contactId || c.code === contactId);
            if (found) handleSelectContact(found, false);
          });
      }
      setCurrentTab('contacts');
      setCurrentView('contact-detail');
    } else {
      setCurrentTab('contacts');
      setCurrentView('list');
    }
  }, [location.pathname]);

  // ── Contact Handlers ──────────────────────────────────────────────────────
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
    setCurrentView('contact-detail');
    if (updateUrl && location.pathname !== `/dashboard/staff/contacts/${contact.id}`) {
      navigate(`/dashboard/staff/contacts/${contact.id}`, { replace: false });
    }
  }

  // ── Deal Handlers ─────────────────────────────────────────────────────────
  function handleSelectDeal(deal) {
    setSelectedDeal({ ...DEAL_DETAIL_DATA, ...(deal || {}) });
    setCurrentView('deal-detail');
    navigate(`/dashboard/staff/deals/${deal?.id || 'D26005033'}`, { replace: false });
  }

  // ── Document Handler ──────────────────────────────────────────────────────
  function handleSelectCustomerDocument(doc) {
    setSelectedDocument({ ...CUSTOMER_DOCUMENT_DATA, ...(doc || {}) });
    setCurrentView('customer-document-detail');
    navigate(`/dashboard/staff/documents/${doc?.id || 'DOC-01'}`, { replace: false });
  }

  // ── Ticket Handlers ───────────────────────────────────────────────────────
  function handleSelectTicket(ticket) {
    setSelectedTicket(ticket);
    setCurrentView('ticket-detail');
    navigate(`/dashboard/staff/tickets/${ticket?.id || ticket}`, { replace: false });
  }

  // ── Task Handlers ─────────────────────────────────────────────────────────
  function handleSelectTask(task) {
    setSelectedTask(task);
    setCurrentView('task-detail');
    navigate(`/dashboard/staff/tasks/${task?.id || task}`, { replace: false });
  }

  // ── Tab Navigation ────────────────────────────────────────────────────────
  function handleSelectTab(tab) {
    setCurrentTab(tab);
    if (tab === 'dashboard') {
      setCurrentView('dashboard');
      navigate('/dashboard/staff/dashboard', { replace: false });
    } else if (tab === 'deals') {
      setCurrentView('deals-list');
      navigate('/dashboard/staff/deals', { replace: false });
    } else if (tab === 'contacts') {
      setCurrentView('list');
      navigate('/dashboard/staff', { replace: false });
    } else if (tab === 'tickets') {
      setCurrentView('tickets-list');
      navigate('/dashboard/staff/tickets', { replace: false });
    } else if (tab === 'tasks') {
      setCurrentView('tasks-list');
      navigate('/dashboard/staff/tasks', { replace: false });
    } else if (tab === 'commission') {
      setCurrentView('commission-ledger');
      navigate('/dashboard/staff/commission', { replace: false });
    }
  }

  // ── Back Navigation ───────────────────────────────────────────────────────
  function handleBackToContacts() {
    setCurrentTab('contacts');
    setCurrentView('list');
    navigate('/dashboard/staff', { replace: false });
  }

  function handleBackToContactDetail() {
    setCurrentView('contact-detail');
    navigate(`/dashboard/staff/contacts/${selectedContact?.id || 'CT26002600'}`, { replace: false });
  }

  function handleBackFromDeal() {
    if (currentTab === 'deals') {
      setCurrentView('deals-list');
      navigate('/dashboard/staff/deals', { replace: false });
    } else {
      handleBackToContactDetail();
    }
  }

  function handleBackFromTicket() {
    setCurrentView('tickets-list');
    navigate('/dashboard/staff/tickets', { replace: false });
  }

  function handleBackFromTask() {
    setCurrentView('tasks-list');
    navigate('/dashboard/staff/tasks', { replace: false });
  }

  return (
    <StaffCrmLayout currentTab={currentTab} onSelectTab={handleSelectTab} showCommission={true}>
      {currentView === 'dashboard' && (
        <StaffCrmDashboard
          onSelectTab={handleSelectTab}
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
          onSelectTicket={handleSelectTicket}
          onSelectTask={handleSelectTask}
        />
      )}

      {currentView === 'list' && (
        <StaffContactsList onSelectContact={handleSelectContact} />
      )}

      {currentView === 'deals-list' && (
        <StaffDealsList
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
        />
      )}

      {currentView === 'contact-detail' && (
        <StaffContactDetail
          contact={selectedContact}
          onBack={handleBackToContacts}
          onSelectDeal={handleSelectDeal}
          onSelectCustomerDocument={handleSelectCustomerDocument}
          onSelectTicket={handleSelectTicket}
          onSelectTask={handleSelectTask}
        />
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
                console.warn('[StaffDashboard] Could not persist deal update:', err)
              );
            }
          }}
        />
      )}

      {currentView === 'customer-document-detail' && (
        <StaffCustomerDocumentDetail
          documentData={selectedDocument}
          onBack={handleBackToContactDetail}
          onSelectContact={() => handleSelectContact(selectedContact)}
          onSelectDeal={() => handleSelectDeal(selectedDeal)}
        />
      )}

      {/* ── Tickets Views ────────────────────────────────────────────────── */}
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
        />
      )}

      {/* ── Tasks Views ──────────────────────────────────────────────────── */}
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

      {/* ── Commission View ──────────────────────────────────────────────── */}
      {currentView === 'commission-ledger' && (
        <StaffCommissionView
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
        />
      )}
    </StaffCrmLayout>
  );
}
