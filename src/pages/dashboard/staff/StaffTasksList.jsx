import React, { useState, useMemo, useEffect } from 'react';
import { getTasks, createTask } from '../../../services/api';

const SAMPLE_TASKS = [];

export default function StaffTasksList({ onSelectTask, onSelectContact, onSelectDeal }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  // Compute stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let total = tasks.length;
    let overdue = 0;
    let dueToday = 0;
    let completedThisWeek = 0;

    tasks.forEach((t) => {
      if (t.status !== 'Completed' && t.dueDate && t.dueDate < todayStr) overdue++;
      if (t.status !== 'Completed' && t.dueDate && t.dueDate === todayStr) dueToday++;
      if (t.status === 'Completed') completedThisWeek++;
    });

    return { total, overdue, dueToday, completedThisWeek };
  }, [tasks]);

  const assigneeOptions = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      const name = t.assignee?.name || t.assignedTo;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === 'All' ||
        t.assignee?.name === assigneeFilter ||
        t.assignedTo === assigneeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // Columns for Kanban
  const kanbanColumns = ['Pending', 'In Progress', 'Completed'];

  // Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Manage and track all staff tasks.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {viewMode === 'table' ? 'Kanban View' : 'Table View'}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            + Create Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-blue-600' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-600' },
          { label: 'Due Today', value: stats.dueToday, color: 'text-yellow-600' },
          { label: 'Completed This Week', value: stats.completedThisWeek, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            <span className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 min-w-[200px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="All">All Assignees</option>
          {assigneeOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading tasks...</div>
      ) : (
        <>
          {viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium"># ID</th>
                    <th className="px-4 py-3 font-medium">Task Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Deal</th>
                    <th className="px-4 py-3 font-medium">Due Date</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No tasks found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectTask && onSelectTask(t)}>
                        <td className="px-4 py-3 font-medium text-blue-600">{t.id}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{t.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 font-medium ${getPriorityColor(t.priority)}`}>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {t.assignee.avatar}
                          </div>
                          {t.assignee.name}
                        </td>
                        <td className="px-4 py-3">
                          {t.contact ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onSelectContact && onSelectContact(t.contact); }}
                              className="text-blue-600 hover:underline"
                            >
                              {t.contact.name}
                            </button>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {t.deal ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onSelectDeal && onSelectDeal(t.deal); }}
                              className="text-blue-600 hover:underline truncate max-w-[150px] block"
                            >
                              {t.deal.title}
                            </button>
                          ) : '-'}
                        </td>
                        <td className={`px-4 py-3 font-medium ${isOverdue(t.dueDate, t.status) ? 'text-red-600' : 'text-gray-600'}`}>
                          {t.dueDate} <span className="text-gray-400 text-xs ml-1">{t.dueTime}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {t.type}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Kanban View */
            <div className="flex gap-4 overflow-x-auto pb-4 items-start">
              {kanbanColumns.map(colStatus => (
                <div key={colStatus} className="flex-none w-80 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">{colStatus}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded-full font-medium">
                      {filteredTasks.filter(t => t.status === colStatus).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks.filter(t => t.status === colStatus).map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => onSelectTask && onSelectTask(t)}
                        className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold ${getPriorityColor(t.priority)} flex items-center`}>
                            <svg className="w-3 h-3 fill-current mr-1" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>
                            {t.priority}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.type}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{t.title}</h4>
                        {t.contact && (
                          <div className="text-xs text-blue-600 mb-2 truncate">
                            👤 {t.contact.name}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                          <div className={`text-xs font-medium ${isOverdue(t.dueDate, t.status) ? 'text-red-600' : 'text-gray-500'}`}>
                            📅 {t.dueDate}
                          </div>
                          <div title={t.assignee.name} className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {t.assignee.avatar}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Task Modal Placeholder */}
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
  // Setup default due date: +3 days
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
    description: ''
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

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
        assignee: { name: formData.assignee, avatar: formData.assignee.substring(0, 2).toUpperCase() },
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
        assignee: { name: formData.assignee, avatar: formData.assignee.substring(0, 2).toUpperCase() },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Create New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Follow up on renewal" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select name="assignee" value={formData.assignee} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Anya Nguyen</option>
                  <option>Sean Ngo</option>
                  <option>Ivy Le</option>
                  <option>Sarah Thai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
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

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" name="dueTime" value={formData.dueTime} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Contact (Optional)</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Search contact..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Deal (Optional)</label>
                <input type="text" name="dealTitle" value={formData.dealTitle} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Search deal..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Task details..."></textarea>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100">Cancel</button>
          <button type="submit" form="create-task-form" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Create Task</button>
        </div>
      </div>
    </div>
  );
}
