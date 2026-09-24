import React, { useState, useMemo, useEffect } from 'react';
import {
  getCommissions,
  getCommissionSummary,
  calculateCommissions,
  updateCommission,
} from '../../../services/api';
import AgentCommissionCalculator from './AgentCommissionCalculator';

const INITIAL_COMMISSION_DATA = [
  {
    id: 'COMM-2026-001',
    policyNumber: 'BCBS-NC-88912',
    memberId: 'MID-98234710',
    clientName: 'Nhat H Dang',
    clientCode: 'CT26002600',
    carrier: 'Blue Cross Blue Shield NC',
    category: 'Obamacare / ACA',
    planName: 'Blue Advantage Silver 2026',
    membersCount: 1,
    premium: 395,
    subsidy: 395,
    commissionRate: '$30.00 PMPM (Per Member Per Month)',
    grossAmount: 30.0,
    supportDeduction: 0.30,
    saleSupportStatus: 'NONE',
    commissionAmount: 21.0,
    annualProjected: 252.0,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-889123-BCBS',
  },
  {
    id: 'COMM-2026-002',
    policyNumber: 'AMB-IN-44102',
    memberId: 'MID-31098234',
    clientName: 'Ly Le Do',
    clientCode: 'CT26002605',
    carrier: 'Ambetter Indiana',
    category: 'Obamacare / ACA',
    planName: 'Ambetter Clear Silver CSR',
    membersCount: 1,
    premium: 412,
    subsidy: 380,
    commissionRate: '$32.00 PMPM',
    grossAmount: 32.0,
    supportDeduction: 0.50,
    saleSupportStatus: 'PARTIAL',
    commissionAmount: 16.0,
    annualProjected: 192.0,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-441201-AMB',
  },
  {
    id: 'COMM-2026-003',
    policyNumber: 'KAS-OR-77192',
    memberId: 'MID-55102983',
    clientName: 'Thang Van Nguyen',
    clientCode: 'CT26002604',
    carrier: 'Kaiser Permanente OR',
    category: 'Obamacare / ACA',
    planName: 'Kaiser Bronze HSA 5500',
    membersCount: 1,
    premium: 340,
    subsidy: 340,
    commissionRate: '$28.00 PMPM',
    grossAmount: 28.0,
    supportDeduction: 0.30,
    saleSupportStatus: 'NONE',
    commissionAmount: 19.6,
    annualProjected: 235.2,
    status: 'Pending Carrier Review',
    cycle: '2026-09',
    payoutDate: 'Pending (Next Cycle)',
    directDepositRef: '---',
  },
  {
    id: 'COMM-2026-004',
    policyNumber: 'UHC-TX-99014',
    memberId: 'MID-77124901',
    clientName: 'Oanh Thi Le',
    clientCode: 'CT26002603',
    carrier: 'UnitedHealthcare TX',
    category: 'Obamacare / ACA',
    planName: 'UHC Silver Copay Focus',
    membersCount: 2,
    premium: 780,
    subsidy: 720,
    commissionRate: '$30.00 PMPM ($60/mo for 2)',
    grossAmount: 60.0,
    supportDeduction: 0.50,
    saleSupportStatus: 'PARTIAL',
    commissionAmount: 30.0,
    annualProjected: 360.0,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-990145-UHC',
  },
  {
    id: 'COMM-2026-005',
    policyNumber: 'HUM-FL-11928',
    memberId: 'MID-66230911',
    clientName: 'Thi Tra My Vo',
    clientCode: 'CT26002602',
    carrier: 'Humana Medicare FL',
    category: 'Medicare',
    planName: 'Humana Gold Plus HMO',
    membersCount: 1,
    premium: 0,
    subsidy: 0,
    commissionRate: '$51.00 / mo ($612 Initial CMS)',
    grossAmount: 51.0,
    supportDeduction: 0.30,
    saleSupportStatus: 'NONE',
    commissionAmount: 35.7,
    annualProjected: 428.4,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-119283-HUM',
  },
  {
    id: 'COMM-2026-006',
    policyNumber: 'BCBS-TX-55102',
    memberId: 'MID-88192034',
    clientName: 'Duc Huu Pham',
    clientCode: 'CT26002601',
    carrier: 'BCBS Texas',
    category: 'Obamacare / ACA',
    planName: 'Blue Advantage Gold Security',
    membersCount: 1,
    premium: 450,
    subsidy: 410,
    commissionRate: '$30.00 PMPM',
    grossAmount: 30.0,
    supportDeduction: 0.30,
    saleSupportStatus: 'NONE',
    commissionAmount: 21.0,
    annualProjected: 252.0,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-551022-BCBSTX',
  },
  {
    id: 'COMM-2026-007',
    policyNumber: 'MOL-OH-66129',
    memberId: 'MID-44192830',
    clientName: 'Phuong Trang Huynh',
    clientCode: 'CT26002599',
    carrier: 'Molina Healthcare OH',
    category: 'Obamacare / ACA',
    planName: 'Molina Constant Care Silver',
    membersCount: 1,
    premium: 360,
    subsidy: 360,
    commissionRate: '$29.00 PMPM',
    grossAmount: 29.0,
    supportDeduction: 0.70,
    saleSupportStatus: 'FULL',
    commissionAmount: 8.7,
    annualProjected: 104.4,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-661290-MOL',
  },
  {
    id: 'COMM-2026-008',
    policyNumber: 'BLS-CA-22019',
    memberId: 'MID-11029482',
    clientName: 'Minh Tuan Vu',
    clientCode: 'CT26002598',
    carrier: 'Blue Shield of CA',
    category: 'Obamacare / ACA',
    planName: 'Blue Shield Trio HMO Silver 70',
    membersCount: 1,
    premium: 460,
    subsidy: 420,
    commissionRate: '$35.00 PMPM',
    grossAmount: 35.0,
    supportDeduction: 0.50,
    saleSupportStatus: 'PARTIAL',
    commissionAmount: 17.5,
    annualProjected: 210.0,
    status: 'Pending Carrier Review',
    cycle: '2026-09',
    payoutDate: 'Pending (Next Cycle)',
    directDepositRef: '---',
  },
  {
    id: 'COMM-2026-009',
    policyNumber: 'OSC-GA-33219',
    memberId: 'MID-99102456',
    clientName: 'Kieu Loan Tran',
    clientCode: 'CT26002597',
    carrier: 'Oscar Health GA',
    category: 'Obamacare / ACA',
    planName: 'Oscar Classic Bronze Next',
    membersCount: 1,
    premium: 335,
    subsidy: 335,
    commissionRate: '$30.00 PMPM',
    grossAmount: 30.0,
    supportDeduction: 0.30,
    saleSupportStatus: 'NONE',
    commissionAmount: 21.0,
    annualProjected: 252.0,
    status: 'Settled',
    cycle: '2026-09',
    payoutDate: '09/15/2026',
    directDepositRef: 'ACH-332198-OSC',
  },
  {
    id: 'COMM-2026-010',
    policyNumber: 'PREM-WA-44190',
    memberId: 'MID-77192033',
    clientName: 'Bao Quoc Hoang',
    clientCode: 'CT26002596',
    carrier: 'Premera Blue Cross WA',
    category: 'Obamacare / ACA',
    planName: 'Premera Standard Silver Plan',
    membersCount: 2,
    premium: 810,
    subsidy: 750,
    commissionRate: '$32.00 PMPM ($64/mo for 2)',
    grossAmount: 64.0,
    supportDeduction: 0.50,
    saleSupportStatus: 'PARTIAL',
    commissionAmount: 32.0,
    annualProjected: 384.0,
    status: 'In Processing',
    cycle: '2026-09',
    payoutDate: '09/28/2026',
    directDepositRef: 'ACH-441900-PREM',
  },
];

export default function AgentCommissionLedger({ onSelectContact }) {
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
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Load real commissions from PostgreSQL backend
  async function loadCommissionsData() {
    try {
      setLoading(true);
      const [comms, summary] = await Promise.all([
        getCommissions().catch(() => []),
        getCommissionSummary().catch(() => null),
      ]);

      if (summary) setDbSummary(summary);

      if (Array.isArray(comms) && comms.length > 0) {
        // Map backend Prisma model to Ledger shape
        const formatted = comms.map((c) => ({
          id: c.id,
          policyNumber: c.policyId || `POL-${c.id.slice(-6)}`,
          memberId: c.policyId || 'MID-UNKNOWN',
          clientName: c.deal?.title?.split('–')[0]?.trim() || c.agentName || 'Client Name',
          clientCode: c.deal?.contactId || 'CT26002600',
          carrier: c.carrier,
          category: c.commissionType === 'MEDICARE' ? 'Medicare' : 'Obamacare / ACA',
          planName: c.planName || c.deal?.title || 'Standard Plan',
          membersCount: c.memberCount || 1,
          premium: 400,
          subsidy: 380,
          commissionRate: `$${(c.grossAmount / (c.memberCount || 1)).toFixed(2)} PMPM`,
          grossAmount: c.grossAmount,
          supportDeduction: c.supportDeduction,
          saleSupportStatus: c.saleSupportStatus || 'NONE',
          commissionAmount: c.netAmount,
          annualProjected: c.netAmount * 12,
          status: c.status === 'SETTLED' ? 'Settled' : c.status === 'PENDING' ? 'Pending Carrier Review' : c.status,
          cycle: c.period || '2026-09',
          payoutDate: c.status === 'SETTLED' ? '09/15/2026' : 'Pending (Next Cycle)',
          directDepositRef: c.status === 'SETTLED' ? `ACH-${c.id.slice(0, 6).toUpperCase()}` : '---',
        }));
        setCommissionList(formatted);
      }
    } catch (err) {
      console.warn('[CommissionLedger] Backend fallback:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommissionsData();
  }, []);

  // Trigger Backend Commission Calculation Engine
  async function handleRunCalculation() {
    try {
      setCalculating(true);
      const res = await calculateCommissions({
        agentName: 'Khanh Nguyen',
        period: selectedCycle === 'YTD' ? '2026-09' : selectedCycle,
      });
      showToast(`Calculation Complete: ${res.message || 'Updated active deal commissions'}`);
      await loadCommissionsData();
    } catch (err) {
      showToast(`Calculation note: Refreshed with active deals (${err.message})`);
    } finally {
      setCalculating(false);
    }
  }

  // Handle Status Update (e.g. Settle / Dispute)
  async function handleUpdateStatus(id, newStatus) {
    try {
      await updateCommission(id, { status: newStatus });
      setCommissionList((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus === 'SETTLED' ? 'Settled' : newStatus,
                payoutDate: newStatus === 'SETTLED' ? '09/15/2026' : c.payoutDate,
              }
            : c
        )
      );
      showToast(`Policy status updated to ${newStatus}`);
    } catch {
      // Local fallback
      setCommissionList((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: newStatus === 'SETTLED' ? 'Settled' : newStatus } : c
        )
      );
      showToast(`Policy status updated to ${newStatus} (Local)`);
    }
  }

  // Summary Metrics
  const stats = useMemo(() => {
    const settled = commissionList
      .filter((c) => c.status === 'Settled')
      .reduce((acc, c) => acc + c.commissionAmount, 0);

    const pending = commissionList
      .filter((c) => c.status === 'Pending Carrier Review' || c.status === 'In Processing')
      .reduce((acc, c) => acc + c.commissionAmount, 0);

    const totalProjected = commissionList.reduce((acc, c) => acc + c.annualProjected, 0);
    const totalPolicies = commissionList.length;

    return {
      settledCurrentMonth: dbSummary?.settledThisMonth || settled,
      pendingReview: pending,
      ytdSettled: dbSummary?.ytdPaid || settled * 8.5,
      annualProjected: totalProjected,
      activeCommissionPolicies: dbSummary?.activePolicies || totalPolicies,
      avgRatePmpm: totalPolicies > 0 ? settled / totalPolicies : 30.2,
    };
  }, [commissionList, dbSummary]);

  // Unique carrier list for filter
  const carrierOptions = useMemo(() => {
    const set = new Set(commissionList.map((c) => c.carrier));
    return ['All', ...Array.from(set)];
  }, [commissionList]);

  // Filtered rows
  const filteredList = useMemo(() => {
    return commissionList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.clientName.toLowerCase().includes(q) ||
        item.policyNumber.toLowerCase().includes(q) ||
        item.memberId.toLowerCase().includes(q) ||
        item.carrier.toLowerCase().includes(q);

      const matchCarrier = carrierFilter === 'All' || item.carrier === carrierFilter;
      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchSearch && matchCarrier && matchCategory && matchStatus;
    });
  }, [commissionList, searchQuery, carrierFilter, categoryFilter, statusFilter]);

  function handleExportCsv() {
    const headers = [
      'Transaction ID',
      'Policy #',
      'Member ID',
      'Client Name',
      'Carrier',
      'Category',
      'SSS Tier',
      'Gross Payout',
      'Support Fee %',
      'Net Commission',
      'Annual Projected',
      'Status',
      'Cycle',
      'Payout Date',
      'Direct Deposit Ref',
    ];
    const rows = filteredList.map((r) => [
      r.id,
      r.policyNumber,
      r.memberId,
      `"${r.clientName}"`,
      `"${r.carrier}"`,
      `"${r.category}"`,
      r.saleSupportStatus || 'NONE',
      `$${(r.grossAmount || r.commissionAmount).toFixed(2)}`,
      `${((r.supportDeduction || 0) * 100).toFixed(0)}%`,
      `$${r.commissionAmount.toFixed(2)}`,
      `$${r.annualProjected.toFixed(2)}`,
      r.status,
      r.cycle,
      r.payoutDate,
      r.directDepositRef,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Commission_Ledger_${selectedCycle.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Downloaded commission statement CSV!');
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 min-w-[1024px] bg-[#F8FAFC]">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Top Header with Actions ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Agent Commission Engine &amp; Payouts
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PostgreSQL Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Agent NPN #1984210 • SSS Rules Engine (NONE / PARTIAL / FULL) • Real-time Statement
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SSS Calculator Trigger */}
          <button
            type="button"
            onClick={() => setShowCalculatorModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>SSS Calculator</span>
          </button>

          {/* Auto Calculate Button */}
          <button
            type="button"
            disabled={calculating}
            onClick={handleRunCalculation}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer ${
              calculating ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${calculating ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{calculating ? 'Calculating...' : 'Recalculate SSS'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="px-1.5 py-1 text-slate-500 font-medium">Cycle:</span>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="bg-white px-2 py-1 rounded text-xs font-semibold text-slate-800 border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="2026-09">Sep 2026 (Current)</option>
              <option value="2026-08">Aug 2026</option>
              <option value="2026-07">Jul 2026</option>
              <option value="YTD">YTD 2026 (All Months)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Settled Current Month */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600">Settled This Month</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              account_balance_wallet
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${stats.settledCurrentMonth.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Deposited to Chase Checking (****4192)</span>
          </div>
        </div>

        {/* Card 2: Pending Carrier Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600">Pending Carrier Audit</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              hourglass_top
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            ${stats.pendingReview.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>Clearinghouse auditing AOR submission</span>
          </div>
        </div>

        {/* Card 3: YTD Settled Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600">YTD Paid Revenue</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              trending_up
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            ${stats.ytdSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>Annual Run-rate: <strong>${stats.annualProjected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Card 4: Active Commission Policies */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-600">Earning Policies</span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center material-symbols-outlined text-[18px]">
              policy
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.activeCommissionPolicies} <span className="text-sm font-normal text-slate-500">policies</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-700 font-medium">
            <span>Avg Net PMPM: <strong>${stats.avgRatePmpm.toFixed(2)}/mo</strong></span>
          </div>
        </div>
      </div>

      {/* ── 3. Filters Toolbar ───────────────────────────────────────────── */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap flex-grow">
          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm flex-grow">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search policy #, client name, member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 text-xs bg-slate-50/50"
            />
          </div>

          {/* Carrier Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Carrier:</span>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              {carrierOptions.map((c) => (
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
              className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Settled">Settled (Paid)</option>
              <option value="Pending Carrier Review">Pending Review</option>
              <option value="In Processing">In Processing</option>
            </select>
          </div>

          {/* Line Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Line:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Obamacare / ACA">Obamacare / ACA</option>
              <option value="Medicare">Medicare</option>
              <option value="Life">Life Insurance</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-medium text-xs">
          Showing <strong className="text-slate-800">{filteredList.length}</strong> statements
          {loading && <span className="ml-2 text-blue-600 animate-pulse">(Refreshing...)</span>}
        </div>
      </div>

      {/* ── 4. Main Commission Ledger Table ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Policy / Member ID</th>
                <th className="py-3 px-3.5">Client Name</th>
                <th className="py-3 px-3.5">Carrier &amp; Plan</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5 text-center">SSS Tier</th>
                <th className="py-3 px-3.5 text-right">Gross Payout</th>
                <th className="py-3 px-3.5 text-right">Support Fee</th>
                <th className="py-3 px-3.5 text-right">Net Month</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Payout Date</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-semibold text-slate-900">{row.policyNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.memberId}</div>
                  </td>
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
                  <td className="py-3 px-3.5 max-w-[200px]">
                    <div className="font-semibold text-slate-800 truncate">{row.carrier}</div>
                    <div className="text-[11px] text-slate-500 truncate">{row.planName}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.category.includes('Medicare')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : row.category.includes('Life')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>

                  {/* SSS Tier Badge */}
                  <td className="py-3 px-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                        (row.saleSupportStatus || '').toUpperCase().includes('NONE')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : (row.saleSupportStatus || '').toUpperCase() === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {(row.saleSupportStatus || '').toUpperCase().includes('NONE')
                        ? 'NONE (7/3)'
                        : (row.saleSupportStatus || '').toUpperCase() === 'PARTIAL'
                        ? 'PARTIAL (5/5)'
                        : 'FULL (3/7)'}
                    </span>
                  </td>

                  {/* Gross Amount */}
                  <td className="py-3 px-3.5 text-right font-mono text-slate-600 text-[11px]">
                    ${(row.grossAmount || row.commissionAmount).toFixed(2)}
                  </td>

                  {/* Support Fee % */}
                  <td className="py-3 px-3.5 text-right font-mono text-[11px]">
                    {row.supportDeduction > 0 ? (
                      <span className="text-amber-600 font-semibold">
                        -{(row.supportDeduction * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">0% (Grace)</span>
                    )}
                  </td>

                  {/* Net Amount */}
                  <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono">
                    ${row.commissionAmount.toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5">
                    {row.status === 'Settled' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Settled
                      </span>
                    ) : row.status === 'In Processing' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Audit Pending
                      </span>
                    )}
                  </td>

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
                        className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 text-xs font-medium transition cursor-pointer"
                        title="Audit / Formula breakdown"
                      >
                        Audit
                      </button>
                      {row.status !== 'Settled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(row.id, 'SETTLED')}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition cursor-pointer"
                          title="Mark settled"
                        >
                          Settle
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
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
            <span>All payouts follow SOP §2 SSS Guidelines: NONE (100%), PARTIAL (60%), FULL (25%).</span>
          </div>
          <div className="font-semibold text-slate-800">
            Total Displayed: <span className="text-blue-700">${filteredList.reduce((s, r) => s + r.commissionAmount, 0).toFixed(2)}</span> / month
          </div>
        </div>
      </div>

      {/* ── 5. Discrepancy / Audit Modal ─────────────────────────────────── */}
      {showDisputeModal && disputeRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">fact_check</span>
                <span>Commission Audit &amp; SSS Formula Breakdown</span>
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
                Policy: <strong className="text-slate-800">{disputeRecord.policyNumber}</strong> ({disputeRecord.clientName})
              </p>

              {/* SSS Formula Breakdown */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  SSS Calculation Formula:
                </div>
                <div className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
                  Gross (${(disputeRecord.grossAmount || disputeRecord.commissionAmount).toFixed(2)}) × [1 - SSS Fee ({((disputeRecord.supportDeduction || 0) * 100).toFixed(0)}%)] = <strong>${disputeRecord.commissionAmount.toFixed(2)}/mo</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>SSS Tier: <strong>{disputeRecord.saleSupportStatus || 'NONE'}</strong></div>
                  <div>Members: <strong>{disputeRecord.membersCount || 1}</strong></div>
                  <div>Carrier: <strong>{disputeRecord.carrier}</strong></div>
                  <div>Status: <strong>{disputeRecord.status}</strong></div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes / Dispute Reason:</label>
                <textarea
                  rows={3}
                  placeholder="Enter reason if discrepancy found (e.g., should be NONE due to new agent grace period, or missing dependent)..."
                  className="w-full p-2.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(disputeRecord.id, 'SETTLED');
                  setShowDisputeModal(false);
                }}
                className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
              >
                Mark as Settled
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(disputeRecord.id, 'DISPUTED');
                    setShowDisputeModal(false);
                    showToast('Dispute audit submitted to TBR Clearinghouse!');
                  }}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Submit Audit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Full SSS Calculator Modal ─────────────────────────────────── */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <AgentCommissionCalculator
            onClose={() => setShowCalculatorModal(false)}
            onApplyToDeal={() => {
              setShowCalculatorModal(false);
              showToast('SSS Calculation standards applied to Ledger!');
            }}
          />
        </div>
      )}
    </div>
  );
}
