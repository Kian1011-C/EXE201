import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffCrmLayout from './staff/StaffCrmLayout';
import StaffContactsList from './staff/StaffContactsList';
import StaffContactDetail from './staff/StaffContactDetail';
import StaffDealDetail from './staff/StaffDealDetail';
import StaffDealsList from './staff/StaffDealsList';
import StaffCustomerDocumentsList from './staff/StaffCustomerDocumentsList';
import StaffCustomerDocumentDetail from './staff/StaffCustomerDocumentDetail';
import StaffCrmDashboard from './staff/StaffCrmDashboard';
import StaffTicketsList from './staff/StaffTicketsList';
import StaffTicketDetail from './staff/StaffTicketDetail';
import StaffTasksList from './staff/StaffTasksList';
import StaffTaskDetail from './staff/StaffTaskDetail';
import { useAuth } from '../../auth/AuthContext';
import {
  canAgentAccessItem,
  getAgentIdentity,
  extractOwnerString,
} from '../../utils/rbac';
import AccessRestrictedCard from '../../components/AccessRestrictedCard';
import {
  MOCK_CONTACTS,
  SAMPLE_CONTACTS,
  getDynamicContacts,
  SAMPLE_DEALS,
  getDynamicDeals,
  SAMPLE_TICKETS,
  getDynamicTickets,
  addTicketToStore,
  addContactToStore,
  CONTACT_DETAIL_DATA,
  DEAL_DETAIL_DATA,
  CUSTOMER_DOCUMENT_DATA,
  updateCustomerDocumentInStore,
} from '../../data/mockCrmData';
import {
  getContact,
  getDeal,
  getDocument,
  updateContact as apiUpdateContact,
  updateDeal as apiUpdateDeal,
  getTicket,
  updateTicket as apiUpdateTicket,
  getTask,
  updateTask as apiUpdateTask,
  getTickets,
  getTasks,
  getDashboardStats,
} from '../../services/api';

export default function AgentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentAgent = getAgentIdentity(user);

  // Current view: 'dashboard' | 'contacts' | 'contact-detail' | 'deals' | 'deal-detail' | 'customer-document-detail' | 'commission' | 'tickets' | 'tasks'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState(CONTACT_DETAIL_DATA);
  const [selectedDeal, setSelectedDeal] = useState(DEAL_DETAIL_DATA);
  const [selectedDocument, setSelectedDocument] = useState(CUSTOMER_DOCUMENT_DATA);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Navigation history stack for seamless cross-entity return
  const [navHistory, setNavHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('insurmatch_nav_history_agent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('insurmatch_nav_history_agent', JSON.stringify(navHistory));
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
          tab: currentTab,
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

      setCurrentTab(last.tab);
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
        const allDeals = [...getDynamicDeals(), ...SAMPLE_DEALS];
        const localFound = allDeals.find((d) => d.id === dealId || d.code === dealId);
        if (localFound) {
          setSelectedDeal({ ...DEAL_DETAIL_DATA, ...localFound });
        }
        getDeal(dealId)
          .then((res) => {
            if (res) setSelectedDeal((prev) => ({ ...DEAL_DETAIL_DATA, ...res }));
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
        const allContacts = [...getDynamicContacts(), ...SAMPLE_CONTACTS];
        const localFound = allContacts.find((c) => c.id === contactId || c.code === contactId);
        if (localFound) {
          handleSelectContact(localFound, false);
        }
        getContact(contactId)
          .then((data) => {
            if (data) handleSelectContact(data, false);
          })
          .catch(() => {
            const found = allContacts.find((c) => c.id === contactId || c.code === contactId);
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
        const cleanId = String(ticketId).replace(/\/$/, '');
        const dynContacts = getDynamicContacts();
        const dynDeals = getDynamicDeals();
        const contactTickets = [...dynContacts, ...SAMPLE_CONTACTS].flatMap((c) => c.associatedTickets || c.tickets || []);
        const dealTickets = [...dynDeals, ...SAMPLE_DEALS].flatMap((d) => d.associatedTickets || d.tickets || []);
        const allTickets = [
          ...getDynamicTickets(),
          ...SAMPLE_TICKETS,
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
            pipeline: cleanId.toLowerCase().includes('upload') ? 'Upload document' : 'ACA account',
            status: 'Need Create ACA Account',
            stage: 'Need Create ACA Account (ACA account)',
            priority: 'High',
            ticketOwner: 'Khanh Nguyen',
            serviceAgent: 'Platform Staff',
          }));
        }
        getTicket(cleanId)
          .then((res) => { if (res) setSelectedTicket((prev) => ({ ...(prev || {}), ...res })); })
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
    } else if (path.includes('/dashboard/agent/documents/')) {
      const parts = path.split('/dashboard/agent/documents/');
      const docId = parts[1];
      if (docId) {
        getDocument(docId)
          .then((res) => { if (res) setSelectedDocument((prev) => ({ ...prev, ...res })); })
          .catch(() => {});
      }
      setCurrentTab('documents');
      setCurrentView('customer-document-detail');
    } else if (path.includes('/dashboard/agent/documents')) {
      setCurrentTab('documents');
      setCurrentView('customer-documents-list');
    } else {
      setCurrentTab('dashboard');
      setCurrentView('dashboard');
    }
  }, [location.pathname]);

  // Handlers for navigation
  function handleSelectContact(contact, updateUrl = true) {
    if (updateUrl) {
      pushHistory();
    }
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

    const isDemoSample = contact.id === 'CT26002600' && !contact.isNew;
    const defaultData = isDemoSample ? CONTACT_DETAIL_DATA : {
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
      firstName: firstName || (isDemoSample ? 'Nhat Huu Tuan' : ''),
      middleName: middleName || '',
      lastName: lastName || (isDemoSample ? 'Dang' : ''),
      fullName: contact.fullName || [firstName, middleName, lastName].filter(Boolean).join(' ') || (isDemoSample ? 'Nhat Huu Tuan Dang' : ''),
      primary: {
        ...(defaultData.primary || {}),
        ...(contact.primary || {}),
        firstName: firstName || (isDemoSample ? 'Nhat Huu Tuan' : ''),
        middleName: middleName || '',
        lastName: lastName || (isDemoSample ? 'Dang' : ''),
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
        contactOwner: contact.contactOwner?.name || contact.contactOwner || (isDemoSample ? 'Khanh Nguyen (khanhnguyen31@7)' : 'The Best Rate Insurance'),
      },
      initials: (contact.fullName || (isDemoSample ? 'ND' : (firstName ? firstName[0] : 'CT')))
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
    pushHistory();
    const dealWithContact = {
      ...DEAL_DETAIL_DATA,
      ...(deal || {}),
      contactId: deal?.contactId || (selectedContact ? selectedContact.id || selectedContact.code : ''),
      contactName: deal?.contactName || (selectedContact ? selectedContact.fullName : ''),
      contact: deal?.contact || selectedContact,
    };
    setSelectedDeal(dealWithContact);
    setCurrentTab('deals');
    setCurrentView('deal-detail');
    navigate(`/dashboard/agent/deals/${deal?.id || 'D26005033'}`, { replace: false });
  }

  function handleSelectCustomerDocument(doc) {
    pushHistory();
    const targetDoc = doc || selectedContact?.customerDocument || {
      id: `doc-${selectedContact?.id || Date.now()}`,
      name: selectedContact?.fullName || 'Hai Nguyen',
      contactOwner:
        selectedContact?.contactOwner ||
        selectedContact?.leadOwner ||
        'Khanh Nguyen (khanhnguyen31@7)',
      associatedContact: {
        id: selectedContact?.code || selectedContact?.id || 'CT26002600',
        name: selectedContact?.fullName || 'Hai Nguyen',
        phone: selectedContact?.phone || '+1 (714) 837-2395',
        email: selectedContact?.email || 'hainguyen@example.com',
        leadOwner:
          selectedContact?.contactOwner ||
          selectedContact?.leadOwner ||
          'Khanh Nguyen',
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
      lastModifiedBy: selectedContact?.contactOwner || 'Khanh Nguyen',
    };
    setSelectedDocument(targetDoc);
    setCurrentView('customer-document-detail');
    navigate(`/dashboard/agent/documents/${targetDoc?.id || 'DOC-01'}`, { replace: false });
  }

  function handleUpdateDocument(updatedDoc) {
    setSelectedDocument(updatedDoc);
    updateCustomerDocumentInStore(updatedDoc);
    if (selectedContact) {
      setSelectedContact((prev) => {
        if (!prev) return prev;
        const prevDocs = prev.customerDocuments || [];
        const idx = prevDocs.findIndex(
          (d) => d.id === updatedDoc.id || d.name === updatedDoc.name
        );
        const updatedList = idx >= 0
          ? prevDocs.map((d, i) => (i === idx ? updatedDoc : d))
          : [updatedDoc, ...prevDocs];
        return {
          ...prev,
          customerDocument: updatedDoc,
          customerDocuments: updatedList,
        };
      });
    }
  }

  function handleSelectTab(tab) {
    setNavHistory([]);
    try {
      sessionStorage.removeItem('insurmatch_nav_history_agent');
    } catch {}
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
    } else if (tab === 'documents') {
      setCurrentView('customer-documents-list');
      navigate('/dashboard/agent/documents', { replace: false });
    }
  }

  function handleBackToContacts() {
    handleGoBack(() => {
      setCurrentTab('contacts');
      setCurrentView('contacts');
      navigate('/dashboard/agent/contacts', { replace: false });
    });
  }

  function handleBackToContactDetail() {
    setCurrentTab('contacts');
    setCurrentView('contact-detail');
    navigate(`/dashboard/agent/contacts/${selectedContact?.id || 'CT26002600'}`, { replace: false });
  }

  function handleBackToDealDetail() {
    setCurrentTab('deals');
    setCurrentView('deal-detail');
    navigate(`/dashboard/agent/deals/${selectedDeal?.id || 'D26005033'}`, { replace: false });
  }

  function handleBackToTicketDetail() {
    setCurrentTab('tickets');
    setCurrentView('ticket-detail');
    navigate(`/dashboard/agent/tickets/${selectedTicket?.id || 'TC26001001'}`, { replace: false });
  }

  function handleBackFromCustomerDocument() {
    handleGoBack(() => {
      if (currentTab === 'documents') {
        setCurrentView('customer-documents-list');
        navigate('/dashboard/agent/documents', { replace: false });
      } else {
        handleBackToContactDetail();
      }
    });
  }

  function handleBackFromDeal() {
    handleGoBack(() => {
      if (selectedContact && selectedContact.id && (selectedDeal?.contactId === selectedContact.id || selectedDeal?.contactId === selectedContact.code || selectedDeal?.contactName === selectedContact.fullName)) {
        handleBackToContactDetail();
      } else {
        setCurrentTab('deals');
        setCurrentView('deals');
        navigate('/dashboard/agent/deals', { replace: false });
      }
    });
  }

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
    addTicketToStore(enriched);
    setSelectedTicket(enriched);
    setCurrentTab('tickets');
    setCurrentView('ticket-detail');
    navigate(`/dashboard/agent/tickets/${enriched.id || enriched.code}`, { replace: false });
  }

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
    setCurrentTab('tasks');
    setCurrentView('task-detail');
    navigate(`/dashboard/agent/tasks/${enriched?.id || task}`, { replace: false });
  }

  function handleBackFromTicket() {
    handleGoBack(() => {
      if (selectedDeal && selectedDeal.id && (selectedTicket?.dealId === selectedDeal.id || selectedTicket?.dealId === selectedDeal.code)) {
        handleBackToDealDetail();
      } else if (selectedContact && selectedContact.id && (selectedTicket?.contactId === selectedContact.id || selectedTicket?.contactId === selectedContact.code)) {
        handleBackToContactDetail();
      } else {
        setCurrentTab('tickets');
        setCurrentView('tickets');
        navigate('/dashboard/agent/tickets', { replace: false });
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
        setCurrentTab('tasks');
        setCurrentView('tasks');
        navigate('/dashboard/agent/tasks', { replace: false });
      }
    });
  }

  return (
    <StaffCrmLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      isAgent={true}
      agentName={currentAgent.name}
      agentNpn="#1984210"
      showCommission={false}
    >
      {/* ── 1. DASHBOARD VIEW ───────────────────────────────────────────── */}
      {currentView === 'dashboard' && (
        <StaffCrmDashboard
          onSelectTab={handleSelectTab}
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
          onSelectTicket={handleSelectTicket}
          onSelectTask={handleSelectTask}
          isAgent={true}
          agentName={currentAgent.name}
        />
      )}

      {/* ── 2. CONTACTS VIEW ────────────────────────────────────────────── */}
      {currentView === 'contacts' && (
        <StaffContactsList
          onSelectContact={handleSelectContact}
          isAgent={true}
          agentName={currentAgent.name}
        />
      )}

      {/* ── 3. CONTACT DETAIL VIEW ──────────────────────────────────────── */}
      {currentView === 'contact-detail' && (
        !canAgentAccessItem(selectedContact, user || { role: 'agent', name: currentAgent.name }, 'contact') ? (
          <AccessRestrictedCard
            title="Quyền truy cập thông tin khách hàng bị giới hạn"
            message="Theo quy định, bạn chỉ có quyền xem và xử lý các hồ sơ khách hàng mà bạn được phân công làm Owner phụ trách."
            ownerName={extractOwnerString(selectedContact?.contactOwner || selectedContact?.sourceOfLead?.contactOwner)}
            onBack={handleBackToContacts}
            backLabel="Quay lại Danh bạ"
          />
        ) : (
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
                  console.warn('[AgentDashboard] Could not update contact:', err)
                );
              }
            }}
          />
        )
      )}

      {/* ── 4. DEALS VIEW ───────────────────────────────────────────────── */}
      {currentView === 'deals' && (
        <StaffDealsList
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
          isAgent={true}
          agentName={currentAgent.name}
        />
      )}

      {/* ── 5. DEAL DETAIL VIEW ─────────────────────────────────────────── */}
      {currentView === 'deal-detail' && (
        !canAgentAccessItem(selectedDeal, user || { role: 'agent', name: currentAgent.name }, 'deal') ? (
          <AccessRestrictedCard
            title="Quyền truy cập hồ sơ Deal bị giới hạn"
            message="Theo quy định, bạn chỉ có quyền xem và thao tác trên các Deals bảo hiểm mà bạn là Owner phụ trách."
            ownerName={extractOwnerString(selectedDeal?.dealOwner || selectedDeal?.leadOwner)}
            onBack={handleBackFromDeal}
            backLabel="Quay lại Danh sách Deals"
          />
        ) : (
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
                  console.warn('[AgentDashboard] Could not update deal:', err)
                );
              }
            }}
          />
        )
      )}

      {/* ── 5.5 CUSTOMER DOCUMENTS LIST VIEW ────────────────────────── */}
      {currentView === 'customer-documents-list' && (
        <StaffCustomerDocumentsList
          isAgent={true}
          agentName={currentAgent.name}
          onSelectCustomerDocument={handleSelectCustomerDocument}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
        />
      )}

      {/* ── 6. CUSTOMER DOCUMENT DETAIL VIEW ────────────────────────────── */}
      {currentView === 'customer-document-detail' && (
        !canAgentAccessItem(selectedDocument, user || { role: 'agent', name: currentAgent.name }, 'document') ? (
          <AccessRestrictedCard
            title="Quyền truy cập tài liệu khách hàng bị giới hạn"
            message="Theo quy định, bạn chỉ có quyền xem và tải tài liệu xác thực của khách hàng thuộc quyền quản lý của mình."
            ownerName={extractOwnerString(selectedDocument?.contactOwner)}
            onBack={handleBackFromCustomerDocument}
            backLabel="Quay lại Hồ sơ tài liệu"
          />
        ) : (
          <StaffCustomerDocumentDetail
            documentData={selectedDocument}
            onBack={handleBackFromCustomerDocument}
            onSelectContact={(contact) => handleSelectContact(contact || selectedContact)}
            onSelectDeal={() => handleSelectDeal(selectedDeal)}
            onUpdateDocument={handleUpdateDocument}
          />
        )
      )}

      {/* ── 7. COMMISSION / SAAS REVENUE (Admin Only) ─────────────────── */}
      {currentView === 'commission' && (
        <AccessRestrictedCard
          title="Quyền xem thông tin gói mua & Doanh thu bị giới hạn"
          message="Thông tin gói thuê bao CRM của các agency (Starter $39, Professional $79, Agency $199) và quyết toán hoa hồng chỉ dành riêng cho Quản trị viên (Admin)."
          onBack={() => handleSelectTab('dashboard')}
          backLabel="Quay lại Dashboard"
        />
      )}

      {/* ── 8. TICKETS LIST VIEW ──────────────────────────────────────── */}
      {currentView === 'tickets' && (
        <StaffTicketsList
          onSelectTicket={handleSelectTicket}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
          isAgent={true}
          agentName={currentAgent.name}
        />
      )}

      {/* ── 8b. TICKET DETAIL VIEW ────────────────────────────────────── */}
      {currentView === 'ticket-detail' && (
        !canAgentAccessItem(selectedTicket, user || { role: 'agent', name: currentAgent.name }, 'ticket') ? (
          <AccessRestrictedCard
            title="Quyền truy cập Ticket hỗ trợ bị giới hạn"
            message="Theo quy định, bạn chỉ có quyền xử lý các Ticket hỗ trợ khách hàng được phân công cho bạn."
            ownerName={extractOwnerString(selectedTicket?.ticketOwner || selectedTicket?.owner)}
            onBack={handleBackFromTicket}
            backLabel="Quay lại Danh sách Tickets"
          />
        ) : (
          <StaffTicketDetail
            ticket={selectedTicket}
            onBack={handleBackFromTicket}
            onSelectContact={handleSelectContact}
            onSelectDeal={handleSelectDeal}
            onUpdateTicket={(updated) => {
              setSelectedTicket((prev) => ({ ...prev, ...updated }));
              if (updated?.id) {
                apiUpdateTicket(updated.id, updated).catch((err) =>
                  console.warn('[AgentDashboard] Could not update ticket:', err)
                );
              }
              setSelectedContact((prev) => {
                if (!prev) return prev;
                const tList = prev.associatedTickets || prev.tickets || [];
                const nextTickets = tList.map((t) => (t.id === updated.id || t.code === updated.code ? { ...t, ...updated } : t));
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
                addContactToStore(nextContact);
                return nextContact;
              });
            }}
          />
        )
      )}

      {/* ── 9. TASKS LIST VIEW ───────────────────────────────────────── */}
      {currentView === 'tasks' && (
        <StaffTasksList
          onSelectTask={handleSelectTask}
          onSelectContact={handleSelectContact}
          onSelectDeal={handleSelectDeal}
          isAgent={true}
          agentName={currentAgent.name}
        />
      )}

      {/* ── 9b. TASK DETAIL VIEW ──────────────────────────────────────── */}
      {currentView === 'task-detail' && (
        !canAgentAccessItem(selectedTask, user || { role: 'agent', name: currentAgent.name }, 'task') ? (
          <AccessRestrictedCard
            title="Quyền truy cập công việc (Task) bị giới hạn"
            message="Theo quy định, bạn chỉ có quyền xem và xử lý các Task công việc được chỉ định cho bạn."
            ownerName={extractOwnerString(selectedTask?.assignee || selectedTask?.assignedTo)}
            onBack={handleBackFromTask}
            backLabel="Quay lại Danh sách Tasks"
          />
        ) : (
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
                  console.warn('[AgentDashboard] Could not update task:', err)
                );
              }
            }}
          />
        )
      )}
    </StaffCrmLayout>
  );
}
