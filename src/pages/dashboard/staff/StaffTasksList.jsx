import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getTasks, createTask, updateTask } from '../../../services/api';
import { SAMPLE_TASKS } from '../../../data/mockCrmData';

// ── Dropdown Data matching user screenshots ──────────────────────────────────
const PRIORITY_OPTIONS = [
  { label: 'None', dotColor: 'bg-slate-400' },
  { label: 'Low', dotColor: 'bg-emerald-500' },
  { label: 'Medium', dotColor: 'bg-orange-500' },
  { label: 'High', dotColor: 'bg-rose-500' },
  { label: 'Urgent', dotColor: 'bg-red-700' },
];

const ASSIGNEE_OPTIONS = [
  { name: 'oanh dinh', handle: 'Oanhdinhtest99@5', avatar: 'OD', bg: 'bg-amber-600' },
  { name: 'Accounting Dept', handle: 'accounting', avatar: 'AD', bg: 'bg-blue-900' },
  { name: 'acpham90', handle: 'acpham9076@8', avatar: 'A9', bg: 'bg-stone-700' },
  { name: 'Admin TBR', handle: 'admin93@9', avatar: 'AT', bg: 'bg-sky-700' },
  { name: 'Amy Vo', handle: 'amyvo27@0', avatar: 'AV', bg: 'bg-blue-600' },
  { name: 'Andy Vo', handle: 'andy62@3', avatar: 'AV', bg: 'bg-blue-500' },
  { name: 'andynguyen', handle: 'andynguyen75@3', avatar: 'A', bg: 'bg-amber-500' },
  { name: 'Anh Pham', handle: 'anhlnpham14@3', avatar: 'AP', bg: 'bg-amber-800' },
  { name: 'Jessica Nguyen', handle: 'jessicanguyen', avatar: 'JN', bg: 'bg-amber-600' },
  { name: 'Luyen Tina', handle: 'luyentina', avatar: 'LT', bg: 'bg-blue-600' },
  { name: 'Victoria Nguyen', handle: 'victorianguyen', avatar: 'VN', bg: 'bg-rose-600' },
  { name: 'Lisa Le', handle: 'lisale', avatar: 'LL', bg: 'bg-amber-500' },
  { name: 'Thao Phan', handle: 'thaophan', avatar: 'TP', bg: 'bg-teal-600' },
  { name: 'Hieu Violent', handle: 'hieuviolent', avatar: 'HV', bg: 'bg-indigo-600' },
  { name: 'Viktor Pham', handle: 'viktorpham', avatar: 'VP', bg: 'bg-purple-600' },
  { name: 'Jessica Sanchez', handle: 'jessicasanchez', avatar: 'JS', bg: 'bg-rose-500' },
  { name: 'Khanh Nguyen', handle: 'khanhnguyen31@7', avatar: 'KN', bg: 'bg-emerald-600' },
  { name: 'Jay Ly', handle: 'trichauly24@7', avatar: 'JL', bg: 'bg-[#10B981]' },
  { name: 'Ivy Lu', handle: 'ivy', avatar: 'IL', bg: 'bg-[#0EA5E9]' },
];

export default function StaffTasksList({ onSelectTask, onSelectContact, onSelectDeal }) {
  const [tasksList, setTasksList] = useState(SAMPLE_TASKS);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown filter states
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Dropdown open states
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  // Search queries inside dropdowns
  const [prioritySearch, setPrioritySearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');

  // Advanced filters state
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false);
  const [advStatus, setAdvStatus] = useState('All'); // 'All' | 'Completed' | 'Incomplete'
  const [advTaskType, setAdvTaskType] = useState('All');
  const [advModifiedBy, setAdvModifiedBy] = useState('');

  // Create Task Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createAssignee, setCreateAssignee] = useState('Jessica Nguyen');
  const [createDueDate, setCreateDueDate] = useState('09/25/2026');
  const [createTaskType, setCreateTaskType] = useState('Call');
  const [createPriority, setCreatePriority] = useState('High');
  const [createDescription, setCreateDescription] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(25);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const priorityRef = useRef(null);
  const assigneeRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setIsPriorityOpen(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(e.target)) {
        setIsAssigneeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch / Refresh data
  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const data = await getTasks();
      if (Array.isArray(data) && data.length > 0) {
        const dbTasks = data.map((t, idx) => ({
          id: t.id || `TSK-DB-${idx}`,
          no: SAMPLE_TASKS.length + idx + 1,
          title: t.title || 'Support task',
          completed: t.status === 'Completed',
          assignee: {
            name: t.assignedTo || 'Jessica Nguyen',
            handle: 'agent',
            avatar: (t.assignedTo || 'JN').slice(0, 2).toUpperCase(),
            bg: 'bg-blue-600',
          },
          dueDate: t.dueDate || '09/30/2026',
          taskType: t.type || '',
          typeIcon: t.type === 'Call' ? 'call' : t.type === 'To Do' ? 'checklist' : '',
          priority: t.priority || 'None',
          lastModifiedBy: {
            name: t.assignedTo || 'Jessica Nguyen',
            avatar: (t.assignedTo || 'JN').slice(0, 2).toUpperCase(),
            bg: 'bg-blue-600',
          },
          lastModifiedTime: t.updatedAt
            ? new Date(t.updatedAt).toLocaleString()
            : '09/23/2026, 11:21',
          rawTask: t,
        }));
        setTasksList([...SAMPLE_TASKS, ...dbTasks]);
      } else {
        setTasksList(SAMPLE_TASKS);
      }
    } catch {
      setTasksList(SAMPLE_TASKS);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }

  // Toggle completion status for a task
  const toggleTaskCompletion = async (e, taskId) => {
    e.stopPropagation();
    setTasksList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    try {
      const taskObj = tasksList.find((t) => t.id === taskId);
      if (taskObj?.rawTask) {
        await updateTask(taskId, {
          status: !taskObj.completed ? 'Completed' : 'Not Started',
        });
      }
    } catch {}
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasksList.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQ =
          t.title?.toLowerCase().includes(q) ||
          t.assignee?.name?.toLowerCase().includes(q) ||
          t.assignee?.handle?.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      // 2. Priority Filter
      if (selectedPriority) {
        if (t.priority?.toLowerCase() !== selectedPriority.toLowerCase()) return false;
      }

      // 3. Assignee Filter
      if (selectedAssignee) {
        const a1 = t.assignee?.name?.toLowerCase() || '';
        const a2 = selectedAssignee.toLowerCase();
        if (!a1.includes(a2) && !a2.includes(a1)) return false;
      }

      // 4. Advanced Filters
      if (advStatus === 'Completed' && !t.completed) return false;
      if (advStatus === 'Incomplete' && t.completed) return false;
      if (advTaskType !== 'All' && t.taskType !== advTaskType) return false;
      if (
        advModifiedBy &&
        !t.lastModifiedBy?.name?.toLowerCase().includes(advModifiedBy.toLowerCase())
      )
        return false;

      return true;
    });
  }, [
    tasksList,
    searchQuery,
    selectedPriority,
    selectedAssignee,
    advStatus,
    advTaskType,
    advModifiedBy,
  ]);

  const hasActiveFilters = Boolean(
    selectedPriority ||
      selectedAssignee ||
      searchQuery ||
      advStatus !== 'All' ||
      advTaskType !== 'All' ||
      advModifiedBy
  );

  const clearAllFilters = () => {
    setSelectedPriority('');
    setSelectedAssignee('');
    setSearchQuery('');
    setAdvStatus('All');
    setAdvTaskType('All');
    setAdvModifiedBy('');
  };

  // Handle task click
  const handleTaskClick = (task) => {
    if (onSelectTask) {
      onSelectTask({
        id: task.id,
        title: task.title,
        status: task.completed ? 'Completed' : 'Not Started',
        priority: task.priority || 'Medium',
        assignee: task.assignee || { name: 'Jessica Nguyen' },
        dueDate: task.dueDate || '09/25/2026',
        dueTime: '09:00 AM',
        type: task.taskType || 'General',
        rawTask: task,
      });
    }
  };

  // Handle create task submit
  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    const newId = `TSK-${1026 + tasksList.length}`;
    const newT = {
      id: newId,
      no: tasksList.length + 1,
      title: createTitle || 'New CRM Task',
      completed: false,
      assignee: {
        name: createAssignee,
        handle: createAssignee.toLowerCase().replace(/\s+/g, ''),
        avatar: createAssignee.slice(0, 2).toUpperCase(),
        bg: 'bg-blue-600',
      },
      dueDate: createDueDate,
      taskType: createTaskType === 'General' ? '' : createTaskType,
      typeIcon:
        createTaskType === 'Call'
          ? 'call'
          : createTaskType === 'To Do'
          ? 'checklist'
          : '',
      priority: createPriority,
      lastModifiedBy: {
        name: createAssignee,
        avatar: createAssignee.slice(0, 2).toUpperCase(),
        bg: 'bg-blue-600',
      },
      lastModifiedTime: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      description: createDescription,
    };
    setTasksList([newT, ...tasksList]);
    setShowCreateModal(false);
    setCreateTitle('');
    try {
      await createTask(newT);
    } catch {}
  };

  // Filtered dropdown items
  const filteredPriorityOptions = PRIORITY_OPTIONS.filter((pr) =>
    pr.label.toLowerCase().includes(prioritySearch.toLowerCase())
  );

  const filteredAssigneeOptions = ASSIGNEE_OPTIONS.filter(
    (o) =>
      o.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      o.handle.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-[#F4F6F9] overflow-hidden text-slate-800 text-xs font-sans selection:bg-blue-600 selection:text-white ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#F4F6F9]' : ''
      }`}
    >
      {/* ── 1. TOP TITLE BAR (Exact match to media_1790248443335.png) ──────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-slate-700">
            check_box
          </span>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">Tasks</h1>
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

      {/* ── 2. VIEW TABS ROW (All Tasks 14.8k, + Add View) ─────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 pt-2.5 pb-2 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2962] text-white font-semibold text-xs shadow-2xs cursor-pointer">
          <span className="material-symbols-outlined text-[14px]">grid_view</span>
          <span>All Tasks</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
            14.8k
          </span>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          <span>Add View</span>
        </button>
      </div>

      {/* ── 3. PRE-SET FILTERS ROW (Priority, Assignee, Search, Advanced) ────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-3 shrink-0 flex-wrap relative">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-slate-700 text-xs">Filters:</span>

          {/* Search by name... input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 bg-white border border-slate-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            ) : (
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[15px] pointer-events-none">
                search
              </span>
            )}
          </div>

          {/* 3a. PRIORITY DROPDOWN (Screenshot media_1790248451798.png) */}
          <div className="relative" ref={priorityRef}>
            <button
              type="button"
              onClick={() => {
                setIsPriorityOpen(!isPriorityOpen);
                setIsAssigneeOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border text-xs min-w-[120px] transition cursor-pointer ${
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
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
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
                  {filteredPriorityOptions.map((pr) => (
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

          {/* 3b. ASSIGNEE DROPDOWN (Screenshot media_1790248454915.png) */}
          <div className="relative" ref={assigneeRef}>
            <button
              type="button"
              onClick={() => {
                setIsAssigneeOpen(!isAssigneeOpen);
                setIsPriorityOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border text-xs min-w-[130px] transition cursor-pointer ${
                selectedAssignee
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="truncate">{selectedAssignee || 'Assignee...'}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                keyboard_arrow_down
              </span>
            </button>

            {isAssigneeOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-68 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 animate-fade-in">
                {/* Search inside popup */}
                <div className="px-2.5 pb-2 pt-1 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    autoFocus
                    className="w-full px-2.5 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                  {selectedAssignee && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssignee('');
                        setIsAssigneeOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      ✕ Clear filter
                    </button>
                  )}
                  {filteredAssigneeOptions.map((o) => (
                    <button
                      key={o.name}
                      type="button"
                      onClick={() => {
                        setSelectedAssignee(o.name === selectedAssignee ? '' : o.name);
                        setIsAssigneeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                        selectedAssignee === o.name
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <span>{o.name}</span>{' '}
                        <span className="text-slate-400 text-[11px]">({o.handle})</span>
                      </div>
                      {selectedAssignee === o.name && (
                        <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                  {filteredAssigneeOptions.length === 0 && (
                    <div className="px-3 py-2 text-slate-400 text-center">No assignees found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset / Clear icon when filters active */}
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

      {/* ── 4. TABLE SUB-BAR: :: All Tasks & Refresh ──────────────────────── */}
      <div className="bg-[#FAFBFD] border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
          <span className="material-symbols-outlined text-[16px] text-slate-400">
            drag_indicator
          </span>
          <span>All Tasks</span>
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

      {/* ── 5. MAIN TABLE (Exact match to media_1790248443335.png) ─────────── */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar">
        <div className="min-w-[1200px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F8FAFC] text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10 select-none">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center font-semibold text-slate-500">
                  No.
                </th>
                <th className="py-2.5 px-2 w-10 text-center font-semibold text-slate-500">
                  {/* Status checkbox/circle column */}
                </th>
                <th className="py-2.5 px-3 min-w-[320px]">Name</th>
                <th className="py-2.5 px-3 w-48">Assignee</th>
                <th className="py-2.5 px-3 w-28">Due Date</th>
                <th className="py-2.5 px-3 w-28">Task Type</th>
                <th className="py-2.5 px-3 w-24">Priority</th>
                <th className="py-2.5 px-3 w-40">Last modified by</th>
                <th className="py-2.5 px-3 w-36">Last modified time</th>
                <th className="py-2.5 px-2 w-10 text-center font-bold text-slate-400">#</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading tasks...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                      checklist
                    </span>
                    <p>No tasks found matching your filters.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, index) => (
                  <tr
                    key={t.id}
                    onClick={() => handleTaskClick(t)}
                    className="hover:bg-[#F1F5F9]/60 cursor-pointer transition-colors group"
                  >
                    {/* 1. No. */}
                    <td className="py-2.5 px-3 text-center text-slate-400">{index + 1}</td>

                    {/* 2. Checkmark / Completion button */}
                    <td
                      className="py-2.5 px-2 text-center"
                      onClick={(e) => toggleTaskCompletion(e, t.id)}
                    >
                      <button
                        type="button"
                        title={t.completed ? 'Mark incomplete' : 'Mark complete'}
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition cursor-pointer ${
                          t.completed
                            ? 'bg-[#52B4C9] text-white border border-[#52B4C9] shadow-2xs'
                            : 'border border-slate-300 text-slate-300 bg-white hover:border-[#52B4C9] hover:text-[#52B4C9]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[11px] font-bold">
                          check
                        </span>
                      </button>
                    </td>

                    {/* 3. Name */}
                    <td className="py-2.5 px-3 font-medium text-slate-900 group-hover:text-blue-600 transition">
                      <span className={t.completed ? 'line-through text-slate-400' : ''}>
                        {t.title}
                      </span>
                    </td>

                    {/* 4. Assignee */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full ${
                            t.assignee?.bg || 'bg-amber-600'
                          } text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {t.assignee?.avatar || t.assignee?.name?.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="truncate">{t.assignee?.name}</span>
                      </div>
                    </td>

                    {/* 5. Due Date */}
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {t.dueDate || '—'}
                    </td>

                    {/* 6. Task Type */}
                    <td className="py-2.5 px-3">
                      {t.taskType ? (
                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                          {t.typeIcon && (
                            <span className="material-symbols-outlined text-[14px] text-slate-400">
                              {t.typeIcon}
                            </span>
                          )}
                          <span>{t.taskType}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300"></span>
                      )}
                    </td>

                    {/* 7. Priority */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.priority?.toLowerCase() === 'high'
                              ? 'bg-rose-500'
                              : t.priority?.toLowerCase() === 'urgent'
                              ? 'bg-red-700'
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

                    {/* 8. Last modified by */}
                    <td className="py-2.5 px-3">
                      {t.lastModifiedBy ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-5 h-5 rounded-full ${
                              t.lastModifiedBy?.bg || 'bg-slate-600'
                            } text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                          >
                            {t.lastModifiedBy?.avatar ||
                              t.lastModifiedBy?.name?.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate">{t.lastModifiedBy?.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300"></span>
                      )}
                    </td>

                    {/* 9. Last modified time */}
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {t.lastModifiedTime}
                    </td>

                    {/* 10. Action view */}
                    <td
                      className="py-2.5 px-2 text-center text-slate-400 group-hover:text-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(t);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px] hover:text-blue-600">
                        visibility
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. PAGINATION FOOTER (Exact match to media_1790248443335.png) ───── */}
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
            <span>of 592</span>
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
            onClick={() => setCurrentPage(592)}
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

        <div className="font-medium text-slate-500">Display 1 - 25 of 14,800</div>
      </div>

      {/* ── CREATE TASK MODAL ──────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">
                  add_task
                </span>
                <h2 className="text-sm font-bold text-slate-900">Create New Task</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. F/u Life Hoang Huu Nguyen, Call check status..."
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assignee</label>
                  <select
                    value={createAssignee}
                    onChange={(e) => setCreateAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {ASSIGNEE_OPTIONS.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name} ({a.handle})
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Task Type</label>
                  <select
                    value={createTaskType}
                    onChange={(e) => setCreateTaskType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Call">Call</option>
                    <option value="To Do">To Do</option>
                    <option value="Email">Email</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    {PRIORITY_OPTIONS.map((pr) => (
                      <option key={pr.label} value={pr.label}>
                        {pr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task instructions or context..."
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
                  Save Task
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
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={advStatus}
                  onChange={(e) => setAdvStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Type</label>
                <select
                  value={advTaskType}
                  onChange={(e) => setAdvTaskType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Call">Call</option>
                  <option value="To Do">To Do</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Last modified by
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jessica Nguyen, Lisa Le..."
                  value={advModifiedBy}
                  onChange={(e) => setAdvModifiedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAdvStatus('All');
                    setAdvTaskType('All');
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
    </div>
  );
}
