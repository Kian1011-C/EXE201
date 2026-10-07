import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { checkBackendHealth } from '../../../services/api';
import CommandPaletteModal from '../../../components/common/CommandPaletteModal';

export default function StaffCrmLayout({
  children,
  currentTab = 'contacts',
  onSelectTab,
  isAgent = false,
  isAdmin = false,
  agentName = 'Khánh Nguyen',
  agentNpn = '#1984210',
  showCommission = false,
  quotesBadge,
  accountsBadge,
  onManualRefresh,
  isRefreshing = false,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Global Ctrl+K / Cmd+K listener for Command Palette
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
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

  // Navigation Items Specification
  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      desc: 'Báo cáo & Tổng quan điều hành',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: 'person_search',
      desc: 'Danh bạ khách hàng tiềm năng & Hợp đồng',
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: 'handshake',
      desc: 'Hồ sơ bảo hiểm đang xử lý & Master Deals AOR',
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'confirmation_number',
      desc: 'Hỗ trợ dịch vụ sau bán & SLA',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'checklist',
      desc: 'Quản lý công việc & Kanban',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'folder_shared',
      desc: 'Hồ sơ tài liệu khách hàng & Xác thực',
    },
    {
      id: 'quotes',
      label: 'Match Queue',
      icon: 'contact_support',
      badge: quotesBadge !== undefined ? quotesBadge : '14',
      desc: 'Hàng đợi phân bổ & Điều phối Lead',
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: 'manage_accounts',
      badge: accountsBadge !== undefined ? accountsBadge : '1',
      desc: 'Tài khoản & Thẩm định NPN',
    },
    {
      id: 'commissions',
      label: 'Commission',
      icon: 'payments',
      desc: 'Doanh thu thuê bao SaaS & Hoa hồng Sales nội bộ (Coms.pdf)',
    },
    {
      id: 'system',
      label: 'System & Audit',
      icon: 'dns',
      desc: 'Hạ tầng máy chủ & Nhật ký Audit',
    },
  ];

  const standardNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      badge: '27',
      desc: 'Báo cáo & Tổng quan điều hành',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: 'person_search',
      desc: 'Danh bạ khách hàng tiềm năng',
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: 'handshake',
      desc: 'Hồ sơ bảo hiểm đang xử lý',
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'confirmation_number',
      desc: 'Hỗ trợ dịch vụ sau bán & SLA',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'checklist',
      desc: 'Quản lý công việc & Kanban',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'folder_shared',
      desc: 'Hồ sơ tài liệu khách hàng & Xác thực',
    },
  ];

  const agentNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      desc: 'Báo cáo & Tổng quan đại lý',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: 'person_search',
      desc: 'Khách hàng phụ trách của tôi',
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: 'handshake',
      desc: 'Hồ sơ bảo hiểm của tôi',
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'confirmation_number',
      desc: 'Hỗ trợ dịch vụ & SLA phụ trách',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'checklist',
      desc: 'Công việc & Lịch nhắc việc',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'folder_shared',
      desc: 'Tài liệu khách hàng của tôi',
    },
    {
      id: 'subscription',
      label: 'Gói cước CRM',
      icon: 'card_membership',
      desc: 'Xem gói hiện tại & Mua/Nâng cấp gói',
    },
    {
      id: 'commission',
      label: 'Hoa hồng',
      icon: 'payments',
      desc: 'Sổ hoa hồng bảo hiểm PMPM & Quyết toán',
    },
  ];

  const staffNavItems = [
    ...standardNavItems,
    ...(showCommission
      ? [
          {
            id: 'commission',
            label: 'Commission',
            icon: 'payments',
            desc: 'Doanh thu thuê bao SaaS & Hoa hồng Sales',
          },
        ]
      : []),
  ];

  const navItems = isAdmin ? adminNavItems : isAgent ? agentNavItems : staffNavItems;

  const currentTabObj = navItems.find((n) => n.id === currentTab) || navItems[0];

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased ${
      isAdmin ? 'selection:bg-rose-100 selection:text-rose-950' : 'selection:bg-blue-100 selection:text-blue-950'
    }`}>
      {/* ── Top Bar Header ─────────────────────────────────────────────────── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-2xs">
        {/* Left: Brand + Segmented Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link
            to={isAdmin ? '/dashboard/admin' : isAgent ? '/dashboard/agent' : '/dashboard/staff'}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="relative">
              <img
                src="/images/insurmatch-logo.png"
                alt="InsurMatch"
                className="w-8 h-8 object-contain rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ${
                  isAdmin
                    ? 'bg-rose-600 ring-rose-500/20'
                    : 'bg-emerald-500 ring-emerald-500/20'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-[14px] font-black tracking-tight text-slate-900">
                  INSUR<span className="text-blue-600 font-extrabold">MATCH</span>
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold border tracking-wide uppercase shadow-2xs ${
                    isAdmin
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isAgent
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isAdmin ? 'Administrator 👑' : isAgent ? 'Licensed Agent' : 'Staff CRM'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
                {isAdmin
                  ? 'Platform Operations & Agency Governance'
                  : isAgent
                  ? 'CMS Compliant Agent Portal'
                  : 'Enterprise Policy & Lead Hub'}
              </span>
            </div>
          </Link>

        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Manual Refresh Button (Admin / Staff) */}
          {onManualRefresh && (
            <button
              type="button"
              onClick={onManualRefresh}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Refresh Live Data"
            >
              <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}

          {/* Quick Search Icon Trigger (Ctrl+K) */}
          <button
            type="button"
            onClick={() => setShowCommandPalette(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Quick Search (Ctrl+K)"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Notification Center Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Trung tâm Thông báo"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in-up">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs tracking-tight">Notification Center</span>
                    {unreadNotifications > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnreadNotifications(0)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {isAdmin ? (
                    <>
                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab && onSelectTab('quotes');
                        }}
                        className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">contact_support</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">Match Queue: 14 Leads Waiting</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">Consumer quote requests awaiting agency dispatch</p>
                          <span className="text-[10px] text-slate-400 font-medium">5 mins ago</span>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab && onSelectTab('accounts');
                        }}
                        className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">NPN Verification Pending</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">Agent Sarah Tran • TDI License submitted (SOP 23)</p>
                          <span className="text-[10px] text-slate-400 font-medium">25 mins ago</span>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab && onSelectTab('system');
                        }}
                        className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">webhook</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">Carrier Webhook Reconciled</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">EDI 834 inbound feed synced • 200 OK</p>
                          <span className="text-[10px] text-slate-400 font-medium">1 hour ago</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab && onSelectTab('tickets');
                        }}
                        className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">priority_high</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">SLA Warning: Tickets Near Due</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">3 tickets need response within 24h</p>
                          <span className="text-[10px] text-slate-400 font-medium">10 mins ago</span>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab && onSelectTab('deals');
                        }}
                        className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">New Verified ACA Enrollment</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">D26005033 • Nhat Dang • BCBS NC</p>
                          <span className="text-[10px] text-slate-400 font-medium">1 hour ago</span>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectTab && onSelectTab('commission');
                        }}
                        className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">Commission Cycle Reconciled</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">September 2026 ledger updated with 10 records</p>
                          <span className="text-[10px] text-slate-400 font-medium">2 hours ago</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      setShowCommandPalette(true);
                    }}
                    className="text-[11px] text-slate-600 hover:text-blue-600 font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <span>View All Activity &amp; Commands</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>





          {/* Agent Regulatory Badge */}
          {isAgent && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>NPN {agentNpn}</span>
            </div>
          )}

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-all duration-150 cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div
                className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-2xs ${
                  isAdmin
                    ? 'bg-gradient-to-tr from-rose-700 to-red-600'
                    : isAgent
                    ? 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                    : 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                }`}
              >
                {isAdmin ? 'SA' : isAgent ? 'KN' : user?.avatar || 'TB'}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[130px] truncate">
                {isAdmin ? 'System Admin 👑' : isAgent ? agentName : user?.email || 'tiger.truongBG@...'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in-up">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">
                    {isAdmin
                      ? 'System Administrator 👑'
                      : isAgent
                      ? `${agentName}, Licensed Agent`
                      : user?.name || 'Staff User'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {isAdmin
                      ? 'admin@insurmatch.us'
                      : isAgent
                      ? `NPN: ${agentNpn}`
                      : user?.email || 'tiger.truongBG@...'}
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-rose-100 text-rose-800'
                        : isAgent
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isAdmin ? 'PLATFORM ADMINISTRATOR' : isAgent ? 'INDEPENDENT AGENT' : user?.role || 'STAFF OPERATIONS'}
                  </span>
                </div>

                <div className="py-1">
                  {isAgent && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onSelectTab && onSelectTab('subscription');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-blue-600 hover:bg-blue-50 text-left transition cursor-pointer font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">card_membership</span>
                      <span>Gói thuê bao CRM của tôi</span>
                    </button>
                  )}
                  {isAgent && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onSelectTab && onSelectTab('commission');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                      <span>Sổ hoa hồng bảo hiểm</span>
                    </button>
                  )}
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-400">open_in_new</span>
                    <span>View Public Portal</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Body with Left Slim Rail ──────────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden">
        {/* Leftmost Dark Navy Navigation Rail (hidden on mobile, visible on md+) */}
        <aside className="hidden md:flex w-14 bg-[#0A1628] shrink-0 flex-col items-center py-3.5 gap-2 z-30 shadow-lg border-r border-slate-800/50">
          {/* Top Home Button */}
          <Link
            to={isAdmin ? '/dashboard/admin' : isAgent ? '/dashboard/agent' : '/dashboard/staff'}
            title="Dashboard Home"
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-150 cursor-pointer mb-2"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </Link>

          <div className="w-6 h-px bg-slate-800 my-1" />

          {/* Direct Module Buttons with Floating Tooltips */}
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    active
                      ? isAdmin
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/40'
                        : 'bg-[#52B4C9] text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </button>

                {/* Smooth Hover Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-semibold whitespace-nowrap opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 flex items-center gap-1.5 border border-slate-700">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        isAdmin ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex-grow" />

          {/* Bottom Settings Icon */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              title={isAdmin ? 'System & Audit Settings' : 'Settings'}
              onClick={() => {
                if (isAdmin && onSelectTab) {
                  onSelectTab('system');
                } else {
                  setShowCommandPalette(true);
                }
              }}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </button>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-medium whitespace-nowrap opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 border border-slate-700">
              {isAdmin ? 'System & Audit Settings' : 'System Settings'}
            </div>
          </div>
        </aside>

        {/* Dynamic CRM Page Content */}
        <main className="flex-grow min-h-0 overflow-auto bg-[#F8FAFC] flex flex-col pb-16 md:pb-0 animate-fade-in-up">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar (Visible only on < md) ───────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1628]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab && onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                active
                  ? isAdmin
                    ? 'text-rose-500 font-bold'
                    : 'text-[#00B4D8] font-bold'
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-bold ${
                      isAdmin ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              {active && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isAdmin ? 'bg-rose-500' : 'bg-[#00B4D8]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Global Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        isAdmin={isAdmin}
        onNavigate={(target) => {
          if (onSelectTab) onSelectTab(target);
        }}
      />
    </div>
  );
}
