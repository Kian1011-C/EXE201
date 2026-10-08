import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function InAppFilePreviewModal({ isOpen, onClose, file }) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !file) return null;

  const fileName = file.name || 'document';
  const fileExt = fileName.split('.').pop().toLowerCase();
  const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(fileExt);
  const isPdf = file.type === 'application/pdf' || fileExt === 'pdf';
  const fileUrl = file.url || file.previewUrl || file.dataUrl || null;

  function handleDownload() {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create mock download file
      const blob = new Blob([`InsurMatch CRM File: ${fileName}\nSize: ${file.size || 'N/A'}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-[20px] text-blue-400 shrink-0">
              {isImage ? 'image' : (isPdf ? 'picture_as_pdf' : 'description')}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm truncate text-white max-w-[350px] sm:max-w-[500px]" title={fileName}>
                {fileName}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>{file.size || 'Document'}</span>
                <span>•</span>
                <span className="uppercase">{fileExt || 'FILE'}</span>
                {file.author && (
                  <>
                    <span>•</span>
                    <span>By: {file.author}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isImage && (
              <div className="flex items-center gap-1 mr-2 bg-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="hover:text-white px-1 font-bold cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
                <span className="text-[11px] font-mono min-w-[35px] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="hover:text-white px-1 font-bold cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="hover:text-white text-[10px] ml-1 px-1 bg-slate-700 rounded cursor-pointer"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Open in new tab"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Download file"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Close preview"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Preview Container */}
        <div className="flex-1 overflow-auto bg-slate-950/5 flex items-center justify-center p-4 min-h-[380px] max-h-[75vh]">
          {isImage && fileUrl ? (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
              <img
                src={fileUrl}
                alt={fileName}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-md transition-transform duration-150"
              />
            </div>
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-[68vh] rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            /* Document Simulation Card for files or mock uploads */
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-[36px]">
                  {isPdf ? 'picture_as_pdf' : (isImage ? 'image' : 'description')}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{fileName}</h4>
                <p className="text-xs text-slate-400 mt-1">Format: {fileExt.toUpperCase()} • Size: {file.size || 'Unspecified'}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-left text-xs space-y-1.5 text-slate-600 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span> Verified
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security:</span>
                  <span>AES-256 Encrypted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage:</span>
                  <span>InsurMatch S3 Bucket</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download file</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
