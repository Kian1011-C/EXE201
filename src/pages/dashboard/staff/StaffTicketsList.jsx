import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getTickets, createTicket } from '../../../services/api';
import { useAuth } from '../../../auth/AuthContext';
import { filterTicketsForAgent, getAgentIdentity } from '../../../utils/rbac';
import toast from 'react-hot-toast';

// ── Dropdown Data matching user screenshots ──────────────────────────────────
const PIPELINE_OPTIONS = [
  'Client Support Pipeline',
  'Payment',
  'Upload document',
  'Choose Doctor',
  'Commission Issue',
  'Agent Support',
  'ACA account',
  'Not In Carrier',
];

const PRIORITY_OPTIONS = [
  { label: 'None', dotColor: 'bg-slate-400' },
  { label: 'Low', dotColor: 'bg-emerald-500' },
  { label: 'Medium', dotColor: 'bg-orange-500' },
  { label: 'High', dotColor: 'bg-rose-500' },
];

export default function StaffTicketsList({ onSelectTicket, onSelectContact, onSelectDeal, isAgent = false, agentName = '' }) {
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [searchQuery, setSearchQuery] = useState('');

  const [ownerOptionsList, setOwnerOptionsList] = useState(() => [
    { name: 'The Best Rate Insurance', handle: 'thebestrate', avatar: 'TB', bg: 'bg-cyan-700' },
    { name: 'Platform Staff', handle: 'platformstaff', avatar: 'PS', bg: 'bg-slate-600' },
    ...[]?.map((a) => ({
      name: a.name,
      handle: a.handle || a.email?.split('@')[0],
      avatar: a.avatar || a.name.slice(0, 2).toUpperCase(),
      bg: a.bg || 'bg-blue-600',
    })),
  ]);

  useEffect(() => {
    function handleAccountsUpdated() {
      setOwnerOptionsList([
        { name: 'The Best Rate Insurance', handle: 'thebestrate', avatar: 'TB', bg: 'bg-cyan-700' },
        { name: 'Platform Staff', handle: 'platformstaff', avatar: 'PS', bg: 'bg-slate-600' },
        ...[]?.map((a) => ({
          name: a.name,
          handle: a.handle || a.email?.split('@')[0],
          avatar: a.avatar || a.name.slice(0, 2).toUpperCase(),
          bg: a.bg || 'bg-blue-600',
        })),
      ]);
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  // 4 Top Filter states
  const [selectedPipeline, setSelectedPipeline] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedCloseDate, setSelectedCloseDate] = useState('');

  // Dropdown open states
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isCloseDateOpen, setIsCloseDateOpen] = useState(false);

  // Search queries inside dropdowns
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [prioritySearch, setPrioritySearch] = useState('');

  // Calendar state for Close Date picker
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(8); // 0-indexed: 8 = Sep

  // Selection states (for table row checkboxes)
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(25);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false);
  const [showMassEditModal, setShowMassEditModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Create Ticket form states
  const [createTitle, setCreateTitle] = useState('');
  const [createPipeline, setCreatePipeline] = useState('ACA account');
  const [createStage, setCreateStage] = useState('Need Create ACA Account (ACA account)');
  const [createOwner, setCreateOwner] = useState('');
  const [createPriority, setCreatePriority] = useState('High');
  const [createDueDate, setCreateDueDate] = useState('09/25/2026');
  const [createDescription, setCreateDescription] = useState('');

  // Advanced filters state
  const [advStage, setAdvStage] = useState('');
  const [advModifiedBy, setAdvModifiedBy] = useState('');

  const containerRef = useRef(null);
  const pipelineRef = useRef(null);
  const ownerRef = useRef(null);
  const priorityRef = useRef(null);
  const closeDateRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (pipelineRef.current && !pipelineRef.current.contains(e.target)) {
        setIsPipelineOpen(false);
      }
      if (ownerRef.current && !ownerRef.current.contains(e.target)) {
        setIsOwnerOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setIsPriorityOpen(false);
      }
      if (closeDateRef.current && !closeDateRef.current.contains(e.target)) {
        setIsCloseDateOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch / Refresh data
  async function handleRefresh(filters = {}) {
    setIsRefreshing(true);
    try {
      const activePipeline = filters.pipeline !== undefined ? filters.pipeline : selectedPipeline;
      const activeOwner = filters.owner !== undefined ? filters.owner : selectedOwner;
      const activePriority = filters.priority !== undefined ? filters.priority : selectedPriority;
      const activeSearch = filters.search !== undefined ? filters.search : searchQuery;

      const data = await getTickets({
        pipeline: activePipeline,
        owner: activeOwner,
        priority: activePriority,
        search: activeSearch,
      });
      if (Array.isArray(data) && data.length > 0) {
        const dbTickets = data?.map((t, idx) => ({
          id: t.id || `T2604${1092 - idx}`,
          code: t.code || t.id || `T2604${1092 - idx}`,
          title: t?.title || t.ticketName || 'ACA account 2026',
          pipeline: t.pipeline || 'ACA account',
          stage: t.stage || (t.pipeline === 'Payment' ? 'Make payment (Payment)' : 'Need Create ACA Account (ACA account)'),
          status: t.status || t.ticketStatus || 'Open',
          ticketOwner: typeof t.ticketOwner === 'object' ? (t.ticketOwner?.name || '') : (t.ticketOwner || t.owner?.name || t.ticketOwnerName || ''),
          ticketOwnerAvatar: ((typeof t.ticketOwner === 'object' ? t.ticketOwner?.name : t.ticketOwner) || 'KN').slice(0, 2).toUpperCase(),
          ticketOwnerBg: 'bg-emerald-600',
          closeDate: t.closeDate || '',
          dueDate: t.dueDate || '',
          priority: t.priority || 'High',
          lastModifiedBy: typeof t.lastModifiedBy === 'object' ? (t.lastModifiedBy?.name || '') : (t.lastModifiedBy || ''),
          lastModifiedTime: t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '09/23/2026, 22:28',
          contactName: t.contact?.fullName || t.contactName || '',
          dealTitle: t.deal?.title || t.dealTitle || '',
          rawTicket: t,
        }));
        setTicketsList(dbTickets);
      } else {
        setTicketsList([]);
      }
    } catch {
      setTicketsList([]);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRefresh({
        pipeline: selectedPipeline,
        owner: selectedOwner,
        priority: selectedPriority,
        search: searchQuery,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedPipeline, selectedOwner, selectedPriority, searchQuery]);

  const { user } = useAuth();
  const activeIsAgent = isAgent || user?.role === 'agent';
  const effectiveAgent = getAgentIdentity(user || (isAgent ? { role: 'agent', name: agentName } : null));

  // Scoped tickets by RBAC
  const scopedTickets = useMemo(() => {
    if (activeIsAgent) {
      return filterTicketsForAgent(ticketsList, user || { role: 'agent', name: effectiveAgent.name });
    }
    return ticketsList;
  }, [ticketsList, activeIsAgent, user, effectiveAgent.name]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return scopedTickets?.filter((t) => {
      // 1. Search Query
      if (searchQuery?.trim()) {
        const q = searchQuery?.toLowerCase()?.trim();
        const matchesQ =
          t?.title?.toLowerCase().includes(q) ||
          t.code?.toLowerCase().includes(q) ||
          t.id?.toLowerCase().includes(q) ||
          t.contactName?.toLowerCase().includes(q) ||
          t.ticketOwner?.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      // 2. Pipeline Filter
      if (selectedPipeline) {
        const p1 = t.pipeline?.toLowerCase()?.trim();
        const p2 = selectedPipeline?.toLowerCase()?.trim();
        if (!p1.includes(p2) && !p2.includes(p1)) return false;
      }

      // 3. Owner Filter
      if (selectedOwner) {
        const o1 = t.ticketOwner?.toLowerCase()?.trim() || '';
        const o2 = selectedOwner?.toLowerCase()?.trim();
        if (!o1.includes(o2) && !o2.includes(o1)) return false;
      }

      // 4. Priority Filter
      if (selectedPriority) {
        if (t.priority?.toLowerCase() !== selectedPriority?.toLowerCase()) return false;
      }

      // 5. Close Date Filter
      if (selectedCloseDate) {
        if (t.closeDate !== selectedCloseDate && t.dueDate !== selectedCloseDate) return false;
      }

      // 6. Advanced filters
      if (advStage && !t.stage?.toLowerCase().includes(advStage?.toLowerCase())) return false;
      if (advModifiedBy && !t.lastModifiedBy?.toLowerCase().includes(advModifiedBy?.toLowerCase())) return false;

      return true;
    });
  }, [
    ticketsList,
    searchQuery,
    selectedPipeline,
    selectedOwner,
    selectedPriority,
    selectedCloseDate,
    advStage,
    advModifiedBy,
  ]);

  // Master Checkbox Toggle
  const isAllSelected =
    filteredTickets.length > 0 && selectedRowIds.length === filteredTickets.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredTickets?.map((t) => t.id || t.code));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev?.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Clear all filters
  const hasActiveFilters = Boolean(
    selectedPipeline ||
      selectedOwner ||
      selectedPriority ||
      selectedCloseDate ||
      searchQuery ||
      advStage ||
      advModifiedBy
  );

  const clearAllFilters = () => {
    setSelectedPipeline('');
    setSelectedOwner('');
    setSelectedPriority('');
    setSelectedCloseDate('');
    setSearchQuery('');
    setAdvStage('');
    setAdvModifiedBy('');
  };

  // Handle ticket click to view detail
  const handleTicketClick = (ticket) => {
    if (!onSelectTicket) return;

    if (ticket.rawTicket) {
      onSelectTicket(ticket.rawTicket);
      return;
    }

    onSelectTicket({
      id: ticket.id || ticket.code,
      code: ticket.code || ticket.id,
      title: ticket?.title,
      pipeline: ticket.pipeline || 'ACA account',
      status: ticket.status || ticket.stage || 'Open',
      priority: ticket.priority || 'Medium',
      ticketOwner: ticket.ticketOwner,
      ticketOwnerAvatar: ticket.ticketOwnerAvatar,
      serviceAgent: ticket.serviceAgent || ticket.ticketOwner,
      closeDate: ticket.closeDate || '',
      dueDate: ticket.dueDate || '',
      contactName: ticket.contactName || '',
      contactId: ticket.contactId || '',
      dealTitle: ticket.dealTitle || '',
      dealId: ticket.dealId || '',
      carrier: ticket.carrier || '',
    });
  };

  // Create ticket submit
  async function handleCreateTicketSubmit(e) {
    e.preventDefault();
    const newCode = `T2604${1093 + ticketsList.length}`;
    const newT = {
      id: newCode,
      code: newCode,
      title: createTitle || 'New Support Ticket',
      pipeline: createPipeline,
      stage: createStage,
      ticketOwner: createOwner,
      ticketOwnerAvatar: createOwner.slice(0, 2).toUpperCase(),
      ticketOwnerBg: 'bg-blue-600',
      closeDate: '',
      dueDate: createDueDate,
      priority: createPriority,
      lastModifiedBy: createOwner,
      lastModifiedTime: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      description: createDescription,
    };
    null;
    setTicketsList([newT, ...ticketsList]);
    setShowCreateModal(false);
    setCreateTitle('');
    try {
      await createTicket(newT);
    } catch {}
  }

  // Filtered dropdown items
  const filteredPipelineOptions = PIPELINE_OPTIONS?.filter((p) =>
    p?.toLowerCase().includes(pipelineSearch?.toLowerCase())
  );

  const filteredOwnerOptions = ownerOptionsList?.filter(
    (o) =>
      o.name?.toLowerCase().includes(ownerSearch?.toLowerCase()) ||
      o.handle?.toLowerCase().includes(ownerSearch?.toLowerCase())
  );

  const filteredPriorityOptions = PRIORITY_OPTIONS?.filter((pr) =>
    pr.label?.toLowerCase().includes(prioritySearch?.toLowerCase())
  );

  // Calendar Helpers for Close Date Picker
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  // Kanban groups by Stage
  const kanbanStages = useMemo(() => {
    const defaultStages = [
      'Need Create ACA Account (ACA account)',
      'Make payment (Payment)',
      'Check payment (Payment)',
      'Contact client for upload (Upload document)',
      'Need choose Doctor (Choose Doctor)',
      'DONE (ACA account)',
    ];
    const grouped = {};
    defaultStages.forEach((s) => (grouped[s] = []));

    filteredTickets.forEach((t) => {
      const stageKey =
        defaultStages.find((s) => s?.toLowerCase() === t.stage?.toLowerCase()) ||
        'Need Create ACA Account (ACA account)';
      if (!grouped[stageKey]) grouped[stageKey] = [];
      grouped[stageKey].push(t);
    });

    return grouped;
  }, [filteredTickets]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-[#F4F6F9] overflow-hidden text-slate-800 text-xs font-sans selection:bg-blue-600 selection:text-white ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#F4F6F9]' : ''
      }`}
    >
      {/* ── 1. TOP TITLE BAR (Exact match to media_1790248408709.png) ──────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-slate-700">
            confirmation_number
          </span>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">Tickets</h1>
          {activeIsAgent && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              Agent: {effectiveAgent.name} ({scopedTickets.length} tickets)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Create</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 cursor-pointer transition"
          >
            <span
              className={`material-symbols-outlined text-[15px] ${
                isRefreshing ? 'animate-spin text-blue-600' : ''
              }`}
            >
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMassEditModal(true)}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 cursor-pointer transition"
          >
            <span className="material-symbols-outlined text-[15px]">history</span>
            <span>History Mass Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Agent Scope Indicator Banner ─────────────────────────────────── */}
      {activeIsAgent && (
        <div className="bg-blue-50 border-b border-blue-200/90 px-6 py-2 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <span className="material-symbols-outlined text-[18px] text-blue-600">confirmation_number</span>
            <span>Chế độ Agent: Chỉ hiển thị các Tickets được phân công cho <strong>{effectiveAgent.name}</strong></span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            {filteredTickets.length} tickets phụ trách
          </span>
        </div>
      )}

      {/* ── 2. VIEW TABS ROW (All Tickets, + Add View) ────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 pt-2.5 pb-2 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2962] text-white font-semibold text-xs shadow-2xs cursor-pointer">
          <span className="material-symbols-outlined text-[14px]">grid_view</span>
          <span>{activeIsAgent ? 'My Assigned Tickets' : 'All Tickets'}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
            {scopedTickets.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          <span>Add View</span>
        </button>
      </div>

      {/* ── 3. PRE-SET FILTERS ROW (List/Kanban, Pipeline, Owner, Priority, Close Date, Advanced) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-3 shrink-0 flex-wrap relative">
        <div className="flex items-center gap-3 flex-wrap">
          {/* View mode toggle: List vs Kanban */}
          <div className="flex items-center rounded-md border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-blue-50 text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">view_kanban</span>
              <span>Kanban</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Filters: Label */}
          <span className="font-bold text-slate-700 text-xs">Filters:</span>

          {/* 3a. PIPELINE DROPDOWN (Screenshot media_1790248419802.png) */}
          <div className="relative" ref={pipelineRef}>
            <button
              type="button"
              onClick={() => {
                setIsPipelineOpen(!isPipelineOpen);
                setIsOwnerOpen(false);
                setIsPriorityOpen(false);
                setIsCloseDateOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border text-xs min-w-[130px] transition cursor-pointer ${
                selectedPipeline
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="truncate">{selectedPipeline || 'Pipeline...'}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                keyboard_arrow_down
              </span>
            </button>

            {isPipelineOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
                {/* Search inside popup */}
                <div className="px-2.5 pb-2 pt-1 border-b border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={pipelineSearch}
                      onChange={(e) => setPipelineSearch(e.target.value)}
                      autoFocus
                      className="w-full px-2.5 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                  {selectedPipeline && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPipeline('');
                        setIsPipelineOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      ✕ Clear filter
                    </button>
                  )}
                  {filteredPipelineOptions?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedPipeline(opt === selectedPipeline ? '' : opt);
                        setIsPipelineOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                        selectedPipeline === opt
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedPipeline === opt && (
                        <span className="material-symbols-outlined text-[15px] text-blue-600">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                  {filteredPipelineOptions.length === 0 && (
                    <div className="px-3 py-2 text-slate-400 text-center">No options found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3b. TICKET OWNER DROPDOWN (Screenshot media_1790248422958.png) */}
          <div className="relative" ref={ownerRef}>
            <button
              type="button"
              onClick={() => {
                setIsOwnerOpen(!isOwnerOpen);
                setIsPipelineOpen(false);
                setIsPriorityOpen(false);
                setIsCloseDateOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border text-xs min-w-[145px] transition cursor-pointer ${
                selectedOwner
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="truncate">{selectedOwner || 'Ticket Owner...'}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                keyboard_arrow_down
              </span>
            </button>

            {isOwnerOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
                {/* Search inside popup */}
                <div className="px-2.5 pb-2 pt-1 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    autoFocus
                    className="w-full px-2.5 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                  {selectedOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOwner('');
                        setIsOwnerOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      ✕ Clear filter
                    </button>
                  )}
                  {filteredOwnerOptions?.map((o) => (
                    <button
                      key={o.name}
                      type="button"
                      onClick={() => {
                        setSelectedOwner(o.name === selectedOwner ? '' : o.name);
                        setIsOwnerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center gap-2.5 ${
                        selectedOwner === o.name
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full ${o.bg} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {o.avatar}
                      </span>
                      <div className="flex-1 min-w-0 truncate">
                        <span className="font-medium">{o.name}</span>{' '}
                        <span className="text-slate-400 text-[11px]">({o.handle})</span>
                      </div>
                      {selectedOwner === o.name && (
                        <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                  {filteredOwnerOptions.length === 0 && (
                    <div className="px-3 py-2 text-slate-400 text-center">No owners found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3c. PRIORITY DROPDOWN (Screenshot media_1790248425768.png) */}
          <div className="relative" ref={priorityRef}>
            <button
              type="button"
              onClick={() => {
                setIsPriorityOpen(!isPriorityOpen);
                setIsPipelineOpen(false);
                setIsOwnerOpen(false);
                setIsCloseDateOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border text-xs min-w-[115px] transition cursor-pointer ${
                selectedPriority
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {selectedPriority && (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      PRIORITY_OPTIONS.find((p) => p.label === selectedPriority)?.dotColor ||
                      'bg-slate-400'
                    }`}
                  />
                )}
                <span>{selectedPriority || 'Priority...'}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                keyboard_arrow_down
              </span>
            </button>

            {isPriorityOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
                {/* Search inside popup */}
                <div className="px-2.5 pb-2 pt-1 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={prioritySearch}
                    onChange={(e) => setPrioritySearch(e.target.value)}
                    autoFocus
                    className="w-full px-2.5 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="py-1">
                  {selectedPriority && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPriority('');
                        setIsPriorityOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      ✕ Clear filter
                    </button>
                  )}
                  {filteredPriorityOptions?.map((pr) => (
                    <button
                      key={pr.label}
                      type="button"
                      onClick={() => {
                        setSelectedPriority(pr.label === selectedPriority ? '' : pr.label);
                        setIsPriorityOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                        selectedPriority === pr.label
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${pr.dotColor}`} />
                        <span>{pr.label}</span>
                      </div>
                      {selectedPriority === pr.label && (
                        <span className="material-symbols-outlined text-[15px] text-blue-600">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3d. CLOSE DATE PICKER (Screenshot media_1790248429136.png) */}
          <div className="relative" ref={closeDateRef}>
            <button
              type="button"
              onClick={() => {
                setIsCloseDateOpen(!isCloseDateOpen);
                setIsPipelineOpen(false);
                setIsOwnerOpen(false);
                setIsPriorityOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border text-xs min-w-[130px] transition cursor-pointer ${
                selectedCloseDate
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="truncate">{selectedCloseDate || 'Close Date...'}</span>
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                calendar_today
              </span>
            </button>

            {isCloseDateOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-68 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-40 animate-fade-in text-xs">
                {/* Search/input inside calendar popup */}
                <div className="flex items-center justify-between border border-blue-400 rounded px-2.5 py-1 mb-2.5 bg-white">
                  <span className="text-slate-600 text-xs">
                    {selectedCloseDate || 'Close Date...'}
                  </span>
                  <span className="material-symbols-outlined text-[15px] text-blue-600">
                    calendar_today
                  </span>
                </div>

                {/* Calendar navigation */}
                <div className="flex items-center justify-between text-slate-700 font-bold mb-2">
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => setCalYear((y) => y - 1)}
                      className="hover:text-slate-700 p-0.5"
                    >
                      «
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear((y) => y - 1);
                        } else {
                          setCalMonth((m) => m - 1);
                        }
                      }}
                      className="hover:text-slate-700 p-0.5"
                    >
                      ‹
                    </button>
                  </div>

                  <span className="text-slate-900 font-semibold">
                    {monthNames[calMonth]} {calYear}
                  </span>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear((y) => y + 1);
                        } else {
                          setCalMonth((m) => m + 1);
                        }
                      }}
                      className="hover:text-slate-700 p-0.5"
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalYear((y) => y + 1)}
                      className="hover:text-slate-700 p-0.5"
                    >
                      »
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center font-bold text-slate-600 text-[11px] mb-1">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                  {/* Prev month days */}
                  {Array.from({ length: firstDayOfWeek })?.map((_, i) => (
                    <span
                      key={`prev-${i}`}
                      className="text-slate-300 py-1 cursor-default select-none"
                    >
                      {daysInPrevMonth - firstDayOfWeek + i + 1}
                    </span>
                  ))}

                  {/* Current month days */}
                  {Array.from({ length: daysInCalMonth })?.map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${String(calMonth + 1).padStart(2, '0')}/${String(
                      dayNum
                    ).padStart(2, '0')}/${calYear}`;
                    const isToday = dayNum === 24 && calMonth === 8 && calYear === 2026;
                    const isSelected = selectedCloseDate === dateStr;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => {
                          setSelectedCloseDate(isSelected ? '' : dateStr);
                          setIsCloseDateOpen(false);
                        }}
                        className={`py-1 rounded text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : isToday
                            ? 'border border-blue-500 font-bold text-blue-700 hover:bg-blue-50'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>

                {/* Footer today link */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCloseDate('09/24/2026');
                      setIsCloseDateOpen(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
                  >
                    Today
                  </button>
                  {selectedCloseDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCloseDate('');
                        setIsCloseDateOpen(false);
                      }}
                      className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset / Trash icon when filters active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              title="Reset all filters"
              className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">delete_outline</span>
            </button>
          )}
        </div>

        {/* Right side: Advanced Filters */}
        <button
          type="button"
          onClick={() => setShowAdvancedFiltersModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Advanced Filters</span>
        </button>
      </div>

      {/* ── 4. SUB-BAR: SEARCH & REFRESH (Exact match to media_1790248408709.png) */}
      <div className="bg-[#FAFBFD] border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 text-xs">Filters:</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 bg-white border border-slate-200 rounded-md pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            ) : (
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                search
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 cursor-pointer"
        >
          <span
            className={`material-symbols-outlined text-[15px] ${
              isRefreshing ? 'animate-spin text-blue-600' : ''
            }`}
          >
            refresh
          </span>
          <span>Refresh</span>
        </button>
      </div>

      {/* ── 5. MAIN CONTENT AREA (List Table or Kanban Board) ───────────────── */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar">
        {viewMode === 'list' ? (
          /* ── 5A. LIST TABLE (Exact match to media_1790248408709.png) ──────── */
          <div className="min-w-[1300px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F8FAFC] text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10 select-none">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center font-semibold text-slate-500">
                    No.
                  </th>
                  <th className="py-2.5 px-2 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 w-28">Code</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Name</th>
                  <th className="py-2.5 px-3 w-36">Pipeline</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Stage</th>
                  <th className="py-2.5 px-3 w-48">Ticket Owner</th>
                  <th className="py-2.5 px-3 w-28">Close Date</th>
                  <th className="py-2.5 px-3 w-24">Priority</th>
                  <th className="py-2.5 px-3 w-36">Last modified by</th>
                  <th className="py-2.5 px-3 w-40">Last modified time</th>
                  <th className="py-2.5 px-2 w-10 text-center font-bold text-slate-400">#</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="12" className="py-16 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                        inbox
                      </span>
                      <p>No tickets match the selected filters.</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTickets?.map((t, index) => {
                    const rowId = t.id || t.code;
                    const isSelected = selectedRowIds.includes(rowId);

                    return (
                      <tr
                        key={rowId}
                        onClick={() => handleTicketClick(t)}
                        className={`hover:bg-[#F1F5F9]/60 cursor-pointer transition-colors group ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* 1. No. */}
                        <td className="py-2.5 px-3 text-center text-slate-400">{index + 1}</td>

                        {/* 2. Checkbox */}
                        <td
                          className="py-2.5 px-2 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(rowId)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* 3. Code */}
                        <td className="py-2.5 px-3 font-medium text-slate-800 tracking-tight">
                          {t.code || t.id}
                        </td>

                        {/* 4. Name */}
                        <td className="py-2.5 px-3 font-medium text-slate-900 group-hover:text-blue-600 transition">
                          {t?.title}
                        </td>

                        {/* 5. Pipeline */}
                        <td className="py-2.5 px-3 text-slate-700">{t.pipeline}</td>

                        {/* 6. Stage */}
                        <td className="py-2.5 px-3 text-slate-700">{t.stage}</td>

                        {/* 7. Ticket Owner */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full ${
                                t.ticketOwnerBg || 'bg-slate-600'
                              } text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {t.ticketOwnerAvatar || t.ticketOwner?.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="truncate">{t.ticketOwner}</span>
                          </div>
                        </td>

                        {/* 8. Close Date */}
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {t.closeDate || ''}
                        </td>

                        {/* 9. Priority */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.priority?.toLowerCase() === 'high'
                                  ? 'bg-rose-500'
                                  : t.priority?.toLowerCase() === 'medium'
                                  ? 'bg-orange-500'
                                  : t.priority?.toLowerCase() === 'low'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span>{t.priority || 'None'}</span>
                          </div>
                        </td>

                        {/* 10. Last modified by */}
                        <td className="py-2.5 px-3">
                          {t.lastModifiedBy ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-5 h-5 rounded-full ${
                                  t.lastModifiedByBg || 'bg-slate-600'
                                } text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                              >
                                {t.lastModifiedByAvatar ||
                                  (typeof t.lastModifiedBy === 'string'
                                    ? t.lastModifiedBy.slice(0, 2).toUpperCase()
                                    : 'RN')}
                              </span>
                              <span className="truncate">
                                {typeof t.lastModifiedBy === 'string'
                                  ? t.lastModifiedBy
                                  : t.lastModifiedBy?.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300"></span>
                          )}
                        </td>

                        {/* 11. Last modified time */}
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {t.lastModifiedTime}
                        </td>

                        {/* 12. Actions */}
                        <td
                          className="py-2.5 px-2 text-center text-slate-400 group-hover:text-slate-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketClick(t);
                          }}
                        >
                          <span className="material-symbols-outlined text-[16px] hover:text-blue-600">
                            visibility
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── 5B. KANBAN BOARD ────────────────────────────────────────────── */
          <div className="p-4 flex gap-4 overflow-x-auto min-h-full bg-[#F4F6F9] items-start">
            {Object.entries(kanbanStages)?.map(([stageName, cards]) => (
              <div
                key={stageName}
                className="w-80 shrink-0 bg-slate-100 rounded-xl border border-slate-200/80 flex flex-col max-h-[calc(100vh-250px)]"
              >
                {/* Column header */}
                <div className="p-3 bg-white rounded-t-xl border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-bold text-xs text-slate-800 truncate" title={stageName}>
                      {stageName?.split('(')[0]}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                      {cards.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateStage(stageName);
                      setShowCreateModal(true);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
                  {cards.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">No tickets</div>
                  ) : (
                    cards?.map((c) => (
                      <div
                        key={c.id || c.code}
                        onClick={() => handleTicketClick(c)}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-400 font-semibold">{c.code}</span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                c.priority?.toLowerCase() === 'high'
                                  ? 'bg-rose-500'
                                  : c.priority?.toLowerCase() === 'medium'
                                  ? 'bg-orange-500'
                                  : c.priority?.toLowerCase() === 'low'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span className="text-[10px] text-slate-500 font-medium">
                              {c.priority}
                            </span>
                          </div>
                        </div>

                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition leading-snug">
                          {c.title}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {c.pipeline}
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span
                              className={`w-4 h-4 rounded-full ${
                                c.ticketOwnerBg || 'bg-slate-600'
                              } text-white text-[8px] font-bold flex items-center justify-center`}
                            >
                              {c.ticketOwnerAvatar || c.ticketOwner?.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-[10px] font-medium">{c.ticketOwner?.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 6. PAGINATION FOOTER (Exact match to media_1790248408709.png) ───── */}
      <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* |< */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">first_page</span>
          </button>
          {/* < */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <span className="flex items-center gap-1 font-medium">
            <span>Page</span>
            <input
              type="text"
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setCurrentPage(val);
              }}
              className="w-10 text-center py-0.5 border border-slate-200 rounded font-semibold text-slate-800"
            />
            <span>of 3970</span>
          </span>

          {/* > */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1 rounded hover:bg-slate-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
          {/* >| */}
          <button
            type="button"
            onClick={() => setCurrentPage(3970)}
            className="p-1 rounded hover:bg-slate-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">last_page</span>
          </button>

          {/* Refresh Page */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-slate-100 cursor-pointer ml-1 text-slate-500"
          >
            <span className="material-symbols-outlined text-[16px]">cached</span>
          </button>

          {/* Display Rows count */}
          <div className="flex items-center gap-1.5 ml-3">
            <span>Display</span>
            <select
              value={displayCount}
              onChange={(e) => setDisplayCount(Number(e.target.value))}
              className="border border-slate-200 rounded px-2 py-0.5 text-xs bg-white text-slate-800 font-semibold focus:outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="font-medium text-slate-500">Display 1 - 25 of 99,243</div>
      </div>

      {/* ── CREATE TICKET MODAL ────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">
                  add_circle
                </span>
                <h2 className="text-sm font-bold text-slate-900">Create New Ticket</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ticket Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACA account 2026, 1st payment ticket..."
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pipeline</label>
                  <select
                    value={createPipeline}
                    onChange={(e) => setCreatePipeline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {PIPELINE_OPTIONS?.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {PRIORITY_OPTIONS?.map((pr) => (
                      <option key={pr.label} value={pr.label}>
                        {pr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ticket Owner</label>
                  <select
                    value={createOwner}
                    onChange={(e) => setCreateOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {ownerOptionsList?.map((o) => (
                      <option key={o.name} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={createDueDate}
                    onChange={(e) => setCreateDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Ticket details or special instructions..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADVANCED FILTERS MODAL ─────────────────────────────────────────── */}
      {showAdvancedFiltersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
                <h3 className="text-sm font-bold text-slate-900">Advanced Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedFiltersModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Stage filter</label>
                <input
                  type="text"
                  placeholder="e.g. Make payment, DONE..."
                  value={advStage}
                  onChange={(e) => setAdvStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Last modified by
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tara Phu, Roman Nguyen..."
                  value={advModifiedBy}
                  onChange={(e) => setAdvModifiedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAdvStage('');
                    setAdvModifiedBy('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Reset filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFiltersModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY MASS EDIT MODAL ────────────────────────────────────────── */}
      {showMassEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">history</span>
                <h3 className="text-sm font-bold text-slate-900">History Mass Edit</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMassEditModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">Batch Update: 24 Tickets</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Automatic Sync
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">Batch Status: Upload Verification</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  09/20/2026, 14:15 by Jasmine Tang
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowMassEditModal(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
