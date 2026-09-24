import React, { useState, useEffect, useMemo } from 'react';
import { getDashboardStats, getTickets } from '../../../services/api';

export default function StaffCrmDashboard({
  onSelectTab,
  onSelectDeal,
  onSelectContact,
  onSelectTicket,
  onSelectTask,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [liveTickets, setLiveTickets] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(
    'Daily work of support - Team Tiger Truong'
  );

  async function fetchStats() {
    try {
      const [res, tix] = await Promise.all([
        getDashboardStats().catch(() => null),
        getTickets().catch(() => []),
      ]);
      if (res) setDbStats(res);
      if (Array.isArray(tix) && tix.length > 0) setLiveTickets(tix);
    } catch (err) {
      console.warn('[StaffCrmDashboard] Could not fetch live dashboard stats:', err);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchStats().finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  }

  // Color constants matching real CRM
  const C_ANYA = '#5271ff'; // Blue
  const C_SEAN = '#84cc16'; // Lime Green
  const C_IVY = '#f97316';  // Orange
  const C_SARAH = '#38bdf8'; // Sky Blue
  const C_PURPLE = '#a855f7';
  const C_RED = '#ef4444';

  const uploadTicketsDisplay = useMemo(() => {
    const docTix = liveTickets.filter(
      (t) =>
        t.pipeline === 'COLLECT_DOCUMENT' ||
        t.title?.toLowerCase().includes('document') ||
        t.title?.toLowerCase().includes('upload')
    );
    if (docTix.length > 0) {
      return docTix.slice(0, 7).map((t, idx) => ({
        no: idx + 1,
        ticketId: t.title || `Collect Document #${t.id?.slice(-4)}`,
        due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '09/22/2026',
        owner: t.contact?.fullName || t.owner || 'Jay Ly',
        stage: t.status === 'WAITING_ON_CLIENT' ? 'Waiting on contact' : (t.status || 'Waiting on verification'),
        agent: t.assignedTo || 'Sean Ngo',
        rawTicket: t,
        contact: t.contact,
      }));
    }
    return [
      { no: 1, ticketId: 'Collect Documents for Upload (ACA)', due: '09/22/2026', owner: 'Jay Ly', stage: 'Waiting on verification', agent: 'Ivy Le' },
      { no: 2, ticketId: 'Collect Documents for Upload (SSN)', due: '09/06/2026', owner: 'Khanh Nguyen', stage: 'Waiting on contact', agent: 'Sarah Thai' },
      { no: 3, ticketId: 'Collect Documents for Upload (Income)', due: '09/21/2026', owner: 'Tri Tran', stage: 'Waiting on contact', agent: 'Sean Ngo' },
      { no: 4, ticketId: 'Collect Documents for Upload (Citizenship)', due: '08/10/2026', owner: 'Tri Tran', stage: 'Waiting on verification', agent: 'Sean Ngo' },
      { no: 5, ticketId: 'Collect Documents for Upload (Tax Return)', due: '06/24/2026', owner: 'Tri Tran', stage: 'Waiting on contact', agent: 'Sean Ngo' },
      { no: 6, ticketId: 'Collect Documents for Upload (ID Card)', due: '08/06/2026', owner: 'Quyen Le', stage: 'Waiting on contact', agent: 'Sean Ngo' },
      { no: 7, ticketId: 'Collect Documents for Upload (Proof of Address)', due: '09/21/2026', owner: 'Quyen Le', stage: 'Waiting on verification', agent: 'Sean Ngo' },
    ];
  }, [liveTickets]);

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-y-auto">
      {/* ── Top Dashboard Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#104882] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">grid_view</span>
          </div>
          <div className="relative">
            <div className="flex items-center gap-1.5 cursor-pointer group">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {selectedDashboard}
              </h1>
              <span className="material-symbols-outlined text-[20px] text-slate-600 group-hover:text-blue-600">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer shadow-2xs"
          >
            <span
              className={`material-symbols-outlined text-[16px] text-slate-600 ${
                refreshing ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition cursor-pointer shadow-2xs"
            title="Fullscreen"
          >
            <span className="material-symbols-outlined text-[18px]">crop_free</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter by:</span>
          <button
            type="button"
            className="flex items-center gap-1 text-[#104882] hover:underline font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>Advanced filters</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span className="material-symbols-outlined text-[16px] text-slate-400">bar_chart</span>
          <span>Total:</span>
          <span className="font-bold text-slate-800">27 reports</span>
        </div>
      </div>

      {/* ── Main Reports Container ───────────────────────────────────────── */}
      <div className="p-6 space-y-6 max-w-[1700px] mx-auto w-full">
        {/* ── Real-time PostgreSQL Live Operational Metrics Row ─────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Contacts */}
          <div
            onClick={() => onSelectTab && onSelectTab('contacts')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-blue-600 transition">Contacts</span>
              <span className="material-symbols-outlined text-[18px] text-blue-600">contacts</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStats?.totalContacts ?? 10}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>100% Active DB</span>
            </div>
          </div>

          {/* Card 2: Active Pipeline Deals */}
          <div
            onClick={() => onSelectTab && onSelectTab('deals')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-indigo-600 transition">Active Deals</span>
              <span className="material-symbols-outlined text-[18px] text-indigo-600">handshake</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStats?.activeDeals ?? 10}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              {dbStats?.dealsByPipeline?.[0]?.count ? `${dbStats.dealsByPipeline[0].pipeline} (${dbStats.dealsByPipeline[0].count})` : 'Obamacare & Medicare'}
            </div>
          </div>

          {/* Card 3: Open Service Tickets */}
          <div
            onClick={() => onSelectTab && onSelectTab('tickets')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-cyan-600 transition">Open Tickets</span>
              <span className="material-symbols-outlined text-[18px] text-cyan-600">confirmation_number</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStats?.openTickets ?? 29}
            </div>
            <div className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>5 Pipelines Live</span>
            </div>
          </div>

          {/* Card 4: Overdue Action Items */}
          <div
            onClick={() => onSelectTab && onSelectTab('tickets')}
            className="bg-white p-3.5 rounded-xl border border-rose-200 hover:border-rose-400 hover:shadow-sm transition cursor-pointer group bg-rose-50/20"
          >
            <div className="flex items-center justify-between text-rose-700 text-xs mb-1">
              <span className="font-semibold group-hover:underline">Overdue Queue</span>
              <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
            </div>
            <div className="text-2xl font-black text-rose-700">
              {dbStats?.overdueTickets ?? 0}
            </div>
            <div className="text-[10px] text-rose-600 font-medium mt-1">
              Needs Immediate SLA
            </div>
          </div>

          {/* Card 5: Pending Tasks */}
          <div
            onClick={() => onSelectTab && onSelectTab('tasks')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold group-hover:text-purple-600 transition">Agent Tasks</span>
              <span className="material-symbols-outlined text-[18px] text-purple-600">checklist</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStats?.pendingTasks ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              3 Biz-Day SLA Rule
            </div>
          </div>

          {/* Card 6: Monthly Commission Revenue */}
          <div
            onClick={() => onSelectTab && onSelectTab('commission')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition cursor-pointer group bg-emerald-50/20"
          >
            <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
              <span className="font-semibold group-hover:text-emerald-700 transition">Mth Revenue</span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">payments</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              ${(dbStats?.commissionThisMonth || 36).toFixed(0)}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1 font-mono">
              YTD: ${(dbStats?.commissionYTD || 136).toFixed(0)} Net
            </div>
          </div>
        </div>

        {/* ── ROW 1: 2 Main Deal Charts (50% / 50%) ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Total Obamacare deals 2026 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  article
                </span>
                <h3
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                  title="Click to view in Deals List"
                >
                  Total Obamacare deals 2026
                </h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Deals List"
                >
                  <span className="material-symbols-outlined text-[16px]">crop_free</span>
                </button>
                <button type="button" className="hover:text-slate-600 p-0.5">
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Horizontal Bar Chart for OB Deals */}
            <div className="flex-grow flex flex-col justify-center space-y-1.5 text-[11px] pt-1">
              {[
                { stage: 'Enrolled - Active (Obamacare 2026)', count: 759, segments: [300, 220, 150, 89] },
                { stage: 'Termination (Obamacare 2026)', count: 228, segments: [100, 80, 48] },
                { stage: 'Deal Lost (Obamacare 2026)', count: 81, segments: [40, 30, 11] },
                { stage: 'Non-Commission - Active (Obamacare 2026)', count: 19, segments: [19] },
                { stage: 'Deal Lost - Second Change (Obamacare 2026)', count: 14, segments: [14] },
                { stage: 'Enrolled - 1st Payment done (Obamacare 2026)', count: 9, segments: [9] },
                { stage: 'Termination - Second Change (Obamacare 2026)', count: 8, segments: [8] },
                { stage: 'Enrolled - Need 1st Payment (Obamacare 2026)', count: 5, segments: [5] },
                { stage: 'Need Telesale Review (Obamacare 2026)', count: 3, segments: [3] },
                { stage: 'New Opportunity/Call to Renew (Obamacare 2026)', count: 2, segments: [2] },
                { stage: 'Do not contact (Obamacare 2026)', count: 1, segments: [1] },
                { stage: 'Quoted - Need Client Confirm (Obamacare 2026)', count: 1, segments: [1] },
                { stage: 'Ready to Enroll (Obamacare 2026)', count: 1, segments: [1] },
                { stage: 'Waiting for document (Obamacare 2026)', count: 1, segments: [1] },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 -mx-1 rounded cursor-pointer transition group"
                  title={`Click to view all ${item.stage} deals`}
                >
                  <div className="w-56 truncate text-right text-slate-600 font-medium shrink-0 group-hover:text-blue-700 transition" title={item.stage}>
                    {item.stage}
                  </div>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3.5 flex overflow-hidden max-w-sm group-hover:ring-1 group-hover:ring-blue-300">
                    {item.segments.map((seg, sIdx) => {
                      const widthPercent = (seg / 800) * 100;
                      const colors = [C_ANYA, C_SEAN, C_IVY, C_SARAH];
                      return (
                        <div
                          key={sIdx}
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: colors[sIdx % colors.length],
                          }}
                          className="h-full"
                          title={`${seg}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-700 w-8">{item.count}</span>
                </div>
              ))}
              <div className="flex items-center justify-end text-[9px] text-slate-400 gap-12 pr-10 pt-1">
                <span>0</span>
                <span>200</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
              </div>
              <div className="text-center text-[10px] text-slate-500 font-semibold mt-0.5">
                (Count Distinct) Deal (Id) • Click any stage to open Deals
              </div>
            </div>
          </div>

          {/* Card 2: Total Medicare deals 2026 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  article
                </span>
                <h3
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                  title="Click to view in Deals List"
                >
                  Total Medicare deals 2026
                </h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Deals List"
                >
                  <span className="material-symbols-outlined text-[16px]">crop_free</span>
                </button>
                <button type="button" className="hover:text-slate-600 p-0.5">
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Distinct Count Highlight Card */}
            <div
              onClick={() => onSelectTab && onSelectTab('deals')}
              className="max-w-[200px] mx-auto my-2 p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs hover:border-blue-400 cursor-pointer transition group"
              title="Click to view all Medicare deals"
            >
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider group-hover:text-blue-600">
                DEAL (ID)
              </div>
              <div className="text-[10px] text-slate-400">(Count Distinct)</div>
              <div className="text-3xl font-extrabold text-[#00B4D8] mt-1">103</div>
            </div>

            {/* Agent Legend */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 my-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: C_ANYA }} />
                <span>Anya Nguyen</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: C_SEAN }} />
                <span>Sean Ngo</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: C_IVY }} />
                <span>Ivy Le</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: C_SARAH }} />
                <span>Sarah Thai</span>
              </div>
            </div>

            {/* Horizontal Bar Chart for Medicare Deals */}
            <div className="flex-grow flex flex-col justify-center space-y-1.5 text-[11px] pt-1">
              {[
                { stage: 'Enrolled - HRA Done - Active (Medicare 2026)', count: 37, segments: [18, 12, 7] },
                { stage: 'Auto Renew - Active (Medicare 2026)', count: 25, segments: [12, 8, 5] },
                { stage: 'Enrolled - Active (Medicare 2026)', count: 12, segments: [6, 4, 2] },
                { stage: 'Deal Lost (Medicare 2026)', count: 9, segments: [5, 4] },
                { stage: 'Do Not Contact (Medicare 2026)', count: 3, segments: [3] },
                { stage: 'Deal Lost - Second Change (Medicare 2026)', count: 1, segments: [1] },
                { stage: 'Enrolled - HRA Done (Medicare 2026)', count: 1, segments: [1] },
                { stage: 'Enrolled (Medicare 2026)', count: 1, segments: [1] },
                { stage: 'Need Telesale Review (Medicare 2026)', count: 1, segments: [1] },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 -mx-1 rounded cursor-pointer transition group"
                  title={`Click to view all ${item.stage} deals`}
                >
                  <div className="w-60 truncate text-right text-slate-600 font-medium shrink-0 group-hover:text-blue-700 transition" title={item.stage}>
                    {item.stage}
                  </div>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3.5 flex overflow-hidden max-w-xs group-hover:ring-1 group-hover:ring-blue-300">
                    {item.segments.map((seg, sIdx) => {
                      const widthPercent = (seg / 40) * 100;
                      const colors = [C_ANYA, C_SEAN, C_IVY, C_SARAH];
                      return (
                        <div
                          key={sIdx}
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: colors[sIdx % colors.length],
                          }}
                          className="h-full"
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-700 w-6">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 2: 3 Medium Charts (33% / 33% / 33%) ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 3: Total Active OB 2026 - Support Agent */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Total Active OB 2026 - Suppo...
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-[15px]">crop_free</span>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs bg-[#5271ff]" />
                <span className="truncate">Enrolled - Active (Obamacare 2026)</span>
              </div>
              <span className="font-mono">1/4 ▶</span>
            </div>
            <div className="space-y-3 my-auto py-2">
              {[
                { agent: 'Anya Nguyen', count: 305 },
                { agent: 'Sean Ngo', count: 232 },
                { agent: 'Ivy Le', count: 171 },
                { agent: 'Sarah Thai', count: 84 },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view deals handled by ${item.agent}`}
                >
                  <span className="w-20 truncate text-slate-600 text-right group-hover:text-blue-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3 overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                    <div
                      style={{ width: `${(item.count / 350) * 100}%` }}
                      className="bg-[#5271ff] h-full"
                    />
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[11px] group-hover:text-blue-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Total Medicare deals 2026 - Support Agent */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                title="Click to view Medicare deals"
              >
                Total Medicare deals 2026 -...
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-[15px]">crop_free</span>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs bg-amber-400" />
                <span>Enrolled (Medicare 2026)</span>
              </div>
              <span className="font-mono">1/6 ▶</span>
            </div>
            <div className="space-y-3 my-auto py-2">
              {[
                { agent: 'Ivy Le', count: 34, segments: [20, 14] },
                { agent: 'Sean Ngo', count: 21, segments: [12, 9] },
                { agent: 'Anya Nguyen', count: 21, segments: [11, 10] },
                { agent: 'Sarah Thai', count: 1, segments: [1] },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 text-xs hover:bg-amber-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view Medicare deals handled by ${item.agent}`}
                >
                  <span className="w-20 truncate text-slate-600 text-right group-hover:text-amber-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3 flex overflow-hidden group-hover:ring-1 group-hover:ring-amber-300">
                    <div
                      style={{ width: `${(item.count / 35) * 60}%` }}
                      className="bg-amber-400 h-full"
                    />
                    <div
                      style={{ width: `${(item.count / 35) * 40}%` }}
                      className="bg-rose-500 h-full"
                    />
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[11px] group-hover:text-amber-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Total Contact Count */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('contacts')}
                className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                title="Click to view all Contacts"
              >
                Total Contact Count
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('contacts')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Contacts List"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <button type="button" className="hover:text-slate-600 p-0.5">
                  <span className="material-symbols-outlined text-[15px]">more_horiz</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs bg-[#5271ff]" />
                <span>Inactive</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs bg-[#84cc16]" />
                <span>Active</span>
              </div>
            </div>
            <div className="space-y-3 my-auto py-2">
              {[
                { agent: 'Anya Nguyen', active: 302, inactive: 150, total: 452 },
                { agent: 'Sean Ngo', active: 246, inactive: 160, total: 406 },
                { agent: 'Ivy Le', active: 187, inactive: 60, total: 247 },
                { agent: 'Sarah Thai', active: 65, inactive: 8, total: 73 },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('contacts')}
                  className="flex items-center gap-2 text-xs hover:bg-slate-100/80 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view contacts owned by ${item.agent}`}
                >
                  <span className="w-20 truncate text-slate-600 text-right group-hover:text-blue-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3 flex overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                    <div
                      style={{ width: `${(item.inactive / 500) * 100}%` }}
                      className="bg-[#5271ff] h-full"
                    />
                    <div
                      style={{ width: `${(item.active / 500) * 100}%` }}
                      className="bg-[#84cc16] h-full"
                    />
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[11px] group-hover:text-blue-700">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3: Deals by Agent Vertical Column Chart (Image 2) ────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">bar_chart</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view Deals"
              >
                Deals by Agent (Not count Lost&amp;Terminated)
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="hover:text-blue-600 p-0.5 cursor-pointer"
                title="View Deals List"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
              <span className="material-symbols-outlined text-[16px]">more_horiz</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2.5 rounded-xs bg-[#5271ff]" />
              <span>Obamacare 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2.5 rounded-xs bg-[#84cc16]" />
              <span>Medicare 2026</span>
            </div>
          </div>

          {/* Vertical Columns */}
          <div className="h-64 flex items-end justify-between gap-4 px-6 pt-4 border-b border-slate-200">
            {[
              { name: 'Khanh Nguyen ( Tu Nguyen)', ob: 380, med: 26, total: 406 },
              { name: 'Jay Ly (Tri chau)', ob: 165, med: 22, total: 187 },
              { name: 'Quyen Le', ob: 130, med: 18, total: 148 },
              { name: 'Tri Tran', ob: 120, med: 2, total: 122 },
              { name: 'Tan hao Hua (CA)', ob: 20, med: 4, total: 24 },
              { name: 'Thi Thuy Nguyen (TX)', ob: 13, med: 0, total: 13 },
              { name: 'Long Nguyen', ob: 4, med: 0, total: 4 },
              { name: 'Loan T Bui (MS)', ob: 2, med: 0, total: 2 },
            ].map((d, i) => {
              const maxHeight = 210;
              const totalHeight = (d.total / 450) * maxHeight;
              const obHeight = (d.ob / (d.total || 1)) * totalHeight;
              const medHeight = (d.med / (d.total || 1)) * totalHeight;

              return (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex-1 flex flex-col items-center gap-1 group cursor-pointer hover:scale-105 transition-transform"
                  title={`Click to filter deals by ${d.name} (${d.total} deals)`}
                >
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600">{d.total}</span>
                  <div
                    style={{ height: `${totalHeight}px` }}
                    className="w-7 rounded-t-sm flex flex-col justify-end overflow-hidden shadow-2xs group-hover:ring-2 group-hover:ring-blue-400 transition"
                  >
                    <div style={{ height: `${medHeight}px` }} className="bg-[#84cc16] w-full" />
                    <div style={{ height: `${obHeight}px` }} className="bg-[#5271ff] w-full" />
                  </div>
                  <div className="w-20 text-[10px] text-slate-600 text-center truncate rotate-45 origin-top-left mt-3 font-medium group-hover:text-blue-700">
                    {d.name}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-[10px] text-slate-500 font-semibold mt-12">
            Deal Owner • Click any agent column to view deals
          </div>
        </div>

        {/* ── ROW 4: All Open Tasks & Overdue Tasks (Image 2) ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view all Tasks"
              >
                All Open Tasks Report
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('tasks')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Tasks List"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mb-3">
              <span className="w-3 h-2 rounded-xs bg-[#5271ff]" />
              <span>(Count Distinct) TaskId</span>
            </div>
            <div className="space-y-4 my-auto py-2">
              <div
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="flex items-center gap-3 text-xs hover:bg-blue-50/70 p-1 rounded cursor-pointer transition group"
                title="Click to view Anya's tasks"
              >
                <span className="w-24 text-right text-slate-600 group-hover:text-blue-700">Anya Nguyen</span>
                <div className="flex-grow bg-slate-100 h-3.5 rounded-sm max-w-xs overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                  <div className="bg-[#5271ff] h-full w-full" />
                </div>
                <span className="font-bold text-slate-800 text-xs group-hover:text-blue-700">2</span>
              </div>
              <div
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="flex items-center gap-3 text-xs hover:bg-blue-50/70 p-1 rounded cursor-pointer transition group"
                title="Click to view Ivy's tasks"
              >
                <span className="w-24 text-right text-slate-600 group-hover:text-blue-700">Ivy Le</span>
                <div className="flex-grow bg-slate-100 h-3.5 rounded-sm max-w-xs overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                  <div className="bg-[#5271ff] h-full w-1/2" />
                </div>
                <span className="font-bold text-slate-800 text-xs group-hover:text-blue-700">1</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="text-xs font-bold text-slate-900 hover:text-rose-600 cursor-pointer"
                title="Click to view overdue Tasks"
              >
                Overdue Tasks Report
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('tasks')}
                  className="hover:text-rose-600 p-0.5 cursor-pointer"
                  title="View Tasks List"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mb-3">
              <span className="w-3 h-2 rounded-xs bg-[#5271ff]" />
              <span>(Count Distinct) TaskId</span>
            </div>
            <div className="space-y-4 my-auto py-2">
              <div
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="flex items-center gap-3 text-xs hover:bg-rose-50/70 p-1 rounded cursor-pointer transition group"
                title="Click to view Anya's overdue tasks"
              >
                <span className="w-24 text-right text-slate-600 group-hover:text-rose-700">Anya Nguyen</span>
                <div className="flex-grow bg-slate-100 h-3.5 rounded-sm max-w-xs overflow-hidden group-hover:ring-1 group-hover:ring-rose-300">
                  <div className="bg-[#5271ff] h-full w-full" />
                </div>
                <span className="font-bold text-rose-700 text-xs">1</span>
              </div>
              <div
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="flex items-center gap-3 text-xs hover:bg-rose-50/70 p-1 rounded cursor-pointer transition group"
                title="Click to view Ivy's overdue tasks"
              >
                <span className="w-24 text-right text-slate-600 group-hover:text-rose-700">Ivy Le</span>
                <div className="flex-grow bg-slate-100 h-3.5 rounded-sm max-w-xs overflow-hidden group-hover:ring-1 group-hover:ring-rose-300">
                  <div className="bg-[#5271ff] h-full w-full" />
                </div>
                <span className="font-bold text-rose-700 text-xs">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 5: All Tickets Overdue Details Pivot Table (Image 3) ─────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view all overdue tickets"
              >
                All Tickets Overdue Details
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="hover:text-blue-600 p-0.5 cursor-pointer"
                title="View in Tickets module"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
              <span className="material-symbols-outlined text-[16px]">more_horiz</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5 border-r border-slate-200">Service Agent</th>
                  <th className="p-2.5 border-r border-slate-200">Stage</th>
                  <th className="p-2.5 border-r border-slate-200 text-center">Client Support Pipeline</th>
                  <th className="p-2.5 border-r border-slate-200 text-center">Payment</th>
                  <th className="p-2.5 border-r border-slate-200 text-center">ACA account</th>
                  <th className="p-2.5 border-r border-slate-200 text-center">Upload document</th>
                  <th className="p-2.5 border-r border-slate-200 text-center">Choose Doctor</th>
                  <th className="p-2.5 text-center font-bold bg-slate-100">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="hover:bg-blue-50/70 transition cursor-pointer group"
                  title="Click to view ACA Account overdue tickets"
                >
                  <td rowSpan={4} className="p-2.5 font-bold text-slate-900 border-r border-slate-200 bg-white align-top">
                    Anya Nguyen
                  </td>
                  <td className="p-2 border-r border-slate-200 group-hover:text-blue-700 font-medium">Uploaded - Waiting for Verification</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold text-blue-600 border-r border-slate-200 bg-blue-50/40">1</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold bg-slate-50 group-hover:text-blue-700">1</td>
                </tr>
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="hover:bg-blue-50/70 transition cursor-pointer group"
                  title="Click to view Payment overdue tickets"
                >
                  <td className="p-2 border-r border-slate-200 group-hover:text-blue-700 font-medium">Check payment (Payment)</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold text-blue-600 border-r border-slate-200 bg-blue-50/40">1</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold bg-slate-50 group-hover:text-blue-700">1</td>
                </tr>
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="hover:bg-blue-50/70 transition cursor-pointer group"
                  title="Click to view Choose Doctor overdue tickets"
                >
                  <td className="p-2 border-r border-slate-200 group-hover:text-blue-700 font-medium">Need choose Doctor (Choose Doctor)</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold text-blue-600 border-r border-slate-200 bg-blue-50/40">7</td>
                  <td className="p-2 text-center font-bold bg-slate-50 group-hover:text-blue-700">7</td>
                </tr>
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="hover:bg-blue-50/70 transition cursor-pointer group"
                  title="Click to view Upload Document overdue tickets"
                >
                  <td className="p-2 border-r border-slate-200 group-hover:text-blue-700 font-medium">Waiting on contact (Upload document)</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold text-blue-600 border-r border-slate-200 bg-blue-50/40">2</td>
                  <td className="p-2 text-center border-r border-slate-200">0</td>
                  <td className="p-2 text-center font-bold bg-slate-50 group-hover:text-blue-700">2</td>
                </tr>
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200 hover:bg-blue-100/70 cursor-pointer transition"
                  title="Click to view all 43 overdue tickets"
                >
                  <td colSpan={2} className="p-2.5 text-right uppercase tracking-wide">TOTAL</td>
                  <td className="p-2 text-center text-blue-700">11</td>
                  <td className="p-2 text-center text-blue-700">9</td>
                  <td className="p-2 text-center text-blue-700">6</td>
                  <td className="p-2 text-center text-blue-700">6</td>
                  <td className="p-2 text-center text-blue-700">11</td>
                  <td className="p-2 text-center text-blue-900 bg-slate-200 text-xs">43</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ROW 6: All Open Tickets & All Overdue Tickets (Image 3) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view all Open Tickets"
              >
                All Open Tickets
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Tickets List"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-xs bg-[#5271ff]" />Client Support</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-xs bg-[#84cc16]" />Upload doc</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-xs bg-amber-500" />ACA account</span>
              </div>
              <span className="font-mono">1/2 ▶</span>
            </div>
            <div className="space-y-3 py-2 my-auto">
              {[
                { agent: 'Anya Nguyen', count: 68, segments: [10, 8, 42, 8] },
                { agent: 'Sean Ngo', count: 43, segments: [10, 8, 20, 5] },
                { agent: 'Ivy Le', count: 34, segments: [6, 4, 24] },
                { agent: 'Sarah Thai', count: 19, segments: [2, 12, 5] },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view open tickets for ${item.agent}`}
                >
                  <span className="w-20 text-right text-slate-600 truncate group-hover:text-blue-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                    <div style={{ width: `${(item.segments[0] / 70) * 100}%` }} className="bg-[#5271ff] h-full" />
                    <div style={{ width: `${(item.segments[1] / 70) * 100}%` }} className="bg-[#84cc16] h-full" />
                    <div style={{ width: `${(item.segments[2] / 70) * 100}%` }} className="bg-sky-400 h-full" />
                    <div style={{ width: `${((item.segments[3] || 0) / 70) * 100}%` }} className="bg-amber-400 h-full" />
                  </div>
                  <span className="w-6 font-bold text-slate-800 text-[11px] group-hover:text-blue-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 hover:text-rose-600 cursor-pointer"
                title="Click to view all Overdue Tickets"
              >
                All Overdue Tickets
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="hover:text-rose-600 p-0.5 cursor-pointer"
                  title="View Tickets List"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-xs bg-[#5271ff]" />Client Support</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-xs bg-[#84cc16]" />Upload doc</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-xs bg-amber-500" />ACA account</span>
              </div>
              <span className="font-mono">1/2 ▶</span>
            </div>
            <div className="space-y-3 py-2 my-auto">
              {[
                { agent: 'Sean Ngo', count: 20, segments: [4, 8, 8] },
                { agent: 'Anya Nguyen', count: 15, segments: [8, 3, 4] },
                { agent: 'Ivy Le', count: 4, segments: [4] },
                { agent: 'Sarah Thai', count: 3, segments: [3] },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="flex items-center gap-2 text-xs hover:bg-rose-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view overdue tickets for ${item.agent}`}
                >
                  <span className="w-20 text-right text-slate-600 truncate group-hover:text-rose-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden group-hover:ring-1 group-hover:ring-rose-300">
                    <div style={{ width: `${(item.segments[0] / 20) * 40}%` }} className="bg-[#5271ff] h-full" />
                    <div style={{ width: `${((item.segments[1] || 0) / 20) * 30}%` }} className="bg-[#84cc16] h-full" />
                    <div style={{ width: `${((item.segments[2] || 0) / 20) * 30}%` }} className="bg-amber-400 h-full" />
                  </div>
                  <span className="w-6 font-bold text-slate-800 text-[11px] group-hover:text-rose-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 7: Empty state + Need Update Member ID + Need Create Account */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 12: Need Extend Tickets */}
          <div
            onClick={() => onSelectTab && onSelectTab('tickets')}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col items-center justify-center min-h-[190px] cursor-pointer hover:border-blue-300 hover:shadow-xs transition group"
            title="Click to check tickets needing extension"
          >
            <div className="w-full flex items-center justify-between mb-auto pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Need Extend Tickets</h3>
              <span className="material-symbols-outlined text-[15px] text-slate-400">crop_free</span>
            </div>
            <div className="my-auto py-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">manage_search</span>
              </div>
              <div className="text-xs font-bold text-slate-800">No Data Here!</div>
              <div className="text-[11px] text-slate-400 mt-0.5">There is no data to show right now.</div>
            </div>
          </div>

          {/* Card 13: Need Update Member ID */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view Member ID update tickets"
              >
                Need Update Member ID
              </h3>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                title="View in Tickets"
              >
                <span className="material-symbols-outlined text-[15px]">crop_free</span>
              </button>
            </div>
            <div className="space-y-3 my-auto py-2">
              {[
                { agent: 'Anya Nguyen', count: 5, width: 'w-full' },
                { agent: 'Sean Ngo', count: 5, width: 'w-full' },
                { agent: 'Sarah Thai', count: 1, width: 'w-1/5' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view tickets for ${item.agent}`}
                >
                  <span className="w-20 text-right text-slate-600 truncate group-hover:text-blue-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 h-3 rounded-sm overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                    <div className={`bg-[#5271ff] h-full ${item.width}`} />
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 14: Need Create Member Account */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view Member Account tickets"
              >
                Need Create Member Account...
              </h3>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                title="View in Tickets"
              >
                <span className="material-symbols-outlined text-[15px]">crop_free</span>
              </button>
            </div>
            <div className="space-y-3 my-auto py-2">
              {[
                { agent: 'Kattie Nguyen', count: 20, width: 'w-full' },
                { agent: 'Attis Dang', count: 8, width: 'w-2/5' },
                { agent: 'Penny Van', count: 7, width: 'w-1/3' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view account creation tickets for ${item.agent}`}
                >
                  <span className="w-20 text-right text-slate-600 truncate group-hover:text-blue-700">{item.agent}</span>
                  <div className="flex-grow bg-slate-100 h-3 rounded-sm overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                    <div className={`bg-[#5271ff] h-full ${item.width}`} />
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 8: Open Upload Document Ticket Table (Image 4 & 5) ───────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view all upload document tickets"
              >
                Open Upload Document Ticket
              </h3>
              {liveTickets.length > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  Live DB
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="hover:text-blue-600 p-0.5 cursor-pointer"
                title="Open Tickets Module"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
              <button type="button" className="hover:text-slate-600 p-0.5">
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">No.</th>
                  <th className="px-3 py-2">TicketId</th>
                  <th className="px-3 py-2">Ticket Due Date</th>
                  <th className="px-3 py-2">Ticket Owner</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Service Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadTicketsDisplay.map((row) => (
                  <tr
                    key={row.no}
                    onClick={() => {
                      if (row.rawTicket && onSelectTicket) {
                        onSelectTicket(row.rawTicket);
                      } else if (onSelectTab) {
                        onSelectTab('tickets');
                      }
                    }}
                    className="hover:bg-blue-50/70 transition cursor-pointer group"
                    title="Click to open ticket details"
                  >
                    <td className="px-3 py-2 text-center text-slate-400 font-mono">{row.no}</td>
                    <td className="px-3 py-2 font-semibold text-blue-700 group-hover:underline">
                      {row.ticketId}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600">{row.due}</td>
                    <td
                      onClick={(e) => {
                        if (row.contact && onSelectContact) {
                          e.stopPropagation();
                          onSelectContact(row.contact);
                        } else if (row.owner && onSelectContact) {
                          e.stopPropagation();
                          onSelectContact({ fullName: row.owner });
                        }
                      }}
                      className="px-3 py-2 text-slate-800 font-medium hover:text-blue-600 hover:underline"
                      title="Click to view Contact profile"
                    >
                      {row.owner}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {row.stage}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-800 font-medium">{row.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ROW 9: ACA Consent Form Status (Normal & Special States) (Image 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view ACA Deals"
              >
                ACA Consent Form Status (Normal States) - Manager
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Deals"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 mb-3">
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#5271ff]" />Anya Nguyen</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#84cc16]" />Sean Ngo</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-amber-500" />Sarah Thai</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-sky-400" />Ivy Le</span>
            </div>

            <div className="space-y-2 text-[11px] my-auto">
              {[
                { label: 'Collected', count: 259, segments: [95, 55, 30, 79] },
                { label: 'Uploaded', count: 245, segments: [90, 60, 20, 75] },
                { label: 'Sent out', count: 113, segments: [30, 70, 13] },
                { label: 'Existing client', count: 88, segments: [40, 48] },
                { label: 'Need send new form', count: 7, segments: [7] },
                { label: 'not sent', count: 4, segments: [4] },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view deals with consent status: ${item.label}`}
                >
                  <span className="w-32 text-right text-slate-600 truncate group-hover:text-blue-700">{item.label}</span>
                  <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden max-w-sm group-hover:ring-1 group-hover:ring-blue-300">
                    {item.segments.map((s, idx) => {
                      const colors = [C_ANYA, C_SEAN, C_IVY, C_SARAH];
                      return (
                        <div
                          key={idx}
                          style={{ width: `${(s / 270) * 100}%`, backgroundColor: colors[idx % colors.length] }}
                          className="h-full"
                        />
                      );
                    })}
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[10px] group-hover:text-blue-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view ACA Deals"
              >
                ACA Consent Form Status (Special States) - Manager
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Deals"
                >
                  <span className="material-symbols-outlined text-[15px]">crop_free</span>
                </button>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 mb-3">
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#5271ff]" />Anya Nguyen</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-[#84cc16]" />Sean Ngo</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-amber-500" />Sarah Thai</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-xs bg-sky-400" />Ivy Le</span>
            </div>

            <div className="space-y-2 text-[11px] my-auto">
              {[
                { label: 'Collected', count: 46, segments: [18, 14, 8, 6] },
                { label: 'Uploaded', count: 11, segments: [7, 4] },
                { label: 'Sent out', count: 7, segments: [7] },
                { label: 'Existing client', count: 2, segments: [2] },
                { label: 'Need send new form', count: 2, segments: [2] },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view deals with consent status: ${item.label}`}
                >
                  <span className="w-32 text-right text-slate-600 truncate group-hover:text-blue-700">{item.label}</span>
                  <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden max-w-sm group-hover:ring-1 group-hover:ring-blue-300">
                    {item.segments.map((s, idx) => {
                      const colors = [C_ANYA, C_SEAN, C_IVY, C_SARAH];
                      return (
                        <div
                          key={idx}
                          style={{ width: `${(s / 50) * 100}%`, backgroundColor: colors[idx % colors.length] }}
                          className="h-full"
                        />
                      );
                    })}
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[10px] group-hover:text-blue-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 10: Active Policies OB 26 Not Done ACA - Manager ────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">article</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view Active Policies"
              >
                Active Policies OB 26 Not Done ACA - Manager
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('deals')}
                className="hover:text-blue-600 p-0.5 cursor-pointer"
                title="View Deals"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
              <button type="button" className="hover:text-slate-600 p-0.5" title="Options">
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#5271ff' }} />
              <span>Anya Nguyen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#84cc16' }} />
              <span>Sean Ngo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#e89547' }} />
              <span>Sarah Thai</span>
            </div>
          </div>

          {/* Chart area with Y-axis title on left */}
          <div className="flex items-stretch gap-3 pl-2 pr-6">
            {/* Y-axis label */}
            <div className="flex items-center justify-center shrink-0 w-8">
              <span className="text-slate-500 text-[11px] font-medium -rotate-90 origin-center whitespace-nowrap select-none">
                ACA Account Status - Normal state
              </span>
            </div>

            {/* Bars container */}
            <div className="flex-grow flex flex-col justify-between space-y-4 py-2 border-l border-slate-300 relative">
              {/* Vertical grid lines at 0, 5, 10, 15, 20, 25 */}
              <div className="absolute inset-0 pointer-events-none flex justify-between z-0">
                <div className="h-full border-r border-slate-100" style={{ left: '0%' }} />
                <div className="h-full border-r border-slate-100" style={{ left: '20%' }} />
                <div className="h-full border-r border-slate-100" style={{ left: '40%' }} />
                <div className="h-full border-r border-slate-100" style={{ left: '60%' }} />
                <div className="h-full border-r border-slate-100" style={{ left: '80%' }} />
                <div className="h-full border-r border-slate-100" style={{ left: '100%' }} />
              </div>

              {/* Rows */}
              {[
                {
                  label: 'Need Create ACA Account',
                  total: 21,
                  segments: [
                    { name: 'Anya Nguyen', val: 18, color: '#5271ff' },
                    { name: 'Sarah Thai', val: 3, color: '#e89547' },
                  ],
                },
                {
                  label: 'Pending - Waiting for Document',
                  total: 7,
                  segments: [
                    { name: 'Sean Ngo', val: 6, color: '#84cc16' },
                    { name: 'Sarah Thai', val: 1, color: '#e89547' },
                  ],
                },
                {
                  label: 'Uploaded - Waiting for Verification',
                  total: 8,
                  segments: [
                    { name: 'Sean Ngo', val: 7, color: '#84cc16' },
                    { name: 'Sarah Thai', val: 1, color: '#e89547' },
                  ],
                },
                {
                  label: 'VERIFIED',
                  total: 3,
                  segments: [
                    { name: 'Anya Nguyen', val: 3, color: '#5271ff' },
                  ],
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-3 relative z-10 hover:bg-blue-50/70 p-1 rounded cursor-pointer transition group"
                  title={`Click to view deals in stage: ${row.label}`}
                >
                  <div className="w-56 text-right text-[11px] text-slate-600 font-medium shrink-0 truncate group-hover:text-blue-700">
                    {row.label}
                  </div>
                  <div className="flex-grow flex items-center">
                    <div className="h-3 flex overflow-hidden rounded-xs group-hover:ring-2 group-hover:ring-blue-400 transition" style={{ width: `${(row.total / 25) * 100}%` }}>
                      {row.segments.map((seg, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            width: `${(seg.val / row.total) * 100}%`,
                            backgroundColor: seg.color,
                          }}
                          className="h-full"
                          title={`${seg.name}: ${seg.val}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-700 font-bold ml-2 group-hover:text-blue-700">
                      {row.total}
                    </span>
                  </div>
                </div>
              ))}

              {/* X-axis tick scale */}
              <div className="pt-2 border-t border-slate-300 mt-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium pl-56">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                </div>
                <div className="text-center text-[10px] text-slate-500 font-medium mt-1">
                  (Count Distinct) Contact (Id)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 11: Daily Complete Tickets ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view Complete Tickets"
              >
                Daily Complete Tickets
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="hover:text-blue-600 p-0.5 cursor-pointer"
                title="View in Tickets"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
              <button type="button" className="hover:text-slate-600 p-0.5">
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-semibold text-[10.5px]">
                  <th rowSpan={2} className="px-4 py-2 border border-slate-200 text-slate-700 min-w-[140px]">
                    Service Agent
                  </th>
                  {['08/01/2026', '08/02/2026', '08/03/2026', '08/04/2026', '08/05/2026', '08/06/2026', '08/07/2026', '08/08/2026', '08/10/2026'].map((date) => (
                    <th key={date} className="px-3 py-1.5 border border-slate-200 text-center font-semibold text-slate-700">
                      {date}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] text-slate-400 font-normal">
                  {Array(9).fill('TicketId').map((sub, i) => (
                    <th key={i} className="px-3 py-1 border border-slate-200 text-center font-normal text-slate-400">
                      {sub}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { agent: 'Anya Nguyen', vals: [2, 5, 42, 36, 9, 27, 9, 2, 6] },
                  { agent: 'Sean Ngo', vals: [0, 0, 46, 49, 0, 13, 18, 0, 0] },
                  { agent: 'Sarah Thai', vals: [1, 2, 9, 8, 3, 3, 1, 1, 1] },
                  { agent: 'Panther Nguyen', vals: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
                  { agent: 'Ivy Le', vals: [0, 0, 7, 2, 1, 3, 0, 1, 0] },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSelectTab && onSelectTab('tickets')}
                    className="hover:bg-blue-50/70 transition cursor-pointer group"
                    title={`Click to view tickets for ${row.agent}`}
                  >
                    <td className="px-4 py-2 border border-slate-200 font-medium text-slate-800 group-hover:text-blue-700">
                      {row.agent}
                    </td>
                    {row.vals.map((v, vIdx) => (
                      <td key={vIdx} className="px-3 py-2 border border-slate-200 text-right font-medium text-slate-700 group-hover:text-blue-800">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* TOTAL ROW */}
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="bg-slate-50 font-bold border-t-2 border-slate-300 hover:bg-blue-100/70 transition cursor-pointer group"
                  title="Click to view all completed tickets"
                >
                  <td className="px-4 py-2 border border-slate-200 text-slate-900 tracking-wider group-hover:text-blue-800">
                    TOTAL
                  </td>
                  {[3, 7, 104, 95, 13, 46, 28, 4, 7].map((t, idx) => (
                    <td key={idx} className="px-3 py-2 border border-slate-200 text-right font-bold text-slate-900 group-hover:text-blue-800">
                      {t}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ROW 12: Daily New Tickets ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view New Tickets"
              >
                Daily New Tickets
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="hover:text-blue-600 p-0.5 cursor-pointer"
                title="View in Tickets"
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
              <button type="button" className="hover:text-slate-600 p-0.5">
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-semibold text-[10.5px]">
                  <th rowSpan={2} className="px-4 py-2 border border-slate-200 text-slate-700 min-w-[140px]">
                    Service Agent
                  </th>
                  {['08/02/2026', '08/03/2026', '08/04/2026', '08/05/2026', '08/09/2026', '08/11/2026', '08/12/2026', '08/13/2026', '08/16/2026'].map((date) => (
                    <th key={date} className="px-3 py-1.5 border border-slate-200 text-center font-semibold text-slate-700">
                      {date}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] text-slate-400 font-normal">
                  {Array(9).fill('TicketId').map((sub, i) => (
                    <th key={i} className="px-3 py-1 border border-slate-200 text-center font-normal text-slate-400">
                      {sub}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { agent: 'Anya Nguyen', vals: [1, 0, 2, 3, 7, 1, 2, 2, 4] },
                  { agent: 'Sean Ngo', vals: [0, 0, 0, 0, 3, 4, 0, 1, 2] },
                  { agent: 'Sarah Thai', vals: [0, 0, 0, 0, 0, 1, 0, 4, 2] },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSelectTab && onSelectTab('tickets')}
                    className="hover:bg-blue-50/70 transition cursor-pointer group"
                    title={`Click to view tickets for ${row.agent}`}
                  >
                    <td className="px-4 py-2 border border-slate-200 font-medium text-slate-800 group-hover:text-blue-700">
                      {row.agent}
                    </td>
                    {row.vals.map((v, vIdx) => (
                      <td key={vIdx} className="px-3 py-2 border border-slate-200 text-right font-medium text-slate-700 group-hover:text-blue-800">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* TOTAL ROW */}
                <tr
                  onClick={() => onSelectTab && onSelectTab('tickets')}
                  className="bg-slate-50 font-bold border-t-2 border-slate-300 hover:bg-blue-100/70 transition cursor-pointer group"
                  title="Click to view all new tickets"
                >
                  <td className="px-4 py-2 border border-slate-200 text-slate-900 tracking-wider group-hover:text-blue-800">
                    TOTAL
                  </td>
                  {[1, 3, 2, 3, 12, 6, 2, 7, 9].map((t, idx) => (
                    <td key={idx} className="px-3 py-2 border border-slate-200 text-right font-bold text-slate-900 group-hover:text-blue-800">
                      {t}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ROW 13: Need Manager enroll & SOA Status - Manager (2 Columns) ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Need Manager enroll */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">article</span>
                <h3
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                  title="Click to view deals needing manager enrollment"
                >
                  Need Manager enroll
                </h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Deals"
                >
                  <span className="material-symbols-outlined text-[16px]">crop_free</span>
                </button>
                <button type="button" className="hover:text-slate-600 p-0.5">
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#5271ff' }} />
                <span>Waiting for document (Obamacare 2026)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#84cc16' }} />
                <span>Ready to Enroll (Obamacare 2026)</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex items-stretch gap-3 pl-2 pr-4 flex-grow my-auto">
              <div className="flex items-center justify-center shrink-0 w-6">
                <span className="text-slate-500 text-[11px] font-medium -rotate-90 origin-center whitespace-nowrap select-none">
                  Pipeline
                </span>
              </div>

              <div className="flex-grow flex flex-col justify-between py-2 border-l border-slate-300 relative">
                {/* Vertical grid lines at 0, 1, 1, 2, 2 */}
                <div className="absolute inset-0 pointer-events-none flex justify-between z-0">
                  <div className="h-full border-r border-slate-100" style={{ left: '0%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '25%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '50%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '75%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '100%' }} />
                </div>

                <div
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-3 relative z-10 my-4 hover:bg-blue-50/70 p-1 rounded cursor-pointer transition group"
                  title="Click to view deals needing manager enrollment"
                >
                  <span className="w-28 text-right text-[11px] text-slate-600 font-medium shrink-0 truncate group-hover:text-blue-700">
                    Obamacare 2026
                  </span>
                  <div className="flex-grow flex items-center">
                    <div className="h-3 flex overflow-hidden rounded-xs w-full group-hover:ring-2 group-hover:ring-blue-400 transition">
                      <div
                        style={{ width: '50%', backgroundColor: '#5271ff' }}
                        className="h-full"
                        title="Waiting for document: 1"
                      />
                      <div
                        style={{ width: '50%', backgroundColor: '#84cc16' }}
                        className="h-full"
                        title="Ready to Enroll: 1"
                      />
                    </div>
                    <span className="text-[10px] text-slate-700 font-bold ml-2 group-hover:text-blue-700">2</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-300 mt-4">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium pl-28">
                    <span>0</span>
                    <span>1</span>
                    <span>1</span>
                    <span>2</span>
                    <span>2</span>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 font-medium mt-1">
                    (Count) DealId
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: SOA Status - Manager */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">article</span>
                <h3
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                  title="Click to view SOA Deals"
                >
                  SOA Status - Manager
                </h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="hover:text-blue-600 p-0.5 cursor-pointer"
                  title="View Deals"
                >
                  <span className="material-symbols-outlined text-[16px]">crop_free</span>
                </button>
                <button type="button" className="hover:text-slate-600 p-0.5">
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#5271ff' }} />
                <span>Ivy Le</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#84cc16' }} />
                <span>Sarah Thai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#e89547' }} />
                <span>Sean Ngo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#38bdf8' }} />
                <span>Anya Nguyen</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex items-stretch gap-3 pl-2 pr-4 flex-grow my-auto">
              <div className="flex items-center justify-center shrink-0 w-6">
                <span className="text-slate-500 text-[11px] font-medium -rotate-90 origin-center whitespace-nowrap select-none">
                  SOA Status
                </span>
              </div>

              <div className="flex-grow flex flex-col justify-between space-y-3 py-1 border-l border-slate-300 relative">
                {/* Vertical grid lines at 0, 5, 10, 15, 20, 25, 30 */}
                <div className="absolute inset-0 pointer-events-none flex justify-between z-0">
                  <div className="h-full border-r border-slate-100" style={{ left: '0%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '16.66%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '33.33%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '50%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '66.66%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '83.33%' }} />
                  <div className="h-full border-r border-slate-100" style={{ left: '100%' }} />
                </div>

                {[
                  {
                    label: 'Sent out',
                    total: 4,
                    segments: [{ name: 'Anya Nguyen', val: 4, color: '#38bdf8' }],
                  },
                  {
                    label: 'Existing client',
                    total: 1,
                    segments: [{ name: 'Sean Ngo', val: 1, color: '#e89547' }],
                  },
                  {
                    label: 'Collected',
                    total: 11,
                    segments: [
                      { name: 'Ivy Le', val: 8, color: '#5271ff' },
                      { name: 'Sean Ngo', val: 2, color: '#e89547' },
                      { name: 'Anya Nguyen', val: 1, color: '#38bdf8' },
                    ],
                  },
                  {
                    label: 'Uploaded',
                    total: 29,
                    segments: [
                      { name: 'Ivy Le', val: 17, color: '#5271ff' },
                      { name: 'Sarah Thai', val: 1, color: '#84cc16' },
                      { name: 'Sean Ngo', val: 3, color: '#e89547' },
                      { name: 'Anya Nguyen', val: 8, color: '#38bdf8' },
                    ],
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="flex items-center gap-3 relative z-10 hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                    title={`Click to view deals with SOA status: ${row.label}`}
                  >
                    <span className="w-24 text-right text-[11px] text-slate-600 font-medium shrink-0 truncate group-hover:text-blue-700">
                      {row.label}
                    </span>
                    <div className="flex-grow flex items-center">
                      <div
                        className="h-3 flex overflow-hidden rounded-xs group-hover:ring-1 group-hover:ring-blue-300 transition"
                        style={{ width: `${(row.total / 30) * 100}%` }}
                      >
                        {row.segments.map((seg, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              width: `${(seg.val / row.total) * 100}%`,
                              backgroundColor: seg.color,
                            }}
                            className="h-full"
                            title={`${seg.name}: ${seg.val}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-700 font-bold ml-2 group-hover:text-blue-700">
                        {row.total}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-300 mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium pl-24">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                    <span>25</span>
                    <span>30</span>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 font-medium mt-1">
                    (Count Distinct) Deal (Id)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
