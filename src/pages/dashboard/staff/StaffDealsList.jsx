import React, { useState, useMemo, useEffect } from 'react';
import {
  SAMPLE_DEALS,
  OBAMACARE_DEAL_STAGES,
  MEDICARE_DEAL_STAGES,
} from '../../../data/mockCrmData';
import { getDeals } from '../../../services/api';

export default function StaffDealsList({ onSelectDeal, onSelectContact }) {
  const [dealsList, setDealsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [activeViewTab, setActiveViewTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  async function loadDealsData() {
    setLoading(true);
    try {
      const data = await getDeals();
      if (Array.isArray(data) && data.length > 0) {
        setDealsList(data);
        setIsDbConnected(true);
      } else {
        setDealsList(SAMPLE_DEALS);
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn('[StaffDealsList] API error, falling back to sample deals:', err);
      setDealsList(SAMPLE_DEALS);
      setIsDbConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDealsData();
  }, []);

  // Form state for Create Deal
  const [dealTitle, setDealTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [pipeline, setPipeline] = useState('Obamacare 2026');
  const [stage, setStage] = useState('Ready to Enroll (Obamacare 2026)');
  const [carrier, setCarrier] = useState('BCBS');
  const [sellingState, setSellingState] = useState('North Carolina (NC)');
  const [dealOwner, setDealOwner] = useState('Khanh Nguyen');
  const [amount, setAmount] = useState('_ _ _ _ _ _ _ _ _ _');
  const [closeDate, setCloseDate] = useState('_ _ _ _ _ _ _ _ _ _');

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return dealsList.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.contactName && d.contactName.toLowerCase().includes(q)) ||
        (d.carrier && d.carrier.toLowerCase().includes(q));

      const matchesOwner =
        ownerFilter === 'all' ||
        (d.dealOwner?.name && d.dealOwner.name.toLowerCase().includes(ownerFilter.toLowerCase()));

      const matchesPipeline =
        pipelineFilter === 'all' ||
        (d.pipeline && d.pipeline.toLowerCase().includes(pipelineFilter.toLowerCase()));

      const matchesStage =
        stageFilter === 'all' ||
        (d.stage && d.stage.toLowerCase().includes(stageFilter.toLowerCase()));

      let matchesTab = true;
      if (activeViewTab === 'my') {
        matchesTab = d.dealOwner?.name?.includes('Khanh Nguyen');
      } else if (activeViewTab === 'ready') {
        matchesTab = d.stage?.includes('Ready to Enroll');
      } else if (activeViewTab === 'verified') {
        matchesTab = d.stage?.includes('VERIFIED') || d.stage?.includes('Closed Won');
      }

      return matchesSearch && matchesOwner && matchesPipeline && matchesStage && matchesTab;
    });
  }, [dealsList, searchQuery, ownerFilter, pipelineFilter, stageFilter, activeViewTab]);

  // Unique owners
  const ownerOptions = useMemo(() => {
    const set = new Set(dealsList.map((d) => d.dealOwner?.name).filter(Boolean));
    return Array.from(set);
  }, [dealsList]);

  // Handle Create Deal Submit
  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!dealTitle.trim()) {
      showToast('Please enter Deal title');
      return;
    }

    const newCode = `D2600${Math.floor(5000 + Math.random() * 900)}`;
    const newDeal = {
      id: newCode,
      no: dealsList.length + 1,
      code: newCode,
      title: dealTitle.trim(),
      contactName: contactName.trim() || 'Nhat Huu Tuan Dang',
      contactId: 'CT26002600',
      pipeline: pipeline,
      stage: stage,
      stageBadge: stage.includes('Ready') ? 'Ready to Enroll' : stage.slice(0, 15),
      stageColor: 'bg-blue-50 text-blue-700 border-blue-200',
      carrier: carrier,
      amount: amount.trim() || '_ _ _ _ _ _ _ _ _ _',
      closeDate: closeDate.trim() || '_ _ _ _ _ _ _ _ _ _',
      sellingState: sellingState,
      dealOwner: {
        name: dealOwner,
        avatar: dealOwner.slice(0, 2).toUpperCase(),
        bg: 'bg-blue-600 text-white',
      },
      lastModifiedBy: {
        name: 'Anya Nguyen',
        avatar: 'AN',
        bg: 'bg-teal-600 text-white',
      },
      lastModifiedTime: 'Just now',
      adminOnly: {
        enrolledNpn: 'Anh Que Pham 20011862',
        brokerEffectiveDate: '2026-09-09',
        terminationDate: '2027-12-31',
        leadOwner: `${dealOwner} (khanhnguyen31@7)`,
        dealOwner: `${dealOwner} (khanhnguyen31@7)`,
        supportAgent: 'Anya Nguyen (anya42@9)',
        code: newCode,
        primaryMemberId: 'MID-' + Math.floor(10000000 + Math.random() * 90000000),
        saleSupportStatus: 'Completed',
        numberMember: 1,
        sellingState: sellingState,
        carrier: carrier,
        closedLostReason: '---',
      },
    };

    setDealsList([newDeal, ...dealsList]);
    setShowCreateModal(false);
    setDealTitle('');
    setContactName('');
    showToast(`Created deal ${newDeal.code} successfully!`);
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] p-4 lg:p-6 overflow-y-auto space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Breadcrumbs & Header Actions ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">handshake</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>The Best Rate Insurance</span>
              <span>/</span>
              <span className="text-[#104882] font-semibold">Management</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Deals</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              <span>Deals</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                {dealsList.length} deals
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">tune</span>
            <span>Actions</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">upload</span>
            <span>Import</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={loadDealsData}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#104882] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Create Deal</span>
          </button>
        </div>
      </div>

      {/* ── 2. Quick View Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-px">
        {[
          { key: 'all', label: `All Deals (${dealsList.length})` },
          { key: 'my', label: 'My Deals' },
          { key: 'ready', label: 'Ready to Enroll' },
          { key: 'verified', label: 'Verified / Won' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveViewTab(tab.key)}
            className={`px-3 py-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeViewTab === tab.key
                ? 'border-[#104882] text-[#104882]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          className="px-2 py-1 text-slate-400 hover:text-blue-600 flex items-center gap-1 text-[11px]"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          <span>Add view</span>
        </button>
      </div>

      {/* ── 3. Filters & Search Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap flex-grow">
          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm flex-grow">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by deal name, code, contact..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>

          {/* Deal Owner Filter */}
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="all">Deal Owner: All</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Pipeline Filter */}
          <div className="relative">
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="all">Pipeline: All</option>
              <option value="Obamacare 2026">Obamacare 2026</option>
              <option value="Medicare 2026">Medicare 2026</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Stage Filter */}
          <div className="relative">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 transition cursor-pointer max-w-[210px] truncate"
            >
              <option value="all">Stage: All</option>
              {(pipelineFilter.includes('Medicare')
                ? MEDICARE_DEAL_STAGES
                : OBAMACARE_DEAL_STAGES
              ).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Quick sample loader / clear toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {dealsList.length === 0 ? (
            <button
              type="button"
              onClick={() => setDealsList(SAMPLE_DEALS)}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Tải dữ liệu mẫu</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDealsList([])}
              className="text-xs text-rose-600 hover:underline font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>Xóa data</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Main Deals Table (Exact matching Contacts List layout) ─────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="material-symbols-outlined text-[16px] text-slate-500">grid_on</span>
            <span>All Deals</span>
            <span className="text-slate-400 font-normal">
              ({filteredDeals.length} displayed)
            </span>
          </div>
          <button
            onClick={() => showToast('Deals list refreshed')}
            title="Refresh Table"
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 transition cursor-pointer"
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
                <th className="px-3 py-2.5 font-bold text-slate-900">Deal Name</th>
                <th className="px-3 py-2.5">Associated Contact</th>
                <th className="px-3 py-2.5">Pipeline</th>
                <th className="px-3 py-2.5">Stage</th>
                <th className="px-3 py-2.5">Carrier</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Selling State</th>
                <th className="px-3 py-2.5">Deal Owner</th>
                <th className="px-3 py-2.5">Last modified by</th>
                <th className="px-3 py-2.5">Last modified time</th>
                <th className="px-2 py-2.5 text-center w-8">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <span className="material-symbols-outlined text-[32px]">handshake</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">No deals found!</div>
                      <div className="text-xs text-slate-500">
                        There are no deals matching your current search or filter criteria.
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#104882] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          + Create Deal
                        </button>
                        <button
                          type="button"
                          onClick={() => setDealsList(SAMPLE_DEALS)}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          Tải dữ liệu mẫu
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal, index) => {
                  const isNhatDangDeal = deal.code === 'D26005033';
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => onSelectDeal && onSelectDeal(deal)}
                      className={`hover:bg-blue-50/60 transition-colors cursor-pointer group ${
                        isNhatDangDeal ? 'bg-amber-50/40 font-medium' : ''
                      }`}
                    >
                      {/* No. */}
                      <td className="px-3 py-2.5 text-center text-slate-400 font-medium">
                        {deal.no || index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-3 py-2.5 font-mono text-[#104882] font-semibold">
                        {deal.code}
                      </td>

                      {/* Deal Name */}
                      <td className="px-3 py-2.5 font-bold text-slate-900 group-hover:text-blue-700 max-w-[280px] truncate">
                        {deal.title}
                      </td>

                      {/* Associated Contact */}
                      <td className="px-3 py-2.5">
                        {deal.contactName ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectContact &&
                                onSelectContact({
                                  id: deal.contactId || 'CT26002600',
                                  fullName: deal.contactName,
                                });
                            }}
                            className="text-[#104882] hover:underline font-semibold text-left"
                          >
                            {deal.contactName}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Pipeline */}
                      <td className="px-3 py-2.5 text-slate-700">
                        {deal.pipeline}
                      </td>

                      {/* Stage Badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            deal.stageColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {deal.stageBadge || deal.stage}
                        </span>
                      </td>

                      {/* Carrier */}
                      <td className="px-3 py-2.5 font-semibold text-blue-800">
                        {deal.carrier || 'BCBS'}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {deal.amount}
                      </td>

                      {/* Selling State */}
                      <td className="px-3 py-2.5 text-slate-600">
                        {deal.sellingState}
                      </td>

                      {/* Deal Owner */}
                      <td className="px-3 py-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-800">
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              deal.dealOwner?.bg || 'bg-blue-600 text-white'
                            }`}
                          >
                            {deal.dealOwner?.avatar || 'KN'}
                          </div>
                          <span>{deal.dealOwner?.name || 'Khanh Nguyen'}</span>
                        </div>
                      </td>

                      {/* Last modified by */}
                      <td className="px-3 py-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-700">
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              deal.lastModifiedBy?.bg || 'bg-teal-600 text-white'
                            }`}
                          >
                            {deal.lastModifiedBy?.avatar || 'AN'}
                          </div>
                          <span>{deal.lastModifiedBy?.name || 'Anya Nguyen'}</span>
                        </div>
                      </td>

                      {/* Last modified time */}
                      <td className="px-3 py-2.5 text-slate-500 font-mono text-[10px]">
                        {deal.lastModifiedTime}
                      </td>

                      {/* Action # */}
                      <td className="px-2 py-2.5 text-center text-slate-400 group-hover:text-slate-700">
                        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredDeals.length}</span> of{' '}
            <span className="font-bold text-slate-800">{dealsList.length}</span> deals
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-[15px]">chevron_left</span>
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-[15px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Create Deal Modal ─────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">handshake</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Create Deal</h2>
                  <p className="text-[11px] text-slate-500">Fill in the deal information below</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Deal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder="e.g. Non-CMS - Nhat H Dang - OB 10/2026 (NC)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Associated Contact
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Nhat Huu Tuan Dang"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Carrier <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-xs font-semibold text-blue-700"
                  >
                    <option>BCBS</option>
                    <option>Ambetter</option>
                    <option>UnitedHealthcare</option>
                    <option>Oscar</option>
                    <option>Molina Healthcare</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Pipeline <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={pipeline}
                    onChange={(e) => setPipeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option>Obamacare 2026</option>
                    <option>Medicare 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    {(pipeline.includes('Medicare')
                      ? MEDICARE_DEAL_STAGES
                      : OBAMACARE_DEAL_STAGES
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Selling State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sellingState}
                    onChange={(e) => setSellingState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option>North Carolina (NC)</option>
                    <option>Texas (TX)</option>
                    <option>California (CA)</option>
                    <option>Georgia (GA)</option>
                    <option>Florida (FL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Deal Owner <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dealOwner}
                    onChange={(e) => setDealOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#104882] text-white hover:bg-blue-700 cursor-pointer font-bold shadow-xs"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
