// ============================================================
// src/services/api.js — InsurMatch CRM Backend API Client
// Connected to Spring Boot 3 + PostgreSQL via Docker Compose
// ============================================================

import {
  SAMPLE_CONTACTS,
  getDynamicContacts,
  SAMPLE_DEALS,
  getDynamicDeals,
  SAMPLE_TICKETS,
  getDynamicTickets,
  SAMPLE_TASKS,
  getDynamicCustomerDocuments,
} from '../data/mockCrmData';

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
  if (token && !token.startsWith('mock-token-')) {
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
      throw new Error(errBody.message || errBody.error || `HTTP error ${response.status}: ${response.statusText}`);
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
  const ownerName = formatUserName(c.contactOwner) || 'The Best Rate Insurance';
  const modifiedByName = formatUserName(c.lastModifiedBy) || ownerName;

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
    deals: Array.isArray(c.deals) ? c.deals.map(normalizeDeal) : [],
    tasks: Array.isArray(c.tasks) ? c.tasks.map(normalizeTask) : [],
    tickets: Array.isArray(c.tickets) ? c.tickets.map(normalizeTicket) : [],
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

function normalizeAccount(u) {
  if (!u) return u;
  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User';
  const role = (u.role || 'staff').toLowerCase();
  const normalizedRole = (role === 'support' || role === 'telesales') ? 'staff' : (role === 'manager' ? 'admin' : role);
  const status = u.status || (u.active !== false ? 'Active' : 'Suspended');
  return {
    ...u,
    id: String(u.id),
    name,
    role: normalizedRole,
    originalRole: role,
    status,
    phone: u.phone || '—',
    npn: u.npn || '—',
    avatar: u.avatar || getUserAvatar(name),
    statesLicensed: u.statesLicensed || 'Texas (TDI)',
    department: u.department || (normalizedRole === 'admin' ? 'Executive' : (normalizedRole === 'agent' ? 'Sales Agency' : 'Operations')),
    joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
  };
}

// ── Contacts ─────────────────────────────────────────────────────────────────
export async function getUsers() { try { const data = await request('/users'); return Array.isArray(data) ? data : []; } catch { return []; } }

export async function getContacts(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const data = await request(`/contacts${qStr}`);
  return Array.isArray(data) ? data.map(normalizeContact) : data;
}

export async function getContact(id) {
  if (!id) return null;
  const data = await request(`/contacts/${encodeURIComponent(id)}`).catch(() => null);
  if (data) return normalizeContact(data);

  try {
    const dynamic = typeof window !== 'undefined' ? getDynamicContacts() : [];
    const local = [...dynamic, ...SAMPLE_CONTACTS].find(c => String(c.id) === String(id) || String(c.code) === String(id));
    if (local) return normalizeContact(local);
  } catch (_) {}

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
  }).catch(() => null);
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
  const data = await request(`/deals/${encodeURIComponent(id)}`).catch(() => null);
  if (data) return normalizeDeal(data);

  try {
    const dynamic = typeof window !== 'undefined' ? getDynamicDeals() : [];
    const local = [...dynamic, ...SAMPLE_DEALS].find(d => String(d.id) === String(id) || String(d.code) === String(id));
    if (local) return normalizeDeal(local);
  } catch (_) {}

  return null;
}

export async function createDeal(data) {
  const res = await request('/deals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res ? normalizeDeal(res) : res;
}

export async function updateDeal(id, data) {
  const res = await request(`/deals/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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
  const data = await request(`/documents/${encodeURIComponent(id)}`).catch(() => null);
  if (data) return data;

  try {
    const dynamic = typeof window !== 'undefined' ? getDynamicCustomerDocuments() : [];
    const local = dynamic.find(d => String(d.id) === String(id) || String(d.code) === String(id));
    if (local) return local;
  } catch (_) {}

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

// ── Interaction: Notes, Tasks, Activities ────────────────────────────────────
export async function addContactNote(contactId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addContactTask(contactId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addContactActivity(contactId, data) {
  return await request(`/contacts/${encodeURIComponent(contactId)}/activities`, {
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
  const data = await request(`/tickets/${encodeURIComponent(cleanId)}`).catch(() => null);
  if (data) return normalizeTicket(data);

  try {
    const dynamic = typeof window !== 'undefined' ? getDynamicTickets() : [];
    const local = [...dynamic, ...SAMPLE_TICKETS].find(t => String(t.id) === cleanId || String(t.code) === cleanId);
    if (local) return normalizeTicket(local);

    const dynContacts = typeof window !== 'undefined' ? getDynamicContacts() : [];
    const allContacts = [...dynContacts, ...SAMPLE_CONTACTS];
    for (const c of allContacts) {
      const found = (c.associatedTickets || c.tickets || []).find(t => String(t.id) === cleanId || String(t.code) === cleanId);
      if (found) return normalizeTicket(found);
    }

    const dynDeals = typeof window !== 'undefined' ? getDynamicDeals() : [];
    const allDeals = [...dynDeals, ...SAMPLE_DEALS];
    for (const d of allDeals) {
      const found = (d.associatedTickets || d.tickets || []).find(t => String(t.id) === cleanId || String(t.code) === cleanId);
      if (found) return normalizeTicket(found);
    }
  } catch (_) {}

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
  const data = await request(`/tasks${qStr}`);
  return Array.isArray(data) ? data.map(normalizeTask) : data;
}

export async function getTask(id) {
  if (!id) return null;
  const data = await request(`/tasks/${encodeURIComponent(id)}`).catch(() => null);
  if (data) return normalizeTask(data);

  try {
    const local = (SAMPLE_TASKS || []).find(t => String(t.id) === String(id) || String(t.code) === String(id));
    if (local) return normalizeTask(local);
  } catch (_) {}

  return null;
}

export async function createTask(data) {
  const res = await request('/tasks', { method: 'POST', body: JSON.stringify(data) });
  return res ? normalizeTask(res) : res;
}

export async function updateTask(id, data) {
  const res = await request(`/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  return res ? normalizeTask(res) : res;
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
export async function getAdminStats() {
  try {
    const data = await request('/admin/stats');
    if (!data) return null;
    return {
      ...data,
      totalInquiries: data.totalQuotes || data.totalInquiries || 0,
      verifiedAgents: data.totalUsers || data.verifiedAgents || 0,
      activeDeals: data.totalDeals || data.activeDeals || 0,
    };
  } catch {
    return null;
  }
}

export async function getAdminAccounts() {
  try {
    const data = await request('/admin/accounts');
    return Array.isArray(data) ? data.map(normalizeAccount) : data;
  } catch {
    return null;
  }
}

export async function createAdminAccount(data) {
  return await request('/admin/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminAccount(id, data) {
  return await request(`/admin/accounts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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
