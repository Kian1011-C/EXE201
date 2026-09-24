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
import AgentCommissionLedger from './agent/AgentCommissionLedger';
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

export default function AgentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Current view: 'dashboard' | 'contacts' | 'contact-detail' | 'deals' | 'deal-detail' | 'customer-document-detail' | 'commission' | 'tickets' | 'tasks'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState(CONTACT_DETAIL_DATA);
  const [selectedDeal, setSelectedDeal] = useState(DEAL_DETAIL_DATA);
  const [selectedDocument, setSelectedDocument] = useState(CUSTOMER_DOCUMENT_DATA);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dashboardMode, setDashboardMode] = useState('crm'); // 'crm' | 'priorities'

  // Sync state with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/agent/commission')) {
      setCurrentTab('commission');
      setCurrentView('commission');
    } else if (path.includes('/dashboard/agent/documents/')) {
      const parts = path.split('/dashboard/agent/documents/');
      const docId = parts[1];
      if (docId) {
        getDocument(docId)
          .then((res) => {
            if (res) setSelectedDocument((prev) => ({ ...prev, ...res }));
          })
          .catch(() => {});
      }
      setCurrentTab('contacts');
      setCurrentView('customer-document-detail');
    } else if (path.includes('/dashboard/agent/deals/')) {
      const parts = path.split('/dashboard/agent/deals/');
      const dealId = parts[1];
      if (dealId) {
        getDeal(dealId)
          .then((res) => {
            if (res) setSelectedDeal((prev) => ({ ...prev, ...res }));
          })
          .catch(() => {});
      }
      setCurrentTab('deals');
      setCurrentView('deal-detail');
    } else if (
      path.endsWith('/dashboard/agent/deals') ||
      path.endsWith('/dashboard/agent/deals/')
    ) {
      setCurrentTab('deals');
      setCurrentView('deals');
    } else if (path.includes('/dashboard/agent/contacts/')) {
      const parts = path.split('/dashboard/agent/contacts/');
      const contactId = parts[1];
      if (contactId) {
        getContact(contactId)
          .then((data) => {
            if (data) handleSelectContact(data, false);
          })
          .catch(() => {
            const found = SAMPLE_CONTACTS.find((c) => c.id === contactId || c.code === contactId);
            if (found) handleSelectContact(found, false);
          });
      }
      setCurrentTab('contacts');
      setCurrentView('contact-detail');
    } else if (
      path.endsWith('/dashboard/agent/contacts') ||
      path.endsWith('/dashboard/agent/contacts/')
    ) {
      setCurrentTab('contacts');
      setCurrentView('contacts');
    } else if (path.includes('/dashboard/agent/tickets/')) {
      const parts = path.split('/dashboard/agent/tickets/');
      const ticketId = parts[1];
      if (ticketId) {
        getTicket(ticketId)
          .then((res) => { if (res) setSelectedTicket(res); })
          .catch(() => {});
      }
      setCurrentTab('tickets');
      setCurrentView('ticket-detail');
    } else if (path.includes('/dashboard/agent/tickets')) {
      setCurrentTab('tickets');
      setCurrentView('tickets');
    } else if (path.includes('/dashboard/agent/tasks/')) {
      const parts = path.split('/dashboard/agent/tasks/');
      const taskId = parts[1];
      if (taskId) {
        getTask(taskId)
          .then((res) => { if (res) setSelectedTask(res); })
          .catch(() => {});
      }
      setCurrentTab('tasks');
      setCurrentView('task-detail');
    } else if (path.includes('/dashboard/agent/tasks')) {
      setCurrentTab('tasks');
      setCurrentView('tasks');
    } else {
      setCurrentTab('dashboard');
      setCurrentView('dashboard');
    }
  }, [location.pathname]);

  // Handlers for navigation
  function handleSelectContact(contact, updateUrl = true) {
    const p = contact.primary || {};
    let firstName = contact.firstName || p.firstName;
    let middleName = contact.middleName || p.middleName || '';
    let lastName = contact.lastName || p.lastName;

    if (!firstName && !lastName && contact.fullName) {
      const parts = contact.fullName.trim().split(/\s+/);
      if (parts.length === 1) {
        firstName = parts[0];
        lastName = '';
      } else if (parts.length === 2) {
        firstName = parts[0];
        lastName = parts[1];
      } else {
        firstName = parts.slice(0, -1).join(' ');
        lastName = parts[parts.length - 1];
      }
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
        contactOwner: contact.contactOwner?.name || contact.contactOwner || 'Khanh Nguyen (khanhnguyen31@7)',
        supportAgent: contact.supportAgent || 'Anya Nguyen (anya42@9)',
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
    if (updateUrl && location.pathname !== `/dashboard/agent/contacts/${contact.id}`) {
      navigate(`/dashboard/agent/contacts/${contact.id}`, { replace: false });
    }
  }

  function handleSelectDeal(deal) {
    setSelectedDeal({
      ...DEAL_DETAIL_DATA,
      ...(deal || {}),
    });
    setCurrentView('deal-detail');
    navigate(`/dashboard/agent/deals/${deal?.id || 'D26005033'}`, { replace: false });
  }

  function handleSelectCustomerDocument(doc) {
    setSelectedDocument({
      ...CUSTOMER_DOCUMENT_DATA,
      ...(doc || {}),
    });
    setCurrentView('customer-document-detail');
    navigate(`/dashboard/agent/documents/${doc?.id || 'DOC-01'}`, { replace: false });
  }

  function handleSelectTab(tab) {
    setCurrentTab(tab);
    if (tab === 'dashboard') {
      setCurrentView('dashboard');
      navigate('/dashboard/agent', { replace: false });
    } else if (tab === 'deals') {
      setCurrentView('deals');
      navigate('/dashboard/agent/deals', { replace: false });
    } else if (tab === 'contacts') {
      setCurrentView('contacts');
      navigate('/dashboard/agent/contacts', { replace: false });
    } else if (tab === 'commission') {
      setCurrentView('commission');
      navigate('/dashboard/agent/commission', { replace: false });
    } else if (tab === 'tickets') {
      setCurrentView('tickets');
      navigate('/dashboard/agent/tickets', { replace: false });
    } else if (tab === 'tasks') {
      setCurrentView('tasks');
      navigate('/dashboard/agent/tasks', { replace: false });
    }
  }

  function handleBackToContacts() {
    setCurrentTab('contacts');
    setCurrentView('contacts');
    navigate('/dashboard/agent/contacts', { replace: false });
  }

  function handleBackToContactDetail() {
    setCurrentView('contact-detail');
    navigate(`/dashboard/agent/contacts/${selectedContact?.id || 'CT26002600'}`, { replace: false });
  }

  function handleBackFromDeal() {
    if (currentTab === 'deals') {
      setCurrentView('deals');
      navigate('/dashboard/agent/deals', { replace: false });
    } else {
      handleBackToContactDetail();
    }
  }

  function handleSelectTicket(ticket) {
    setSelectedTicket(ticket);
    setCurrentView('ticket-detail');
    navigate(`/dashboard/agent/tickets/${ticket?.id || ticket}`, { replace: false });
  }

  function handleSelectTask(task) {
    setSelectedTask(task);
    setCurrentView('task-detail');
    navigate(`/dashboard/agent/tasks/${task?.id || task}`, { replace: false });
  }

  function handleBackFromTicket() {
    setCurrentView('tickets');
    navigate('/dashboard/agent/tickets', { replace: false });
  }

  function handleBackFromTask() {
    setCurrentView('tasks');
    navigate('/dashboard/agent/tasks', { replace: false });
  }

  return (
    <StaffCrmLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      isAgent={true}
      agentName="Khánh Nguyen"
      agentNpn="#1984210"
      showCommission={true}
    >
      {/* ── 1. DASHBOARD VIEW (With CRM & Priorities Toggle) ─────────────── */}
      {currentView === 'dashboard' && (
        <div className="flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
          {/* Top Subheader with Toggle */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Dashboard View:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDashboardMode('crm')}
                  className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                    dashboardMode === 'crm'
                      ? 'bg-white text-[#104882] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Reports &amp; CRM Charts (27 Reports)
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardMode('priorities')}
                  className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                    dashboardMode === 'priorities'
                      ? 'bg-white text-[#104882] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today's Action Cockpit
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>License #1984210 • Carrier Portals Connected</span>
            </div>
          </div>

          {/* Mode 1: Full Staff-standard CRM Dashboard */}
          {dashboardMode === 'crm' ? (
            <div className="flex-grow overflow-y-auto">
              <StaffCrmDashboard
                onSelectTab={handleSelectTab}
                onSelectDeal={handleSelectDeal}
                onSelectContact={handleSelectContact}
              />
            </div>
          ) : (
            /* Mode 2: Morning Action Cockpit for Independent Agent */
            <div className="flex-grow overflow-y-auto p-6 space-y-6 max-w-[1700px] mx-auto w-full">
              {/* 4 Action KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Customers to Follow-up</span>
                    <span className="material-symbols-outlined text-[18px] text-rose-600">phone_callback</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">4</div>
                  <div className="text-[11px] text-rose-600 font-medium mt-1">Cần liên hệ trong 24 giờ tới</div>
                </div>

                <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Today's Consultations</span>
                    <span className="material-symbols-outlined text-[18px] text-amber-600">calendar_month</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">2</div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">Zoom &amp; Phone tư vấn Medicare</div>
                </div>

                <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Upcoming Renewals</span>
                    <span className="material-symbols-outlined text-[18px] text-purple-600">autorenew</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">8</div>
                  <div className="text-[11px] text-purple-700 font-medium mt-1">Chuẩn bị trước mùa AEP &amp; OEP</div>
                </div>

                <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Active Contracts</span>
                    <span className="material-symbols-outlined text-[18px] text-blue-600">verified_user</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">214</div>
                  <div className="text-[11px] text-blue-700 font-medium mt-1">CMS &amp; State Compliance Verified</div>
                </div>
              </div>

              {/* Action Queue */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">checklist</span>
                    <h2 className="text-sm font-bold text-slate-900">Urgent Carrier Action Queue</h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">3 actions required today</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/40 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <div>
                        <div className="font-bold text-slate-900">Thang Van Nguyen (Kaiser Permanente OR)</div>
                        <div className="text-slate-500">Proof of Income verification required by Marketplace before Sep 25.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectContact({ id: 'CT26002604', fullName: 'Thang Van Nguyen' })}
                      className="px-3 py-1 rounded bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 cursor-pointer shadow-2xs"
                    >
                      Open Customer
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/40 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="font-bold text-slate-900">Phuong Trang Huynh (Humana Medicare Part C)</div>
                        <div className="text-slate-500">Review diabetic prescription Formulary Tier list changes for 2027 renewal.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectContact({ id: 'CT26002599', fullName: 'Phuong Trang Huynh' })}
                      className="px-3 py-1 rounded bg-amber-600 text-white font-semibold text-[11px] hover:bg-amber-700 cursor-pointer shadow-2xs"
                    >
                      Open Customer
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/40 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-bold text-slate-900">Nhat Huu Tuan Dang (BCBS North Carolina)</div>
                        <div className="text-slate-500">ACA Account Ready to Enroll. Check Consent &amp; Identity verification.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectContact({ id: 'CT26002600', fullName: 'Nhat Huu Tuan Dang' })}
                      className="px-3 py-1 rounded bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 cursor-pointer shadow-2xs"
                    >
                      Open Customer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. CONTACTS VIEW ────────────────────────────────────────────── */}
      {currentView === 'contacts' && (
        <StaffContactsList onSelectContact={handleSelectContact} />
      )}

      {/* ── 3. CONTACT DETAIL VIEW ──────────────────────────────────────── */}
      {currentView === 'contact-detail' && (
        <StaffContactDetail
          contact={selectedContact}
          onBack={handleBackToContacts}
          onSelectDeal={handleSelectDeal}
          onSelectCustomerDocument={handleSelectCustomerDocument}
        />
      )}

      {/* ── 4. DEALS VIEW ───────────────────────────────────────────────── */}
      {currentView === 'deals' && (
        <StaffDealsList
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
        />
      )}

      {/* ── 5. DEAL DETAIL VIEW ─────────────────────────────────────────── */}
      {currentView === 'deal-detail' && (
        <StaffDealDetail
          deal={selectedDeal}
          onBack={handleBackFromDeal}
          onSelectContact={() => handleSelectContact(selectedContact)}
          onSelectCustomerDocument={handleSelectCustomerDocument}
          onUpdateDeal={(updated) => {
            setSelectedDeal((prev) => ({ ...prev, ...updated }));
            if (updated?.id) {
              apiUpdateDeal(updated.id, updated).catch((err) =>
                console.warn('[AgentDashboard] Could not update deal:', err)
              );
            }
          }}
        />
      )}

      {/* ── 6. CUSTOMER DOCUMENT DETAIL VIEW ────────────────────────────── */}
      {currentView === 'customer-document-detail' && (
        <StaffCustomerDocumentDetail
          documentData={selectedDocument}
          onBack={handleBackToContactDetail}
          onSelectContact={() => handleSelectContact(selectedContact)}
          onSelectDeal={() => handleSelectDeal(selectedDeal)}
        />
      )}

      {/* ── 7. COMMISSION VIEW (Image media_1790171960593.png) ─────────── */}
      {currentView === 'commission' && (
        <AgentCommissionLedger onSelectContact={handleSelectContact} />
      )}

      {/* ── 8. TICKETS LIST VIEW ──────────────────────────────────────── */}
      {currentView === 'tickets' && (
        <StaffTicketsList
          onSelectTicket={handleSelectTicket}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {/* ── 8b. TICKET DETAIL VIEW ────────────────────────────────────── */}
      {currentView === 'ticket-detail' && (
        <StaffTicketDetail
          ticket={selectedTicket}
          onBack={handleBackFromTicket}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {/* ── 9. TASKS LIST VIEW ───────────────────────────────────────── */}
      {currentView === 'tasks' && (
        <StaffTasksList
          onSelectTask={handleSelectTask}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {/* ── 9b. TASK DETAIL VIEW ──────────────────────────────────────── */}
      {currentView === 'task-detail' && (
        <StaffTaskDetail
          task={selectedTask}
          onBack={handleBackFromTask}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
          onSelectTicket={handleSelectTicket}
        />
      )}
    </StaffCrmLayout>
  );
}
