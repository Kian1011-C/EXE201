import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../auth/AuthContext';

// ── Initial Mock Dataset (Representing 200+ Portfolio) ────────
const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-101',
    name: 'Nguyễn Văn Nam',
    lang: 'Tiếng Việt & English',
    type: 'Medicare Advantage (Part C)',
    category: 'Medicare',
    carrier: 'UnitedHealthcare',
    planName: 'AARP Medicare Advantage Choice (PPO)',
    policyNumber: 'UHC-9821430',
    premium: 0,
    aptcSubsidy: 0,
    phone: '(832) 555-0192',
    email: 'nam.nguyen@email.com',
    city: 'Houston, TX',
    zip: '77036',
    age: 67,
    status: 'Active',
    priority: 'High',
    effectiveDate: '2025-01-01',
    renewalDate: '2026-10-15',
    isRenewalUpcoming: true,
    needsFollowUp: false,
    appointmentToday: null,
    pendingTask: null,
    doctor: 'Dr. Thang Tran (Memorial Hermann)',
    notes: 'Khách hài lòng với quyền lợi nha khoa và tiền chợ $50/tháng. Đã nhắc lịch khám định kỳ.',
    commissionRate: '$306 / năm (CMS Renewal Cap)',
    commissionAmount: 306,
    commissionStatus: 'Settled',
  },
  {
    id: 'CUST-102',
    name: 'Trần Thị Mai',
    lang: 'Tiếng Việt',
    type: 'ObamaCare / ACA Silver Plan',
    category: 'ObamaCare',
    carrier: 'BlueCross BlueShield TX',
    planName: 'Blue Advantage Silver HMO 205',
    policyNumber: 'BCBS-771204',
    premium: 420,
    aptcSubsidy: 400,
    phone: '(713) 555-0143',
    email: 'mai.tran72@gmail.com',
    city: 'Katy, TX',
    zip: '77449',
    age: 52,
    status: 'In Underwriting',
    priority: 'High',
    effectiveDate: '2026-02-01',
    renewalDate: '2026-11-01',
    isRenewalUpcoming: false,
    needsFollowUp: true,
    appointmentToday: null,
    pendingTask: 'Bổ sung Proof of Income (W2 / Tax Return 2025) cho Marketplace trước ngày 25',
    doctor: 'Oak Street Health - Bellaire',
    notes: 'Thu nhập ước tính $28,000/năm. Đã nộp đơn, đang chờ thẩm định hồ sơ thu nhập.',
    commissionRate: '$30 PMPM (Per Member Per Month)',
    commissionAmount: 360,
    commissionStatus: 'Pending Carrier Review',
  },
  {
    id: 'CUST-103',
    name: 'Lê Hoàng Phúc',
    lang: 'English & Tiếng Việt',
    type: 'Life Insurance (IUL)',
    category: 'Life',
    carrier: 'Mutual of Omaha',
    planName: 'Indexed Universal Life Plus',
    policyNumber: 'MOO-552190',
    premium: 250,
    aptcSubsidy: 0,
    phone: '(214) 555-0188',
    email: 'phuc.le.realty@yahoo.com',
    city: 'Dallas, TX',
    zip: '75201',
    age: 41,
    status: 'Application Submitted',
    priority: 'High',
    effectiveDate: '2026-03-01',
    renewalDate: '2027-03-01',
    isRenewalUpcoming: false,
    needsFollowUp: true,
    appointmentToday: '10:30 AM (Zoom Consultation)',
    pendingTask: 'Ký điện tử Scope of Health & Living Benefits Rider',
    doctor: 'N/A',
    notes: 'Mục tiêu tích lũy hưu trí thuế ưu đãi và bảo vệ gia đình $500,000 Face Amount.',
    commissionRate: '85% FYC (First Year Commission)',
    commissionAmount: 2550,
    commissionStatus: 'Pending Carrier Review',
  },
  {
    id: 'CUST-104',
    name: 'Phạm Minh Đức',
    lang: 'Tiếng Việt',
    type: 'Medicare Supplement (Plan G)',
    category: 'Medicare',
    carrier: 'Humana',
    planName: 'Humana Medigap Standard Plan G',
    policyNumber: 'HUM-441098',
    premium: 145,
    aptcSubsidy: 0,
    phone: '(972) 555-0129',
    email: 'duc.pham.us@gmail.com',
    city: 'Garland, TX',
    zip: '75040',
    age: 69,
    status: 'Active',
    priority: 'Medium',
    effectiveDate: '2024-06-01',
    renewalDate: '2026-06-01',
    isRenewalUpcoming: true,
    needsFollowUp: false,
    appointmentToday: '02:00 PM (Phone Call)',
    pendingTask: null,
    doctor: 'Baylor Scott & White Garland',
    notes: 'Đi bác sĩ thường xuyên, rất chuộng Plan G vì không cần Referral từ bác sĩ gia đình.',
    commissionRate: '$306 / năm (CMS Renewal Cap)',
    commissionAmount: 306,
    commissionStatus: 'Settled',
  },
  {
    id: 'CUST-105',
    name: 'Võ Thị Kim Chi',
    lang: 'Tiếng Việt & English',
    type: 'ObamaCare / ACA Bronze Plan',
    category: 'ObamaCare',
    carrier: 'Aetna CVS Health',
    planName: 'Aetna Bronze OEP $0 Ded',
    policyNumber: 'AET-339182',
    premium: 320,
    aptcSubsidy: 320,
    phone: '(832) 555-0167',
    email: 'kimchi.vo@icloud.com',
    city: 'Houston, TX',
    zip: '77083',
    age: 38,
    status: 'Active',
    priority: 'Normal',
    effectiveDate: '2025-01-01',
    renewalDate: '2026-11-01',
    isRenewalUpcoming: false,
    needsFollowUp: false,
    appointmentToday: null,
    pendingTask: null,
    doctor: 'Katy Urgent Care & CVS MinuteClinic',
    notes: 'Chi phí $0/tháng sau trợ cấp APTC. Khách khỏe mạnh, chỉ dùng phòng ngừa cơ bản.',
    commissionRate: '$30 PMPM (Per Member Per Month)',
    commissionAmount: 360,
    commissionStatus: 'Settled',
  },
  {
    id: 'CUST-106',
    name: 'Đoàn Quốc Bảo',
    lang: 'Tiếng Việt',
    type: 'Medicare Advantage (Part C)',
    category: 'Medicare',
    carrier: 'Wellcare',
    planName: 'Wellcare Giveback HMO (Part B Refund)',
    policyNumber: 'WEL-889012',
    premium: 0,
    aptcSubsidy: 0,
    phone: '(408) 555-0111',
    email: 'bao.doan@sbcglobal.net',
    city: 'San Jose, CA',
    zip: '95112',
    age: 71,
    status: 'Renewal Required',
    priority: 'High',
    effectiveDate: '2024-01-01',
    renewalDate: '2026-10-15',
    isRenewalUpcoming: true,
    needsFollowUp: true,
    appointmentToday: null,
    pendingTask: 'So sánh quyền lợi AEP 2026 vì Wellcare đổi danh mục thuốc tim mạch',
    doctor: 'Regional Medical Center of San Jose',
    notes: 'Cần kiểm tra lại thuốc tiểu đường Metformin và thuốc huyết áp có còn trong Tier 1 không.',
    commissionRate: '$306 / năm (CMS Renewal Cap)',
    commissionAmount: 306,
    commissionStatus: 'Settled',
  },
  {
    id: 'CUST-107',
    name: 'Nguyễn Thị Bích',
    lang: 'Tiếng Việt',
    type: 'Final Expense Life Insurance',
    category: 'Life',
    carrier: 'Ameritas',
    planName: 'Ameritas Golden Care Whole Life',
    policyNumber: 'AME-665123',
    premium: 85,
    aptcSubsidy: 0,
    phone: '(714) 555-0176',
    email: 'bich.nguyen.ca@gmail.com',
    city: 'Westminster, CA',
    zip: '92683',
    age: 63,
    status: 'Active',
    priority: 'Normal',
    effectiveDate: '2023-08-01',
    renewalDate: '2026-08-01',
    isRenewalUpcoming: false,
    needsFollowUp: false,
    appointmentToday: null,
    pendingTask: null,
    doctor: 'Fountain Valley Regional Hospital',
    notes: 'Hợp đồng bảo vệ trọn đời $25,000 chi phí an táng, tự động trừ tiền ngân hàng đều đặn.',
    commissionRate: 'Renewal Service Fee (5%)',
    commissionAmount: 51,
    commissionStatus: 'Settled',
  },
  {
    id: 'CUST-108',
    name: 'Hoàng Văn Thảo',
    lang: 'Tiếng Việt & English',
    type: 'ObamaCare / ACA Gold Plan',
    category: 'ObamaCare',
    carrier: 'Cigna Healthcare',
    planName: 'Cigna Connect Gold 0 Ind',
    policyNumber: 'CIG-991204',
    premium: 580,
    aptcSubsidy: 460,
    phone: '(512) 555-0134',
    email: 'thao.hoang.atx@gmail.com',
    city: 'Austin, TX',
    zip: '78758',
    age: 46,
    status: 'New',
    priority: 'High',
    effectiveDate: '2026-04-01',
    renewalDate: '2026-11-01',
    isRenewalUpcoming: false,
    needsFollowUp: true,
    appointmentToday: '04:30 PM (Callback scheduled)',
    pendingTask: 'Gọi lại tư vấn chênh lệch giữa gói Gold và Silver CSR',
    doctor: 'Austin Regional Clinic',
    notes: 'Khách hàng có bệnh nền đường huyết cao, cần mức Deductible thấp để đi khám thường xuyên.',
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
  const { user } = useAuth();

  // State
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'priorities', 'customers', 'commission'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All', 'Medicare', 'ObamaCare', 'Life'
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All'); // 'All', 'FollowUp', 'Appointment', 'Renewal', 'Task'

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState(null); // for Customer 360 Profile
  const [editingContract, setEditingContract] = useState(null); // for Update Contract modal
  const [toastMessage, setToastMessage] = useState('');

  // ── Calculated Metrics ─────────────────────────────────────
  const stats = useMemo(() => {
    const followUpsCount = customers.filter((c) => c.needsFollowUp).length;
    const appointmentsCount = customers.filter((c) => c.appointmentToday).length;
    const renewalsCount = customers.filter((c) => c.isRenewalUpcoming).length;
    const pendingTasksCount = customers.filter((c) => c.pendingTask).length;

    const settledRevenue = customers
      .filter((c) => c.commissionStatus === 'Settled')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    const pendingRevenue = customers
      .filter((c) => c.commissionStatus === 'Pending Carrier Review')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    return {
      followUpsCount,
      appointmentsCount,
      renewalsCount,
      pendingTasksCount,
      settledRevenue,
      pendingRevenue,
      totalActivePolicies: 214, // Simulated full portfolio
    };
  }, [customers]);

  // ── Filtered Customers ─────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.carrier.toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q);

      // Category
      const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;

      // Status
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;

      // Priority Action Tab
      let matchPriority = true;
      if (priorityFilter === 'FollowUp') matchPriority = c.needsFollowUp;
      if (priorityFilter === 'Appointment') matchPriority = Boolean(c.appointmentToday);
      if (priorityFilter === 'Renewal') matchPriority = c.isRenewalUpcoming;
      if (priorityFilter === 'Task') matchPriority = Boolean(c.pendingTask);

      return matchSearch && matchCategory && matchStatus && matchPriority;
    });
  }, [customers, searchQuery, categoryFilter, statusFilter, priorityFilter]);

  // ── Handlers ───────────────────────────────────────────────
  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  function handleSaveContract(e) {
    e.preventDefault();
    if (!editingContract) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === editingContract.id) {
          const isNowActive = editingContract.status === 'Approved & Active' || editingContract.status === 'Active';
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

    showToast(`Hợp đồng của ${editingContract.name} đã được cập nhật thành công!`);
    setEditingContract(null);
  }

  return (
    <DashboardLayout>
      {/* ── Toast Notification ─────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 01: AGENT IDENTITY & HEADER ──────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-muted">
              AgentFlow Workspace • NPN #1984210
            </span>
          </div>
          <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
            Good day, {user?.name?.split(' ')[0] || 'Khánh'} 🧑‍💼
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Independent Agent Workspace • Licensed in Texas (TDI), California (CDI) &amp; Florida
          </p>
        </div>

        {/* Workflow Quick Jump Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-stroke-subtle shrink-0">
          <button
            onClick={() => { setActiveTab('all'); setPriorityFilter('All'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Overview
          </button>
          <button
            onClick={() => { setActiveTab('priorities'); setPriorityFilter('All'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'priorities'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>02 Priorities</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
              {stats.followUpsCount + stats.appointmentsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            03 Customers (200+)
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'commission'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            05 Commission
          </button>
        </div>
      </div>

      {/* ── Operational Status Banner (Like StaffDashboard) ──── */}
      <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-stroke-subtle text-on-surface">
        <span className="material-symbols-outlined text-[22px] text-[#C8A96B] shrink-0 mt-0.5">verified</span>
        <div className="text-body-sm font-body-sm flex-grow">
          <strong className="font-bold text-primary">Core Agent Workflow Active:</strong>{' '}
          <span className="text-on-surface-variant">
            01 Login → 02 Priorities → 03 Customer Management → 04 Update Contract → 05 Commission.
            Dữ liệu kết nối tự động cập nhật hoa hồng ngay khi hợp đồng được duyệt.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          CMS &amp; HIPAA Compliant
        </div>
      </div>

      {/* ── 02: TODAY'S PRIORITIES (4 Action Stat Cards) ──────── */}
      {(activeTab === 'all' || activeTab === 'priorities') && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#C8A96B]">notification_important</span>
              <span>Today's Priorities — Morning Cockpit</span>
            </h3>
            <span className="text-xs text-on-surface-variant">
              Click vào thẻ để lọc danh sách khách hàng tương ứng
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Follow-up Leads */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setPriorityFilter(priorityFilter === 'FollowUp' ? 'All' : 'FollowUp')}
              className={`rounded-2xl border p-5 shadow-sm transition-all cursor-pointer ${
                priorityFilter === 'FollowUp'
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                  : 'bg-surface-container-lowest border-stroke-subtle hover:border-primary/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[22px] text-rose-600">phone_callback</span>
              </div>
              <div className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {stats.followUpsCount}
              </div>
              <div className="text-body-sm font-body-sm font-semibold text-rose-800">Customers to Follow-Up</div>
              <div className="text-xs text-on-surface-variant mt-1">Cần gọi tư vấn &lt; 24h</div>
            </motion.div>

            {/* 2. Appointments Today */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setPriorityFilter(priorityFilter === 'Appointment' ? 'All' : 'Appointment')}
              className={`rounded-2xl border p-5 shadow-sm transition-all cursor-pointer ${
                priorityFilter === 'Appointment'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                  : 'bg-surface-container-lowest border-stroke-subtle hover:border-primary/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[22px] text-amber-700">calendar_month</span>
              </div>
              <div className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {stats.appointmentsCount}
              </div>
              <div className="text-body-sm font-body-sm font-semibold text-amber-900">Today's Appointments</div>
              <div className="text-xs text-on-surface-variant mt-1">Lịch hẹn Zoom / Điện thoại</div>
            </motion.div>

            {/* 3. Upcoming Renewals */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setPriorityFilter(priorityFilter === 'Renewal' ? 'All' : 'Renewal')}
              className={`rounded-2xl border p-5 shadow-sm transition-all cursor-pointer ${
                priorityFilter === 'Renewal'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400'
                  : 'bg-surface-container-lowest border-stroke-subtle hover:border-primary/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[22px] text-purple-700">autorenew</span>
              </div>
              <div className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {stats.renewalsCount}
              </div>
              <div className="text-body-sm font-body-sm font-semibold text-purple-900">Upcoming Renewals</div>
              <div className="text-xs text-on-surface-variant mt-1">Mùa AEP / ACA Open Enrollment</div>
            </motion.div>

            {/* 4. Important Tasks / Underwriting */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setPriorityFilter(priorityFilter === 'Task' ? 'All' : 'Task')}
              className={`rounded-2xl border p-5 shadow-sm transition-all cursor-pointer ${
                priorityFilter === 'Task'
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                  : 'bg-surface-container-lowest border-stroke-subtle hover:border-primary/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[22px] text-blue-700">assignment_late</span>
              </div>
              <div className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {stats.pendingTasksCount}
              </div>
              <div className="text-body-sm font-body-sm font-semibold text-blue-900">Important Tasks</div>
              <div className="text-xs text-on-surface-variant mt-1">Bổ sung Proof of Income / Ký đơn</div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── 03: CUSTOMER MANAGEMENT TABLE ─────────────────────── */}
      {(activeTab === 'all' || activeTab === 'customers' || activeTab === 'priorities') && (
        <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-sm overflow-hidden mb-8">
          {/* Table Header & Controls */}
          <div className="p-6 border-b border-stroke-subtle">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-title-md font-title-md font-bold text-on-surface flex items-center gap-2">
                  <span>Customer 360 &amp; Contract Management</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    {filteredCustomers.length} of {stats.totalActivePolicies}+ Clients
                  </span>
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                  Tra cứu, xem thông tin bảo hiểm chi tiết và cập nhật tiến độ hợp đồng.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full lg:w-72">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên, số phone, policy #..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stroke-subtle bg-surface text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stroke-subtle/50 text-xs">
              <span className="font-bold text-on-surface-variant mr-1">Dòng sản phẩm:</span>
              {['All', 'Medicare', 'ObamaCare', 'Life'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả' : cat}
                </button>
              ))}

              <div className="hidden sm:block h-4 w-px bg-stroke-subtle mx-2" />

              <span className="font-bold text-on-surface-variant mr-1">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stroke-subtle bg-surface text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
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
                  className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                >
                  <span>Đang lọc: {priorityFilter}</span>
                  <span>✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm font-body-sm">
              <thead className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Khách hàng</th>
                  <th className="px-6 py-3 text-left">Gói bảo hiểm &amp; Hãng</th>
                  <th className="px-6 py-3 text-left">Liên hệ</th>
                  <th className="px-6 py-3 text-left">Kỳ hạn / Lịch hẹn</th>
                  <th className="px-6 py-3 text-left">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-subtle">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[36px] text-outline mb-2">person_search</span>
                      <p className="font-semibold text-sm">Không tìm thấy khách hàng phù hợp</p>
                      <button
                        onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('All'); setPriorityFilter('All'); }}
                        className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                      {/* Name & Language */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-on-surface flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="hover:text-primary hover:underline text-left cursor-pointer font-bold"
                          >
                            {c.name}
                          </button>
                        </div>
                        <div className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-muted">{c.city}</span>
                          <span>•</span>
                          <span className="text-[11px] font-mono text-[#C8A96B]">{c.lang}</span>
                        </div>
                      </td>

                      {/* Type & Carrier */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-on-surface">{c.type}</div>
                        <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-primary">{c.carrier}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{c.policyNumber}</span>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="px-6 py-4">
                        <a
                          href={`tel:${c.phone.replace(/\D/g, '')}`}
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">call</span>
                          {c.phone}
                        </a>
                        <div className="text-xs text-on-surface-variant truncate max-w-[140px]">{c.email}</div>
                      </td>

                      {/* Priorities / Dates */}
                      <td className="px-6 py-4 text-xs">
                        {c.appointmentToday && (
                          <div className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 font-semibold px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {c.appointmentToday}
                          </div>
                        )}
                        {c.isRenewalUpcoming && (
                          <div className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 font-semibold px-2 py-0.5 rounded mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">autorenew</span>
                            Renewal: {c.renewalDate}
                          </div>
                        )}
                        {c.pendingTask && (
                          <div className="text-rose-700 truncate max-w-[180px] font-medium mt-0.5" title={c.pendingTask}>
                            ⚠️ {c.pendingTask}
                          </div>
                        )}
                        {!c.appointmentToday && !c.isRenewalUpcoming && !c.pendingTask && (
                          <span className="text-slate-muted italic">Đã đồng bộ</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                            c.status === 'Active' || c.status === 'Approved & Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'In Underwriting'
                              ? 'bg-amber-100 text-amber-800'
                              : c.status === 'Renewal Required'
                              ? 'bg-purple-100 text-purple-800'
                              : c.status === 'Application Submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition cursor-pointer"
                            title="03 Xem Customer 360"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => setEditingContract(c)}
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                            title="04 Cập nhật hợp đồng"
                          >
                            <span>Update</span>
                            <span className="text-[#C8A96B]">→</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 bg-surface-container/30 border-t border-stroke-subtle flex items-center justify-between text-xs text-on-surface-variant">
            <span>Hiển thị {filteredCustomers.length} khách hàng được chọn lọc trong kỳ</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-muted">Dữ liệu bảo mật tuân thủ HIPAA &amp; CMS</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 05: COMMISSION & REVENUE ANALYTICS ────────────────── */}
      {(activeTab === 'all' || activeTab === 'commission') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-emerald-600">payments</span>
              <span>05 — Commission &amp; Revenue Overview</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Quyết toán trực tiếp từ Carrier / FMO
            </span>
          </div>

          {/* Commission Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-body-sm text-on-surface-variant font-medium">Settled MTD (Tháng này)</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center material-symbols-outlined text-[18px]">
                  account_balance
                </span>
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-700">
                ${stats.settledRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-on-surface-variant mt-1">Đã chi trả về tài khoản ngân hàng</div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-body-sm text-on-surface-variant font-medium">Pending Underwriting</span>
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center material-symbols-outlined text-[18px]">
                  hourglass_top
                </span>
              </div>
              <div className="text-2xl font-serif font-bold text-amber-700">
                ${stats.pendingRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-on-surface-variant mt-1">Dự kiến chi trả khi Carrier phát hành HĐ</div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-body-sm text-on-surface-variant font-medium">YTD Total Commission</span>
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center material-symbols-outlined text-[18px]">
                  trending_up
                </span>
              </div>
              <div className="text-2xl font-serif font-bold text-primary">
                ${(stats.settledRevenue + 37750).toLocaleString()}
              </div>
              <div className="text-xs text-on-surface-variant mt-1">Lũy kế từ đầu năm 2026</div>
            </div>
          </div>

          {/* Contract-Commission Ledger Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stroke-subtle flex items-center justify-between">
              <div>
                <h4 className="font-bold text-on-surface text-sm">Contract-Commission Reconciliation Ledger</h4>
                <p className="text-xs text-on-surface-variant">Bảng kê đối soát hoa hồng chi tiết theo từng hợp đồng</p>
              </div>
              <span className="text-xs font-mono text-[#C8A96B] font-bold">CARRIER DIRECT RECONCILIATION</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm font-body-sm">
                <thead className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Khách hàng</th>
                    <th className="px-6 py-3 text-left">Hãng bảo hiểm</th>
                    <th className="px-6 py-3 text-left">Công thức hoa hồng</th>
                    <th className="px-6 py-3 text-left">Ước tính</th>
                    <th className="px-6 py-3 text-left">Trạng thái Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-subtle">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-on-surface">
                        {c.name}
                        <div className="text-xs font-normal text-on-surface-variant font-mono">{c.policyNumber}</div>
                      </td>
                      <td className="px-6 py-3.5 text-on-surface-variant font-medium">{c.carrier}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-muted">{c.commissionRate}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-on-surface">
                        ${c.commissionAmount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.commissionStatus === 'Settled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
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

      {/* ── 03: CUSTOMER 360 PROFILE MODAL ───────────────────── */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-stroke-subtle shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="p-6 bg-primary text-white rounded-t-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#C8A96B] font-bold uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
                    Customer 360 Full Profile
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    {selectedCustomer.name}
                    <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-white/20 text-white font-normal">
                      Tuổi: {selectedCustomer.age}
                    </span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Contact & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container border border-stroke-subtle text-xs">
                  <div>
                    <span className="text-slate-muted font-bold uppercase">Điện thoại</span>
                    <div className="text-sm font-semibold text-primary mt-0.5">{selectedCustomer.phone}</div>
                  </div>
                  <div>
                    <span className="text-slate-muted font-bold uppercase">Email</span>
                    <div className="text-sm font-semibold text-on-surface mt-0.5 truncate">{selectedCustomer.email}</div>
                  </div>
                  <div>
                    <span className="text-slate-muted font-bold uppercase">Địa chỉ</span>
                    <div className="text-sm font-semibold text-on-surface mt-0.5">{selectedCustomer.city} ({selectedCustomer.zip})</div>
                  </div>
                </div>

                {/* Insurance Details */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted mb-3">
                    Thông tin Hợp đồng &amp; Gói bảo hiểm
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl border border-stroke-subtle bg-surface-container-lowest">
                      <span className="text-xs text-slate-muted block">Hãng bảo hiểm (Carrier)</span>
                      <strong className="text-primary">{selectedCustomer.carrier}</strong>
                    </div>
                    <div className="p-3 rounded-xl border border-stroke-subtle bg-surface-container-lowest">
                      <span className="text-xs text-slate-muted block">Số hợp đồng (Policy #)</span>
                      <strong className="font-mono">{selectedCustomer.policyNumber}</strong>
                    </div>
                    <div className="p-3 rounded-xl border border-stroke-subtle bg-surface-container-lowest">
                      <span className="text-xs text-slate-muted block">Gói bảo hiểm chi tiết</span>
                      <span className="font-medium text-on-surface">{selectedCustomer.planName}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-stroke-subtle bg-surface-container-lowest">
                      <span className="text-xs text-slate-muted block">Phí hàng tháng (Premium)</span>
                      <span className="font-bold text-emerald-700">
                        ${selectedCustomer.premium}/tháng
                        {selectedCustomer.aptcSubsidy > 0 && (
                          <span className="text-xs text-slate-muted font-normal ml-1">
                            (Đã trừ APTC ${selectedCustomer.aptcSubsidy})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical & Doctor Preferences */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted mb-2">
                    Mạng lưới y tế &amp; Ghi chú tư vấn
                  </h4>
                  <div className="p-4 rounded-xl border border-stroke-subtle bg-surface-container-lowest space-y-2 text-xs">
                    <div>
                      <strong className="text-on-surface">Bác sĩ / Bệnh viện quen thuộc: </strong>
                      <span className="text-on-surface-variant">{selectedCustomer.doctor || 'Chưa cập nhật'}</span>
                    </div>
                    <div>
                      <strong className="text-on-surface">Ngôn ngữ tư vấn ưu tiên: </strong>
                      <span className="text-on-surface-variant">{selectedCustomer.lang}</span>
                    </div>
                    <div>
                      <strong className="text-on-surface">Nhật ký tư vấn (Notes): </strong>
                      <p className="text-on-surface-variant mt-1 italic bg-surface-container p-2.5 rounded-lg border border-stroke-subtle">
                        "{selectedCustomer.notes}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-stroke-subtle bg-surface-container flex items-center justify-between">
                <span className="text-xs text-slate-muted">Hồ sơ đã xác minh Scope of Appointment (SOA)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 rounded-xl border border-stroke-subtle text-xs font-semibold hover:bg-surface-container-high transition cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      const c = selectedCustomer;
                      setSelectedCustomer(null);
                      setEditingContract(c);
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Cập nhật Hợp đồng</span>
                    <span className="text-[#C8A96B]">→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 04: UPDATE CONTRACT MODAL ─────────────────────────── */}
      <AnimatePresence>
        {editingContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-stroke-subtle shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 bg-primary text-white rounded-t-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#C8A96B] font-bold uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
                    04 — Update Contract Lifecycle
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    Cập nhật hợp đồng: {editingContract.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingContract(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveContract} className="p-6 space-y-4">
                {/* Contract Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-muted mb-1.5">
                    Trạng thái hợp đồng (Contract Status) *
                  </label>
                  <select
                    value={editingContract.status}
                    onChange={(e) => setEditingContract({ ...editingContract, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke-subtle bg-surface text-sm text-on-surface font-semibold focus:outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-muted mt-1">
                    Chuyển sang "Approved &amp; Active" sẽ tự động ghi nhận hoa hồng vào Bước 05.
                  </p>
                </div>

                {/* Carrier & Policy # */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-muted mb-1.5">
                      Hãng bảo hiểm (Carrier)
                    </label>
                    <select
                      value={editingContract.carrier}
                      onChange={(e) => setEditingContract({ ...editingContract, carrier: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke-subtle bg-surface text-sm text-on-surface font-medium focus:outline-none focus:border-primary"
                    >
                      {CARRIER_OPTIONS.map((carr) => (
                        <option key={carr} value={carr}>
                          {carr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-muted mb-1.5">
                      Số hợp đồng (Policy #)
                    </label>
                    <input
                      type="text"
                      value={editingContract.policyNumber}
                      onChange={(e) => setEditingContract({ ...editingContract, policyNumber: e.target.value })}
                      placeholder="vd: UHC-9821430"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke-subtle bg-surface text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Premium & Subsidy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-muted mb-1.5">
                      Phí hàng tháng ($ Monthly Premium)
                    </label>
                    <input
                      type="number"
                      value={editingContract.premium}
                      onChange={(e) => setEditingContract({ ...editingContract, premium: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke-subtle bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-muted mb-1.5">
                      Trợ cấp APTC ($/tháng)
                    </label>
                    <input
                      type="number"
                      value={editingContract.aptcSubsidy}
                      onChange={(e) => setEditingContract({ ...editingContract, aptcSubsidy: e.target.value })}
                      placeholder="vd: 400"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke-subtle bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Follow-up Status */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-stroke-subtle">
                  <input
                    type="checkbox"
                    id="needsFollowUp"
                    checked={editingContract.needsFollowUp}
                    onChange={(e) => setEditingContract({ ...editingContract, needsFollowUp: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="needsFollowUp" className="text-xs font-bold text-on-surface cursor-pointer">
                    Đánh dấu cần Follow-up tiếp theo (hiển thị tại Bước 02 Priorities)
                  </label>
                </div>

                {/* Consultation Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-muted mb-1.5">
                    Ghi chú tương tác / Nhật ký tư vấn (Notes)
                  </label>
                  <textarea
                    rows={3}
                    value={editingContract.notes}
                    onChange={(e) => setEditingContract({ ...editingContract, notes: e.target.value })}
                    placeholder="Ghi lại thỏa thuận với khách hàng..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke-subtle bg-surface text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-stroke-subtle flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingContract(null)}
                    className="px-4 py-2.5 rounded-xl border border-stroke-subtle text-xs font-semibold hover:bg-surface-container transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#C8A96B]">save</span>
                    <span>Lưu thay đổi hợp đồng</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
