import React, { useState, useMemo, useEffect } from 'react';
import {
  getSubscribers,
  saveSubscribers,
  calculateRealFinancials,
  SAAS_PLANS,
  subscribeOrUpgradePlan,
} from '../../../services/subscriptionService';

export default function AdminCommissionTab({
  commissions = [],
  accounts = [],
  onRefresh,
}) {
  // ── 1. REAL SUBSCRIBERS STATE & SYNC ──────────────────────────────────────────
  const [subscribers, setSubscribers] = useState(() => getSubscribers());
  const [viewMode, setViewMode] = useState('real'); // 'real' | 'simulator'
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // Modal states for adding subscriber
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newPlan, setNewPlan] = useState('Professional');
  const [newBillingCycle, setNewBillingCycle] = useState('Monthly');
  const [newSalesRep, setNewSalesRep] = useState('David Pham');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Visa •••• 4242');

  // Modal state for changing plan
  const [changePlanSub, setChangePlanSub] = useState(null);
  const [selectedChangePlan, setSelectedChangePlan] = useState('Professional');

  // ── 2. SIMULATOR STATE (Coms.pdf baseline 20-15-5) ───────────────────────────
  const [starterCount, setStarterCount] = useState(20);
  const [proCount, setProCount] = useState(15);
  const [agencyCount, setAgencyCount] = useState(5);

  // Sync with global custom event
  useEffect(() => {
    function reloadSubs() {
      setSubscribers(getSubscribers());
    }
    window.addEventListener('insurmatch_subscriptions_updated', reloadSubs);
    return () => window.removeEventListener('insurmatch_subscriptions_updated', reloadSubs);
  }, []);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  // ── REAL FINANCIALS DERIVED FROM REAL SUBSCRIBERS ──────────────────────────
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

  // Active financials to display in cards based on current viewMode
  const activeFinancials = viewMode === 'real' ? realFinancials : simFinancials;

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return (subscribers || [])?.filter((sub) => {
      const q = searchQuery?.toLowerCase()?.trim();
      const matchSearch =
        !q ||
        (sub.agencyName || sub.name || '')?.toLowerCase().includes(q) ||
        (sub.agentName || sub.agent || '')?.toLowerCase().includes(q) ||
        (sub.agentEmail || '')?.toLowerCase().includes(q) ||
        (sub.id || '')?.toLowerCase().includes(q) ||
        (sub.salesRep || '')?.toLowerCase().includes(q);

      const matchPlan = planFilter === 'all' || (sub.plan || '')?.toLowerCase() === planFilter?.toLowerCase();
      return matchSearch && matchPlan;
    });
  }, [subscribers, searchQuery, planFilter]);

  // ── HANDLERS: ADD / EDIT / CANCEL SUBSCRIBER ───────────────────────────────
  function handleAddSubscriberSubmit(e) {
    e.preventDefault();
    if (!newAgencyName || !newAgentName) {
      showToast('Please enter agency name and principal agent name');
      return;
    }

    const planKey = newPlan?.toLowerCase();
    const planMeta = SAAS_PLANS[planKey] || SAAS_PLANS.professional;
    const price = newBillingCycle === 'Annual' ? Math.round(planMeta.annualPrice / 12) : planMeta.monthlyPrice;

    const newSub = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      agencyName: newAgencyName,
      agentName: newAgentName,
      agentEmail: newAgentEmail || `${newAgentName?.toLowerCase()?.replace(/\s+/g, '')}@insurmatch.us`,
      plan: newPlan,
      billingCycle: newBillingCycle,
      price: price,
      status: 'Active',
      seatsUsed: 1,
      maxSeats: planMeta.maxSeats,
      contactsCount: 1,
      maxContacts: planMeta.maxContacts,
      salesRep: newSalesRep,
      commissionPaid: planMeta.salesCommissionAmount,
      startDate: new Date().toISOString()?.split('T')[0],
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()?.split('T')[0],
      paymentMethod: newPaymentMethod,
    };

    const nextList = [newSub, ...subscribers];
    saveSubscribers(nextList);
    setSubscribers(nextList);
    setIsAddModalOpen(false);

    // Reset inputs
    setNewAgencyName('');
    setNewAgentName('');
    setNewAgentEmail('');
    showToast(`Successfully added subscription ${newSub.id} for ${newAgencyName}! MRR updated.`);
  }

  function handleToggleStatus(subId) {
    const nextList = subscribers?.map((sub) => {
      if (sub.id === subId) {
        const nextStatus = sub.status === 'Active' ? 'Suspended' : 'Active';
        return { ...sub, status: nextStatus };
      }
      return sub;
    });
    saveSubscribers(nextList);
    setSubscribers(nextList);
    showToast(`Updated subscription status for ${subId}!`);
  }

  function handleDeleteSubscriber(subId) {
    if (!window.confirm(`Are you sure you want to cancel and delete subscription ${subId}?`)) return;
    const nextList = subscribers?.filter((sub) => sub.id !== subId);
    saveSubscribers(nextList);
    setSubscribers(nextList);
    showToast(`Cancelled subscription ${subId}!`);
  }

  function handleSavePlanChange() {
    if (!changePlanSub) return;
    const targetKey = selectedChangePlan?.toLowerCase();
    const planMeta = SAAS_PLANS[targetKey] || SAAS_PLANS.professional;

    const nextList = subscribers?.map((sub) => {
      if (sub.id === changePlanSub.id) {
        return {
          ...sub,
          plan: planMeta.name,
          price: sub.billingCycle === 'Annual' ? Math.round(planMeta.annualPrice / 12) : planMeta.monthlyPrice,
          maxSeats: planMeta.maxSeats,
          maxContacts: planMeta.maxContacts,
          commissionPaid: planMeta.salesCommissionAmount,
        };
      }
      return sub;
    });

    saveSubscribers(nextList);
    setSubscribers(nextList);
    setChangePlanSub(null);
    showToast(`Upgraded subscription ${changePlanSub.id} to ${planMeta.name}!`);
  }

  function handleResetBaseline() {
    setStarterCount(20);
    setProCount(15);
    setAgencyCount(5);
    showToast('Reset to 40 standard baseline accounts (Coms.pdf)');
  }

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:underline cursor-pointer">
            Close
          </button>
        </div>
      )}

      {/* ── Mode Selection Header Banner ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[22px]">payments</span>
              <span>B2B SaaS Revenue &amp; Sales Commission Ledger</span>
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase">
              Coms.pdf Grounded
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Live Real-Time Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            InsurMatch recurring revenue across 3 CRM tiers ($39, $79, $199) and commission disbursements to internal sales reps ($3.90, $9.48, $29.85/client).
          </p>
        </div>

        {/* View Mode Toggle & Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Segmented Mode Button */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('real')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'real'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Subscriptions ({subscribers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'simulator'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Financial Simulation</span>
            </button>
          </div>

          {viewMode === 'real' ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Add New Subscription</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">restart_alt</span>
              <span>Reset 40 Baseline</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={() => {
                setSubscribers(getSubscribers());
                onRefresh();
                showToast('Synced all subscription & commission data!');
              }}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Sync data"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 4 Financial KPI Stat Cards ────────────────────────────────────── */}
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
            <span>({activeFinancials.totalSubscribers} agency active)</span>
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
            <span>12-month run rate</span>
          </div>
        </div>

        {/* Card 3: Sales Rep Commission */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Internal Sales Rep Commissions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
            ${activeFinancials.totalSalesComm.toFixed(2)}/mo
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2">
            <span>Paid 10% - 15% per contract</span>
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

      {/* ── REAL MODE: TIER DISTRIBUTION SUMMARY CARDS ─────────────────────── */}
      {viewMode === 'real' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter Plan Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Starter Plan</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  $39 / month
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">1 Seat • 500 Records • Renewal Alerts</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Active Subscriptions:</span>
                <span className="text-lg font-black text-blue-600 font-mono">
                  {realFinancials.starterCount} agency
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between items-center text-slate-600">
              <span>Doanh thu MRR: <strong className="text-slate-900 font-mono">${realFinancials.starterCount * 39}</strong></span>
              <span>Sales Commission: <strong className="text-amber-600 font-mono">${(realFinancials.starterCount * 3.9).toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Professional Plan Box */}
          <div className="bg-white rounded-2xl border-2 border-indigo-500/40 p-5 shadow-2xs flex flex-col justify-between relative">
            <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Professional Plan</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  $79 / month
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Up to 3 Seats • 2,500 Records • SLA 48h &amp; Tickets</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Active Subscriptions:</span>
                <span className="text-lg font-black text-indigo-600 font-mono">
                  {realFinancials.proCount} agency
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between items-center text-slate-600">
              <span>Doanh thu MRR: <strong className="text-slate-900 font-mono">${realFinancials.proCount * 79}</strong></span>
              <span>Sales Commission: <strong className="text-amber-600 font-mono">${(realFinancials.proCount * 9.48).toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Agency Plan Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Agency Enterprise</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  $199 / month
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Up to 10 Seats • Unlimited Records • AOR Permissions &amp; API</p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Active Subscriptions:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {realFinancials.agencyCount} agency
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between items-center text-slate-600">
              <span>Doanh thu MRR: <strong className="text-slate-900 font-mono">${realFinancials.agencyCount * 199}</strong></span>
              <span>Sales Commission: <strong className="text-amber-600 font-mono">${(realFinancials.agencyCount * 29.85).toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── SIMULATOR VIEW (When user clicks 'Mô phỏng đề án') ──────────────── */}
      {viewMode === 'simulator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">tune</span>
                <span>Revenue &amp; Sales Commission Projection Simulator (Coms.pdf)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust sliders to project subscriber volume across Starter ($39), Professional ($79), and Agency ($199) tiers.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Projected Volume: <strong className="text-indigo-700 font-mono">{simFinancials.totalSubscribers} clients</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter Slider */}
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
                  <span>Simulated Clients:</span>
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

            {/* Professional Slider */}
            <div className="p-4 rounded-xl border-2 border-indigo-500/50 bg-indigo-50/20 flex flex-col justify-between relative">
              <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Target Baseline (15 clients)
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Professional Plan</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    $79 / month
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Up to 3 Seats • 2,500 Records • Task Automation</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Simulated Clients:</span>
                  <span className="font-mono text-indigo-600 font-bold">{proCount} agencies</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={proCount}
                  onChange={(e) => setProCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
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

            {/* Agency Slider */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Agency Enterprise</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    $199 / month
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Up to 10 Seats • Unlimited Records • RBAC &amp; API</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Simulated Clients:</span>
                  <span className="font-mono text-emerald-600 font-bold">{agencyCount} agencies</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={agencyCount}
                  onChange={(e) => setAgencyCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
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

      {/* ── REAL CONTRACTS & COMMISSION LEDGER TABLE ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Active Subscriptions &amp; Sales Commission Ledger</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredSubscribers.length} Contracts
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Roster of active agency subscriptions and commission payouts to internal sales reps.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agency, agent, sales, ID..."
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white min-w-[200px]"
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
                <th className="py-2.5 px-4">CRM Tier &amp; Limits</th>
                <th className="py-2.5 px-4">Rate</th>
                <th className="py-2.5 px-4">Cycle</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Sales Rep</th>
                <th className="py-2.5 px-4 text-right">Sales Commission</th>
                <th className="py-2.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400 text-xs">
                    No subscriptions matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscribers?.map((sub) => {
                  const planKey = (sub.plan || '')?.toLowerCase();
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sub.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{sub.agencyName || sub.name}</div>
                        <div className="text-[11px] text-slate-400">{sub.paymentMethod || 'Visa Direct'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{sub.agentName || sub.agent}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{sub.agentEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            planKey.includes('starter')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : planKey.includes('pro')
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span>{sub.plan}</span>
                          <span className="opacity-75">({sub.seatsUsed || 1}/{sub.maxSeats || 3} seats)</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        ${sub.price}/mo
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-[11px] font-medium">{sub.billingCycle || sub.billing || 'Monthly'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub.id)}
                          title="Click to toggle status"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            (sub.status || '')?.toLowerCase().includes('active')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {sub.status || 'Active'}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                            {(sub.salesRep || 'D')[0]}
                          </span>
                          <span>{sub.salesRep || 'Direct'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                        ${Number(sub.commissionPaid ?? sub.commPaid ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setChangePlanSub(sub);
                              setSelectedChangePlan(sub.plan || 'Professional');
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Change subscription plan"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Cancel subscription"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADD NEW SUBSCRIBER CONTRACT ─────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Agency Subscription</h3>
                  <p className="text-[11px] text-slate-500">Activate B2B CRM plan for partner agency</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubscriberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Agency / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={newAgencyName}
                  onChange={(e) => setNewAgencyName(e.target.value)}
                  placeholder="e.g. Golden State Health Agency"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Principal Agent *</label>
                  <input
                    type="text"
                    required
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Agent Email</label>
                  <input
                    type="email"
                    value={newAgentEmail}
                    onChange={(e) => setNewAgentEmail(e.target.value)}
                    placeholder="agent@insurmatch.us"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">CRM Plan Tier *</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Starter">Starter ($39/mo - 1 Seat)</option>
                    <option value="Professional">Professional ($79/mo - 3 Seats)</option>
                    <option value="Agency">Agency ($199/mo - 10 Seats)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Cycle</label>
                  <select
                    value={newBillingCycle}
                    onChange={(e) => setNewBillingCycle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual (15% Off)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Referring Sales Rep</label>
                  <select
                    value={newSalesRep}
                    onChange={(e) => setNewSalesRep(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="David Pham">David Pham (12% com)</option>
                    <option value="Sarah Tran">Sarah Tran (12% com)</option>
                    <option value="Direct / Founder">Direct / Inbound (0% com)</option>
                    <option value="Inbound Web">Inbound Web (0% com)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    placeholder="Visa •••• 4242"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Recorded MRR:</span>
                  <span className="font-mono">
                    ${newPlan === 'Starter' ? '39' : newPlan === 'Professional' ? '79' : '199'}/mo
                  </span>
                </div>
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Sales Rep Commission:</span>
                  <span className="font-mono">
                    ${newPlan === 'Starter' ? '3.90' : newPlan === 'Professional' ? '9.48' : '29.85'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold cursor-pointer shadow-xs"
                >
                  Activate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE SUBSCRIBER PLAN ─────────────────────────────────── */}
      {changePlanSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">edit_calendar</span>
                <span>Change Subscription Plan</span>
              </h3>
              <button
                type="button"
                onClick={() => setChangePlanSub(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Change subscription tier for: <strong>{changePlanSub.agencyName}</strong> ({changePlanSub.agentName})
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select new tier:</label>
                <select
                  value={selectedChangePlan}
                  onChange={(e) => setSelectedChangePlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold cursor-pointer"
                >
                  <option value="Starter">Starter ($39/mo - 1 Seat, 500 contacts)</option>
                  <option value="Professional">Professional ($79/mo - 3 Seats, 2,500 contacts)</option>
                  <option value="Agency">Agency ($199/mo - 10 Seats, Unlimited)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="text-slate-500">Current plan: <span className="font-bold text-slate-800">{changePlanSub.plan} (${changePlanSub.price}/mo)</span></div>
                <div className="text-blue-700 font-bold">
                  New plan: {selectedChangePlan} ({selectedChangePlan === 'Starter' ? '$39' : selectedChangePlan === 'Professional' ? '$79' : '$199'}/mo)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChangePlanSub(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlanChange}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
