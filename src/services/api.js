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
