import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createDocument } from '../../../services/api';


const CATEGORIES = [
  { key: 'identity', label: 'Identity', icon: 'badge', color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'insuranceRecord', label: 'Insurance Record', icon: 'health_and_safety', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'tax', label: 'Tax', icon: 'receipt_long', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'consentFormText', label: 'Consent Form Text', icon: 'assignment', color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'consentFormMkp', label: 'Consent Form MKP', icon: 'description', color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'paymentInformation', label: 'Payment Information', icon: 'credit_card', color: 'text-rose-600', bg: 'bg-rose-50' },
  { key: 'otherDocument', label: 'Other Document', icon: 'folder_open', color: 'text-slate-600', bg: 'bg-slate-50' },
];

// Returns icon + color based on file extension
function getFileTypeInfo(filename) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext)) return { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' };
  if (['doc', 'docx'].includes(ext)) return { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Word' };
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { icon: 'table_chart', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excel' };
  if (['ppt', 'pptx'].includes(ext)) return { icon: 'slideshow', color: 'text-orange-500', bg: 'bg-orange-50', label: 'PPT' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic'].includes(ext)) return { icon: 'image', color: 'text-purple-600', bg: 'bg-purple-50', label: 'Image' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { icon: 'folder_zip', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Archive' };
  return { icon: 'insert_drive_file', color: 'text-slate-500', bg: 'bg-slate-50', label: ext.toUpperCase() || 'File' };
}

export default function CreateCustomerDocumentModal({
  isOpen,
  onClose,
  contact,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'existing'
  const [docName, setDocName] = useState('--');
  const [isEditingName, setIsEditingName] = useState(false);
  const [contactName, setContactName] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);

  const [platformMembers, setPlatformMembers] = useState(() => [
    { name: 'The Best Rate Insurance', handle: 'thebestrate', avatar: 'TB', bg: 'bg-[#0E7490]' },
    { name: 'Platform Staff', handle: 'platformstaff', avatar: 'PS', bg: 'bg-[#475569]' },
    ...getAllPlatformMembers(),
  ]);

  useEffect(() => {
    function handleAccountsUpdated() {
      setPlatformMembers([
        { name: 'The Best Rate Insurance', handle: 'thebestrate', avatar: 'TB', bg: 'bg-[#0E7490]' },
        { name: 'Platform Staff', handle: 'platformstaff', avatar: 'PS', bg: 'bg-[#475569]' },
        ...getAllPlatformMembers(),
      ]);
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  const [selectedOwner, setSelectedOwner] = useState(platformMembers[0]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragOverKey, setDragOverKey] = useState(null); // category key being dragged over

  // Attached files state per category
  const [attachedFiles, setAttachedFiles] = useState({
    identity: [],
    insuranceRecord: [],
    tax: [],
    consentFormText: [],
    consentFormMkp: [],
    paymentInformation: [],
    otherDocument: [],
  });

  // State for 'Add existing' tab
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const fileInputRefs = useRef({});
  const ownerDropdownRef = useRef(null);

  // Initialize from contact
  useEffect(() => {
    if (contact) {
      const cName =
        contact.fullName ||
        [contact.firstName, contact.middleName, contact.lastName]
          .filter(Boolean)
          .join(' ') ||
        contact.name ||
        '';
      setContactName(cName);
      setDocName('--');

      // Match owner safely whether contactOwner is object or string
      const rawOwner = contact.contactOwner || contact.leadOwner || '';
      const cOwner = typeof rawOwner === 'object' ? (rawOwner.name || rawOwner.fullName || '') : String(rawOwner || '');
      const matched = platformMembers.find(
        (a) =>
          cOwner &&
          (cOwner.includes(a.name) ||
            cOwner.includes(a.handle) ||
            cOwner.toLowerCase().includes(a.name.toLowerCase()))
      );
      if (matched) {
        setSelectedOwner(matched);
      } else if (cOwner && cOwner.trim()) {
        setSelectedOwner({
          name: cOwner.split('(')[0].trim(),
          handle: cOwner.includes('@') ? cOwner : 'agent',
          avatar: (cOwner[0] || 'A').toUpperCase(),
          bg: 'bg-[#475569]',
        });
      } else {
        setSelectedOwner(platformMembers[0]);
      }
    }
  }, [contact, isOpen, platformMembers]);

  // Close owner dropdown on click outside
  useEffect(() => {
    function handleDocClick(e) {
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(e.target)) {
        setShowOwnerDropdown(false);
      }
    }
    if (showOwnerDropdown) {
      document.addEventListener('mousedown', handleDocClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
    };
  }, [showOwnerDropdown]);

  if (!isOpen) return null;

  // File upload trigger
  function handleTriggerUpload(key) {
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].click();
    }
  }

  function handleFileSelected(key, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    addFiles(key, files);
    e.target.value = '';
  }

  function addFiles(key, files) {
    const mapped = files.map((f) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: f.name,
      fullName: f.name,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`,
      type: f.name.split('.').pop() || 'doc',
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setAttachedFiles((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...mapped],
    }));
  }

  function handleRemoveFile(key, fileId) {
    setAttachedFiles((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((f) => f.id !== fileId),
    }));
  }

  // Drag & drop handlers
  function handleDragOver(e, key) {
    e.preventDefault();
    setDragOverKey(key);
  }
  function handleDragLeave() {
    setDragOverKey(null);
  }
  function handleDrop(e, key) {
    e.preventDefault();
    setDragOverKey(null);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) addFiles(key, files);
  }

  function handleSave() {
    const finalDocName =
      docName && docName.trim() !== '' && docName !== '--'
        ? docName.trim()
        : contactName || 'Customer Document';

    const initials =
      finalDocName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'CD';

    const now = new Date();
    const dStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const ownerString = selectedOwner
      ? `${selectedOwner.name} (${selectedOwner.handle})`
      : 'Khanh Nguyen (khanhnguyen37@7)';

    const totalFiles = Object.values(attachedFiles).reduce(
      (sum, list) => sum + list.length,
      0
    );

    const categoriesSummary = Object.entries(attachedFiles)
      .filter(([_, list]) => list.length > 0)
      .map(([k, list]) => ({
        key: k,
        label: CATEGORIES.find((c) => c.key === k)?.label || k,
        count: list.length,
      }));

    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: finalDocName,
      initials,
      contactName: contactName || finalDocName,
      contactId: contact?.id || contact?.code || 'CT26002600',
      contactOwner: ownerString,
      lastModifiedTime: `${dStr}, ${tStr}`,
      lastModifiedBy: selectedOwner?.name || 'Khanh Nguyen',
      totalFiles,
      categoriesSummary,
      filesByCategory: attachedFiles,
      associatedContact: {
        id: contact?.id || contact?.code || 'CT26002600',
        name: contactName,
        phone: contact?.phone || contact?.rawPhone || '',
        email: contact?.email || '',
        leadOwner: ownerString,
        language: contact?.language || 'Vietnamese',
      },
    };

    addCustomerDocumentToStore(newDoc);
    createDocument({
      name: finalDocName,
      contactOwner: ownerString,
      lastModifiedBy: selectedOwner?.name || 'Staff',
    }).catch((err) => console.warn('[CreateCustomerDocumentModal] Live save fallback:', err));

    if (onSave) {
      onSave(newDoc);
    }
    onClose();
  }

  // Filtered owners for dropdown
  const filteredOwners = platformMembers.filter((a) =>
    `${a.name} ${a.handle || ''}`.toLowerCase().includes(ownerSearchQuery.toLowerCase())
  );

  // Available existing documents
  const allExistingDocuments = [
    ...[],
    ...[],
  ];

  const totalUploadedFiles = Object.values(attachedFiles).reduce((sum, list) => sum + list.length, 0);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 my-auto ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none'
            : 'w-full max-w-3xl max-h-[92vh]'
        }`}
      >
        {/* ── Top Header Bar ────────────── */}
        <div className="px-5 py-3.5 bg-[#104882] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              CREATE CUSTOMER DOCUMENT
            </h3>
            {totalUploadedFiles > 0 && (
              <span className="ml-1 bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {totalUploadedFiles} file{totalUploadedFiles > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'close_fullscreen' : 'fullscreen'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Đóng"
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* ── Sub Tabs Bar ────────────────────────────────────────────── */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-8 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#104882] text-[#104882] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Create new</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'existing'
                ? 'border-[#104882] text-[#104882] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>Add existing</span>
          </button>
        </div>

        {/* ── Modal Body Content ──────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-4">
          {activeTab === 'create' ? (
            <>
              {/* Field 1: Name * */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  {isEditingName ? (
                    <input
                      type="text"
                      autoFocus
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingName(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-blue-500 focus:outline-none text-xs text-slate-800 pr-8 bg-white"
                      placeholder="e.g. Khanh Tam"
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingName(true)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs text-slate-600 flex items-center justify-between cursor-pointer transition"
                    >
                      <span className={docName === '--' ? 'text-slate-400 font-mono' : 'font-medium text-slate-800'}>
                        {docName}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-blue-600">
                        edit
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Field 2: Contact Owner */}
              <div className="relative" ref={ownerDropdownRef}>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Contact Owner
                </label>
                <div
                  onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                        selectedOwner?.bg || 'bg-slate-500'
                      }`}
                    >
                      {selectedOwner?.avatar || 'KN'}
                    </div>
                    <span className="font-medium text-slate-800 truncate">
                      {selectedOwner?.name || 'Khanh Nguyen'} ({selectedOwner?.handle || 'khanhnguyen37@7'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOwner(null);
                      }}
                      title="Clear"
                      className="p-0.5 rounded hover:bg-slate-100 text-rose-500 hover:text-rose-700 transition"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                    <span className="material-symbols-outlined text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Owner Dropdown */}
                {showOwnerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <input
                        type="text"
                        autoFocus
                        value={ownerSearchQuery}
                        onChange={(e) => setOwnerSearchQuery(e.target.value)}
                        placeholder="Search agent owner..."
                        className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                      {filteredOwners.map((agent) => (
                        <div
                          key={agent.handle}
                          onClick={() => {
                            setSelectedOwner(agent);
                            setShowOwnerDropdown(false);
                            setOwnerSearchQuery('');
                          }}
                          className="px-3 py-2 flex items-center gap-2 hover:bg-blue-50/70 transition cursor-pointer"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${agent.bg}`}
                          >
                            {agent.avatar}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-slate-800">{agent.name}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5 font-mono">
                              ({agent.handle})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Field 3: Contact */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Contact
                </label>
                <div className="relative flex items-center">
                  {isEditingContact ? (
                    <input
                      type="text"
                      autoFocus
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      onBlur={() => setIsEditingContact(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingContact(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-blue-500 focus:outline-none text-xs text-slate-800 pr-8 bg-white font-medium"
                      placeholder="Contact name"
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingContact(true)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs text-slate-800 font-medium flex items-center justify-between cursor-pointer transition"
                    >
                      <span>{contactName || 'Huy Dinh Tran'}</span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-blue-600">
                        edit
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Document Categories ── */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800">Documents by Category</span>
                  {totalUploadedFiles > 0 && (
                    <span className="text-[11px] text-slate-500">
                      {totalUploadedFiles} file{totalUploadedFiles > 1 ? 's' : ''} uploaded
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {CATEGORIES.map((cat) => {
                    const files = attachedFiles[cat.key] || [];
                    const isDragOver = dragOverKey === cat.key;

                    return (
                      <div
                        key={cat.key}
                        className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                          isDragOver
                            ? 'border-blue-400 bg-blue-50/60 shadow-sm'
                            : files.length > 0
                            ? 'border-slate-200 bg-white shadow-xs'
                            : 'border-slate-200 bg-white'
                        }`}
                        onDragOver={(e) => handleDragOver(e, cat.key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, cat.key)}
                      >
                        {/* Category Header Row */}
                        <div className="flex items-center justify-between px-3.5 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.bg}`}>
                              <span className={`material-symbols-outlined text-[16px] ${cat.color}`}>
                                {cat.icon}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-800 text-xs">{cat.label}</span>
                            {files.length > 0 && (
                              <span className="ml-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#104882] text-white text-[10px] font-bold shrink-0">
                                {files.length}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isDragOver ? (
                              <span className="text-[11px] text-blue-600 font-semibold animate-pulse">
                                Drop to upload
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(cat.key)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#104882] hover:text-blue-700 font-semibold cursor-pointer transition hover:underline"
                              >
                                <span className="material-symbols-outlined text-[14px] -rotate-45">attach_file</span>
                                <span>Add new</span>
                              </button>
                            )}

                            {/* Hidden file input */}
                            <input
                              type="file"
                              multiple
                              ref={(el) => (fileInputRefs.current[cat.key] = el)}
                              onChange={(e) => handleFileSelected(cat.key, e)}
                              className="hidden"
                            />
                          </div>
                        </div>

                        {/* Uploaded files list */}
                        {files.length > 0 && (
                          <div className="border-t border-slate-100 px-3.5 py-2.5 bg-slate-50/60 space-y-1.5">
                            {files.map((file) => {
                              const typeInfo = getFileTypeInfo(file.name);
                              return (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-3 py-2 group hover:border-blue-200 hover:shadow-xs transition-all"
                                >
                                  {/* File type icon */}
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.bg}`}>
                                    <span className={`material-symbols-outlined text-[18px] ${typeInfo.color}`}>
                                      {typeInfo.icon}
                                    </span>
                                  </div>

                                  {/* File info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-800 text-[11px] truncate" title={file.name}>
                                      {file.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color}`}>
                                        {typeInfo.label}
                                      </span>
                                      <span className="text-[10px] text-slate-400">{file.size}</span>
                                      {file.uploadedAt && (
                                        <span className="text-[10px] text-slate-400">· {file.uploadedAt}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                      type="button"
                                      title="Remove"
                                      onClick={() => handleRemoveFile(cat.key, file.id)}
                                      className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">delete</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Drop more hint */}
                            <button
                              type="button"
                              onClick={() => handleTriggerUpload(cat.key)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40 transition cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              <span>Add more files</span>
                            </button>
                          </div>
                        )}

                        {/* Drag hint when empty */}
                        {files.length === 0 && isDragOver && (
                          <div className="px-3.5 pb-2.5">
                            <div className="border-2 border-dashed border-blue-400 rounded-lg py-3 flex flex-col items-center gap-1 bg-blue-50/40">
                              <span className="material-symbols-outlined text-blue-500 text-[22px]">cloud_upload</span>
                              <span className="text-[11px] text-blue-600 font-semibold">Drop files here</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* ── Add Existing Tab ── */
            <div className="space-y-3 py-2">
              <label className="block text-slate-800 font-bold mb-1 text-xs">
                Select from Existing Customer Documents
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {allExistingDocuments.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 italic">
                    Không có customer document nào trong hệ thống
                  </div>
                ) : (
                  allExistingDocuments.map((doc) => {
                    const isSelected = selectedExistingId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedExistingId(doc.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#52B4C9] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {doc.initials || 'CD'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-xs truncate">
                              {doc.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              Contact: {doc.contactName} • {doc.totalFiles || 0} files
                            </p>
                          </div>
                        </div>

                        <input
                          type="radio"
                          name="existingDocRadio"
                          checked={isSelected}
                          onChange={() => setSelectedExistingId(doc.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ─────────── */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={activeTab === 'create' ? handleSave : () => {
              const found = allExistingDocuments.find((d) => d.id === selectedExistingId);
              if (found) {
                if (onSave) onSave(found);
                onClose();
              }
            }}
            className="px-5 py-2 rounded-lg bg-[#6F8BB7] hover:bg-[#5B7EB0] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#555E6D] hover:bg-[#464D59] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
