import React, { useState, useMemo, useEffect } from 'react';


import { useAuth } from '../../../auth/AuthContext';
import { getContacts, getUsers, createContact as apiCreateContact } from '../../../services/api';
import { filterContactsForAgent, getAgentIdentity } from '../../../utils/rbac';
import { getCurrentActor, getPropertyHistory } from '../../../services/propertyHistoryService';
import { getActiveAgentAccounts } from '../../../utils/constants';

export default function StaffContactsList({ onSelectContact, isAgent = false, agentName = '' }) {
  const { user } = useAuth();
  const currentActor = getCurrentActor(user);
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  const [dbUsers, setDbUsers] = useState([]);
  const [agentAccounts, setAgentAccounts] = useState(() => getActiveAgentAccounts());

  useEffect(() => {
    function handleAccountsUpdated() {
      setAgentAccounts(getActiveAgentAccounts());
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  // Load contacts from PostgreSQL API
  async function loadData(filters = {}) {
    setLoading(true);
    try {
      const usersData = await getUsers();
      setDbUsers(usersData);
      if (Array.isArray(usersData) && usersData.length > 0) {
        const backendAgents = usersData.filter((u) => (u.role || '').toLowerCase() === 'agent');
        if (backendAgents.length > 0) {
          setAgentAccounts((prev) => {
            const names = new Set(prev.map((a) => a.name));
            const newOnes = backendAgents
              .filter((b) => !names.has(b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim()))
              .map((b) => ({
                id: String(b.id),
                name: b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim(),
                role: 'agent',
              }));
            return [...prev, ...newOnes];
          });
        }
      }

      const activeSearch = filters.search !== undefined ? filters.search : searchQuery;
      const activeOwner = filters.owner !== undefined ? filters.owner : ownerFilter;
      const data = await getContacts({
        search: activeSearch,
        owner: activeOwner,
      });
      if (Array.isArray(data)) {
        setContactsList(data);
        setIsDbConnected(true);
      } else {
        setContactsList([]);
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn('[StaffContactsList] API error:', err);
      setContactsList([]);
      setIsDbConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData({ search: searchQuery, owner: ownerFilter });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, ownerFilter]);

  // Form state for Create Contact (Exact match to uploaded image)
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [howDoYouKnowUs, setHowDoYouKnowUs] = useState('');
  const [whoReferClient, setWhoReferClient] = useState('');
  const [language, setLanguage] = useState('Vietnamese');
  const [teleSaleTeam, setTeleSaleTeam] = useState('');
  const [contactOwner, setContactOwner] = useState('The Best Rate Insurance');

  const activeIsAgent = isAgent || user?.role === 'agent';
  const effectiveAgent = getAgentIdentity(user || (isAgent ? { role: 'agent', name: agentName } : null));

  // Scoped list: if agent, only records assigned to this agent
  const scopedContacts = useMemo(() => {
    if (activeIsAgent) {
      return filterContactsForAgent(contactsList, user || { role: 'agent', name: effectiveAgent.name });
    }
    return contactsList;
  }, [contactsList, activeIsAgent, user, effectiveAgent.name]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return scopedContacts.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const cName = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '';
      const cCode = c.code || `CT2600${c.id || ''}`;
      const cPhone = c.phone || '';
      const cEmail = c.email || '';
      const ownerName = (typeof c.contactOwner === 'object' ? (c.contactOwner?.name || `${c.contactOwner?.firstName || ''} ${c.contactOwner?.lastName || ''}`.trim()) : c.contactOwner) || '';

      const matchesSearch =
        !q ||
        cName.toLowerCase().includes(q) ||
        cCode.toLowerCase().includes(q) ||
        cPhone.toLowerCase().includes(q) ||
        cEmail.toLowerCase().includes(q);

      const matchesOwner =
        ownerFilter === 'all' ||
        ownerName.toLowerCase().includes(ownerFilter.toLowerCase());

      return matchesSearch && matchesOwner;
    });
  }, [scopedContacts, searchQuery, ownerFilter]);

  // Unique owners for filter
  const ownerOptions = useMemo(() => {
    const set = new Set(['The Best Rate Insurance', ...agentAccounts.map((a) => a.name)]);
    scopedContacts.forEach((c) => {
      const o = typeof c.contactOwner === 'object' ? (c.contactOwner?.name || `${c.contactOwner?.firstName || ''} ${c.contactOwner?.lastName || ''}`.trim()) : c.contactOwner;
      if (o && o !== 'all' && o !== '--') set.add(o);
    });
    return Array.from(set).sort();
  }, [agentAccounts, scopedContacts]);

  // Handle Quick Create
  async function handleCreateSubmit(e) {
    e.preventDefault();
    const fName = firstName.trim();
    const mName = middleName.trim();
    const lName = lastName.trim();
    const fullNameParts = [fName, mName, lName].filter(Boolean);
    const fullName = fullNameParts.length > 0 ? fullNameParts.join(' ') : (fName || 'New Contact');

    const newCode = `CT2600${Math.floor(10000 + Math.random() * 90000)}`;
    const formattedPhone = phone.trim()
      ? phone.trim().startsWith('+1')
        ? phone.trim()
        : `+1 ${phone.trim()}`
      : '—';

    const ownerNameResolved = contactOwner || (activeIsAgent ? effectiveAgent.name : 'The Best Rate Insurance');

    const matchedUser = dbUsers.find(
      (u) => u.name === ownerNameResolved || u.fullName === ownerNameResolved || u.id === ownerNameResolved
    );
    const contactOwnerId = matchedUser ? matchedUser.id : null;

    const newRecord = {
      id: newCode,
      no: contactsList.length + 1,
      code: newCode,
      firstName: fName,
      middleName: mName,
      lastName: lName,
      fullName: fullName,
      phone: formattedPhone,
      rawPhone: phone.trim(),
      email: email.trim() || '',
      language: language || 'Vietnamese',
      contactOwner: {
        name: ownerNameResolved,
        avatar: (ownerNameResolved || 'TB').slice(0, 2).toUpperCase(),
        bg: 'bg-blue-600 text-white',
      },
      contactOwnerName: ownerNameResolved,
      howDoYouKnowUs: howDoYouKnowUs || '',
      whoReferClient: whoReferClient || '',
      teleSaleTeam: teleSaleTeam || '',
      acaAccountStatus: '', // Trống ban đầu theo quy trình
      status: 'Active',
      isNew: true,
      lastModifiedBy: {
        name: activeIsAgent ? effectiveAgent.name : 'Platform Staff',
        avatar: (activeIsAgent ? effectiveAgent.name : 'PS').slice(0, 2).toUpperCase(),
        bg: 'bg-teal-600 text-white',
      },
      lastModifiedTime: 'Just now',
      primary: {
        firstName: fName || fullName,
        middleName: mName,
        lastName: lName || '',
        dob: '',
        ssn: '',
        familyRelationship: 'Self',
        gender: '',
        immigrationStatus: '',
        alienNumber: '',
        certificateNumber: '',
        dateExpired: '',
        household: '',
      },
      contactFields: {
        phone: formattedPhone,
        enrolledAddress: '',
        mailingAddress: '',
        state: '',
        streetAddress: '',
        city: '',
        postalCode: '',
        county: '',
        language: language || 'Vietnamese',
        career: '',
      },
      sourceOfLead: {
        howDoYouKnowUs: howDoYouKnowUs || '',
        whoReferClient: whoReferClient || '',
        contactOwner: ownerNameResolved,
        leadOwner: ownerNameResolved,
        medicareShareOwner: '',
        obamacareSharedOwner: '',
        lifeSharedOwner: '',
        contactType: '',
      },
      acaAccount: {
        theBestRateEmail: '',
        acaAccount: '',
        acaPass: '',
        acaAccountStatus: '',
        status: '',
      },
      associatedDeals: [], // Trống ban đầu khi mới tạo contact
      associatedTickets: [], // Trống ban đầu
      associatedDocuments: [],
      customerDocuments: [],
      customerDocument: null,
      isNew: true,
      activities: [],
      notes: [],
      tasks: [],
      members: [],
    };

    null;

    // Initialize real property history with current actor
    getPropertyHistory('contact', newCode, newRecord, currentActor);

    setContactsList((prev) => [newRecord, ...prev]);
    showToast(`Đã tạo liên hệ mới: ${fullName}`);

    // Call API to persist contact (without auto-creating deal)
    try {
      const saved = await apiCreateContact({
        code: newCode,
        firstName: fName,
        middleName: mName,
        lastName: lName,
        fullName: fullName,
        phone: formattedPhone,
        email: email.trim(),
        language: language || 'Vietnamese',
        howDoYouKnowUs: howDoYouKnowUs,
        whoReferClient: whoReferClient,
        teleSaleTeam: teleSaleTeam,
        contactOwnerId: contactOwnerId,
        contactOwnerName: ownerNameResolved,
        status: 'Active',
        acaAccountStatus: '',
      });
      if (saved && (saved.id || saved.code)) {
        setContactsList((prev) =>
          prev.map((c) =>
            c.code === newCode
              ? {
                  ...newRecord,
                  ...saved,
                  id: saved.id || c.id,
                  code: saved.code || c.code,
                  customerDocuments: [],
                  customerDocument: null,
                  isNew: true,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.warn('Could not save to DB:', err);
    }

    // Reset form
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setHowDoYouKnowUs('');
    setWhoReferClient('');
    setLanguage('Vietnamese');
    setTeleSaleTeam('');
    setContactOwner(activeIsAgent ? effectiveAgent.name : 'The Best Rate Insurance');
    setShowCreateModal(false);
  }

  function openCreateContactModal() {
    if (activeIsAgent && effectiveAgent.name) {
      setContactOwner(effectiveAgent.name);
    } else {
      setContactOwner('The Best Rate Insurance');
    }
    setShowCreateModal(true);
  }

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-3 w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in-up text-xs font-medium">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Page Header (Contacts + Create + Refresh) ──────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-slate-700">contacts</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contacts</h1>

        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openCreateContactModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setOwnerFilter('all');
              loadData();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Agent Scope Indicator Banner ─────────────────────────────────── */}
      {activeIsAgent && (
        <div className="bg-blue-50 border border-blue-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <span className="material-symbols-outlined text-[18px] text-blue-600">badge</span>
            <span>Chế độ Agent: Chỉ hiển thị các Contact được phân công cho <strong>{effectiveAgent.name}</strong></span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            {filteredContacts.length} hồ sơ phụ trách
          </span>
        </div>
      )}

      {/* ── 2. View Tabs (Only All Contacts as requested: "phần này chỉ cần all contact thôi") ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 pt-1 text-xs">
        <div className="flex items-center gap-2 px-3 py-2 font-semibold border-b-2 border-blue-600 text-blue-600">
          <span className="material-symbols-outlined text-[16px]">menu</span>
          <span>{activeIsAgent ? 'My Assigned Contacts' : 'All Contacts'}</span>
          {scopedContacts.length > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
              {scopedContacts.length}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
              0
            </span>
          )}
        </div>
      </div>

      {/* ── 3. Filters Row ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 flex-wrap w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filters: Name, phone, code..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Contact Owner Dropdown */}
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 transition shadow-xs cursor-pointer"
            >
              <option value="all">Contact Owner: All</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Advanced Filters Button */}
          <button
            type="button"
            onClick={() => showToast('Advanced Filters: Active (1 rule applied)')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
            <span>Advanced Filters</span>
          </button>
        </div>

        {/* DB Sync / Refresh button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
            <span>Làm mới ({contactsList.length} liên hệ)</span>
          </button>
        </div>
      </div>

      {/* ── 4. Main Contacts Table (Image 1) ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="material-symbols-outlined text-[16px] text-slate-500">grid_on</span>
            <span>All Contacts</span>
            <span className="text-slate-400 font-normal">({filteredContacts.length} displayed)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              loadData();
              showToast('Contacts list refreshed');
            }}
            title="Refresh Table"
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap min-w-[960px]">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center">No.</th>
                <th className="px-3 py-2.5">Code</th>
                <th className="px-3 py-2.5 font-bold text-slate-900">Full name</th>
                <th className="px-3 py-2.5">Phone</th>
                <th className="px-3 py-2.5">Email Tbri</th>
                <th className="px-3 py-2.5">Language</th>
                <th className="px-3 py-2.5">Contact Owner</th>
                <th className="px-3 py-2.5">How do you know us</th>
                <th className="px-3 py-2.5">ACA Account Status</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Last modified by</th>
                <th className="px-3 py-2.5">Last modified time</th>
                <th className="px-2 py-2.5 text-center w-8">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[32px] text-slate-400">inventory_2</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">No data here!</div>
                      <div className="text-xs text-slate-500">
                        There is no data to show right now. Danh sách hiện đang trống.
                      </div>
                      <div className="flex items-center gap-2.5 mt-2">
                        <button
                          type="button"
                          onClick={openCreateContactModal}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                          <span>+ Create Contact</span>
                        </button>
                        <button
                          type="button"
                          onClick={loadData}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px] text-slate-500">sync</span>
                          <span>Tải lại từ Database</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, index) => {
                  const isNhatDang = contact.fullName === 'Nhat Huu Tuan Dang';
                  return (
                    <tr
                      key={contact.id}
                      onClick={() => onSelectContact && onSelectContact(contact)}
                      className={`hover:bg-blue-50/60 transition-colors cursor-pointer group ${
                        isNhatDang ? 'bg-amber-50/40 font-medium' : ''
                      }`}
                    >
                      {/* No. */}
                      <td className="px-3 py-2.5 text-center text-slate-400 font-medium">
                        {contact.no || index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {contact.code}
                      </td>

                      {/* Full name (Clickable link to Contact Detail) */}
                      <td className="px-3 py-2.5 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>{contact.fullName}</span>
                        {isNhatDang && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                            Demo Target
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-2.5 text-slate-600">
                        {contact.phone || '—'}
                      </td>

                      {/* Email Tbri */}
                      <td className="px-3 py-2.5 text-slate-600 font-mono text-[10px]">
                        {contact.email || '—'}
                      </td>

                      {/* Language */}
                      <td className="px-3 py-2.5 text-slate-600">
                        {contact.language}
                      </td>

                      {/* Contact Owner */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${contact.contactOwner?.bg || 'bg-amber-100 text-amber-800'}`}
                          >
                            {contact.contactOwner?.avatar || 'TB'}
                          </div>
                          <span className="text-slate-800 truncate max-w-[130px]">
                            {contact.contactOwner?.name || 'The Best Rate Insurance'}
                          </span>
                        </div>
                      </td>

                      {/* How do you know us */}
                      <td className="px-3 py-2.5 text-slate-600">
                        {contact.howDoYouKnowUs || '—'}
                      </td>

                      {/* ACA Account Status */}
                      <td className="px-3 py-2.5">
                        {contact.acaAccountStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium inline-block ${
                              contact.acaAccountStatus === 'DONE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : contact.acaAccountStatus === 'VERIFIED'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {contact.acaAccountStatus}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              contact.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span
                            className={
                              contact.status === 'Active'
                                ? 'text-emerald-700 font-medium'
                                : 'text-slate-600'
                            }
                          >
                            {contact.status || 'Active'}
                          </span>
                        </span>
                      </td>

                      {/* Last modified by */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${contact.lastModifiedBy?.bg || 'bg-slate-100 text-slate-800'}`}
                          >
                            {contact.lastModifiedBy?.avatar || 'SM'}
                          </div>
                          <span className="text-slate-800 truncate max-w-[110px]">
                            {contact.lastModifiedBy?.name || 'Platform Staff'}
                          </span>
                        </div>
                      </td>

                      {/* Last modified time */}
                      <td className="px-3 py-2.5 text-slate-500 text-[10px]">
                        {contact.lastModifiedTime}
                      </td>

                      {/* # Settings */}
                      <td className="px-2 py-2.5 text-center text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined text-[15px]">settings</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-500">touch_app</span>
            <span>
              {contactsList.length > 0
                ? 'Nhấp vào bất kỳ khách hàng nào để xem Contact Detail (Ảnh 2) và Deal Detail (Ảnh 3).'
                : 'Dữ liệu hiện đang để trống. Nhấp vào "+ Create" hoặc "Tải dữ liệu mẫu" để kiểm tra.'}
            </span>
          </div>
          <div>{contactsList.length} records</div>
        </div>
      </div>

      {/* ── Slide-over Drawer: Create Contact (Exact match to uploaded image) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-xs"
          />

          {/* Right Slide-over Panel */}
          <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
            {/* Drawer Header (Dark Blue) */}
            <div className="bg-[#1C3664] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="material-symbols-outlined text-[17px]">edit</span>
                <span>Create Contact</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white transition p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">close</span>
              </button>
            </div>

            {/* Drawer Form Body (Scrollable) */}
            <form onSubmit={handleCreateSubmit} className="flex-grow overflow-y-auto p-5 space-y-4 text-xs">
              {/* 1. First Name */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="--"
                    className="w-full pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    edit
                  </span>
                </div>
              </div>

              {/* 2. Middle Name */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Middle Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="--"
                    className="w-full pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    edit
                  </span>
                </div>
              </div>

              {/* 3. Last Name */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="--"
                    className="w-full pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    edit
                  </span>
                </div>
              </div>

              {/* 4. Email */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="--"
                    className="w-full pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    mail
                  </span>
                </div>
              </div>

              {/* 5. Phone (+1 prefix) */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Phone
                </label>
                <div className="relative flex rounded border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500">
                  <span className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-slate-700 font-medium text-xs">
                    +1
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="--"
                    className="flex-grow pl-3 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    call
                  </span>
                </div>
              </div>

              {/* 6. How do you know us? */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  How do you know us?
                </label>
                <div className="relative">
                  <select
                    value={howDoYouKnowUs}
                    onChange={(e) => setHowDoYouKnowUs(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Existing Network">Existing Network</option>
                    <option value="Refer by other client">Refer by other client</option>
                    <option value="Online Ad">Online Ad</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 7. Who refer client? */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Who refer client?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={whoReferClient}
                    onChange={(e) => setWhoReferClient(e.target.value)}
                    placeholder="--"
                    className="w-full pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    edit
                  </span>
                </div>
              </div>

              {/* 8. Language* */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Language <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="English">English</option>
                    <option value="Bilingual (Vietnamese / English)">Bilingual (Vietnamese / English)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 9. Tele Sale Team */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Tele Sale Team
                </label>
                <div className="relative">
                  <select
                    value={teleSaleTeam}
                    onChange={(e) => setTeleSaleTeam(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    <option value="Tiger Team">Tiger Team</option>
                    <option value="Call to renew 2027">Call to renew 2027</option>
                    <option value="Telesale Help-Renew 2027">Telesale Help-Renew 2027</option>
                    <option value="Direct Telesale">Direct Telesale</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 10. Contact Owner* */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Contact Owner <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={contactOwner}
                    onChange={(e) => setContactOwner(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    <option value="The Best Rate Insurance">The Best Rate Insurance</option>
                    {agentAccounts.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>



              {/* Bottom Submit Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
