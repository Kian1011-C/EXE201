import React, { useState, useMemo, useEffect } from 'react';
import { getTickets, createTicket } from '../../../services/api';
import { SAMPLE_TICKETS } from '../../../data/mockCrmData';

export default function StaffTicketsList({ onSelectTicket, onSelectContact, onSelectDeal }) {
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState(null); // null | 'overdue'
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fallbackList = useMemo(() => {
    return (SAMPLE_TICKETS || []).map((t, idx) => ({
      id: t.id,
      no: idx + 1,
      title: t.title,
      pipeline: t.pipeline || 'Payment',
      status: t.status || 'Make payment',
      priority: (t.priority || 'NONE').toUpperCase(),
      contactName: t.contactName || '',
      contactId: t.contactId,
      dealTitle: t.dealShortTitle || t.dealTitle || '',
      dealId: t.dealId,
      dueDate: t.dueDate || '',
      owner: {
        name: t.ticketOwner || 'Khanh Nguyen',
        avatar: t.ticketOwnerAvatar || 'KN',
      },
      serviceAgent: {
        name: t.serviceAgent || 'Anya Nguyen',
        avatar: t.serviceAgentAvatar || 'AN',
      },
      created: '09/15/2026',
      description: t.description || '',
      ticketResult: t.ticketResult || '',
      isOverdue: false,
      rawTicket: t,
    }));
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await getTickets();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((t, idx) => ({
          id: t.id,
          no: idx + 1,
          title: t.title,
          pipeline: t.pipeline || 'Client Support',
          status: t.status || 'Open',
          priority: (t.priority || 'MEDIUM').toUpperCase(),
          contactName: t.contact?.fullName || t.contactName || '',
          contactId: t.contactId,
          dealTitle: t.deal?.title || t.dealTitle || '',
          dealId: t.dealId,
          dueDate: t.dueDate || '',
          owner: {
            name:
              t.ticketOwner ||
              t.owner?.name ||
              t.owner ||
              t.deal?.dealOwnerName ||
              'Khanh Nguyen',
            avatar: (
              t.ticketOwner ||
              t.owner?.name ||
              t.owner ||
              'KN'
            ).slice(0, 2).toUpperCase(),
          },
          serviceAgent: {
            name: t.serviceAgent || t.assignedTo || 'Sean Ngo',
            avatar: (t.serviceAgent || t.assignedTo || 'SN').slice(0, 2).toUpperCase(),
          },
          created: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
          description: t.description || '',
          ticketResult: t.ticketResult || '',
          isOverdue: t.dueDate && new Date(t.dueDate) < new Date(),
          rawTicket: t,
        }));
        setTicketsList(formatted);
      } else {
        setTicketsList(fallbackList);
      }
    } catch (err) {
      console.warn('[StaffTicketsList] API error, using sample data:', err);
      setTicketsList(fallbackList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return ticketsList.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.contactName.toLowerCase().includes(q) ||
        t.dealTitle.toLowerCase().includes(q);

      const matchesOwner =
        ownerFilter === 'all' ||
        t.owner.name.toLowerCase().includes(ownerFilter.toLowerCase());

      const matchesPipeline =
        pipelineFilter === 'all' ||
        t.pipeline.toLowerCase().includes(pipelineFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        t.status.toLowerCase().includes(statusFilter.toLowerCase());

      const matchesPriority =
        priorityFilter === 'all' ||
        t.priority.toLowerCase().includes(priorityFilter.toLowerCase());

      const matchesQuick = quickFilter === 'overdue' ? t.isOverdue : true;

      return (
        matchesSearch &&
        matchesOwner &&
        matchesPipeline &&
        matchesStatus &&
        matchesPriority &&
        matchesQuick
      );
    });
  }, [
    ticketsList,
    searchQuery,
    ownerFilter,
    pipelineFilter,
    statusFilter,
    priorityFilter,
    quickFilter,
  ]);

  // Unique owners for filter
  const ownerOptions = useMemo(() => {
    const set = new Set(ticketsList.map((t) => t.owner.name));
    return Array.from(set);
  }, [ticketsList]);

  // Stats
  const stats = useMemo(() => {
    let open = 0,
      high = 0,
      overdue = 0,
      resolved = 0;
    ticketsList.forEach((t) => {
      if (t.status === 'Open') open++;
      if (t.priority === 'HIGH') high++;
      if (t.isOverdue) overdue++;
      if (t.status === 'Resolved' || t.status === 'Closed') resolved++;
    });
    return { open, high, overdue, resolved };
  }, [ticketsList]);

  // Form state for Create Ticket
  const [title, setTitle] = useState('');
  const [pipeline, setPipeline] = useState('Client Support');
  const [contact, setContact] = useState('');
  const [deal, setDeal] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreateSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        title: title || 'New Service Ticket',
        pipeline,
        status: 'Open',
        priority,
        dueDate: dueDate || '2026-12-31',
        description,
        serviceAgent: 'Sean Ngo',
        ticketOwner: 'Khanh Nguyen',
      };
      await createTicket(payload);
      await loadTickets();
      setShowCreateModal(false);
      setTitle('');
      setPipeline('Client Support');
      setContact('');
      setDeal('');
      setPriority('MEDIUM');
      setDueDate('');
      setDescription('');
    } catch (err) {
      console.warn('Could not create ticket via API:', err);
      setShowCreateModal(false);
    }
  }

  const getPipelineColor = (pipe) => {
    const p = (pipe || '').toUpperCase();
    if (p.includes('PAYMENT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (p.includes('DOCUMENT') || p.includes('UPLOAD'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    if (p.includes('DOCTOR')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (p.includes('AGENT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p.includes('ACA')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const getStatusColor = (stat) => {
    switch (stat) {
      case 'Open':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Waiting':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Low
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] p-6 space-y-6 max-w-[1700px] mx-auto w-full animate-fade-in-up">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">support_agent</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ticket Center</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Service requests, marketplace document uploads &amp; payment tracking ({ticketsList.length} total)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadTickets}
            title="Refresh from Database"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-xs cursor-pointer hover:shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Open',
            value: stats.open,
            color: 'text-blue-600',
            bg: 'bg-blue-50/40',
            icon: 'inbox',
            active: statusFilter === 'Open' && quickFilter === null,
            action: () => {
              setQuickFilter(null);
              setStatusFilter(statusFilter === 'Open' ? 'all' : 'Open');
            },
          },
          {
            label: 'High Priority',
            value: stats.high,
            color: 'text-rose-600',
            bg: 'bg-rose-50/40',
            icon: 'priority_high',
            active: priorityFilter === 'HIGH',
            action: () => {
              setPriorityFilter(priorityFilter === 'HIGH' ? 'all' : 'HIGH');
            },
          },
          {
            label: 'Overdue SLA',
            value: stats.overdue,
            color: 'text-amber-600',
            bg: 'bg-amber-50/40',
            icon: 'alarm',
            active: quickFilter === 'overdue',
            action: () => {
              setQuickFilter(quickFilter === 'overdue' ? null : 'overdue');
            },
          },
          {
            label: 'Resolved / Closed',
            value: stats.resolved,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/40',
            icon: 'check_circle',
            active: statusFilter === 'Resolved',
            action: () => {
              setQuickFilter(null);
              setStatusFilter(statusFilter === 'Resolved' ? 'all' : 'Resolved');
            },
          },
        ].map((stat) => (
          <div
            key={stat.label}
            onClick={stat.action}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer crm-card-hover group relative overflow-hidden ${
              stat.active
                ? 'bg-white ring-2 ring-blue-500 shadow-md border-blue-400'
                : 'bg-white hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition">
                {stat.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${stat.bg} ${stat.color}`}
              >
                <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
              </div>
            </div>
            <div className={`text-2xl font-black mt-2 tracking-tight ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              {stat.active ? 'Filter active • Click to reset' : 'Click to filter'}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search tickets, contacts, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pipeline */}
          <select
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Pipelines</option>
            <option value="Client Support">Client Support</option>
            <option value="Payment">Payment</option>
            <option value="Collect Document">Collect Document</option>
            <option value="Choose Doctor">Choose Doctor</option>
            <option value="Agent Support">Agent Support</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting">Waiting</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Owner */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Owners</option>
            {ownerOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          {(statusFilter !== 'all' ||
            priorityFilter !== 'all' ||
            pipelineFilter !== 'all' ||
            ownerFilter !== 'all' ||
            searchQuery ||
            quickFilter) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setPipelineFilter('all');
                setOwnerFilter('all');
                setSearchQuery('');
                setQuickFilter(null);
              }}
              className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-grow flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-12">#</th>
                <th className="px-4 py-3.5">Ticket Summary</th>
                <th className="px-4 py-3.5">Pipeline</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Linked Deal</th>
                <th className="px-4 py-3.5">Due Date &amp; SLA</th>
                <th className="px-4 py-3.5">Assigned Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading tickets from database...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-slate-400">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-blue-50/40 cursor-pointer group transition-colors"
                    onClick={() => onSelectTicket && onSelectTicket(ticket.rawTicket || ticket)}
                  >
                    <td className="px-4 py-3 font-mono text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition">
                        {ticket.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {ticket.id} • Created {ticket.created}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${getPipelineColor(
                          ticket.pipeline
                        )}`}
                      >
                        {ticket.pipeline}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                    <td className="px-4 py-3">
                      {ticket.contactName ? (
                        <span
                          className="font-medium text-blue-600 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectContact && onSelectContact(ticket.contactName);
                          }}
                        >
                          {ticket.contactName}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.dealTitle ? (
                        <span
                          className="font-medium text-indigo-600 hover:underline cursor-pointer truncate max-w-[150px] inline-block"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDeal && onSelectDeal(ticket.dealTitle);
                          }}
                        >
                          {ticket.dealTitle}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          ticket.isOverdue
                            ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200'
                            : 'text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {ticket.isOverdue ? 'warning' : 'event'}
                        </span>
                        <span>{ticket.dueDate || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          {ticket.serviceAgent.avatar}
                        </div>
                        <span className="text-slate-700 font-medium">
                          {ticket.serviceAgent.name}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Slide-over Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in-up">
          <div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 border-l border-slate-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                <span>Create Service Ticket</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ticket Title <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Verify ACA ID Document upload"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pipeline
                </label>
                <select
                  value={pipeline}
                  onChange={(e) => setPipeline(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800"
                >
                  <option value="Client Support">Client Support</option>
                  <option value="Payment">Payment</option>
                  <option value="Collect Document">Collect Document</option>
                  <option value="Choose Doctor">Choose Doctor</option>
                  <option value="Agent Support">Agent Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  placeholder="Search contact..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Linked Deal
                </label>
                <input
                  type="text"
                  value={deal}
                  onChange={(e) => setDeal(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  placeholder="Search deal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Service request details..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
