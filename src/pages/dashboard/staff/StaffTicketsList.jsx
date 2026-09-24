import React, { useState, useMemo, useEffect } from 'react';

const SAMPLE_TICKETS = [
  {
    id: 'TK26001',
    no: 1,
    title: 'Payment Feb 2026 - Nguyen Van A',
    pipeline: 'Payment',
    status: 'Open',
    priority: 'HIGH',
    contactName: 'Nguyen Van A',
    dealTitle: 'Obamacare 2026 - Nguyen Van A',
    dueDate: '2026-02-15',
    owner: { name: 'Khanh Nguyen', avatar: 'K', bg: 'bg-blue-100 text-blue-700' },
    serviceAgent: { name: 'Anya Nguyen', avatar: 'A', bg: 'bg-pink-100 text-pink-700' },
    created: '02/10/2026',
    description: 'Client needs to process payment for Feb 2026.',
    ticketResult: '',
    isOverdue: true
  },
  {
    id: 'TK26002',
    no: 2,
    title: 'Collect Document for upload (03/15/2026)',
    pipeline: 'Collect Document',
    status: 'In Progress',
    priority: 'MEDIUM',
    contactName: 'Tran Thi B',
    dealTitle: 'Obamacare 2026 - Tran Thi B',
    dueDate: '2026-03-15',
    owner: { name: 'Nancy Pham', avatar: 'N', bg: 'bg-emerald-100 text-emerald-700' },
    serviceAgent: { name: 'Anya Nguyen', avatar: 'A', bg: 'bg-pink-100 text-pink-700' },
    created: '02/12/2026',
    description: 'Need income proof documents.',
    ticketResult: '',
    isOverdue: false
  },
  {
    id: 'TK26003',
    no: 3,
    title: 'Choose Dr for Le Van C',
    pipeline: 'Choose Doctor',
    status: 'Waiting',
    priority: 'LOW',
    contactName: 'Le Van C',
    dealTitle: 'Medicare 2026 - Le Van C',
    dueDate: '2026-04-01',
    owner: { name: 'Jay Ly', avatar: 'J', bg: 'bg-indigo-100 text-indigo-700' },
    serviceAgent: { name: 'Winnie Nguyen', avatar: 'W', bg: 'bg-purple-100 text-purple-700' },
    created: '02/15/2026',
    description: 'Client needs a new PCP closer to home.',
    ticketResult: '',
    isOverdue: false
  },
  {
    id: 'TK26004',
    no: 4,
    title: 'Claim bill Vision (DVH) - Pham Thi D',
    pipeline: 'Client Support',
    status: 'Resolved',
    priority: 'LOW',
    contactName: 'Pham Thi D',
    dealTitle: 'Dental Vision 2026 - Pham Thi D',
    dueDate: '2026-01-20',
    owner: { name: 'Khanh Nguyen', avatar: 'K', bg: 'bg-blue-100 text-blue-700' },
    serviceAgent: { name: 'Lisa Le', avatar: 'L', bg: 'bg-amber-100 text-amber-700' },
    created: '01/10/2026',
    description: 'Process vision claim bill.',
    ticketResult: 'Processed and approved.',
    isOverdue: false,
    resolvedDate: '2026-01-18'
  },
  {
    id: 'TK26005',
    no: 5,
    title: 'Agent Support Request - Quote generation',
    pipeline: 'Agent Support',
    status: 'Open',
    priority: 'HIGH',
    contactName: 'Hoang Van E',
    dealTitle: 'Life Ins 2026 - Hoang Van E',
    dueDate: '2026-02-18',
    owner: { name: 'Trono Truong', avatar: 'T', bg: 'bg-orange-100 text-orange-700' },
    serviceAgent: { name: 'Miranda Pham', avatar: 'M', bg: 'bg-teal-100 text-teal-700' },
    created: '02/16/2026',
    description: 'Please generate a custom quote.',
    ticketResult: '',
    isOverdue: true
  }
];

export default function StaffTicketsList({ onSelectTicket, onSelectContact, onSelectDeal }) {
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTicketsList(SAMPLE_TICKETS);
      setLoading(false);
    }, 500);
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return ticketsList.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.contactName.toLowerCase().includes(q);

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

      return matchesSearch && matchesOwner && matchesPipeline && matchesStatus && matchesPriority;
    });
  }, [ticketsList, searchQuery, ownerFilter, pipelineFilter, statusFilter, priorityFilter]);

  // Unique owners for filter
  const ownerOptions = useMemo(() => {
    const set = new Set(ticketsList.map((t) => t.owner.name));
    return Array.from(set);
  }, [ticketsList]);

  // Stats
  const stats = useMemo(() => {
    let open = 0, high = 0, overdue = 0, resolved = 0;
    ticketsList.forEach(t => {
      if (t.status === 'Open') open++;
      if (t.priority === 'HIGH') high++;
      if (t.isOverdue) overdue++;
      if (t.status === 'Resolved') resolved++;
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

  function handleCreateSubmit(e) {
    e.preventDefault();
    const newRecord = {
      id: `TK2600${ticketsList.length + 1}`,
      no: ticketsList.length + 1,
      title: title || 'New Ticket',
      pipeline,
      status: 'Open',
      priority,
      contactName: contact || 'Unknown',
      dealTitle: deal || '-',
      dueDate: dueDate || '2026-12-31',
      owner: { name: 'Khanh Nguyen', avatar: 'K', bg: 'bg-blue-100 text-blue-700' },
      serviceAgent: { name: 'Anya Nguyen', avatar: 'A', bg: 'bg-pink-100 text-pink-700' },
      created: new Date().toLocaleDateString('en-US'),
      description,
      ticketResult: '',
      isOverdue: false
    };
    setTicketsList([newRecord, ...ticketsList]);
    setShowCreateModal(false);
    // Reset form
    setTitle(''); setPipeline('Client Support'); setContact(''); setDeal(''); setPriority('MEDIUM'); setDueDate(''); setDescription('');
  }

  const getPipelineColor = (pipe) => {
    switch (pipe) {
      case 'Client Support': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Payment': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Collect Document': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Choose Doctor': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Agent Support': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (stat) => {
    switch (stat) {
      case 'Open': return 'bg-slate-100 text-slate-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Waiting': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'Closed': return 'bg-slate-200 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'HIGH': return 'bg-rose-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 leading-tight">Tickets</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage post-sale service requests and client support</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 pt-4 pb-2 grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Total Open</p>
            <p className="text-xl font-semibold text-slate-800">{stats.open}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-[20px]">inbox</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">High Priority</p>
            <p className="text-xl font-semibold text-slate-800">{stats.high}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <span className="material-symbols-outlined text-[20px]">priority_high</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Overdue</p>
            <p className="text-xl font-semibold text-slate-800">{stats.overdue}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <span className="material-symbols-outlined text-[20px]">alarm</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Resolved</p>
            <p className="text-xl font-semibold text-slate-800">{stats.resolved}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search tickets, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Pipeline */}
          <div className="relative">
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Pipelines</option>
              <option value="Client Support">Client Support</option>
              <option value="Payment">Payment</option>
              <option value="Collect Document">Collect Document</option>
              <option value="Choose Doctor">Choose Doctor</option>
              <option value="Agent Support">Agent Support</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting">Waiting</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Owner */}
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Owners</option>
              {ownerOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-grow px-5 pb-5 overflow-hidden flex flex-col">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-grow overflow-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pipeline</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">Loading tickets...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">No tickets found.</td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50 cursor-pointer group transition-colors"
                    onClick={() => onSelectTicket(ticket)}
                  >
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-blue-600 group-hover:underline">{ticket.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ticket.id} • {ticket.created}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${getPipelineColor(ticket.pipeline)}`}>
                        {ticket.pipeline}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></span>
                        <span className="text-slate-700">{ticket.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className="text-slate-800 hover:text-blue-600 hover:underline cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onSelectContact(ticket.contactName); }}
                      >
                        {ticket.contactName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={ticket.isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'}>
                        {ticket.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ticket.owner.bg}`}>
                          {ticket.owner.avatar}
                        </div>
                        <span className="text-slate-700">{ticket.owner.name}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
            <div className="bg-blue-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                <span>Create Ticket</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white transition p-1 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-grow overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-medium mb-1">Ticket Title <span className="text-rose-500">*</span></label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Follow up on payment" />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-medium mb-1">Pipeline</label>
                <select value={pipeline} onChange={e => setPipeline(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500">
                  <option value="Client Support">Client Support</option>
                  <option value="Payment">Payment</option>
                  <option value="Collect Document">Collect Document</option>
                  <option value="Choose Doctor">Choose Doctor</option>
                  <option value="Agent Support">Agent Support</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-medium mb-1">Contact Name</label>
                <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="Search contact..." />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-medium mb-1">Deal</label>
                <input type="text" value={deal} onChange={e => setDeal(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="Search deal..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-medium mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-medium mb-1">Description</label>
                <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="Add details..."></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
