// ============================================================
// src/services/subscriptionService.js — InsurMatch B2B SaaS Subscriptions & Commissions
// Grounded in Coms.pdf Model: 3 CRM tiers ($39, $79, $199) and sales rep payout
// ============================================================

export const SAAS_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    displayName: 'Gói Starter (Khởi động)',
    monthlyPrice: 39,
    annualPrice: 399, // ~33/mo
    salesCommissionRate: 0.10, // 10%
    salesCommissionAmount: 3.90,
    maxSeats: 1,
    maxContacts: 500,
    features: [
      '1 Tài khoản Đại lý (Single Seat)',
      'Tối đa 500 Hồ sơ khách hàng',
      'Quản lý Deal & Contact cơ bản',
      'Theo dõi hạn thanh toán & Cảnh báo',
      'Hỗ trợ kỹ thuật qua Email',
    ],
    recommended: false,
    color: 'blue',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    displayName: 'Gói Professional (Chuyên nghiệp)',
    monthlyPrice: 79,
    annualPrice: 805, // ~67/mo (15% off)
    salesCommissionRate: 0.12, // 12%
    salesCommissionAmount: 9.48,
    maxSeats: 3,
    maxContacts: 2500,
    features: [
      'Tối đa 3 Tài khoản (Seats) cho Team',
      'Tối đa 2,500 Hồ sơ khách hàng',
      'Tự động hóa tác vụ & Nhắc việc thông minh',
      'Quản lý Ticket dịch vụ sau bán & SLA cảnh báo quá hạn 48h',
      'Theo dõi bảng phân bổ hoa hồng (SSS Tiers)',
      'Tích hợp Marketplace & Lưu trữ tài liệu 25GB',
      'Hỗ trợ ưu tiên qua Hotline & Chat 24/7',
    ],
    recommended: true,
    color: 'indigo',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    displayName: 'Gói Agency (Tổng đại lý)',
    monthlyPrice: 199,
    annualPrice: 1999, // ~166/mo (16% off)
    salesCommissionRate: 0.15, // 15%
    salesCommissionAmount: 29.85,
    maxSeats: 10,
    maxContacts: 999999,
    features: [
      'Tối đa 10 Seats (Mở rộng thêm seat linh hoạt)',
      'Không giới hạn số lượng hồ sơ khách hàng',
      'Phân quyền Master Deals & Giám sát NPN theo AOR',
      'Điều phối hàng đợi Match Queue Lead tự động',
      'Tích hợp Webhook & REST API toàn diện',
      'Báo cáo & Phân tích chuyên sâu cho Quản trị viên',
      'Quản lý tài khoản riêng biệt & Hỗ trợ kỹ thuật chuyên biệt 24/7',
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
    contactsCount: 840,
    maxContacts: 2500,
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
    contactsCount: 142,
    maxContacts: 2500,
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
    contactsCount: 620,
    maxContacts: 2500,
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
    contactsCount: 3820,
    maxContacts: 999999,
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
    contactsCount: 185,
    maxContacts: 500,
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
    contactsCount: 290,
    maxContacts: 500,
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
    contactsCount: 1190,
    maxContacts: 2500,
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
    contactsCount: 890,
    maxContacts: 2500,
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
    maxContacts: 999999,
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
    contactsCount: 430,
    maxContacts: 2500,
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
    contactsCount: 95,
    maxContacts: 500,
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

  // Fallback to default Professional subscription for the agent
  const defaultSub = {
    id: `SUB-${Math.floor(200 + Math.random() * 800)}`,
    agencyName: `${agentIdentifier || 'Agent'} Insurance Agency`,
    agentName: agentIdentifier || 'Khanh Nguyen',
    agentEmail: `${String(agentIdentifier || 'agent').toLowerCase().replace(/\s+/g, '')}@insurmatch.us`,
    plan: 'Professional',
    billingCycle: 'Monthly',
    price: 79,
    status: 'Active',
    seatsUsed: 1,
    maxSeats: 3,
    contactsCount: 142,
    maxContacts: 2500,
    salesRep: 'David Pham',
    commissionPaid: 9.48,
    startDate: new Date().toISOString().split('T')[0],
    nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Visa •••• 4242',
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
