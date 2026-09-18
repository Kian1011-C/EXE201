import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import DashboardLayout from './DashboardLayout';

// ── Placeholder stat cards ──────────────────────────────────
const STATS = [
  { label: 'Total Match Inquiries', value: '—', icon: 'request_quote', color: 'text-primary', bg: 'bg-primary/10', note: 'Connect API' },
  { label: 'Verified Partner Agents', value: '—', icon: 'support_agent', color: 'text-emerald-600', bg: 'bg-emerald-50', note: 'Connect API' },
  { label: 'Staff Members', value: '—', icon: 'badge', color: 'text-amber-600', bg: 'bg-amber-50', note: 'Connect API' },
  { label: 'Monthly Match Volume', value: '—', icon: 'trending_up', color: 'text-rose-600', bg: 'bg-rose-50', note: 'Connect API' },
];

const RECENT_LEADS = [
  { name: 'Demo Lead 1', type: 'Medicare', status: 'New', date: '—' },
  { name: 'Demo Lead 2', type: 'ACA / Health', status: 'Contacted', date: '—' },
  { name: 'Demo Lead 3', type: 'Life Insurance', status: 'Closed', date: '—' },
];

const STATUS_COLOR = {
  New: 'bg-primary/10 text-primary',
  Contacted: 'bg-amber-100 text-amber-700',
  Closed: 'bg-emerald-100 text-emerald-700',
};

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Welcome back, Admin 👑</h2>
        <p className="text-body-md font-body-md text-on-surface-variant mt-1">
          Here's an overview of InsurMatch platform operations and agent network activity.
        </p>
      </div>

      {/* API Notice */}
      <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <span className="material-symbols-outlined text-[22px] text-amber-500 shrink-0 mt-0.5">info</span>
        <div className="text-body-sm font-body-sm">
          <strong className="font-bold">Placeholder Data</strong> — Stats and tables below will populate automatically once the backend API is connected.
          {' '}<code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">GET /api/admin/stats</code>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="text-headline-sm font-headline-sm font-bold text-on-surface">{stat.value}</div>
            <div className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">{stat.label}</div>
            <div className="text-xs text-outline mt-1 italic">{stat.note}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/dashboard/admin/quotes" className="flex items-center gap-3 p-4 rounded-2xl border border-stroke-subtle bg-surface-container-lowest hover:bg-surface-container hover:border-primary/40 transition-all shadow-sm group">
          <span className="material-symbols-outlined text-primary text-[28px]">request_quote</span>
          <div>
            <div className="font-bold text-on-surface text-sm">View Match Inquiries</div>
            <div className="text-xs text-on-surface-variant">Manage incoming consumer requests</div>
          </div>
          <span className="ml-auto material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
        <Link to="/dashboard/admin/accounts" className="flex items-center gap-3 p-4 rounded-2xl border border-stroke-subtle bg-surface-container-lowest hover:bg-surface-container hover:border-primary/40 transition-all shadow-sm group">
          <span className="material-symbols-outlined text-emerald-600 text-[28px]">manage_accounts</span>
          <div>
            <div className="font-bold text-on-surface text-sm">Manage Accounts</div>
            <div className="text-xs text-on-surface-variant">Staff & Agent roster</div>
          </div>
          <span className="ml-auto material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
        <Link to="/dashboard/admin/analytics" className="flex items-center gap-3 p-4 rounded-2xl border border-stroke-subtle bg-surface-container-lowest hover:bg-surface-container hover:border-primary/40 transition-all shadow-sm group">
          <span className="material-symbols-outlined text-rose-500 text-[28px]">bar_chart</span>
          <div>
            <div className="font-bold text-on-surface text-sm">Analytics</div>
            <div className="text-xs text-on-surface-variant">Visits, conversions, matches</div>
          </div>
          <span className="ml-auto material-symbols-outlined text-outline text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-subtle">
          <h3 className="text-title-md font-title-md font-bold text-on-surface">Recent Match Inquiries</h3>
          <Link to="/dashboard/admin/quotes" className="text-primary text-body-sm font-body-sm font-bold hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm font-body-sm">
            <thead className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Insurance Type</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-subtle">
              {RECENT_LEADS.map((lead) => (
                <tr key={lead.name} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{lead.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{lead.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant italic text-xs">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 text-center text-body-sm font-body-sm text-outline italic border-t border-stroke-subtle">
            Real data will appear here after connecting <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs font-mono">GET /api/admin/quotes</code>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
