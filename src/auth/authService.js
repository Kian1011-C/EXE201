// ============================================================
// authService.js — InsurMatch Auth Service
// Kết nối real API Spring Boot: POST /api/auth/login
// Fallback to demo accounts khi backend offline
// ============================================================

const DEMO_ACCOUNTS = [
  {
    id: 1,
    email: 'admin@insurmatch.us',
    password: 'Admin@123',
    role: 'admin',
    name: 'Super Admin',
    avatar: 'SA',
  },
  {
    id: 2,
    email: 'staff@insurmatch.us',
    password: 'Staff@123',
    role: 'staff',
    name: 'Platform Staff',
    avatar: 'SM',
  },
  {
    id: 3,
    email: 'agent@insurmatch.us',
    password: 'Agent@123',
    role: 'agent',
    name: 'Licensed Agent Partner',
    avatar: 'IA',
  },
  {
    id: 4,
    email: 'manager@insurmatch.us',
    password: 'Manager@123',
    role: 'staff',
    name: 'Manager',
    avatar: 'MG',
  },
];

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─────────────────────────────────────────────
// LOGIN — Try real Spring Boot API first, fallback to demo accounts
// ─────────────────────────────────────────────
export async function login(email, password) {
  const normalizedEmail = email?.trim().toLowerCase();

  // ── Attempt 1: Call real Spring Boot API ──────────────────
  try {
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
        // Map ROLE_ADMIN -> admin, ROLE_STAFF -> staff, etc.
        if (user.role.startsWith('role_')) {
          user.role = user.role.replace('role_', '');
        }
        // Map Spring Boot roles: SUPPORT / TELESALES -> staff, MANAGER -> admin
        if (user.role === 'support' || user.role === 'telesales') {
          user.role = 'staff';
        } else if (user.role === 'manager') {
          user.role = 'admin';
        }
      }

      // Generate avatar initials if missing
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

      // Store refresh token if available
      if (data.refreshToken) {
        localStorage.setItem('tbri_refresh_token', data.refreshToken);
      }

      console.log('[Auth] Successfully logged in via Spring Boot API');
      return { token, user };
    }

    // If API returned error, extract error message
    const errBody = await res.json().catch(() => ({}));
    const errMsg = errBody.message || errBody.error || `Login failed (${res.status})`;

    // If it's a genuine auth failure (401/403), throw immediately — don't fallback
    if (res.status === 401 || res.status === 403) {
      throw new Error(errMsg);
    }

    // For other errors (500, etc.), fall through to demo accounts
    console.warn('[Auth] API returned error, trying demo accounts:', errMsg);
  } catch (fetchError) {
    // Network error or CORS issue — fall through to demo accounts
    if (fetchError.message?.includes('Login failed') ||
        fetchError.message?.includes('Invalid') ||
        fetchError.message?.includes('not activated') ||
        fetchError.message?.includes('credentials')) {
      // This is a real auth error from the server, don't fallback
      throw fetchError;
    }
    console.warn('[Auth] Backend offline, using demo accounts:', fetchError.message);
  }

  // ── Attempt 2: Fallback to local demo accounts ────────────
  const account = DEMO_ACCOUNTS.find(
    (a) =>
      (a.email.toLowerCase() === normalizedEmail ||
        a.email.replace('@insurmatch.us', '@thebestrateins.com').toLowerCase() === normalizedEmail ||
        a.email.replace('@insurmatch.us', '@insurmatch.com').toLowerCase() === normalizedEmail) &&
      a.password === password
  );

  if (!account) {
    throw new Error('Invalid email or password.');
  }

  const token = `mock-token-${account.role}-${Date.now()}`;
  const user = { id: account.id, name: account.name, email: account.email, role: account.role, avatar: account.avatar };

  // Persist session
  localStorage.setItem('tbri_token', token);
  localStorage.setItem('tbri_user', JSON.stringify(user));

  console.log('[Auth] Logged in via demo accounts (backend offline)');
  return { token, user };
}

// ─────────────────────────────────────────────
// LOGOUT — Clear local storage + optionally call backend
// ─────────────────────────────────────────────
export function logout() {
  // Try to call backend logout (fire-and-forget)
  const token = localStorage.getItem('tbri_token');
  if (token && !token.startsWith('mock-token-')) {
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
// Optionally validate token with GET /api/auth/me
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
