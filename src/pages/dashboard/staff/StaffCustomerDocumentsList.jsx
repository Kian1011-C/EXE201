import React, { useState, useMemo, useEffect } from 'react';
import { getDocuments } from '../../../services/api';
import {
  SAMPLE_CUSTOMER_DOCUMENTS,
  getDynamicCustomerDocuments,
  addCustomerDocumentToStore,
  SAMPLE_CONTACTS,
  getDynamicContacts,
} from '../../../data/mockCrmData';
import { useAuth } from '../../../auth/AuthContext';
import { filterCustomerDocumentsForAgent, getAgentIdentity } from '../../../utils/rbac';
import CreateCustomerDocumentModal from './CreateCustomerDocumentModal';

export const DOCUMENT_CATEGORIES = [
  { key: 'identity', label: 'Identity', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'consentFormMkp', label: 'Consent Form MKP', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'consentFormText', label: 'Consent Form Text', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'paymentInformation', label: 'Payment Information', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'insuranceRecord', label: 'Insurance Record', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'tax', label: 'Tax', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'otherDocument', label: 'Other Document', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export default function StaffCustomerDocumentsList({
  onSelectCustomerDocument,
  onSelectContact,
  onSelectDeal,
  isAgent = false,
  agentName = '',
}) {
  const [documentsList, setDocumentsList] = useState(() => {
    const dyn = getDynamicCustomerDocuments();
    const dynIds = new Set(dyn.map((d) => d.id));
    return [...dyn, ...SAMPLE_CUSTOMER_DOCUMENTS.filter((d) => !dynIds.has(d.id))];
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'with-files' | 'empty'
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(25);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  // Load from API or fallback to mock
  async function loadData() {
    setLoading(true);
    try {
      const data = await getDocuments();
      const dyn = getDynamicCustomerDocuments();
      const dynIds = new Set(dyn.map((d) => d.id));
      if (Array.isArray(data) && data.length > 0) {
        setDocumentsList([...dyn, ...data.filter((d) => !dynIds.has(d.id))]);
      } else {
        setDocumentsList([...dyn, ...SAMPLE_CUSTOMER_DOCUMENTS.filter((d) => !dynIds.has(d.id))]);
      }
    } catch {
      const dyn = getDynamicCustomerDocuments();
      const dynIds = new Set(dyn.map((d) => d.id));
      setDocumentsList([...dyn, ...SAMPLE_CUSTOMER_DOCUMENTS.filter((d) => !dynIds.has(d.id))]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const { user } = useAuth();
  const activeIsAgent = isAgent || user?.role === 'agent';
  const effectiveAgent = getAgentIdentity(user || (isAgent ? { role: 'agent', name: agentName } : null));

  // Scoped list: if agent, only records assigned to this agent
  const scopedDocuments = useMemo(() => {
    if (activeIsAgent) {
      return filterCustomerDocumentsForAgent(
        documentsList,
        user || { role: 'agent', name: effectiveAgent.name }
      );
    }
    return documentsList;
  }, [documentsList, activeIsAgent, user, effectiveAgent.name]);

  // Unique owners
  const ownerOptions = useMemo(() => {
    const set = new Set(scopedDocuments.map((d) => d.contactOwner).filter(Boolean));
    return Array.from(set);
  }, [scopedDocuments]);

  // Compute file count from document
  function countDocumentFiles(doc) {
    if (doc.totalFiles !== undefined) return doc.totalFiles;
    if (!doc.filesByCategory) return 0;
    return Object.values(doc.filesByCategory).reduce(
      (sum, files) => sum + (Array.isArray(files) ? files.length : 0),
      0
    );
  }

  // Compute active categories with counts
  function getActiveCategories(doc) {
    if (doc.categoriesSummary && Array.isArray(doc.categoriesSummary)) {
      return doc.categoriesSummary;
    }
    if (!doc.filesByCategory) return [];
    const active = [];
    DOCUMENT_CATEGORIES.forEach((cat) => {
      const files = doc.filesByCategory[cat.key];
      if (Array.isArray(files) && files.length > 0) {
        active.push({
          key: cat.key,
          label: cat.label,
          count: files.length,
          color: cat.color,
        });
      }
    });
    return active;
  }

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return scopedDocuments.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const name = (doc.name || '').toLowerCase();
      const contactName = (doc.contactName || doc.associatedContact?.name || '').toLowerCase();
      const contactCode = (doc.contactId || doc.associatedContact?.id || '').toLowerCase();
      const owner = (doc.contactOwner || '').toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        contactName.includes(q) ||
        contactCode.includes(q) ||
        owner.includes(q);

      const matchesOwner =
        ownerFilter === 'all' || owner.includes(ownerFilter.toLowerCase());

      const activeCats = getActiveCategories(doc);
      const matchesCategory =
        categoryFilter === 'all' ||
        activeCats.some((c) => c.key === categoryFilter);

      const totalFiles = countDocumentFiles(doc);
      let matchesStatus = true;
      if (statusFilter === 'with-files') matchesStatus = totalFiles > 0;
      else if (statusFilter === 'empty') matchesStatus = totalFiles === 0;

      return matchesSearch && matchesOwner && matchesCategory && matchesStatus;
    });
  }, [scopedDocuments, searchQuery, ownerFilter, categoryFilter, statusFilter]);

  // Stat metrics
  const stats = useMemo(() => {
    const total = scopedDocuments.length;
    let withFiles = 0;
    let empty = 0;
    let totalFilesCount = 0;
    scopedDocuments.forEach((d) => {
      const cnt = countDocumentFiles(d);
      totalFilesCount += cnt;
      if (cnt > 0) withFiles++;
      else empty++;
    });
    return { total, withFiles, empty, totalFilesCount };
  }, [scopedDocuments]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / displayCount));
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * displayCount;
    return filteredDocuments.slice(start, start + displayCount);
  }, [filteredDocuments, currentPage, displayCount]);

  // Checkbox handlers
  const allCurrentPageSelected =
    paginatedDocs.length > 0 && paginatedDocs.every((d) => selectedRowIds.includes(d.id));

  function handleToggleSelectAll() {
    if (allCurrentPageSelected) {
      const pageIds = new Set(paginatedDocs.map((d) => d.id));
      setSelectedRowIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = paginatedDocs.map((d) => d.id);
      setSelectedRowIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  }

  function handleToggleRow(id) {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // Create Document Modal State
  const [newContactId, setNewContactId] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocOwner, setNewDocOwner] = useState('Khanh Nguyen (khanhnguyen31@7)');
  const [newDocCategory, setNewDocCategory] = useState('identity');

  // Contact options for modal
  const availableContacts = useMemo(() => {
    const dyn = getDynamicContacts();
    return [...dyn, ...SAMPLE_CONTACTS];
  }, []);

  function handleOpenCreateModal() {
    if (availableContacts.length > 0) {
      const first = availableContacts[0];
      setNewContactId(first.id || first.code || '');
      setNewDocName(first.fullName || `${first.firstName || ''} ${first.lastName || ''}`.trim() || 'Customer Document');
      setNewDocOwner(typeof first.contactOwner === 'string' ? first.contactOwner : 'Khanh Nguyen (khanhnguyen31@7)');
    }
    setShowCreateModal(true);
  }

  function handleCreateSubmit(e) {
    e.preventDefault();
    const contact = availableContacts.find((c) => c.id === newContactId || c.code === newContactId);
    const cName = newDocName.trim() || contact?.fullName || 'Customer Document';
    const initials = cName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CD';

    const now = new Date();
    const dStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: cName,
      initials,
      contactName: contact?.fullName || cName,
      contactId: contact?.id || contact?.code || 'CT26009999',
      contactOwner: newDocOwner,
      lastModifiedTime: `${dStr}, ${tStr}`,
      lastModifiedBy: newDocOwner.split('(')[0].trim() || 'Staff',
      totalFiles: 0,
      categoriesSummary: [],
      filesByCategory: {
        consentFormMkp: [],
        consentFormText: [],
        identity: [],
        insuranceRecord: [],
        otherDocument: [],
        paymentInformation: [],
        tax: [],
      },
      associatedContact: {
        id: contact?.id || contact?.code || 'CT26009999',
        name: contact?.fullName || cName,
        phone: contact?.phone || '',
        email: contact?.email || '',
        leadOwner: newDocOwner,
        language: contact?.language || 'Vietnamese',
      },
    };

    addCustomerDocumentToStore(newDoc);
    setDocumentsList((prev) => [newDoc, ...prev]);
    setShowCreateModal(false);
    showToast(`Đã tạo hồ sơ tài liệu cho ${cName}!`);
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0F2962] text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Bar Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">folder_shared</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                All Customer Documents
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#104882] border border-blue-200">
                {scopedDocuments.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quản lý hồ sơ tài liệu xác thực, hợp đồng và hóa đơn đính kèm của khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              loadData();
              showToast('Customer documents refreshed');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">refresh</span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#52B4C9] hover:bg-[#439cae] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>Create Document Record</span>
          </button>
        </div>
      </div>

      {/* ── Quick Stat Cards Row ───────────────────────────────────────────── */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3.5 shrink-0">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/70 border-blue-300 shadow-2xs ring-1 ring-blue-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Total Records</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">folder</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tất cả khách hàng</div>
        </div>

        <div
          onClick={() => setStatusFilter('with-files')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            statusFilter === 'with-files'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs ring-1 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">With Attached Files</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">task_alt</span>
          </div>
          <div className="text-xl font-bold text-emerald-700">{stats.withFiles}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Đã tải lên tài liệu xác thực</div>
        </div>

        <div
          onClick={() => setStatusFilter('empty')}
          className={`p-3 rounded-xl border transition cursor-pointer ${
            statusFilter === 'empty'
              ? 'bg-amber-50/70 border-amber-300 shadow-2xs ring-1 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-amber-700">No Files Attached</span>
            <span className="material-symbols-outlined text-[18px] text-amber-600">pending</span>
          </div>
          <div className="text-xl font-bold text-amber-700">{stats.empty}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Chưa có file (Mới tạo)</div>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Total Files Stored</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-600">attach_file</span>
          </div>
          <div className="text-xl font-bold text-indigo-700">{stats.totalFilesCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">PDF, Hình ảnh & Hóa đơn</div>
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5 flex-grow max-w-2xl">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-grow">
            <span className="material-symbols-outlined text-[17px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              placeholder="Search by customer name, contact ID, owner..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="all">All Owners</option>
            {ownerOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="all">All Categories</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || ownerFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setOwnerFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">clear_all</span>
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredDocuments.length}</span> of {scopedDocuments.length} records
        </div>
      </div>

      {/* ── Main Documents Table ───────────────────────────────────────────── */}
      <div className="flex-grow px-6 pb-6 overflow-hidden flex flex-col">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col flex-grow">
          {/* Table Header Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="material-symbols-outlined text-[17px] text-[#104882]">description</span>
              <span>Customer Document Records</span>
              {selectedRowIds.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {selectedRowIds.length} Selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Rows per page:</span>
              <select
                value={displayCount}
                onChange={(e) => {
                  setDisplayCount(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap min-w-[1000px]">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 w-10 text-center">#</th>
                  <th className="px-3 py-2.5 font-bold text-slate-900">Document / Customer Name</th>
                  <th className="px-3 py-2.5">Associated Contact</th>
                  <th className="px-3 py-2.5">Contact Owner</th>
                  <th className="px-3 py-2.5">Attached Categories</th>
                  <th className="px-3 py-2.5 text-center">Total Files</th>
                  <th className="px-3 py-2.5">Last Modified Time</th>
                  <th className="px-3 py-2.5">Last Modified By</th>
                  <th className="px-3 py-2.5 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-[28px]">folder_off</span>
                        </div>
                        <div className="text-sm font-bold text-slate-800">No documents found</div>
                        <p className="text-xs text-slate-400">
                          Không tìm thấy tài liệu khách hàng nào phù hợp với bộ lọc hiện tại.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map((doc, idx) => {
                    const rowNo = (currentPage - 1) * displayCount + idx + 1;
                    const isSelected = selectedRowIds.includes(doc.id);
                    const totalFiles = countDocumentFiles(doc);
                    const activeCats = getActiveCategories(doc);

                    return (
                      <tr
                        key={doc.id}
                        className={`transition hover:bg-blue-50/30 ${
                          isSelected ? 'bg-blue-50/40' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(doc.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Index */}
                        <td className="px-3 py-2.5 text-center font-mono text-slate-400 text-[10px]">
                          {rowNo}
                        </td>

                        {/* Document Name */}
                        <td className="px-3 py-2.5">
                          <div
                            onClick={() => onSelectCustomerDocument && onSelectCustomerDocument(doc)}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                              {doc.initials || 'CD'}
                            </div>
                            <span className="font-bold text-[#104882] group-hover:text-blue-700 group-hover:underline truncate max-w-[180px]">
                              {doc.name || 'Untitled Document'}
                            </span>
                          </div>
                        </td>

                        {/* Associated Contact */}
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              onSelectContact &&
                              onSelectContact(doc.associatedContact || { fullName: doc.contactName, id: doc.contactId })
                            }
                            className="font-medium text-slate-700 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                            <span>{doc.contactName || doc.associatedContact?.name || 'Contact'}</span>
                          </button>
                        </td>

                        {/* Contact Owner */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {(doc.contactOwner || 'KN').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-700 truncate max-w-[140px]">
                              {doc.contactOwner || 'Unassigned'}
                            </span>
                          </div>
                        </td>

                        {/* Attached Categories */}
                        <td className="px-3 py-2.5">
                          {activeCats.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 max-w-[280px]">
                              {activeCats.map((cat) => (
                                <span
                                  key={cat.key}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${cat.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                                >
                                  {cat.label} ({cat.count})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] italic text-slate-400 border border-dashed border-slate-200 px-2 py-0.5 rounded bg-slate-50">
                              <span className="material-symbols-outlined text-[12px]">description</span>
                              <span>No files attached</span>
                            </span>
                          )}
                        </td>

                        {/* Total Files Badge */}
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              totalFiles > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {totalFiles} file{totalFiles !== 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Last Modified Time */}
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-600">
                          {doc.lastModifiedTime || '_ _ _ _'}
                        </td>

                        {/* Last Modified By */}
                        <td className="px-3 py-2.5 text-slate-700">
                          {doc.lastModifiedBy || 'Staff'}
                        </td>

                        {/* Action */}
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => onSelectCustomerDocument && onSelectCustomerDocument(doc)}
                            className="px-2 py-1 rounded bg-blue-50 text-[#104882] hover:bg-blue-100 font-semibold text-[10px] transition cursor-pointer"
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <div>
              Trang <span className="font-bold text-slate-800">{currentPage}</span> / {totalPages}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create / Attach Document Modal Matching media_1790590561081.png (Hình 3) ── */}
      <CreateCustomerDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        contact={availableContacts[0]}
        onSave={(newDoc) => {
          setDocumentsList((prev) => [newDoc, ...prev]);
          showToast(`Đã tạo Customer Document: ${newDoc.name}!`);
        }}
      />
    </div>
  );
}
