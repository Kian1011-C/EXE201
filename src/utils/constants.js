export const ACA_ACCOUNT_STATUS_OPTIONS = [
  'Need Create ACA Account',
  'Pending - Waiting for Document',
  'Uploaded - Waiting for Verification',
  'VERIFIED',
  'Unverified - Can not Create',
  'DONE',
  'Plan Cancelled',
  '(Trống / Chưa chọn)',
  'Active',
  'Pending',
  'Suspended',
];

export const OBAMACARE_DEAL_STAGES = [
  'New Opportunity/Call to Renew (Obamacare 2026)',
  'Need Agent Contact (Obamacare 2026)',
  'Need to Quote (Obamacare 2026)',
  'Quoted - Need Client Confirm (Obamacare 2026)',
  'Waiting for document (Obamacare 2026)',
  'Uploaded - Waiting for Verification',
  'Need Agent Enroll (Obamacare 2026)',
  'Ready to Enroll (Obamacare 2026)',
  '$0 plan - Ready to enroll (Obamacare 2026)',
  'Enrolled - Need 1st Payment (Obamacare 2026)',
  'Enrolled - 1st Payment done (Obamacare 2026)',
  'Enrolled - Active (Obamacare 2026)',
  'Non-Commission - Active (Obamacare 2026)',
  'Need Telesale Review (Obamacare 2026)',
  'Termination (Obamacare 2026)',
  'Termination - Second Change (Obamacare 2026)',
  'Deal Lost (Obamacare 2026)',
  'Deal Lost - Second Change (Obamacare 2026)',
  'Do not contact (Obamacare 2026)',
  'New Lead',
  'Contacted',
  'Quoted',
  'Enrolled',
  'Closed Won',
  'Closed Lost',
];

export const MEDICARE_DEAL_STAGES = [
  'New Opportunity/Call to Renew (Medicare 2026)',
  'Ready to Enroll (Medicare 2026)',
  'Enrolled (Medicare 2026)',
  'Enrolled - HRA Done (Medicare 2026)',
  'Enrolled - Active (Medicare 2026)',
  'Enrolled - HRA Done - Active (Medicare 2026)',
  'Auto Renew - Active (Medicare 2026)',
  'Need Telesale Review (Medicare 2026)',
  'Deal Lost (Medicare 2026)',
  'Deal Lost - Second Change (Medicare 2026)',
  'Do Not Contact (Medicare 2026)',
  'New Lead',
  'Contacted',
  'App Submitted',
  'Approved',
  'Closed Won',
  'Closed Lost',
];

export const ALL_CARRIERS = [
  'BCBS',
  'Ambetter',
  'UnitedHealthcare',
  'Oscar',
  'Molina Healthcare',
  'Aetna',
  'Cigna',
  'Kaiser Permanente',
  'Humana',
  'Premera Blue Cross',
  'Blue Shield of California',
  'Anthem Blue Cross',
  'Wellcare',
  'CareSource',
  'Health Net',
  'Amerigroup',
  'Blue Cross',
  'Molina',
  'Kaiser',
];

export const CARRIER_COMMISSION_RATES = {
  'BCBS': {
    code: 'BCBS',
    name: 'Blue Cross Blue Shield (BCBS)',
    pmpm: 30.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 30.0,
    monthlyPer2Members: 60.0,
    monthlyPer4Members: 120.0,
    annualPerDeal1Member: 360.0,
    category: 'Obamacare / ACA',
    notes: 'Tiêu chuẩn liên bang ACA ($30.00 PMPM)',
  },
  'Ambetter': {
    code: 'Ambetter',
    name: 'Ambetter (Centene)',
    pmpm: 32.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 32.0,
    monthlyPer2Members: 64.0,
    monthlyPer4Members: 128.0,
    annualPerDeal1Member: 384.0,
    category: 'Obamacare / ACA',
    notes: 'Mức chi trả cao cạnh tranh ($32.00 PMPM)',
  },
  'UnitedHealthcare': {
    code: 'UnitedHealthcare',
    name: 'UnitedHealthcare (UHC)',
    pmpm: 30.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 30.0,
    monthlyPer2Members: 60.0,
    monthlyPer4Members: 120.0,
    annualPerDeal1Member: 360.0,
    category: 'Obamacare / ACA',
    notes: 'Mạng lưới toàn quốc UHC ($30.00 PMPM)',
  },
  'Oscar': {
    code: 'Oscar',
    name: 'Oscar Health',
    pmpm: 30.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 30.0,
    monthlyPer2Members: 60.0,
    monthlyPer4Members: 120.0,
    annualPerDeal1Member: 360.0,
    category: 'Obamacare / ACA',
    notes: 'Nền tảng số hiện đại ACA ($30.00 PMPM)',
  },
  'Molina Healthcare': {
    code: 'Molina Healthcare',
    name: 'Molina Healthcare',
    pmpm: 29.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 29.0,
    monthlyPer2Members: 58.0,
    monthlyPer4Members: 116.0,
    annualPerDeal1Member: 348.0,
    category: 'Obamacare / ACA',
    notes: 'Chuyên dòng Silver CSR ($29.00 PMPM)',
  },
  'Aetna': {
    code: 'Aetna',
    name: 'Aetna / CVS Health',
    pmpm: 31.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 31.0,
    monthlyPer2Members: 62.0,
    monthlyPer4Members: 124.0,
    annualPerDeal1Member: 372.0,
    category: 'Obamacare / ACA',
    notes: 'Tích hợp dịch vụ CVS MinuteClinic ($31.00 PMPM)',
  },
  'Cigna': {
    code: 'Cigna',
    name: 'Cigna Healthcare',
    pmpm: 28.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 28.0,
    monthlyPer2Members: 56.0,
    monthlyPer4Members: 112.0,
    annualPerDeal1Member: 336.0,
    category: 'Obamacare / ACA',
    notes: 'Cigna Connect Individual Plans ($28.00 PMPM)',
  },
  'Kaiser Permanente': {
    code: 'Kaiser Permanente',
    name: 'Kaiser Permanente',
    pmpm: 28.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 28.0,
    monthlyPer2Members: 56.0,
    monthlyPer4Members: 112.0,
    annualPerDeal1Member: 336.0,
    category: 'Obamacare / ACA',
    notes: 'Hệ sinh thái y tế khép kín HMO ($28.00 PMPM)',
  },
  'Humana': {
    code: 'Humana',
    name: 'Humana',
    pmpm: 51.0,
    rateType: 'CMS Monthly',
    typeDesc: 'CMS Standard Monthly ($612/yr)',
    monthlyPer1Member: 51.0,
    monthlyPer2Members: 51.0,
    monthlyPer4Members: 51.0,
    annualPerDeal1Member: 612.0,
    category: 'Medicare Advantage',
    notes: 'Định mức CMS Medicare Initial Year ($51.00/tháng/deal)',
  },
  'Premera Blue Cross': {
    code: 'Premera Blue Cross',
    name: 'Premera Blue Cross',
    pmpm: 32.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 32.0,
    monthlyPer2Members: 64.0,
    monthlyPer4Members: 128.0,
    annualPerDeal1Member: 384.0,
    category: 'Obamacare / ACA',
    notes: 'Thị trường Tây Bắc Washington / Alaska ($32.00 PMPM)',
  },
  'Blue Shield of California': {
    code: 'Blue Shield of California',
    name: 'Blue Shield of California',
    pmpm: 35.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 35.0,
    monthlyPer2Members: 70.0,
    monthlyPer4Members: 140.0,
    annualPerDeal1Member: 420.0,
    category: 'Obamacare / ACA',
    notes: 'Covered California Tier 1 ($35.00 PMPM)',
  },
  'Anthem Blue Cross': {
    code: 'Anthem Blue Cross',
    name: 'Anthem Blue Cross (Elevance)',
    pmpm: 30.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 30.0,
    monthlyPer2Members: 60.0,
    monthlyPer4Members: 120.0,
    annualPerDeal1Member: 360.0,
    category: 'Obamacare / ACA',
    notes: 'Mạng lưới Anthem Blue Cross ($30.00 PMPM)',
  },
  'Wellcare': {
    code: 'Wellcare',
    name: 'Wellcare (Centene)',
    pmpm: 28.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA/Medicare)',
    monthlyPer1Member: 28.0,
    monthlyPer2Members: 56.0,
    monthlyPer4Members: 112.0,
    annualPerDeal1Member: 336.0,
    category: 'Obamacare / ACA',
    notes: 'Sản phẩm bổ trợ ACA & Medicare ($28.00 PMPM)',
  },
  'CareSource': {
    code: 'CareSource',
    name: 'CareSource',
    pmpm: 27.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 27.0,
    monthlyPer2Members: 54.0,
    monthlyPer4Members: 108.0,
    annualPerDeal1Member: 324.0,
    category: 'Obamacare / ACA',
    notes: 'Thị trường Midwest Marketplace ($27.00 PMPM)',
  },
  'Health Net': {
    code: 'Health Net',
    name: 'Health Net',
    pmpm: 29.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 29.0,
    monthlyPer2Members: 58.0,
    monthlyPer4Members: 116.0,
    annualPerDeal1Member: 348.0,
    category: 'Obamacare / ACA',
    notes: 'California Individual & Family ($29.00 PMPM)',
  },
  'Amerigroup': {
    code: 'Amerigroup',
    name: 'Amerigroup',
    pmpm: 28.0,
    rateType: 'PMPM',
    typeDesc: 'Per Member Per Month (ACA)',
    monthlyPer1Member: 28.0,
    monthlyPer2Members: 56.0,
    monthlyPer4Members: 112.0,
    annualPerDeal1Member: 336.0,
    category: 'Obamacare / ACA',
    notes: 'Thị trường Texas & Southeast ($28.00 PMPM)',
  },
};

// Convenient aliases
CARRIER_COMMISSION_RATES['Blue Cross'] = CARRIER_COMMISSION_RATES['BCBS'];
CARRIER_COMMISSION_RATES['Molina'] = CARRIER_COMMISSION_RATES['Molina Healthcare'];
CARRIER_COMMISSION_RATES['Kaiser'] = CARRIER_COMMISSION_RATES['Kaiser Permanente'];

/**
 * Tự động tính hoa hồng của 1 deal mỗi tháng theo hãng bảo hiểm
 * Agent hưởng trọn 100% (Không áp dụng phân chia 7/3)
 * @param {string} carrierName - Tên hãng bảo hiểm
 * @param {number} membersCount - Số thành viên trong hợp đồng (mặc định 1)
 * @returns {object} Chi tiết tính toán chi trả của hãng và số tiền Agent thực nhận (100%)
 */
export function calculateCarrierDealCommission(carrierName, membersCount = 1) {
  const count = Math.max(1, parseInt(membersCount) || 1);
  const clean = String(carrierName || 'BCBS').trim().toLowerCase();

  let matched = CARRIER_COMMISSION_RATES['BCBS'];
  for (const [key, meta] of Object.entries(CARRIER_COMMISSION_RATES)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      matched = meta;
      break;
    }
  }

  const isFlatMonthly = matched.rateType === 'CMS Monthly';
  const monthlyCarrierPayout = isFlatMonthly ? matched.pmpm : matched.pmpm * count;
  const agentPayoutRate = 1.0;
  const platformDeduction = 0.0;
  const agentNetMonthly = monthlyCarrierPayout * agentPayoutRate;
  const agentAnnualProjected = agentNetMonthly * 12;

  return {
    carrierName: matched.name,
    carrierCode: matched.code,
    category: matched.category,
    pmpmRate: matched.pmpm,
    rateType: matched.rateType,
    membersCount: count,
    monthlyCarrierPayout,
    platformDeduction,
    agentPayoutRate: 100,
    agentNetMonthly,
    agentAnnualProjected,
    formula: isFlatMonthly
      ? `$${matched.pmpm.toFixed(2)}/tháng (CMS Standard) → Agent nhận 100% = $${agentNetMonthly.toFixed(2)}/tháng`
      : `$${matched.pmpm.toFixed(2)} PMPM × ${count} người → Agent nhận 100% = $${agentNetMonthly.toFixed(2)}/tháng`,
  };
}

export const ACCOUNT_BG_PALETTE = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-cyan-700 text-white',
  'bg-emerald-600 text-white',
  'bg-teal-700 text-white',
  'bg-amber-600 text-white',
  'bg-orange-600 text-white',
  'bg-rose-600 text-white',
  'bg-purple-600 text-white',
  'bg-violet-600 text-white',
];

export function getAccountAvatar(name) {
  if (!name) return 'U';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function isValidNpn(npn) {
  return /^\d{7,8}$/.test(String(npn || '').trim());
}

export const DEFAULT_AGENT_ACCOUNTS = [
  {
    id: 'ACC-003',
    name: 'Khanh Nguyen',
    fullName: 'Khanh Nguyen',
    email: 'agent@insurmatch.us',
    handle: 'khanhnguyen',
    role: 'agent',
    agencyRole: 'Senior Partner Agent',
    department: 'Medicare & ACA Sales Hub',
    avatar: 'KN',
    bg: 'bg-blue-600 text-white',
    npn: '1984210',
    statesLicensed: ['TX (TDI)', 'CA (CDI)', 'FL'],
    status: 'Active',
    phone: '+1 (838) 776-1434',
    dealsCount: 42,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-004',
    name: 'Sean Ngo',
    fullName: 'Sean Ngo',
    email: 'sean.ngo@insurmatch.us',
    handle: 'seanngo',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'ACA General Enrollment',
    avatar: 'SN',
    bg: 'bg-lime-600 text-white',
    npn: '1994321',
    statesLicensed: ['TX (TDI)', 'FL (FLOIR)'],
    status: 'Active',
    phone: '+1 (832) 555-0144',
    dealsCount: 38,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-005',
    name: 'Ivy Le',
    fullName: 'Ivy Le',
    email: 'ivy.le@insurmatch.us',
    handle: 'ivyle',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'Medicare Specialist Network',
    avatar: 'IL',
    bg: 'bg-orange-600 text-white',
    npn: '1992481',
    statesLicensed: ['CA (CDI)', 'NV'],
    status: 'Active',
    phone: '+1 (714) 555-0182',
    dealsCount: 29,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-006',
    name: 'Sarah Thai',
    fullName: 'Sarah Thai',
    email: 'sarah.thai@insurmatch.us',
    handle: 'sarahthai',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'ACA Individual & Family Plans',
    avatar: 'ST',
    bg: 'bg-sky-600 text-white',
    npn: '2014920',
    statesLicensed: ['TX (TDI)', 'GA'],
    status: 'Active',
    phone: '+1 (281) 555-0193',
    dealsCount: 22,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-007',
    name: 'Jay Ly',
    fullName: 'Jay Ly',
    email: 'jay.ly@insurmatch.us',
    handle: 'jayly',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'Senior Care & Dual Eligible',
    avatar: 'JL',
    bg: 'bg-cyan-600 text-white',
    npn: '1854201',
    statesLicensed: ['AZ', 'TX (TDI)'],
    status: 'Active',
    phone: '+1 (480) 555-0167',
    dealsCount: 19,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-008',
    name: 'Tri Tran',
    fullName: 'Tri Tran',
    email: 'tri.tran@insurmatch.us',
    handle: 'tritran',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'Small Group & Individual Health',
    avatar: 'TT',
    bg: 'bg-emerald-600 text-white',
    npn: '2001186',
    statesLicensed: ['FL (FLOIR)', 'NC'],
    status: 'Active',
    phone: '+1 (407) 555-0128',
    dealsCount: 15,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-009',
    name: 'Quyen Le',
    fullName: 'Quyen Le',
    email: 'quyen.le@insurmatch.us',
    handle: 'quyenle',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'Marketplace Operations',
    avatar: 'QL',
    bg: 'bg-purple-600 text-white',
    npn: '1982341',
    statesLicensed: ['TX (TDI)', 'OH'],
    status: 'Active',
    phone: '+1 (832) 555-0176',
    dealsCount: 14,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-010',
    name: 'Miranda Pham',
    fullName: 'Miranda Pham',
    email: 'miranda.pham@insurmatch.us',
    handle: 'mirandapham',
    role: 'agent',
    agencyRole: 'Licensed Partner Agent',
    department: 'Client Advocacy & Enrollment',
    avatar: 'MP',
    bg: 'bg-pink-600 text-white',
    npn: '2049182',
    statesLicensed: ['CA (CDI)', 'WA'],
    status: 'Active',
    phone: '+1 (408) 555-0155',
    dealsCount: 12,
    complianceStatus: 'Verified & Cleared',
  },
];

export function getAllPlatformMembers() {
  return getActiveAgentAccounts();
}

export function getActiveAgentAccounts() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('insurmatch_admin_accounts') : null;
    let list = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    const isAgent = (a) => {
      if (!a) return false;
      const role = (a.role || '').toLowerCase();
      const name = (a.name || a.fullName || '').toLowerCase();
      if (role !== 'agent' && role !== 'broker') return false;
      if (
        name.includes('admin') ||
        name.includes('staff') ||
        name.includes('platform') ||
        name.includes('insurance') ||
        name.includes('super admin') ||
        name.includes('the best rate')
      ) {
        return false;
      }
      const status = (a.status || '').toLowerCase();
      if (status === 'suspended') return false;
      return true;
    };

    // Candidates: Custom/backend accounts from localStorage + default licensed agent roster
    const candidateList = [...list.filter(isAgent), ...DEFAULT_AGENT_ACCOUNTS];

    const seen = new Set();
    const unique = [];
    for (const a of candidateList) {
      const aName = (a.name || a.fullName || '').trim();
      if (!aName || seen.has(aName.toLowerCase())) continue;
      seen.add(aName.toLowerCase());
      const email = a.email || '';
      const handle = email.includes('@') ? email.split('@')[0] : (aName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'agent');
      unique.push({
        id: String(a.id || aName),
        name: aName,
        fullName: aName,
        email,
        handle,
        role: 'agent',
        agencyRole: a.agencyRole || 'Licensed Partner Agent',
        department: a.department || 'Sales Hub',
        avatar: a.avatar || getAccountAvatar(aName),
        bg: a.bg || 'bg-blue-600 text-white',
        npn: a.npn || '',
        statesLicensed: a.statesLicensed || ['TX (TDI)'],
        status: a.status || 'Active',
        phone: a.phone || '',
        dealsCount: a.dealsCount || 0,
        complianceStatus: a.complianceStatus || 'Verified & Cleared',
      });
    }

    return unique;
  } catch {
    return DEFAULT_AGENT_ACCOUNTS;
  }
}
