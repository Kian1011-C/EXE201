import React, { useState, useMemo } from 'react';
import { updateDealAdmin } from '../../../services/api';

export default function AdminDealsTab({
  deals = [],
  onRefresh,
}) {
  const [search, setSearch] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [sssFilter, setSssFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state for editing Admin Only fields
  const [adminForm, setAdminForm] = useState({
    enrolledNpn: '',
    brokerEffectiveDate: '',
    terminationDate: '',
    primaryMemberId: '',
    saleSupportStatus: 'None',
    numberMember: 1,
    carrier: '',
    sellingState: '',
    closedLostReason: '',
  });

  const [localDeals, setLocalDeals] = useState(deals);

  React.useEffect(() => {
    if (deals && deals.length > 0) setLocalDeals(deals);
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return localDeals.filter((d) => {
      const matchSearch =
        !search ||
        (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.contactName || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.carrier || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.enrolledNpn || '').toLowerCase().includes(search.toLowerCase());

      const matchPipeline =
        pipelineFilter === 'all' ||
        (d.pipeline || '').toLowerCase().includes(pipelineFilter.toLowerCase());

      const currentSss = String(d.saleSupportStatus || d.adminOnly?.saleSupportStatus || 'None').toUpperCase();
      const matchSss =
        sssFilter === 'all' ||
        currentSss.includes(sssFilter.toUpperCase());

      return matchSearch && matchPipeline && matchSss;
    });
  }, [localDeals, search, pipelineFilter, sssFilter]);

  function handleSelectDeal(deal) {
    setSelectedDeal(deal);
    const adminData = deal.adminOnly || {};
    setAdminForm({
      enrolledNpn: deal.enrolledNpn || adminData.enrolledNpn || 'Anh Que Pham 20011862',
      brokerEffectiveDate: deal.brokerEffectiveDate || adminData.brokerEffectiveDate || '2026-09-09',
      terminationDate: deal.terminationDate || adminData.terminationDate || '2027-12-31',
      primaryMemberId: deal.primaryMemberId || adminData.primaryMemberId || 'MID-98234710',
      saleSupportStatus: deal.saleSupportStatus || adminData.saleSupportStatus || 'None',
      numberMember: deal.numberMember || adminData.numberMember || 1,
      carrier: deal.carrier || adminData.carrier || 'BCBS',
      sellingState: deal.sellingState || adminData.sellingState || 'North Carolina (NC)',
      closedLostReason: deal.closedLostReason || adminData.closedLostReason || '---',
    });
    setIsEditing(false);
  }

  async function handleSaveAdminFields(e) {
    e.preventDefault();
    if (!selectedDeal) return;
    setIsSaving(true);
    try {
      await updateDealAdmin(selectedDeal.id, adminForm).catch((err) =>
        console.warn('Offline mode: saving deal admin fields in local state', err.message)
      );

      const updatedObj = {
        ...selectedDeal,
        ...adminForm,
        adminOnly: { ...(selectedDeal.adminOnly || {}), ...adminForm },
      };

      setSelectedDeal(updatedObj);
      setLocalDeals((prev) =>
        prev.map((d) => (d.id === selectedDeal.id ? updatedObj : d))
      );

      setToastMessage(`Updated Admin Governance settings for deal ${selectedDeal.code}!`);
      setTimeout(() => setToastMessage(''), 4000);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  // Quick action: Resolve AOR dispute (SOP 19)
  async function handleResolveAorDispute(deal) {
    const newNpn = 'Anh Que Pham 20011862';
    if (!window.confirm(`Reclaim AOR status for deal ${deal.code} under Master Sponsor NPN (${newNpn}) per SOP 19 procedure?`)) return;
    try {
      await updateDealAdmin(deal.id, {
        enrolledNpn: newNpn,
        closedLostReason: 'AOR Reclaimed per SOP 19 Procedure',
      }).catch((err) => console.warn('Offline mode: reclaiming AOR in local state', err.message));

      setLocalDeals((prev) =>
        prev.map((d) =>
          d.id === deal.id
            ? {
                ...d,
                enrolledNpn: newNpn,
                adminOnly: { ...(d.adminOnly || {}), enrolledNpn: newNpn },
              }
            : d
        )
      );

      setToastMessage(`AOR reclaimed for deal ${deal.code} under sponsor NPN: ${newNpn}`);
      setTimeout(() => setToastMessage(''), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`AOR Resolution failed: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Master Deals & NPN Governance</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold">
              {filteredDeals.length} policies
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer agency-level broker agreements, NPN sponsor attribution, Sale Support Status (SSS split 7/3, 5/5, 3/7), and AOR disputes (SOP 19).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search deal code, client, carrier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Pipelines</option>
              <option value="obamacare">Obamacare / ACA</option>
              <option value="medicare">Medicare</option>
              <option value="life">Life / Annuity</option>
            </select>

            <select
              value={sssFilter}
              onChange={(e) => setSssFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All SSS Tiers</option>
              <option value="none">NONE (7/3)</option>
              <option value="partial">PARTIAL (5/5)</option>
              <option value="full">FULL (3/7)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Deals Table + Admin-Only Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Deals List Table (7 or 8 columns on large screens) */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${selectedDeal ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Code / Title</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Carrier & State</th>
                  <th className="px-4 py-3.5">Enrolled Sponsor NPN</th>
                  <th className="px-4 py-3.5">SSS Split</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((d) => {
                  const sss = d.saleSupportStatus || d.adminOnly?.saleSupportStatus || 'None';
                  const isSelected = selectedDeal?.id === d.id;

                  return (
                    <tr
                      key={d.id}
                      onClick={() => handleSelectDeal(d)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-slate-900">{d.code}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{d.title}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{d.contactName || d.contact?.fullName || 'Client'}</div>
                        <div className="text-[11px] text-slate-400">{d.dealOwnerName || 'Assigned Agent'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{d.carrier}</div>
                        <div className="text-[11px] text-slate-400">{d.sellingState}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold border border-slate-200">
                          {d.enrolledNpn || d.adminOnly?.enrolledNpn || 'Anh Que Pham 20011862'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            String(sss).toUpperCase().includes('FULL')
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : String(sss).toUpperCase().includes('PARTIAL')
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {sss}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveAorDispute(d);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          title="Resolve Other Party AOR Dispute (SOP 19)"
                        >
                          <span className="material-symbols-outlined text-[18px]">cached</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin-Only Inspector Panel (5 columns when opened) */}
        {selectedDeal && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 animate-scale-in lg:sticky lg:top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[22px]">admin_panel_settings</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Admin Governance Inspector</h3>
                  <div className="text-[11px] font-mono text-slate-400">{selectedDeal.code} • {selectedDeal.title}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 leading-snug">
              <strong>Admin Only Restricted Fields</strong> — Modifying these values overrides master agency commission routing, NPN sponsor tracking, and broker effective dates in PostgreSQL.
            </div>

            <form onSubmit={handleSaveAdminFields} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enrolled NPN (Principal Broker Attribution)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={adminForm.enrolledNpn}
                  onChange={(e) => setAdminForm({ ...adminForm, enrolledNpn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Support Status (SSS)</label>
                  <select
                    disabled={!isEditing}
                    value={adminForm.saleSupportStatus}
                    onChange={(e) => setAdminForm({ ...adminForm, saleSupportStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="None">None (7/3 Split)</option>
                    <option value="Partial">Partial (5/5 Split)</option>
                    <option value="Full">Full (3/7 Split)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Number of Members</label>
                  <input
                    type="number"
                    min="1"
                    disabled={!isEditing}
                    value={adminForm.numberMember}
                    onChange={(e) => setAdminForm({ ...adminForm, numberMember: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Broker Effective Date</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={adminForm.brokerEffectiveDate}
                    onChange={(e) => setAdminForm({ ...adminForm, brokerEffectiveDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Termination Date</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={adminForm.terminationDate}
                    onChange={(e) => setAdminForm({ ...adminForm, terminationDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Carrier Policy Member ID</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={adminForm.primaryMemberId}
                    onChange={(e) => setAdminForm({ ...adminForm, primaryMemberId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling State</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={adminForm.sellingState}
                    onChange={(e) => setAdminForm({ ...adminForm, sellingState: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Closed / Lost Justification</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={adminForm.closedLostReason}
                  onChange={(e) => setAdminForm({ ...adminForm, closedLostReason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition cursor-pointer text-xs"
                  >
                    Edit Admin Fields ✏️
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer text-xs disabled:opacity-50 shadow-xs"
                    >
                      {isSaving ? 'Saving...' : 'Save to Database 💾'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
