// ============================================================
// mockCrmData.js — CRM Data for Staff Portal (The Best Rate Insurance)
// Exact match to Image 1 (Contacts List), Image 2 (Contact Detail), Image 3 (Deal Detail)
// ============================================================

// Dữ liệu trống theo yêu cầu: "giờ data cho trống hết đi"
export const MOCK_CONTACTS = [];

export const SAMPLE_CONTACTS = [];

// ============================================================
// Detailed Record for Image 2 (Contact Detail)
// ============================================================
export const CONTACT_DETAIL_DATA = {
  id: 'CT26002600',
  code: 'CT26002600',
  firstName: 'Nhat Huu Tuan',
  middleName: '',
  lastName: 'Dang',
  fullName: 'Nhat Huu Tuan Dang',
  initials: 'ND',
  email: 'tuannhat.n2@gmail.com',
  phone: '+1 (714) 837-2395',
  language: 'Vietnamese',
  primary: {
    firstName: 'Nhat Huu Tuan',
    middleName: '',
    lastName: 'Dang',
    dob: '12/28/1995',
    ssn: '673-73-0055',
    familyRelationship: 'Self',
    gender: 'Male',
    immigrationStatus: 'Permanent Resident',
    alienNumber: '219802465',
    certificateNumber: 'IOE0921776907',
    dateExpired: '03/31/2036',
    household: '',
  },
  contactFields: {
    phone: '(714) 837-2395',
    enrolledAddress: '4301 Laurel Pond Way, Raleigh, NC 27616',
    mailingAddress: '4301 Laurel Pond Way, Raleigh, NC 27616',
    state: 'North Carolina (NC)',
    streetAddress: '4301 Laurel Pond Way',
    city: 'Raleigh',
    postalCode: '27616',
    county: '',
    language: 'Vietnamese',
    career: '',
  },
  acaAccount: {
    theBestRateEmail: '',
    acaAccountStatus: '',
    acaAccount: '',
    acaPass: '',
    acaStatusSpecial: '',
    acaAccountSpecial: '',
    acaPassSpecial: '',
    enrollCallRep: '',
  },
  sourceOfLead: {
    howDoYouKnowUs: '---',
    whoReferClient: '',
    contactOwner: 'Khanh Nguyen (khanhnguyen31@7)',
    leadOwner: 'Khanh Nguyen (khanhnguyen31@7)',
    medicareShareOwner: '---',
    obamacareSharedOwner: '---',
    lifeSharedOwner: '---',
    contactType: '---',
  },
  activities: [],
  notes: [
    {
      id: 'note-sample-01',
      title: 'Created ACA account, uploaded document and waiting to verify - Rosy',
      body: 'Created ACA account, uploaded document and waiting to verify - Rosy\nRef code: RBA-N5X-8T9-N7A-1X0-B5L',
      attachments: [],
      author: 'Rosy Pham',
      time: '09/24/2024, 12:23',
    },
  ],
  tasks: [],
  associatedDeals: [
    {
      id: 'D26005033',
      title: 'Non-CMS - Nhat H Dang - OB 10/2026 (NC)',
      shortTitle: 'Non-CMS - Nhat H Dang - OB...',
      pipeline: 'Obamacare 2026',
      stage: 'Ready to Enroll',
      dealOwner: 'Khanh Nguyen',
      carrier: 'BCBS',
      member: 'Nhat Huu Tuan Dan...',
    },
  ],
  associatedTickets: [
    {
      id: 'TC2600101',
      title: 'ACA account 2026',
      pipeline: 'ACA account',
      status: 'Uploaded - Waiting for...',
      ticketOwner: 'Khanh Nguyen',
      closeDate: '----------',
    },
  ],
  associatedDocuments: [
    {
      id: 'DOC-01',
      name: 'Nhat H Dang',
      type: 'Customer Document',
      date: '09/09/2026',
    },
  ],
};

// ============================================================
// Deal Stages for Pipelines (Matching Dashboard & Deal Detail)
// ============================================================
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
];

// ============================================================
// Detailed Record for Image 3 (Deal Detail)
// ============================================================
export const DEAL_DETAIL_DATA = {
  id: 'D26005033',
  code: 'D26005033',
  title: 'Non-CMS - Nhat H Dang - OB 10/2026 (NC)',
  initials: 'N2',
  amount: '_ _ _ _ _ _ _ _ _ _',
  closeDate: '_ _ _ _ _ _ _ _ _ _',
  pipeline: 'Obamacare 2026',
  stage: 'Ready to Enroll (Obamacare 2026)',
  adminOnly: {
    enrolledNpn: '',
    brokerEffectiveDate: '',
    terminationDate: '',
    leadOwner: 'Khanh Nguyen (khanhnguyen31@7)',
    dealOwner: 'Khanh Nguyen (khanhnguyen31@7)',
    code: 'D26005033',
    primaryMemberId: '',
    saleSupportStatus: 'None',
    numberMember: '',
    sellingState: '--',
    carrier: 'BCBS',
    closedLostReason: '---',
  },
  enrolledAddress: '',
  applicationId: '',
  estimateHouseholdIncome: '',
  householdMember: '',
  numberMember: '',
  quotedCounty: '',
  planName: '',
  contact: {
    id: 'CT26002600',
    fullName: 'Nhat Huu Tuan Dang',
    phone: '+1 (714) 837-2396',
    email: 'tuannhat.n2@gmail.com',
  },
  tickets: [
    {
      id: 'TC2600101',
      title: 'ACA account 2026',
      pipeline: 'ACA account',
      status: 'Uploaded - Waiting for Verification',
    },
  ],
  activities: [
    {
      id: 'deal-act-1',
      type: 'Ticket Activity',
      time: '09/17/2026, 09:12',
      actor: 'Anya Nguyen (anya42@9)',
      summary: 'moved ticket ACA account 2026 to Uploaded - Waiting for Verification.',
      ticketTitle: 'ACA account 2026',
      linkText: 'View Details',
    },
    {
      id: 'deal-act-2',
      type: 'Ticket Activity',
      time: '09/11/2026, 17:45',
      actor: 'Anya Nguyen (anya42@9)',
      summary: 'moved ticket ACA account 2026 to VERIFIED.',
      ticketTitle: 'ACA account 2026',
      linkText: 'View Details',
    },
    {
      id: 'deal-act-3',
      type: 'Ticket Activity',
      time: '09/09/2026, 15:17',
      actor: 'Anya Nguyen (anya42@9)',
      summary: 'moved ticket ACA account 2026 to Uploaded - Waiting for Verification.',
      ticketTitle: 'ACA account 2026',
      linkText: 'View Details',
    },
    {
      id: 'deal-act-4',
      type: 'Ticket Activity',
      time: '09/09/2026, 13:05',
      actor: 'Create ACA account 2026 Tickets - Clone3 (version 5)',
      summary: 'created ticket ACA account 2026',
      ticketTitle: 'ACA account 2026',
      linkText: '',
    },
    {
      id: 'deal-act-5',
      type: 'Deal Activity',
      time: '09/09/2026, 13:05',
      actor: 'Khanh Nguyen (khanhnguyen31@7)',
      summary: 'created deal Non-CMS - Nhat H Dang - OB 10/2026 (NC)',
      dealId: 'D26005033',
      dealTitle: 'Non-CMS - Nhat H Dang - OB 10/2026 (NC)',
      linkText: '',
    },
  ],
};

// ============================================================
// Customer Document Detail Record (Matching Uploaded Image)
// ============================================================
export const CUSTOMER_DOCUMENT_DATA = {
  id: 'DOC-01',
  name: 'Nhat H Dang',
  initials: 'ND',
  lastModifiedTime: '09/11/2026, 17:44',
  lastModifiedBy: 'Anya Nguyen',
  contactOwner: 'Khanh Nguyen (khanhnguyen31@7)',
  filesByCategory: {
    consentFormMkp: [],
    consentFormText: [
      {
        id: 'cft-1',
        name: 'Consent 2026_AQP - Nh...',
        fullName: 'Consent 2026_AQP - Nhat Dang.pdf',
        size: '682.4 KB',
        type: 'pdf',
      },
    ],
    identity: [
      {
        id: 'id-1',
        name: 'IMG_4413.jpg',
        fullName: 'IMG_4413.jpg',
        size: '164 KB',
        type: 'image',
      },
      {
        id: 'id-2',
        name: 'IMG_5618.jpeg',
        fullName: 'IMG_5618.jpeg',
        size: '197.5 KB',
        type: 'image',
      },
      {
        id: 'id-3',
        name: 'CamScanner 4-21-26 08...',
        fullName: 'CamScanner 4-21-26 08.44.pdf',
        size: '138 KB',
        type: 'image',
      },
    ],
    insuranceRecord: [],
    otherDocument: [],
    paymentInformation: [
      {
        id: 'pay-1',
        name: 'IMG_6539.jpeg',
        fullName: 'IMG_6539.jpeg',
        size: '1.7 MB',
        type: 'image',
      },
    ],
    tax: [],
  },
  associatedContact: {
    id: 'CT26002600',
    name: 'Nhat Huu Tuan Dang',
    phone: '+1 (714) 837-2395',
    email: 'tuannhat.n2@gmail.com',
    leadOwner: 'Khanh Nguyen',
    language: 'Vietnamese',
  },
};

// ============================================================
// Deals List Data (Matching Contacts List structure)
// ============================================================
export const SAMPLE_DEALS = [];

export const MOCK_DEALS = SAMPLE_DEALS;

export const SAMPLE_PAYMENT_TICKET = {
  id: 'TC2600201',
  title: 'Oct/26 Company Pay ticket',
  avatar: 'OT',
  pipeline: 'Payment',
  status: 'Make payment',
  priority: 'None',
  openDays: 9,
  dueDate: '09/20/2026',
  serviceAgent: 'Anya Nguyen (anya42@9)',
  serviceAgentAvatar: 'AN',
  ticketOwner: 'Khanh Nguyen (khanhnguyen31@7)',
  ticketOwnerAvatar: 'KN',
  ticketResult: '',
  paymentStatus: 'Company Pay',
  changeDueDateReason: '',
  carrier: 'Kaiser Permanente',
  deadlineDate: '',
  paidThroughDate: '--',
  files: [],
  proof: [],
  contactName: 'Hoai thanh Nguyen',
  contactPhone: '+1 (838) 776-1434',
  contactEmail: 'nguyenleminhquang1215@gmail.com',
  leadOwner: 'Khanh Nguyen',
  dealTitle: 'Non Commission - Hoai thanh Nguyen - OB 2026',
  dealShortTitle: 'Non Commission - Hoai thanh...',
  dealPipeline: 'Obamacare 2026',
  dealStage: 'Non-Commission - Active',
  dealOwner: 'Khanh Nguyen',
  dealCarrier: 'Kaiser Permanente',
};

export const SAMPLE_ACA_TICKET = {
  id: 'TC2600101',
  title: 'ACA account 2026',
  avatar: 'A2',
  pipeline: 'ACA account',
  status: 'DONE',
  priority: 'High',
  closeDate: '07/20/2026',
  dueDate: '07/15/2026',
  serviceAgent: 'Ivy Lu (ivy)',
  serviceAgentAvatar: 'IL',
  ticketOwner: 'Jay Ly (trichauly24@7)',
  ticketOwnerAvatar: 'JL',
  ticketResult: '',
  changeDueDateReason: '',
  carrier: '',
  deadlineDate: '',
  paidThroughDate: '',
  files: [],
  proof: [],
  contactName: 'Ken xington Ho',
  contactPhone: '+1 (832) 998-9804',
  contactEmail: 'kylieho@thesuperiorskilledlearners.com',
  leadOwner: 'Jay Ly',
  dealTitle: 'Ken Ho + Kylie Ho + Kaylee Ho - OB 08/2026',
  dealShortTitle: 'Ken Ho + Kylie Ho + Kaylee Ho - ...',
  dealPipeline: 'Obamacare 2026',
  dealStage: 'Enrolled - Active',
  dealOwner: 'Jay Ly',
  dealCarrier: 'BCBS',
};

export const FULL_SAMPLE_TICKETS = [];

export const SAMPLE_TICKETS = FULL_SAMPLE_TICKETS;

export const SAMPLE_TASKS = [];

// ── Dynamic In-Memory & LocalStorage Store Helpers ───────────────────────────
export function addTicketToStore(ticket) {
  if (!ticket) return;
  const existingIdx = FULL_SAMPLE_TICKETS.findIndex(
    (t) => t.id === ticket.id || (t.title === ticket.title && t.contactName === ticket.contactName)
  );
  if (existingIdx >= 0) {
    FULL_SAMPLE_TICKETS[existingIdx] = { ...FULL_SAMPLE_TICKETS[existingIdx], ...ticket };
  } else {
    FULL_SAMPLE_TICKETS.unshift(ticket);
  }
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_tickets');
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((t) => t.id === ticket.id);
    if (idx >= 0) list[idx] = ticket;
    else list.unshift(ticket);
    localStorage.setItem('insurmatch_dynamic_tickets', JSON.stringify(list));
  } catch {}
}

export function getDynamicTickets() {
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_tickets');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDealToStore(deal) {
  if (!deal) return;
  const existingIdx = SAMPLE_DEALS.findIndex((d) => d.id === deal.id || d.code === deal.code);
  if (existingIdx >= 0) {
    SAMPLE_DEALS[existingIdx] = { ...SAMPLE_DEALS[existingIdx], ...deal };
  } else {
    SAMPLE_DEALS.unshift(deal);
  }
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_deals');
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((d) => d.id === deal.id);
    if (idx >= 0) list[idx] = deal;
    else list.unshift(deal);
    localStorage.setItem('insurmatch_dynamic_deals', JSON.stringify(list));
  } catch {}
}

export function getDynamicDeals() {
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_deals');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addContactToStore(contact) {
  if (!contact) return;
  const existingIdx = SAMPLE_CONTACTS.findIndex((c) => c.id === contact.id || c.code === contact.code);
  if (existingIdx >= 0) {
    SAMPLE_CONTACTS[existingIdx] = { ...SAMPLE_CONTACTS[existingIdx], ...contact };
  } else {
    SAMPLE_CONTACTS.unshift(contact);
  }
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_contacts');
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((c) => c.id === contact.id);
    if (idx >= 0) list[idx] = contact;
    else list.unshift(contact);
    localStorage.setItem('insurmatch_dynamic_contacts', JSON.stringify(list));
  } catch {}
}

export function getDynamicContacts() {
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_contacts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Customer Documents Store Helpers ─────────────────────────────────────────
export function addCustomerDocumentToStore(doc) {
  if (!doc) return;

  // Enrich with totalFiles and categoriesSummary (including files list) if not present
  let totalFiles = doc.totalFiles;
  let categoriesSummary = doc.categoriesSummary;
  if (doc.filesByCategory) {
    totalFiles = Object.values(doc.filesByCategory).reduce(
      (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
      0
    );
    const catMap = {
      consentFormMkp: 'Consent form MKP',
      consentFormText: 'Consent form text',
      identity: 'Identity',
      insuranceRecord: 'Insurance record',
      otherDocument: 'Other document',
      paymentInformation: 'Payment information',
      tax: 'Tax',
    };
    categoriesSummary = Object.entries(doc.filesByCategory)
      .filter(([_, list]) => Array.isArray(list) && list.length > 0)
      .map(([k, list]) => ({
        key: k,
        label: catMap[k] || k,
        count: list.length,
        files: list,
      }));
  }

  const enrichedDoc = {
    ...doc,
    totalFiles: totalFiles ?? doc.totalFiles ?? 0,
    categoriesSummary: categoriesSummary ?? doc.categoriesSummary ?? [],
  };

  try {
    const raw = localStorage.getItem('insurmatch_dynamic_documents');
    let list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(
      (d) =>
        (d.id && d.id === enrichedDoc.id) ||
        (d.name === enrichedDoc.name && (d.contactId === enrichedDoc.contactId || d.contactName === enrichedDoc.contactName))
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...enrichedDoc };
    } else {
      list.unshift(enrichedDoc);
    }
    // Deduplicate by id or (name + contactId)
    const seen = new Set();
    list = list.filter((item) => {
      const key = item.id || `${item.name}_${item.contactId || item.contactName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    localStorage.setItem('insurmatch_dynamic_documents', JSON.stringify(list));
  } catch {}

  // Update in-memory SAMPLE_CUSTOMER_DOCUMENTS only if already in sample
  const sampleIdx = SAMPLE_CUSTOMER_DOCUMENTS.findIndex(
    (d) => d.id === enrichedDoc.id || (d.name === enrichedDoc.name && d.contactName === enrichedDoc.contactName)
  );
  if (sampleIdx >= 0) {
    SAMPLE_CUSTOMER_DOCUMENTS[sampleIdx] = { ...SAMPLE_CUSTOMER_DOCUMENTS[sampleIdx], ...enrichedDoc };
  }
}

export function updateCustomerDocumentInStore(doc) {
  addCustomerDocumentToStore(doc);
}

export function getDynamicCustomerDocuments() {
  try {
    const raw = localStorage.getItem('insurmatch_dynamic_documents');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // Deduplicate in case old data had duplicates
    const seen = new Set();
    const unique = [];
    for (const d of list) {
      const key = d.id || `${d.name}_${d.contactId || d.contactName}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(d);
      }
    }
    if (unique.length !== list.length) {
      localStorage.setItem('insurmatch_dynamic_documents', JSON.stringify(unique));
    }
    return unique;
  } catch {
    return [];
  }
}

export function getAllCustomerDocuments() {
  const dynamic = getDynamicCustomerDocuments();
  const seenIds = new Set(dynamic.map((d) => d.id).filter(Boolean));
  const seenNames = new Set(
    dynamic.map((d) => `${d.name}_${d.contactId || d.contactName}`).filter(Boolean)
  );
  const filteredSamples = SAMPLE_CUSTOMER_DOCUMENTS.filter(
    (s) =>
      !seenIds.has(s.id) &&
      !seenNames.has(`${s.name}_${s.contactId || s.contactName}`)
  );
  return [...dynamic, ...filteredSamples];
}

// ============================================================
// Sample Customer Documents List
// ============================================================
export const SAMPLE_CUSTOMER_DOCUMENTS = [];




