import React, { useState, useRef } from 'react';
import { CUSTOMER_DOCUMENT_DATA } from '../../../data/mockCrmData';

export default function StaffCustomerDocumentDetail({
  documentData,
  onBack,
  onSelectContact,
  onSelectDeal,
}) {
  const doc = {
    ...CUSTOMER_DOCUMENT_DATA,
    ...(documentData || {}),
  };

  const [docName, setDocName] = useState(doc.name || 'Nhat H Dang');
  const [contactOwner, setContactOwner] = useState(
    doc.contactOwner || 'Khanh Nguyen (khanhnguyen31@7)'
  );
  const [aboutOpen, setAboutOpen] = useState(true);
  const [filesByCategory, setFilesByCategory] = useState(
    doc.filesByCategory || {
      consentFormMkp: [],
      consentFormText: [],
      identity: [],
      insuranceRecord: [],
      otherDocument: [],
      paymentInformation: [],
      tax: [],
    }
  );

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

  function handleFileUpload(categoryKey, event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file) => {
      const isPdf =
        file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isImg =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(file.name);

      return {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name: file.name.length > 24 ? file.name.slice(0, 20) + '...' : file.name,
        fullName: file.name,
        size: formatFileSize(file.size),
        type: isPdf ? 'pdf' : isImg ? 'image' : 'document',
        url: URL.createObjectURL(file),
      };
    });

    setFilesByCategory((prev) => ({
      ...prev,
      [categoryKey]: [...(prev[categoryKey] || []), ...newFiles],
    }));

    // Reset input value to allow uploading the same file again if needed
    event.target.value = '';

    const catTitle = categories.find((c) => c.key === categoryKey)?.label || '';
    showToast(`Added ${newFiles.length} file(s) to ${catTitle}`);
  }

  function handleDeleteFile(categoryKey, fileId, fileName) {
    setFilesByCategory((prev) => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || []).filter((f) => f.id !== fileId),
    }));
    showToast(`Removed file ${fileName || ''}`);
  }

  const associatedContact = doc.associatedContact || {
    id: 'CT26002600',
    name: 'Nhat Huu Tuan Dang',
    phone: '+1 (714) 837-2395',
    email: 'tuannhat.n2@gmail.com',
    leadOwner: 'Khanh Nguyen',
    language: 'Vietnamese',
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
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Back to Contact Detail"
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
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">history</span>
            <span>View history</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => showToast('Data refreshed')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
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
                {doc.initials || 'ND'}
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
                <span className="font-semibold text-slate-800">{doc.lastModifiedTime || '09/11/2026, 17:44'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                <span className="text-slate-500">Last modified by:</span>
                <span className="font-semibold text-slate-800">{doc.lastModifiedBy || 'Anya Nguyen'}</span>
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
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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
                    <div className="w-5 h-5 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                      KN
                    </div>
                    <span className="flex-grow text-xs text-slate-800 truncate font-medium">
                      {contactOwner}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={() => setContactOwner('')}
                        className="text-[12px] text-rose-500 hover:text-rose-700 cursor-pointer font-bold px-0.5"
                        title="Clear"
                      >
                        ✕
                      </button>
                      <span className="h-3 w-px bg-slate-200 mx-0.5" />
                      <span className="material-symbols-outlined text-[16px] text-slate-600 pointer-events-none">
                        expand_more
                      </span>
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
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 hover:border-slate-300 transition"
                  />
                </div>

                {/* 3 - 9. 7 Document Categories */}
                <div className="space-y-4 pt-1">
                  {categories.map((cat) => {
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
                            {catFiles.map((file) => {
                              const isPdf =
                                file.type === 'pdf' ||
                                file.name?.toLowerCase().endsWith('.pdf');

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
                                        title={file.fullName || file.name}
                                      >
                                        {file.name}
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
                                      handleDeleteFile(cat.key, file.id, file.name)
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
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 h-full border-b-2 border-[#104882] px-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#104882]">
                  group
                </span>
                <span>Contacts</span>
              </button>
            </div>

            {/* Right tab actions: + Add Contact | Refresh | View */}
            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => showToast('Add contact modal')}
                className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Contact</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Contacts refreshed')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Refresh</span>
              </button>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <span className="material-symbols-outlined text-[16px]">view_list</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Contact Cards List */}
          <div className="p-6">
            <div className="max-w-md bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              {/* Contact Card Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                </div>
                <button
                  type="button"
                  onClick={onSelectContact}
                  className="text-xs font-bold text-[#104882] hover:text-blue-700 hover:underline cursor-pointer text-left"
                  title="View contact detail"
                >
                  {associatedContact.name}
                </button>
              </div>

              {/* Contact Information List */}
              <div className="space-y-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                {/* Phone */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {associatedContact.phone}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-semibold text-slate-800">
                    {associatedContact.email}
                  </span>
                </div>

                {/* Lead Owner */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                  <span className="text-slate-500 font-medium">Lead Owner:</span>
                  <span className="font-semibold text-slate-800">
                    {associatedContact.leadOwner}
                  </span>
                </div>

                {/* Language */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">language</span>
                  <span className="text-slate-500 font-medium">Language:</span>
                  <span className="font-semibold text-slate-800">
                    {associatedContact.language}
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
    </div>
  );
}
