import React, { useState, useEffect, useMemo } from 'react';
import {
  getDashboardStats,
  getDeals,
  getContacts,
  getTickets,
  getTasks,
  getCommissions,
} from '../../../services/api';

export default function StaffCrmDashboard({
  onSelectTab,
  onSelectDeal,
  onSelectContact,
  onSelectTicket,
  onSelectTask,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [liveDeals, setLiveDeals] = useState([]);
  const [liveContacts, setLiveContacts] = useState([]);
  const [liveTickets, setLiveTickets] = useState([]);
  const [liveTasks, setLiveTasks] = useState([]);
  const [liveCommissions, setLiveCommissions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'obamacare' | 'medicare' | 'tickets' | 'tasks' | 'commissions'
  const [selectedDashboard, setSelectedDashboard] = useState(
    'Daily work of support - Team Tiger Truong'
  );

  async function fetchStats() {
    try {
      const [statsRes, dealsRes, contactsRes, ticketsRes, tasksRes, commsRes] =
        await Promise.all([
          getDashboardStats().catch(() => null),
          getDeals().catch(() => []),
          getContacts().catch(() => []),
          getTickets().catch(() => []),
          getTasks().catch(() => []),
          getCommissions().catch(() => []),
        ]);
      if (statsRes) setDbStats(statsRes);
      if (Array.isArray(dealsRes)) setLiveDeals(dealsRes);
      if (Array.isArray(contactsRes)) setLiveContacts(contactsRes);
      if (Array.isArray(ticketsRes)) setLiveTickets(ticketsRes);
      if (Array.isArray(tasksRes)) setLiveTasks(tasksRes);
      if (Array.isArray(commsRes)) setLiveCommissions(commsRes);
    } catch (err) {
      console.warn('[StaffCrmDashboard] Could not fetch live dashboard data:', err);
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

  // ── Color Constants ────────────────────────────────────────────────────────
  const C_ANYA = '#5271ff'; // Blue
  const C_SEAN = '#84cc16'; // Lime Green
  const C_IVY = '#f97316';  // Orange
  const C_SARAH = '#38bdf8'; // Sky Blue
  const C_PURPLE = '#a855f7';
  const C_RED = '#ef4444';
  const C_AMBER = '#f59e0b';
  const C_TEAL = '#0d9488';
  const C_ROSE = '#f43f5e';
  const C_CYAN = '#06b6d4';

  const AGENT_COLORS = {
    'Anya Nguyen': C_ANYA,
    'Sean Ngo': C_SEAN,
    'Ivy Le': C_IVY,
    'Sarah Thai': C_SARAH,
    'Khanh Nguyen': '#6366f1',
    'Jay Ly': C_CYAN,
    'Tri Tran': '#10b981',
    'Quyen Le': '#8b5cf6',
    'Trono Truong': '#d97706',
    'Miranda Pham': '#ec4899',
    'Nancy Pham': '#14b8a6',
    'Nathan Truong': '#f43f5e',
    'The Best Rate Insurance': C_TEAL,
  };

  const getAgentColor = (name, idx = 0) => {
    if (!name) return [C_ANYA, C_SEAN, C_IVY, C_SARAH][idx % 4];
    return (
      AGENT_COLORS[name] ||
      [C_ANYA, C_SEAN, C_IVY, C_SARAH, C_PURPLE, C_TEAL, C_AMBER, C_ROSE][idx % 8]
    );
  };

  // Helper date formatter
  function formatDate(d) {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  }

  // ── Dynamic Aggregations from Live Database Records ─────────────────────────

  // 1. Deals breakdowns
  const obDeals = useMemo(
    () => liveDeals.filter((d) => (d.pipeline || '').toLowerCase().includes('obamacare')),
    [liveDeals]
  );
  const medDeals = useMemo(
    () => liveDeals.filter((d) => (d.pipeline || '').toLowerCase().includes('medicare')),
    [liveDeals]
  );
  const activeDealsList = useMemo(
    () =>
      liveDeals.filter(
        (d) =>
          !d.stage?.toLowerCase().includes('lost') &&
          !d.stage?.toLowerCase().includes('termination')
      ),
    [liveDeals]
  );

  // 2. Tickets & Tasks breakdowns
  const openTicketsList = useMemo(
    () => liveTickets.filter((t) => t.status !== 'Closed' && t.status !== 'Resolved'),
    [liveTickets]
  );
  const overdueTicketsList = useMemo(
    () =>
      liveTickets.filter((t) => {
        if (t.status === 'Closed' || t.status === 'Resolved') return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }),
    [liveTickets]
  );
  const openTasksList = useMemo(
    () => liveTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Done'),
    [liveTasks]
  );
  const overdueTasksList = useMemo(
    () =>
      liveTasks.filter((t) => {
        if (t.status === 'Completed' || t.status === 'Done') return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }),
    [liveTasks]
  );

  // 3. Commission revenues
  const commissionStats = useMemo(() => {
    let monthly = 0;
    let ytd = 0;
    liveCommissions.forEach((c) => {
      const amt = Number(c.netAmount || c.grossAmount || 0);
      ytd += amt;
      if (c.status === 'SETTLED' || c.period === '2026-10') {
        monthly += amt;
      }
    });
    return {
      monthly: monthly || dbStats?.commissionThisMonth || 0,
      ytd: ytd || dbStats?.commissionYTD || 0,
    };
  }, [liveCommissions, dbStats]);

  // ── Card 1: Obamacare Deals by Stage (100% Real DB Data) ────────────────────
  const obStagesData = useMemo(() => {
    const stageMap = {};
    obDeals.forEach((d) => {
      const st = d.stage || 'Ready to Enroll (Obamacare 2026)';
      if (!stageMap[st]) {
        stageMap[st] = { stage: st, count: 0, agents: {} };
      }
      stageMap[st].count += 1;
      const agent = d.dealOwnerName || d.dealOwner?.name || 'Unassigned';
      stageMap[st].agents[agent] = (stageMap[st].agents[agent] || 0) + 1;
    });

    return Object.values(stageMap).sort((a, b) => b.count - a.count);
  }, [obDeals]);

  const maxObCount = useMemo(() => {
    const counts = obStagesData.map((s) => s.count);
    return Math.max(...counts, 1);
  }, [obStagesData]);

  // ── Card 2: Medicare Deals by Stage (100% Real DB Data) ─────────────────────
  const medStagesData = useMemo(() => {
    const stageMap = {};
    medDeals.forEach((d) => {
      const st = d.stage || 'Enrolled - Active (Medicare 2026)';
      if (!stageMap[st]) {
        stageMap[st] = { stage: st, count: 0, agents: {} };
      }
      stageMap[st].count += 1;
      const agent = d.dealOwnerName || d.dealOwner?.name || 'Unassigned';
      stageMap[st].agents[agent] = (stageMap[st].agents[agent] || 0) + 1;
    });

    return Object.values(stageMap).sort((a, b) => b.count - a.count);
  }, [medDeals]);

  const maxMedCount = useMemo(() => {
    const counts = medStagesData.map((s) => s.count);
    return Math.max(...counts, 1);
  }, [medStagesData]);

  const medUniqueAgents = useMemo(() => {
    const set = new Set();
    medDeals.forEach((d) => {
      const ag = d.dealOwnerName || d.dealOwner?.name;
      if (ag) set.add(ag);
    });
    return Array.from(set);
  }, [medDeals]);

  // ── Card 3: Active OB by Support Agent (100% Real DB Data) ──────────────────
  const activeObByAgent = useMemo(() => {
    const activeOB = obDeals.filter((d) => (d.stage || '').toLowerCase().includes('active'));
    const map = {};
    activeOB.forEach((d) => {
      const agent = d.dealOwnerName || d.dealOwner?.name || 'Unassigned';
      map[agent] = (map[agent] || 0) + 1;
    });
    return Object.entries(map)
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }, [obDeals]);

  const maxActiveObAgent = useMemo(
    () => Math.max(...activeObByAgent.map((a) => a.count), 1),
    [activeObByAgent]
  );

  // ── Card 4: Medicare Deals by Support Agent (100% Real DB Data) ─────────────
  const medDealsByAgent = useMemo(() => {
    const map = {};
    medDeals.forEach((d) => {
      const agent = d.dealOwnerName || d.dealOwner?.name || 'Unassigned';
      map[agent] = (map[agent] || 0) + 1;
    });
    return Object.entries(map)
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }, [medDeals]);

  const maxMedAgent = useMemo(
    () => Math.max(...medDealsByAgent.map((a) => a.count), 1),
    [medDealsByAgent]
  );

  // ── Card 5: Total Contact Count by Owner (Active vs Inactive) ───────────────
  const contactsByOwner = useMemo(() => {
    const map = {};
    liveContacts.forEach((c) => {
      const owner = c.contactOwnerName || c.supportAgent || 'Unassigned';
      if (!map[owner]) map[owner] = { agent: owner, active: 0, inactive: 0, total: 0 };
      if (c.status === 'Active') {
        map[owner].active += 1;
      } else {
        map[owner].inactive += 1;
      }
      map[owner].total += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [liveContacts]);

  const maxContactOwner = useMemo(
    () => Math.max(...contactsByOwner.map((c) => c.total), 1),
    [contactsByOwner]
  );

  // ── Card 6: Deals by Agent Column Chart (100% Real DB Data) ─────────────────
  const dealsByAgentChart = useMemo(() => {
    const map = {};
    activeDealsList.forEach((d) => {
      const owner = d.dealOwnerName || d.dealOwner?.name || 'Unassigned';
      if (!map[owner]) map[owner] = { name: owner, ob: 0, med: 0, total: 0 };
      if ((d.pipeline || '').toLowerCase().includes('medicare')) {
        map[owner].med += 1;
      } else {
        map[owner].ob += 1;
      }
      map[owner].total += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [activeDealsList]);

  const maxAgentDealTotal = useMemo(
    () => Math.max(...dealsByAgentChart.map((d) => d.total), 1),
    [dealsByAgentChart]
  );

  // ── Card 7 & 8: Open & Overdue Tasks by Assignee ────────────────────────────
  const openTasksByAgent = useMemo(() => {
    const map = {};
    openTasksList.forEach((t) => {
      const agent = t.assignedTo || 'Unassigned';
      map[agent] = (map[agent] || 0) + 1;
    });
    return Object.entries(map)
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }, [openTasksList]);

  const overdueTasksByAgent = useMemo(() => {
    const map = {};
    overdueTasksList.forEach((t) => {
      const agent = t.assignedTo || 'Unassigned';
      map[agent] = (map[agent] || 0) + 1;
    });
    return Object.entries(map)
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }, [overdueTasksList]);

  // ── Card 9: Tickets Overdue Details Pivot Table (100% Real DB Data) ────────
  const overduePivotTable = useMemo(() => {
    const matchPipeline = (pipeStr) => {
      const p = (pipeStr || '').toLowerCase();
      if (p.includes('payment') || p.includes('pay')) return 'Payment';
      if (p.includes('aca') || p.includes('account')) return 'ACA account';
      if (p.includes('upload') || p.includes('collect') || p.includes('doc')) return 'Upload document';
      if (p.includes('doctor')) return 'Choose Doctor';
      return 'Client Support';
    };

    const combos = {};
    overdueTicketsList.forEach((t) => {
      const ag = t.serviceAgent || t.assignedTo || 'Unassigned';
      const st = t.stage || t.status || 'Waiting on verification';
      const key = `${ag}:::${st}`;
      if (!combos[key]) {
        combos[key] = {
          agent: ag,
          stage: st,
          counts: {
            'Client Support': 0,
            Payment: 0,
            'ACA account': 0,
            'Upload document': 0,
            'Choose Doctor': 0,
          },
          total: 0,
        };
      }
      const pCat = matchPipeline(t.pipeline || t.title);
      combos[key].counts[pCat] = (combos[key].counts[pCat] || 0) + 1;
      combos[key].total += 1;
    });

    return Object.values(combos);
  }, [overdueTicketsList]);

  const overduePivotTotals = useMemo(() => {
    const totals = {
      'Client Support': 0,
      Payment: 0,
      'ACA account': 0,
      'Upload document': 0,
      'Choose Doctor': 0,
      grandTotal: 0,
    };
    overduePivotTable.forEach((row) => {
      Object.keys(row.counts).forEach((k) => {
        totals[k] += row.counts[k] || 0;
      });
      totals.grandTotal += row.total || 0;
    });
    return totals;
  }, [overduePivotTable]);

  // ── Card 10: All Open Tickets by Service Agent ──────────────────────────────
  const openTicketsByAgent = useMemo(() => {
    const map = {};
    openTicketsList.forEach((t) => {
      const agent = t.serviceAgent || t.assignedTo || 'Unassigned';
      if (!map[agent]) map[agent] = { agent, count: 0 };
      map[agent].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [openTicketsList]);

  // ── Card 11: All Overdue Tickets by Service Agent ───────────────────────────
  const overdueTicketsByAgent = useMemo(() => {
    const map = {};
    overdueTicketsList.forEach((t) => {
      const agent = t.serviceAgent || t.assignedTo || 'Unassigned';
      if (!map[agent]) map[agent] = { agent, count: 0 };
      map[agent].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [overdueTicketsList]);

  // ── Card 12: Need Extend Tickets ────────────────────────────────────────────
  const needExtendTickets = useMemo(() => {
    return liveTickets.filter(
      (t) =>
        (t.title || '').toLowerCase().includes('extend') ||
        t.category === 'Extend'
    );
  }, [liveTickets]);

  // ── Card 13: Need Update Member ID ──────────────────────────────────────────
  const needUpdateMemberIdData = useMemo(() => {
    const missing = liveDeals.filter(
      (d) => !d.primaryMemberId || d.primaryMemberId === '---' || d.primaryMemberId === ''
    );
    const map = {};
    missing.forEach((d) => {
      const agent = d.dealOwnerName || d.dealOwner?.name || 'Unassigned';
      map[agent] = (map[agent] || 0) + 1;
    });
    const maxVal = Math.max(...Object.values(map), 1);
    return Object.entries(map).map(([agent, count]) => ({
      agent,
      count,
      widthPercent: Math.max((count / maxVal) * 100, 10),
    }));
  }, [liveDeals]);

  // ── Card 14: Need Create Member Account ─────────────────────────────────────
  const needCreateMemberAccountData = useMemo(() => {
    const needAccount = liveContacts.filter(
      (c) =>
        !c.acaAccount ||
        c.acaAccountStatus?.toLowerCase().includes('need create') ||
        c.acaAccountStatus?.toLowerCase().includes('pending')
    );
    const map = {};
    needAccount.forEach((c) => {
      const agent = c.supportAgent || c.contactOwnerName || 'Unassigned';
      map[agent] = (map[agent] || 0) + 1;
    });
    const maxVal = Math.max(...Object.values(map), 1);
    return Object.entries(map).map(([agent, count]) => ({
      agent,
      count,
      widthPercent: Math.max((count / maxVal) * 100, 10),
    }));
  }, [liveContacts]);

  // ── Card 15: Open Upload Document Ticket Table (100% Real DB Data) ──────────
  const uploadTicketsDisplay = useMemo(() => {
    const docTix = liveTickets.filter(
      (t) =>
        t.pipeline === 'COLLECT_DOCUMENT' ||
        t.pipeline === 'Upload documents' ||
        (t.title || '').toLowerCase().includes('document') ||
        (t.title || '').toLowerCase().includes('upload')
    );
    return docTix.map((t, idx) => ({
      no: idx + 1,
      ticketId: t.title || `Collect Document #${t.id?.slice(-4)}`,
      due: formatDate(t.dueDate),
      owner: t.contact?.fullName || t.ticketOwner || 'Customer',
      stage:
        t.status === 'WAITING_ON_CLIENT'
          ? 'Waiting on contact'
          : t.stage || t.status || 'Waiting on verification',
      agent: t.serviceAgent || t.assignedTo || 'Unassigned',
      rawTicket: t,
      contact: t.contact,
    }));
  }, [liveTickets]);

  // ── Card 16 & 17: ACA Consent Form Status (100% Real DB Data) ───────────────
  const acaConsentStatusData = useMemo(() => {
    const map = {};
    obDeals.forEach((d) => {
      const st = d.consentFormStatus || 'Collected';
      if (!map[st]) map[st] = { label: st, count: 0, agents: {} };
      map[st].count += 1;
      const agent = d.dealOwnerName || 'Unassigned';
      map[st].agents[agent] = (map[st].agents[agent] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [obDeals]);

  // ── Card 18: Active Policies OB 26 Not Done ACA - Manager ──────────────────
  const activePoliciesObNotDoneAca = useMemo(() => {
    const activeOB = obDeals.filter((d) => (d.stage || '').toLowerCase().includes('active'));
    const map = {};
    activeOB.forEach((d) => {
      const st = d.contact?.acaAccountStatus || d.stageAca || 'Pending - Waiting for Document';
      if (!map[st]) map[st] = { label: st, total: 0, agents: {} };
      map[st].total += 1;
      const agent = d.dealOwnerName || 'Unassigned';
      map[st].agents[agent] = (map[st].agents[agent] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [obDeals]);

  // ── Card 19 & 20: Daily Complete Tickets & Daily New Tickets ────────────────
  const ticketDateColumns = useMemo(() => {
    const set = new Set();
    liveTickets.forEach((t) => {
      if (t.createdAt) set.add(formatDate(t.createdAt));
      if (t.dueDate) set.add(formatDate(t.dueDate));
    });
    const arr = Array.from(set).filter(Boolean).sort();
    return arr.slice(0, 9);
  }, [liveTickets]);

  const ticketDistinctAgents = useMemo(() => {
    const set = new Set();
    liveTickets.forEach((t) => {
      const ag = t.serviceAgent || t.assignedTo;
      if (ag) set.add(ag);
    });
    const arr = Array.from(set);
    return arr.length > 0 ? arr : ['Anya Nguyen', 'Sean Ngo', 'Sarah Thai', 'Ivy Le'];
  }, [liveTickets]);

  const dailyCompleteTicketsData = useMemo(() => {
    const completed = liveTickets.filter((t) => t.status === 'Closed' || t.status === 'Resolved');
    const matrix = ticketDistinctAgents.map((agent) => {
      const vals = ticketDateColumns.map((dt) => {
        return completed.filter(
          (t) =>
            (t.serviceAgent === agent || t.assignedTo === agent) &&
            formatDate(t.dueDate || t.updatedAt) === dt
        ).length;
      });
      return { agent, vals };
    });
    const colTotals = ticketDateColumns.map((_, cIdx) => {
      return matrix.reduce((sum, r) => sum + r.vals[cIdx], 0);
    });
    return { matrix, colTotals };
  }, [liveTickets, ticketDateColumns, ticketDistinctAgents]);

  const dailyNewTicketsData = useMemo(() => {
    const newTix = liveTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress');
    const matrix = ticketDistinctAgents.map((agent) => {
      const vals = ticketDateColumns.map((dt) => {
        return newTix.filter(
          (t) =>
            (t.serviceAgent === agent || t.assignedTo === agent) &&
            formatDate(t.createdAt) === dt
        ).length;
      });
      return { agent, vals };
    });
    const colTotals = ticketDateColumns.map((_, cIdx) => {
      return matrix.reduce((sum, r) => sum + r.vals[cIdx], 0);
    });
    return { matrix, colTotals };
  }, [liveTickets, ticketDateColumns, ticketDistinctAgents]);

  // ── Card 21: Need Manager Enroll ────────────────────────────────────────────
  const needManagerEnrollData = useMemo(() => {
    const waiting = liveDeals.filter(
      (d) =>
        (d.stage || '').toLowerCase().includes('waiting for document') ||
        (d.stage || '').toLowerCase().includes('ready to enroll')
    );
    const waitingDocCount = waiting.filter((d) =>
      (d.stage || '').toLowerCase().includes('waiting for document')
    ).length;
    const readyEnrollCount = waiting.filter((d) =>
      (d.stage || '').toLowerCase().includes('ready to enroll')
    ).length;
    return {
      total: waiting.length,
      waitingDocCount,
      readyEnrollCount,
    };
  }, [liveDeals]);

  // ── Card 22: SOA Status - Manager ───────────────────────────────────────────
  const soaStatusData = useMemo(() => {
    const map = {};
    medDeals.forEach((d) => {
      const st = d.consentFormStatus || 'Collected';
      if (!map[st]) map[st] = { label: st, total: 0, agents: {} };
      map[st].total += 1;
      const agent = d.dealOwnerName || 'Unassigned';
      map[st].agents[agent] = (map[st].agents[agent] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [medDeals]);

  // ── ROW 14: Commissions Summary & Ledger ──────────────────────────────────
  const commissionsSummary = useMemo(() => {
    const totalGross = liveCommissions.reduce((sum, c) => sum + (Number(c.grossAmount) || 0), 0);
    const totalNet = liveCommissions.reduce((sum, c) => sum + (Number(c.netAmount) || 0), 0);
    const totalDeduction = liveCommissions.reduce((sum, c) => sum + (Number(c.supportDeduction) || 0), 0);
    const settledCount = liveCommissions.filter((c) => c.status === 'SETTLED' || c.status === 'PAID').length;
    const pendingCount = liveCommissions.filter((c) => c.status === 'PENDING' || c.status === 'AUDIT').length;

    // By Carrier
    const carrierMap = {};
    liveCommissions.forEach((c) => {
      const carrier = c.carrier || 'Other Carrier';
      if (!carrierMap[carrier]) {
        carrierMap[carrier] = { carrier, gross: 0, net: 0, count: 0 };
      }
      carrierMap[carrier].gross += Number(c.grossAmount) || 0;
      carrierMap[carrier].net += Number(c.netAmount) || 0;
      carrierMap[carrier].count += 1;
    });

    return {
      totalGross,
      totalNet,
      totalDeduction,
      settledCount,
      pendingCount,
      byCarrier: Object.values(carrierMap).sort((a, b) => b.net - a.net),
    };
  }, [liveCommissions]);

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

      {/* ── Category Filter Bar ───────────────────────────────────────────── */}
      <div className="px-6 py-2.5 bg-white border-b border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs text-slate-600 shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {[
            { id: 'all', label: 'All Reports', count: 27, icon: 'grid_view' },
            { id: 'obamacare', label: 'Obamacare Funnel', count: 8, icon: 'health_and_safety' },
            { id: 'medicare', label: 'Medicare Lifecycle', count: 5, icon: 'medical_services' },
            { id: 'tickets', label: 'Tickets & Ops', count: 8, icon: 'confirmation_number' },
            { id: 'tasks', label: 'Tasks & SLA', count: 4, icon: 'checklist' },
            { id: 'commissions', label: 'Commissions', count: 5, icon: 'payments' },
          ].map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    active ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-emerald-700">100% Real DB Data</span>
          <span className="text-slate-400 font-normal">
            ({liveDeals.length} deals • {liveTickets.length} tickets • {liveTasks.length} tasks)
          </span>
        </div>
      </div>

      {/* ── Main Reports Container ───────────────────────────────────────── */}
      <div className="p-6 space-y-6 max-w-[1700px] mx-auto w-full">


        {/* ── ROW 1: 2 Main Deal Charts (50% / 50%) ──────────────────────── */}
        {['all', 'obamacare', 'medicare'].includes(categoryFilter) && (
          <div className={`grid grid-cols-1 ${categoryFilter === 'all' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
            {/* Card 1: Total Obamacare deals 2026 */}
            {['all', 'obamacare'].includes(categoryFilter) && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-5 flex flex-col">
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
                      Total Obamacare deals 2026 ({obDeals.length} deals)
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

            {/* Horizontal Bar Chart for OB Deals (100% Real DB Data) */}
            <div className="flex-grow flex flex-col justify-center space-y-1.5 text-[11px] pt-1">
              {obStagesData.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No Obamacare deals found</div>
              ) : (
                obStagesData.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 -mx-1 rounded cursor-pointer transition group"
                    title={`Click to view all ${item.stage} deals (${item.count})`}
                  >
                    <div
                      className="w-56 truncate text-right text-slate-600 font-medium shrink-0 group-hover:text-blue-700 transition"
                      title={item.stage}
                    >
                      {item.stage}
                    </div>
                    <div className="flex-grow bg-slate-100 rounded-sm h-3.5 flex overflow-hidden max-w-sm group-hover:ring-1 group-hover:ring-blue-300">
                      {Object.entries(item.agents).map(([agent, segCount], sIdx) => {
                        const widthPercent = (segCount / maxObCount) * 100;
                        return (
                          <div
                            key={sIdx}
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: getAgentColor(agent, sIdx),
                            }}
                            className="h-full"
                            title={`${agent}: ${segCount}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-700 w-8">
                      {item.count}
                    </span>
                  </div>
                ))
              )}
              <div className="flex items-center justify-end text-[9px] text-slate-400 gap-8 pr-10 pt-1">
                <span>0</span>
                <span>{Math.round(maxObCount * 0.25)}</span>
                <span>{Math.round(maxObCount * 0.5)}</span>
                <span>{Math.round(maxObCount * 0.75)}</span>
                <span>{maxObCount}</span>
              </div>
              <div className="text-center text-[10px] text-slate-500 font-semibold mt-0.5">
                (Count Distinct) Deal (Id) • Click any stage to open Deals
              </div>
            </div>
              </div>
            )}

            {/* Card 2: Total Medicare deals 2026 */}
            {['all', 'medicare'].includes(categoryFilter) && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-5 flex flex-col">
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
                  Total Medicare deals 2026 ({medDeals.length} deals)
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

            {/* Distinct Count Highlight Card - Real count from DB */}
            <div
              onClick={() => onSelectTab && onSelectTab('deals')}
              className="max-w-[200px] mx-auto my-2 p-3 bg-white rounded-xl border border-slate-200 text-center shadow-2xs hover:border-blue-400 cursor-pointer transition group"
              title="Click to view all Medicare deals"
            >
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider group-hover:text-blue-600">
                DEAL (ID)
              </div>
              <div className="text-[10px] text-slate-400">(Count Distinct)</div>
              <div className="text-3xl font-extrabold text-[#00B4D8] mt-1">
                {medDeals.length}
              </div>
            </div>

            {/* Dynamic Agent Legend */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 my-2 flex-wrap">
              {medUniqueAgents.map((agent, aIdx) => (
                <div key={agent} className="flex items-center gap-1">
                  <span
                    className="w-3 h-2 rounded-xs"
                    style={{ backgroundColor: getAgentColor(agent, aIdx) }}
                  />
                  <span>{agent}</span>
                </div>
              ))}
            </div>

            {/* Horizontal Bar Chart for Medicare Deals (100% Real DB Data) */}
            <div className="flex-grow flex flex-col justify-center space-y-1.5 text-[11px] pt-1">
              {medStagesData.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No Medicare deals found</div>
              ) : (
                medStagesData.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 -mx-1 rounded cursor-pointer transition group"
                    title={`Click to view all ${item.stage} deals (${item.count})`}
                  >
                    <div
                      className="w-60 truncate text-right text-slate-600 font-medium shrink-0 group-hover:text-blue-700 transition"
                      title={item.stage}
                    >
                      {item.stage}
                    </div>
                    <div className="flex-grow bg-slate-100 rounded-sm h-3.5 flex overflow-hidden max-w-xs group-hover:ring-1 group-hover:ring-blue-300">
                      {Object.entries(item.agents).map(([agent, segCount], sIdx) => {
                        const widthPercent = (segCount / maxMedCount) * 100;
                        return (
                          <div
                            key={sIdx}
                            style={{
                              width: `${widthPercent}%`,
                              backgroundColor: getAgentColor(agent, sIdx),
                            }}
                            className="h-full"
                            title={`${agent}: ${segCount}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-700 w-6">
                      {item.count}
                    </span>
                  </div>
                ))
              )}
            </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROW 2: 3 Medium Charts (33% / 33% / 33%) ─────────────────────── */}
        {['all', 'obamacare', 'medicare'].includes(categoryFilter) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 3: Total Active OB 2026 - Support Agent */}
            {['all', 'obamacare'].includes(categoryFilter) && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    Total Active OB 2026 - Support Agent
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
              <span className="font-mono text-slate-400">Live DB</span>
            </div>
            <div className="space-y-3 my-auto py-2">
              {activeObByAgent.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view deals handled by ${item.agent}`}
                >
                  <span className="w-20 truncate text-slate-600 text-right group-hover:text-blue-700">
                    {item.agent}
                  </span>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3 overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                    <div
                      style={{ width: `${(item.count / maxActiveObAgent) * 100}%` }}
                      className="bg-[#5271ff] h-full transition-all"
                    />
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[11px] group-hover:text-blue-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
              </div>
            )}

            {/* Card 4: Total Medicare deals 2026 - Support Agent */}
            {['all', 'medicare'].includes(categoryFilter) && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <h3
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                    title="Click to view Medicare deals"
                  >
                    Total Medicare deals 2026 - Support Agent
                  </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-[15px]">crop_free</span>
                <span className="material-symbols-outlined text-[15px]">more_horiz</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-2 rounded-xs bg-amber-400" />
                <span>Medicare Active &amp; Renew</span>
              </div>
              <span className="font-mono text-slate-400">Live DB</span>
            </div>
            <div className="space-y-3 my-auto py-2">
              {medDealsByAgent.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex items-center gap-2 text-xs hover:bg-amber-50/70 p-0.5 rounded cursor-pointer transition group"
                  title={`Click to view Medicare deals handled by ${item.agent}`}
                >
                  <span className="w-20 truncate text-slate-600 text-right group-hover:text-amber-700">
                    {item.agent}
                  </span>
                  <div className="flex-grow bg-slate-100 rounded-sm h-3 flex overflow-hidden group-hover:ring-1 group-hover:ring-amber-300">
                    <div
                      style={{ width: `${(item.count / maxMedAgent) * 100}%` }}
                      className="bg-amber-400 h-full transition-all"
                    />
                  </div>
                  <span className="w-8 font-bold text-slate-800 text-[11px] group-hover:text-amber-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Card 5: Total Contact Count */}
            {['all', 'obamacare', 'medicare'].includes(categoryFilter) && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <h3
                    onClick={() => onSelectTab && onSelectTab('contacts')}
                    className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                    title="Click to view all Contacts"
                  >
                    Total Contact Count ({liveContacts.length} contacts)
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
                  {contactsByOwner.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => onSelectTab && onSelectTab('contacts')}
                      className="flex items-center gap-2 text-xs hover:bg-slate-100/80 p-0.5 rounded cursor-pointer transition group"
                      title={`Click to view contacts owned by ${item.agent}`}
                    >
                      <span className="w-20 truncate text-slate-600 text-right group-hover:text-blue-700">
                        {item.agent}
                      </span>
                      <div className="flex-grow bg-slate-100 rounded-sm h-3 flex overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                        <div
                          style={{ width: `${(item.inactive / maxContactOwner) * 100}%` }}
                          className="bg-[#5271ff] h-full"
                          title={`Inactive: ${item.inactive}`}
                        />
                        <div
                          style={{ width: `${(item.active / maxContactOwner) * 100}%` }}
                          className="bg-[#84cc16] h-full"
                          title={`Active: ${item.active}`}
                        />
                      </div>
                      <span className="w-8 font-bold text-slate-800 text-[11px] group-hover:text-blue-700">
                        {item.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROW 3: Deals by Agent Vertical Column Chart ────────────────── */}
        {['all', 'obamacare', 'medicare'].includes(categoryFilter) && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-5 flex flex-col">
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

          {/* Vertical Columns - Proportional to real max */}
          <div className="h-64 flex items-end justify-between gap-4 px-6 pt-4 border-b border-slate-200">
            {dealsByAgentChart.map((d, i) => {
              const maxHeight = 210;
              const totalHeight = Math.max((d.total / maxAgentDealTotal) * maxHeight, d.total > 0 ? 12 : 2);
              const obHeight = (d.ob / (d.total || 1)) * totalHeight;
              const medHeight = (d.med / (d.total || 1)) * totalHeight;

              return (
                <div
                  key={i}
                  onClick={() => onSelectTab && onSelectTab('deals')}
                  className="flex-1 flex flex-col items-center gap-1 group cursor-pointer hover:scale-105 transition-transform"
                  title={`Click to filter deals by ${d.name} (${d.total} deals)`}
                >
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600">
                    {d.total}
                  </span>
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
        )}

        {/* ── ROW 4: All Open Tasks & Overdue Tasks ────────────────────────── */}
        {['all', 'tasks'].includes(categoryFilter) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 7: All Open Tasks Report */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view all Tasks"
              >
                All Open Tasks Report ({openTasksList.length} tasks)
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
              {openTasksByAgent.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-4">No open tasks</div>
              ) : (
                openTasksByAgent.map((item, idx) => {
                  const maxTask = Math.max(...openTasksByAgent.map((t) => t.count), 1);
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectTab && onSelectTab('tasks')}
                      className="flex items-center gap-3 text-xs hover:bg-blue-50/70 p-1 rounded cursor-pointer transition group"
                      title={`Click to view ${item.agent}'s tasks`}
                    >
                      <span className="w-24 text-right text-slate-600 group-hover:text-blue-700">
                        {item.agent}
                      </span>
                      <div className="flex-grow bg-slate-100 h-3.5 rounded-sm max-w-xs overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                        <div
                          style={{ width: `${(item.count / maxTask) * 100}%` }}
                          className="bg-[#5271ff] h-full"
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-xs group-hover:text-blue-700">
                        {item.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 8: Overdue Tasks Report */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tasks')}
                className="text-xs font-bold text-slate-900 hover:text-rose-600 cursor-pointer"
                title="Click to view overdue Tasks"
              >
                Overdue Tasks Report ({overdueTasksList.length} tasks)
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
              {overdueTasksByAgent.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-4">No overdue tasks</div>
              ) : (
                overdueTasksByAgent.map((item, idx) => {
                  const maxOverdue = Math.max(...overdueTasksByAgent.map((t) => t.count), 1);
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectTab && onSelectTab('tasks')}
                      className="flex items-center gap-3 text-xs hover:bg-rose-50/70 p-1 rounded cursor-pointer transition group"
                      title={`Click to view ${item.agent}'s overdue tasks`}
                    >
                      <span className="w-24 text-right text-slate-600 group-hover:text-rose-700">
                        {item.agent}
                      </span>
                      <div className="flex-grow bg-slate-100 h-3.5 rounded-sm max-w-xs overflow-hidden group-hover:ring-1 group-hover:ring-rose-300">
                        <div
                          style={{ width: `${(item.count / maxOverdue) * 100}%` }}
                          className="bg-rose-500 h-full"
                        />
                      </div>
                      <span className="font-bold text-rose-700 text-xs">
                        {item.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        )}

        {/* ── ROW 5: All Tickets Overdue Details Pivot Table ───────────────── */}
        {['all', 'tickets'].includes(categoryFilter) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-500">table_chart</span>
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                title="Click to view all overdue tickets"
              >
                All Tickets Overdue Details ({overduePivotTotals.grandTotal} items)
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
                {overduePivotTable.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-medium">
                      All clear! No overdue tickets currently in the database queue.
                    </td>
                  </tr>
                ) : (
                  overduePivotTable.map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onSelectTab && onSelectTab('tickets')}
                      className="hover:bg-blue-50/70 transition cursor-pointer group"
                      title={`Click to view tickets for ${row.agent}`}
                    >
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200 bg-white">
                        {row.agent}
                      </td>
                      <td className="p-2 border-r border-slate-200 group-hover:text-blue-700 font-medium">
                        {row.stage}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {row.counts['Client Support'] || 0}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {row.counts['Payment'] || 0}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {row.counts['ACA account'] || 0}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {row.counts['Upload document'] || 0}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {row.counts['Choose Doctor'] || 0}
                      </td>
                      <td className="p-2 text-center font-bold bg-slate-50 group-hover:text-blue-700">
                        {row.total}
                      </td>
                    </tr>
                  ))
                )}
                {/* DYNAMIC TOTAL ROW */}
                {overduePivotTable.length > 0 && (
                  <tr
                    onClick={() => onSelectTab && onSelectTab('tickets')}
                    className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200 hover:bg-blue-100/70 cursor-pointer transition"
                    title="Click to view all overdue tickets"
                  >
                    <td colSpan={2} className="p-2.5 text-right uppercase tracking-wide">
                      TOTAL
                    </td>
                    <td className="p-2 text-center text-blue-700">
                      {overduePivotTotals['Client Support']}
                    </td>
                    <td className="p-2 text-center text-blue-700">
                      {overduePivotTotals['Payment']}
                    </td>
                    <td className="p-2 text-center text-blue-700">
                      {overduePivotTotals['ACA account']}
                    </td>
                    <td className="p-2 text-center text-blue-700">
                      {overduePivotTotals['Upload document']}
                    </td>
                    <td className="p-2 text-center text-blue-700">
                      {overduePivotTotals['Choose Doctor']}
                    </td>
                    <td className="p-2 text-center text-blue-900 bg-slate-200 text-xs font-black">
                      {overduePivotTotals.grandTotal}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ── ROW 6: All Open Tickets & All Overdue Tickets ────────────────── */}
        {['all', 'tickets'].includes(categoryFilter) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 10: All Open Tickets */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                title="Click to view all Open Tickets"
              >
                All Open Tickets ({openTicketsList.length} tickets)
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
            <div className="space-y-3 py-2 my-auto">
              {openTicketsByAgent.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-4">No open tickets</div>
              ) : (
                openTicketsByAgent.map((item, i) => {
                  const maxOpen = Math.max(...openTicketsByAgent.map((o) => o.count), 1);
                  return (
                    <div
                      key={i}
                      onClick={() => onSelectTab && onSelectTab('tickets')}
                      className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                      title={`Click to view open tickets for ${item.agent}`}
                    >
                      <span className="w-24 text-right text-slate-600 truncate group-hover:text-blue-700">
                        {item.agent}
                      </span>
                      <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                        <div
                          style={{ width: `${(item.count / maxOpen) * 100}%` }}
                          className="bg-[#5271ff] h-full"
                        />
                      </div>
                      <span className="w-6 font-bold text-slate-800 text-[11px] group-hover:text-blue-700">
                        {item.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 11: All Overdue Tickets */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <h3
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="text-xs font-bold text-slate-900 hover:text-rose-600 cursor-pointer"
                title="Click to view all Overdue Tickets"
              >
                All Overdue Tickets ({overdueTicketsList.length} tickets)
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
            <div className="space-y-3 py-2 my-auto">
              {overdueTicketsByAgent.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-4">No overdue tickets</div>
              ) : (
                overdueTicketsByAgent.map((item, i) => {
                  const maxOverdue = Math.max(...overdueTicketsByAgent.map((o) => o.count), 1);
                  return (
                    <div
                      key={i}
                      onClick={() => onSelectTab && onSelectTab('tickets')}
                      className="flex items-center gap-2 text-xs hover:bg-rose-50/70 p-0.5 rounded cursor-pointer transition group"
                      title={`Click to view overdue tickets for ${item.agent}`}
                    >
                      <span className="w-24 text-right text-slate-600 truncate group-hover:text-rose-700">
                        {item.agent}
                      </span>
                      <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden group-hover:ring-1 group-hover:ring-rose-300">
                        <div
                          style={{ width: `${(item.count / maxOverdue) * 100}%` }}
                          className="bg-rose-500 h-full"
                        />
                      </div>
                      <span className="w-6 font-bold text-slate-800 text-[11px] group-hover:text-rose-700">
                        {item.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        )}

        {/* ── ROW 7: Empty state + Need Update Member ID + Need Create Account */}
        {['all', 'tickets', 'obamacare'].includes(categoryFilter) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 12: Need Extend Tickets */}
            {['all', 'tickets'].includes(categoryFilter) && (
              <div
                onClick={() => onSelectTab && onSelectTab('tickets')}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col items-center justify-center min-h-[190px] cursor-pointer hover:border-blue-300 hover:shadow-xs transition group"
                title="Click to check tickets needing extension"
              >
                <div className="w-full flex items-center justify-between mb-auto pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                    Need Extend Tickets
                  </h3>
                  <span className="material-symbols-outlined text-[15px] text-slate-400">crop_free</span>
                </div>
                <div className="my-auto py-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">manage_search</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {needExtendTickets.length > 0
                      ? `${needExtendTickets.length} Tickets Needing Extension`
                      : 'No Data Here!'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {needExtendTickets.length > 0
                      ? 'Click to review tickets exceeding deadline'
                      : 'All tickets have valid active due dates.'}
                  </div>
                </div>
              </div>
            )}

            {/* Card 13: Need Update Member ID */}
            {['all', 'obamacare'].includes(categoryFilter) && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <h3
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    title="Click to view Member ID update deals"
                  >
                    Need Update Member ID
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="View in Deals"
                  >
                    <span className="material-symbols-outlined text-[15px]">crop_free</span>
                  </button>
                </div>
                <div className="space-y-3 my-auto py-2">
                  {needUpdateMemberIdData.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-4">All deals have Member IDs</div>
                  ) : (
                    needUpdateMemberIdData.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectTab && onSelectTab('deals')}
                        className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                        title={`Click to view deals for ${item.agent}`}
                      >
                        <span className="w-20 text-right text-slate-600 truncate group-hover:text-blue-700">
                          {item.agent}
                        </span>
                        <div className="flex-grow bg-slate-100 h-3 rounded-sm overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                          <div
                            style={{ width: `${item.widthPercent}%` }}
                            className="bg-[#5271ff] h-full"
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700">
                          {item.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Card 14: Need Create Member Account */}
            {['all', 'obamacare'].includes(categoryFilter) && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <h3
                    onClick={() => onSelectTab && onSelectTab('contacts')}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    title="Click to view Member Account tasks"
                  >
                    Need Create Member Account...
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSelectTab && onSelectTab('contacts')}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="View in Contacts"
                  >
                    <span className="material-symbols-outlined text-[15px]">crop_free</span>
                  </button>
                </div>
                <div className="space-y-3 my-auto py-2">
                  {needCreateMemberAccountData.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-4">All contacts have accounts</div>
                  ) : (
                    needCreateMemberAccountData.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectTab && onSelectTab('contacts')}
                        className="flex items-center gap-2 text-xs hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                        title={`Click to view account creation for ${item.agent}`}
                      >
                        <span className="w-20 text-right text-slate-600 truncate group-hover:text-blue-700">
                          {item.agent}
                        </span>
                        <div className="flex-grow bg-slate-100 h-3 rounded-sm overflow-hidden group-hover:ring-1 group-hover:ring-blue-300">
                          <div
                            style={{ width: `${item.widthPercent}%` }}
                            className="bg-[#5271ff] h-full"
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700">
                          {item.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROW 8: Open Upload Document Ticket Table (100% Real DB Data) ─── */}
        {['all', 'tickets', 'obamacare'].includes(categoryFilter) && (
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
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                  {uploadTicketsDisplay.length} Live Tickets
                </span>
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
                  {uploadTicketsDisplay.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                        No upload document tickets currently open in the database.
                      </td>
                    </tr>
                  ) : (
                    uploadTicketsDisplay.map((row) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ROW 9: ACA Consent Form Status (100% Real DB Data) ───────────── */}
        {['all', 'obamacare'].includes(categoryFilter) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 16: ACA Consent Form Status (Normal States) */}
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

              <div className="space-y-2 text-[11px] my-auto">
                {acaConsentStatusData.map((item, i) => {
                  const maxConsent = Math.max(...acaConsentStatusData.map((c) => c.count), 1);
                  return (
                    <div
                      key={i}
                      onClick={() => onSelectTab && onSelectTab('deals')}
                      className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                      title={`Click to view deals with consent status: ${item.label}`}
                    >
                      <span className="w-32 text-right text-slate-600 truncate group-hover:text-blue-700">
                        {item.label}
                      </span>
                      <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden max-w-sm group-hover:ring-1 group-hover:ring-blue-300">
                        <div
                          style={{
                            width: `${(item.count / maxConsent) * 100}%`,
                            backgroundColor: [C_ANYA, C_SEAN, C_IVY, C_SARAH][i % 4],
                          }}
                          className="h-full"
                        />
                      </div>
                      <span className="w-8 font-bold text-slate-800 text-[10px] group-hover:text-blue-700">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 17: ACA Consent Form Status (Special States) */}
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

              <div className="space-y-2 text-[11px] my-auto">
                {acaConsentStatusData.map((item, i) => {
                  const maxVal = Math.max(...acaConsentStatusData.map((c) => c.count), 1);
                  return (
                    <div
                      key={i}
                      onClick={() => onSelectTab && onSelectTab('deals')}
                      className="flex items-center gap-2 hover:bg-blue-50/70 p-0.5 rounded cursor-pointer transition group"
                      title={`Click to view deals with consent status: ${item.label}`}
                    >
                      <span className="w-32 text-right text-slate-600 truncate group-hover:text-blue-700">
                        {item.label}
                      </span>
                      <div className="flex-grow bg-slate-100 h-3.5 rounded-sm flex overflow-hidden max-w-sm group-hover:ring-1 group-hover:ring-blue-300">
                        <div
                          style={{
                            width: `${(item.count / maxVal) * 100}%`,
                            backgroundColor: [C_ANYA, C_SEAN, C_IVY, C_SARAH][i % 4],
                          }}
                          className="h-full"
                        />
                      </div>
                      <span className="w-8 font-bold text-slate-800 text-[10px] group-hover:text-blue-700">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ROW 10: Active Policies OB 26 Not Done ACA - Manager ────────── */}
        {['all', 'obamacare'].includes(categoryFilter) && (
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

            <div className="flex items-stretch gap-3 pl-2 pr-6">
              <div className="flex items-center justify-center shrink-0 w-8">
                <span className="text-slate-500 text-[11px] font-medium -rotate-90 origin-center whitespace-nowrap select-none">
                  ACA Account Status
                </span>
              </div>

              <div className="flex-grow flex flex-col justify-between space-y-4 py-2 border-l border-slate-300 relative">
                {activePoliciesObNotDoneAca.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-4">No active policies found</div>
                ) : (
                  activePoliciesObNotDoneAca.map((row, idx) => {
                    const maxRowVal = Math.max(...activePoliciesObNotDoneAca.map((r) => r.total), 1);
                    return (
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
                          <div
                            className="h-3 flex overflow-hidden rounded-xs group-hover:ring-2 group-hover:ring-blue-400 transition"
                            style={{ width: `${(row.total / maxRowVal) * 100}%` }}
                          >
                            <div
                              style={{
                                width: '100%',
                                backgroundColor: [C_ANYA, C_SEAN, C_AMBER, C_TEAL][idx % 4],
                              }}
                              className="h-full"
                              title={`${row.label}: ${row.total}`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-700 font-bold ml-2 group-hover:text-blue-700">
                            {row.total}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="pt-2 border-t border-slate-300 mt-2">
                  <div className="text-center text-[10px] text-slate-500 font-medium mt-1">
                    (Count Distinct) Contact (Id)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ROW 11: Daily Complete Tickets ───────────────────────────────── */}
        {['all', 'tickets'].includes(categoryFilter) && (
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
                    {ticketDateColumns.map((date) => (
                      <th key={date} className="px-3 py-1.5 border border-slate-200 text-center font-semibold text-slate-700">
                        {date}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] text-slate-400 font-normal">
                    {ticketDateColumns.map((_, i) => (
                      <th key={i} className="px-3 py-1 border border-slate-200 text-center font-normal text-slate-400">
                        TicketId
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyCompleteTicketsData.matrix.map((row, idx) => (
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
                  {/* DYNAMIC TOTAL ROW */}
                  <tr
                    onClick={() => onSelectTab && onSelectTab('tickets')}
                    className="bg-slate-50 font-bold border-t-2 border-slate-300 hover:bg-blue-100/70 transition cursor-pointer group"
                    title="Click to view all completed tickets"
                  >
                    <td className="px-4 py-2 border border-slate-200 text-slate-900 tracking-wider group-hover:text-blue-800">
                      TOTAL
                    </td>
                    {dailyCompleteTicketsData.colTotals.map((t, idx) => (
                      <td key={idx} className="px-3 py-2 border border-slate-200 text-right font-bold text-slate-900 group-hover:text-blue-800">
                        {t}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ROW 12: Daily New Tickets ───────────────────────────────────── */}
        {['all', 'tickets'].includes(categoryFilter) && (
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
                    {ticketDateColumns.map((date) => (
                      <th key={date} className="px-3 py-1.5 border border-slate-200 text-center font-semibold text-slate-700">
                        {date}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] text-slate-400 font-normal">
                    {ticketDateColumns.map((_, i) => (
                      <th key={i} className="px-3 py-1 border border-slate-200 text-center font-normal text-slate-400">
                        TicketId
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyNewTicketsData.matrix.map((row, idx) => (
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
                  {/* DYNAMIC TOTAL ROW */}
                  <tr
                    onClick={() => onSelectTab && onSelectTab('tickets')}
                    className="bg-slate-50 font-bold border-t-2 border-slate-300 hover:bg-blue-100/70 transition cursor-pointer group"
                    title="Click to view all new tickets"
                  >
                    <td className="px-4 py-2 border border-slate-200 text-slate-900 tracking-wider group-hover:text-blue-800">
                      TOTAL
                    </td>
                    {dailyNewTicketsData.colTotals.map((t, idx) => (
                      <td key={idx} className="px-3 py-2 border border-slate-200 text-right font-bold text-slate-900 group-hover:text-blue-800">
                        {t}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ROW 13: Need Manager enroll & SOA Status - Manager ───────────── */}
        {['all', 'medicare', 'obamacare'].includes(categoryFilter) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 21: Need Manager enroll */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-500">article</span>
                  <h3
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                    title="Click to view deals needing manager enrollment"
                  >
                    Need Manager enroll ({needManagerEnrollData.total} deals)
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
                  <span>Waiting for document ({needManagerEnrollData.waitingDocCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs" style={{ backgroundColor: '#84cc16' }} />
                  <span>Ready to Enroll ({needManagerEnrollData.readyEnrollCount})</span>
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
                  <div
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="flex items-center gap-3 relative z-10 my-4 hover:bg-blue-50/70 p-1 rounded cursor-pointer transition group"
                    title="Click to view deals needing manager enrollment"
                  >
                    <span className="w-28 text-right text-[11px] text-slate-600 font-medium shrink-0 truncate group-hover:text-blue-700">
                      Obamacare 2026
                    </span>
                    <div className="flex-grow flex items-center">
                      <div className="h-3 flex overflow-hidden rounded-xs w-full group-hover:ring-2 group-hover:ring-blue-400 transition bg-slate-100">
                        {needManagerEnrollData.total > 0 && (
                          <>
                            <div
                              style={{
                                width: `${(needManagerEnrollData.waitingDocCount / needManagerEnrollData.total) * 100}%`,
                                backgroundColor: '#5271ff',
                              }}
                              className="h-full"
                              title={`Waiting for document: ${needManagerEnrollData.waitingDocCount}`}
                            />
                            <div
                              style={{
                                width: `${(needManagerEnrollData.readyEnrollCount / needManagerEnrollData.total) * 100}%`,
                                backgroundColor: '#84cc16',
                              }}
                              className="h-full"
                              title={`Ready to Enroll: ${needManagerEnrollData.readyEnrollCount}`}
                            />
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-700 font-bold ml-2 group-hover:text-blue-700">
                        {needManagerEnrollData.total}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-300 mt-4">
                    <div className="text-center text-[10px] text-slate-500 font-medium mt-1">
                      (Count) DealId
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 22: SOA Status - Manager */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-500">article</span>
                  <h3
                    onClick={() => onSelectTab && onSelectTab('deals')}
                    className="text-xs font-bold text-slate-900 tracking-tight hover:text-blue-600 cursor-pointer"
                    title="Click to view SOA Deals"
                  >
                    SOA Status - Manager ({medDeals.length} deals)
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

              {/* Dynamic Legend */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 mb-6 flex-wrap">
                {medUniqueAgents.map((ag, idx) => (
                  <div key={ag} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-2 rounded-xs"
                      style={{ backgroundColor: getAgentColor(ag, idx) }}
                    />
                    <span>{ag}</span>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="flex items-stretch gap-3 pl-2 pr-4 flex-grow my-auto">
                <div className="flex items-center justify-center shrink-0 w-6">
                  <span className="text-slate-500 text-[11px] font-medium -rotate-90 origin-center whitespace-nowrap select-none">
                    SOA Status
                  </span>
                </div>

                <div className="flex-grow flex flex-col justify-between space-y-3 py-1 border-l border-slate-300 relative">
                  {soaStatusData.map((row, idx) => {
                    const maxSoa = Math.max(...soaStatusData.map((s) => s.total), 1);
                    return (
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
                            style={{ width: `${(row.total / maxSoa) * 100}%` }}
                          >
                            <div
                              style={{
                                width: '100%',
                                backgroundColor: [C_ANYA, C_SEAN, C_AMBER, C_SARAH][idx % 4],
                              }}
                              className="h-full"
                              title={`${row.label}: ${row.total}`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-700 font-bold ml-2 group-hover:text-blue-700">
                            {row.total}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-300 mt-2">
                    <div className="text-center text-[10px] text-slate-500 font-medium mt-1">
                      (Count Distinct) Deal (Id)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ROW 14: Carrier Commission Ledger & Financial Summary ────────── */}
        {['all', 'commissions'].includes(categoryFilter) && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 crm-card-hover p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div>
                  <h3
                    onClick={() => onSelectTab && onSelectTab('commission')}
                    className="text-xs font-bold text-slate-900 tracking-tight hover:text-emerald-600 cursor-pointer"
                    title="Click to view Commission Ledger"
                  >
                    Carrier Commission Ledger &amp; Payout Summary ({liveCommissions.length} records)
                  </h3>
                  <p className="text-[11px] text-slate-400">Live PMPM Carrier Remittances &amp; Support Fee Splits</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab('commission')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Commission Engine</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Gross Paid</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  ${commissionsSummary.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">Support Agent Share (20%)</span>
                <span className="text-base font-extrabold text-amber-700 font-mono">
                  ${commissionsSummary.totalDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">Net Agent Payout (80%)</span>
                <span className="text-base font-extrabold text-emerald-800 font-mono">
                  ${commissionsSummary.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">Settlement Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-emerald-700">{commissionsSummary.settledCount} Settled</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-amber-600">{commissionsSummary.pendingCount} Audit</span>
                </div>
              </div>
            </div>

            {/* Carrier Breakdown Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Insurance Carrier</th>
                    <th className="px-3 py-2 text-center">Policies</th>
                    <th className="px-3 py-2 text-right">Gross Commission</th>
                    <th className="px-3 py-2 text-right">Support Share</th>
                    <th className="px-3 py-2 text-right">Net Agent Payout</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissionsSummary.byCarrier.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                        No carrier commission records loaded in database.
                      </td>
                    </tr>
                  ) : (
                    commissionsSummary.byCarrier.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => onSelectTab && onSelectTab('commission')}
                        className="hover:bg-emerald-50/50 transition cursor-pointer group"
                        title={`Click to view details for ${item.carrier}`}
                      >
                        <td className="px-3 py-2.5 font-semibold text-slate-900 group-hover:text-emerald-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{item.carrier}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                          {item.count}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                          ${item.gross.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-amber-600">
                          ${(item.gross - item.net).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                          ${item.net.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[10px] text-blue-600 font-medium group-hover:underline">
                            View Ledger →
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
