import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { getUsers } from '../../../services/api';
import { getActiveAgentAccounts } from '../../../utils/constants';
import toast from 'react-hot-toast';

function getAssigneeName(assignee) {
  if (!assignee) return '';
  if (typeof assignee === 'object') return assignee.name || assignee.fullName || '';
  return String(assignee);
}

function getAssigneeInitials(assignee, fallback = 'JN') {
  const name = getAssigneeName(assignee) || fallback;
  return String(name).slice(0, 2).toUpperCase();
}

export default function StaffTaskDetail({
  task,
  onBack,
  onSelectContact,
  onSelectDeal,
  onSelectTicket,
  onUpdateTask,
}) {
  const { user } = useAuth();
  const currentUserName = user?.name || 'Platform Staff';

  // Available agent accounts for Assignee dropdown
  const [availableAgents, setAvailableAgents] = useState(() => getActiveAgentAccounts());
  useEffect(() => {
    function handleAccountsUpdated() {
      setAvailableAgents(getActiveAgentAccounts());
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    getUsers()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setAvailableAgents(getActiveAgentAccounts());
        }
      })
      .catch(() => {});
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  // Internal task state
  const [currentTask, setCurrentTask] = useState(() => {
    const base = task || {
      id: 'TSK-1001',
      code: 'TSK26001001',
      title: '[Follow-up] E&O Expiration Date for Tracy Nguyen Le (CA)',
      status: 'OPEN',
      completed: false,
      priority: 'High',
      taskType: 'Follow-up',
      assignee: 'Jena Le (jena78@9)',
      dueDate: '16/03/2026',
      dueTime: '12:00 AM',
      sendRemind: 'No remind',
      lastModifiedTime: '10/03/2026, 17:07',
      content:
        'Please follow up with Tracy Nguyen Le (CA) regarding their E&O Expiration Date, which is set to expire soon.\nConfirm renewal has been completed or escalate as needed.',
      attachments: [],
      comments: [],
    };
    return {
      ...base,
      title: base.title || 'Task Details',
      content: base.content || base.description || '',
      assignee:
        typeof base.assignee === 'object'
          ? base.assignee?.name || 'Jena Le (jena78@9)'
          : base.assignee || 'Jena Le (jena78@9)',
      attachments: Array.isArray(base.attachments) ? base.attachments : [],
      comments: Array.isArray(base.comments) ? base.comments : [],
    };
  });

  useEffect(() => {
    if (task) {
      setCurrentTask((prev) => ({
        ...prev,
        ...task,
        title: task.title || prev.title,
        status: task.status || (task.completed ? 'Completed' : 'OPEN'),
        completed: task.completed ?? (task.status === 'Completed' || task.status === 'COMPLETED'),
        taskType: task.taskType || task.type || prev.taskType || '-- Select --',
        assignee:
          typeof task.assignee === 'object'
            ? task.assignee?.name || 'Jena Le (jena78@9)'
            : task.assignee || task.assignedToName || prev.assignee,
        dueDate: task.dueDate || prev.dueDate || '16/03/2026',
        dueTime: task.dueTime || prev.dueTime || '12:00 AM',
        priority: task.priority || prev.priority || 'High',
        sendRemind: task.sendRemind || task.reminders || prev.sendRemind || 'No remind',
        content: task.content || task.description || prev.content || '',
        attachments: Array.isArray(task.attachments) ? task.attachments : prev.attachments || [],
        comments: Array.isArray(task.comments) ? task.comments : prev.comments || [],
        lastModifiedTime: task.lastModifiedTime || prev.lastModifiedTime || '10/03/2026, 17:07',
      }));
      setEditedTitle(task.title || '');
      setEditedContent(task.content || task.description || '');
    }
  }, [task]);

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentTask.title || '');

  // Content editing state
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(currentTask.content || '');

  // Bottom comment input state
  const [newCommentText, setNewCommentText] = useState('');

  // Right sidebar accordion open/collapsed states
  const [openAccordions, setOpenAccordions] = useState({
    companies: true,
    contacts: true,
    agents: true,
    deals: true,
    tickets: true,
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hidden file input ref
  const fileInputRef = useRef(null);

  // ── 1. Resolve Linked Deal ────────────────────────────────────────────────
  const resolvedDeal = useMemo(() => {
    const allDeals = [...[], ...[]];
    const dObj = currentTask.deal || currentTask.rawTask?.deal;
    const dId = String(currentTask.dealId || dObj?.id || dObj?.code || '')?.trim();
    const dTitle = String(
      currentTask.dealTitle || dObj?.dealName || dObj?.title || ''
    )?.trim()?.toLowerCase();
    const taskTitle = String(currentTask.title || '')?.toLowerCase();

    // Direct ID / Code match
    if (dId) {
      const match = allDeals.find(
        (d) =>
          String(d.id) === dId ||
          String(d.code) === dId
      );
      if (match) return match;
    }

    // Direct title matching
    if (dTitle) {
      const match = allDeals.find(
        (d) =>
          d.title &&
          (d.title?.toLowerCase().includes(dTitle) || dTitle.includes(d.title?.toLowerCase()))
      );
      if (match) return match;
    }

    // Match by keywords in task title (e.g. "Minh Tran", "Hai Nguyen", "Chi Trung")
    if (
      taskTitle.includes('minh tran') ||
      (currentTask.contactName && currentTask.contactName?.toLowerCase().includes('minh tran'))
    ) {
      const match = allDeals.find(
        (d) => d.title && d.title?.toLowerCase().includes('minh tran')
      );
      if (match) return match;
    }
    if (
      taskTitle.includes('hai nguyen') ||
      (currentTask.contactName && currentTask.contactName?.toLowerCase().includes('hai nguyen'))
    ) {
      const match = allDeals.find(
        (d) => d.title && d.title?.toLowerCase().includes('hai nguyen')
      );
      if (match) return match;
    }
    if (
      taskTitle.includes('chi trung') ||
      (currentTask.contactName && currentTask.contactName?.toLowerCase().includes('chi trung'))
    ) {
      const match = allDeals.find(
        (d) => d.title && d.title?.toLowerCase().includes('chi trung')
      );
      if (match) return match;
    }

    // If deal object has reasonable fields
    if (dObj && typeof dObj === 'object' && (dObj.title || dObj.dealName || dObj.code)) {
      return {
        ...{},
        ...dObj,
        title: dObj.title || dObj.dealName || 'Deal',
        id: dObj.code || dObj.id || '',
        code: dObj.code || '',
      };
    }

    // Default sample deal for smooth demo experience
    return allDeals[0] || null;
  }, [currentTask]);

  // ── 2. Resolve Linked Contact ─────────────────────────────────────────────
  const resolvedContact = useMemo(() => {
    const allContacts = [...[], ...[]];
    const cObj = currentTask.contact || currentTask.rawTask?.contact;
    const cId = String(currentTask.contactId || cObj?.id || cObj?.code || '')?.trim();
    const cName = String(
      currentTask.contactName || cObj?.fullName || cObj?.name || ''
    )?.trim()?.toLowerCase();
    const taskTitle = String(currentTask.title || '')?.toLowerCase();

    if (cId) {
      const match = allContacts.find(
        (c) =>
          String(c.id) === cId ||
          String(c.code) === cId
      );
      if (match) return match;
    }

    if (cName) {
      const match = allContacts.find(
        (c) =>
          (c.fullName && c.fullName?.toLowerCase().includes(cName)) ||
          (c.name && c.name?.toLowerCase().includes(cName))
      );
      if (match) return match;
    }

    if (taskTitle.includes('tracy nguyen le') || taskTitle.includes('tracy')) {
      const match = allContacts.find(
        (c) =>
          c.fullName &&
          (c.fullName?.toLowerCase().includes('tracy') || c.fullName?.toLowerCase().includes('nguyen'))
      );
      if (match) return match;
    }
    if (taskTitle.includes('minh tran')) {
      const match = allContacts.find(
        (c) => c.fullName && c.fullName?.toLowerCase().includes('minh')
      );
      if (match) return match;
    }

    if (cObj && typeof cObj === 'object') return cObj;
    return allContacts[0] || null;
  }, [currentTask]);

  // ── 3. Resolve Linked Ticket ──────────────────────────────────────────────
  const resolvedTicket = useMemo(() => {
    const allTickets = [...[], ...[]];
    const tObj = currentTask.ticket || currentTask.rawTask?.ticket;
    const tId = String(currentTask.ticketId || tObj?.id || tObj?.code || '')?.trim();

    if (tId) {
      const match = allTickets.find(
        (t) => String(t.id) === tId || String(t.code) === tId
      );
      if (match) return match;
    }
    if (tObj && typeof tObj === 'object') return tObj;
    return null;
  }, [currentTask]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleToggleCompleted = () => {
    const nextCompleted = !currentTask.completed;
    const nextStatus = nextCompleted ? 'Completed' : 'OPEN';
    const updated = {
      ...currentTask,
      completed: nextCompleted,
      status: nextStatus,
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    if (onUpdateTask) onUpdateTask(updated);
    toast.success(
      nextCompleted ? 'Đã đánh dấu hoàn thành công việc!' : 'Đã mở lại công việc (OPEN)'
    );
  };

  const handleSaveTitle = () => {
    if (!editedTitle?.trim()) return;
    const updated = {
      ...currentTask,
      title: editedTitle?.trim(),
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    setIsEditingTitle(false);
    if (onUpdateTask) onUpdateTask(updated);
    toast.success('Đã cập nhật tiêu đề!');
  };

  const handleSaveContent = () => {
    const updated = {
      ...currentTask,
      content: editedContent,
      description: editedContent,
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    setIsEditingContent(false);
    if (onUpdateTask) onUpdateTask(updated);
    toast.success('Đã lưu nội dung công việc!');
  };

  const handleFieldChange = (field, value) => {
    const updated = {
      ...currentTask,
      [field]: value,
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    if (onUpdateTask) onUpdateTask(updated);
    toast.success(`Đã cập nhật ${field}`);
  };

  const handleSendComment = () => {
    if (!newCommentText?.trim()) return;
    const newComment = {
      id: `cm-${Date.now()}`,
      author: currentUserName,
      time: new Date().toLocaleString(),
      text: newCommentText?.trim(),
    };
    const updatedComments = [newComment, ...(currentTask.comments || [])];
    const updated = {
      ...currentTask,
      comments: updatedComments,
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    setNewCommentText('');
    if (onUpdateTask) onUpdateTask(updated);
    toast.success('Đã thêm bình luận mới!');
  };

  const handleAddAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newAtt = {
      id: `att-${Date.now()}`,
      name: file?.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
      time: new Date().toLocaleDateString(),
    };
    const updated = {
      ...currentTask,
      attachments: [...(currentTask.attachments || []), newAtt],
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    if (onUpdateTask) onUpdateTask(updated);
    toast.success(`Đã đính kèm tệp: ${file?.name}`);
  };

  const handleDeleteAttachment = (attId) => {
    const updated = {
      ...currentTask,
      attachments: (currentTask.attachments || [])?.filter((a) => a.id !== attId),
      lastModifiedTime: new Date().toLocaleString(),
    };
    setCurrentTask(updated);
    if (onUpdateTask) onUpdateTask(updated);
    toast.success('Đã xóa tệp đính kèm');
  };

  // Click on Deal to open Deal detail (BUG FIX)
  const handleDealClick = () => {
    if (resolvedDeal && onSelectDeal) {
      onSelectDeal(resolvedDeal);
    } else if (onSelectDeal) {
      const fallback = [...[], ...[]][0] || {};
      onSelectDeal(fallback);
    }
  };

  // Click on Contact
  const handleContactClick = () => {
    if (resolvedContact && onSelectContact) {
      onSelectContact(resolvedContact);
    }
  };

  // Click on Ticket
  const handleTicketClick = () => {
    if (resolvedTicket && onSelectTicket) {
      onSelectTicket(resolvedTicket);
    }
  };

  return (
    <div
      className={`bg-[#f8fafc] min-h-screen flex flex-col font-sans text-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
      }`}
    >
      {/* ── 1. Top Subheader Bar (Matching Screenshot Image 2) ────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs">
        {/* Back button + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-semibold text-sm transition cursor-pointer"
            title="Quay lại danh sách Task"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-500">
              arrow_back
            </span>
            <span className="text-base font-bold text-slate-800">Task Detail</span>
          </button>
        </div>

        {/* Right Action Icons: Refresh & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Đã làm mới dữ liệu task!')}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer font-medium"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">
              refresh
            </span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* ── 2. Main Work Area (Left Pane + Right Accordion Sidebar) ─────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Work Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white border-r border-slate-200 p-6 md:p-8 space-y-6">
          {/* ── Task Header: Checkbox + Editable Title ──────────────────────── */}
          <div className="flex items-start gap-3.5 pb-2">
            {/* Complete Round Button */}
            <button
              type="button"
              onClick={handleToggleCompleted}
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition cursor-pointer shrink-0 ${
                currentTask.completed
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300 hover:border-blue-500 bg-white text-transparent'
              }`}
              title={currentTask.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <span className="material-symbols-outlined text-[16px] font-bold">
                check
              </span>
            </button>

            {/* Editable Title */}
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-lg font-bold text-slate-900 border border-blue-500 rounded-lg px-3 py-1.5 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(currentTask.title || '');
                    }}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1
                    className={`text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug cursor-pointer ${
                      currentTask.completed ? 'line-through text-slate-400' : ''
                    }`}
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {currentTask.title}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-1 transition cursor-pointer"
                    title="Chỉnh sửa tiêu đề"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── 2-Column Metadata Grid (Matching Image 2 Layout) ────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 py-3 border-y border-slate-100 text-xs">
            {/* Left Column Fields */}
            <div className="space-y-4">
              {/* 1. Due Date */}
              <div className="flex items-center gap-4">
                <div className="w-28 text-slate-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    calendar_today
                  </span>
                  <span>Due Date</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <input
                    type="text"
                    value={`${currentTask.dueDate || ''} ${currentTask.dueTime || ''}`?.trim()}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    className="border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-2 py-0.5 text-xs text-slate-800 font-semibold focus:outline-none"
                  />
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    schedule
                  </span>
                </div>
              </div>

              {/* 2. Task Type */}
              <div className="flex items-center gap-4">
                <div className="w-28 text-slate-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    sell
                  </span>
                  <span>Task type</span>
                </div>
                <select
                  value={currentTask.taskType || '-- Select --'}
                  onChange={(e) => handleFieldChange('taskType', e.target.value)}
                  className="bg-transparent border border-slate-200 hover:border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="-- Select --">-- Select --</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Upload Document">Upload Document</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Call">Call</option>
                  <option value="ACA Setup">ACA Setup</option>
                  <option value="Payment">Payment</option>
                  <option value="Choose Doctor">Choose Doctor</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* 3. Assignee */}
              <div className="flex items-center gap-4">
                <div className="w-28 text-slate-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    person
                  </span>
                  <span>Assignee</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {getAssigneeInitials(currentTask.assignee, 'JN')}
                  </div>
                  <select
                    value={getAssigneeName(currentTask.assignee)}
                    onChange={(e) => handleFieldChange('assignee', e.target.value)}
                    className="bg-transparent border border-slate-200 hover:border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Chọn Agent phụ trách --</option>
                    {availableAgents?.map((ag) => (
                      <option key={ag.id || ag.name} value={ag.name}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Attachments */}
              <div className="flex items-start gap-4">
                <div className="w-28 text-slate-500 flex items-center gap-1.5 font-medium shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    attach_file
                  </span>
                  <span>Attachments</span>
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Add new</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAddAttachment}
                    className="hidden"
                  />
                  {currentTask.attachments && currentTask.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentTask.attachments?.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs text-slate-700"
                        >
                          <span className="material-symbols-outlined text-[14px] text-blue-500">
                            description
                          </span>
                          <span className="truncate max-w-[140px] font-medium">
                            {att.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({att.size || '120 KB'})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                            title="Xóa tệp"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column Fields */}
            <div className="space-y-4">
              {/* 1. Remind Date */}
              <div className="flex items-center gap-4">
                <div className="w-32 text-slate-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    notifications
                  </span>
                  <span>Remind date</span>
                </div>
                <select
                  value={currentTask.sendRemind || 'No remind'}
                  onChange={(e) => handleFieldChange('sendRemind', e.target.value)}
                  className="bg-transparent border border-slate-200 hover:border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="No remind">No remind</option>
                  <option value="1 hour before">1 hour before</option>
                  <option value="1 day before">1 day before</option>
                  <option value="2 days before">2 days before</option>
                  <option value="1 week before">1 week before</option>
                </select>
              </div>

              {/* 2. Priority */}
              <div className="flex items-center gap-4">
                <div className="w-32 text-slate-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    flag
                  </span>
                  <span>Priority</span>
                </div>
                <select
                  value={currentTask.priority || 'High'}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  className="bg-transparent border border-slate-200 hover:border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-semibold cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* 3. Last Modified Time */}
              <div className="flex items-center gap-4">
                <div className="w-32 text-slate-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">
                    schedule
                  </span>
                  <span>Last modified time</span>
                </div>
                <span className="text-slate-700 font-medium">
                  {currentTask.lastModifiedTime || '10/03/2026, 17:07'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Section: Content (Matching Image 2) ─────────────────────────── */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <span className="material-symbols-outlined text-[18px] text-slate-500">
                  description
                </span>
                <span>Content</span>
              </div>
              {!isEditingContent && (
                <button
                  type="button"
                  onClick={() => setIsEditingContent(true)}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingContent ? (
              <div className="space-y-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-blue-400 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal leading-relaxed"
                  placeholder="Nhập nội dung công việc..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingContent(false);
                      setEditedContent(currentTask.content || '');
                    }}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContent}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentTask.content || 'Chưa có nội dung chi tiết cho công việc này.'}
              </div>
            )}
          </div>

          {/* ── Section: Comments (Matching Image 2 Empty State / List) ──────── */}
          <div className="space-y-3 pt-4 flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                chat
              </span>
              <span>Comments</span>
              <span className="text-xs font-semibold text-slate-400">
                ({currentTask.comments?.length || 0})
              </span>
            </div>

            {/* If no comments, show exact empty state from Image 2 */}
            {(!currentTask.comments || currentTask.comments.length === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center my-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-500 mb-3 shadow-2xs">
                  <span className="material-symbols-outlined text-[32px]">
                    chat
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Comment Here!</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  There is no comment to show right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100">
                {currentTask.comments?.map((cm) => (
                  <div key={cm.id} className="pt-3 first:pt-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {String(typeof cm.author === 'object' ? cm.author?.name || 'U' : cm.author || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {typeof cm.author === 'object' ? cm.author?.name || 'User' : cm.author}
                      </span>
                      <span className="text-[10px] text-slate-400">{cm.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 pl-7">{cm.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom Input Bar (Matching Image 2 "Input...") ────────────────── */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white transition">
              <input
                type="text"
                placeholder="Input..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendComment();
                }}
                className="flex-1 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSendComment}
                className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer p-1"
                title="Gửi bình luận"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Associated Entities Accordions (Image 2) ──────────── */}
        <div className="w-full lg:w-80 bg-[#f8fafc] overflow-y-auto p-4 space-y-3 shrink-0">
          {/* 1. Companies (0) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAccordion('companies')}
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-slate-400">
                  {openAccordions.companies ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Companies (0)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('Thêm Company mới');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Thêm"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Đã tải lại');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Tải lại"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>
            {openAccordions.companies && (
              <div className="p-4 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 mb-2">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-700">No data here!</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  There is no data to show right now.
                </p>
              </div>
            )}
          </div>

          {/* 2. Contacts (0 or 1) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAccordion('contacts')}
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-slate-400">
                  {openAccordions.contacts ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Contacts ({resolvedContact ? 1 : 0})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('Thêm liên hệ liên kết');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Thêm"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Đã tải lại');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Tải lại"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>
            {openAccordions.contacts && (
              <div className="p-3 border-t border-slate-100">
                {resolvedContact ? (
                  <div
                    onClick={handleContactClick}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-600 group-hover:underline truncate">
                        {resolvedContact.fullName || resolvedContact.name || 'Contact'}
                      </span>
                      <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-blue-600">
                        arrow_forward
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Mã: {resolvedContact.code || resolvedContact.id}</div>
                      {resolvedContact.phone && <div>ĐT: {resolvedContact.phone}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 mb-2">
                      <span className="material-symbols-outlined text-[20px]">
                        inventory_2
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-700">No data here!</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      There is no data to show right now.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Agents (0 or 1) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAccordion('agents')}
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-slate-400">
                  {openAccordions.agents ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Agents ({currentTask.assignee ? 1 : 0})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('Gán agent mới');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Thêm"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Đã tải lại');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Tải lại"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>
            {openAccordions.agents && (
              <div className="p-3 border-t border-slate-100">
                {currentTask.assignee ? (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {getAssigneeInitials(currentTask.assignee, 'JL')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {getAssigneeName(currentTask.assignee) || 'Assigned Agent'}
                      </div>
                      <div className="text-[10px] text-slate-400">Assigned Agent</div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 mb-2">
                      <span className="material-symbols-outlined text-[20px]">
                        inventory_2
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-700">No data here!</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      There is no data to show right now.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Deals (0 or 1) ── KEY FIX: CLICKING OPENS DEAL DETAIL ─────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAccordion('deals')}
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-slate-400">
                  {openAccordions.deals ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Deals ({resolvedDeal ? 1 : 0})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('Liên kết Deal mới');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Thêm"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Đã tải lại');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Tải lại"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>
            {openAccordions.deals && (
              <div className="p-3 border-t border-slate-100">
                {resolvedDeal ? (
                  <div
                    onClick={handleDealClick}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-300 transition cursor-pointer group shadow-2xs"
                    title="Nhấn để mở chi tiết Deal này"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-blue-600 group-hover:underline line-clamp-1">
                        {resolvedDeal.title || resolvedDeal.dealName || 'Deal Details'}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0 ml-1">
                        arrow_forward
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Mã: {resolvedDeal.code || resolvedDeal.id}</span>
                        {resolvedDeal.carrier && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                            {resolvedDeal.carrier}
                          </span>
                        )}
                      </div>
                      {resolvedDeal.pipeline && (
                        <div className="text-slate-600 font-medium">
                          Pipeline: {resolvedDeal.pipeline}
                        </div>
                      )}
                      {resolvedDeal.stage && (
                        <div className="text-[10px] text-slate-500 truncate">
                          Giai đoạn: {resolvedDeal.stage}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 mb-2">
                      <span className="material-symbols-outlined text-[20px]">
                        inventory_2
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-700">No data here!</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      There is no data to show right now.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Tickets (0 or 1) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleAccordion('tickets')}
              className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-slate-400">
                  {openAccordions.tickets ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Tickets ({resolvedTicket ? 1 : 0})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('Liên kết Ticket mới');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Thêm"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Đã tải lại');
                  }}
                  className="hover:text-blue-600 p-0.5"
                  title="Tải lại"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>
            {openAccordions.tickets && (
              <div className="p-3 border-t border-slate-100">
                {resolvedTicket ? (
                  <div
                    onClick={handleTicketClick}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-600 group-hover:underline truncate">
                        {resolvedTicket.title || resolvedTicket.subject || 'Ticket'}
                      </span>
                      <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-blue-600">
                        arrow_forward
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mã: {resolvedTicket.code || resolvedTicket.id}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 mb-2">
                      <span className="material-symbols-outlined text-[20px]">
                        inventory_2
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-700">No data here!</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      There is no data to show right now.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
