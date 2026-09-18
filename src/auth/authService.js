// ============================================================
// authService.js — Mock Auth Service
// Để gắn API thật sau này: chỉ cần sửa hàm login() và logout()
// ============================================================

const DEMO_ACCOUNTS = [
  {
    id: 1,
    email: 'admin@thebestrateins.com',
    password: 'Admin@123',
    role: 'admin',
    name: 'Super Admin',
    avatar: 'SA',
  },
  {
    id: 2,
    email: 'staff@thebestrateins.com',
    password: 'Staff@123',
    role: 'staff',
    name: 'Staff Member',
    avatar: 'SM',
  },
  {
    id: 3,
    email: 'agent@thebestrateins.com',
    password: 'Agent@123',
    role: 'agent',
    name: 'Insurance Agent',
    avatar: 'IA',
  },
];

// ─────────────────────────────────────────────
// LOGIN
// TODO: Replace mock logic with real API call:
//   const res = await fetch('/api/auth/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || 'Login failed');
//   return data; // { token, user: { id, name, email, role, avatar } }
// ─────────────────────────────────────────────
export async function login(email, password) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 700));

  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email && a.password === password
  );

  if (!account) {
    throw new Error('Invalid email or password.');
  }

  const token = `mock-token-${account.role}-${Date.now()}`;
  const user = { id: account.id, name: account.name, email: account.email, role: account.role, avatar: account.avatar };

  // Persist session
  localStorage.setItem('tbri_token', token);
  localStorage.setItem('tbri_user', JSON.stringify(user));

  return { token, user };
}

// ─────────────────────────────────────────────
// LOGOUT
// TODO: Optionally call POST /api/auth/logout to invalidate token on server
// ─────────────────────────────────────────────
export function logout() {
  localStorage.removeItem('tbri_token');
  localStorage.removeItem('tbri_user');
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
    return { token, user };
  } catch {
    return null;
  }
}
