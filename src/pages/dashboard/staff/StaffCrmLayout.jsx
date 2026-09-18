import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { checkBackendHealth } from '../../../services/api';

export default function StaffCrmLayout({ children, currentTab = 'contacts', onSelectTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCrmMenu, setShowCrmMenu] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const crmMenuRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function verifyHealth() {
      try {
        const res = await checkBackendHealth();
        if (mounted) {
          if (res.status === 'ok' && res.database === 'connected') {
            setDbStatus('connected');
          } else {
            setDbStatus('offline');
          }
        }
      } catch {
        if (mounted) setDbStatus('offline');
      }
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (crmMenuRef.current && !crmMenuRef.current.contains(event.target)) {
        setShowCrmMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-100 selection:text-cyan-950">
      {/* ── Top Bar Header (Image 1, 2, 3) ─────────────────────────────────── */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
        {/* Left: Brand + Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/dashboard/staff" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[19px]">health_and_safety</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900 leading-tight tracking-tight">
                The Best Rate Insurance
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                InsurMatch Partner Platform
              </span>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-5 ml-2 text-xs font-medium text-slate-600">
            <Link
              to="/"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors py-3"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">home</span>
              <span>Portal</span>
            </Link>
            <div className="flex items-center gap-1.5 text-blue-600 font-semibold border-b-2 border-blue-600 py-3.5 px-0.5">
              <span className="material-symbols-outlined text-[16px]">folder_managed</span>
              <span>Management</span>
            </div>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Create + */}
          <button
            title="Create Record"
            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              title="Notifications"
              className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* DB Docker Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition shadow-2xs border">
            {dbStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PostgreSQL Online</span>
              </span>
            ) : dbStatus === 'checking' ? (
              <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Connecting DB...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Offline Fallback</span>
              </span>
            )}
          </div>

          {/* Language selector */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 px-2 py-1 rounded border border-slate-200 bg-white">
            <span className="material-symbols-outlined text-[16px] text-slate-500">language</span>
            <span>English</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs">
                {user?.avatar || 'TB'}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                {user?.email || 'tiger.truongBG@...'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
            </button>

            {/* Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{user?.name || 'Staff User'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email || 'tiger.truongBG@...'}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                    Role: {user?.role || 'staff'}
                  </span>
                </div>

                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>View Public Site</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Body with Left Slim Rail ──────────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden">
        {/* Leftmost Dark Navy Navigation Rail (Exact as in Images 1, 2, 3) */}
        <aside className="w-12 bg-[#0C1B33] shrink-0 flex flex-col items-center py-3 gap-2.5 z-30 shadow-md">
          {/* Top Home / Apps Icon */}
          <button
            title="App Switcher"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>

          {/* Middle Button with CRM Flyout Menu (Matching media_1789719138580.png & media_1789719153156.png) */}
          <div className="relative" ref={crmMenuRef}>
            <button
              title="CRM Management"
              onClick={() => setShowCrmMenu(!showCrmMenu)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                currentTab === 'contacts' || currentTab === 'deals' || showCrmMenu
                  ? 'bg-[#00B4D8] text-white shadow-sm ring-2 ring-cyan-300/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">contacts</span>
            </button>

            {/* Flyout Menu (Showing ONLY the 4 requested items) */}
            {showCrmMenu && (
              <div className="absolute left-full top-0 ml-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Header */}
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 select-none">
                  CRM Management
                </div>

                {/* 1. Dashboard (Above Contacts) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCrmMenu(false);
                    onSelectTab && onSelectTab('dashboard');
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">grid_view</span>
                  <span>Dashboard</span>
                </button>

                {/* 2. Contacts */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCrmMenu(false);
                    onSelectTab && onSelectTab('contacts');
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'contacts'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">contacts</span>
                  <span>Contacts</span>
                </button>

                {/* 2. Deals */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCrmMenu(false);
                    onSelectTab && onSelectTab('deals');
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'deals'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">handshake</span>
                  <span>Deals</span>
                </button>

                {/* 3. Tickets */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCrmMenu(false);
                    onSelectTab && onSelectTab('tickets');
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'tickets'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">confirmation_number</span>
                  <span>Tickets</span>
                </button>

                {/* 4. Tasks */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCrmMenu(false);
                    onSelectTab && onSelectTab('tasks');
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-left transition cursor-pointer ${
                    currentTab === 'tasks'
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] text-slate-500">checklist</span>
                  <span>Tasks</span>
                </button>
              </div>
            )}
          </div>

          {/* Management / Team Icon */}
          <button
            title="Agents &amp; Staff"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
          </button>

          <div className="flex-grow" />

          {/* Bottom Settings Icon */}
          <button
            title="Settings"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </aside>

        {/* Dynamic CRM Page Content */}
        <main className="flex-grow overflow-auto bg-[#F8FAFC] flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
