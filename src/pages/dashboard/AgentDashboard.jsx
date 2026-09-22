import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

// ── Realistic 200+ Client Sample Data for Independent Agent ──
const INITIAL_AGENT_CUSTOMERS = [
  {
    id: 'CT2600101',
    code: 'AG-77036-01',
    fullName: 'Nguyễn Văn Nam',
    firstName: 'Nam',
    lastName: 'Nguyễn',
    age: 67,
    phone: '+1 (832) 555-0192',
    email: 'nam.nguyen77@gmail.com',
    language: 'Tiếng Việt',
    state: 'Texas',
    city: 'Houston, TX',
    zip: '77036',
    category: 'Medicare',
    line: 'Medicare Advantage (Part C)',
    carrier: 'UnitedHealthcare',
    planName: 'AARP Medicare Advantage Choice (PPO)',
    policyNumber: 'UHC-9821430',
    premium: 0,
    aptcSubsidy: 0,
    status: 'Active',
    stage: 'Closed Won',
    priority: 'High',
    effectiveDate: '2025-01-01',
    renewalDate: '2026-10-15',
    isRenewalUpcoming: true,
    needsFollowUp: false,
    appointmentToday: null,
    pendingTask: null,
    doctor: 'Dr. Thang Tran (Memorial Hermann Southwest)',
    notes: 'Khách hàng cao tuổi, thích quyền lợi nha khoa và tiền trợ cấp OTC mua đồ $50/tháng.',
    commissionRate: '$306 / năm (CMS Renewal Cap)',
    commissionAmount: 306,
    commissionStatus: 'Settled',
  },
  {
    id: 'CT2600102',
    code: 'AG-77449-02',
    fullName: 'Trần Thị Mai',
    firstName: 'Mai',
    lastName: 'Trần',
    age: 52,
    phone: '+1 (713) 555-0143',
    email: 'mai.tran.katy@yahoo.com',
    language: 'Tiếng Việt',
    state: 'Texas',
    city: 'Katy, TX',
    zip: '77449',
    category: 'ObamaCare',
    line: 'ObamaCare / ACA Silver CSR Plan',
    carrier: 'BlueCross BlueShield TX',
    planName: 'Blue Advantage Silver HMO 205',
    policyNumber: 'BCBS-771204',
    premium: 420,
    aptcSubsidy: 400,
    status: 'In Underwriting',
    stage: 'Application Submitted',
    priority: 'High',
    effectiveDate: '2026-02-01',
    renewalDate: '2026-11-01',
    isRenewalUpcoming: false,
    needsFollowUp: true,
    appointmentToday: null,
    pendingTask: 'Bổ sung Proof of Income (Tax Return 2025) cho Marketplace trước ngày 25',
    doctor: 'Oak Street Health - Bellaire Center',
    notes: 'Thu nhập $28,500/năm. Đang chờ đối chiếu hồ sơ thu nhập với sàn HealthCare.gov.',
    commissionRate: '$30 PMPM (Per Member Per Month)',
    commissionAmount: 360,
    commissionStatus: 'Pending Carrier Review',
  },
  {
    id: 'CT2600103',
    code: 'AG-75201-03',
    fullName: 'Lê Hoàng Phúc',
    firstName: 'Phúc',
    lastName: 'Lê',
    age: 41,
    phone: '+1 (214) 555-0188',
    email: 'phuc.le.realty@gmail.com',
    language: 'English & Tiếng Việt',
    state: 'Texas',
    city: 'Dallas, TX',
    zip: '75201',
    category: 'Life',
    line: 'Indexed Universal Life (IUL)',
    carrier: 'Mutual of Omaha',
    planName: 'Life Protection Advantage IUL',
    policyNumber: 'MOO-552190',
    premium: 250,
    aptcSubsidy: 0,
    status: 'Application Submitted',
    stage: 'Proposal Sent',
    priority: 'High',
    effectiveDate: '2026-03-01',
    renewalDate: '2027-03-01',
    isRenewalUpcoming: false,
    needsFollowUp: true,
    appointmentToday: '10:30 AM (Zoom Consultation)',
    pendingTask: 'Ký điện tử Scope of Health & Living Benefits Rider',
    doctor: 'N/A',
    notes: 'Mục tiêu tích lũy hưu trí không chịu thuế và bảo hiểm nhân thọ mệnh giá $500,000.',
    commissionRate: '85% FYC (First Year Commission)',
    commissionAmount: 2550,
    commissionStatus: 'Pending Carrier Review',
  },
  {
    id: 'CT2600104',
    code: 'AG-75040-04',
    fullName: 'Phạm Minh Đức',
    firstName: 'Đức',
    lastName: 'Phạm',
    age: 69,
    phone: '+1 (972) 555-0129',
    email: 'duc.pham.garland@gmail.com',
    language: 'Tiếng Việt',
    state: 'Texas',
    city: 'Garland, TX',
    zip: '75040',
    category: 'Medicare',
    line: 'Medicare Supplement (Plan G)',
    carrier: 'Humana',
    planName: 'Humana Medigap Standard Plan G',
    policyNumber: 'HUM-441098',
    premium: 145,
    aptcSubsidy: 0,
    status: 'Active',
    stage: 'Closed Won',
    priority: 'Medium',
    effectiveDate: '2024-06-01',
    renewalDate: '2026-06-01',
    isRenewalUpcoming: true,
    needsFollowUp: false,
    appointmentToday: '02:00 PM (Điện thoại tư vấn thuốc)',
    pendingTask: null,
    doctor: 'Baylor Scott & White Medical Center Garland',
    notes: 'Đi bác sĩ thường xuyên, rất hài lòng với Plan G vì tự do chọn bác sĩ khắp nước Mỹ.',
    commissionRate: '$306 / năm (CMS Renewal Cap)',
    commissionAmount: 306,
    commissionStatus: 'Settled',
  },
  {
    id: 'CT2600105',
    code: 'AG-77083-05',
    fullName: 'Võ Thị Kim Chi',
    firstName: 'Chi',
    lastName: 'Võ',
    age: 38,
    phone: '+1 (832) 555-0167',
    email: 'kimchi.vo@icloud.com',
    language: 'Tiếng Việt & English',
    state: 'Texas',
    city: 'Houston, TX',
    zip: '77083',
    category: 'ObamaCare',
    line: 'ObamaCare / ACA Bronze Plan',
    carrier: 'Aetna CVS Health',
    planName: 'Aetna Bronze OEP $0 Ded',
    policyNumber: 'AET-339182',
    premium: 320,
    aptcSubsidy: 320,
    status: 'Active',
    stage: 'Closed Won',
    priority: 'Normal',
    effectiveDate: '2025-01-01',
    renewalDate: '2026-11-01',
    isRenewalUpcoming: false,
    needsFollowUp: false,
    appointmentToday: null,
    pendingTask: null,
    doctor: 'MinuteClinic & HCA Houston Healthcare',
    notes: 'Chi phí đóng thực tế $0/tháng nhờ trợ cấp chính phủ APTC $320.',
    commissionRate: '$30 PMPM (Per Member Per Month)',
    commissionAmount: 360,
    commissionStatus: 'Settled',
  },
  {
    id: 'CT2600106',
    code: 'AG-95112-06',
    fullName: 'Đoàn Quốc Bảo',
    firstName: 'Bảo',
    lastName: 'Đoàn',
    age: 71,
    phone: '+1 (408) 555-0111',
    email: 'bao.doan.sj@sbcglobal.net',
    language: 'Tiếng Việt',
    state: 'California',
    city: 'San Jose, CA',
    zip: '95112',
    category: 'Medicare',
    line: 'Medicare Advantage (Part C)',
    carrier: 'Wellcare',
    planName: 'Wellcare Giveback HMO ($100 Part B Refund)',
    policyNumber: 'WEL-889012',
    premium: 0,
    aptcSubsidy: 0,
    status: 'Renewal Required',
    stage: 'Closed Won',
    priority: 'High',
    effectiveDate: '2024-01-01',
    renewalDate: '2026-10-15',
    isRenewalUpcoming: true,
    needsFollowUp: true,
    appointmentToday: null,
    pendingTask: 'So sánh quyền lợi AEP 2026 vì Wellcare đổi danh mục thuốc huyết áp',
    doctor: 'Regional Medical Center of San Jose',
    notes: 'Cần kiểm tra lại thuốc tiểu đường Metformin và thuốc huyết áp Tier 1 trước mùa AEP.',
    commissionRate: '$306 / năm (CMS Renewal Cap)',
    commissionAmount: 306,
    commissionStatus: 'Settled',
  },
  {
    id: 'CT2600107',
    code: 'AG-92683-07',
    fullName: 'Nguyễn Thị Bích',
    firstName: 'Bích',
    lastName: 'Nguyễn',
    age: 63,
    phone: '+1 (714) 555-0176',
    email: 'bich.nguyen.oc@gmail.com',
    language: 'Tiếng Việt',
    state: 'California',
    city: 'Westminster, CA',
    zip: '92683',
    category: 'Life',
    line: 'Final Expense Life Insurance',
    carrier: 'Ameritas',
    planName: 'Ameritas Golden Care Whole Life',
    policyNumber: 'AME-665123',
    premium: 85,
    aptcSubsidy: 0,
    status: 'Active',
    stage: 'Closed Won',
    priority: 'Normal',
    effectiveDate: '2023-08-01',
    renewalDate: '2026-08-01',
    isRenewalUpcoming: false,
    needsFollowUp: false,
    appointmentToday: null,
    pendingTask: null,
    doctor: 'Fountain Valley Regional Hospital',
    notes: 'Hợp đồng bảo vệ trọn đời $25,000 lo chi phí an táng, tự động trừ tài khoản Chase.',
    commissionRate: 'Renewal Service Fee (5%)',
    commissionAmount: 51,
    commissionStatus: 'Settled',
  },
  {
    id: 'CT2600108',
    code: 'AG-78758-08',
    fullName: 'Hoàng Văn Thảo',
    firstName: 'Thảo',
    lastName: 'Hoàng',
    age: 46,
    phone: '+1 (512) 555-0134',
    email: 'thao.hoang.atx@gmail.com',
    language: 'Tiếng Việt & English',
    state: 'Texas',
    city: 'Austin, TX',
    zip: '78758',
    category: 'ObamaCare',
    line: 'ObamaCare / ACA Gold Plan',
    carrier: 'Cigna Healthcare',
    planName: 'Cigna Connect Gold 0 Ind',
    policyNumber: 'CIG-991204',
    premium: 580,
    aptcSubsidy: 460,
    status: 'New',
    stage: 'Lead In',
    priority: 'High',
    effectiveDate: '2026-04-01',
    renewalDate: '2026-11-01',
    isRenewalUpcoming: false,
    needsFollowUp: true,
    appointmentToday: '04:30 PM (Cuộc gọi hẹn lại)',
    pendingTask: 'Gọi lại giải thích mức chênh lệch giữa Gold và Silver CSR',
    doctor: 'Austin Regional Clinic',
    notes: 'Khách hàng có bệnh nền cần Deductible thấp để đi xét nghiệm thường xuyên.',
    commissionRate: '$30 PMPM (Per Member Per Month)',
    commissionAmount: 360,
    commissionStatus: 'Pending Carrier Review',
  },
];

const CARRIER_OPTIONS = [
  'UnitedHealthcare',
  'BlueCross BlueShield TX',
  'Humana',
  'Aetna CVS Health',
  'Mutual of Omaha',
  'Ameritas',
  'Wellcare',
  'Cigna Healthcare',
];

const STATUS_OPTIONS = [
  'New',
  'Application Submitted',
  'In Underwriting',
  'Approved & Active',
  'Renewal Required',
  'Pending Documents',
  'Closed / Lapsed',
];

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & View state
  const [currentTab, setCurrentTab] = useState('priorities'); // 'priorities' | 'contacts' | 'deals' | 'commission'
  const [showCrmMenu, setShowCrmMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const crmMenuRef = useRef(null);

  // Data state
  const [customers, setCustomers] = useState(INITIAL_AGENT_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals & Drawers
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (crmMenuRef.current && !crmMenuRef.current.contains(event.target)) {
        setShowCrmMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  // ── Metrics Calculation ──────────────────────────────────────
  const stats = useMemo(() => {
    const followUps = customers.filter((c) => c.needsFollowUp);
    const appointments = customers.filter((c) => c.appointmentToday);
    const renewals = customers.filter((c) => c.isRenewalUpcoming);
    const tasks = customers.filter((c) => c.pendingTask);

    const settledRevenue = customers
      .filter((c) => c.commissionStatus === 'Settled')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    const pendingRevenue = customers
      .filter((c) => c.commissionStatus === 'Pending Carrier Review')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    return {
      followUpsCount: followUps.length,
      appointmentsCount: appointments.length,
      renewalsCount: renewals.length,
      tasksCount: tasks.length,
      settledRevenue,
      pendingRevenue,
      totalActivePolicies: 214, // Simulated total active clients
    };
  }, [customers]);

  // ── Filtered Customers ──────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.carrier.toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q);

      const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;

      let matchPriority = true;
      if (priorityFilter === 'FollowUp') matchPriority = c.needsFollowUp;
      if (priorityFilter === 'Appointment') matchPriority = Boolean(c.appointmentToday);
      if (priorityFilter === 'Renewal') matchPriority = c.isRenewalUpcoming;
      if (priorityFilter === 'Task') matchPriority = Boolean(c.pendingTask);

      return matchSearch && matchCat && matchStatus && matchPriority;
    });
  }, [customers, searchQuery, categoryFilter, statusFilter, priorityFilter]);

  // ── Save Contract Mutation Handler ──────────────────────────
  function handleSaveContract(e) {
    e.preventDefault();
    if (!editingContract) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === editingContract.id) {
          const isNowActive =
            editingContract.status === 'Approved & Active' || editingContract.status === 'Active';
          return {
            ...c,
            status: editingContract.status,
            carrier: editingContract.carrier,
            policyNumber: editingContract.policyNumber,
            premium: Number(editingContract.premium) || 0,
            aptcSubsidy: Number(editingContract.aptcSubsidy) || 0,
            notes: editingContract.notes,
            needsFollowUp: editingContract.needsFollowUp,
            commissionStatus: isNowActive ? 'Settled' : c.commissionStatus,
          };
        }
        return c;
      })
    );

    showToast(`Đã cập nhật hợp đồng của ${editingContract.fullName}!`);
    setEditingContract(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-100 selection:text-cyan-950">
      {/* ── Toast Alert ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP UTILITY BAR (Exact Staff CRM Header Style) ─────── */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
        {/* Left: Brand & Portal Mode */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard/agent" className="flex items-center gap-2.5 group">
            <img
              src="/images/insurmatch-logo.png"
              alt="InsurMatch"
              className="w-8 h-8 object-contain rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-[14px] font-black tracking-tight text-slate-900">
                  INSUR<span className="text-slate-500 font-normal">MATCH</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold border border-blue-200/70 tracking-wide uppercase">
                  AgentFlow
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Digital Lead &amp; Agent Matching Platform
              </span>
            </div>
          </Link>

          {/* Workflow Mode Tabs (Staff Management Pattern) */}
          <nav className="hidden md:flex items-center gap-1 ml-2 text-xs">
            <button
              onClick={() => { setCurrentTab('priorities'); setPriorityFilter('All'); }}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'priorities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>Today's Priorities</span>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                {stats.followUpsCount + stats.appointmentsCount}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('contacts')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'contacts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">contacts</span>
              <span>Customers (200+)</span>
            </button>

            <button
              onClick={() => setCurrentTab('deals')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'deals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">handshake</span>
              <span>Contracts &amp; Pipeline</span>
            </button>

            <button
              onClick={() => setCurrentTab('commission')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'commission'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Commission</span>
            </button>
          </nav>
        </div>

        {/* Right Tools (Staff Layout) */}
        <div className="flex items-center gap-3">
          {/* Quick Create + */}
          <button
            onClick={() => {
              setEditingContract({
                id: `CT2600${Math.floor(2000 + Math.random() * 900)}`,
                fullName: 'Khách hàng mới (Quick Add)',
                carrier: 'UnitedHealthcare',
                policyNumber: 'NEW-POLICY',
                premium: 0,
                aptcSubsidy: 0,
                status: 'New',
                notes: '',
                needsFollowUp: true,
              });
            }}
            title="Create Policy / Lead"
            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition text-sm cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              title="Notifications"
              className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {stats.renewalsCount}
              </span>
            </button>
          </div>

          {/* Regulatory & NPN Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NPN #1984210 • TX &amp; CA Verified</span>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#104882] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                KN
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                Khánh Nguyen
              </span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">Khánh Nguyen, Licensed Agent</div>
                  <div className="text-[11px] text-slate-500 font-mono">NPN: #1984210</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Role: Independent Agent
                  </span>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>View InsurMatch Site</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN BODY WITH SLIM DARK NAVY RAIL ────────────────── */}
      <div className="flex-grow flex overflow-hidden">
        {/* Leftmost Slim Dark Navy Rail (Exact Match to Staff Layout) */}
        <aside className="w-12 bg-[#0C1B33] shrink-0 flex flex-col items-center py-3 gap-2.5 z-30 shadow-md">
          {/* Top Home / Apps Icon */}
          <button
            title="Overview"
            onClick={() => { setCurrentTab('priorities'); setPriorityFilter('All'); }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
              currentTab === 'priorities'
                ? 'bg-[#00B4D8] text-white shadow-sm ring-2 ring-cyan-300/40'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>

          {/* CRM Flyout Menu Trigger */}
          <div className="relative" ref={crmMenuRef}>
            <button
              title="Agent CRM Menu"
              onClick={() => setShowCrmMenu(!showCrmMenu)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                currentTab === 'contacts' || currentTab === 'deals' || showCrmMenu
                  ? 'bg-[#00B4D8] text-white shadow-sm ring-2 ring-cyan-300/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">contacts</span>
            </button>

            {/* Flyout Popover */}
            {showCrmMenu && (
              <div className="absolute left-full top-0 ml-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 select-none">
                  AgentFlow Workflow
                </div>
                <button
                  type="button"
                  onClick={() => { setShowCrmMenu(false); setCurrentTab('priorities'); }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'priorities' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">priority_high</span>
                  <span>02 Today's Priorities</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCrmMenu(false); setCurrentTab('contacts'); }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'contacts' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">contacts</span>
                  <span>03 Customer 360 (200+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCrmMenu(false); setCurrentTab('deals'); }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'deals' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">handshake</span>
                  <span>04 Contracts Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCrmMenu(false); setCurrentTab('commission'); }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'commission' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">payments</span>
                  <span>05 Commission Ledger</span>
                </button>
              </div>
            )}
          </div>

          {/* Commission Direct Icon */}
          <button
            title="Commission &amp; Revenue"
            onClick={() => setCurrentTab('commission')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
              currentTab === 'commission'
                ? 'bg-[#00B4D8] text-white shadow-sm ring-2 ring-cyan-300/40'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </button>

          <div className="flex-grow" />

          {/* Settings */}
          <button
            title="Settings &amp; License"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </aside>

        {/* ── DYNAMIC PAGE CONTENT (Enterprise Clean Layout) ──── */}
        <main className="flex-grow overflow-y-auto bg-[#F4F6F9] flex flex-col">
          {/* Subheader Banner Bar (Matching Staff Dashboard Bar) */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  {currentTab === 'priorities'
                    ? 'priority_high'
                    : currentTab === 'contacts'
                    ? 'contacts'
                    : currentTab === 'deals'
                    ? 'handshake'
                    : 'payments'}
                </span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {currentTab === 'priorities' && "02 — Today's Priorities (Morning Action Cockpit)"}
                  {currentTab === 'contacts' && "03 — Customer 360 Directory & Portfolio"}
                  {currentTab === 'deals' && "04 — Insurance Contracts & Underwriting Lifecycle"}
                  {currentTab === 'commission' && "05 — Commission Performance & Carrier Ledger"}
                </h1>
                <p className="text-[11px] text-slate-500">
                  Agent: Khánh Nguyen • Licensed in TX (TDI) &amp; CA (CDI) • CMS &amp; HIPAA Compliant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('Đang làm mới dữ liệu từ Carrier APIs...')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-slate-500">refresh</span>
                <span>Refresh</span>
              </button>

              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                Portfolio: <strong className="text-slate-800">{stats.totalActivePolicies} Active Policies</strong>
              </span>
            </div>
          </div>

          {/* ── TAB 1: 02 TODAY'S PRIORITIES (Morning Cockpit) ─── */}
          {currentTab === 'priorities' && (
            <div className="p-6 space-y-6 max-w-[1700px] mx-auto w-full">
              {/* 4 Action KPI Cards (Staff Styled) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Follow-up */}
                <div
                  onClick={() => setPriorityFilter(priorityFilter === 'FollowUp' ? 'All' : 'FollowUp')}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition cursor-pointer flex flex-col justify-between ${
                    priorityFilter === 'FollowUp'
                      ? 'border-rose-400 ring-2 ring-rose-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Customers to Follow-up</span>
                    <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      phone_callback
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.followUpsCount}</div>
                  <div className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Cần gọi liên hệ lại &lt; 24h</span>
                  </div>
                </div>

                {/* 2. Appointments */}
                <div
                  onClick={() => setPriorityFilter(priorityFilter === 'Appointment' ? 'All' : 'Appointment')}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition cursor-pointer flex flex-col justify-between ${
                    priorityFilter === 'Appointment'
                      ? 'border-amber-400 ring-2 ring-amber-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Today's Appointments</span>
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      calendar_month
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.appointmentsCount}</div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Lịch hẹn tư vấn Zoom / Phone</span>
                  </div>
                </div>

                {/* 3. Renewals */}
                <div
                  onClick={() => setPriorityFilter(priorityFilter === 'Renewal' ? 'All' : 'Renewal')}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition cursor-pointer flex flex-col justify-between ${
                    priorityFilter === 'Renewal'
                      ? 'border-purple-400 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Upcoming Renewals</span>
                    <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      autorenew
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.renewalsCount}</div>
                  <div className="text-[11px] text-purple-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Mùa Medicare AEP &amp; ACA OEP</span>
                  </div>
                </div>

                {/* 4. Tasks */}
                <div
                  onClick={() => setPriorityFilter(priorityFilter === 'Task' ? 'All' : 'Task')}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition cursor-pointer flex flex-col justify-between ${
                    priorityFilter === 'Task'
                      ? 'border-blue-400 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Urgent Tasks</span>
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      assignment_late
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.tasksCount}</div>
                  <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Bổ sung Proof of Income / Ký đơn</span>
                  </div>
                </div>
              </div>

              {/* Priority Work Queue (Staff Card Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel 1: Urgent Callbacks */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                  <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <span className="material-symbols-outlined text-[16px] text-rose-500">phone_in_talk</span>
                      <span>Khách hàng cần liên hệ lại ngay</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      High Priority
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 flex-grow">
                    {customers
                      .filter((c) => c.needsFollowUp)
                      .map((c) => (
                        <div key={c.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">{c.fullName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                {c.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                              {c.pendingTask || c.notes}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={`tel:${c.phone}`}
                              className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1 transition"
                            >
                              <span className="material-symbols-outlined text-[14px]">call</span>
                              <span>Call</span>
                            </a>
                            <button
                              onClick={() => setEditingContract(c)}
                              className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition cursor-pointer"
                            >
                              Update →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Panel 2: Today's Appointments Timeline */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                  <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">schedule</span>
                      <span>Lịch hẹn tư vấn trong ngày</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Today's Schedule
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 flex-grow">
                    {customers
                      .filter((c) => c.appointmentToday)
                      .map((c) => (
                        <div key={c.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                                {c.appointmentToday}
                              </span>
                              <span className="font-semibold text-xs text-slate-900">{c.fullName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Gói: <strong className="text-slate-700">{c.carrier}</strong> ({c.line})
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
                            >
                              View Notes
                            </button>
                            <button
                              onClick={() => setEditingContract(c)}
                              className="px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                              Log Call
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Jump to All Contacts */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Xem toàn bộ <strong>{customers.length} khách hàng</strong> trong danh mục và quản lý hợp đồng chi tiết.
                </span>
                <button
                  onClick={() => setCurrentTab('contacts')}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở danh bạ Customer 360</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2 & 3: CUSTOMER DIRECTORY (Staff Table Layout) ─ */}
          {(currentTab === 'contacts' || currentTab === 'deals') && (
            <div className="p-6 space-y-4 max-w-[1700px] mx-auto w-full">
              {/* Filter Toolbar (Matching Staff Contacts Toolbar) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên, điện thoại, policy #..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Pill Filters */}
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5">
                    {['All', 'Medicare', 'ObamaCare', 'Life'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-md font-medium text-xs transition cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat === 'All' ? 'Tất cả dòng' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Active">Approved &amp; Active</option>
                    <option value="In Underwriting">In Underwriting</option>
                    <option value="Application Submitted">Application Submitted</option>
                    <option value="Renewal Required">Renewal Required</option>
                    <option value="New">New Lead</option>
                  </select>

                  {priorityFilter !== 'All' && (
                    <button
                      onClick={() => setPriorityFilter('All')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 cursor-pointer"
                    >
                      <span>Lọc: {priorityFilter}</span>
                      <span>✕</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Hiển thị <strong className="text-slate-800">{filteredCustomers.length}</strong> / 214 hợp đồng
                  </span>
                </div>
              </div>

              {/* Main Enterprise Contacts Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3.5 py-2.5 w-10 text-center">No.</th>
                        <th className="px-3.5 py-2.5">Code</th>
                        <th className="px-3.5 py-2.5 font-bold text-slate-900">Khách hàng</th>
                        <th className="px-3.5 py-2.5">Điện thoại</th>
                        <th className="px-3.5 py-2.5">Email</th>
                        <th className="px-3.5 py-2.5">Hãng bảo hiểm &amp; Gói</th>
                        <th className="px-3.5 py-2.5">Địa chỉ</th>
                        <th className="px-3.5 py-2.5">Phí / APTC</th>
                        <th className="px-3.5 py-2.5">Trạng thái</th>
                        <th className="px-3.5 py-2.5">Gia hạn / Lịch</th>
                        <th className="px-3.5 py-2.5 text-right w-24">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                            <span className="material-symbols-outlined text-[28px] text-slate-300 mb-1">
                              person_search
                            </span>
                            <div className="text-xs font-semibold text-slate-700">Không tìm thấy khách hàng phù hợp</div>
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c, index) => (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono">{index + 1}</td>
                            <td className="px-3.5 py-2.5 font-mono text-[10px] text-slate-500">{c.code}</td>
                            <td className="px-3.5 py-2.5">
                              <button
                                onClick={() => setSelectedCustomer(c)}
                                className="font-bold text-blue-600 hover:underline cursor-pointer text-left"
                              >
                                {c.fullName}
                              </button>
                              <div className="text-[10px] text-slate-400">{c.language}</div>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono">
                              <a href={`tel:${c.phone}`} className="text-slate-700 hover:text-blue-600">
                                {c.phone}
                              </a>
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-500 truncate max-w-[140px]">{c.email}</td>
                            <td className="px-3.5 py-2.5">
                              <div className="font-semibold text-slate-800">{c.carrier}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{c.policyNumber}</div>
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600">{c.city}</td>
                            <td className="px-3.5 py-2.5 font-mono">
                              <strong className="text-slate-900">${c.premium}</strong>
                              {c.aptcSubsidy > 0 && (
                                <span className="text-[10px] text-emerald-600 block">(-${c.aptcSubsidy} APTC)</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                                  c.status === 'Active' || c.status === 'Approved & Active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : c.status === 'In Underwriting'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : c.status === 'Renewal Required'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : c.status === 'Application Submitted'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-[10px] font-mono">
                              {c.appointmentToday ? (
                                <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                  {c.appointmentToday}
                                </span>
                              ) : (
                                <span className="text-slate-500">{c.renewalDate}</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedCustomer(c)}
                                  className="w-6 h-6 rounded border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                                  title="Customer 360"
                                >
                                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                                </button>
                                <button
                                  onClick={() => setEditingContract(c)}
                                  className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] transition cursor-pointer"
                                  title="Update Contract"
                                >
                                  Update →
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
          )}

          {/* ── TAB 4: 05 COMMISSION DASHBOARD ─────────────────── */}
          {currentTab === 'commission' && (
            <div className="p-6 space-y-6 max-w-[1700px] mx-auto w-full">
              {/* Financial KPI Cards (Staff Styled) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Settled Revenue MTD</span>
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      account_balance
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">
                    ${stats.settledRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Đã chi trả về tài khoản ngân hàng</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Pending Underwriting</span>
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      hourglass_top
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-amber-700">
                    ${stats.pendingRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Dự kiến chi trả khi Carrier phát hành HĐ</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">YTD Total Commission</span>
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center material-symbols-outlined text-[17px]">
                      trending_up
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${(stats.settledRevenue + 37750).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Lũy kế từ đầu năm 2026</div>
                </div>
              </div>

              {/* Carrier Reconciliation Ledger */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">receipt_long</span>
                    <span>Carrier Reconciliation Ledger (Bảng kê đối soát hoa hồng)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    DIRECT CARRIER PAYOUT
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3.5 py-2.5">Khách hàng</th>
                        <th className="px-3.5 py-2.5">Carrier</th>
                        <th className="px-3.5 py-2.5">Công thức hoa hồng</th>
                        <th className="px-3.5 py-2.5">Ước tính ($)</th>
                        <th className="px-3.5 py-2.5">Trạng thái thanh toán</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition">
                          <td className="px-3.5 py-2.5">
                            <span className="font-semibold text-slate-900">{c.fullName}</span>
                            <div className="text-[10px] text-slate-400 font-mono">{c.policyNumber}</div>
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-800">{c.carrier}</td>
                          <td className="px-3.5 py-2.5 text-slate-500 font-mono text-[10px]">{c.commissionRate}</td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                            ${c.commissionAmount?.toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                c.commissionStatus === 'Settled'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {c.commissionStatus}
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
        </main>
      </div>

      {/* ── CUSTOMER 360 DETAIL SLIDE-OVER DRAWER (Staff Style) ── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {selectedCustomer.firstName?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>{selectedCustomer.fullName}</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      Tuổi: {selectedCustomer.age}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">{selectedCustomer.code}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-grow">
              {/* Demographics */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                  Thông tin liên hệ &amp; Địa chỉ
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Điện thoại</span>
                    <a href={`tel:${selectedCustomer.phone}`} className="font-semibold text-blue-600">
                      {selectedCustomer.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-semibold text-slate-800 truncate block">{selectedCustomer.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Khu vực</span>
                    <span className="font-semibold text-slate-800">{selectedCustomer.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ngôn ngữ</span>
                    <span className="font-semibold text-slate-800">{selectedCustomer.language}</span>
                  </div>
                </div>
              </div>

              {/* Policy & Coverage Details */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>Hợp đồng bảo hiểm hiện tại</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedCustomer.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Hãng bảo hiểm (Carrier)</span>
                    <strong className="text-slate-900">{selectedCustomer.carrier}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Số hợp đồng (Policy #)</span>
                    <strong className="font-mono text-slate-900">{selectedCustomer.policyNumber}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Tên gói chi tiết</span>
                    <span className="text-slate-800 font-medium">{selectedCustomer.planName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phí hàng tháng (Premium)</span>
                    <strong className="text-emerald-700">${selectedCustomer.premium}/tháng</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Trợ cấp APTC</span>
                    <strong className="text-slate-800">${selectedCustomer.aptcSubsidy}/tháng</strong>
                  </div>
                </div>
              </div>

              {/* Doctor Network & Medical Notes */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                  Mạng lưới Y tế &amp; Nhật ký tư vấn
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bác sĩ / Bệnh viện ưu tiên</span>
                  <span className="text-slate-800 font-medium">{selectedCustomer.doctor || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ghi chú tư vấn (Agent Notes)</span>
                  <p className="mt-1 p-2 rounded bg-white border border-slate-200 text-slate-700 italic">
                    "{selectedCustomer.notes}"
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">CMS Scope of Appointment: Confirmed</span>
              <button
                onClick={() => {
                  const c = selectedCustomer;
                  setSelectedCustomer(null);
                  setEditingContract(c);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-xs transition cursor-pointer"
              >
                Cập nhật Hợp đồng →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 04 UPDATE CONTRACT MODAL (Staff Form Style) ────────── */}
      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">edit_document</span>
                <span className="font-bold text-sm text-slate-900">
                  Cập nhật hợp đồng: {editingContract.fullName}
                </span>
              </div>
              <button
                onClick={() => setEditingContract(null)}
                className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveContract} className="p-5 space-y-3.5 text-xs">
              {/* Status */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Trạng thái hợp đồng (Contract Status) *
                </label>
                <select
                  value={editingContract.status}
                  onChange={(e) => setEditingContract({ ...editingContract, status: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Chuyển sang "Approved &amp; Active" sẽ tự động ghi nhận hoa hồng vào Bước 05.
                </span>
              </div>

              {/* Carrier & Policy # */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hãng bảo hiểm</label>
                  <select
                    value={editingContract.carrier}
                    onChange={(e) => setEditingContract({ ...editingContract, carrier: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {CARRIER_OPTIONS.map((carr) => (
                      <option key={carr} value={carr}>
                        {carr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Số hợp đồng (Policy #)</label>
                  <input
                    type="text"
                    value={editingContract.policyNumber}
                    onChange={(e) => setEditingContract({ ...editingContract, policyNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Premium & Subsidy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phí hàng tháng ($)</label>
                  <input
                    type="number"
                    value={editingContract.premium}
                    onChange={(e) => setEditingContract({ ...editingContract, premium: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Trợ cấp APTC ($)</label>
                  <input
                    type="number"
                    value={editingContract.aptcSubsidy}
                    onChange={(e) => setEditingContract({ ...editingContract, aptcSubsidy: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Checkbox Follow-up */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="needsFollowUpAgent"
                  checked={editingContract.needsFollowUp || false}
                  onChange={(e) => setEditingContract({ ...editingContract, needsFollowUp: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="needsFollowUpAgent" className="text-slate-700 font-medium cursor-pointer">
                  Đánh dấu cần Follow-up tiếp theo (hiện tại Bước 02 Priorities)
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ghi chú tư vấn (Agent Notes)</label>
                <textarea
                  rows={2}
                  value={editingContract.notes || ''}
                  onChange={(e) => setEditingContract({ ...editingContract, notes: e.target.value })}
                  placeholder="Ghi chú nội dung trao đổi với khách..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span>
                  <span>Lưu hợp đồng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
