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

export function getAllPlatformMembers() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('insurmatch_admin_accounts') : null;
    const all = raw ? JSON.parse(raw) : [];
    if (Array.isArray(all) && all.length > 0) {
      return all.map((a) => {
        const email = a.email || '';
        const handle = email.includes('@') ? email.split('@')[0] : (a.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member');
        return {
          id: String(a.id || ''),
          name: a.name || a.fullName || 'Member',
          fullName: a.name || a.fullName || 'Member',
          email,
          handle,
          role: (a.role || 'agent').toLowerCase(),
          avatar: a.avatar || getAccountAvatar(a.name || a.fullName),
          bg: a.bg || 'bg-slate-700 text-white',
          npn: a.npn || '',
          status: a.status || 'Active',
          department: a.department || 'Operations',
        };
      });
    }
  } catch {}
  return [];
}
