import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StaffCrmLayout from './staff/StaffCrmLayout';
import StaffContactsList from './staff/StaffContactsList';
import StaffContactDetail from './staff/StaffContactDetail';
import StaffDealDetail from './staff/StaffDealDetail';
import StaffDealsList from './staff/StaffDealsList';
import StaffCustomerDocumentDetail from './staff/StaffCustomerDocumentDetail';
import StaffCrmDashboard from './staff/StaffCrmDashboard';
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
} from '../../services/api';

export default function StaffDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Current view: 'dashboard' | 'list' | 'contact-detail' | 'deals-list' | 'deal-detail' | 'customer-document-detail'
  const [currentTab, setCurrentTab] = useState('contacts');
  const [currentView, setCurrentView] = useState('list');
  const [selectedContact, setSelectedContact] = useState(CONTACT_DETAIL_DATA);
  const [selectedDeal, setSelectedDeal] = useState(DEAL_DETAIL_DATA);
  const [selectedDocument, setSelectedDocument] = useState(CUSTOMER_DOCUMENT_DATA);

  // Sync state with URL path if applicable
  useEffect(() => {
    const path = location.pathname;
    if (
      path.endsWith('/dashboard/staff/dashboard') ||
      path.endsWith('/dashboard/staff/dashboard/')
    ) {
      setCurrentTab('dashboard');
      setCurrentView('dashboard');
    } else if (path.includes('/dashboard/staff/documents/')) {
      const parts = path.split('/dashboard/staff/documents/');
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
    } else if (path.includes('/dashboard/staff/deals/')) {
      const parts = path.split('/dashboard/staff/deals/');
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
      path.endsWith('/dashboard/staff/deals') ||
      path.endsWith('/dashboard/staff/deals/')
    ) {
      setCurrentTab('deals');
      setCurrentView('deals-list');
    } else if (path.includes('/dashboard/staff/contacts/')) {
      const parts = path.split('/dashboard/staff/contacts/');
      const contactId = parts[1];
      if (contactId) {
        getContact(contactId)
          .then((data) => {
            if (data) {
              handleSelectContact(data, false);
            }
          })
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

  // Handlers for smooth navigation
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

  function handleSelectDeal(deal) {
    setSelectedDeal({
      ...DEAL_DETAIL_DATA,
      ...(deal || {}),
    });
    setCurrentView('deal-detail');
    navigate(`/dashboard/staff/deals/${deal?.id || 'D26005033'}`, { replace: false });
  }

  function handleSelectCustomerDocument(doc) {
    setSelectedDocument({
      ...CUSTOMER_DOCUMENT_DATA,
      ...(doc || {}),
    });
    setCurrentView('customer-document-detail');
    navigate(`/dashboard/staff/documents/${doc?.id || 'DOC-01'}`, { replace: false });
  }

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
    }
  }

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

  return (
    <StaffCrmLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
    >
      {currentView === 'dashboard' && (
        <StaffCrmDashboard
          onSelectTab={handleSelectTab}
          onSelectDeal={handleSelectDeal}
          onSelectContact={handleSelectContact}
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
        />
      )}

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
    </StaffCrmLayout>
  );
}
