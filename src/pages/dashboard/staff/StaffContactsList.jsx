import React, { useState, useMemo, useEffect } from 'react';
import { getContacts, createContact as apiCreateContact } from '../../../services/api';

export default function StaffContactsList({ onSelectContact }) {
  const [contactsList, setContactsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load contacts from PostgreSQL API
  async function loadData() {
    setLoading(true);
    try {
      const data = await getContacts();
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
    loadData();
  }, []);

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
  const [supportAgent, setSupportAgent] = useState('Anya Nguyen (anya42@9)');

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contactsList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      const matchesOwner =
        ownerFilter === 'all' ||
        c.contactOwner.name.toLowerCase().includes(ownerFilter.toLowerCase());

      return matchesSearch && matchesOwner;
    });
  }, [contactsList, searchQuery, ownerFilter]);

  // Unique owners for filter
  const ownerOptions = useMemo(() => {
    const set = new Set(
      contactsList
        .map((c) => (typeof c.contactOwner === 'object' ? c.contactOwner?.name : c.contactOwner))
        .filter(Boolean)
    );
    return Array.from(set);
  }, [contactsList]);

  // Handle Quick Create
  function handleCreateSubmit(e) {
    e.preventDefault();
    const fName = firstName.trim();
    const mName = middleName.trim();
    const lName = lastName.trim();
    const fullNameParts = [fName, mName, lName].filter(Boolean);
    const fullName = fullNameParts.length > 0 ? fullNameParts.join(' ') : 'New Contact';

    const newCode = `CT2600${Math.floor(2000 + Math.random() * 900)}`;
    const formattedPhone = phone.trim()
      ? phone.trim().startsWith('+1')
        ? phone.trim()
        : `+1 ${phone.trim()}`
      : '—';

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
      email: email.trim() || '—',
      language: language || 'Vietnamese',
      contactOwner: {
        name: contactOwner || 'The Best Rate Insurance',
        avatar: (contactOwner || 'TB').slice(0, 2).toUpperCase(),
        bg: 'bg-blue-600 text-white',
      },
      howDoYouKnowUs: howDoYouKnowUs || '—',
      whoReferClient: whoReferClient || '',
      teleSaleTeam: teleSaleTeam || '—',
      supportAgent: supportAgent || 'Anya Nguyen (anya42@9)',
      acaAccountStatus: 'Uploaded - Waiting for Verification',
      status: 'Active',
      lastModifiedBy: {
        name: 'Platform Staff',
        avatar: 'PS',
        bg: 'bg-teal-600 text-white',
      },
      lastModifiedTime: 'Just now',
      // Primary matches the create contact information
      primary: {
        firstName: fName || fullName,
        middleName: mName,
        lastName: lName || '',
        dob: '12/28/1995',
        ssn: '673-73-0055',
        familyRelationship: 'Self',
        gender: 'Male',
        immigrationStatus: 'Permanent Resident',
        alienNumber: '219802465',
        certificateNumber: 'IOE0921776907',
        dateExpired: '03/31/2036',
        household: '',
      },
      contactFields: {
        phone: phone.trim() || '(714) 837-2395',
        enrolledAddress: '4301 Laurel Pond Way, Raleigh, NC 27616',
        mailingAddress: '4301 Laurel Pond Way, Raleigh, NC 27616',
        state: 'North Carolina (NC)',
        streetAddress: '4301 Laurel Pond Way',
        city: 'Raleigh',
        postalCode: '27616',
        county: '',
        language: language || 'Vietnamese',
        career: '',
      },
      sourceOfLead: {
        howDoYouKnowUs: howDoYouKnowUs || '---',
        whoReferClient: whoReferClient || '',
        contactOwner: contactOwner || 'The Best Rate Insurance',
        leadOwner: contactOwner || 'The Best Rate Insurance',
        supportAgent: supportAgent || 'Anya Nguyen (anya42@9)',
        medicareShareOwner: '---',
        obamacareSharedOwner: '---',
        lifeSharedOwner: '---',
        contactType: '---',
      },
      associatedDeals: [
        {
          id: `D2600${Math.floor(5000 + Math.random() * 900)}`,
          title: `Non-CMS - ${fullName} - OB 10/2026 (NC)`,
          shortTitle: `Non-CMS - ${fullName.slice(0, 16)}...`,
          pipeline: 'Obamacare 2026',
          stage: 'Ready to Enroll',
          dealOwner: contactOwner || 'The Best Rate Insurance',
          carrier: 'BCBS',
          member: fullName,
        },
      ],
    };

    // Call PostgreSQL API to persist contact
    apiCreateContact({
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
      contactOwnerName: contactOwner || 'The Best Rate Insurance',
      supportAgent: supportAgent,
      status: 'Active',
      deal: {
        id: `D2600${Math.floor(5000 + Math.random() * 900)}`,
        title: `Non-CMS - ${fullName} - OB 10/2026 (NC)`,
        pipeline: 'Obamacare 2026',
        stage: 'Ready to Enroll (Obamacare 2026)',
        carrier: 'BCBS',
        sellingState: 'North Carolina (NC)',
        dealOwnerName: contactOwner || 'The Best Rate Insurance',
      },
    }).catch((err) => console.warn('Could not save to DB:', err));

    setContactsList([newRecord, ...contactsList]);

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
    setContactOwner('The Best Rate Insurance');
    setSupportAgent('Anya Nguyen (anya42@9)');
    setShowCreateModal(false);
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-3 min-w-[1024px]">
      {/* ── 1. Page Header (Contacts + Create + Refresh) ──────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-slate-700">contacts</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contacts</h1>
          {isDbConnected && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              PostgreSQL Active ({contactsList.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
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

      {/* ── 2. View Tabs (Only All Contacts as requested: "phần này chỉ cần all contact thôi") ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 pt-1 text-xs">
        <div className="flex items-center gap-2 px-3 py-2 font-semibold border-b-2 border-blue-600 text-blue-600">
          <span className="material-symbols-outlined text-[16px]">menu</span>
          <span>All Contacts</span>
          {contactsList.length > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
              {contactsList.length}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
              0
            </span>
          )}
        </div>
      </div>

      {/* ── 3. Filters Row ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative w-72">
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
            className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
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
            onClick={() => {}}
            title="Refresh Table"
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 transition"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
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
                          onClick={() => setShowCreateModal(true)}
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
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${contact.contactOwner.bg}`}
                          >
                            {contact.contactOwner.avatar}
                          </div>
                          <span className="text-slate-800 truncate max-w-[130px]">
                            {contact.contactOwner.name}
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
                            {contact.status}
                          </span>
                        </span>
                      </td>

                      {/* Last modified by */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${contact.lastModifiedBy.bg}`}
                          >
                            {contact.lastModifiedBy.avatar}
                          </div>
                          <span className="text-slate-800 truncate max-w-[110px]">
                            {contact.lastModifiedBy.name}
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
                    <option value="Khanh Nguyen">Khanh Nguyen</option>
                    <option value="Trono Truong">Trono Truong</option>
                    <option value="Nancy Pham">Nancy Pham</option>
                    <option value="Jay Ly">Jay Ly</option>
                    <option value="Nathan Truong">Nathan Truong</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 11. Support Agent* */}
              <div>
                <label className="block text-slate-800 font-medium mb-1 text-[11px]">
                  Support Agent <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={supportAgent}
                    onChange={(e) => setSupportAgent(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    <option value="Anya Nguyen (anya42@9)">Anya Nguyen (anya42@9)</option>
                    <option value="Miranda Pham">Miranda Pham</option>
                    <option value="Lisa Le">Lisa Le</option>
                    <option value="Winnie Nguyen">Winnie Nguyen</option>
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
