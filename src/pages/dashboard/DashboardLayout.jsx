import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../auth/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { label: 'Overview', icon: 'dashboard', path: '/dashboard/admin' },
    { label: 'Match Inquiries', icon: 'request_quote', path: '/dashboard/admin/quotes' },
    { label: 'Manage Accounts', icon: 'manage_accounts', path: '/dashboard/admin/accounts' },
    { label: 'Analytics', icon: 'bar_chart', path: '/dashboard/admin/analytics' },
    { label: 'Settings', icon: 'settings', path: '/dashboard/admin/settings' },
  ],
  staff: [
    { label: 'Overview', icon: 'dashboard', path: '/dashboard/staff' },
    { label: 'Match Inquiries', icon: 'request_quote', path: '/dashboard/staff/quotes' },
    { label: 'Assign to Agent', icon: 'assignment_ind', path: '/dashboard/staff/assign' },
  ],
  agent: [
    { label: 'Overview', icon: 'dashboard', path: '/dashboard/agent' },
    { label: 'My Leads', icon: 'contacts', path: '/dashboard/agent/leads' },
    { label: 'Clients', icon: 'people', path: '/dashboard/agent/clients' },
  ],
};

const ROLE_COLORS = {
  admin: { badge: 'bg-rose-100 text-rose-700', accent: 'border-rose-400' },
  staff: { badge: 'bg-amber-100 text-amber-700', accent: 'border-amber-400' },
  agent: { badge: 'bg-emerald-100 text-emerald-700', accent: 'border-emerald-400' },
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_BY_ROLE[user?.role] || [];
  const colors = ROLE_COLORS[user?.role] || ROLE_COLORS.agent;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const Sidebar = (
    <aside className="w-64 shrink-0 bg-trust-navy-deep text-white flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/images/insurmatch-logo.png" alt="InsurMatch" className="w-8 h-8 object-contain rounded-lg shrink-0" />
          <div>
            <div className="text-white font-extrabold text-base leading-tight">Insur<span className="text-cyan-ice">Match</span></div>
            <div className="text-cyan-ice/70 text-xs">Partner &amp; Admin Portal</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          {user?.avatar || '??'}
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.badge} capitalize`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen sticky top-0">
        {Sidebar}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 flex flex-col lg:hidden"
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-grow flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-stroke-subtle px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface text-[22px]">menu</span>
            </button>
            <div className={`hidden sm:block h-6 w-1 rounded-full ${colors.accent} border-l-4`} />
            <h1 className="text-title-md font-title-md font-bold text-on-surface capitalize">
              {user?.role} Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-body-sm font-body-sm text-primary hover:text-primary-container transition px-3 py-1.5 rounded-lg hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              {user?.avatar}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
