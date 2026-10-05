// ============================================================
// mockAdminAccounts.js — InsurMatch Platform Account Roster & Mock CRM Data
// Managed by Administrator Portal (User & Agent Accreditation, Pipeline, Commissions)
// ============================================================

export const INITIAL_ADMIN_ACCOUNTS = [
  {
    id: 'ACC-001',
    name: 'Super Admin',
    email: 'admin@insurmatch.us',
    role: 'admin',
    avatar: 'SA',
    bg: 'bg-rose-700 text-white',
    status: 'Active',
    phone: '+1 (800) 555-0199',
    department: 'Platform Operations & System Governance',
    statesLicensed: ['National'],
    npn: 'MASTER-ADMIN',
    joinedDate: '2025-01-10',
    lastActive: 'Just now',
    dealsCount: 0,
  },
  {
    id: 'ACC-002',
    name: 'Anh Que Pham CPA',
    email: 'anhque@insurmatch.us',
    role: 'agent',
    avatar: 'AQ',
    bg: 'bg-amber-600 text-white',
    status: 'Active',
    phone: '+1 (832) 555-2001',
    agencyRole: 'Principal Broker & Agency Sponsor',
    department: 'Executive Agency Leadership',
    statesLicensed: ['TX (TDI)', 'CA (CDI)', 'FL', 'NC'],
    npn: '20011862',
    joinedDate: '2024-08-15',
    lastActive: '15 mins ago',
    dealsCount: 84,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-003',
    name: 'Khanh Nguyen',
    email: 'khanh@insurmatch.us',
    role: 'agent',
    avatar: 'KN',
    bg: 'bg-blue-600 text-white',
    status: 'Active',
    phone: '+1 (838) 776-1434',
    agencyRole: 'Senior Partner Agent',
    department: 'Medicare & ACA Sales Hub',
    statesLicensed: ['TX (TDI)', 'CA (CDI)', 'FL'],
    npn: '1984210',
    joinedDate: '2025-02-01',
    lastActive: '1 hour ago',
    dealsCount: 42,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-004',
    name: 'Sean Ngo',
    email: 'sean@insurmatch.us',
    role: 'agent',
    avatar: 'SN',
    bg: 'bg-emerald-600 text-white',
    status: 'Active',
    phone: '+1 (713) 442-9901',
    agencyRole: 'Partner Agent',
    department: 'Health & Life Division',
    statesLicensed: ['TX (TDI)', 'NC', 'GA'],
    npn: '1994321',
    joinedDate: '2025-03-12',
    lastActive: '3 hours ago',
    dealsCount: 29,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-005',
    name: 'Anya Nguyen',
    email: 'staff@insurmatch.us',
    role: 'staff',
    avatar: 'AN',
    bg: 'bg-teal-600 text-white',
    status: 'Active',
    phone: '+1 (832) 998-1122',
    department: 'Intake Coordination & Policy Support',
    statesLicensed: ['National Hub'],
    npn: 'STAFF-OPS',
    joinedDate: '2025-01-20',
    lastActive: '5 mins ago',
    dealsCount: 115,
  },
  {
    id: 'ACC-006',
    name: 'Miranda Pham',
    email: 'miranda@insurmatch.us',
    role: 'staff',
    avatar: 'MP',
    bg: 'bg-purple-600 text-white',
    status: 'Active',
    phone: '+1 (832) 998-3344',
    department: 'Document Verification & Client Services',
    statesLicensed: ['National Hub'],
    npn: 'STAFF-OPS',
    joinedDate: '2025-02-15',
    lastActive: '35 mins ago',
    dealsCount: 78,
  },
  {
    id: 'ACC-007',
    name: 'Ivy Le',
    email: 'ivyle@insurmatch.us',
    role: 'agent',
    avatar: 'IL',
    bg: 'bg-orange-500 text-white',
    status: 'Pending NPN',
    phone: '+1 (408) 555-8812',
    agencyRole: 'Associate Agent Applicant',
    department: 'California Regional Hub',
    statesLicensed: ['CA (CDI)', 'WA'],
    npn: 'PENDING_CDI_092',
    joinedDate: '2026-09-10',
    lastActive: 'Yesterday',
    dealsCount: 0,
    complianceStatus: 'State License Check in Progress',
  },
  {
    id: 'ACC-008',
    name: 'James Vu',
    email: 'jamesvu@insurmatch.us',
    role: 'agent',
    avatar: 'JV',
    bg: 'bg-slate-600 text-white',
    status: 'Suspended',
    phone: '+1 (214) 555-7766',
    agencyRole: 'Independent Field Agent',
    department: 'DFW North Hub',
    statesLicensed: ['TX (TDI)'],
    npn: '1854201',
    joinedDate: '2024-11-05',
    lastActive: '7 days ago',
    dealsCount: 18,
    complianceStatus: 'Suspended — AOR Dispute Investigation (SOP 23)',
    suspensionReason: 'Audit flagged unauthorized AOR switch request under review with TDI.',
  },
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-1092',
    action: 'NPN Sponsor Update',
    actor: 'Super Admin',
    target: 'Deal D26005041 (Ken xington Ho)',
    detail: 'Verified master sponsor NPN set to Anh Que Pham 20011862.',
    timestamp: '2026-09-25 10:45 AM',
    type: 'governance',
  },
  {
    id: 'LOG-1091',
    action: 'Agent Accreditation Pending',
    actor: 'System Automation',
    target: 'Ivy Le (ACC-007)',
    detail: 'Application received for CA (CDI) & WA license check.',
    timestamp: '2026-09-24 04:12 PM',
    type: 'compliance',
  },
  {
    id: 'LOG-1090',
    action: 'Sale Support Split Executed',
    actor: 'Super Admin',
    target: 'September 2026 Commission Ledger',
    detail: 'SSS rules applied: NONE (7/3), PARTIAL (5/5), FULL (3/7).',
    timestamp: '2026-09-23 09:30 AM',
    type: 'finance',
  },
  {
    id: 'LOG-1089',
    action: 'Agent Suspension Imposed',
    actor: 'Super Admin',
    target: 'James Vu (ACC-008)',
    detail: 'Temporary license access suspension per SOP 23 & SOP 27.',
    timestamp: '2026-09-18 02:15 PM',
    type: 'security',
  },
  {
    id: 'LOG-1088',
    action: 'Lead Dispatch Acknowledged',
    actor: 'Super Admin',
    target: 'Inquiry INQ-1002 (Hoai thanh Nguyen)',
    detail: 'Dispatched to Senior Partner Agent Khanh Nguyen (TX TDI #1984210).',
    timestamp: '2026-09-17 11:20 AM',
    type: 'governance',
  },
];

export const INITIAL_ADMIN_STATS = {
  totalInquiries: 148,
  activeDeals: 52,
  verifiedAgents: 6,
  staffMembers: 2,
  totalGrossCommission: 58240.0,
  totalNetAgentPayout: 40768.0,
  totalOfficeRetention: 17472.0,
  carrierStats: {
    'Blue Cross Blue Shield': 22,
    'Ambetter Health': 16,
    'UnitedHealthcare': 9,
    'Humana': 5,
  },
  stateStats: {
    'Texas (TX)': 28,
    'California (CA)': 12,
    'Florida (FL)': 8,
    'North Carolina (NC)': 4,
  },
  sssStats: {
    NONE: 32,
    PARTIAL: 14,
    FULL: 6,
  },
  systemHealth: {
    database: 'connected',
    postgresContainer: 'insurmatch_postgres (Up)',
    backendContainer: 'insurmatch_backend (Up)',
    uptime: '99.98%',
    hipaaCompliance: 'Passed / Active',
    cmsCompliance: 'Cleared',
  },
};

export const INITIAL_ADMIN_QUOTES = [
  {
    id: 'INQ-1001',
    contactId: 'CT26002607',
    name: 'Ken xington Ho',
    phone: '+1 (832) 998-9804',
    email: 'kylieho@thesuperiorskilledlearners.com',
    insuranceType: 'ACA Healthcare (Obamacare)',
    state: 'TX',
    preferredLanguage: 'Bilingual (Viet / Eng)',
    assignedAgent: 'Khanh Nguyen',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'Matched & Enrolled',
    date: '2026-09-24, 14:20',
    notes: 'Zip 77036 (Bellaire, Houston) • Household: 3 • APTC Subsidy: $580/mo',
  },
  {
    id: 'INQ-1002',
    contactId: 'CT26002606',
    name: 'Hoai thanh Nguyen',
    phone: '+1 (838) 776-1434',
    email: 'nguyenleminhquang1215@gmail.com',
    insuranceType: 'Medicare Advantage (Part C)',
    state: 'TX',
    preferredLanguage: 'Vietnamese Only',
    assignedAgent: 'Khanh Nguyen',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'Dispatched to Agent',
    date: '2026-09-24, 09:15',
    notes: 'Zip 77449 (Katy, TX) • Age: 67 • Needs Vietnamese PCP and Dental benefit',
  },
  {
    id: 'INQ-1003',
    contactId: 'CT26002605',
    name: 'Ly Le Do',
    phone: '+1 (317) 506-6912',
    email: 'lyledo912@gmail.com',
    insuranceType: 'ACA Healthcare (Obamacare)',
    state: 'CA',
    preferredLanguage: 'Vietnamese',
    assignedAgent: 'Anh Que Pham CPA',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'Matched & Enrolled',
    date: '2026-09-23, 16:40',
    notes: 'Zip 92683 (Westminster / Little Saigon) • Individual Plan',
  },
  {
    id: 'INQ-1004',
    contactId: 'CT26002604',
    name: 'Thao My Tran',
    phone: '+1 (714) 882-3910',
    email: 'thaomy.tran90@yahoo.com',
    insuranceType: 'Term Life Insurance ($500k)',
    state: 'CA',
    preferredLanguage: 'Bilingual',
    assignedAgent: 'Unassigned',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'New Inquiry',
    date: '2026-09-25, 08:30',
    notes: 'Zip 95112 (San Jose, CA) • 35 yrs old • Wants 30-year term coverage',
  },
  {
    id: 'INQ-1005',
    contactId: 'CT26002603',
    name: 'David Quoc Bao Nguyen',
    phone: '+1 (407) 512-8871',
    email: 'david.baonguyen@floridabiz.org',
    insuranceType: 'Small Business Group Health',
    state: 'FL',
    preferredLanguage: 'English',
    assignedAgent: 'Unassigned',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'New Inquiry',
    date: '2026-09-25, 10:12',
    notes: 'Zip 32801 (Orlando, FL) • 6 employees • Nail salon owner group benefits',
  },
  {
    id: 'INQ-1006',
    contactId: 'CT26002602',
    name: 'Bich Thuy Pham',
    phone: '+1 (214) 490-1823',
    email: 'thuypham_dfw@gmail.com',
    insuranceType: 'Medicare Supplement (Plan G)',
    state: 'TX',
    preferredLanguage: 'Vietnamese Only',
    assignedAgent: 'Sean Ngo',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'Dispatched to Agent',
    date: '2026-09-22, 11:05',
    notes: 'Zip 75040 (Garland, TX) • Age: 65 • Turning 65 Initial Enrollment (IEP)',
  },
  {
    id: 'INQ-1007',
    contactId: 'CT26002601',
    name: 'Vinh Quang Le',
    phone: '+1 (984) 220-7119',
    email: 'vinhquangle_nc@hotmail.com',
    insuranceType: 'ACA Healthcare (Obamacare)',
    state: 'NC',
    preferredLanguage: 'Vietnamese',
    assignedAgent: 'Sean Ngo',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'Matched & Enrolled',
    date: '2026-09-21, 15:30',
    notes: 'Zip 27606 (Raleigh, NC) • Household: 2 • Enrolled in BCBS NC Blue Cross',
  },
  {
    id: 'INQ-1008',
    contactId: 'CT26002600',
    name: 'Hong Cam Vo',
    phone: '+1 (832) 334-9988',
    email: 'camvo_houston@yahoo.com',
    insuranceType: 'Whole Life & Living Benefits',
    state: 'TX',
    preferredLanguage: 'Bilingual',
    assignedAgent: 'Unassigned',
    enrolledNpn: 'Anh Que Pham 20011862',
    status: 'New Inquiry',
    date: '2026-09-25, 11:45',
    notes: 'Zip 77083 (Houston, TX) • Wants college fund savings with cash value',
  },
];

export const INITIAL_ADMIN_DEALS = [
  {
    id: 'D26005041',
    code: 'D26005041',
    title: 'Ken xington Ho - BCBS HMO Silver 2026',
    contactName: 'Ken xington Ho',
    dealOwnerName: 'Khanh Nguyen',
    pipeline: 'Obamacare 2026',
    stage: 'Active / Policy Won',
    carrier: 'Blue Cross Blue Shield',
    sellingState: 'Texas (TX)',
    amount: '$340.00 / mo',
    closeDate: '2026-09-24',
    enrolledNpn: 'Anh Que Pham 20011862',
    brokerEffectiveDate: '2026-01-01',
    terminationDate: '2027-12-31',
    primaryMemberId: 'MID-98234710',
    saleSupportStatus: 'None',
    numberMember: 3,
    closedLostReason: '---',
    adminOnly: {
      enrolledNpn: 'Anh Que Pham 20011862',
      brokerEffectiveDate: '2026-01-01',
      terminationDate: '2027-12-31',
      primaryMemberId: 'MID-98234710',
      saleSupportStatus: 'None',
      numberMember: 3,
      carrier: 'Blue Cross Blue Shield',
      sellingState: 'Texas (TX)',
      closedLostReason: '---',
    },
  },
  {
    id: 'D26005042',
    code: 'D26005042',
    title: 'Hoai thanh Nguyen - UHC Dual Complete HMO',
    contactName: 'Hoai thanh Nguyen',
    dealOwnerName: 'Khanh Nguyen',
    pipeline: 'Medicare 2026',
    stage: 'Application Submitted',
    carrier: 'UnitedHealthcare',
    sellingState: 'Texas (TX)',
    amount: '$0.00 / mo (DSNP)',
    closeDate: '2026-10-01',
    enrolledNpn: 'Anh Que Pham 20011862',
    brokerEffectiveDate: '2026-10-01',
    terminationDate: '2027-12-31',
    primaryMemberId: 'MID-81204921',
    saleSupportStatus: 'Partial',
    numberMember: 1,
    closedLostReason: '---',
    adminOnly: {
      enrolledNpn: 'Anh Que Pham 20011862',
      brokerEffectiveDate: '2026-10-01',
      terminationDate: '2027-12-31',
      primaryMemberId: 'MID-81204921',
      saleSupportStatus: 'Partial',
      numberMember: 1,
      carrier: 'UnitedHealthcare',
      sellingState: 'Texas (TX)',
      closedLostReason: '---',
    },
  },
  {
    id: 'D26005043',
    code: 'D26005043',
    title: 'Ly Le Do - Ambetter ClearCare Bronze',
    contactName: 'Ly Le Do',
    dealOwnerName: 'Anh Que Pham CPA',
    pipeline: 'Obamacare 2026',
    stage: 'Active / Policy Won',
    carrier: 'Ambetter Health',
    sellingState: 'California (CA)',
    amount: '$210.00 / mo',
    closeDate: '2026-09-20',
    enrolledNpn: 'Anh Que Pham 20011862',
    brokerEffectiveDate: '2026-01-01',
    terminationDate: '2027-12-31',
    primaryMemberId: 'MID-77312904',
    saleSupportStatus: 'None',
    numberMember: 1,
    closedLostReason: '---',
    adminOnly: {
      enrolledNpn: 'Anh Que Pham 20011862',
      brokerEffectiveDate: '2026-01-01',
      terminationDate: '2027-12-31',
      primaryMemberId: 'MID-77312904',
      saleSupportStatus: 'None',
      numberMember: 1,
      carrier: 'Ambetter Health',
      sellingState: 'California (CA)',
      closedLostReason: '---',
    },
  },
  {
    id: 'D26005044',
    code: 'D26005044',
    title: 'Vinh Quang Le - BCBS NC Blue Cross Silver',
    contactName: 'Vinh Quang Le',
    dealOwnerName: 'Sean Ngo',
    pipeline: 'Obamacare 2026',
    stage: 'Active / Policy Won',
    carrier: 'Blue Cross Blue Shield',
    sellingState: 'North Carolina (NC)',
    amount: '$285.00 / mo',
    closeDate: '2026-09-18',
    enrolledNpn: 'Anh Que Pham 20011862',
    brokerEffectiveDate: '2026-01-01',
    terminationDate: '2027-12-31',
    primaryMemberId: 'MID-66291033',
    saleSupportStatus: 'Partial',
    numberMember: 2,
    closedLostReason: '---',
    adminOnly: {
      enrolledNpn: 'Anh Que Pham 20011862',
      brokerEffectiveDate: '2026-01-01',
      terminationDate: '2027-12-31',
      primaryMemberId: 'MID-66291033',
      saleSupportStatus: 'Partial',
      numberMember: 2,
      carrier: 'Blue Cross Blue Shield',
      sellingState: 'North Carolina (NC)',
      closedLostReason: '---',
    },
  },
  {
    id: 'D26005045',
    code: 'D26005045',
    title: 'Bich Thuy Pham - Humana Gold Plus HMO',
    contactName: 'Bich Thuy Pham',
    dealOwnerName: 'Sean Ngo',
    pipeline: 'Medicare 2026',
    stage: 'Ready to Enroll',
    carrier: 'Humana',
    sellingState: 'Texas (TX)',
    amount: '$0.00 / mo',
    closeDate: '2026-10-15',
    enrolledNpn: 'Anh Que Pham 20011862',
    brokerEffectiveDate: '2026-11-01',
    terminationDate: '2027-12-31',
    primaryMemberId: 'MID-55102948',
    saleSupportStatus: 'None',
    numberMember: 1,
    closedLostReason: '---',
    adminOnly: {
      enrolledNpn: 'Anh Que Pham 20011862',
      brokerEffectiveDate: '2026-11-01',
      terminationDate: '2027-12-31',
      primaryMemberId: 'MID-55102948',
      saleSupportStatus: 'None',
      numberMember: 1,
      carrier: 'Humana',
      sellingState: 'Texas (TX)',
      closedLostReason: '---',
    },
  },
  {
    id: 'D26005046',
    code: 'D26005046',
    title: 'Tam Minh Tran - Mutual of Omaha IUL',
    contactName: 'Tam Minh Tran',
    dealOwnerName: 'Anya Nguyen (Staff)',
    pipeline: 'Life Insurance',
    stage: 'Underwriting Review',
    carrier: 'Mutual of Omaha',
    sellingState: 'Texas (TX)',
    amount: '$450.00 / mo',
    closeDate: '2026-10-30',
    enrolledNpn: 'Anh Que Pham 20011862',
    brokerEffectiveDate: '2026-11-01',
    terminationDate: '2046-11-01',
    primaryMemberId: 'MID-44910293',
    saleSupportStatus: 'Full',
    numberMember: 1,
    closedLostReason: '---',
    adminOnly: {
      enrolledNpn: 'Anh Que Pham 20011862',
      brokerEffectiveDate: '2026-11-01',
      terminationDate: '2046-11-01',
      primaryMemberId: 'MID-44910293',
      saleSupportStatus: 'Full',
      numberMember: 1,
      carrier: 'Mutual of Omaha',
      sellingState: 'Texas (TX)',
      closedLostReason: '---',
    },
  },
  {
    id: 'D26005047',
    code: 'D26005047',
    title: 'Hien Duc Vo - Ambetter Value Gold',
    contactName: 'Hien Duc Vo',
    dealOwnerName: 'James Vu',
    pipeline: 'Obamacare 2026',
    stage: 'Closed Lost',
    carrier: 'Ambetter Health',
    sellingState: 'Texas (TX)',
    amount: '$180.00 / mo',
    closeDate: '2026-09-12',
    enrolledNpn: 'James Vu 1854201',
    brokerEffectiveDate: '2026-01-01',
    terminationDate: '2026-09-12',
    primaryMemberId: 'MID-33291022',
    saleSupportStatus: 'None',
    numberMember: 1,
    closedLostReason: 'Other Party Broker Conflict — Under Investigation (SOP 19)',
    adminOnly: {
      enrolledNpn: 'James Vu 1854201',
      brokerEffectiveDate: '2026-01-01',
      terminationDate: '2026-09-12',
      primaryMemberId: 'MID-33291022',
      saleSupportStatus: 'None',
      numberMember: 1,
      carrier: 'Ambetter Health',
      sellingState: 'Texas (TX)',
      closedLostReason: 'Other Party Broker Conflict — Under Investigation (SOP 19)',
    },
  },
];

export const INITIAL_ADMIN_COMMISSIONS = [
  {
    id: 'COM-001',
    policyId: 'MID-98234710',
    agentName: 'Khanh Nguyen',
    agentNpn: '#1984210',
    carrier: 'Blue Cross Blue Shield',
    planName: 'Blue Advantage HMO Silver (3 Members)',
    grossAmount: 90.0,
    saleSupportStatus: 'NONE',
    supportDeduction: 0.3,
    netAmount: 63.0,
    period: '2026-09',
    status: 'SETTLED',
  },
  {
    id: 'COM-002',
    policyId: 'MID-81204921',
    agentName: 'Khanh Nguyen',
    agentNpn: '#1984210',
    carrier: 'UnitedHealthcare',
    planName: 'AARP Medicare Advantage Part C',
    grossAmount: 51.0,
    saleSupportStatus: 'PARTIAL',
    supportDeduction: 0.5,
    netAmount: 25.5,
    period: '2026-09',
    status: 'SETTLED',
  },
  {
    id: 'COM-003',
    policyId: 'MID-77312904',
    agentName: 'Anh Que Pham CPA',
    agentNpn: '#20011862',
    carrier: 'Ambetter Health',
    planName: 'ClearCare Bronze Individual',
    grossAmount: 30.0,
    saleSupportStatus: 'NONE',
    supportDeduction: 0.3,
    netAmount: 21.0,
    period: '2026-09',
    status: 'SETTLED',
  },
  {
    id: 'COM-004',
    policyId: 'MID-66291033',
    agentName: 'Sean Ngo',
    agentNpn: '#1994321',
    carrier: 'Blue Cross Blue Shield',
    planName: 'NC Blue Cross Family Silver (2 Members)',
    grossAmount: 60.0,
    saleSupportStatus: 'PARTIAL',
    supportDeduction: 0.5,
    netAmount: 30.0,
    period: '2026-09',
    status: 'SETTLED',
  },
  {
    id: 'COM-005',
    policyId: 'MID-55102948',
    agentName: 'Sean Ngo',
    agentNpn: '#1994321',
    carrier: 'Humana',
    planName: 'Humana Gold Plus DFW',
    grossAmount: 51.0,
    saleSupportStatus: 'NONE',
    supportDeduction: 0.3,
    netAmount: 35.7,
    period: '2026-09',
    status: 'PENDING',
  },
  {
    id: 'COM-006',
    policyId: 'MID-44910293',
    agentName: 'Anya Nguyen (Staff)',
    agentNpn: 'STAFF-OPS',
    carrier: 'Mutual of Omaha',
    planName: 'Presidio Indexed Universal Life',
    grossAmount: 382.5,
    saleSupportStatus: 'FULL',
    supportDeduction: 0.7,
    netAmount: 114.75,
    period: '2026-09',
    status: 'SETTLED',
  },
  {
    id: 'COM-007',
    policyId: 'MID-22019482',
    agentName: 'Khanh Nguyen',
    agentNpn: '#1984210',
    carrier: 'Blue Cross Blue Shield',
    planName: 'Blue Access Care Bronze',
    grossAmount: 30.0,
    saleSupportStatus: 'NONE',
    supportDeduction: 0.3,
    netAmount: 21.0,
    period: '2026-09',
    status: 'SETTLED',
  },
  {
    id: 'COM-008',
    policyId: 'MID-11928374',
    agentName: 'Anh Que Pham CPA',
    agentNpn: '#20011862',
    carrier: 'Ambetter Health',
    planName: 'Ambetter Value Gold (4 Members)',
    grossAmount: 120.0,
    saleSupportStatus: 'NONE',
    supportDeduction: 0.3,
    netAmount: 84.0,
    period: '2026-09',
    status: 'SETTLED',
  },
];

// ============================================================
// Dynamic Admin Accounts Storage & Real-time Agent Synchronization
// Single source of truth for all Agent & Staff accounts across CRM
// ============================================================
export const ADMIN_ACCOUNTS_STORAGE_KEY = 'insurmatch_admin_accounts';

export function getAccountAvatar(name) {
  if (!name) return 'AG';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ACCOUNT_BG_PALETTE = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-teal-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white',
];

export function getDynamicAdminAccounts() {
  if (typeof window === 'undefined') return [...INITIAL_ADMIN_ACCOUNTS];
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_ACCOUNTS));
      return [...INITIAL_ADMIN_ACCOUNTS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_ACCOUNTS));
      return [...INITIAL_ADMIN_ACCOUNTS];
    }

    // Ensure all seed accounts exist in the store
    const existingIds = new Set(parsed.map((a) => String(a.id)));
    const missingSeeds = INITIAL_ADMIN_ACCOUNTS.filter((s) => !existingIds.has(String(s.id)));
    if (missingSeeds.length > 0) {
      const merged = [...parsed, ...missingSeeds];
      localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.warn('[mockAdminAccounts] Failed to read accounts from localStorage:', err);
    return [...INITIAL_ADMIN_ACCOUNTS];
  }
}

// ── Validation helpers (shared by the Admin Accounts form and the offline store) ──
export const VALID_ACCOUNT_ROLES = ['agent', 'staff', 'admin'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NPN_REGEX = /^\d{7,8}$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || '').trim());
}

export function isValidNpn(npn) {
  return NPN_REGEX.test(String(npn || '').trim());
}

/**
 * Next sequential ID (ACC-001, ACC-002...) based on the highest existing numeric
 * suffix + 1 — never list length + 1, so deletions/merges can't cause collisions.
 */
export function getNextAccountId(accounts = []) {
  const maxSuffix = accounts.reduce((max, a) => {
    const m = /^ACC-(\d+)$/i.exec(String(a?.id || ''));
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `ACC-${String(maxSuffix + 1).padStart(3, '0')}`;
}

export function addAdminAccountToStore(accountData) {
  const current = getDynamicAdminAccounts();
  const name = (accountData.name || `${accountData.firstName || ''} ${accountData.lastName || ''}`).trim();
  const role = (accountData.role || 'agent').toLowerCase();
  const email = String(accountData.email || '').trim();
  const npnInput = String(accountData.npn || '').trim();

  // An incoming id means this is a mirror of a record already created by the backend
  // (already validated there). Locally-created accounts must pass validation here.
  const isMirror = Boolean(accountData.id);
  if (!isMirror) {
    if (!VALID_ACCOUNT_ROLES.includes(role)) throw new Error('Role must be one of: agent, staff, admin.');
    if (!name) throw new Error('Full name is required.');
    if (!email) throw new Error('Email address is required.');
    if (!isValidEmail(email)) throw new Error('Please enter a valid email address.');
    if (current.some((a) => String(a.email || '').trim().toLowerCase() === email.toLowerCase())) {
      throw new Error(`An account with email ${email} already exists.`);
    }
    if (role === 'agent') {
      if (!String(accountData.phone || '').trim()) throw new Error('Phone number is required for agents.');
      if (!npnInput) throw new Error('NPN is required for agents.');
      if (!isValidNpn(npnInput)) throw new Error('NPN must be 7-8 digits (numbers only).');
      if (current.some((a) => String(a.npn || '').trim() === npnInput)) {
        throw new Error(`NPN ${npnInput} is already registered to another account.`);
      }
    }
  }

  const id = accountData.id || getNextAccountId(current);
  const idNum = parseInt(String(id).replace(/\D/g, ''), 10) || current.length;
  const avatar = accountData.avatar || getAccountAvatar(name || 'New Member');
  const bg = accountData.bg || (role === 'admin' ? 'bg-rose-700 text-white' : role === 'staff' ? 'bg-teal-600 text-white' : ACCOUNT_BG_PALETTE[idNum % ACCOUNT_BG_PALETTE.length]);
  
  let states = accountData.statesLicensed || ['TX (TDI)', 'CA (CDI)'];
  if (typeof states === 'string') {
    states = states.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Business rule: a newly created agent starts Pending until NPN is verified & approved.
  const status = accountData.status || (role === 'agent' ? 'Pending' : 'Active');
  const defaultCompliance = String(status).includes('Pending')
    ? 'Pending NPN Verification'
    : 'Verified & Cleared';

  const newAccount = {
    id,
    name: name || 'New Member',
    fullName: name || 'New Member',
    email,
    role,
    avatar,
    bg,
    status,
    phone: String(accountData.phone || '').trim(),
    agencyRole: accountData.agencyRole || (role === 'agent' ? 'Licensed Partner Agent' : role === 'staff' ? 'Platform Operations' : 'Administrator'),
    department: accountData.department || (role === 'agent' ? 'Regional Agent Network' : role === 'staff' ? 'Intake & Policy Support' : 'System Administration'),
    statesLicensed: states,
    npn: npnInput || (role === 'agent' ? '' : 'STAFF-OPS'),
    joinedDate: accountData.joinedDate || new Date().toISOString().slice(0, 10),
    lastActive: 'Just now',
    dealsCount: accountData.dealsCount || 0,
    complianceStatus: accountData.complianceStatus || defaultCompliance,
  };

  const updated = [newAccount, ...current.filter((a) => String(a.id) !== String(newAccount.id))];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('insurmatch_accounts_updated', { detail: newAccount }));
    } catch (e) {
      console.warn('[mockAdminAccounts] Could not persist new account:', e);
    }
  }
  return newAccount;
}

export function updateAdminAccountInStore(id, updates) {
  const current = getDynamicAdminAccounts();
  const updated = current.map((a) => (String(a.id) === String(id) ? { ...a, ...updates } : a));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('insurmatch_accounts_updated', { detail: { id, ...updates } }));
    } catch (e) {
      console.warn('[mockAdminAccounts] Could not update account in store:', e);
    }
  }
  return updated.find((a) => String(a.id) === String(id));
}

/**
 * Returns only real, accredited agent accounts currently existing in the platform.
 * Single source of truth for:
 * 1. Deal Owner dropdown
 * 2. Contact Owner dropdown
 * 3. Ticket Owner / Service Agent dropdown
 * 4. Staff CRM Dashboard agent selector
 */
export function getActiveAgentAccounts() {
  const all = getDynamicAdminAccounts();
  const isAgent = (a) => {
    const role = (a.role || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    if (role !== 'agent' && role !== 'broker') return false;
    if (name.includes('admin') || name.includes('staff') || name.includes('platform') || name.includes('insurance')) return false;
    return true;
  };

  return all.filter(isAgent).map((a) => {
    const email = a.email || '';
    const handle = email.includes('@') ? email.split('@')[0] : a.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
      id: String(a.id),
      name: a.name,
      fullName: a.name,
      email,
      handle,
      role: 'agent',
      agencyRole: a.agencyRole || 'Licensed Agent',
      department: a.department || 'Sales Hub',
      avatar: a.avatar || getAccountAvatar(a.name),
      bg: a.bg || 'bg-blue-600 text-white',
      npn: a.npn || '',
      statesLicensed: a.statesLicensed || ['TX (TDI)'],
      status: a.status || 'Active',
      phone: a.phone || '',
      dealsCount: a.dealsCount || 0,
      complianceStatus: a.complianceStatus || 'Verified & Cleared',
    };
  });
}

/**
 * Returns all platform personnel (Agents + Staff + Admins).
 */
export function getAllPlatformMembers() {
  const all = getDynamicAdminAccounts();
  return all.map((a) => {
    const email = a.email || '';
    const handle = email.includes('@') ? email.split('@')[0] : a.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
      id: String(a.id),
      name: a.name,
      fullName: a.name,
      email,
      handle,
      role: (a.role || 'agent').toLowerCase(),
      avatar: a.avatar || getAccountAvatar(a.name),
      bg: a.bg || 'bg-slate-700 text-white',
      npn: a.npn || '',
      status: a.status || 'Active',
      department: a.department || 'Operations',
    };
  });
}

