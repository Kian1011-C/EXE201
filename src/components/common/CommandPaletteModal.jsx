import React, { useState, useEffect, useRef, useMemo } from 'react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
  isAdmin = false,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const adminCommands = [
    {
      id: 'admin-nav-overview',
      category: 'Admin Navigation',
      title: 'Admin Overview & Platform Cockpit',
      subtitle: 'View overall production volume, KPIs & live status',
      icon: 'dashboard',
      iconColor: 'text-rose-500 bg-rose-50',
      action: () => onNavigate('overview'),
    },
    {
      id: 'admin-nav-quotes',
      category: 'Admin Navigation',
      title: 'Match Queue & Lead Inquiries',
      subtitle: 'Review incoming quote requests & dispatch to agents',
      icon: 'contact_support',
      iconColor: 'text-rose-500 bg-rose-50',
      action: () => onNavigate('quotes'),
    },
    {
      id: 'admin-nav-accounts',
      category: 'Admin Navigation',
      title: 'Accounts & NPN Accreditation',
      subtitle: 'Manage agency staff and licensed agent roster & states',
      icon: 'manage_accounts',
      iconColor: 'text-amber-500 bg-amber-50',
      action: () => onNavigate('accounts'),
    },
    {
      id: 'admin-nav-deals',
      category: 'Admin Navigation',
      title: 'Master Deals & AOR Governance',
      subtitle: 'Inspect protected agency policies and override AORs',
      icon: 'handshake',
      iconColor: 'text-blue-500 bg-blue-50',
      action: () => onNavigate('deals'),
    },
    {
      id: 'admin-nav-commissions',
      category: 'Admin Navigation',
      title: 'Master Commission Ledger (SSS)',
      subtitle: 'Calculate and reconcile 7/3, 5/5, 3/7 split ledger',
      icon: 'payments',
      iconColor: 'text-emerald-500 bg-emerald-50',
      action: () => onNavigate('commissions'),
    },
    {
      id: 'admin-nav-system',
      category: 'Admin Navigation',
      title: 'System Health & Audit Logs',
      subtitle: 'PostgreSQL, Docker containers, Carrier Webhooks & HIPAA audit',
      icon: 'dns',
      iconColor: 'text-purple-500 bg-purple-50',
      action: () => onNavigate('system'),
    },
    {
      id: 'admin-action-dispatch',
      category: 'Admin Actions',
      title: 'Dispatch Next Unassigned Lead',
      subtitle: 'Open Match Queue to assign pending inquiry',
      icon: 'send',
      iconColor: 'text-rose-600 bg-rose-100',
      action: () => {
        onNavigate('quotes');
        if (onQuickAction) onQuickAction('dispatch-lead');
      },
    },
    {
      id: 'admin-action-add-account',
      category: 'Admin Actions',
      title: 'Register New Staff / Agent',
      subtitle: 'Create accredited account with NPN and state license',
      icon: 'person_add',
      iconColor: 'text-amber-600 bg-amber-100',
      action: () => {
        onNavigate('accounts');
        if (onQuickAction) onQuickAction('add-account');
      },
    },
    {
      id: 'admin-action-settle-sss',
      category: 'Admin Actions',
      title: 'Trigger SSS Commission Reconcile',
      subtitle: 'Run instant calculation on active month ledger',
      icon: 'calculate',
      iconColor: 'text-emerald-600 bg-emerald-100',
      action: () => {
        onNavigate('commissions');
        if (onQuickAction) onQuickAction('settle-sss');
      },
    },
    {
      id: 'admin-action-system-audit',
      category: 'Admin Actions',
      title: 'Inspect Infrastructure & Audit Trail',
      subtitle: 'Review recent database transactions and security logs',
      icon: 'terminal',
      iconColor: 'text-slate-600 bg-slate-100',
      action: () => {
        onNavigate('system');
        if (onQuickAction) onQuickAction('audit-logs');
      },
    },
  ];

  const defaultCommands = isAdmin ? adminCommands : [
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Go to Executive Dashboard',
      subtitle: 'View 27 operational reports, analytics & SLAs',
      icon: 'dashboard',
      iconColor: 'text-blue-500 bg-blue-50',
      action: () => onNavigate('dashboard'),
    },
    {
      id: 'nav-contacts',
      category: 'Navigation',
      title: 'Go to Contacts Center',
      subtitle: 'Browse prospective policyholders and client records',
      icon: 'person_search',
      iconColor: 'text-emerald-500 bg-emerald-50',
      action: () => onNavigate('contacts'),
    },
    {
      id: 'nav-deals',
      category: 'Navigation',
      title: 'Go to Deals Pipeline',
      subtitle: 'Obamacare 2026 & Medicare 2026 deal stages',
      icon: 'handshake',
      iconColor: 'text-indigo-500 bg-indigo-50',
      action: () => onNavigate('deals'),
    },
    {
      id: 'nav-tickets',
      category: 'Navigation',
      title: 'Go to Tickets & SLA Service Center',
      subtitle: 'Customer support, payment verification, doc collection',
      icon: 'confirmation_number',
      iconColor: 'text-amber-500 bg-amber-50',
      action: () => onNavigate('tickets'),
    },
    {
      id: 'nav-tasks',
      category: 'Navigation',
      title: 'Go to Workload Tasks & Kanban',
      subtitle: 'Manage operational assignments and team workloads',
      icon: 'checklist',
      iconColor: 'text-purple-500 bg-purple-50',
      action: () => onNavigate('tasks'),
    },
    {
      id: 'nav-commission',
      category: 'Navigation',
      title: 'Go to Commission & Audit Ledger',
      subtitle: 'PMPM carrier statements, support fee splits & payouts',
      icon: 'payments',
      iconColor: 'text-teal-500 bg-teal-50',
      action: () => onNavigate('commission'),
    },
    {
      id: 'action-new-ticket',
      category: 'Quick Actions',
      title: 'Create New Support Ticket',
      subtitle: 'Log claim, payment dispute or marketplace task',
      icon: 'add_task',
      iconColor: 'text-blue-600 bg-blue-100',
      action: () => {
        onNavigate('tickets');
        if (onQuickAction) onQuickAction('create-ticket');
      },
    },
    {
      id: 'action-new-deal',
      category: 'Quick Actions',
      title: 'Enroll New Insurance Deal',
      subtitle: 'Create a new ACA or Medicare policy record',
      icon: 'post_add',
      iconColor: 'text-emerald-600 bg-emerald-100',
      action: () => {
        onNavigate('deals');
        if (onQuickAction) onQuickAction('create-deal');
      },
    },
    {
      id: 'action-new-task',
      category: 'Quick Actions',
      title: 'Assign Operation Task',
      subtitle: 'Create task with SLA due date & linked contact',
      icon: 'add_circle',
      iconColor: 'text-purple-600 bg-purple-100',
      action: () => {
        onNavigate('tasks');
        if (onQuickAction) onQuickAction('create-task');
      },
    },
  ];

  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return defaultCommands;
    return defaultCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/45 backdrop-blur-md animate-fade-in-up"
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search modules (e.g. Deals, Tickets, Audit)..."
            className="flex-grow text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition duration-150 ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-950 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cmd.iconColor}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {cmd.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200/70">
                          {cmd.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold shrink-0">
                      <span>Select</span>
                      <span className="material-symbols-outlined text-[14px]">
                        keyboard_return
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-mono">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-mono">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span className="font-medium text-slate-500">InsurMatch Quick Command</span>
        </div>
      </div>
    </div>
  );
}
