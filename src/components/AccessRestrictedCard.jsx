import React from 'react';

export default function AccessRestrictedCard({
  title = 'Access Restricted',
  message = 'Under system security policy, Agents may only access records (Contacts, Deals, Tickets, Documents) assigned to them (as Owner or Assignee).',
  ownerName = '',
  onBack,
  backLabel = 'Back to List',
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 min-h-[500px] w-full text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
        <span className="material-symbols-outlined text-[32px]">shield_person</span>
      </div>

      <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-4">
        {message}
      </p>

      {ownerName && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-6">
          <span className="text-slate-400">Current Assigned Owner:</span>
          <span className="font-bold text-slate-900">{ownerName}</span>
        </div>
      )}

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>{backLabel}</span>
        </button>
      )}
    </div>
  );
}
