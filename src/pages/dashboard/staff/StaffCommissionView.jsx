import React, { useState, useEffect, useMemo } from 'react';
import {
  getCommissions,
  getCommissionSummary,
  calculateCommissions,
  updateCommission,
} from '../../../services/api';

export default function StaffCommissionView({ onSelectDeal, onSelectContact }) {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [commsRes, sumRes] = await Promise.all([
        getCommissions().catch(() => []),
        getCommissionSummary().catch(() => null),
      ]);
      if (Array.isArray(commsRes)) setCommissions(commsRes);
      if (sumRes) setSummary(sumRes);
    } catch (err) {
      console.warn('[StaffCommissionView] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Run Calculation Engine
  async function handleRunCalculation() {
    setCalculating(true);
    try {
      const res = await calculateCommissions({
        agentName: 'all',
        period: '2026-02',
      });
      showToast(res.message || 'Commissions calculated and updated successfully!');
      await loadData();
    } catch (err) {
      showToast('Calculation failed: ' + (err.message || 'Server error'));
    } finally {
      setCalculating(false);
    }
  }

  // Handle in-place status toggle
  async function handleToggleStatus(record, newStatus) {
    try {
      const updated = await updateCommission(record.id, { status: newStatus });
      setCommissions((prev) =>
        prev.map((c) => (c.id === record.id ? { ...c, ...updated, status: newStatus } : c))
      );
      showToast(`Policy ${record.policyId || record.id} marked as ${newStatus}`);
      if (selectedRecord && selectedRecord.id === record.id) {
        setSelectedRecord((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      showToast('Failed to update status');
    }
  }

  // Filtered commissions
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.agentName && c.agentName.toLowerCase().includes(q)) ||
        (c.carrier && c.carrier.toLowerCase().includes(q)) ||
        (c.policyId && c.policyId.toLowerCase().includes(q)) ||
        (c.planName && c.planName.toLowerCase().includes(q));

      const matchesCarrier = carrierFilter === 'all' || c.carrier === carrierFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPeriod = periodFilter === 'all' || c.period === periodFilter;

      return matchesSearch && matchesCarrier && matchesStatus && matchesPeriod;
    });
  }, [commissions, searchQuery, carrierFilter, statusFilter, periodFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalGross = commissions.reduce((sum, c) => sum + (Number(c.grossAmount) || 0), 0);
    const totalNet = commissions.reduce((sum, c) => sum + (Number(c.netAmount) || 0), 0);
    const totalDeduction = commissions.reduce((sum, c) => sum + (Number(c.supportDeduction) || 0) * (Number(c.grossAmount) || 0), 0);
    const settledCount = commissions.filter((c) => c.status === 'SETTLED' || c.status === 'PAID').length;
    const pendingAuditCount = commissions.filter((c) => c.status === 'PENDING' || c.status === 'AUDIT').length;

    // Carrier Distribution
    const carrierMap = {};
    commissions.forEach((c) => {
      const cr = c.carrier || 'Other';
      if (!carrierMap[cr]) carrierMap[cr] = { name: cr, gross: 0, net: 0, count: 0 };
      carrierMap[cr].gross += Number(c.grossAmount) || 0;
      carrierMap[cr].net += Number(c.netAmount) || 0;
      carrierMap[cr].count += 1;
    });

    const carrierList = Object.values(carrierMap).sort((a, b) => b.net - a.net);
    const maxCarrierVal = Math.max(...carrierList.map((c) => c.net), 1);

    return {
      totalGross,
      totalNet,
      totalDeduction,
      settledCount,
      pendingAuditCount,
      carrierList,
      maxCarrierVal,
    };
  }, [commissions]);

  const uniqueCarriers = useMemo(() => {
    return Array.from(new Set(commissions.map((c) => c.carrier).filter(Boolean)));
  }, [commissions]);

  const uniquePeriods = useMemo(() => {
    return Array.from(new Set(commissions.map((c) => c.period).filter(Boolean))).sort().reverse();
  }, [commissions]);

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-y-auto">
      {/* ── Top Header Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Commission &amp; Revenue Ledger</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SSS Engine Active
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                PMPM carrier statements, Sale Support Status (SSS) fee splits &amp; monthly settlement audit.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh from Database"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleRunCalculation}
            disabled={calculating}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs transition flex items-center gap-1.5 shadow-xs hover:shadow cursor-pointer disabled:opacity-50"
            title="Recalculate commissions using latest deal data and SSS tiers"
          >
            <span className={`material-symbols-outlined text-[16px] ${calculating ? 'animate-spin' : ''}`}>
              sync_saved_locally
            </span>
            <span>{calculating ? 'Calculating Engine...' : 'Run Auto-Calculation'}</span>
          </button>
        </div>
      </div>

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-fade-in-up bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* 1. Four Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Gross Commission */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Gross Paid</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ${metrics.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="inline-flex items-center text-emerald-600 font-bold gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +100%
              </span>
              <span>100% Live DB carrier remittances</span>
            </div>
          </div>

          {/* Card 2: Support Share Deductions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Support Fee Share (SSS)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">pie_chart</span>
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
              ${(metrics.totalGross - metrics.totalNet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-2">
              <span>Tier split: 0% / 40% / 75% per SOP</span>
            </div>
          </div>

          {/* Card 3: Net Agent Payout */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Net Agent Payout</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">savings</span>
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              ${metrics.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{metrics.settledCount} policies settled</span>
            </div>
          </div>

          {/* Card 4: Audit & Dispute Status */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Audit &amp; Settlement</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {commissions.length} <span className="text-xs font-semibold text-slate-500 font-sans">records</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-2">
              <span className="text-emerald-700 font-bold">{metrics.settledCount} Settled</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600 font-bold">{metrics.pendingAuditCount} In Audit</span>
            </div>
          </div>
        </div>

        {/* 2. Middle Row: SSS Rule Reference & Carrier Share Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card: SSS (Sale Support Status) Logic Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
                <h3 className="text-xs font-bold text-slate-900">SSS Commission Rules Engine</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                SOP Rules
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Hoa hồng được chia tự động dựa trên mức độ tham gia hỗ trợ của đội ngũ Sales Support:
            </p>
            <div className="space-y-2.5 my-auto">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">NONE (100% Agent)</div>
                  <div className="text-[10px] text-slate-500">Agent tự tư vấn báo giá &amp; tự enroll hoàn tất</div>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  0% Phí
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">PARTIAL (60% Agent)</div>
                  <div className="text-[10px] text-slate-500">Agent báo giá, Support agent hỗ trợ enroll</div>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  40% Phí
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">FULL (25% Agent)</div>
                  <div className="text-[10px] text-slate-500">Support agent làm trọn gói báo giá &amp; enroll</div>
                </div>
                <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                  75% Phí
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-950">New Agent Grace Period</div>
                  <div className="text-[10px] text-emerald-700">Miễn phí support 20 deals đầu hoặc &le; 3 tháng</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Grace 100%
                </span>
              </div>
            </div>
          </div>

          {/* Card: Carrier Share Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">bar_chart</span>
                <h3 className="text-xs font-bold text-slate-900">Carrier Revenue Breakdown (Live Database)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {metrics.carrierList.length} Active Carriers
              </span>
            </div>

            <div className="space-y-3.5 my-auto py-1">
              {metrics.carrierList.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8">No carrier revenue records available.</div>
              ) : (
                metrics.carrierList.map((cr, idx) => {
                  const percent = Math.round((cr.net / (metrics.totalNet || 1)) * 100);
                  const barWidth = Math.max((cr.net / metrics.maxCarrierVal) * 100, 8);
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs group">
                      <div className="w-28 text-right truncate font-medium text-slate-700 group-hover:text-blue-700">
                        {cr.name}
                      </div>
                      <div className="flex-grow bg-slate-100 h-4 rounded-md overflow-hidden flex group-hover:ring-1 group-hover:ring-blue-300">
                        <div
                          style={{ width: `${barWidth}%` }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-md transition-all duration-300"
                        />
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-slate-900 group-hover:text-emerald-700">
                        ${cr.net.toFixed(2)}
                      </div>
                      <span className="w-10 text-right text-[11px] font-semibold text-slate-400">
                        {percent}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-grow">
            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm flex-grow">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search policy ID, agent, carrier, plan..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {/* Carrier Filter */}
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Carrier: All</option>
              {uniqueCarriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="SETTLED">SETTLED (Paid)</option>
              <option value="PENDING">PENDING (In Review)</option>
              <option value="AUDIT">AUDIT (Disputed)</option>
            </select>

            {/* Period Filter */}
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Period: All</option>
              {uniquePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500 self-center">
            Showing <span className="text-slate-900 font-bold">{filteredCommissions.length}</span> of {commissions.length} records
          </div>
        </div>

        {/* 4. Interactive Commission Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Policy / Deal</th>
                  <th className="px-4 py-3">Carrier &amp; Plan</th>
                  <th className="px-4 py-3">Agent &amp; SSS Tier</th>
                  <th className="px-4 py-3 text-center">Members</th>
                  <th className="px-4 py-3 text-right">Gross Remittance</th>
                  <th className="px-4 py-3 text-right">Support Share</th>
                  <th className="px-4 py-3 text-right">Net Agent Payout</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      No commission records found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRecord(row)}
                      className="hover:bg-blue-50/50 transition cursor-pointer group"
                      title="Click to view full policy statement"
                    >
                      {/* Policy / Deal */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">description</span>
                          <span>{row.policyId || row.deal?.code || 'N/A'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Period: {row.period || '2026-02'}
                        </div>
                      </td>

                      {/* Carrier & Plan */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{row.carrier || 'BCBS'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                          {row.planName || row.deal?.title || 'Standard PPO Plan'}
                        </div>
                      </td>

                      {/* Agent & SSS Tier */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.agentName || 'Khanh Nguyen'}</div>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${
                              (row.saleSupportStatus || '').toUpperCase().includes('NONE')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : (row.saleSupportStatus || '').toUpperCase().includes('PARTIAL')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            SSS: {(row.saleSupportStatus || '').toUpperCase().includes('NONE')
                              ? 'NONE (7/3)'
                              : (row.saleSupportStatus || '').toUpperCase().includes('PARTIAL')
                              ? 'PARTIAL (5/5)'
                              : 'FULL (3/7)'}
                          </span>
                        </div>
                      </td>

                      {/* Members */}
                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {row.memberCount || 1}
                      </td>

                      {/* Gross */}
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">
                        ${Number(row.grossAmount || 0).toFixed(2)}
                      </td>

                      {/* Support Share */}
                      <td className="px-4 py-3 text-right font-mono text-amber-600 font-medium">
                        ${(Number(row.grossAmount || 0) - Number(row.netAmount || 0)).toFixed(2)}
                      </td>

                      {/* Net */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 text-xs">
                        ${Number(row.netAmount || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            row.status === 'SETTLED' || row.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : row.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'SETTLED' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{row.status || 'SETTLED'}</span>
                        </span>
                      </td>

                      {/* Audit Actions */}
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {row.status !== 'SETTLED' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(row, 'SETTLED')}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition cursor-pointer"
                              title="Mark this remittance as Settled"
                            >
                              Settle
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(row, 'AUDIT')}
                              className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold transition cursor-pointer"
                              title="Flag for Audit / Dispute"
                            >
                              Audit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(row)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition cursor-pointer"
                            title="View Statement Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Slide-Over / Modal: Policy Statement Details ───────────────────── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Commission Remittance Statement</h3>
                  <p className="text-[11px] text-slate-500">ID: {selectedRecord.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Policy Number</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{selectedRecord.policyId || 'MID-819273'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Carrier Name</span>
                  <span className="font-bold text-slate-900">{selectedRecord.carrier}</span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Writing Agent</span>
                  <span className="font-bold text-slate-800">{selectedRecord.agentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Agent NPN</span>
                  <span className="font-mono text-slate-700">{selectedRecord.agentNpn || '#1984210'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sale Support Status (SSS)</span>
                  <span className="font-bold text-blue-700">
                    {(selectedRecord.saleSupportStatus || '').toUpperCase().includes('NONE')
                      ? 'NONE (7/3 Split: Agent 70% / Support 30%)'
                      : (selectedRecord.saleSupportStatus || '').toUpperCase().includes('PARTIAL')
                      ? 'PARTIAL (5/5 Split: Agent 50% / Support 50%)'
                      : 'FULL (3/7 Split: Agent 30% / Support 70%)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Statement Period</span>
                  <span className="font-mono text-slate-700">{selectedRecord.period || '2026-02'}</span>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Gross Remittance ({selectedRecord.memberCount || 1} members)</span>
                  <span className="font-mono font-semibold">${Number(selectedRecord.grossAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-700">
                  <span>Support Fee Deduction ({(Number(selectedRecord.supportDeduction || 0) * 100).toFixed(0)}%)</span>
                  <span className="font-mono font-semibold">
                    -${(Number(selectedRecord.grossAmount || 0) - Number(selectedRecord.netAmount || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-slate-900 font-bold text-sm">
                  <span>Net Payout Amount</span>
                  <span className="font-mono text-emerald-700">${Number(selectedRecord.netAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Status: <strong className="text-slate-800">{selectedRecord.status}</strong>
              </span>
              <div className="flex items-center gap-2">
                {selectedRecord.status !== 'SETTLED' ? (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedRecord, 'SETTLED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Confirm Settlement
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedRecord, 'AUDIT')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition cursor-pointer"
                  >
                    Flag for Audit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
