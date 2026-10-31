// ============================================================
// authService.js — InsurMatch Auth Service
// Kết nối real API Spring Boot: POST /api/auth/login
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const CANONICAL_ACCOUNT_ROLES = {
  'admin@insurmatch.us': 'admin',
  'staff@insurmatch.us': 'staff',
  'agent@insurmatch.us': 'agent',
};

export function normalizeUser(rawUser, fallbackEmail = '') {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const email = (rawUser.email || fallbackEmail || '').trim().toLowerCase();
  let role = (rawUser.role || rawUser.roleName || 'staff').toString().toLowerCase();
  if (role.startsWith('role_')) {
    role = role.replace('role_', '');
  }
  if (role === 'support' || role === 'telesales') {
    role = 'staff';
  } else if (role === 'manager') {
    role = 'admin';
  }
  if (CANONICAL_ACCOUNT_ROLES[email]) {
    role = CANONICAL_ACCOUNT_ROLES[email];
  }

  const name =
    rawUser.name ||
    [rawUser.firstName, rawUser.lastName].filter(Boolean).join(' ') ||
    (email ? email.split('@')[0] : 'User');

  const avatar =
    rawUser.avatar ||
    name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'U';

  return {
    ...rawUser,
    email: rawUser.email || email,
    name,
    role,
    avatar,
  };
}

// ─────────────────────────────────────────────
// LOGIN — Call real Spring Boot API
// ─────────────────────────────────────────────
export async function login(email, password) {
  const normalizedEmail = email?.trim().toLowerCase();

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });

  if (res.ok) {
    const resp = await res.json();
    // Handle Spring Boot ApiResponse wrapper: { success: true, data: { token, user } }
    const data = (resp && resp.data) ? resp.data : resp;
    const token = data.token || data.accessToken;
    const rawUser = data.user || {
      id: data.userId || data.id,
      name: data.name || normalizedEmail.split('@')[0],
      email: data.email || normalizedEmail,
      role: (data.role || 'staff').toLowerCase(),
      avatar: (data.name || 'U').substring(0, 2).toUpperCase(),
    };

    const user = normalizeUser(rawUser, normalizedEmail);

    // Persist session
    localStorage.setItem('tbri_token', token);
    localStorage.setItem('tbri_user', JSON.stringify(user));

    if (data.refreshToken) {
      localStorage.setItem('tbri_refresh_token', data.refreshToken);
    }

    return { token, user };
  }

  // If API returned error, extract error message
  const errBody = await res.json().catch(() => ({}));
  const errMsg = errBody.message || errBody.error || `Login failed (${res.status})`;
  throw new Error(errMsg);
}

// ─────────────────────────────────────────────
// LOGOUT — Clear local storage + call backend
// ─────────────────────────────────────────────
export function logout() {
  const token = localStorage.getItem('tbri_token');
  if (token) {
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {});
  }

  localStorage.removeItem('tbri_token');
  localStorage.removeItem('tbri_user');
  localStorage.removeItem('tbri_refresh_token');
}

// ─────────────────────────────────────────────
// RESTORE SESSION from localStorage
// ─────────────────────────────────────────────
export function restoreSession() {
  const token = localStorage.getItem('tbri_token');
  const userRaw = localStorage.getItem('tbri_user');
  if (!token || !userRaw) return null;
  try {
    const parsed = JSON.parse(userRaw);
    const user = normalizeUser(parsed);
    if (!user) return null;
    localStorage.setItem('tbri_user', JSON.stringify(user));
    return { token, user };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// ME — Get current user
// ─────────────────────────────────────────────
export async function getMe() {
  const token = localStorage.getItem('tbri_token');
  if (!token) throw new Error('No token');
  
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) {
    const resp = await res.json();
    return (resp && resp.data) ? resp.data : resp;
  }
  throw new Error('Failed to get user');
}

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
export async function refreshToken() {
  const token = localStorage.getItem('tbri_refresh_token');
  if (!token) throw new Error('No refresh token');

  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (res.ok) {
    const resp = await res.json();
    const data = (resp && resp.data) ? resp.data : resp;
    if (data.token || data.accessToken) {
      localStorage.setItem('tbri_token', data.token || data.accessToken);
      if (data.refreshToken) {
         localStorage.setItem('tbri_refresh_token', data.refreshToken);
      }
      return data;
    }
  }
  throw new Error('Failed to refresh token');
}
