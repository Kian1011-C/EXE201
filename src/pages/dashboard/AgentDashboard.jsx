import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../../auth/AuthContext';

const STATS = [
  { label: 'My Active Leads', value: '—', icon: 'contacts', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Contacted Today', value: '—', icon: 'call_made', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Closed This Month', value: '—', icon: 'check_circle', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const MY_LEADS = [
  { name: 'Demo Client 1', type: 'Medicare', phone: '(832) 000-0001', status: 'New', priority: 'High' },
  { name: 'Demo Client 2', type: 'ACA / Health', phone: '(832) 000-0002', status: 'Contacted', priority: 'Medium' },
  { name: 'Demo Client 3', type: 'Life Insurance', phone: '(832) 000-0003', status: 'Closed', priority: 'Low' },
];

const STATUS_COLOR = {
  New: 'bg-primary/10 text-primary',
  Contacted: 'bg-amber-100 text-amber-700',
  Closed: 'bg-emerald-100 text-emerald-700',
};

const PRIORITY_COLOR = {
  High: 'text-rose-600',
  Medium: 'text-amber-600',
  Low: 'text-on-surface-variant',
};

export default function AgentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
          Good day, {user?.name?.split(' ')[0]} 🧑‍💼
        </h2>
        <p className="text-body-md font-body-md text-on-surface-variant mt-1">
          Here are the leads assigned to you. Follow up promptly to maximize conversions.
        </p>
      </div>

      {/* API Notice */}
      <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
        <span className="material-symbols-outlined text-[22px] text-emerald-500 shrink-0 mt-0.5">info</span>
        <div className="text-body-sm font-body-sm">
          <strong className="font-bold">Placeholder Data</strong> — Connect{' '}
          <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-xs font-mono">GET /api/agent/leads</code>{' '}
          to show your real assigned leads.
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

      {/* My Leads Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-subtle">
          <h3 className="text-title-md font-title-md font-bold text-on-surface">My Assigned Leads</h3>
          <Link to="/dashboard/agent/leads" className="text-primary text-body-sm font-body-sm font-bold hover:underline">Full list</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm font-body-sm">
            <thead className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Priority</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-subtle">
              {MY_LEADS.map((lead) => (
                <tr key={lead.name} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{lead.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{lead.type}</td>
                  <td className="px-6 py-4">
                    <a href={`tel:${lead.phone.replace(/\D/g, '')}`} className="text-primary hover:underline font-medium">
                      {lead.phone}
                    </a>
                  </td>
                  <td className={`px-6 py-4 font-bold text-xs ${PRIORITY_COLOR[lead.priority]}`}>
                    {lead.priority}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      title="Connect PATCH /api/agent/leads/:id"
                    >
                      Update →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 text-center text-body-sm font-body-sm text-outline italic border-t border-stroke-subtle">
            Real leads from <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs font-mono">GET /api/agent/leads?agentId={user?.id}</code>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
