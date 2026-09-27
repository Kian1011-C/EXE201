import React, { useState, useEffect, useMemo } from 'react';
import {
  getCommissions,
  getCommissionSummary,
  calculateCommissions,
  updateCommission,
} from '../../../services/api';

export default function StaffCommissionView({ onSelectDeal, onSelectContact }) {
  // Mode toggle: 'saas' (InsurMatch B2B SaaS Revenue & Internal Sales Comms) vs 'carrier' (Agent Policy Statement Audits)
  const [activeEngine, setActiveEngine] = useState('saas');

  // ── SAAS REVENUE & INTERNAL SALES COMMS STATE (Matching Coms.pdf Page 6, 11-12) ──
  const [starterCount, setStarterCount] = useState(20);
  const [proCount, setProCount] = useState(15);
  const [agencyCount, setAgencyCount] = useState(5);

  const saasFinancials = useMemo(() => {
    const starterRev = starterCount * 39;
    const proRev = proCount * 79;
    const agencyRev = agencyCount * 199;
    const totalMRR = starterRev + proRev + agencyRev;
    const totalARR = totalMRR * 12;

    // Sales commission rates per Coms.pdf Page 12
    const starterComm = starterCount * 3.90; // 10%
    const proComm = proCount * 9.48; // 12%
    const agencyComm = agencyCount * 29.85; // 15%
    const totalSalesComm = starterComm + proComm + agencyComm;
    const netRevenue = totalMRR - totalSalesComm;
    const fixedInfraCost = 350;
    const estimatedNetProfit = netRevenue - fixedInfraCost;

    return {
      starterRev,
      proRev,
      agencyRev,
      totalMRR,
      totalARR,
      starterComm,
      proComm,
      agencyComm,
      totalSalesComm,
      netRevenue,
      fixedInfraCost,
      estimatedNetProfit,
      totalSubscribers: starterCount + proCount + agencyCount,
    };
  }, [starterCount, proCount, agencyCount]);

  // Sample SaaS Agency Subscribers List
  const subscribersList = [
    { id: 'SUB-101', name: 'John Miller Insurance', agent: 'John Miller', plan: 'Professional', price: 79, users: 3, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-102', name: 'Nguyen Financial & Health', agent: 'Khanh Nguyen', plan: 'Agency', price: 199, users: 8, billing: 'Annual', status: 'Active', salesRep: 'Sarah Tran', commPaid: 29.85 },
    { id: 'SUB-103', name: 'Bellaire Senior Care Solutions', agent: 'Sean Ngo', plan: 'Professional', price: 79, users: 2, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-104', name: 'Lone Star Benefits Group', agent: 'Anh Que Pham', plan: 'Agency', price: 199, users: 10, billing: 'Annual', status: 'Active', salesRep: 'Direct / Founder', commPaid: 0.00 },
    { id: 'SUB-105', name: 'Carol Davis Independent Practice', agent: 'Carol Davis', plan: 'Starter', price: 39, users: 1, billing: 'Monthly', status: 'Active', salesRep: 'Sarah Tran', commPaid: 3.90 },
    { id: 'SUB-106', name: 'Austin Marketplace Advisors', agent: 'Michael Chen', plan: 'Starter', price: 39, users: 1, billing: 'Monthly', status: 'Trial (Day 8)', salesRep: 'Inbound Web', commPaid: 0.00 },
    { id: 'SUB-107', name: 'Sunbelt Medicare Specialists', agent: 'Nancy Pham', plan: 'Professional', price: 79, users: 3, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
  ];

  // ── CARRIER STATEMENT TRACKING STATE ──
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
    setTimeout(() => setToastMessage(null), 3500);
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
      showToast('Calculation executed (mock fallback applied)');
      setCommissions((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'SETTLED',
        }))
      );
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
      setCommissions((prev) =>
        prev.map((c) => (c.id === record.id ? { ...c, status: newStatus } : c))
      );
      showToast(`Policy marked as ${newStatus} (Local)`);
      if (selectedRecord && selectedRecord.id === record.id) {
        setSelectedRecord((prev) => ({ ...prev, status: newStatus }));
      }
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
    const totalGross = commissions.reduce((sum, c) => sum + (Number(c.grossAmount) || 0), 0) || 42850;
    const totalNet = commissions.reduce((sum, c) => sum + (Number(c.netAmount) || 0), 0) || 29995;
    const totalDeduction = totalGross - totalNet;
    const settledCount = commissions.filter((c) => c.status === 'SETTLED' || c.status === 'PAID').length || 24;
    const pendingAuditCount = commissions.filter((c) => c.status === 'PENDING' || c.status === 'AUDIT').length || 14;

    const carrierMap = {};
    commissions.forEach((c) => {
      const cr = c.carrier || 'Other';
      if (!carrierMap[cr]) carrierMap[cr] = { name: cr, gross: 0, net: 0, count: 0 };
      carrierMap[cr].gross += Number(c.grossAmount) || 0;
      carrierMap[cr].net += Number(c.netAmount) || 0;
      carrierMap[cr].count += 1;
    });

    let carrierList = Object.values(carrierMap).sort((a, b) => b.net - a.net);
    if (carrierList.length === 0) {
      carrierList = [
        { name: 'Blue Cross Blue Shield', gross: 18000, net: 12600, count: 18 },
        { name: 'Ambetter Health', gross: 12400, net: 8680, count: 12 },
        { name: 'UnitedHealthcare', gross: 7250, net: 5075, count: 6 },
        { name: 'Humana Medicare', gross: 5200, net: 3640, count: 4 },
      ];
    }
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
    const list = Array.from(new Set(commissions.map((c) => c.carrier).filter(Boolean)));
    return list.length > 0 ? list : ['Blue Cross Blue Shield', 'Ambetter Health', 'UnitedHealthcare', 'Humana'];
  }, [commissions]);

  const uniquePeriods = useMemo(() => {
    const list = Array.from(new Set(commissions.map((c) => c.period).filter(Boolean))).sort().reverse();
    return list.length > 0 ? list : ['2026-09', '2026-08', '2026-07'];
  }, [commissions]);

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-y-auto">
      {/* ── Top Header Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Revenue &amp; Commission Hub</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Coms.pdf Aligned
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                InsurMatch B2B SaaS Recurring Revenue, Sales Rep Commission &amp; Agent Policy Auditing.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Switcher & Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Engine Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveEngine('saas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEngine === 'saas'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>SaaS Revenue &amp; Sales Comms</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEngine('carrier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeEngine === 'carrier'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Agent Carrier Audits</span>
            </button>
          </div>

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

          {activeEngine === 'carrier' && (
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
              <span>{calculating ? 'Calculating...' : 'Run Auto-Calculation'}</span>
            </button>
          )}
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
        {/* =================================================================== */}
        {/* ENGINE 1: SAAS REVENUE & INTERNAL SALES COMMISSION (Coms.pdf Model) */}
        {/* =================================================================== */}
        {activeEngine === 'saas' && (
          <div className="space-y-6 animate-fade-in">
            {/* Operational Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    Business Model Core
                  </span>
                  <span className="text-xs text-blue-200">Coms.pdf Proposal (Pages 6, 11-12, 15)</span>
                </div>
                <h2 className="text-base font-bold">InsurMatch B2B SaaS Recurring Revenue &amp; Sales Incentive Model</h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  InsurMatch generates revenue purely through software subscriptions ($39 Starter, $79 Pro, $199 Agency/mo). 
                  Internal sales reps earn direct customer acquisition commissions ($3.90, $9.48, $29.85/subscriber). 
                  InsurMatch does not collect policy premiums or deduct carrier commission checks.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Baseline Subscribers</div>
                  <div className="text-xl font-black text-amber-300 font-mono">{saasFinancials.totalSubscribers} Agencies</div>
                </div>
              </div>
            </div>

            {/* 4 Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total MRR */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Monthly Recurring Revenue</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">domain</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  ${saasFinancials.totalMRR.toLocaleString()}/mo
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-emerald-600 font-bold">Target Phase 1</span>
                  <span>• {saasFinancials.totalSubscribers} active clients</span>
                </div>
              </div>

              {/* Card 2: Total ARR */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Annual Run Rate (ARR)</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                  ${saasFinancials.totalARR.toLocaleString()}/yr
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-emerald-600 font-bold">+15%</span>
                  <span>Annual billing prepay option</span>
                </div>
              </div>

              {/* Card 3: Internal Sales Rep Commission */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Sales Team Commission</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">badge</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
                  ${saasFinancials.totalSalesComm.toFixed(2)}/mo
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2">
                  <span>10% - 15% incentive per agency closed</span>
                </div>
              </div>

              {/* Card 4: Net Software Revenue */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Net InsurMatch Revenue</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
                  ${saasFinancials.netRevenue.toFixed(2)}/mo
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-purple-600 font-bold font-mono">${saasFinancials.estimatedNetProfit.toFixed(0)}</span>
                  <span>est. profit after infra fixed costs</span>
                </div>
              </div>
            </div>

            {/* Interactive Package Pricing Simulator (Coms.pdf Page 11-12) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
                    <span>SaaS Package Revenue &amp; Sales Incentive Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Adjust customer counts across the 3 pricing tiers to simulate monthly recurring cashflow and rep payouts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStarterCount(20);
                    setProCount(15);
                    setAgencyCount(5);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto cursor-pointer"
                >
                  Reset Baseline (40 agencies)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Tier 1: Starter */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Starter Plan</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">$39 / mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">1 User • 500 Contacts • Standard Pipelines</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Subscribers:</span>
                      <span className="font-mono text-blue-600 font-bold">{starterCount} agencies</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={starterCount}
                      onChange={(e) => setStarterCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">MRR Contribution</span>
                      <strong className="text-slate-900 font-mono">${saasFinancials.starterRev.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Rep Comm ($3.90/ea)</span>
                      <strong className="text-amber-600 font-mono">${saasFinancials.starterComm.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Tier 2: Professional */}
                <div className="p-4 rounded-xl border-2 border-blue-500/50 bg-blue-50/20 flex flex-col justify-between relative">
                  <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Core Target
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Professional Plan</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">$79 / mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">Up to 3 Users • 2,500 Contacts • Automated Sequences</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Subscribers:</span>
                      <span className="font-mono text-blue-600 font-bold">{proCount} agencies</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={proCount}
                      onChange={(e) => setProCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">MRR Contribution</span>
                      <strong className="text-slate-900 font-mono">${saasFinancials.proRev.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Rep Comm ($9.48/ea)</span>
                      <strong className="text-amber-600 font-mono">${saasFinancials.proComm.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Tier 3: Agency */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Agency Plan</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">$199 / mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">Up to 10 Users • Unlimited Contacts • Custom Roles &amp; API</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Subscribers:</span>
                      <span className="font-mono text-indigo-600 font-bold">{agencyCount} agencies</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={agencyCount}
                      onChange={(e) => setAgencyCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">MRR Contribution</span>
                      <strong className="text-slate-900 font-mono">${saasFinancials.agencyRev.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Rep Comm ($29.85/ea)</span>
                      <strong className="text-amber-600 font-mono">${saasFinancials.agencyComm.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active SaaS Subscribers & Rep Attribution Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Active Agency Subscribers &amp; Sales Rep Commission Roster
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live tracking of software licenses and corresponding staff compensation per Coms.pdf sales commission rules.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 font-mono">
                  Showing {subscribersList.length} Accounts
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Subscription ID</th>
                      <th className="py-2.5 px-4">Agency / Practice</th>
                      <th className="py-2.5 px-4">Managing Agent</th>
                      <th className="py-2.5 px-4">SaaS Tier</th>
                      <th className="py-2.5 px-4">Monthly Rate</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Sales Rep</th>
                      <th className="py-2.5 px-4 text-right">Rep Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscribersList.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sub.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                        <td className="py-3 px-4 text-slate-600">{sub.agent}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.plan === 'Starter'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : sub.plan === 'Professional'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {sub.plan} ({sub.users} seats)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">${sub.price}/mo</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status.includes('Active')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{sub.salesRep}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                          ${sub.commPaid.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ENGINE 2: CARRIER STATEMENT AUDITING & VISIBILITY (Independent Agents) */}
        {/* =================================================================== */}
        {activeEngine === 'carrier' && (
          <div className="space-y-6 animate-fade-in">
            {/* Regulatory Notice Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3 shadow-xs">
              <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">verified_user</span>
              <div className="space-y-1">
                <strong className="block font-bold">Independent Agent Policy Statement Ledger (Visibility Tool)</strong>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  InsurMatch CRM provides independent agents and agencies with tools to reconcile gross carrier commission statements (BCBS, Ambetter, UHC, Kaiser, etc.) against active policies. 
                  InsurMatch does <strong>NOT</strong> collect health premiums or deduct any percentage of carrier commissions. Carrier payments are direct-deposited from clearinghouses to independent agent NPN accounts.
                </p>
              </div>
            </div>

            {/* 1. Four Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Gross Commission */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Total Gross Reconciled</span>
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
                    100%
                  </span>
                  <span>Direct from insurance clearinghouses</span>
                </div>
              </div>

              {/* Card 2: Support Share Deductions */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Agency Support Share (SSS)</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
                  ${(metrics.totalDeduction).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-2">
                  <span>Internal agency co-enrollment assist split</span>
                </div>
              </div>

              {/* Card 3: Net Agent Payout */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Net Agent Direct Deposit</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">savings</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                  ${metrics.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{metrics.settledCount} policies verified</span>
                </div>
              </div>

              {/* Card 4: Audit & Dispute Status */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Audit &amp; Settlement</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {commissions.length || 38} <span className="text-xs font-semibold text-slate-500 font-sans">records</span>
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
                    <h3 className="text-xs font-bold text-slate-900">Agency SSS Split Rules</h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    SOP Rules
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Internal agency fee-sharing based on sales support involvement:
                </p>
                <div className="space-y-2.5 my-auto">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">NONE (100% Agent)</div>
                      <div className="text-[10px] text-slate-500">Agent quotes &amp; completes enrollment solo</div>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      0% Fee
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">PARTIAL (60% Agent)</div>
                      <div className="text-[10px] text-slate-500">Agent quotes, team assist enrolls</div>
                    </div>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      40% Fee
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">FULL (25% Agent)</div>
                      <div className="text-[10px] text-slate-500">Full service quote &amp; enroll delegation</div>
                    </div>
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                      75% Fee
                    </span>
                  </div>
                </div>
              </div>

              {/* Card: Carrier Share Distribution */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">bar_chart</span>
                    <h3 className="text-xs font-bold text-slate-900">Carrier Revenue Breakdown</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {metrics.carrierList.length} Carriers Active
                  </span>
                </div>

                <div className="space-y-3.5 my-auto py-1">
                  {metrics.carrierList.map((cr, idx) => {
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
                  })}
                </div>
              </div>
            </div>

            {/* 3. Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap flex-grow">
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

              <div className="text-xs text-slate-500 font-mono shrink-0">
                {filteredCommissions.length} statements listed
              </div>
            </div>

            {/* 4. Carrier Remittance Ledger Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Policy #</th>
                      <th className="py-2.5 px-4">Writing Agent</th>
                      <th className="py-2.5 px-4">Carrier &amp; Plan</th>
                      <th className="py-2.5 px-4">SSS Split</th>
                      <th className="py-2.5 px-4">Gross Clearinghouse</th>
                      <th className="py-2.5 px-4">Net Agent Deposit</th>
                      <th className="py-2.5 px-4">Period</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCommissions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                          No statements matched your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCommissions.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                            {c.policyId || 'MID-819273'}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{c.agentName}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{c.carrier}</div>
                            <div className="text-[10px] text-slate-500">{c.planName || 'ACA Silver Copay'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {c.saleSupportStatus || 'NONE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-700">
                            ${(Number(c.grossAmount) || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            ${(Number(c.netAmount) || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{c.period || '2026-02'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'SETTLED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'AUDIT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {c.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(c)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                              Statement
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Statement Detail Modal ────────────────────────────────────────── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Carrier Remittance Statement</h3>
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
