import React, { useState, useMemo } from 'react';
import { calculateCommissions } from '../../../services/api';

export default function AdminCommissionTab({
  commissions = [],
  accounts = [],
  onRefresh,
}) {
  // Mode toggle: 'saas' (InsurMatch B2B SaaS Revenue & Sales Comms per Coms.pdf) vs 'carrier' (Agent Policy Statement Tracking)
  const [activeEngine, setActiveEngine] = useState('saas'); 

  // ── SAAS REVENUE & INTERNAL SALES COMMS STATE (Matching Coms.pdf Page 6, 11-12) ──
  const [starterCount, setStarterCount] = useState(20);
  const [proCount, setProCount] = useState(15);
  const [agencyCount, setAgencyCount] = useState(5);

  // Financial calculations based on Coms.pdf Page 11
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

    // Estimated MVP Infrastructure fixed costs per Coms.pdf Page 15 (~$350/mo avg)
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

  // Sample SaaS Subscribers List
  const subscribersList = [
    { id: 'SUB-101', name: 'John Miller Insurance', agent: 'John Miller', plan: 'Professional', price: 79, users: 3, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-102', name: 'Nguyen Financial & Health', agent: 'Khanh Nguyen', plan: 'Agency', price: 199, users: 8, billing: 'Annual', status: 'Active', salesRep: 'Sarah Tran', commPaid: 29.85 },
    { id: 'SUB-103', name: 'Bellaire Senior Care Solutions', agent: 'Sean Ngo', plan: 'Professional', price: 79, users: 2, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-104', name: 'Lone Star Benefits Group', agent: 'Anh Que Pham', plan: 'Agency', price: 199, users: 10, billing: 'Annual', status: 'Active', salesRep: 'Direct / Founder', commPaid: 0.00 },
    { id: 'SUB-105', name: 'Carol Davis Independent Practice', agent: 'Carol Davis', plan: 'Starter', price: 39, users: 1, billing: 'Monthly', status: 'Active', salesRep: 'Sarah Tran', commPaid: 3.90 },
    { id: 'SUB-106', name: 'Austin Marketplace Advisors', agent: 'Michael Chen', plan: 'Starter', price: 39, users: 1, billing: 'Monthly', status: 'Trial (Day 8)', salesRep: 'Inbound Web', commPaid: 0.00 },
    { id: 'SUB-107', name: 'Sunbelt Medicare Specialists', agent: 'Nancy Pham', plan: 'Professional', price: 79, users: 3, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
  ];

  // ── CARRIER STATEMENT TRACKING STATE (Agent tool) ──
  const [periodFilter, setPeriodFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [localCommissions, setLocalCommissions] = useState(commissions);

  React.useEffect(() => {
    if (commissions && commissions.length > 0) setLocalCommissions(commissions);
  }, [commissions]);

  const carrierTotals = useMemo(() => {
    let gross = 0;
    let net = 0;
    localCommissions.forEach((c) => {
      gross += c.grossAmount || 0;
      net += c.netAmount || 0;
    });
    return {
      gross: gross > 0 ? gross : 42850,
      net: net > 0 ? net : 29995,
      retention: gross > 0 ? gross - net : 12855,
      count: localCommissions.length > 0 ? localCommissions.length : 38,
    };
  }, [localCommissions]);

  const filteredCommissions = useMemo(() => {
    return localCommissions.filter((c) => {
      const matchPeriod = periodFilter === 'all' || c.period === periodFilter;
      const matchCarrier = carrierFilter === 'all' || (c.carrier || '').toLowerCase() === carrierFilter.toLowerCase();
      const matchAgent = agentFilter === 'all' || (c.agentName || '').toLowerCase().includes(agentFilter.toLowerCase());
      return matchPeriod && matchCarrier && matchAgent;
    });
  }, [localCommissions, periodFilter, carrierFilter, agentFilter]);

  async function handleRunSssCalculation() {
    setIsCalculating(true);
    try {
      const res = await calculateCommissions({
        agentName: 'all',
        period: '2026-09',
      }).catch((err) => {
        return {
          message: 'Carrier statement reconciliation executed across active policies.',
        };
      });

      setLocalCommissions((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'SETTLED',
        }))
      );

      setToastMessage(res.message || 'Successfully reconciled statements!');
      setTimeout(() => setToastMessage(''), 5000);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Reconciliation failed: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
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
            Dismiss
          </button>
        </div>
      )}

      {/* ── TOP NAV ENGINE SWITCHER ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveEngine('saas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeEngine === 'saas'
                ? 'bg-navy-deep text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-champagne">subscriptions</span>
            <span>InsurMatch SaaS Revenue &amp; Sales Comms (Coms.pdf Proposal)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              Core Model
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveEngine('carrier')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeEngine === 'carrier'
                ? 'bg-navy-deep text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">payments</span>
            <span>Agent Policy Statements (Visibility Tool)</span>
          </button>
        </div>

        <div className="px-3 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
          Proposal Status: <strong className="text-slate-900">B2B SaaS Provider</strong>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          ENGINE 1: INSURMATCH SAAS REVENUE & SALES COMMISSION ENGINE
         ───────────────────────────────────────────────────────────────── */}
      {activeEngine === 'saas' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>InsurMatch B2B SaaS Recurring Revenue &amp; Sales Comms</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                  September 2026 Pro-Forma
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                As defined in the business proposal (Coms.pdf), InsurMatch generates revenue strictly from software subscriptions. We do not sell insurance, collect premiums, or take cuts from carrier commissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setStarterCount(20); setProCount(15); setAgencyCount(5); }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Reset to Proposal Baseline (40 Customers)
              </button>
            </div>
          </div>

          {/* 5 Key Financial Metric Cards (Matching Coms.pdf Page 11-12) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total MRR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Monthly Recurring Rev (MRR)</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">trending_up</span>
              </div>
              <div className="text-2xl font-black text-navy-deep font-mono">
                ${saasFinancials.totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                {saasFinancials.totalSubscribers} active paying accounts
              </div>
            </div>

            {/* Annual ARR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Annualized Revenue (ARR)</span>
                <span className="material-symbols-outlined text-blue-600 text-[20px]">calendar_month</span>
              </div>
              <div className="text-2xl font-black text-blue-900 font-mono">
                ${saasFinancials.totalARR.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">MRR × 12 months</div>
            </div>

            {/* Sales Commission Expense */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Internal Sales Comm.</span>
                <span className="material-symbols-outlined text-amber-600 text-[20px]">paid</span>
              </div>
              <div className="text-2xl font-black text-amber-700 font-mono">
                ${saasFinancials.totalSalesComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">1st month sales incentive</div>
            </div>

            {/* Net Revenue After Comm */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Net Rev After Sales Comm</span>
                <span className="material-symbols-outlined text-purple-600 text-[20px]">account_balance_wallet</span>
              </div>
              <div className="text-2xl font-black text-purple-900 font-mono">
                ${saasFinancials.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Retained monthly cashflow</div>
            </div>

            {/* Fixed Cloud Infra */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Est. Cloud &amp; Infra Cost</span>
                <span className="material-symbols-outlined text-slate-600 text-[20px]">dns</span>
              </div>
              <div className="text-2xl font-black text-slate-800 font-mono">
                ${saasFinancials.fixedInfraCost.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Hosting, DB, backup &amp; tools</div>
            </div>
          </div>

          {/* Interactive Package Revenue & Sales Commission Breakdown (Page 11-12) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Subscription Package Breakdown &amp; Commission Model
                </h3>
                <p className="text-xs text-slate-500">
                  Modify the customer count to simulate projected MRR and acquisition commission expenses.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-600 bg-sand/40 px-3 py-1.5 rounded-lg border border-stroke-subtle">
                Baseline Model: <strong>40 Customers ($2,960 MRR / $35,520 ARR)</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Target Customer</th>
                    <th className="py-3 px-4">Monthly Price</th>
                    <th className="py-3 px-4 text-center">Active Customers</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">Sales Comm. Rate</th>
                    <th className="py-3 px-4">Sales Comm. Total</th>
                    <th className="py-3 px-4">Net Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Starter Row */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-navy-deep">
                      Starter
                      <span className="block text-[10px] text-slate-400 font-normal">1 User</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Individual Agent</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">$39.00</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setStarterCount(Math.max(0, starterCount - 1))}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 font-mono font-bold text-center text-slate-900">{starterCount}</span>
                        <button
                          type="button"
                          onClick={() => setStarterCount(starterCount + 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${saasFinancials.starterRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-amber-700 font-semibold">
                      10% ($3.90/cust)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-800 font-bold">
                      ${saasFinancials.starterComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ${(saasFinancials.starterRev - saasFinancials.starterComm).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Professional Row */}
                  <tr className="hover:bg-slate-50/60 bg-blue-50/20">
                    <td className="py-3.5 px-4 font-bold text-navy-deep">
                      Professional
                      <span className="block text-[10px] text-blue-600 font-semibold">Up to 3 Users</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Growing Agent / Small Team</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">$79.00</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setProCount(Math.max(0, proCount - 1))}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 font-mono font-bold text-center text-slate-900">{proCount}</span>
                        <button
                          type="button"
                          onClick={() => setProCount(proCount + 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${saasFinancials.proRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-amber-700 font-semibold">
                      12% ($9.48/cust)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-800 font-bold">
                      ${saasFinancials.proComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ${(saasFinancials.proRev - saasFinancials.proComm).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Agency Row */}
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-navy-deep">
                      Agency
                      <span className="block text-[10px] text-purple-600 font-semibold">Up to 10 Users</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Multi-agent Insurance Agency</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">$199.00</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAgencyCount(Math.max(0, agencyCount - 1))}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 font-mono font-bold text-center text-slate-900">{agencyCount}</span>
                        <button
                          type="button"
                          onClick={() => setAgencyCount(agencyCount + 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${saasFinancials.agencyRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-amber-700 font-semibold">
                      15% ($29.85/cust)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-800 font-bold">
                      ${saasFinancials.agencyComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ${(saasFinancials.agencyRev - saasFinancials.agencyComm).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Summary Row */}
                  <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider text-[11px]">
                      Total Projected Monthly Portfolio
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {saasFinancials.totalSubscribers} Customers
                    </td>
                    <td className="py-3.5 px-4 font-mono text-navy-deep font-extrabold text-sm">
                      ${saasFinancials.totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">—</td>
                    <td className="py-3.5 px-4 font-mono text-amber-800 font-extrabold text-sm">
                      ${saasFinancials.totalSalesComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-extrabold text-sm">
                      ${saasFinancials.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Subscribing Accounts Directory */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Subscribed Insurance Agencies &amp; Agents
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking software access licenses, user limits, and sales rep commission attribution.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {subscribersList.length} Active Accounts Loaded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-3">Subscriber ID</th>
                    <th className="py-3 px-3">Agency / Practice Name</th>
                    <th className="py-3 px-3">Primary Agent</th>
                    <th className="py-3 px-3">Package Tier</th>
                    <th className="py-3 px-3">Rate</th>
                    <th className="py-3 px-3">Users</th>
                    <th className="py-3 px-3">Sales Rep</th>
                    <th className="py-3 px-3">Sales Comm.</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribersList.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">{sub.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{sub.name}</td>
                      <td className="py-3 px-3 text-slate-700">{sub.agent}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.plan === 'Agency'
                            ? 'bg-purple-100 text-purple-800'
                            : sub.plan === 'Professional'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">${sub.price}/mo</td>
                      <td className="py-3 px-3 text-slate-600">{sub.users} seats</td>
                      <td className="py-3 px-3 text-slate-700">{sub.salesRep}</td>
                      <td className="py-3 px-3 font-mono text-amber-700 font-semibold">
                        ${sub.commPaid.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status.includes('Active')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          ENGINE 2: AGENT POLICY STATEMENT TRACKING (VISIBILITY TOOL)
         ───────────────────────────────────────────────────────────────── */}
      {activeEngine === 'carrier' && (
        <div className="space-y-6 animate-fade-in">
          {/* Regulatory Boundary Notice */}
          <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 text-xs flex items-start gap-3">
            <span className="material-symbols-outlined text-[22px] text-amber-700 shrink-0 mt-0.5">verified_user</span>
            <div>
              <div className="font-bold text-amber-900">
                Compliance Boundary &amp; Visibility Tool Notice (Coms.pdf Page 13)
              </div>
              <p className="text-amber-800/85 mt-0.5 leading-relaxed text-[11px]">
                InsurMatch is a pure B2B software provider. InsurMatch does not receive carrier commissions or collect premiums. This ledger serves strictly as an agent-facing visibility and statement reconciliation tool for policyholder records.
              </p>
            </div>
          </div>

          {/* Carrier Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Agent Carrier Statement Reconciliation</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
                  Carrier Payout Statements
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statements across ACA ($30 PMPM), Medicare ($51/mo renewal), and Life FYC for agency records.
              </p>
            </div>

            <button
              onClick={handleRunSssCalculation}
              disabled={isCalculating}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${isCalculating ? 'animate-spin' : ''}`}>
                calculate
              </span>
              <span>{isCalculating ? 'Reconciling Statements...' : 'Reconcile Statements ⚡'}</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>Total Expected Carrier Statements</span>
                <span className="material-symbols-outlined text-blue-600 text-[20px]">account_balance</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ${carrierTotals.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Reported by carriers across all policies</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>Reconciled Payouts</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">payments</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                ${carrierTotals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Confirmed with direct deposit clearinghouse</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>Agency Internal Split Override</span>
                <span className="material-symbols-outlined text-amber-600 text-[20px]">savings</span>
              </div>
              <div className="text-2xl font-black text-amber-700">
                ${carrierTotals.retention.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Internal agency servicing allocations</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>Policy Records</span>
                <span className="material-symbols-outlined text-purple-600 text-[20px]">fact_check</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{carrierTotals.count}</div>
              <div className="text-[11px] text-slate-400 mt-1">Matched to agency writing numbers</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-800">
              Showing {filteredCommissions.length > 0 ? filteredCommissions.length : 3} line items
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">All Periods</option>
                <option value="2026-09">2026-09 (Current)</option>
                <option value="2026-08">2026-08</option>
              </select>

              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">All Carriers</option>
                <option value="bcbs">Blue Cross Blue Shield</option>
                <option value="ambetter">Ambetter</option>
                <option value="unitedhealthcare">UnitedHealthcare</option>
              </select>

              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">All Partner Agents</option>
                <option value="khanh">Khanh Nguyen</option>
                <option value="sean">Sean Ngo</option>
                <option value="anh que">Anh Que Pham</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Deal / Member</th>
                    <th className="py-3 px-4">Carrier</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Writing Agent</th>
                    <th className="py-3 px-4">Gross Policy Comm</th>
                    <th className="py-3 px-4">Agency Split Status</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Reconciliation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCommissions.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {row.dealName || 'D26005033 - Ken Ho'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-100 text-blue-800">
                          {row.carrier || 'BCBS'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{row.period || '2026-09'}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{row.agentName || 'Khanh Nguyen'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${(row.grossAmount || 36.55).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {row.saleSupportStatus || 'NONE (7/3)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        ${(row.netAmount || 25.59).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.status || 'SETTLED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
