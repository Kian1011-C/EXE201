// ============================================================
// authService.js — InsurMatch Auth Service
// Kết nối real API Spring Boot: POST /api/auth/login
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
    const user = data.user || {
      id: data.userId || data.id,
      name: data.name || normalizedEmail.split('@')[0],
      email: data.email || normalizedEmail,
      role: (data.role || 'staff').toLowerCase(),
      avatar: (data.name || 'U').substring(0, 2).toUpperCase(),
    };

    // Normalize role to lowercase for frontend routing
    if (user.role) {
      user.role = user.role.toLowerCase();
      if (user.role.startsWith('role_')) {
        user.role = user.role.replace('role_', '');
      }
      if (user.role === 'support' || user.role === 'telesales') {
        user.role = 'staff';
      } else if (user.role === 'manager') {
        user.role = 'admin';
      }
    }

    if (!user.avatar && user.name) {
      user.avatar = user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }

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
    const user = JSON.parse(userRaw);
    if (user.role === 'support' || user.role === 'telesales') {
      user.role = 'staff';
    } else if (user.role === 'manager') {
      user.role = 'admin';
    }
    return { token, user };
  } catch {
    return null;
  }
}
