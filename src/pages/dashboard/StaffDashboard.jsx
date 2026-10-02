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
import StaffCommissionView from './staff/StaffCommissionView';
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

  // Navigation history stack for seamless cross-entity return
  const [navHistory, setNavHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('insurmatch_nav_history_staff');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('insurmatch_nav_history_staff', JSON.stringify(navHistory));
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

    if (path.endsWith('/dashboard/staff/dashboard') || path.endsWith('/dashboard/staff/dashboard/')) {
      setCurrentTab('dashboard');
      setCurrentView('dashboard');
    } else if (path.includes('/dashboard/staff/tickets/')) {
      const parts = path.split('/dashboard/staff/tickets/');
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
      setCurrentTab('documents');
      setCurrentView('customer-document-detail');
    } else if (path.endsWith('/dashboard/staff/documents') || path.endsWith('/dashboard/staff/documents/')) {
      setCurrentTab('documents');
      setCurrentView('customer-documents-list');
    } else if (path.includes('/dashboard/staff/deals/')) {
      const parts = path.split('/dashboard/staff/deals/');
      const dealId = parts[1];
      if (dealId) {
        const allDeals = [...getDynamicDeals(), ...SAMPLE_DEALS];
        const localFound = allDeals.find((d) => d.id === dealId || d.code === dealId);
        if (localFound) {
          setSelectedDeal({ ...DEAL_DETAIL_DATA, ...localFound });
        }
        getDeal(dealId)
          .then((res) => { if (res) setSelectedDeal((prev) => ({ ...DEAL_DETAIL_DATA, ...res })); })
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
        const allContacts = [...getDynamicContacts(), ...SAMPLE_CONTACTS];
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
      setCurrentTab('contacts');
      setCurrentView('contact-detail');
    } else {
      setCurrentTab('contacts');
      setCurrentView('list');
    }
  }, [location.pathname]);

  // ── Contact Handlers ──────────────────────────────────────────────────────
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
      if (parts.length === 1) { firstName = parts[0]; lastName = ''; }
      else if (parts.length === 2) { firstName = parts[0]; lastName = parts[1]; }
      else { firstName = parts.slice(0, -1).join(' '); lastName = parts[parts.length - 1]; }
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
        contactOwner: contact.contactOwner?.name || contact.contactOwner || (isDemoSample ? CONTACT_DETAIL_DATA.sourceOfLead.contactOwner : 'The Best Rate Insurance'),
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
    if (updateUrl && location.pathname !== `/dashboard/staff/contacts/${contact.id}`) {
      navigate(`/dashboard/staff/contacts/${contact.id}`, { replace: false });
    }
  }

  // ── Deal Handlers ─────────────────────────────────────────────────────────
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
    navigate(`/dashboard/staff/deals/${deal?.id || 'D26005033'}`, { replace: false });
  }

  // ── Document Handler ──────────────────────────────────────────────────────
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
    navigate(`/dashboard/staff/documents/${targetDoc?.id || 'DOC-01'}`, { replace: false });
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

  // ── Ticket Handlers ───────────────────────────────────────────────────────
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
    navigate(`/dashboard/staff/tickets/${enriched.id || enriched.code}`, { replace: false });
  }

  // ── Task Handlers ─────────────────────────────────────────────────────────
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
    navigate(`/dashboard/staff/tasks/${enriched?.id || task}`, { replace: false });
  }

  // ── Tab Navigation ────────────────────────────────────────────────────────
  function handleSelectTab(tab) {
    setNavHistory([]);
    try {
      sessionStorage.removeItem('insurmatch_nav_history_staff');
    } catch {}
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
    } else if (tab === 'documents') {
      setCurrentView('customer-documents-list');
      navigate('/dashboard/staff/documents', { replace: false });
    } else if (tab === 'commission') {
      setCurrentView('commission-ledger');
      navigate('/dashboard/staff/commission', { replace: false });
    }
  }

  // ── Back Navigation ───────────────────────────────────────────────────────
  function handleBackToContacts() {
    handleGoBack(() => {
      setCurrentTab('contacts');
      setCurrentView('list');
      navigate('/dashboard/staff', { replace: false });
    });
  }

  function handleBackToContactDetail() {
    setCurrentTab('contacts');
    setCurrentView('contact-detail');
    navigate(`/dashboard/staff/contacts/${selectedContact?.id || 'CT26002600'}`, { replace: false });
  }

  function handleBackToDealDetail() {
    setCurrentTab('deals');
    setCurrentView('deal-detail');
    navigate(`/dashboard/staff/deals/${selectedDeal?.id || 'D26005033'}`, { replace: false });
  }

  function handleBackToTicketDetail() {
    setCurrentTab('tickets');
    setCurrentView('ticket-detail');
    navigate(`/dashboard/staff/tickets/${selectedTicket?.id || 'TC26001001'}`, { replace: false });
  }

  function handleBackFromCustomerDocument() {
    handleGoBack(() => {
      if (currentTab === 'documents') {
        setCurrentView('customer-documents-list');
        navigate('/dashboard/staff/documents', { replace: false });
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
        setCurrentView('deals-list');
        navigate('/dashboard/staff/deals', { replace: false });
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
        setCurrentTab('tickets');
        setCurrentView('tickets-list');
        navigate('/dashboard/staff/tickets', { replace: false });
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
        setCurrentView('tasks-list');
        navigate('/dashboard/staff/tasks', { replace: false });
      }
    });
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
          onUpdateContact={(updated) => {
            setSelectedContact((prev) => ({ ...prev, ...updated }));
            if (updated?.id) {
              apiUpdateContact(updated.id, updated).catch((err) =>
                console.warn('[StaffDashboard] Could not persist contact update:', err)
              );
            }
          }}
        />
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
                console.warn('[StaffDashboard] Could not persist deal update:', err)
              );
            }
          }}
        />
      )}

      {/* ── Customer Documents Views ────────────────────────────────────── */}
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
          onUpdateTicket={(updated) => {
            setSelectedTicket((prev) => ({ ...prev, ...updated }));
            if (updated?.id) {
              apiUpdateTicket(updated.id, updated).catch((err) =>
                console.warn('[StaffDashboard] Could not persist ticket update:', err)
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
          onUpdateTask={(updated) => {
            setSelectedTask((prev) => ({ ...prev, ...updated }));
            if (updated?.id) {
              apiUpdateTask(updated.id, updated).catch((err) =>
                console.warn('[StaffDashboard] Could not persist task update:', err)
              );
            }
          }}
        />
      )}

      {/* ── Commission / Package View (Admin Only) ────────────────────── */}
      {currentView === 'commission-ledger' && (
        <AccessRestrictedCard
          title="Quyền xem thông tin gói mua & Doanh thu bị giới hạn"
          message="Thông tin gói thuê bao CRM của các agency (Starter $39, Professional $79, Agency $199) và quyết toán hoa hồng chỉ dành riêng cho Quản trị viên (Admin)."
          onBack={() => handleSelectTab('dashboard')}
          backLabel="Quay lại Dashboard"
        />
      )}
    </StaffCrmLayout>
  );
}
