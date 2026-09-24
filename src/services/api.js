// ============================================================
// src/services/api.js — InsurMatch CRM Backend API Client
// Connected to PostgreSQL via Docker Compose Express Server
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to handle fetch responses with proper JSON parsing and error messages
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

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
      throw new Error(errBody.error || `HTTP error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[CRM API] Call to ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function checkBackendHealth() {
  try {
    return await request('/health');
  } catch (err) {
    return { status: 'offline', database: 'disconnected', error: err.message };
  }
}

// ── Contacts ─────────────────────────────────────────────────────────────────
export async function getContacts(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await request(`/contacts${qStr}`);
}

export async function getContact(id) {
  return await request(`/contacts/${encodeURIComponent(id)}`);
}

export async function createContact(data) {
  return await request('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Deals ────────────────────────────────────────────────────────────────────
export async function getDeals(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.stage) query.append('stage', params.stage);
  if (params.pipeline) query.append('pipeline', params.pipeline);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await request(`/deals${qStr}`);
}

export async function getDeal(id) {
  return await request(`/deals/${encodeURIComponent(id)}`);
}

export async function updateDeal(id, data) {
  return await request(`/deals/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Documents ────────────────────────────────────────────────────────────────
export async function getDocument(id) {
  return await request(`/documents/${encodeURIComponent(id)}`);
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
  if (params.pipeline) query.append('pipeline', params.pipeline);
  if (params.status) query.append('status', params.status);
  if (params.priority) query.append('priority', params.priority);
  if (params.contactId) query.append('contactId', params.contactId);
  if (params.dealId) query.append('dealId', params.dealId);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await request(`/tickets${qStr}`);
}

export async function getTicket(id) {
  return await request(`/tickets/${encodeURIComponent(id)}`);
}

export async function createTicket(data) {
  return await request('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTicket(id, data) {
  return await request(`/tickets/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function addTicketComment(ticketId, data) {
  return await request(`/tickets/${encodeURIComponent(ticketId)}/comments`, { method: 'POST', body: JSON.stringify(data) });
}

// ── Tasks ────────────────────────────────────────────────────────────────────
export async function getTasks(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.priority) query.append('priority', params.priority);
  if (params.assignedTo) query.append('assignedTo', params.assignedTo);
  if (params.contactId) query.append('contactId', params.contactId);
  if (params.dealId) query.append('dealId', params.dealId);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return await request(`/tasks${qStr}`);
}

export async function getTask(id) {
  return await request(`/tasks/${encodeURIComponent(id)}`);
}

export async function createTask(data) {
  return await request('/tasks', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTask(id, data) {
  return await request(`/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
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
