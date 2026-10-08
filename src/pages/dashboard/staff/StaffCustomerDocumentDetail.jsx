import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  addDocumentFile,
  deleteDocumentFile,
  updateDocument,
  updateCustomerDocumentInStore,
  getDocument,
  getContacts,
  getUsers,
} from '../../../services/api';
import { getActiveAgentAccounts } from '../../../utils/constants';
import { useAuth } from '../../../auth/AuthContext';
import { getCurrentActor, getPropertyHistory } from '../../../services/propertyHistoryService';
import toast from 'react-hot-toast';

function cleanOwnerName(owner) {
  if (!owner) return '';
  if (typeof owner === 'object') return owner.name || owner.fullName || '';
  const str = String(owner);
  if (str.includes('(')) return str.split('(')[0].trim();
  return str.trim();
}

export default function StaffCustomerDocumentDetail({
  documentData,
  onBack,
  onSelectContact,
  onSelectDeal,
  onUpdateDocument,
}) {
  const doc = {
    ...(documentData || {}),
  };

  const { user } = useAuth();
  const currentActor = getCurrentActor(user);

  const [docName, setDocName] = useState(doc.name || '');
  const [contactOwner, setContactOwner] = useState(() => cleanOwnerName(doc.contactOwner));
  const [agentAccounts, setAgentAccounts] = useState(() => getActiveAgentAccounts());
  const [contactsList, setContactsList] = useState([]);

  // Modals state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAllPropertiesModal, setShowAllPropertiesModal] = useState(false);
  const [showLinkContactModal, setShowLinkContactModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    function handleAccountsUpdated() {
      setAgentAccounts(getActiveAgentAccounts());
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    getUsers()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setAgentAccounts(getActiveAgentAccounts());
        }
      })
      .catch(() => {});
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  useEffect(() => {
    if (doc.contactOwner) {
      setContactOwner(cleanOwnerName(doc.contactOwner));
    }
    if (doc.name) {
      setDocName(doc.name);
    }
    if (doc.filesByCategory) {
      setFilesByCategory(doc.filesByCategory);
    }
  }, [documentData?.id, documentData?.contactOwner, documentData?.name]);

  useEffect(() => {
    getContacts()
      .then((res) => {
        if (Array.isArray(res)) setContactsList(res);
      })
      .catch(() => {});
  }, []);

  const [aboutOpen, setAboutOpen] = useState(true);
  const [lastModifiedTime, setLastModifiedTime] = useState(
    doc.lastModifiedTime || '09/27/2026, 10:07'
  );

  // Default empty categories unless explicitly provided or marked as sample
  const [filesByCategory, setFilesByCategory] = useState(() => {
    if (doc.filesByCategory) return doc.filesByCategory;
    if (doc.hasDocs || doc.name === '123 123') {
      return ({ filesByCategory: {} }).filesByCategory;
    }
    return {
      consentFormMkp: [],
      consentFormText: [],
      identity: [],
      insuranceRecord: [],
      otherDocument: [],
      paymentInformation: [],
      tax: [],
    };
  });

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Category definitions exactly matching uploaded image
  const categories = [
    { key: 'consentFormMkp', label: 'Consent form MKP' },
    { key: 'consentFormText', label: 'Consent form text' },
    { key: 'identity', label: 'Identity' },
    { key: 'insuranceRecord', label: 'Insurance record' },
    { key: 'otherDocument', label: 'Other document' },
    { key: 'paymentInformation', label: 'Payment information' },
    { key: 'tax', label: 'Tax' },
  ];

  // Hidden file input refs for each category
  const fileInputRefs = useRef({});

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }

  function handleTriggerUpload(categoryKey) {
    if (fileInputRefs.current[categoryKey]) {
      fileInputRefs.current[categoryKey].click();
    }
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const currentInitials =
    doc.initials ||
    (docName || '')
      ?.split(' ')
      ?.filter(Boolean)
      ?.map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'HN';

  function handleFileUpload(categoryKey, event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files)?.map((file) => {
      const isPdf =
        file.type.includes('pdf') || file?.name?.toLowerCase().endsWith('.pdf');
      const isImg =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(file?.name);

      return {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name: file?.name.length > 24 ? file?.name.slice(0, 20) + '...' : file?.name,
        fullName: file?.name,
        size: formatFileSize(file.size),
        type: isPdf ? 'pdf' : isImg ? 'image' : 'document',
        url: URL.createObjectURL(file),
      };
    });

    const now = new Date();
    const dStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newTimestamp = `${dStr}, ${tStr}`;
    setLastModifiedTime(newTimestamp);

    setFilesByCategory((prev) => {
      const updated = {
        ...prev,
        [categoryKey]: [...(prev[categoryKey] || []), ...newFiles],
      };
      const totalFiles = Object.values(updated)?.reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      );
      const categoriesSummary = categories
        ?.filter((c) => Array.isArray(updated[c.key]) && updated[c.key].length > 0)
        ?.map((c) => ({
          key: c.key,
          label: c.label,
          count: updated[c.key].length,
          files: updated[c.key],
        }));

      const updatedDoc = {
        ...doc,
        name: docName,
        initials: currentInitials,
        contactOwner: contactOwner,
        filesByCategory: updated,
        totalFiles,
        categoriesSummary,
        lastModifiedTime: newTimestamp,
        lastModifiedBy: doc.lastModifiedBy || '',
      };

      updateCustomerDocumentInStore(updatedDoc);
      if (doc?.id) {
        updateDocument(doc.id, {
          name: docName,
          contactOwner: contactOwner,
          lastModifiedBy: doc.lastModifiedBy || 'Staff',
          contactId: doc.contactId || (doc.associatedContact ? doc.associatedContact.id : null),
        }).then((savedDoc) => {
          const targetDocId = savedDoc?.id || doc.id;
          if (targetDocId && !String(targetDocId).startsWith('doc-')) {
            newFiles.forEach((nf) => {
              addDocumentFile(targetDocId, {
                category: categoryKey,
                name: nf.name,
                fullName: nf.fullName,
                size: nf.size,
                type: nf.type,
                url: nf.url || '',
              }).catch((err) => console.warn('[StaffCustomerDocumentDetail] Add file API fallback:', err));
            });
          }
        }).catch((err) => console.warn('[StaffCustomerDocumentDetail] Update doc API fallback:', err));
      }
      if (onUpdateDocument) {
        onUpdateDocument(updatedDoc);
      }
      return updated;
    });

    // Reset input value to allow uploading the same file again if needed
    event.target.value = '';

    const catTitle = categories.find((c) => c.key === categoryKey)?.label || '';
    showToast(`Added ${newFiles.length} file(s) to ${catTitle}`);
  }

  function handleDeleteFile(categoryKey, fileId, fileName) {
    const now = new Date();
    const dStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newTimestamp = `${dStr}, ${tStr}`;
    setLastModifiedTime(newTimestamp);

    setFilesByCategory((prev) => {
      const updated = {
        ...prev,
        [categoryKey]: (prev[categoryKey] || [])?.filter((f) => f.id !== fileId),
      };
      const totalFiles = Object.values(updated)?.reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      );
      const categoriesSummary = categories
        ?.filter((c) => Array.isArray(updated[c.key]) && updated[c.key].length > 0)
        ?.map((c) => ({
          key: c.key,
          label: c.label,
          count: updated[c.key].length,
          files: updated[c.key],
        }));

      const updatedDoc = {
        ...doc,
        name: docName,
        initials: currentInitials,
        contactOwner: contactOwner,
        filesByCategory: updated,
        totalFiles,
        categoriesSummary,
        lastModifiedTime: newTimestamp,
        lastModifiedBy: doc.lastModifiedBy || '',
      };

      updateCustomerDocumentInStore(updatedDoc);
      if (doc?.id) {
        deleteDocumentFile(doc.id, fileId).catch((err) =>
          console.warn('[StaffCustomerDocumentDetail] Delete file API fallback:', err)
        );
      }
      if (onUpdateDocument) {
        onUpdateDocument(updatedDoc);
      }
      return updated;
    });
    showToast(`Removed file ${fileName || ''}`);
  }

  const handleBack = () => {
    const totalFiles = Object.values(filesByCategory)?.reduce(
      (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
      0
    );
    const categoriesSummary = categories
      ?.filter((c) => Array.isArray(filesByCategory[c.key]) && filesByCategory[c.key].length > 0)
      ?.map((c) => ({
        key: c.key,
        label: c.label,
        count: filesByCategory[c.key].length,
        files: filesByCategory[c.key],
      }));
    const updatedDoc = {
      ...doc,
      name: docName,
      initials: currentInitials,
      contactOwner,
      filesByCategory,
      totalFiles,
      categoriesSummary,
      lastModifiedTime,
    };
    updateCustomerDocumentInStore(updatedDoc);
    if (onUpdateDocument) {
      onUpdateDocument(updatedDoc);
    }
    if (onBack) {
      onBack();
    }
  };

  async function handleRefresh() {
    if (!doc?.id) {
      showToast('Data refreshed');
      return;
    }
    setIsRefreshing(true);
    try {
      const fresh = await getDocument(doc.id);
      if (fresh) {
        setDocName(fresh.name || '');
        setContactOwner(cleanOwnerName(fresh.contactOwner));
        if (fresh.filesByCategory) setFilesByCategory(fresh.filesByCategory);
        if (fresh.lastModifiedTime) setLastModifiedTime(fresh.lastModifiedTime);
        if (onUpdateDocument) onUpdateDocument(fresh);
        toast.success('Đã làm mới dữ liệu hồ sơ tài liệu!');
      } else {
        toast.success('Dữ liệu hồ sơ đã được làm mới!');
      }
    } catch {
      toast.success('Dữ liệu hồ sơ đã được làm mới!');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLinkContact(selectedC) {
    if (!selectedC) return;
    const fullName = selectedC.fullName || `${selectedC.firstName || ''} ${selectedC.lastName || ''}`.trim() || selectedC.name || 'Customer';
    const updatedDoc = {
      ...doc,
      contactId: selectedC.id || selectedC.code || '',
      contactName: fullName,
      associatedContact: {
        id: selectedC.id || selectedC.code || '',
        name: fullName,
        phone: selectedC.phone || '',
        email: selectedC.email || '',
        leadOwner: selectedC.contactOwner || selectedC.leadOwner || contactOwner,
        language: selectedC.language || 'Vietnamese',
      },
      lastModifiedTime: new Date().toLocaleString(),
      lastModifiedBy: currentActor,
    };
    updateCustomerDocumentInStore(updatedDoc);
    if (doc?.id) {
      try {
        await updateDocument(doc.id, {
          contactId: selectedC.id,
          name: docName || fullName,
        });
      } catch (_) {}
    }
    if (onUpdateDocument) onUpdateDocument(updatedDoc);
    setShowLinkContactModal(false);
    toast.success(`Đã liên kết khách hàng: ${fullName}!`);
  }

  const associatedContact = doc.associatedContact || {
    id: doc.contactId || '',
    name: doc.contactName || docName,
    phone: doc.phone || '',
    email: doc.email || '',
    leadOwner: contactOwner,
    language: doc.language || 'Vietnamese',
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Bar Header (Image Match) ─────────────────────────────────── */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        {/* Left: Back Arrow + Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Quay lại"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Customer Document Detail
          </h1>
        </div>

        {/* Right Actions: View history | Refresh */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer font-medium"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">history</span>
            <span>View history</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer font-medium disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
            <span>{isRefreshing ? 'Đang tải...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns ───────────────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden">
        {/* ── LEFT COLUMN: Document Information & Categories (~390px) ────── */}
        <div className="w-[390px] xl:w-[410px] bg-white border-r border-slate-200 shrink-0 flex flex-col overflow-y-auto">
          {/* Profile Header Area */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#52B4C9] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs tracking-wide">
                {currentInitials}
              </div>
              <div className="min-w-0 flex-grow">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {docName}
                </h2>
              </div>
            </div>

            {/* Last modified meta */}
            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                <span className="text-slate-500">Last modified time:</span>
                <span className="font-semibold text-slate-800">{lastModifiedTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                <span className="text-slate-500">Last modified by:</span>
                <span className="font-semibold text-slate-800">{typeof doc.lastModifiedBy === 'object' ? (doc.lastModifiedBy?.name || 'Staff') : (doc.lastModifiedBy || 'Staff')}</span>
              </div>
            </div>

            {/* Sub-nav: Information & View all properties */}
            <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#104882]">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Information</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllPropertiesModal(true)}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[15px]">visibility</span>
                <span>View all properties</span>
              </button>
            </div>
          </div>

          {/* Collapsible Section: About this customer document */}
          <div className="border-b border-slate-100">
            <button
              type="button"
              onClick={() => setAboutOpen(!aboutOpen)}
              className="w-full flex items-center gap-1.5 px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:text-blue-800 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-600">
                {aboutOpen ? 'expand_more' : 'chevron_right'}
              </span>
              <span>About this customer document</span>
            </button>

            {aboutOpen && (
              <div className="px-4 pb-6 space-y-4 text-xs">
                {/* 1. Contact Owner */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Contact Owner
                  </label>
                  <div className="relative flex items-center rounded border border-slate-200 bg-white px-2.5 py-1.5 hover:border-slate-300 transition">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                      {contactOwner ? (typeof contactOwner === 'object' ? (contactOwner?.name || '--').slice(0, 2) : contactOwner.slice(0, 2)).toUpperCase() : '--'}
                    </div>
                    <select
                      value={cleanOwnerName(contactOwner)}
                      onChange={(e) => {
                        const newOwner = e.target.value;
                        setContactOwner(newOwner);
                        const updatedDoc = {
                          ...doc,
                          contactOwner: newOwner,
                          name: docName,
                          initials: currentInitials,
                          lastModifiedTime: new Date().toLocaleString(),
                          lastModifiedBy: currentActor,
                        };
                        updateCustomerDocumentInStore(updatedDoc);
                        if (doc?.id) {
                          updateDocument(doc.id, { contactOwner: newOwner }).catch(() => {});
                        }
                        if (onUpdateDocument) {
                          onUpdateDocument(updatedDoc);
                        }
                        toast.success(`Updated Contact Owner: ${newOwner || 'Chưa chọn'}`);
                      }}
                      className="flex-grow text-xs text-slate-800 font-medium bg-transparent border-none outline-none cursor-pointer pr-8"
                    >
                      <option value="">-- Chưa chọn Agent --</option>
                      {agentAccounts?.map((a) => (
                        <option key={`doc-owner-${a.id || a.name}`} value={a.name}>
                          {a.name} {a.npn ? `(#${a.npn})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                      <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* 2. Name * */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    onBlur={() => {
                      if (docName?.trim() && docName.trim() !== doc.name) {
                        const updatedDoc = {
                          ...doc,
                          name: docName.trim(),
                          initials: currentInitials,
                          contactOwner,
                          lastModifiedTime: new Date().toLocaleString(),
                          lastModifiedBy: currentActor,
                        };
                        updateCustomerDocumentInStore(updatedDoc);
                        if (doc?.id) {
                          updateDocument(doc.id, { name: docName.trim() }).catch(() => {});
                        }
                        if (onUpdateDocument) {
                          onUpdateDocument(updatedDoc);
                        }
                        toast.success('Updated tên hồ sơ tài liệu!');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.target.blur();
                    }}
                    placeholder="Tên hồ sơ..."
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition font-medium"
                  />
                </div>

                {/* 3 - 9. 7 Document Categories */}
                <div className="space-y-4 pt-1">
                  {categories?.map((cat) => {
                    const catFiles = filesByCategory[cat.key] || [];

                    return (
                      <div key={cat.key} className="space-y-1.5">
                        {/* Category Title & Add new button */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            {cat.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTriggerUpload(cat.key)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          >
                            <span className="material-symbols-outlined text-[15px]">attach_file</span>
                            <span>Add new</span>
                          </button>
                        </div>

                        {/* Hidden File Input for this category */}
                        <input
                          type="file"
                          multiple
                          ref={(el) => (fileInputRefs.current[cat.key] = el)}
                          onChange={(e) => handleFileUpload(cat.key, e)}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />

                        {/* File Cards List */}
                        {catFiles.length > 0 && (
                          <div className="space-y-1.5">
                            {catFiles?.map((file) => {
                              const isPdf =
                                file.type === 'pdf' ||
                                file?.name?.toLowerCase().endsWith('.pdf');

                              return (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-[#FBFBFC] hover:bg-slate-50 transition group shadow-2xs"
                                >
                                  {/* Left: Icon & Name/Size */}
                                  <div
                                    onClick={() => setPreviewFile(file)}
                                    className="flex items-center gap-2.5 min-w-0 pr-2 cursor-pointer flex-grow"
                                  >
                                    {/* Icon Badge */}
                                    {isPdf ? (
                                      <div className="w-8 h-8 rounded bg-rose-50 border border-rose-100 flex flex-col items-center justify-center shrink-0 text-rose-600">
                                        <span className="material-symbols-outlined text-[16px] leading-none">
                                          picture_as_pdf
                                        </span>
                                        <span className="text-[7px] font-bold tracking-tight">
                                          PDF
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                        <span className="material-symbols-outlined text-[18px]">
                                          image
                                        </span>
                                      </div>
                                    )}

                                    {/* File metadata */}
                                    <div className="min-w-0 flex-grow">
                                      <p
                                        className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition"
                                        title={file.fullName || file?.name}
                                      >
                                        {file?.name}
                                      </p>
                                      <p className="text-[11px] text-slate-400">
                                        {file.size}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Delete button (Red trash can) */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteFile(cat.key, file.id, file?.name)
                                    }
                                    title="Delete file"
                                    className="w-7 h-7 rounded bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 transition cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Contacts Tab & Details ─────────────────────────── */}
        <div className="flex-grow bg-[#F8FAFC] flex flex-col overflow-y-auto">
          {/* Tabs Bar matching uploaded image */}
          <div className="h-11 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            {/* Tab Contacts */}
            <div className="flex items-center gap-6 h-full">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 h-full border-b-2 border-[#104882] px-1 select-none">
                <span className="material-symbols-outlined text-[16px] text-[#104882]">
                  group
                </span>
                <span>Contacts</span>
              </div>
            </div>

            {/* Right tab actions: + Add Contact */}
            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setShowLinkContactModal(true)}
                className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Contact</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Contact Cards List */}
          <div className="p-6">
            <div className="max-w-md bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              {/* Contact Card Header */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectContact && onSelectContact(associatedContact)}
                    className="text-xs font-bold text-[#104882] hover:text-blue-700 hover:underline cursor-pointer text-left truncate"
                    title="View contact detail"
                  >
                    {associatedContact.name || 'Chưa liên kết khách hàng'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkContactModal(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
                >
                  Đổi
                </button>
              </div>

              {/* Contact Information List */}
              <div className="space-y-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                {/* Phone */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {associatedContact.phone || '—'}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-semibold text-slate-800 truncate">
                    {associatedContact.email || '—'}
                  </span>
                </div>

                {/* Lead Owner */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                  <span className="text-slate-500 font-medium">Lead Owner:</span>
                  <span className="font-semibold text-slate-800">
                    {typeof associatedContact?.leadOwner === 'object' ? associatedContact.leadOwner?.name : (associatedContact?.leadOwner || (typeof contactOwner === 'object' ? contactOwner?.name : contactOwner) || '—')}
                  </span>
                </div>

                {/* Language */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">language</span>
                  <span className="text-slate-500 font-medium">Language:</span>
                  <span className="font-semibold text-slate-800">
                    {associatedContact.language || 'Vietnamese'}
                  </span>
                </div>

                {/* Associated Deal Link */}
                {onSelectDeal && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectDeal()}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">handshake</span>
                      <span>View Associated Deal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Optional File Preview Lightbox ───────────────────────────────── */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in border border-slate-200">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">
                  {previewFile.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate">
                  {previewFile.fullName || previewFile.name}
                </span>
                <span className="text-[11px] text-slate-400 shrink-0">
                  ({previewFile.size})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Preview Body */}
            <div className="p-6 flex flex-col items-center justify-center min-h-[220px] bg-slate-100/50">
              {previewFile.url && previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.fullName || previewFile.name}
                  className="max-h-[350px] max-w-full rounded object-contain shadow-xs"
                />
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[32px]">
                      {previewFile.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {previewFile.fullName || previewFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customer Document Attachment ({previewFile.size})
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
              >
                Close
              </button>
              {previewFile.url && (
                <a
                  href={previewFile.url}
                  download={previewFile.fullName || previewFile.name}
                  className="px-3 py-1.5 rounded-lg bg-[#104882] text-white hover:bg-blue-700 cursor-pointer font-medium flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 1: View History ────────────────────────────────────────── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-[#104882] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">history</span>
                <span className="font-bold text-xs uppercase tracking-wider">Lịch sử thay đổi hồ sơ</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Cập nhật gần nhất</span>
                  <span className="text-[10px] text-slate-400 font-mono">{lastModifiedTime}</span>
                </div>
                <div className="text-slate-600 text-[11px]">Người thực hiện: <strong className="text-slate-800">{typeof doc.lastModifiedBy === 'object' ? (doc.lastModifiedBy?.name || 'Staff') : (doc.lastModifiedBy || 'Staff')}</strong></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Hồ sơ khởi tạo</span>
                  <span className="text-[10px] text-slate-400 font-mono">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Ban đầu'}</span>
                </div>
                <div className="text-slate-600 text-[11px]">Mã định danh: <strong className="text-slate-800 font-mono">{doc.code || `DOC-${doc.id}`}</strong></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: View All Properties ─────────────────────────────────── */}
      {showAllPropertiesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-[#104882] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">list_alt</span>
                <span className="font-bold text-xs uppercase tracking-wider">Tất cả thuộc tính (Properties)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllPropertiesModal(false)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 max-h-[65vh] overflow-y-auto text-xs divide-y divide-slate-100">
              <div className="py-2 flex justify-between"><span className="text-slate-500">Document ID:</span><span className="font-mono font-bold text-slate-800">{doc.id}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Mã Code:</span><span className="font-mono font-bold text-slate-800">{doc.code || `DOC-${doc.id}`}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Tên hồ sơ:</span><span className="font-bold text-slate-800">{docName}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Contact Owner:</span><span className="font-semibold text-slate-800">{typeof contactOwner === 'object' ? (contactOwner?.name || '—') : (contactOwner || '—')}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Customer liên kết:</span><span className="font-bold text-slate-800">{associatedContact.name || '—'}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Số điện thoại:</span><span className="font-mono text-slate-800">{associatedContact.phone || '—'}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Email:</span><span className="text-slate-800">{associatedContact.email || '—'}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Tổng số tệp tải lên:</span><span className="font-bold text-blue-700">{doc.totalFiles || Object.values(filesByCategory).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0)} file(s)</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Thời gian cập nhật:</span><span className="text-slate-800">{lastModifiedTime}</span></div>
              <div className="py-2 flex justify-between"><span className="text-slate-500">Người cập nhật:</span><span className="text-slate-800">{typeof doc.lastModifiedBy === 'object' ? (doc.lastModifiedBy?.name || 'Staff') : (doc.lastModifiedBy || 'Staff')}</span></div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllPropertiesModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Link / Change Contact ──────────────────────────────── */}
      {showLinkContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-[#104882] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span className="font-bold text-xs uppercase tracking-wider">Linked Customer</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkContactModal(false)}
                className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Tìm kiếm khách hàng
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder="Nhập tên, số điện thoại hoặc email..."
                    className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
                    search
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {contactsList
                  ?.filter((c) => {
                    if (!contactSearchQuery) return true;
                    const q = contactSearchQuery.toLowerCase();
                    const name = String(c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || '').toLowerCase();
                    const phone = String(c.phone || '').toLowerCase();
                    const email = String(c.email || '').toLowerCase();
                    return name.includes(q) || phone.includes(q) || email.includes(q);
                  })
                  .slice(0, 15)
                  ?.map((c) => {
                    const cName = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name;
                    return (
                      <div
                        key={c.id || c.code}
                        onClick={() => handleLinkContact(c)}
                        className="p-2.5 hover:bg-blue-50/70 transition flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{cName}</div>
                          <div className="text-[11px] text-slate-500">
                            {c.phone ? `${c.phone} ` : ''}{c.email ? `• ${c.email}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold text-[11px] hover:bg-blue-100 cursor-pointer"
                        >
                          Chọn
                        </button>
                      </div>
                    );
                  })}
                {contactsList.length === 0 && (
                  <div className="p-4 text-center text-slate-400">Chưa có danh sách khách hàng</div>
                )}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLinkContactModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
