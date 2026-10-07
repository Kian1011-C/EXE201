// ============================================================
// src/services/api.js — InsurMatch CRM Backend API Client
// Connected to Spring Boot 3 + PostgreSQL via Docker Compose
// ============================================================


import { DEFAULT_AGENT_ACCOUNTS } from '../utils/constants';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to handle fetch responses with proper JSON parsing and error messages.
 * Automatically injects JWT Bearer token from localStorage if available.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Inject JWT Bearer token if stored in localStorage
  const token = localStorage.getItem('tbri_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const httpError = new Error(errBody.message || errBody.error || `HTTP error ${response.status}: ${response.statusText}`);
      httpError.status = response.status;
      throw httpError;
    }

    const json = await response.json();
    // Auto-unwrap Spring Boot ApiResponse wrapper: { success: true, data: ... }
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return json.data;
    }
    return json;
  } catch (error) {
    console.warn(`[CRM API] Call to ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function checkBackendHealth() {
  try {
    const res = await request('/health');
    return {
      ...res,
      status: (res?.status === 'online' || res?.status === 'ok') ? 'ok' : (res?.status || 'offline'),
      database: res?.database || 'disconnected',
    };
  } catch (err) {
    return { status: 'offline', database: 'disconnected', error: err.message };
  }
}

// ── Normalization Helpers for Frontend Compatibility ──────────────────────
function formatUserName(user) {
  if (!user) return '';
  if (typeof user === 'string') return user;
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || '';
}

function getUserAvatar(name) {
  if (!name) return 'TB';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'TB';
}

function normalizeContact(c) {
  if (!c) return c;
  const fullName = c.fullName || [c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ') || 'Unknown Contact';
  const rawOwner = formatUserName(c.contactOwner);
  const ownerName = (rawOwner && rawOwner !== 'The Best Rate Insurance' && rawOwner !== 'Platform Staff') ? rawOwner : '';
  const modifiedByName = formatUserName(c.lastModifiedBy) || ownerName || 'Staff';

  return {
    ...c,
    id: c.id,
    no: c.no || c.id,
    code: c.code || `CT2600${String(c.id || 1).padStart(4, '0')}`,
    fullName,
    name: fullName,
    contactOwnerName: ownerName,
    phone: c.phone || '—',
    email: c.email || '—',
    language: c.language || 'Vietnamese',
    status: c.status || 'Active',
    howDoYouKnowUs: c.howDoYouKnowUs || c.sourceDetail || c.sourceChannel || '—',
    acaAccountStatus: c.acaAccountStatus || c.acaStatus || null,
    contactOwner: {
      name: ownerName,
      avatar: c.contactOwner?.avatar || getUserAvatar(ownerName),
      bg: c.contactOwner?.bg || 'bg-amber-100 text-amber-800',
    },
    lastModifiedBy: {
      name: modifiedByName,
      avatar: c.lastModifiedBy?.avatar || getUserAvatar(modifiedByName),
      bg: c.lastModifiedBy?.bg || 'bg-slate-100 text-slate-800',
    },
    lastModifiedTime: c.lastModifiedTime || (c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'Just now'),
    primary: c.primary || {
      firstName: c.firstName || '',
      middleName: c.middleName || '',
      lastName: c.lastName || '',
      dob: c.dateOfBirth || c.dob || '',
      ssn: c.ssn || '',
      familyRelationship: c.relationship || '',
      gender: c.gender || '',
      immigrationStatus: c.immigrationStatus || '',
      alienNumber: c.alienNumber || '',
      certificateNumber: c.certificateNumber || '',
      dateExpired: c.dateExpired || '',
      household: c.householdSize || 1,
    },
    contactFields: c.contactFields || {
      phone: c.phone || '',
      state: c.state || '',
      city: c.city || '',
      postalCode: c.zipCode || c.postalCode || '',
      streetAddress: c.address || c.streetAddress || '',
      enrolledAddress: c.address || '',
      mailingAddress: c.address || '',
      county: c.county || '',
      language: c.language || 'Vietnamese',
    },
    acaAccount: c.acaAccount || {
      theBestRateEmail: '',
      acaAccountStatus: c.acaAccountStatus || '',
      acaAccount: '',
      acaPass: '',
      acaStatusSpecial: '',
      acaAccountSpecial: '',
      acaPassSpecial: '',
      enrollCallRep: '',
    },
    deals: Array.isArray(c.deals) ? c.deals.map(normalizeDeal) : (Array.isArray(c.associatedDeals) ? c.associatedDeals.map(normalizeDeal) : []),
    associatedDeals: Array.isArray(c.associatedDeals) ? c.associatedDeals.map(normalizeDeal) : (Array.isArray(c.deals) ? c.deals.map(normalizeDeal) : []),
    tasks: Array.isArray(c.tasks) ? c.tasks.map(normalizeTask) : [],
    tickets: Array.isArray(c.tickets) ? c.tickets.map(normalizeTicket) : [],
    customerDocuments: Array.isArray(c.customerDocuments)
      ? c.customerDocuments
      : (Array.isArray(c.documents) ? c.documents : []),
  };
}

function normalizeDeal(d) {
  if (!d) return d;
  const title = d.title || d.dealName || `Deal #${d.id}`;
  const ownerName = formatUserName(d.dealOwner) || 'Licensed Agent';
  const contactName = d.contactName || (d.contact ? [d.contact.firstName, d.contact.lastName].filter(Boolean).join(' ') : '') || 'Client';

  return {
    ...d,
    id: d.id,
    title,
    dealName: title,
    code: d.code || `DL2600${String(d.id || 1).padStart(4, '0')}`,
    contactName,
    dealOwnerName: ownerName,
    dealOwner: {
      name: ownerName,
      avatar: d.dealOwner?.avatar || getUserAvatar(ownerName),
      bg: d.dealOwner?.bg || 'bg-blue-100 text-blue-800',
    },
    carrier: d.carrier || 'Ambetter',
    stage: d.stage || d.dealStage || 'Ready to Enroll (Obamacare 2026)',
    dealStage: d.dealStage || d.stage || 'ENROLLED_ACTIVE',
    pipeline: d.pipeline || 'Obamacare 2026',
    amount: d.amount != null ? d.amount : 0,
    policyEffectiveDate: d.policyEffectiveDate || '',
    policyId: d.policyId || '',
    memberId: d.memberId || '',
    paymentStatus: d.paymentStatus || 'No Value',
    chooseDoctorStatus: d.chooseDoctorStatus || 'Need Choose Doctor',
    doctorName: d.doctorName || '',
    stageAca: d.stageAca || '',
  };
}

function normalizeTicket(t) {
  if (!t) return t;
  const title = t.title || t.ticketName || `Ticket #${t.id}`;
  const ownerName = formatUserName(t.ticketOwner) || formatUserName(t.owner) || 'Agent';
  const serviceName = formatUserName(t.serviceAgent) || 'Support Staff';
  const contactName = t.contactName || (t.contact ? [t.contact.firstName, t.contact.lastName].filter(Boolean).join(' ') : '') || 'Client';
  const dealTitle = t.dealTitle || t.deal?.dealName || t.deal?.title || '';

  return {
    ...t,
    id: t.id,
    title,
    ticketName: title,
    code: t.code || `TK2600${String(t.id || 1).padStart(4, '0')}`,
    status: t.status || t.ticketStatus || 'Open',
    ticketStatus: t.ticketStatus || t.status || 'OPEN',
    priority: t.priority || 'Medium',
    pipeline: t.pipeline || 'Client Support',
    description: t.description || t.ticketDescription || '',
    contactName,
    dealTitle,
    ticketOwnerName: ownerName,
    serviceAgentName: serviceName,
    owner: {
      name: ownerName,
      avatar: t.owner?.avatar || getUserAvatar(ownerName),
    },
    serviceAgent: serviceName,
    ticketOwner: ownerName,
    serviceAgentObj: {
      name: serviceName,
      avatar: t.serviceAgent?.avatar || getUserAvatar(serviceName),
    },
    ticketOwnerObj: {
      name: ownerName,
      avatar: t.ticketOwner?.avatar || getUserAvatar(ownerName),
    },
  };
}

function normalizeTask(t) {
  if (!t) return t;
  const title = t.title || `Task #${t.id}`;
  const assignedName = formatUserName(t.assignedTo) || 'Staff User';
  const contactName = t.contactName || (t.contact ? [t.contact.firstName, t.contact.lastName].filter(Boolean).join(' ') : '') || '';
  const dealTitle = t.dealTitle || t.deal?.dealName || t.deal?.title || '';

  return {
    ...t,
    id: t.id,
    title,
    code: t.code || `TSK2600${String(t.id || 1).padStart(4, '0')}`,
    status: t.status || 'Not Started',
    priority: t.priority || 'Medium',
    assignedToName: assignedName,
    assignedTo: {
      name: assignedName,
      avatar: t.assignedTo?.avatar || getUserAvatar(assignedName),
    },
    contactName,
    dealTitle,
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

function normalizeAccount(u) {
  if (!u) return u;
  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User';
  const role = (u.role || 'staff').toLowerCase();
  const normalizedRole = (role === 'support' || role === 'telesales') ? 'staff' : (role === 'manager' ? 'admin' : role);
  const status = u.status || (u.active !== false ? 'Active' : 'Suspended');
  let bg = 'bg-blue-600 text-white';
  if (normalizedRole === 'staff') bg = 'bg-teal-600 text-white';
  else if (normalizedRole === 'admin') bg = 'bg-purple-600 text-white';
  else {
    // Agents: auto-assign a palette color derived from the account id
    const idNum = parseInt(String(u.id).replace(/\D/g, ''), 10);
    if (Number.isFinite(idNum)) bg = ACCOUNT_BG_PALETTE[idNum % ACCOUNT_BG_PALETTE.length];
  }

  let states = u.statesLicensed || ['Texas (TDI)'];
  if (typeof states === 'string') {
    states = states.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return {
    ...u,
    id: String(u.id),
    name,
    fullName: name,
    email: u.email || '',
    role: normalizedRole,
    originalRole: role,
    status,
    complianceStatus: u.complianceStatus || 'Verified & Cleared',
    phone: u.phone || '—',
    npn: u.npn || '—',
    avatar: u.avatar || getUserAvatar(name),
    bg: u.bg || bg,
    statesLicensed: states,
    department: u.department || (normalizedRole === 'admin' ? 'Executive' : (normalizedRole === 'agent' ? 'Sales Agency' : 'Operations')),
    dealsCount: u.dealsCount || 0,
    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
  };
}

export async function getUsers() {
  try {
    const data = await request('/users');
    if (Array.isArray(data) && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('insurmatch_admin_accounts', JSON.stringify(data));
      }
      return data;
    }
  } catch {}
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('insurmatch_admin_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return DEFAULT_AGENT_ACCOUNTS;
}

export async function getContacts(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const data = await request(`/contacts${qStr}`);
  return Array.isArray(data) ? data.map(normalizeContact) : data;
}

export async function getContactDeals(contactId) {
  if (!contactId) return [];
  try {
    const data = await request(`/contacts/${encodeURIComponent(contactId)}/deals`);
    return Array.isArray(data) ? data.map(normalizeDeal) : [];
  } catch {
    return [];
  }
}

export async function getContact(id) {
  if (!id) return null;
  // 1. Ưu tiên endpoint 360° detail (đầy đủ contact + deals + tickets + documents + tasks + notes)
  try {
    const detail = await request(`/contacts/${encodeURIComponent(id)}/detail`);
    if (detail && detail.contact) {
      const fullContact = {
        ...detail.contact,
        deals: (detail.deals || []).map(normalizeDeal),
        associatedDeals: (detail.deals || []).map(normalizeDeal),
        tickets: (detail.tickets || []).map(normalizeTicket),
        associatedTickets: (detail.tickets || []).map(normalizeTicket),
        customerDocuments: detail.documents || [],
        tasks: detail.tasks || [],
        notes: detail.notes || [],
        activities: detail.activities || [],
      };
      return normalizeContact(fullContact);
    }
  } catch (_) {}

  // 2. Fallback sang endpoint contact thông thường
  const data = await request(`/contacts/${encodeURIComponent(id)}`);
  if (data) return normalizeContact(data);

  return null;
}

export async function createContact(data) {
  const res = await request('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res ? normalizeContact(res) : res;
}

export async function updateContact(id, data) {
  const res = await request(`/contacts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res ? normalizeContact(res) : res;
}

// ── Deals ────────────────────────────────────────────────────────────────────
export async function getDeals(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.stage && params.stage !== 'all') query.append('stage', params.stage);
  if (params.pipeline && params.pipeline !== 'all') query.append('pipeline', params.pipeline);
  if (params.carrier && params.carrier !== 'all') query.append('carrier', params.carrier);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const data = await request(`/deals${qStr}`);
  return Array.isArray(data) ? data.map(normalizeDeal) : data;
}

export async function getDeal(id) {
  if (!id) return null;
  const cleanId = String(id).replace(/\/$/, '').trim();
  const data = await request(`/deals/${encodeURIComponent(cleanId)}`);
  if (data) return normalizeDeal(data);

  

  return null;
}

export function sanitizeDealPayload(data) {
  if (!data || typeof data !== 'object') return data;
  const clean = { ...data };

  const parseNum = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const str = String(val).replace(/[\$,]/g, '').trim();
    if (!str || str.includes('_') || str === '--' || str.toLowerCase() === 'null') return null;
    const n = Number(str);
    return isNaN(n) ? null : n;
  };

  const parseIntNum = (val) => {
    const n = parseNum(val);
    return n !== null ? Math.round(n) : null;
  };

  clean.amount = parseNum(clean.amount);
  clean.estimateHouseholdIncome = parseNum(clean.estimateHouseholdIncome || clean.estimatedIncome);
  clean.monthlyPremium = parseNum(clean.monthlyPremium);
  clean.subsidyAmount = parseNum(clean.subsidyAmount);
  clean.agencyCommission = parseNum(clean.agencyCommission);
  clean.householdMember = parseIntNum(clean.householdMember || clean.householdSize);
  clean.numberMember = parseIntNum(clean.numberMember);

  if (typeof clean.closeDate === 'string' && (clean.closeDate.includes('_') || clean.closeDate === '--')) {
    clean.closeDate = null;
  }
  if (clean.sellingState === '--') clean.sellingState = '';
  if (clean.carrier === '--') clean.carrier = '';
  if (clean.pipeline === '--') clean.pipeline = 'Obamacare 2026';
  if (clean.stage === '--') clean.stage = 'Ready to Enroll (Obamacare 2026)';
  if (typeof clean.dealOwner === 'object' && clean.dealOwner?.name) {
    clean.dealOwner = clean.dealOwner.name;
  }
  if (clean.dealOwner === '--') clean.dealOwner = '';

  if (!clean.dealName && clean.title) clean.dealName = clean.title;
  if (!clean.title && clean.dealName) clean.title = clean.dealName;

  return clean;
}

export async function createDeal(data) {
  const sanitized = sanitizeDealPayload(data);
  const res = await request('/deals', {
    method: 'POST',
    body: JSON.stringify(sanitized),
  });
  return res ? normalizeDeal(res) : res;
}

export async function updateDeal(id, data) {
  const sanitized = sanitizeDealPayload(data);
  const res = await request(`/deals/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(sanitized),
  });
  return res ? normalizeDeal(res) : res;
}

export async function updateDealStage(id, stage, user) {
  if (!id) return null;
  const cleanId = String(id).replace(/\/$/, '').trim();
  const res = await request(`/deals/${encodeURIComponent(cleanId)}/stage`, {
    method: 'PUT',
    body: JSON.stringify({ stage, user: user || 'Platform Staff' }),
  });
  return res ? normalizeDeal(res) : res;
}

// ── Documents ────────────────────────────────────────────────────────────────
export async function getDocuments(params = {}) {
  const query = new URLSearchParams();
  if (params.contactId) query.append('contactId', params.contactId);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  if (params.search) query.append('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await request(`/documents${qStr}`);
}

export async function getDocument(id) {
  if (!id) return null;
  const data = await request(`/documents/${encodeURIComponent(id)}`);
  if (data) return data;

  

  return null;
}

export async function createDocument(docData) {
  const contactId = docData.contactId || (docData.associatedContact ? docData.associatedContact.id : null);
  const query = contactId ? `?contactId=${encodeURIComponent(contactId)}` : '';
  return await request(`/documents${query}`, {
    method: 'POST',
    body: JSON.stringify(docData),
  });
}

export async function updateDocument(id, docData) {
  return await request(`/documents/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(docData),
  });
}

export async function addDocumentFile(docId, fileData) {
  return await request(`/documents/${encodeURIComponent(docId)}/files`, {
    method: 'POST',
    body: JSON.stringify(fileData),
  });
}

export async function deleteDocumentFile(docId, fileId) {
  return await request(`/documents/${encodeURIComponent(docId)}/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
  });
}

export function getAllCustomerDocuments() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('insurmatch_dynamic_documents') : null;
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addCustomerDocumentToStore(doc) {
  if (!doc) return;

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
    const raw = typeof window !== 'undefined' ? localStorage.getItem('insurmatch_dynamic_documents') : null;
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
    const seen = new Set();
    list = list.filter((item) => {
      const key = item.id || `${item.name}_${item.contactId || item.contactName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('insurmatch_dynamic_documents', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('insurmatch_documents_updated', { detail: enrichedDoc }));
    }
  } catch {}
}

export function updateCustomerDocumentInStore(doc) {
  addCustomerDocumentToStore(doc);
}

export function getDynamicCustomerDocuments() {
  return getAllCustomerDocuments();
}

// ── Interaction: Notes, Tasks, Activities ────────────────────────────────────
export async function addContactNote(contactId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContactNote(contactId, noteId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/notes/${encodeURIComponent(noteId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).catch(() => null);
}

export async function deleteContactNote(contactId, noteId) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/notes/${encodeURIComponent(noteId)}`, {
    method: 'DELETE',
  }).catch(() => null);
}

export async function addContactTask(contactId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContactTask(contactId, taskId, data) {
  return await updateTask(taskId, data);
}

export async function addContactActivity(contactId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addDealNote(dealId, data) {
  return await request(`/deals/${encodeURIComponent(dealId)}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addDealTask(dealId, data) {
  return await request(`/deals/${encodeURIComponent(dealId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addDealActivity(dealId, data) {
  return await request(`/deals/${encodeURIComponent(dealId)}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Seeding & Reset ──────────────────────────────────────────────────────────
export async function resetAndSeedDatabase() {
  return await request('/seed', {
    method: 'POST',
  });
}

// ── Tickets ──────────────────────────────────────────────────────────────────
export async function getTickets(params = {}) {
  const query = new URLSearchParams();
  if (params.pipeline && params.pipeline !== 'all') query.append('pipeline', params.pipeline);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
  if (params.contactId) query.append('contactId', params.contactId);
  if (params.dealId) query.append('dealId', params.dealId);
  if (params.search) query.append('search', params.search);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const data = await request(`/tickets${qStr}`);
  return Array.isArray(data) ? data.map(normalizeTicket) : data;
}

export async function getTicket(id) {
  if (!id) return null;
  const cleanId = String(id).replace(/\/$/, '');
  const data = await request(`/tickets/${encodeURIComponent(cleanId)}`);
  if (data) return normalizeTicket(data);

  

  return normalizeTicket({
    id: cleanId,
    code: cleanId,
    title: cleanId.startsWith('TC26') ? `Ticket ACA - ${cleanId}` : `Support Ticket - ${cleanId}`,
    pipeline: cleanId.toLowerCase().includes('upload') ? 'Upload document' : 'ACA account',
    status: 'Need Create ACA Account',
    stage: 'Need Create ACA Account (ACA account)',
    priority: 'High',
    ticketOwner: 'Khanh Nguyen',
    serviceAgent: 'Platform Staff',
  });
}

export async function createTicket(data) {
  const res = await request('/tickets', { method: 'POST', body: JSON.stringify(data) });
  return res ? normalizeTicket(res) : res;
}

export async function updateTicket(id, data) {
  const res = await request(`/tickets/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  return res ? normalizeTicket(res) : res;
}

export async function addTicketComment(ticketId, data) {
  return await request(`/tickets/${encodeURIComponent(ticketId)}/comments`, { method: 'POST', body: JSON.stringify(data) });
}

// ── Tasks ────────────────────────────────────────────────────────────────────
export async function getTasks(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All' && params.status !== 'all') query.append('status', params.status);
  if (params.priority && params.priority !== 'None' && params.priority !== 'none' && params.priority !== 'all') query.append('priority', params.priority);
  if (params.assignedTo && params.assignedTo !== 'all') query.append('assignedTo', params.assignedTo);
  if (params.contactId) query.append('contactId', params.contactId);
  if (params.dealId) query.append('dealId', params.dealId);
  if (params.search) query.append('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';

  let apiTasks = [];
  try {
    const data = await request(`/tasks${qStr}`);
    if (Array.isArray(data)) {
      apiTasks = data.map(normalizeTask);
    }
  } catch (_) {}

  const deduplicated = apiTasks;

  return deduplicated.filter((t) => {
    if (params.status && params.status !== 'All' && params.status !== 'all') {
      const isComp = t.status === 'Completed' || t.status === 'COMPLETED' || t.status === 'DONE';
      if (params.status === 'Completed' && !isComp) return false;
      if (params.status === 'Open' && isComp) return false;
    }
    if (params.priority && params.priority !== 'None' && params.priority !== 'none' && params.priority !== 'all') {
      if ((t.priority || '').toLowerCase() !== params.priority.toLowerCase()) return false;
    }
    if (params.assignedTo && params.assignedTo !== 'all') {
      const assigned = (typeof t.assignee === 'object' ? t.assignee?.name : t.assignee) || t.assignedToName || '';
      if (!assigned.toLowerCase().includes(params.assignedTo.toLowerCase())) return false;
    }
    if (params.dealId) {
      if (String(t.dealId || t.deal?.id || t.deal?.code) !== String(params.dealId)) return false;
    }
    if (params.contactId) {
      if (String(t.contactId || t.contact?.id || t.contact?.code) !== String(params.contactId)) return false;
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      const match = (t.title || '').toLowerCase().includes(q) || (t.content || t.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export async function getTask(id) {
  if (!id) return null;
  const data = await request(`/tasks/${encodeURIComponent(id)}`);
  if (data) return normalizeTask(data);

  

  return null;
}

export async function createTask(data) {
  

  // Format payload to comply with Spring Boot Task entity schema
  let dueDateIso = null;
  if (data.dueDate) {
    const matchSlash = String(data.dueDate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchSlash) {
      const month = matchSlash[1].padStart(2, '0');
      const day = matchSlash[2].padStart(2, '0');
      const year = matchSlash[3];
      dueDateIso = `${year}-${month}-${day}`;
    } else {
      const matchIso = String(data.dueDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (matchIso) {
        dueDateIso = matchIso[0];
      }
    }
  }

  const bePayload = {
    title: data.title || 'Follow-up Task',
    description: data.content || data.description || '',
    priority:
      (data.priority || '').toUpperCase() === 'HIGH'
        ? 'HIGH'
        : (data.priority || '').toUpperCase() === 'LOW'
        ? 'LOW'
        : 'MEDIUM',
    status:
      (data.status || '').toUpperCase() === 'COMPLETED' || (data.status || '').toUpperCase() === 'DONE'
        ? 'COMPLETED'
        : (data.status || '').toUpperCase() === 'IN_PROGRESS' || (data.status || '').toUpperCase() === 'IN PROGRESS'
        ? 'IN_PROGRESS'
        : 'OPEN',
    taskType: data.taskType && data.taskType !== '--' ? data.taskType : 'To Do',
  };

  if (dueDateIso) {
    bePayload.dueDate = dueDateIso;
  }

  if (data.dealId) {
    const rawId = String(data.dealId).replace(/^[^\d]+/, '');
    const num = Number(rawId);
    if (!isNaN(num) && num > 0) {
      bePayload.deal = { id: num };
    }
  }

  if (data.contactId) {
    const rawId = String(data.contactId).replace(/^[^\d]+/, '');
    const num = Number(rawId);
    if (!isNaN(num) && num > 0) {
      bePayload.contact = { id: num };
    }
  }

  const res = await request('/tasks', { method: 'POST', body: JSON.stringify(bePayload) });

  if (res && res.id) {
    const updated = {
      ...data,
      id: String(res.id),
      code: res.code || `TSK2600${1000 + Number(res.id)}`,
    };
    
    return normalizeTask(updated);
  }

  return normalizeTask(data);
}

export async function updateTask(id, data) {
  

  const rawId = String(id).replace(/^[^\d]+/, '');
  const numId = Number(rawId);

  const bePayload = {};
  if (data.title) bePayload.title = data.title;
  if (data.content || data.description) bePayload.description = data.content || data.description;
  if (data.priority) {
    bePayload.priority =
      (data.priority || '').toUpperCase() === 'HIGH'
        ? 'HIGH'
        : (data.priority || '').toUpperCase() === 'LOW'
        ? 'LOW'
        : 'MEDIUM';
  }
  if (data.status) {
    bePayload.status =
      (data.status || '').toUpperCase() === 'COMPLETED' || (data.status || '').toUpperCase() === 'DONE'
        ? 'COMPLETED'
        : (data.status || '').toUpperCase() === 'IN_PROGRESS' || (data.status || '').toUpperCase() === 'IN PROGRESS'
        ? 'IN_PROGRESS'
        : 'OPEN';
  }
  if (data.taskType && data.taskType !== '--') bePayload.taskType = data.taskType;

  const endpointId = (!isNaN(numId) && numId > 0) ? numId : id;

  const res = await request(`/tasks/${encodeURIComponent(endpointId)}`, {
    method: 'PUT',
    body: JSON.stringify(bePayload),
  });

  return res ? normalizeTask(res) : normalizeTask(data);
}

// ── Commissions ──────────────────────────────────────────────────────────────
export async function getCommissions(params = {}) {
  const query = new URLSearchParams();
  if (params.agentName) query.append('agentName', params.agentName);
  if (params.period) query.append('period', params.period);
  if (params.status) query.append('status', params.status);
  if (params.carrier) query.append('carrier', params.carrier);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await request(`/commissions${qStr}`);
}

export async function getCommissionSummary(agentName) {
  const q = agentName ? `?agentName=${encodeURIComponent(agentName)}` : '';
  return await request(`/commissions/summary${q}`);
}

export async function createCommission(data) {
  return await request('/commissions', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCommission(id, data) {
  return await request(`/commissions/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function calculateCommissions(data = {}) {
  return await request('/commissions/calculate', { method: 'POST', body: JSON.stringify(data) });
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  return await request('/dashboard/stats');
}

// ── Admin Portal Operations ──────────────────────────────────────────────────
export async function getAdminStats() { const data = await request('/admin/stats'); if (!data) return null; return { ...data, totalInquiries: data.totalQuotes || data.totalInquiries || 0, verifiedAgents: data.totalUsers || data.verifiedAgents || 0, activeDeals: data.totalDeals || data.activeDeals || 0 }; }

export async function getAdminAccounts() {
  try {
    const data = await request('/admin/accounts');
    if (Array.isArray(data)) {
      const normalized = data.map(normalizeAccount);
      if (typeof window !== 'undefined' && normalized.length > 0) {
        localStorage.setItem('insurmatch_admin_accounts', JSON.stringify(normalized));
        window.dispatchEvent(new CustomEvent('insurmatch_accounts_updated'));
      }
      return normalized;
    }
  } catch {}
  return [];
}

// Real API rejections (validation / duplicate) must reach the UI; only an unreachable
// backend (network error, 5xx/proxy failure, missing auth in mock mode) falls back to mock storage.
function isApiRejection(err) {
  return [400, 409, 422].includes(err?.status);
}

// Offline-only temporary password. Never written to localStorage.
function generateLocalTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(10);
  (globalThis.crypto || window.crypto).getRandomValues(bytes);
  return `${Array.from(bytes, (b) => chars[b % chars.length]).join('')}@1`;
}

export async function createAdminAccount(data) {
  try {
    const res = await request('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res) {
      const normalized = normalizeAccount(res);
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('insurmatch_admin_accounts');
          const current = raw ? JSON.parse(raw) : [];
          const updated = [normalized, ...current.filter((a) => String(a.id) !== String(normalized.id))];
          localStorage.setItem('insurmatch_admin_accounts', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('insurmatch_accounts_updated'));
        } catch {}
      }
      return normalized; // includes tempPassword from the backend response
    }
  } catch (err) {
    throw err;
  }
}

export async function updateAdminAccount(id, data) {
  try {
    const res = await request(`/admin/accounts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('insurmatch_admin_accounts');
        if (raw) {
          const current = JSON.parse(raw);
          const updated = current.map((a) => (String(a.id) === String(id) ? { ...a, ...data } : a));
          localStorage.setItem('insurmatch_admin_accounts', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('insurmatch_accounts_updated'));
        }
      } catch {}
    }
    return res;
  } catch (err) {
    throw err;
  }
}

function normalizeQuote(q) {
  if (!q) return q;
  const name = q.name || q.fullName || 'Lead Customer';
  return {
    ...q,
    id: String(q.id),
    name,
    fullName: name,
    code: q.code || `QT2600${String(q.id || 1).padStart(4, '0')}`,
    phone: q.phone || '—',
    email: q.email || '—',
    status: q.status || 'New Inquiry',
    insuranceType: q.insuranceType || 'ACA Health',
    state: q.state || 'TX',
    dateSubmitted: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Today',
  };
}

export async function getAdminQuotes() {
  try {
    const data = await request('/admin/quotes');
    return Array.isArray(data) ? data.map(normalizeQuote) : data;
  } catch {
    return null;
  }
}

export async function assignAdminQuote(id, data) {
  return await request(`/admin/quotes/${encodeURIComponent(id)}/assign`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateDealAdmin(id, adminData) {
  return await request(`/deals/${encodeURIComponent(id)}/admin`, {
    method: 'PUT',
    body: JSON.stringify(adminData),
  });
}

export async function getAdminAuditLogs() {
  try {
    return await request('/admin/audit-logs');
  } catch {
    return null;
  }
}

export async function submitQuote(data) {
  return await request('/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}



export async function deleteContact(id) { return await request(`/contacts/${id}`, { method: 'DELETE' }); }
export async function deleteDeal(id) { return await request(`/deals/${id}`, { method: 'DELETE' }); }
export async function deleteTicket(id) { return await request(`/tickets/${id}`, { method: 'DELETE' }); }
export async function deleteTask(id) { return await request(`/tasks/${id}`, { method: 'DELETE' }); }
export async function deleteCommission(id) { return await request(`/commissions/${id}`, { method: 'DELETE' }); }
export async function deleteAdminAccount(id) {
  const res = await request(`/admin/accounts/${id}`, { method: 'DELETE' });
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('insurmatch_admin_accounts');
      if (raw) {
        const current = JSON.parse(raw);
        const updated = current.filter((a) => String(a.id) !== String(id));
        localStorage.setItem('insurmatch_admin_accounts', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('insurmatch_accounts_updated'));
      }
    } catch {}
  }
  return res;
}
