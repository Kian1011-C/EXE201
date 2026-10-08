import React, { useState, useMemo, useEffect } from 'react';
import {
  getSubscribers,
  calculateRealFinancials,
  SAAS_PLANS,
} from '../../../services/subscriptionService';

export default function StaffCommissionView({ onSelectDeal, onSelectContact }) {
  // ── 1. REAL SUBSCRIBERS STATE & SYNC ──────────────────────────────────────────
  const [subscribers, setSubscribers] = useState(() => getSubscribers());
  const [viewMode, setViewMode] = useState('real'); // 'real' | 'simulator'
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // ── 2. SIMULATOR STATE (Coms.pdf baseline 20-15-5) ───────────────────────────
  const [starterCount, setStarterCount] = useState(20);
  const [proCount, setProCount] = useState(15);
  const [agencyCount, setAgencyCount] = useState(5);

  useEffect(() => {
    function reloadSubs() {
      setSubscribers(getSubscribers());
    }
    window.addEventListener('insurmatch_subscriptions_updated', reloadSubs);
    return () => window.removeEventListener('insurmatch_subscriptions_updated', reloadSubs);
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // ── REAL FINANCIALS ────────────────────────────────────────────────────────
  const realFinancials = useMemo(() => {
    return calculateRealFinancials(subscribers);
  }, [subscribers]);

  // ── SIMULATED FINANCIALS (Coms.pdf Page 11) ─────────────────────────────────
  const simFinancials = useMemo(() => {
    const starterRev = starterCount * 39;
    const proRev = proCount * 79;
    const agencyRev = agencyCount * 199;
    const totalMRR = starterRev + proRev + agencyRev;
    const totalARR = totalMRR * 12;

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

  const activeFinancials = viewMode === 'real' ? realFinancials : simFinancials;

  const filteredSubscribers = useMemo(() => {
    return (subscribers || [])?.filter((sub) => {
      const q = searchQuery?.toLowerCase()?.trim();
      const matchSearch =
        !q ||
        (sub.agencyName || sub.name || '')?.toLowerCase().includes(q) ||
        (sub.agentName || sub.agent || '')?.toLowerCase().includes(q) ||
        (sub.id || '')?.toLowerCase().includes(q) ||
        (sub.salesRep || '')?.toLowerCase().includes(q);

      const matchPlan = planFilter === 'all' || (sub.plan || '')?.toLowerCase() === planFilter?.toLowerCase();
      return matchSearch && matchPlan;
    });
  }, [subscribers, searchQuery, planFilter]);

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-y-auto text-left">
      {/* ── Top Header Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>InsurMatch Revenue &amp; Commission Hub</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  B2B SaaS Business Model
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Track recurring subscription revenues (MRR/ARR) &amp; internal sales rep commissions per Coms.pdf financial model.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('real')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'real'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Subscriptions ({subscribers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'simulator'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Financial Simulation</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubscribers(getSubscribers());
              showToast('Revenue and commission data refreshed!');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh data"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
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
        {/* Operational Overview Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Coms.pdf Financial Model
              </span>
              <span className="text-xs text-blue-200">Recurring B2B SaaS Cash Flow Mechanism</span>
            </div>
            <h2 className="text-base font-bold">B2B SaaS Subscription Revenue &amp; Sales Commission Structure</h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              InsurMatch generates recurring revenue by licensing its CRM platform to independent insurance agencies across 3 tiers: 
              <strong> Starter ($39)</strong>, <strong>Professional ($79)</strong>, and <strong>Agency ($199/mo)</strong>. 
              Sales representatives receive commissions directly on each active client subscription 
              (<strong>$3.90</strong>, <strong>$9.48</strong>, <strong>$29.85/client</strong>).
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-300 font-bold">Operating Scale</div>
              <div className="text-xl font-black text-amber-300 font-mono">
                {activeFinancials.totalSubscribers} Agencies
              </div>
            </div>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: MRR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Monthly Revenue ({viewMode === 'real' ? 'Actual' : 'Projected'})
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">domain</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ${activeFinancials.totalMRR.toLocaleString()}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold font-mono">100% SaaS Subscription</span>
              <span>({activeFinancials.totalSubscribers} clients)</span>
            </div>
          </div>

          {/* Card 2: ARR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Annual Recurring (ARR)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              ${activeFinancials.totalARR.toLocaleString()}/yr
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold font-mono">Run Rate</span>
              <span>12-month projection</span>
            </div>
          </div>

          {/* Card 3: Sales Rep Commission */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Sales Rep Commissions</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
              ${activeFinancials.totalSalesComm.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2">
              <span>Contract Incentive (10% - 15%)</span>
            </div>
          </div>

          {/* Card 4: Net Software Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">InsurMatch Net Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
              ${activeFinancials.netRevenue.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-purple-600 font-bold font-mono">
                ${activeFinancials.estimatedNetProfit.toFixed(0)}
              </span>
              <span>net margin after infra (~$350)</span>
            </div>
          </div>
        </div>

        {/* ── REAL MODE: 3 TIER SUMMARY CARDS ──────────────────────────────── */}
        {viewMode === 'real' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Starter Tier ($39)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {realFinancials.starterCount} active
                </span>
              </div>
              <div className="mt-3 text-lg font-black text-blue-600 font-mono">
                ${realFinancials.starterCount * 39}/mo
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sales Commission Paid: ${(realFinancials.starterCount * 3.9).toFixed(2)}/mo
              </p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-indigo-400/50 p-5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Professional Tier ($79)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {realFinancials.proCount} active
                </span>
              </div>
              <div className="mt-3 text-lg font-black text-indigo-600 font-mono">
                ${realFinancials.proCount * 79}/mo
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sales Commission Paid: ${(realFinancials.proCount * 9.48).toFixed(2)}/mo
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Agency Tier ($199)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {realFinancials.agencyCount} active
                </span>
              </div>
              <div className="mt-3 text-lg font-black text-emerald-600 font-mono">
                ${realFinancials.agencyCount * 199}/mo
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sales Commission Paid: ${(realFinancials.agencyCount * 29.85).toFixed(2)}/mo
              </p>
            </div>
          </div>
        )}

        {/* ── SIMULATOR VIEW (Sliders) ─────────────────────────────────────── */}
        {viewMode === 'simulator' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
                  <span>Subscription Tier Simulator &amp; Cash Flow Projection (Coms.pdf)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust sliders to project subscriber volume across Starter ($39), Professional ($79), and Agency ($199) tiers.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                Total Agencies: <strong className="text-blue-700 font-mono">{simFinancials.totalSubscribers}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Starter Plan Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">Starter Plan</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      $39 / month
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">1 Seat • 500 Records • Standard Pipeline</p>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Customer:</span>
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
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh thu MRR</span>
                    <strong className="text-slate-900 font-mono text-sm">${simFinancials.starterRev.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Sales Rep Fee ($3.90)</span>
                    <strong className="text-amber-600 font-mono text-sm">${simFinancials.starterComm.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Professional Plan Card */}
              <div className="p-4 rounded-xl border-2 border-blue-500/50 bg-blue-50/20 flex flex-col justify-between relative">
                <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Target Baseline (15 clients)
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">Professional Plan</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                      $79 / month
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Up to 3 Seats • 2,500 Records • Task Automation</p>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Customer:</span>
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
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh thu MRR</span>
                    <strong className="text-slate-900 font-mono text-sm">${simFinancials.proRev.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Sales Rep Fee ($9.48)</span>
                    <strong className="text-amber-600 font-mono text-sm">${simFinancials.proComm.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Agency Plan Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">Agency Enterprise</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      $199 / month
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">Up to 10 Seats • Unlimited Records • RBAC &amp; API</p>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Customer:</span>
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
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh thu MRR</span>
                    <strong className="text-slate-900 font-mono text-sm">${simFinancials.agencyRev.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Sales Rep Fee ($29.85)</span>
                    <strong className="text-amber-600 font-mono text-sm">${simFinancials.agencyComm.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Active Subscribers Ledger Table ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Agency Subscriptions &amp; Sales Commission Ledger
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Roster of subscribed insurance agencies and commission disbursements to internal sales reps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agency, agent, sales rep..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter ($39)</option>
                <option value="professional">Professional ($79)</option>
                <option value="agency">Agency ($199)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Subscription ID</th>
                  <th className="py-2.5 px-4">Agency / Firm</th>
                  <th className="py-2.5 px-4">Principal Agent</th>
                  <th className="py-2.5 px-4">CRM Tier</th>
                  <th className="py-2.5 px-4">Rate</th>
                  <th className="py-2.5 px-4">Cycle</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Sales Rep</th>
                  <th className="py-2.5 px-4 text-right">Sales Rep Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscribers?.map((sub) => {
                  const planKey = (sub.plan || '')?.toLowerCase();
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sub.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sub.agencyName || sub.name}</td>
                      <td className="py-3 px-4 text-slate-600">{sub.agentName || sub.agent}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            planKey.includes('starter')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : planKey.includes('pro')
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {sub.plan} ({sub.seatsUsed || 1}/{sub.maxSeats || 3} seats)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">${sub.price}/mo</td>
                      <td className="py-3 px-4 text-slate-600">{sub.billingCycle || sub.billing || 'Monthly'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (sub.status || '')?.toLowerCase().includes('active')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {sub.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{sub.salesRep || 'David Pham'}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                        ${Number(sub.commissionPaid ?? sub.commPaid ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
