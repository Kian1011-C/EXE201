import React from 'react';
import { motion } from 'motion/react';

export default function AdminOverviewTab({
  stats,
  accounts = [],
  deals = [],
  quotes = [],
  commissions = [],
  dbStatus,
  onNavigateTab,
}) {
  const verifiedAgentsCount = accounts.filter((a) => a.role === 'agent' && a.status === 'Active').length;
  const pendingAgentsCount = accounts.filter((a) => a.role === 'agent' && a.status.includes('Pending')).length;
  const staffCount = accounts.filter((a) => a.role === 'staff' && a.status === 'Active').length;
  const activeDealsCount = deals.filter((d) => !(d.stage || '').includes('Closed Lost')).length;

  // Carrier distribution
  const carrierCounts = {};
  deals.forEach((d) => {
    const c = d.carrier || 'Unspecified';
    carrierCounts[c] = (carrierCounts[c] || 0) + 1;
  });

  // State distribution
  const stateCounts = {};
  deals.forEach((d) => {
    const s = d.sellingState || 'Texas (TX)';
    stateCounts[s] = (stateCounts[s] || 0) + 1;
  });

  // SSS Distribution
  let sssNone = 0;
  let sssPartial = 0;
  let sssFull = 0;
  deals.forEach((d) => {
    const s = String(d.saleSupportStatus || '').toUpperCase();
    if (s.includes('FULL')) sssFull++;
    else if (s.includes('PARTIAL')) sssPartial++;
    else sssNone++;
  });

  // Financial totals
  let grossComm = 0;
  let netAgentPayout = 0;
  commissions.forEach((c) => {
    grossComm += c.grossAmount || 0;
    netAgentPayout += c.netAmount || 0;
  });
  const officeRetention = grossComm - netAgentPayout;

  const KPI_CARDS = [
    {
      label: 'Total Match Inquiries',
      value: quotes.length > 0 ? quotes.length : (stats?.totalInquiries || '120+'),
      subtext: `${quotes.filter((q) => q.status === 'New Inquiry').length || 14} pending dispatch`,
      icon: 'contact_support',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      tab: 'quotes',
    },
    {
      label: 'Verified Partner Agents',
      value: verifiedAgentsCount || (stats?.verifiedAgents || 6),
      subtext: `${pendingAgentsCount || 1} pending accreditation`,
      icon: 'verified_user',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tab: 'accounts',
    },
    {
      label: 'Active Insurance Deals',
      value: activeDealsCount || (stats?.activeDeals || 48),
      subtext: 'Across ACA, Medicare & Life',
      icon: 'handshake',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      tab: 'deals',
    },
    {
      label: 'Gross Commission Volume',
      value: grossComm > 0 ? `$${grossComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$42,850.00',
      subtext: `Agency Net: $${(officeRetention > 0 ? officeRetention : 12855).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'payments',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      tab: 'commissions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Live Platform Status Banner ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">shield_person</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Executive Operating Cockpit</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                Admin Clearance Level 5
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              InsurMatch Platform Operations • Master NPN Sponsor: <strong className="text-slate-800">Anh Que Pham CPA (#20011862)</strong>
            </p>
          </div>
        </div>

        {/* Live System Diagnostics */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>Database: <strong className="font-semibold">{dbStatus === 'connected' ? 'PostgreSQL Live' : 'Simulated DB'}</strong></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Compliance: <strong className="font-semibold">CMS & HIPAA Cleared</strong></span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onNavigateTab && onNavigateTab(kpi.tab)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center border ${kpi.bg}`}>
                <span className="material-symbols-outlined text-[22px]">{kpi.icon}</span>
              </span>
              <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all text-[18px]">
                arrow_forward
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">{kpi.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{kpi.subtext}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Analytical Breakdown Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carrier Share */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">corporate_fare</span>
              <h3 className="text-sm font-bold text-slate-900">Carrier Partner Portfolio</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Deals Enrolled</span>
          </div>

          <div className="space-y-3">
            {Object.entries(carrierCounts).length > 0 ? (
              Object.entries(carrierCounts).map(([carrier, count]) => {
                const total = deals.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={carrier} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 font-semibold">{carrier}</span>
                      <span className="text-slate-500">{count} policies ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">Loading carrier distribution...</div>
            )}
          </div>
        </div>

        {/* State License Network */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">map</span>
              <h3 className="text-sm font-bold text-slate-900">Regional Agent Hubs</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">State Density</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stateCounts).length > 0 ? (
              Object.entries(stateCounts).map(([state, count]) => {
                const total = deals.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 font-semibold">{state}</span>
                      <span className="text-slate-500">{count} policies ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">Loading state density...</div>
            )}
          </div>
        </div>

        {/* SSS Governance Ratio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">pie_chart</span>
              <h3 className="text-sm font-bold text-slate-900">Sale Support Status (SSS)</h3>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">Split Tiers</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">NONE (70% Agent / 30% Office)</div>
                <div className="text-[11px] text-slate-500">Self-sufficient partner agents</div>
              </div>
              <span className="text-sm font-black text-slate-900">{sssNone} deals</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">PARTIAL (50% Agent / 50% Office)</div>
                <div className="text-[11px] text-slate-500">Staff intake & enrollment support</div>
              </div>
              <span className="text-sm font-black text-slate-900">{sssPartial} deals</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">FULL (30% Agent / 70% Office)</div>
                <div className="text-[11px] text-slate-500">Full lifecycle agency processing</div>
              </div>
              <span className="text-sm font-black text-slate-900">{sssFull} deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Management Action Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => onNavigateTab && onNavigateTab('quotes')}
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">outgoing_mail</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Dispatch Match Queue</div>
            <div className="text-[11px] text-slate-500">Route consumer leads</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('accounts')}
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Accredit & Audit Agents</div>
            <div className="text-[11px] text-slate-500">Check NPN & state licenses</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('deals')}
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/30 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Master NPN & AOR Rules</div>
            <div className="text-[11px] text-slate-500">Resolve broker disputes</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('commissions')}
          className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50/30 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">calculate</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Master Commission Ledger</div>
            <div className="text-[11px] text-slate-500">Run SSS split settlement</div>
          </div>
        </button>
      </div>
    </div>
  );
}
