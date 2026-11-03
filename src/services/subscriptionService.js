// ============================================================
// src/services/subscriptionService.js — InsurMatch B2B SaaS Subscriptions & Commissions
// Grounded in Coms.pdf Model: 3 CRM tiers ($39, $79, $199) and sales rep payout
// ============================================================

export const SAAS_PLANS = {
  trial: {
    id: 'trial',
    name: 'Trial 60 Ngày',
    displayName: 'Gói Dùng Thử 60 Ngày',
    monthlyPrice: 0,
    monthlyVnd: 0,
    annualPrice: 0,
    annualVnd: 0,
    salesCommissionRate: 0,
    salesCommissionAmount: 0,
    maxSeats: 1,
    maxContacts: 50,
    features: [
      '1 Licensed Agent Seat (Single User)',
      'Lên đến 50 Hồ sơ Khách hàng (50 Contacts)',
      'Quản lý Leads & Hồ sơ cơ bản',
      'Nhắc lịch & đặt lịch hẹn tự động',
      'Trải nghiệm đầy đủ 60 ngày miễn phí 0đ',
    ],
    recommended: false,
    color: 'amber',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    displayName: 'Starter Plan',
    monthlyPrice: 39,
    monthlyVnd: 990000,
    annualPrice: 399,
    annualVnd: 9900000,
    salesCommissionRate: 0.10,
    salesCommissionAmount: 3.90,
    maxSeats: 1,
    maxContacts: 100,
    features: [
      '1 Licensed Agent Seat (Single User)',
      'Lên đến 100 Hồ sơ Khách hàng (100 Contacts)',
      'Theo dõi Deal & Quy trình ACA / Medicare cơ bản',
      'Cảnh báo Turning 65 & Hạn gia hạn hợp đồng',
      'Hỗ trợ thanh toán VietQR tự động qua PayOS (990.000đ/tháng)',
    ],
    recommended: false,
    color: 'blue',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    displayName: 'Professional Plan',
    monthlyPrice: 79,
    monthlyVnd: 1990000,
    annualPrice: 805,
    annualVnd: 19900000,
    salesCommissionRate: 0.12,
    salesCommissionAmount: 9.48,
    maxSeats: 3,
    maxContacts: 200,
    features: [
      'Tối đa 3 Agent Seats cho đội nhóm',
      'Lên đến 200 Hồ sơ Khách hàng (200 Contacts)',
      'Tùy chỉnh Pipelines & Tự động nhắc việc SLA 48h',
      'Trung tâm cảnh báo sớm Turning 65 & Gia hạn ACA',
      'Bảng đối soát hoa hồng tự động (Nhận 100% từ hãng)',
      'Thanh toán VietQR tự động qua PayOS (1.990.000đ/tháng)',
    ],
    recommended: true,
    color: 'indigo',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    displayName: 'Agency Enterprise Plan',
    monthlyPrice: 199,
    monthlyVnd: 4990000,
    annualPrice: 1999,
    annualVnd: 49900000,
    salesCommissionRate: 0.15,
    salesCommissionAmount: 29.85,
    maxSeats: 10,
    maxContacts: 300,
    features: [
      'Tối đa 10 Seats phân quyền Quản lý / Staff / Agent',
      'Lên đến 300 Hồ sơ Khách hàng (300 Contacts)',
      'Định tuyến Lead & Giám sát hoạt động toàn Agency',
      'Master Commission Ledger đối soát hoa hồng toàn sàn',
      'Dung lượng tài liệu 100GB & Báo cáo chuyên sâu',
      'Thanh toán VietQR tự động qua PayOS (4.990.000đ/tháng)',
    ],
    recommended: false,
    color: 'emerald',
  },
};

export const INITIAL_SUBSCRIBERS = [
  {
    id: 'SUB-101',
    agencyName: 'John Miller Insurance',
    agentName: 'John Miller',
    agentEmail: 'john@insurmatch.us',
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 2,
    maxSeats: 3,
    contactsCount: 84,
    maxContacts: 200,
    salesRep: 'David Pham',
    commissionPaid: 9.48,
    startDate: '2026-01-10',
    nextRenewalDate: '2026-10-10',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'SUB-102',
    agencyName: 'Nguyen Financial & Health',
    agentName: 'Khanh Nguyen',
    agentEmail: 'khanh@insurmatch.us',
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 3,
    contactsCount: 8,
    maxContacts: 200,
    salesRep: 'Sarah Tran',
    commissionPaid: 9.48,
    startDate: '2026-02-01',
    nextRenewalDate: '2026-10-15',
    paymentMethod: 'MasterCard •••• 8812',
  },
  {
    id: 'SUB-103',
    agencyName: 'Bellaire Senior Care Solutions',
    agentName: 'Sean Ngo',
    agentEmail: 'sean@insurmatch.us',
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 2,
    maxSeats: 3,
    contactsCount: 62,
    maxContacts: 200,
    salesRep: 'David Pham',
    commissionPaid: 9.48,
    startDate: '2026-03-01',
    nextRenewalDate: '2026-10-01',
    paymentMethod: 'Visa •••• 1902',
  },
  {
    id: 'SUB-104',
    agencyName: 'Lone Star Benefits Group',
    agentName: 'Anh Que Pham CPA',
    agentEmail: 'anhque@insurmatch.us',
    plan: 'Agency',
    billingCycle: 'Annual',
    price: 199,
    status: 'Active',
    seatsUsed: 8,
    maxSeats: 10,
    contactsCount: 245,
    maxContacts: 300,
    salesRep: 'Direct / Founder',
    commissionPaid: 0.00,
    startDate: '2025-08-15',
    nextRenewalDate: '2027-08-15',
    paymentMethod: 'Corporate ACH •••• 9921',
  },
  {
    id: 'SUB-105',
    agencyName: 'Carol Davis Independent Practice',
    agentName: 'Carol Davis',
    agentEmail: 'carol.davis@insurmatch.us',
    plan: 'Starter',
    billingCycle: 'Monthly',
    price: 39,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 1,
    contactsCount: 45,
    maxContacts: 100,
    salesRep: 'Sarah Tran',
    commissionPaid: 3.90,
    startDate: '2026-04-10',
    nextRenewalDate: '2026-10-10',
    paymentMethod: 'Amex •••• 3001',
  },
  {
    id: 'SUB-106',
    agencyName: 'Amy Vo Health & Life',
    agentName: 'Amy Vo',
    agentEmail: 'amyvo@insurmatch.us',
    plan: 'Starter',
    billingCycle: 'Monthly',
    price: 39,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 1,
    contactsCount: 58,
    maxContacts: 100,
    salesRep: 'David Pham',
    commissionPaid: 3.90,
    startDate: '2026-05-18',
    nextRenewalDate: '2026-10-18',
    paymentMethod: 'Visa •••• 5519',
  },
  {
    id: 'SUB-107',
    agencyName: 'Sunbelt Medicare Specialists',
    agentName: 'Nancy Pham',
    agentEmail: 'nancy@insurmatch.us',
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 3,
    maxSeats: 3,
    contactsCount: 119,
    maxContacts: 200,
    salesRep: 'David Pham',
    commissionPaid: 9.48,
    startDate: '2026-02-15',
    nextRenewalDate: '2026-10-15',
    paymentMethod: 'Visa •••• 7731',
  },
  {
    id: 'SUB-108',
    agencyName: 'Valley Health Benefits',
    agentName: 'Robert Taylor',
    agentEmail: 'robert@insurmatch.us',
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 2,
    maxSeats: 3,
    contactsCount: 89,
    maxContacts: 200,
    salesRep: 'Sarah Tran',
    commissionPaid: 9.48,
    startDate: '2026-03-20',
    nextRenewalDate: '2026-10-20',
    paymentMethod: 'MasterCard •••• 6610',
  },
  {
    id: 'SUB-109',
    agencyName: 'Golden State Insurance Partners',
    agentName: 'Bijou Tran',
    agentEmail: 'bijou@insurmatch.us',
    plan: 'Agency',
    billingCycle: 'Monthly',
    price: 199,
    status: 'Active',
    seatsUsed: 5,
    maxSeats: 10,
    contactsCount: 2150,
    maxContacts: 300,
    salesRep: 'Sarah Tran',
    commissionPaid: 29.85,
    startDate: '2026-06-01',
    nextRenewalDate: '2026-10-01',
    paymentMethod: 'Visa •••• 8104',
  },
  {
    id: 'SUB-110',
    agencyName: 'Austin Marketplace Advisors',
    agentName: 'Michael Chen',
    agentEmail: 'mchen@insurmatch.us',
    plan: 'Starter',
    billingCycle: 'Monthly',
    price: 39,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 1,
    contactsCount: 110,
    maxContacts: 500,
    salesRep: 'Inbound Web',
    commissionPaid: 0.00,
    startDate: '2026-09-01',
    nextRenewalDate: '2026-10-01',
    paymentMethod: 'MasterCard •••• 4490',
  },
  {
    id: 'SUB-111',
    agencyName: 'Pacific Northwest Benefits',
    agentName: 'Brian Nguyen',
    agentEmail: 'brian@insurmatch.us',
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 2,
    maxSeats: 3,
    contactsCount: 43,
    maxContacts: 200,
    salesRep: 'David Pham',
    commissionPaid: 9.48,
    startDate: '2026-04-01',
    nextRenewalDate: '2026-10-01',
    paymentMethod: 'Visa •••• 9201',
  },
  {
    id: 'SUB-112',
    agencyName: 'DFW Health Coverage Hub',
    agentName: 'Ken Hoang',
    agentEmail: 'ken@insurmatch.us',
    plan: 'Starter',
    billingCycle: 'Monthly',
    price: 39,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 1,
    contactsCount: 35,
    maxContacts: 100,
    salesRep: 'Inbound Web',
    commissionPaid: 3.90,
    startDate: '2026-08-10',
    nextRenewalDate: '2026-10-10',
    paymentMethod: 'Visa •••• 1120',
  },
];

const SUBSCRIBERS_STORAGE_KEY = 'insurmatch_saas_subscribers';
const INVOICES_STORAGE_KEY = 'insurmatch_saas_invoices';

export function getSubscribers() {
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[subscriptionService] error reading subscribers:', err);
  }
  return INITIAL_SUBSCRIBERS;
}

export function saveSubscribers(list) {
  try {
    localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('insurmatch_subscriptions_updated', { detail: list }));
    }
  } catch (err) {
    console.warn('[subscriptionService] error saving subscribers:', err);
  }
}

export function getAgentSubscription(agentIdentifier) {
  const subscribers = getSubscribers();
  const search = String(agentIdentifier || '').trim().toLowerCase();

  const found = subscribers.find((s) => {
    return (
      (s.agentName && s.agentName.toLowerCase() === search) ||
      (s.agentEmail && s.agentEmail.toLowerCase() === search) ||
      (s.agentName && search.includes(s.agentName.toLowerCase())) ||
      (search && s.agentName && s.agentName.toLowerCase().includes(search))
    );
  });

  if (found) return found;

  // Fallback to default Trial 60-Day subscription matching PostgreSQL backend default
  const defaultSub = {
    id: `SUB-${Math.floor(200 + Math.random() * 800)}`,
    agencyName: `${agentIdentifier || 'Agent'} Insurance Agency`,
    agentName: agentIdentifier || 'Khanh Nguyen',
    agentEmail: `${String(agentIdentifier || 'agent').toLowerCase().replace(/\s+/g, '')}@insurmatch.us`,
    plan: 'Trial 60 Ngày',
    planTier: 'TRIAL',
    billingCycle: 'Monthly',
    price: 0,
    priceVnd: 0,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 1,
    contactsCount: 0,
    maxContacts: 50,
    salesRep: 'Direct',
    commissionPaid: 0.00,
    startDate: new Date().toISOString().split('T')[0],
    nextRenewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Dùng thử 60 ngày ($0)',
  };

  const updated = [defaultSub, ...subscribers];
  saveSubscribers(updated);
  return defaultSub;
}

export function subscribeOrUpgradePlan({
  agentName,
  agentEmail,
  planKey, // 'starter' | 'professional' | 'agency'
  billingCycle = 'Monthly', // 'Monthly' | 'Annual'
  paymentMethod = 'Visa •••• 4242',
  salesRep = 'David Pham',
}) {
  const planInfo = SAAS_PLANS[planKey.toLowerCase()] || SAAS_PLANS.professional;
  const subscribers = getSubscribers();
  const searchName = String(agentName || '').trim().toLowerCase();
  const searchEmail = String(agentEmail || '').trim().toLowerCase();

  const price = billingCycle === 'Annual' ? Math.round(planInfo.annualPrice / 12) : planInfo.monthlyPrice;
  const commPaid = Number((price * planInfo.salesCommissionRate).toFixed(2));
  const renewalDays = billingCycle === 'Annual' ? 365 : 30;
  const nextRenewalDate = new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  let targetSub = subscribers.find((s) => {
    return (
      (s.agentName && s.agentName.toLowerCase() === searchName) ||
      (s.agentEmail && s.agentEmail.toLowerCase() === searchEmail) ||
      (searchName && s.agentName && s.agentName.toLowerCase().includes(searchName))
    );
  });

  let updatedList;
  if (targetSub) {
    targetSub = {
      ...targetSub,
      plan: planInfo.name,
      billingCycle,
      price,
      maxSeats: planInfo.maxSeats,
      maxContacts: planInfo.maxContacts,
      commissionPaid: commPaid,
      nextRenewalDate,
      paymentMethod,
      status: 'Active',
      updatedAt: new Date().toISOString(),
    };
    updatedList = subscribers.map((s) => (s.id === targetSub.id ? targetSub : s));
  } else {
    targetSub = {
      id: `SUB-${Math.floor(300 + Math.random() * 700)}`,
      agencyName: `${agentName || 'Agent'} Insurance Agency`,
      agentName: agentName || 'Independent Agent',
      agentEmail: agentEmail || 'agent@insurmatch.us',
      plan: planInfo.name,
      billingCycle,
      price,
      status: 'Active',
      seatsUsed: 1,
      maxSeats: planInfo.maxSeats,
      contactsCount: 45,
      maxContacts: planInfo.maxContacts,
      salesRep,
      commissionPaid: commPaid,
      startDate: new Date().toISOString().split('T')[0],
      nextRenewalDate,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
    updatedList = [targetSub, ...subscribers];
  }

  saveSubscribers(updatedList);

  // Record an Invoice
  addInvoice({
    invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    agentName: targetSub.agentName,
    agentEmail: targetSub.agentEmail,
    planName: planInfo.name,
    amount: billingCycle === 'Annual' ? planInfo.annualPrice : planInfo.monthlyPrice,
    billingCycle,
    paymentMethod,
    status: 'Paid',
    paidAt: new Date().toISOString(),
  });

  return targetSub;
}

export function addInvoice(invoice) {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    const invoices = raw ? JSON.parse(raw) : [];
    invoices.unshift(invoice);
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.warn('[subscriptionService] error saving invoice:', err);
  }
}

export function getInvoicesForAgent(agentNameOrEmail) {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    const invoices = raw ? JSON.parse(raw) : [];
    const search = String(agentNameOrEmail || '').trim().toLowerCase();
    const filtered = invoices.filter(
      (inv) =>
        (inv.agentName && inv.agentName.toLowerCase().includes(search)) ||
        (inv.agentEmail && inv.agentEmail.toLowerCase() === search)
    );
    if (filtered.length > 0) return filtered;
  } catch (err) {
    console.warn('[subscriptionService] error loading invoices:', err);
  }

  // Fallback initial sample invoices for demo
  return [
    {
      invoiceId: 'INV-2026-8819',
      agentName: agentNameOrEmail || 'Khanh Nguyen',
      agentEmail: 'khanh@insurmatch.us',
      planName: 'Professional',
      amount: 79.0,
      billingCycle: 'Monthly',
      paymentMethod: 'MasterCard •••• 8812',
      status: 'Paid',
      paidAt: '2026-09-15T09:30:00Z',
    },
    {
      invoiceId: 'INV-2026-7241',
      agentName: agentNameOrEmail || 'Khanh Nguyen',
      agentEmail: 'khanh@insurmatch.us',
      planName: 'Professional',
      amount: 79.0,
      billingCycle: 'Monthly',
      paymentMethod: 'MasterCard •••• 8812',
      status: 'Paid',
      paidAt: '2026-08-15T10:14:00Z',
    },
  ];
}

export function calculateRealFinancials(subscribersList) {
  const activeSubs = (subscribersList || []).filter((s) => s.status === 'Active');

  let starterCount = 0;
  let proCount = 0;
  let agencyCount = 0;
  let totalMRR = 0;
  let totalSalesComm = 0;

  activeSubs.forEach((sub) => {
    const planLower = (sub.plan || '').toLowerCase();
    const price = Number(sub.price) || 0;
    const comm = Number(sub.commissionPaid) || 0;

    totalMRR += price;
    totalSalesComm += comm;

    if (planLower.includes('starter')) {
      starterCount += 1;
    } else if (planLower.includes('pro')) {
      proCount += 1;
    } else if (planLower.includes('agency')) {
      agencyCount += 1;
    }
  });

  const totalARR = totalMRR * 12;
  const netRevenue = totalMRR - totalSalesComm;
  const fixedInfraCost = 350; // Coms.pdf fixed infra cost
  const estimatedNetProfit = netRevenue - fixedInfraCost;

  return {
    starterCount,
    proCount,
    agencyCount,
    totalSubscribers: activeSubs.length,
    totalMRR,
    totalARR,
    totalSalesComm,
    netRevenue,
    fixedInfraCost,
    estimatedNetProfit,
  };
}


// ============================================================
// PayOS & Real Spring Boot Backend API Integration
// ============================================================
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('tbri_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 1. Khởi tạo liên kết thanh toán VietQR qua PayOS
 */
export async function createPayosPaymentLink({ planTier = 'PROFESSIONAL', billingCycle = 'MONTHLY' }) {
  const res = await fetch(`${API_BASE}/payments/payos/create-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      planTier: planTier.toUpperCase(),
      billingCycle: billingCycle.toUpperCase(),
    }),
  });
  const json = await res.json();
  if (res.ok && (json.success || json.data)) {
    return json.data || json;
  }
  throw new Error(json.message || 'Không thể tạo liên kết thanh toán PayOS');
}

/**
 * 2. Kiểm tra trạng thái thanh toán đơn hàng (Polling)
 */
export async function checkPayosPaymentStatus(orderCode) {
  const res = await fetch(`${API_BASE}/payments/payos/check/${orderCode}`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  return json.data || json;
}

/**
 * 3. Mô phỏng thanh toán VietQR thành công (Dành riêng cho Demo)
 */
export async function simulatePayosPaymentSuccess(orderCode) {
  const res = await fetch(`${API_BASE}/payments/payos/simulate-success/${orderCode}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  return json.data || json;
}

/**
 * 4. Lấy thông tin gói dịch vụ & hạn mức thực tế từ Spring Boot Backend
 */
export async function fetchMyBackendSubscription() {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/my-plan`, {
      headers: { ...getAuthHeader() },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('[Subscription] fetchMyBackendSubscription error:', err.message);
  }
  return null;
}

/**
 * 5. Báo cáo doanh thu & danh sách gói mua dành riêng cho Admin
 */
export async function fetchAdminBackendSubscriptions() {
  const res = await fetch(`${API_BASE}/admin/subscriptions`, {
    headers: { ...getAuthHeader() },
  });
  const json = await res.json();
  return json.data || json;
}

/**
 * 6. Lấy danh sách toàn bộ các gói SaaS trực tiếp từ Database PostgreSQL (Bảng saas_plans)
 */
export async function fetchPublicSaasPlans() {
  try {
    const res = await fetch(`${API_BASE}/saas-plans`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[Subscription] fetchPublicSaasPlans error, falling back to local defaults:', err.message);
  }
  return null;
}
