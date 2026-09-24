import React, { useState, useMemo, useEffect } from 'react';
import { getTasks, createTask, updateTask } from '../../../services/api';

export default function StaffTasksList({ onSelectTask, onSelectContact, onSelectDeal }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickFilter, setQuickFilter] = useState(null); // null | 'overdue' | 'today'

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await getTasks();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((t) => ({
          ...t,
          assignee: {
            name: t.assignedTo || t.assignee?.name || 'Anya Nguyen',
            avatar: (t.assignedTo || t.assignee?.name || 'AN')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
          },
          contact: t.contact
            ? {
                id: t.contact.id,
                name: t.contact.fullName || t.contact.name || 'Client',
              }
            : null,
          deal: t.deal
            ? {
                id: t.deal.id,
                title: t.deal.title || 'Deal',
              }
            : null,
          dueDate: t.dueDate || '',
          dueTime: t.dueTime || '9:00 AM',
          type: t.taskType || t.type || 'General',
          content: t.content || '',
          rawTask: t,
        }));
        setTasks(formatted);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.warn('Failed to load tasks from database:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Quick Status Transition directly from Kanban / Table
  async function handleQuickStatusChange(e, taskId, newStatus) {
    e.stopPropagation();
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.warn('Failed to update task status:', err);
    }
  }

  // Compute stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let total = tasks.length;
    let overdue = 0;
    let dueToday = 0;
    let completed = 0;

    tasks.forEach((t) => {
      if (t.status !== 'Completed' && t.dueDate && t.dueDate < todayStr) overdue++;
      if (t.status !== 'Completed' && t.dueDate && t.dueDate === todayStr) dueToday++;
      if (t.status === 'Completed') completed++;
    });

    return { total, overdue, dueToday, completed };
  }, [tasks]);

  const assigneeOptions = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      const name = t.assignee?.name || t.assignedTo;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [tasks]);

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate && dueDate < today;
  };

  const isDueToday = (dueDate, status) => {
    if (status === 'Completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate && dueDate === today;
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.contact?.name && t.contact.name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === 'All' ||
        t.assignee?.name === assigneeFilter ||
        t.assignedTo === assigneeFilter;

      let matchesQuick = true;
      if (quickFilter === 'overdue') {
        matchesQuick = isOverdue(t.dueDate, t.status);
      } else if (quickFilter === 'today') {
        matchesQuick = isDueToday(t.dueDate, t.status);
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesQuick;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, quickFilter]);

  // Columns for Kanban
  const kanbanColumns = [
    { id: 'Pending', label: 'Pending', color: 'amber', bg: 'bg-amber-500' },
    { id: 'In Progress', label: 'In Progress', color: 'blue', bg: 'bg-blue-500' },
    { id: 'Completed', label: 'Completed', color: 'emerald', bg: 'bg-emerald-500' },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High
          </span>
        );
      case 'Medium':
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">checklist</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Task Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track team workflows, SLAs, and customer follow-up actions ({tasks.length} total)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          {/* View Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadTasks}
            title="Refresh from Database"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-xs cursor-pointer hover:shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Tasks',
            value: stats.total,
            color: 'text-blue-600',
            border: 'border-blue-200',
            bg: 'bg-blue-50/30',
            icon: 'task_alt',
            active: quickFilter === null && statusFilter === 'All',
            action: () => {
              setQuickFilter(null);
              setStatusFilter('All');
            },
          },
          {
            label: 'Overdue SLA',
            value: stats.overdue,
            color: 'text-rose-600',
            border: 'border-rose-200',
            bg: 'bg-rose-50/30',
            icon: 'warning',
            active: quickFilter === 'overdue',
            action: () => setQuickFilter(quickFilter === 'overdue' ? null : 'overdue'),
          },
          {
            label: 'Due Today',
            value: stats.dueToday,
            color: 'text-amber-600',
            border: 'border-amber-200',
            bg: 'bg-amber-50/30',
            icon: 'schedule',
            active: quickFilter === 'today',
            action: () => setQuickFilter(quickFilter === 'today' ? null : 'today'),
          },
          {
            label: 'Completed Tasks',
            value: stats.completed,
            color: 'text-emerald-600',
            border: 'border-emerald-200',
            bg: 'bg-emerald-50/30',
            icon: 'check_circle',
            active: statusFilter === 'Completed',
            action: () => {
              setQuickFilter(null);
              setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed');
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
              {stat.active ? 'Filter applied • Click to reset' : 'Click to filter'}
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
              placeholder="Search by title, ID, contact..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          {/* Status */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assignee */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="All">All Assignees</option>
            {assigneeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {(statusFilter !== 'All' ||
            priorityFilter !== 'All' ||
            assigneeFilter !== 'All' ||
            searchQuery ||
            quickFilter) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setPriorityFilter('All');
                setAssigneeFilter('All');
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

      {/* Main Task Views */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading live tasks from PostgreSQL...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[30px]">checklist_rtl</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try adjusting your search query or status filter to see other records.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
          >
            + Create New Task
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ── Kanban View ─────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/70 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.bg}`} />
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 border border-slate-200 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-grow">
                  {colTasks.map((t) => {
                    const overdue = isOverdue(t.dueDate, t.status);
                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask && onSelectTask(t)}
                        className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200 crm-card-hover group"
                      >
                        {/* Top: Priority & Type */}
                        <div className="flex items-center justify-between mb-2">
                          {getPriorityBadge(t.priority)}
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {t.type}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug line-clamp-2">
                          {t.title}
                        </h4>

                        {/* Linked Entity */}
                        {(t.contact || t.deal) && (
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            {t.contact && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectContact && onSelectContact(t.contact);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition truncate max-w-[140px]"
                              >
                                <span className="material-symbols-outlined text-[13px]">person</span>
                                {t.contact.name}
                              </span>
                            )}
                            {t.deal && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectDeal && onSelectDeal(t.deal);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition truncate max-w-[140px]"
                              >
                                <span className="material-symbols-outlined text-[13px]">handshake</span>
                                {t.deal.title}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer: Due Date, Assignee, Quick Progress Action */}
                        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100">
                          <div
                            className={`flex items-center gap-1 text-[11px] font-semibold ${
                              overdue
                                ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200'
                                : 'text-slate-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {overdue ? 'alarm' : 'calendar_today'}
                            </span>
                            <span>{t.dueDate || 'No date'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Quick Status Action Button */}
                            {col.id === 'Pending' && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(e, t.id, 'In Progress')}
                                title="Start Task"
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition"
                              >
                                → Start
                              </button>
                            )}
                            {col.id === 'In Progress' && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(e, t.id, 'Completed')}
                                title="Mark Completed"
                                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition"
                              >
                                ✓ Done
                              </button>
                            )}
                            {col.id === 'Completed' && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(e, t.id, 'Pending')}
                                title="Reopen Task"
                                className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition"
                              >
                                ↺ Reopen
                              </button>
                            )}

                            {/* Assignee Avatar */}
                            <div
                              title={`Assigned to: ${t.assignee.name}`}
                              className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs"
                            >
                              {t.assignee.avatar}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table View ───────────────────────────────────────────────────── */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5"># ID</th>
                  <th className="px-4 py-3.5">Task Title</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Assignee</th>
                  <th className="px-4 py-3.5">Linked Contact</th>
                  <th className="px-4 py-3.5">Linked Deal</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((t) => {
                  const overdue = isOverdue(t.dueDate, t.status);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTask && onSelectTask(t)}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600">{t.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{t.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                            {t.assignee.avatar}
                          </div>
                          <span className="font-medium text-slate-800">{t.assignee.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {t.contact ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectContact && onSelectContact(t.contact);
                            }}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {t.contact.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.deal ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDeal && onSelectDeal(t.deal);
                            }}
                            className="text-indigo-600 hover:underline font-medium"
                          >
                            {t.deal.title}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          overdue ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {t.dueDate || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(e, t.id, 'In Progress')}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            → Start
                          </button>
                        )}
                        {t.status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(e, t.id, 'Completed')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          >
                            ✓ Complete
                          </button>
                        )}
                        {t.status === 'Completed' && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(e, t.id, 'Pending')}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            ↺ Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSave={(newTask) => {
            setTasks([newTask, ...tasks]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// Sub-component for Create Task Modal
function CreateTaskModal({ onClose, onSave }) {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const defaultDateString = defaultDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    assignee: 'Anya Nguyen',
    dueDate: defaultDateString,
    dueTime: '12:00',
    priority: 'Medium',
    type: 'Follow-up',
    contactName: '',
    dealTitle: '',
    description: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const setPresetDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData((prev) => ({ ...prev, dueDate: d.toISOString().split('T')[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        status: 'Pending',
        priority: formData.priority,
        assignedTo: formData.assignee,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        taskType: formData.type,
        content: formData.description,
      };
      const created = await createTask(payload);
      onSave({
        ...(created || payload),
        id: created?.id || `TSK-${Date.now()}`,
        assignee: {
          name: formData.assignee,
          avatar: formData.assignee.substring(0, 2).toUpperCase(),
        },
        contact: formData.contactName ? { id: `CT-NEW`, name: formData.contactName } : null,
        deal: formData.dealTitle ? { id: `DL-NEW`, title: formData.dealTitle } : null,
      });
    } catch (err) {
      console.warn('Could not save task to database, using local item:', err);
      onSave({
        id: `TSK-${Date.now()}`,
        title: formData.title,
        status: 'Pending',
        priority: formData.priority,
        assignedTo: formData.assignee,
        assignee: {
          name: formData.assignee,
          avatar: formData.assignee.substring(0, 2).toUpperCase(),
        },
        contact: formData.contactName ? { id: `CT-NEW`, name: formData.contactName } : null,
        deal: formData.dealTitle ? { id: `DL-NEW`, title: formData.dealTitle } : null,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        type: formData.type,
        description: formData.description,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">Create New Task</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Follow up on ACA Consent upload"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assignee
                </label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800"
                >
                  <option>Anya Nguyen</option>
                  <option>Sean Ngo</option>
                  <option>Ivy Le</option>
                  <option>Sarah Thai</option>
                  <option>Khanh Nguyen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Task Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800"
                >
                  <option>Follow-up</option>
                  <option>ACA Setup</option>
                  <option>Cancel</option>
                  <option>Payment</option>
                  <option>Choose Doctor</option>
                  <option>Upload Doc</option>
                  <option>General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date &amp; Quick Presets
              </label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPresetDate(1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                >
                  +1 Day (Tomorrow)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(3)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(7)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                >
                  +1 Week
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    name="dueTime"
                    value={formData.dueTime}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'High'].map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: prio }))}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      formData.priority === prio
                        ? prio === 'High'
                          ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200'
                          : prio === 'Medium'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-200'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Actionable instructions for staff or agent..."
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-task-form"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
