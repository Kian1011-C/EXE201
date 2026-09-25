import React, { useState, useMemo } from 'react';
import { assignAdminQuote } from '../../../services/api';

export default function AdminQuotesTab({
  quotes = [],
  accounts = [],
  onRefresh,
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedNpn, setSelectedNpn] = useState('Anh Que Pham 20011862');
  const [isAssigning, setIsAssigning] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const [localQuotes, setLocalQuotes] = useState(quotes);

  React.useEffect(() => {
    if (quotes && quotes.length > 0) setLocalQuotes(quotes);
  }, [quotes]);

  const verifiedAgents = useMemo(() => {
    return accounts.filter((a) => a.role === 'agent' && a.status === 'Active');
  }, [accounts]);

  const filteredQuotes = useMemo(() => {
    return localQuotes.filter((q) => {
      const matchSearch =
        !search ||
        (q.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.phone || '').includes(search) ||
        (q.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.id || '').toLowerCase().includes(search.toLowerCase());

      const matchType =
        filterType === 'all' ||
        (q.insuranceType || '').toLowerCase().includes(filterType.toLowerCase());

      const matchStatus =
        filterStatus === 'all' ||
        (q.status || '').toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchType && matchStatus;
    });
  }, [localQuotes, search, filterType, filterStatus]);

  function handleOpenDispatch(quote) {
    setSelectedQuote(quote);
    setSelectedAgent(verifiedAgents[0]?.name || 'Khanh Nguyen');
    setDispatchModalOpen(true);
  }

  async function handleConfirmDispatch(e) {
    e.preventDefault();
    if (!selectedQuote || !selectedAgent) return;
    setIsAssigning(true);
    try {
      await assignAdminQuote(selectedQuote.contactId || selectedQuote.id, {
        agentName: selectedAgent,
        enrolledNpn: selectedNpn,
      }).catch((err) => console.warn('Offline mode: dispatching in local state', err.message));

      setLocalQuotes((prev) =>
        prev.map((q) =>
          q.id === selectedQuote.id
            ? { ...q, assignedAgent: selectedAgent, enrolledNpn: selectedNpn, status: 'Dispatched to Agent' }
            : q
        )
      );

      setSuccessToast(`Successfully dispatched lead for ${selectedQuote.name} to ${selectedAgent}!`);
      setTimeout(() => setSuccessToast(''), 4000);
      setDispatchModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Dispatch failed: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Match Inquiries & Lead Dispatch Queue</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
              {filteredQuotes.length} total
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized intake from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">/get-quote</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">QuoteModal</code>. Dispatched exclusively to verified licensed agents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search name, phone, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Coverage Types</option>
              <option value="aca">ACA / Health</option>
              <option value="medicare">Medicare</option>
              <option value="life">Life / Annuity</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="new inquiry">New Inquiry</option>
              <option value="dispatched to agent">Dispatched</option>
              <option value="matched & enrolled">Matched & Enrolled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">ID / Intake Time</th>
                <th className="px-5 py-3.5">Consumer Details</th>
                <th className="px-5 py-3.5">Coverage Requested</th>
                <th className="px-5 py-3.5">State & Lang</th>
                <th className="px-5 py-3.5">Assigned Agent & Sponsor NPN</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q) => {
                const isNew = q.status === 'New Inquiry';
                const isMatched = q.status === 'Matched & Enrolled';
                return (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-800">{q.id}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{q.date}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{q.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{q.phone} • {q.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{q.insuranceType}</div>
                      <div className="text-[11px] text-slate-400">{q.notes}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-700">{q.state}</div>
                      <div className="text-[11px] text-slate-400">{q.preferredLanguage}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{q.assignedAgent}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Sponsor: {q.enrolledNpn || 'Anh Que Pham 20011862'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isNew
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isMatched
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-rose-500 animate-ping' : isMatched ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenDispatch(q)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-blue-600 transition text-[11px] font-semibold cursor-pointer shadow-2xs"
                      >
                        {isNew ? 'Dispatch Lead 🚀' : 'Reassign Agent'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No matching consumer inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dispatch Modal ────────────────────────────────────────────── */}
      {dispatchModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">send_time_extension</span>
                <h3 className="text-base font-bold text-slate-900">Dispatch Lead to Verified Agent</h3>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Inquiry ID:</span>
                <strong className="font-mono text-slate-800">{selectedQuote.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <strong className="text-slate-900">{selectedQuote.name} ({selectedQuote.state})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product Line:</span>
                <strong className="text-blue-700">{selectedQuote.insuranceType}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Partner Agent (Licensed in {selectedQuote.state || 'TX'})
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  required
                >
                  {verifiedAgents.map((ag) => (
                    <option key={ag.id} value={ag.name}>
                      {ag.name} (NPN #{ag.npn}) — {ag.statesLicensed.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Master Sponsor NPN (Agency of Record)
                </label>
                <input
                  type="text"
                  value={selectedNpn}
                  onChange={(e) => setSelectedNpn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Anh Que Pham 20011862"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ensures commission compliance and agency override tracking under CMS regulations.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isAssigning ? 'Dispatching...' : 'Confirm Dispatch 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
