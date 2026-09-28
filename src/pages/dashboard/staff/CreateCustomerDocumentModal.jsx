import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  addCustomerDocumentToStore,
  getDynamicCustomerDocuments,
  SAMPLE_CUSTOMER_DOCUMENTS,
} from '../../../data/mockCrmData';

const AGENT_OPTIONS = [
  { name: 'Khanh Nguyen', handle: 'khanhnguyen37@7', avatar: 'KN', bg: 'bg-[#475569]' },
  { name: 'Tiger Truong', handle: 'tigertruong86@8', avatar: 'TT', bg: 'bg-[#EA580C]' },
  { name: 'Amy Vo', handle: 'amyvo27@0', avatar: 'AV', bg: 'bg-[#3B82F6]' },
  { name: 'Anh Pham', handle: 'anhlpham14@3', avatar: 'AP', bg: 'bg-[#C2410C]' },
  { name: 'anhthu.tran', handle: 'anhthu.tran59@4', avatar: 'AT', bg: 'bg-[#2563EB]' },
  { name: 'Bao Uyen', handle: 'baouyen76@8', avatar: 'BU', bg: 'bg-[#15803D]' },
  { name: 'Bella Nhi Nguyen', handle: 'bellan.nguyen86@0', avatar: 'BN', bg: 'bg-[#92400E]' },
  { name: 'Bijou Tran', handle: 'bijou.trantbr164', avatar: 'BT', bg: 'bg-[#991B1B]' },
  { name: 'Jay Ly', handle: 'trichauly24@7', avatar: 'JL', bg: 'bg-[#059669]' },
  { name: 'Sarah Thai', handle: 'sarahthai20@1', avatar: 'ST', bg: 'bg-[#7C3AED]' },
  { name: 'Sean Ngo', handle: 'sean75@8', avatar: 'SN', bg: 'bg-[#0D9488]' },
  { name: 'The Best Rate Insurance', handle: 'thebestrate', avatar: 'TB', bg: 'bg-[#0E7490]' },
  { name: 'Platform Staff', handle: 'platformstaff', avatar: 'PS', bg: 'bg-[#475569]' },
];

const CATEGORIES = [
  { key: 'identity', label: 'Identity' },
  { key: 'insuranceRecord', label: 'Insurance Record' },
  { key: 'tax', label: 'Tax' },
  { key: 'consentFormText', label: 'Consent Form Text' },
  { key: 'consentFormMkp', label: 'Consent Form MKP' },
  { key: 'paymentInformation', label: 'Payment Information' },
  { key: 'otherDocument', label: 'Other Document' },
];

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
  const [selectedOwner, setSelectedOwner] = useState(AGENT_OPTIONS[0]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

      // Match owner
      const cOwner = contact.contactOwner || contact.leadOwner || '';
      const matched = AGENT_OPTIONS.find(
        (a) =>
          cOwner.includes(a.name) ||
          cOwner.includes(a.handle) ||
          (typeof cOwner === 'string' && cOwner.toLowerCase().includes(a.name.toLowerCase()))
      );
      if (matched) {
        setSelectedOwner(matched);
      } else if (cOwner && typeof cOwner === 'string' && cOwner.trim()) {
        setSelectedOwner({
          name: cOwner.split('(')[0].trim(),
          handle: cOwner.includes('@') ? cOwner : 'agent',
          avatar: (cOwner[0] || 'A').toUpperCase(),
          bg: 'bg-[#475569]',
        });
      } else {
        setSelectedOwner(AGENT_OPTIONS[0]);
      }
    }
  }, [contact, isOpen]);

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
    const mapped = files.map((f) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: f.name,
      fullName: f.name,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`,
      type: f.name.split('.').pop() || 'doc',
    }));

    setAttachedFiles((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...mapped],
    }));
    e.target.value = '';
  }

  function handleRemoveFile(key, fileId) {
    setAttachedFiles((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((f) => f.id !== fileId),
    }));
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
    if (onSave) {
      onSave(newDoc);
    }
    onClose();
  }

  // Filtered owners for dropdown
  const filteredOwners = AGENT_OPTIONS.filter((a) =>
    `${a.name} ${a.handle}`.toLowerCase().includes(ownerSearchQuery.toLowerCase())
  );

  // Available existing documents
  const allExistingDocuments = [
    ...getDynamicCustomerDocuments(),
    ...SAMPLE_CUSTOMER_DOCUMENTS,
  ];

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
        {/* ── Top Header Bar (Matching media_1790590561081.png) ────────── */}
        <div className="px-5 py-3.5 bg-[#104882] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              edit
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              CREATE CUSTOMER DOCUMENT
            </h3>
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

              {/* ── Document Categories List (Matching media_1790590561081.png) ── */}
              <div className="pt-2 space-y-3">
                {CATEGORIES.map((cat) => {
                  const files = attachedFiles[cat.key] || [];

                  return (
                    <div key={cat.key} className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-xs min-w-[150px]">
                          {cat.label}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(cat.key)}
                          className="inline-flex items-center gap-1 text-[#104882] hover:text-blue-700 text-xs font-semibold cursor-pointer transition hover:underline"
                        >
                          <span className="material-symbols-outlined text-[15px] rotate-45 text-slate-500">
                            attach_file
                          </span>
                          <span>Add new</span>
                        </button>

                        {/* Hidden file input */}
                        <input
                          type="file"
                          multiple
                          ref={(el) => (fileInputRefs.current[cat.key] = el)}
                          onChange={(e) => handleFileSelected(cat.key, e)}
                          className="hidden"
                        />
                      </div>

                      {/* Display attached files for this category */}
                      {files.length > 0 && (
                        <div className="pl-4 flex flex-wrap gap-2 pt-1">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                            >
                              <span className="material-symbols-outlined text-[14px] text-blue-600">
                                description
                              </span>
                              <span className="font-medium truncate max-w-[180px]" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-slate-400 text-[10px]">({file.size})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(cat.key, file.id)}
                                className="text-slate-400 hover:text-rose-600 transition cursor-pointer ml-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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

        {/* ── Modal Footer (Matching media_1790590561081.png) ─────────── */}
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
