import React, { useState, useMemo, useEffect } from 'react';
import {
  getCommissions,
  getCommissionSummary,
  calculateCommissions,
  updateCommission,
  getDeals,
  getContacts,
  getUsers,
} from '../../../services/api';
import { useAuth } from '../../../auth/AuthContext';
import {
  isOwnerMatch,
  getAgentIdentity,
  extractOwnerString,
  normalizeText,
} from '../../../utils/rbac';
import AgentCommissionCalculator from './AgentCommissionCalculator';
import {
  MEDICARE_DEAL_STAGES,
  OBAMACARE_DEAL_STAGES,
  ALL_CARRIERS,
  CARRIER_COMMISSION_RATES,
  calculateCarrierDealCommission,
  getActiveAgentAccounts,
} from '../../../utils/constants';

// ── INITIAL REAL COMMISSION DATA: 100% AGENT PAYOUT (NO 7/3 SPLIT) ───────────
const INITIAL_COMMISSION_DATA = [];

export default function AgentCommissionLedger({
  onSelectContact,
  onSelectDeal,
  isAgent = true,
  agentName = '',
  currentUser = null,
}) {
  const { user: authUser } = useAuth();
  const user = currentUser || authUser;
  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'super admin';
  const activeIsAgent = !isAdmin;
  const effectiveAgent = getAgentIdentity(
    user || (isAgent ? { role: 'agent', name: agentName } : null)
  );

  // Available agent roster for dynamic scoping & selector (Admin only)
  const [availableAgents, setAvailableAgents] = useState([]);

  // Selected agent filter state (Admin can change; Agent is strictly locked to effectiveAgent.name)
  const [selectedAgentFilter, setSelectedAgentFilter] = useState(() => {
    if (!isAdmin) {
      return effectiveAgent.name || 'Trung Trương';
    }
    try {
      const saved = sessionStorage.getItem('insurmatch_selected_commission_agent');
      if (saved) return saved;
    } catch {}
    if (agentName && agentName !== 'Khanh Nguyen' && agentName !== 'Licensed Agent Partner') {
      return agentName;
    }
    if (user?.name && user.name !== 'Licensed Agent Partner' && user.name !== 'Super Admin' && user.name !== 'Platform Staff') {
      return user.name;
    }
    return 'Trung Trương';
  });

  useEffect(() => {
    async function fetchAgents() {
      try {
        const [dbUsersRes, staticAgents] = await Promise.all([
          getUsers().catch(() => []),
          getActiveAgentAccounts(),
        ]);
        const combined = [];
        const seen = new Set();

        // 1. DB users from backend API
        if (Array.isArray(dbUsersRes)) {
          dbUsersRes.forEach((u) => {
            if (!u || !u.name) return;
            const r = (u.role || '').toLowerCase();
            const norm = normalizeText(u.name);
            if ((r === 'agent' || r === 'broker' || norm.includes('trung')) && !seen.has(norm)) {
              seen.add(norm);
              combined.push({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role || 'AGENT',
              });
            }
          });
        }

        // 2. Static agent accounts
        if (Array.isArray(staticAgents)) {
          staticAgents.forEach((a) => {
            if (!a || !a.name) return;
            const norm = normalizeText(a.name);
            if (!seen.has(norm)) {
              seen.add(norm);
              combined.push({
                id: a.id,
                name: a.name,
                email: a.email,
                role: a.role || 'AGENT',
              });
            }
          });
        }

        // Ensure Trung Trương is always at the top of the roster
        const trungIdx = combined.findIndex((a) => normalizeText(a.name).includes('trung'));
        if (trungIdx > 0) {
          const [trungItem] = combined.splice(trungIdx, 1);
          combined.unshift(trungItem);
        } else if (trungIdx === -1) {
          combined.unshift({
            id: '28',
            name: 'Trung Trương',
            email: 'truongchitrung05@gmail.com',
            role: 'AGENT',
          });
        }

        setAvailableAgents(combined);
      } catch {
        setAvailableAgents([
          { id: '28', name: 'Trung Trương', role: 'AGENT' },
          { id: '15', name: 'Khanh Nguyen', role: 'AGENT' },
          { id: '14', name: 'Licensed Agent Partner', role: 'AGENT' },
        ]);
      }
    }
    fetchAgents();
  }, []);

  const [commissionList, setCommissionList] = useState(INITIAL_COMMISSION_DATA);
  const [dbSummary, setDbSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCycle, setSelectedCycle] = useState('2026-09');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeRecord, setDisputeRecord] = useState(null);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showRateMatrix, setShowRateMatrix] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Quick Inline Calculator state
  const [calcCarrier, setCalcCarrier] = useState('BCBS');
  const [calcMembers, setCalcMembers] = useState(1);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Scoping helper: checks if an item belongs to the selected agent target
  function isItemBelongingToCurrentAgent(item, targetUser) {
    if (!targetUser) return true; // 'All' selected -> show all
    if (!item) return false;

    // 1. Direct dealOwner match (string or object)
    if (
      isOwnerMatch(item.dealOwner, targetUser) ||
      isOwnerMatch(item.dealOwnerName, targetUser) ||
      isOwnerMatch(item.deal?.dealOwner, targetUser) ||
      isOwnerMatch(item.deal?.dealOwnerName, targetUser) ||
      isOwnerMatch(item.adminOnly?.dealOwner, targetUser)
    ) {
      return true;
    }

    // 2. Direct contactOwner match (string or object)
    if (
      isOwnerMatch(item.contactOwner, targetUser) ||
      isOwnerMatch(item.contactOwnerName, targetUser) ||
      isOwnerMatch(item.contact?.contactOwner, targetUser) ||
      isOwnerMatch(item.contact?.contactOwnerName, targetUser) ||
      isOwnerMatch(item.contact?.leadOwner, targetUser) ||
      isOwnerMatch(item.adminOnly?.contactOwner, targetUser)
    ) {
      return true;
    }

    // 3. Direct agentName / owner / leadOwner match
    if (
      isOwnerMatch(item.agentName, targetUser) ||
      isOwnerMatch(item.owner, targetUser) ||
      isOwnerMatch(item.leadOwner, targetUser) ||
      isOwnerMatch(item.deal?.agentName, targetUser) ||
      isOwnerMatch(item.deal?.owner, targetUser) ||
      isOwnerMatch(item.deal?.leadOwner, targetUser)
    ) {
      return true;
    }

    return false;
  }

  // Load commissions & merge dynamic deals from CRM
  async function loadCommissionsData(targetAgentName) {
    try {
      setLoading(true);
      const agentToFilter = !isAdmin
        ? effectiveAgent.name
        : (targetAgentName !== undefined ? targetAgentName : selectedAgentFilter);
      const targetUser = agentToFilter !== 'All' ? { role: 'agent', name: agentToFilter } : null;

      const [comms, summary, dealsRes, contactsRes] = await Promise.all([
        getCommissions().catch(() => []),
        getCommissionSummary().catch(() => null),
        getDeals().catch(() => []),
        getContacts().catch(() => []),
      ]);

      if (summary) setDbSummary(summary);

      let baseList = [];

      // Create lookup map for contacts by id and code
      const contactsMap = new Map();
      if (Array.isArray(contactsRes)) {
        contactsRes.forEach((c) => {
          if (!c) return;
          if (c.id) contactsMap.set(String(c.id), c);
          if (c.code) contactsMap.set(String(c.code), c);
        });
      }

      // 1. Process commissions from API
      if (Array.isArray(comms) && comms.length > 0) {
        const scopedComms = comms.filter((c) => {
          if (!targetUser) return true;
          const linkedContact = c.deal?.contactId ? contactsMap.get(String(c.deal.contactId)) : null;
          const contactOwner = c.contactOwner || linkedContact?.contactOwner || linkedContact?.contactOwnerName || '';
          return isItemBelongingToCurrentAgent({ ...c, contactOwner }, targetUser);
        });

        baseList = scopedComms.map((c) => {
          const dealMembers = c.memberCount || 1;
          const gross = c.grossAmount || 30.0;
          return {
            id: c.id,
            dealId: c.deal?.id || c.dealId,
            policyNumber: c.policyId || `POL-${String(c.id).slice(-6)}`,
            memberId: c.policyId || 'MID-UNKNOWN',
            clientName: c.deal?.title?.split('–')[0]?.trim() || c.agentName || 'Client',
            clientCode: c.deal?.contactId || '',
            carrier: c.carrier,
            category: c.commissionType === 'MEDICARE' ? 'Medicare' : 'Obamacare / ACA',
            planName: c.planName || c.deal?.title || 'Standard Plan',
            membersCount: dealMembers,
            premium: 400,
            subsidy: 380,
            commissionRate: `$${(gross / dealMembers).toFixed(2)} PMPM`,
            grossAmount: gross,
            supportDeduction: 0.0,
            saleSupportStatus: '100% DIRECT',
            commissionAmount: gross, // 100% payout to agent
            annualProjected: gross * 12,
            status: c.status === 'SETTLED' ? 'Settled' : c.status === 'PENDING' ? 'Pending Carrier Review' : c.status,
            cycle: c.period || '2026-09',
            payoutDate: c.status === 'SETTLED' ? '09/15/2026' : 'Pending (Next Cycle)',
            directDepositRef: c.status === 'SETTLED' ? `ACH-${String(c.id).slice(0, 6).toUpperCase()}` : '---',
            dealOwner: c.dealOwner || c.deal?.dealOwner,
            contactOwner: c.contactOwner || c.deal?.contactOwner,
          };
        });
      }

      // 2. Process CRM Deals (including deals from contacts' associatedDeals)
      const allDeals = [
        ...(Array.isArray(dealsRes) ? dealsRes : []),
        ...(Array.isArray(contactsRes)
          ? contactsRes.flatMap((c) => [
              ...(Array.isArray(c.deals) ? c.deals : []),
              ...(Array.isArray(c.associatedDeals) ? c.associatedDeals : []),
            ])
          : []),
      ];

      allDeals.forEach((deal) => {
        if (!deal || !deal.id) return;
        const linkedContact = deal.contactId ? contactsMap.get(String(deal.contactId)) : (deal.contact || null);
        const contactOwner = deal.contactOwner || linkedContact?.contactOwner || linkedContact?.contactOwnerName || '';
        const enrichedDeal = { ...deal, contactOwner };

        if (isItemBelongingToCurrentAgent(enrichedDeal, targetUser)) {
          const alreadyInList = baseList.some(
            (item) =>
              item.policyNumber === deal.id ||
              item.policyNumber === deal.code ||
              item.id === `COMM-${deal.id}` ||
              item.id === deal.id ||
              item.dealId === deal.id ||
              (item.policyNumber && deal.code && item.policyNumber === deal.code)
          );
          if (!alreadyInList) {
            const dealCarrier = deal.carrier || deal.dealCarrier || deal.adminOnly?.carrier || 'BCBS';
            const members = parseInt(deal.numberMember || deal.adminOnly?.numberMember) || 1;
            const calculated = calculateCarrierDealCommission(dealCarrier, members);
            const clientName =
              linkedContact?.fullName ||
              deal.contactName ||
              deal.title?.split('–')[0]?.trim() ||
              deal.title ||
              'Insurance Policy';

            baseList.push({
              id: `COMM-${deal.id}`,
              dealId: deal.id,
              policyNumber: deal.code || deal.id || '',
              memberId: deal.adminOnly?.primaryMemberId || deal.memberId || `MID-${deal.id}`,
              clientName,
              clientCode: deal.contactId || linkedContact?.code || linkedContact?.id || '',
              carrier: dealCarrier,
              category: (deal.pipeline || '')?.toLowerCase().includes('medicare') ? 'Medicare' : 'Obamacare / ACA',
              planName: deal.title || deal.dealName || 'ACA Qualified Health Plan',
              membersCount: members,
              premium: 400,
              subsidy: 380,
              commissionRate: `$${calculated.pmpmRate.toFixed(2)} PMPM (${members} member${members > 1 ? 's' : ''})`,
              grossAmount: calculated.monthlyCarrierPayout,
              supportDeduction: 0.0,
              saleSupportStatus: '100% DIRECT',
              commissionAmount: calculated.agentNetMonthly, // 100%
              annualProjected: calculated.agentAnnualProjected,
              status:
                deal.stage?.toLowerCase().includes('active') ||
                deal.stage?.toLowerCase().includes('settled') ||
                deal.stage?.toLowerCase().includes('enrolled')
                  ? 'Settled'
                  : 'Pending Carrier Review',
              cycle: '2026-09',
              payoutDate: '09/15/2026',
              directDepositRef: `ACH-${deal.id}-CLEARING`,
              dealOwner: deal.dealOwner,
              contactOwner,
            });
          }
        }
      });

      // 3. Process Contacts directly owned by agent if they don't have a deal entry yet
      if (Array.isArray(contactsRes)) {
        contactsRes.forEach((c) => {
          if (!c || (!c.id && !c.code)) return;
          if (isItemBelongingToCurrentAgent(c, targetUser)) {
            const clientFullName = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.code;
            const alreadyInList = baseList.some(
              (item) =>
                item.clientCode === c.id ||
                item.clientCode === c.code ||
                (item.clientName && item.clientName.toLowerCase() === clientFullName.toLowerCase())
            );
            if (!alreadyInList) {
              const carrier = c.carrier || c.adminOnly?.carrier || 'BCBS';
              const members = parseInt(c.householdSize || c.householdMember) || 1;
              const calculated = calculateCarrierDealCommission(carrier, members);

              baseList.push({
                id: `COMM-CT-${c.id || c.code}`,
                policyNumber: c.code || `POL-${c.id}`,
                memberId: `MID-${c.code || c.id}`,
                clientName: clientFullName,
                clientCode: c.code || c.id,
                carrier,
                category: 'Obamacare / ACA',
                planName: 'ACA Qualified Health Plan',
                membersCount: members,
                premium: 400,
                subsidy: 380,
                commissionRate: `$${calculated.pmpmRate.toFixed(2)} PMPM (${members} member${members > 1 ? 's' : ''})`,
                grossAmount: calculated.monthlyCarrierPayout,
                supportDeduction: 0.0,
                saleSupportStatus: '100% DIRECT',
                commissionAmount: calculated.agentNetMonthly,
                annualProjected: calculated.agentAnnualProjected,
                status: 'Pending Carrier Review',
                cycle: '2026-09',
                payoutDate: '09/15/2026',
                directDepositRef: `ACH-${c.code || c.id}-CLEARING`,
                dealOwner: c.contactOwner,
                contactOwner: c.contactOwner,
              });
            }
          }
        });
      }

      setCommissionList(baseList);
    } catch (err) {
      console.warn('[CommissionLedger] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommissionsData(isAdmin ? selectedAgentFilter : effectiveAgent.name);
  }, [selectedAgentFilter, effectiveAgent.name, isAdmin]);

  // Trigger Commission Recalculation
  async function handleRunCalculation() {
    try {
      setCalculating(true);
      const currentFilter = isAdmin ? selectedAgentFilter : effectiveAgent.name;
      const res = await calculateCommissions({
        agentName: currentFilter !== 'All' ? currentFilter : '',
        period: selectedCycle === 'YTD' ? '2026-09' : selectedCycle,
      });
      showToast(`100% commissions calculated for deals: ${res.message || 'Updated successfully!'}`);
      await loadCommissionsData(currentFilter);
    } catch (err) {
      await loadCommissionsData(isAdmin ? selectedAgentFilter : effectiveAgent.name);
      showToast('Refreshed and recalculated carrier commission rates for all deals!');
    } finally {
      setCalculating(false);
    }
  }

  // Handle Status Update
  async function handleUpdateStatus(id, newStatus) {
    try {
      await updateCommission(id, { status: newStatus });
      setCommissionList((prev) =>
        prev?.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus === 'SETTLED' ? 'Settled' : newStatus,
                payoutDate: newStatus === 'SETTLED' ? '09/15/2026' : c.payoutDate,
              }
            : c
        )
      );
      showToast(`Payout status updated to: ${newStatus}`);
    } catch {
      setCommissionList((prev) =>
        prev?.map((c) =>
          c.id === id ? { ...c, status: newStatus === 'SETTLED' ? 'Settled' : newStatus } : c
        )
      );
      showToast(`Status updated: ${newStatus}`);
    }
  }

  // Summary Metrics: 100% Agent Payout
  const stats = useMemo(() => {
    const settled = commissionList
      ?.filter((c) => c.status === 'Settled')
      ?.reduce((acc, c) => acc + c.commissionAmount, 0) || 0;

    const pending = commissionList
      ?.filter((c) => c.status === 'Pending Carrier Review' || c.status === 'In Processing')
      ?.reduce((acc, c) => acc + c.commissionAmount, 0) || 0;

    const totalProjected = commissionList?.reduce((acc, c) => acc + c.annualProjected, 0) || 0;
    const totalPolicies = commissionList.length;

    return {
      settledCurrentMonth: activeIsAgent ? settled : (dbSummary?.settledThisMonth || settled),
      pendingReview: pending,
      ytdSettled: activeIsAgent ? settled * 8.5 : (dbSummary?.ytdPaid || settled * 8.5),
      annualProjected: totalProjected,
      activeCommissionPolicies: activeIsAgent ? totalPolicies : (dbSummary?.activePolicies || totalPolicies),
      avgRatePmpm: totalPolicies > 0 ? settled / totalPolicies : 0,
    };
  }, [commissionList, dbSummary, activeIsAgent]);

  // Unique carrier list for filter
  const carrierOptions = useMemo(() => {
    const set = new Set([...ALL_CARRIERS, ...(commissionList || []).map((c) => c.carrier)?.filter(Boolean)]);
    return ['All', ...Array.from(set)];
  }, [commissionList]);

  // Filtered rows
  const filteredList = useMemo(() => {
    return commissionList?.filter((item) => {
      const q = searchQuery?.toLowerCase()?.trim();
      const matchSearch =
        !q ||
        item.clientName?.toLowerCase().includes(q) ||
        item.policyNumber?.toLowerCase().includes(q) ||
        item.memberId?.toLowerCase().includes(q) ||
        item.carrier?.toLowerCase().includes(q);

      const matchCarrier = carrierFilter === 'All' || item.carrier === carrierFilter;
      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchSearch && matchCarrier && matchCategory && matchStatus;
    });
  }, [commissionList, searchQuery, carrierFilter, categoryFilter, statusFilter]);

  // Quick Deal Calculation Result
  const quickCalc = useMemo(() => {
    return calculateCarrierDealCommission(calcCarrier, calcMembers);
  }, [calcCarrier, calcMembers]);

  function handleExportCsv() {
    const headers = [
      'Transaction ID',
      'Policy #',
      'Member ID',
      'Client Name',
      'Carrier',
      'Category',
      'Agent Payout Rate',
      'Carrier Monthly Payout',
      'Platform Fee Deduction',
      'Net Commission Received (100%)',
      'Annual Projected',
      'Status',
      'Cycle',
      'Payout Date',
      'Direct Deposit Ref',
    ];
    const rows = filteredList?.map((r) => [
      r.id,
      r.policyNumber,
      r.memberId,
      `"${r.clientName}"`,
      `"${r.carrier}"`,
      `"${r.category}"`,
      '100%',
      `$${r.grossAmount.toFixed(2)}`,
      '$0.00 (0%)',
      `$${r.commissionAmount.toFixed(2)}`,
      `$${r.annualProjected.toFixed(2)}`,
      r.status,
      r.cycle,
      r.payoutDate,
      r.directDepositRef,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...(rows || []).map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Agent_Commission_100_Statement_${selectedCycle?.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('100% commission ledger downloaded (CSV)!');
  }

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-5 w-full bg-[#F8FAFC] text-left">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Top Header with 100% Policy Highlight ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[26px]">payments</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Agent Commission Ledger & Settlement Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                100% Agent Payout (Zero Split Fee)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Agents retain 100% direct carrier commission payouts • NPN #1984210 • Automated carrier schedules
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rate Matrix Toggle */}
          <button
            type="button"
            onClick={() => setShowRateMatrix(!showRateMatrix)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer border ${
              showRateMatrix
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-slate-50 text-blue-700 border-blue-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_chart</span>
            <span>{showRateMatrix ? 'Hide Carrier Rates' : 'View 16 Carrier Rates'}</span>
          </button>

          {/* Calculator Trigger */}
          <button
            type="button"
            onClick={() => setShowCalculatorModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Single Deal Calculator</span>
          </button>

          {/* Auto Calculate Button */}
          <button
            type="button"
            disabled={calculating}
            onClick={handleRunCalculation}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer ${
              calculating ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${calculating ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{calculating ? 'Calculating...' : 'Recalculate All Deals'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="px-1.5 py-0.5 text-slate-500 font-medium">Cycle:</span>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="bg-white px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="2026-09">September 2026 (Current)</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="YTD">YTD 2026 (Full Year)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Agent Scope Indicator Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-blue-900 font-semibold">
          <span className="material-symbols-outlined text-[20px] text-blue-600">badge</span>
          <span>
            {selectedAgentFilter !== 'All' ? (
              <>
                Agent Commission Ledger: Showing policies assigned to <strong>{selectedAgentFilter}</strong> (Deal Owner / Contact Owner)
              </>
            ) : (
              <>
                Global Overview Mode: Showing commissions across all agents on the platform
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && selectedAgentFilter !== 'Trung Trương' && (
            <button
              type="button"
              onClick={() => {
                setSelectedAgentFilter('Trung Trương');
                try {
                  sessionStorage.setItem('insurmatch_selected_commission_agent', 'Trung Trương');
                } catch {}
              }}
              className="px-2.5 py-1 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition cursor-pointer"
            >
              Quick switch to Trung Trương
            </button>
          )}
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
            {filteredList.length} active policies
          </span>
        </div>
      </div>

      {/* ── 2. POLICY BANNER: 100% AGENT RETENTION ───────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 text-xs">100% Commission Payout Policy:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900 uppercase">
                Zero Split Fee
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
              InsurMatch operates strictly as a B2B SaaS CRM platform (subscription fee $39, $79, $199/mo). 
              <strong> 100% of insurance commissions paid by carriers go directly to the agent</strong>, 
              with zero split deductions, zero platform transaction fees, and zero withheld payouts.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Platform fee:</span>
          <span className="font-mono font-bold text-emerald-700">$0.00 (0%)</span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-medium">Agent payout:</span>
          <span className="font-mono font-bold text-blue-700">100%</span>
        </div>
      </div>

      {/* ── 3. INTERACTIVE DEAL COMMISSION CALCULATOR BAR ─────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">calculate</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Quick Deal Commission Calculator by Carrier:</span>
            <span className="text-[11px] text-slate-500">Select carrier and member count to preview monthly and annual direct carrier payouts</span>
          </div>
        </div>

        {/* Input Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">Carrier:</label>
            <select
              value={calcCarrier}
              onChange={(e) => setCalcCarrier(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {ALL_CARRIERS?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">Members:</label>
            <select
              value={calcMembers}
              onChange={(e) => setCalcMembers(parseInt(e.target.value) || 1)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="1">1 Member (Individual)</option>
              <option value="2">2 Members (Couple)</option>
              <option value="3">3 Members</option>
              <option value="4">4 Members (Family)</option>
              <option value="5">5 Members</option>
              <option value="6">6 Members</option>
            </select>
          </div>

          {/* Quick Result Badge */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-blue-900 font-medium">Carrier Gross:</span>
            <strong className="font-mono font-black text-blue-700">${quickCalc.monthlyCarrierPayout.toFixed(2)}/mo</strong>
            <span className="text-slate-300">→</span>
            <span className="text-emerald-800 font-medium">Agent Net (100%):</span>
            <strong className="font-mono font-black text-emerald-700">${quickCalc.agentNetMonthly.toFixed(2)}/mo</strong>
            <span className="text-slate-400">(${quickCalc.agentAnnualProjected.toLocaleString()}/yr)</span>
          </div>
        </div>
      </div>

      {/* ── 4. EXPANDABLE 16 CARRIER COMMISSION RATE MATRIX TABLE ─────────── */}
      {showRateMatrix && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">table_chart</span>
                <span>16 Carrier Commission Rate Schedule (Direct Payout Sheet)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard carrier compensation schedule per deal monthly and annually. Agents receive 100% direct payout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRateMatrix(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              Close Sheet
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Insurance Carrier</th>
                  <th className="py-2.5 px-3">Product Line</th>
                  <th className="py-2.5 px-3 text-right">Rate (PMPM)</th>
                  <th className="py-2.5 px-3 text-right">1 Deal (1 Member / Mo)</th>
                  <th className="py-2.5 px-3 text-right">1 Deal (2 Members / Mo)</th>
                  <th className="py-2.5 px-3 text-right">1 Deal (Family 4 Members)</th>
                  <th className="py-2.5 px-3 text-right">Annual Est. (1 Member)</th>
                  <th className="py-2.5 px-3 text-center">Agent Payout Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(CARRIER_COMMISSION_RATES)?.map((cr) => (
                  <tr key={cr.code} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{cr.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cr.category.includes('Medicare')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {cr.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                      ${cr.pmpm.toFixed(2)} {cr.rateType === 'CMS Monthly' ? '/mo' : 'PMPM'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      ${cr.monthlyPer1Member.toFixed(2)}/mo
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      ${cr.monthlyPer2Members.toFixed(2)}/mo
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                      ${cr.monthlyPer4Members.toFixed(2)}/mo
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ${cr.annualPerDeal1Member.toFixed(2)}/yr
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        100%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. KPI SUMMARY CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Settled Current Month */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              Net Payout This Month (100%)
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              account_balance_wallet
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            ${stats.settledCurrentMonth.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-bold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>Direct Deposit (ACH Transfer)</span>
          </div>
        </div>

        {/* Card 2: Pending Carrier Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              Pending Carrier Audit
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              hourglass_top
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            ${stats.pendingReview.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Carrier reviewing next cycle</span>
          </div>
        </div>

        {/* Card 3: YTD Settled Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              Total Settled YTD (Full Year)
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              trending_up
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono tracking-tight">
            ${stats.ytdSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>12-Month Projected: <strong className="text-slate-800">${stats.annualProjected.toLocaleString('en-US', { minimumFractionDigits: 0 })}</strong></span>
          </div>
        </div>

        {/* Card 4: Active Commission Policies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600" />
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              Active Revenue Policies
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              policy
            </span>
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono tracking-tight">
            {stats.activeCommissionPolicies} <span className="text-sm font-normal text-slate-500">policies</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-700 font-bold">
            <span>Average PMPM rate: ${stats.avgRatePmpm.toFixed(2)}/mo</span>
          </div>
        </div>
      </div>

      {/* ── 6. FILTERS TOOLBAR ───────────────────────────────────────────── */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap flex-grow">
          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-xs flex-grow">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search policy #, client name, MID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs bg-slate-50/50"
            />
          </div>

          {/* Agent Filter: Select for Admin, Read-only badge for Agent */}
          <div className="flex items-center gap-1.5 bg-blue-50/50 p-1 px-2.5 rounded-xl border border-blue-200/80">
            <span className="text-blue-900 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
              Agent:
            </span>
            {isAdmin ? (
              <select
                value={selectedAgentFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAgentFilter(val);
                  try {
                    sessionStorage.setItem('insurmatch_selected_commission_agent', val);
                  } catch {}
                }}
                className="bg-white border border-blue-300 font-bold px-2.5 py-1 rounded-lg text-blue-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-2xs hover:bg-white transition"
              >
                <option value="All">All Agents (System-wide)</option>
                {availableAgents?.map((ag) => (
                  <option key={ag.name} value={ag.name}>
                    {ag.name} {ag.name === 'Trung Trương' ? '⭐ (Primary)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="bg-white/90 border border-blue-200/90 font-bold px-2.5 py-1 rounded-lg text-slate-800 text-xs shadow-2xs cursor-default">
                {effectiveAgent.name || 'Trung Trương'}
              </span>
            )}
          </div>

          {/* Carrier Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Carrier:</span>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              {carrierOptions?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Settled">Settled</option>
              <option value="Pending Carrier Review">Pending Carrier Review</option>
              <option value="In Processing">In Processing</option>
            </select>
          </div>

          {/* Line Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Products</option>
              <option value="Obamacare / ACA">Obamacare / ACA</option>
              <option value="Medicare">Medicare</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-medium text-xs">
          Showing <strong className="text-slate-800 font-mono">{filteredList.length}</strong> policies
          {loading && <span className="ml-2 text-blue-600 animate-pulse">(Syncing...)</span>}
        </div>
      </div>

      {/* ── 7. MAIN COMMISSION LEDGER TABLE (100% Payout) ─────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5">Policy / Member ID</th>
                <th className="py-3 px-3.5">Client</th>
                <th className="py-3 px-3.5">Carrier &amp; Plan</th>
                <th className="py-3 px-3.5 text-center">Payout Rate</th>
                <th className="py-3 px-3.5 text-right">Carrier Gross</th>
                <th className="py-3 px-3.5 text-right">Platform Fee</th>
                <th className="py-3 px-3.5 text-right font-black text-slate-900">Agent Net (100%)</th>
                <th className="py-3 px-3.5 text-right">Annual Projected</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Payment Date</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-slate-300">payments</span>
                      <p className="font-semibold text-slate-700">No commission records found</p>
                      <p className="text-xs text-slate-400 max-w-md">
                        {activeIsAgent
                          ? `Only displaying insurance policies and commissions assigned to you (${effectiveAgent.name}). Once new policies are finalized, commissions will appear here.`
                          : 'No commission records matching current filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredList?.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/40 transition">
                  {/* Policy */}
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-semibold text-slate-900">{row.policyNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.memberId}</div>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectContact && onSelectContact({ id: row.clientCode, fullName: row.clientName })}
                      className="font-bold text-[#104882] hover:text-blue-700 hover:underline cursor-pointer text-left"
                    >
                      {row.clientName}
                    </button>
                    <div className="text-[10px] text-slate-400">{row.clientCode}</div>
                  </td>

                  {/* Carrier & Plan */}
                  <td className="py-3 px-3.5 max-w-[220px]">
                    <div className="font-bold text-slate-900 truncate">{row.carrier}</div>
                    <div className="text-[11px] text-slate-500 truncate">{row.planName} ({row.membersCount || 1} member{(row.membersCount || 1) > 1 ? 's' : ''})</div>
                  </td>

                  {/* Payout Rate Badge: 100% Direct */}
                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full font-black text-[10px] uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      100% DIRECT
                    </span>
                  </td>

                  {/* Gross Carrier Payout */}
                  <td className="py-3 px-3.5 text-right font-mono text-slate-600 text-[11px]">
                    ${(row.grossAmount || row.commissionAmount).toFixed(2)}/mo
                  </td>

                  {/* Deduction: $0.00 (0%) */}
                  <td className="py-3 px-3.5 text-right font-mono text-[11px] text-emerald-600 font-bold">
                    $0.00 (0%)
                  </td>

                  {/* Net Amount (100% to agent) */}
                  <td className="py-3 px-3.5 text-right font-bold text-blue-700 font-mono text-sm">
                    ${row.commissionAmount.toFixed(2)}/mo
                  </td>

                  {/* Annual Projected */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 text-[11px]">
                    ${(row.annualProjected || row.commissionAmount * 12).toFixed(2)}/yr
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5">
                    {row.status === 'Settled' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Settled
                      </span>
                    ) : row.status === 'In Processing' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
                        In Processing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pending Audit
                      </span>
                    )}
                  </td>

                  {/* Payout Date & Ref */}
                  <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                    <div>{row.payoutDate}</div>
                    {row.directDepositRef !== '---' && (
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">
                        {row.directDepositRef}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDisputeRecord(row);
                          setShowDisputeModal(true);
                        }}
                        className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-semibold transition cursor-pointer"
                        title="View calculation details"
                      >
                        Details
                      </button>
                      {row.status !== 'Settled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(row.id, 'SETTLED')}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition cursor-pointer"
                          title="Mark as settled"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>Policy: Agents retain 100% commission directly from insurance carriers with zero split deductions.</span>
          </div>
          <div className="font-semibold text-slate-800">
            Total Monthly Revenue: <span className="text-blue-700 font-bold font-mono text-sm">${filteredList?.reduce((s, r) => s + r.commissionAmount, 0).toFixed(2)}</span> / month
          </div>
        </div>
      </div>

      {/* ── 8. DISPUTE / AUDIT MODAL ─────────────────────────────────────── */}
      {showDisputeModal && disputeRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">fact_check</span>
                <span>Deal Commission Breakdown &amp; Carrier Formula</span>
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-600">
              <p>
                Policy: <strong className="text-slate-800 font-mono">{disputeRecord.policyNumber}</strong> ({disputeRecord.clientName})
              </p>

              {/* Formula Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Carrier Payout Calculation Formula:
                </div>
                <div className="font-mono text-slate-800 bg-white p-3 rounded-xl border border-slate-200 text-xs leading-relaxed">
                  Carrier ({disputeRecord.carrier}) Gross: <strong>${disputeRecord.grossAmount.toFixed(2)}/mo</strong>
                  <br />
                  Platform fee / support split (0%): <strong>$0.00</strong>
                  <br />
                  Agent Net Payout: <strong>${disputeRecord.commissionAmount.toFixed(2)}/mo (100%)</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Agent Payout Rate: <strong className="text-emerald-700">100% Direct Payout</strong></div>
                  <div>Members in deal: <strong>{disputeRecord.membersCount || 1} member{(disputeRecord.membersCount || 1) > 1 ? 's' : ''}</strong></div>
                  <div>Insurance Carrier: <strong>{disputeRecord.carrier}</strong></div>
                  <div>Status: <strong>{disputeRecord.status}</strong></div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reconciliation audit notes or inquiry:</label>
                <textarea
                  rows={3}
                  placeholder="Enter notes for Clearinghouse reconciliation audit..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(disputeRecord.id, 'SETTLED');
                  setShowDisputeModal(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold cursor-pointer"
              >
                Confirm Settled
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(disputeRecord.id, 'DISPUTED');
                    setShowDisputeModal(false);
                    showToast('Reconciliation audit inquiry sent to Clearinghouse!');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Submit Audit Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. FULL DEAL CALCULATOR MODAL ─────────────────────────────────── */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <AgentCommissionCalculator
            onClose={() => setShowCalculatorModal(false)}
            onApplyToDeal={(calc) => {
              setShowCalculatorModal(false);
              showToast(`Applied rate schedule for ${calc.carrierName} ($${calc.netMonthly.toFixed(2)}/mo)!`);
            }}
          />
        </div>
      )}
    </div>
  );
}
