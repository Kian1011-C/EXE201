import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import DashboardLayout from './DashboardLayout';

const STATS = [
  { label: 'New Requests Today', value: '—', icon: 'mark_email_unread', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Pending Assignment', value: '—', icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Assigned This Week', value: '—', icon: 'task_alt', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const QUEUE = [
  { name: 'Demo Lead A', type: 'Medicare', phone: '(832) 000-0001', status: 'New' },
  { name: 'Demo Lead B', type: 'ACA / Health', phone: '(832) 000-0002', status: 'New' },
  { name: 'Demo Lead C', type: 'Life Insurance', phone: '(832) 000-0003', status: 'Contacted' },
];

export default function StaffDashboard() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Staff Dashboard 👔</h2>
        <p className="text-body-md font-body-md text-on-surface-variant mt-1">
          Review incoming quote requests and assign them to agents.
        </p>
      </div>

      {/* API Notice */}
      <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <span className="material-symbols-outlined text-[22px] text-amber-500 shrink-0 mt-0.5">info</span>
        <div className="text-body-sm font-body-sm">
          <strong className="font-bold">Placeholder Data</strong> — Connect{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">GET /api/staff/quotes</code>{' '}
          and{' '}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">POST /api/staff/assign</code>{' '}
          to populate this dashboard.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            <div className="text-body-sm font-body-sm text-on-surface-variant">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Request Queue */}
      <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-subtle">
          <h3 className="text-title-md font-title-md font-bold text-on-surface">Quote Request Queue</h3>
          <Link to="/dashboard/staff/quotes" className="text-primary text-body-sm font-body-sm font-bold hover:underline">Full list</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm font-body-sm">
            <thead className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-subtle">
              {QUEUE.map((lead) => (
                <tr key={lead.name} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{lead.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{lead.type}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{lead.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${lead.status === 'New' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      title="Connect POST /api/staff/assign"
                    >
                      Assign →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 text-center text-body-sm font-body-sm text-outline italic border-t border-stroke-subtle">
            Real queue populates from <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs font-mono">GET /api/staff/quotes</code>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
