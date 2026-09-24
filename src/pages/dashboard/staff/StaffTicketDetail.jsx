import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_TICKET_DATA = {
  id: 'TC2600101',
  title: 'ACA account 2026',
  pipeline: 'ACA account',
  status: 'DONE',
  priority: 'High',
  closeDate: '05/27/2026',
  dueDate: '05/14/2026',
  serviceAgent: 'Sean Ngo (sean75@8)',
  serviceAgentAvatar: 'SN',
  ticketOwner: 'Tri Tran (tritran92@5)',
  ticketOwnerAvatar: 'TT',
  ticketResult: '',
  changeDueDateReason: '',
  carrier: '',
  contactName: 'Minh trang Tran',
  contactPhone: '3462158034',
  contactEmail: 'dungnguyen20041960@gmail.com',
  leadOwner: 'Tri Tran',
  dealTitle: 'Tien Dung Nguyen + Minh Trang Tran- OB 6/26',
  dealPipeline: 'Obamacare 2026',
  dealStage: 'Enrolled - Active',
  dealOwner: 'Tri Tran',
  dealCarrier: 'UHC - RMHP',
};

const AGENT_OPTIONS = [
  { name: 'Sean Ngo (sean75@8)', avatar: 'SN', bg: 'bg-[#B25E3B]' },
  { name: 'Tri Tran (tritran92@5)', avatar: 'TT', bg: 'bg-[#B91C1C]' },
  { name: 'Anya Nguyen (anya42@9)', avatar: 'AN', bg: 'bg-indigo-600' },
  { name: 'Khanh Nguyen (khanhnguyen31@7)', avatar: 'KN', bg: 'bg-emerald-600' },
];

const PIPELINE_OPTIONS = [
  'ACA account',
  'Client Support',
  'Payment',
  'Collect Document',
  'Choose Doctor',
  'Agent Support',
];

const STATUS_OPTIONS = [
  'DONE',
  'Uploaded - Waiting for Verification',
  'Open',
  'In Progress',
  'Waiting on Customer',
  'Resolved',
  'Closed',
];

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function StaffTicketDetail({
  ticket,
  onBack,
  onSelectContact,
  onSelectDeal,
}) {
  const ticketData = {
    ...DEFAULT_TICKET_DATA,
    ...(typeof ticket === 'object' && ticket !== null ? ticket : {}),
  };

  // Ticket basic fields
  const [ticketTitle, setTicketTitle] = useState(ticketData.title || 'ACA account 2026');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(ticketData.title || 'ACA account 2026');

  const [priority, setPriority] = useState(ticketData.priority || 'High');
  const [closeDate, setCloseDate] = useState(ticketData.closeDate || '05/27/2026');
  const [pipeline, setPipeline] = useState(ticketData.pipeline || 'ACA account');
  const [status, setStatus] = useState(ticketData.status || 'DONE');
  const [dueDate, setDueDate] = useState(ticketData.dueDate || '05/14/2026');

  // Properties in "About this ticket"
  const [serviceAgent, setServiceAgent] = useState(
    ticketData.serviceAgent || 'Sean Ngo (sean75@8)'
  );
  const [ticketOwner, setTicketOwner] = useState(
    ticketData.ticketOwner || 'Tri Tran (tritran92@5)'
  );
  const [ticketResult, setTicketResult] = useState(ticketData.ticketResult || '');
  const [changeDueDateReason, setChangeDueDateReason] = useState(
    ticketData.changeDueDateReason || ''
  );
  const [carrier, setCarrier] = useState(ticketData.carrier || '');

  // Dropdowns
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isServiceAgentOpen, setIsServiceAgentOpen] = useState(false);
  const [isTicketOwnerOpen, setIsTicketOwnerOpen] = useState(false);

  // Due Date reason modal
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [tempDueDate, setTempDueDate] = useState(dueDate);
  const [tempReason, setTempReason] = useState('');

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Accordion sections
  const [aboutOpen, setAboutOpen] = useState(true);
  const [companiesOpen, setCompaniesOpen] = useState(true);
  const [contactsOpen, setContactsOpen] = useState(true);
  const [dealsOpen, setDealsOpen] = useState(true);

  // Center column tabs & feed
  const [activeCenterTab, setActiveCenterTab] = useState('activity'); // 'activity' | 'notes' | 'emails' | 'tasks'
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [showNoteComposer, setShowNoteComposer] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Email draft modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Follow up on ACA account 2026');
  const [emailBody, setEmailBody] = useState('');

  // Task creation modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('05/20/2026');

  // Timeline Items
  const [timelineItems, setTimelineItems] = useState([
    {
      id: 'item-1',
      month: 'Aug 2026',
      type: 'deal_activity',
      title: 'Deal Activity',
      timestamp: '08/14/2026, 06:19',
      actor: 'Sean Ngo (sean76@8)',
      dealName: ticketData.dealTitle || 'Tien Dung Nguyen + Minh Trang Tran- OB 6/26',
      targetStage: 'Enrolled - Active',
    },
    {
      id: 'item-2',
      month: 'May 2026',
      type: 'note',
      title: 'Note',
      timestamp: '05/20/2026, 08:13',
      actor: 'Sean Ngo',
      isExpanded: false,
      content:
        'Uploaded ACA verification documents to Marketplace portal. Waiting for Marketplace confirmation.',
    },
  ]);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Close dropdowns on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPriorityOpen(false);
        setIsPipelineOpen(false);
        setIsStatusOpen(false);
        setIsServiceAgentOpen(false);
        setIsTicketOwnerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setTicketTitle(tempTitle.trim());
      showToast('Ticket title updated');
    }
    setIsEditingTitle(false);
  };

  const handleDueDateChange = (newDate) => {
    setTempDueDate(newDate);
    setTempReason(changeDueDateReason);
    setShowDueDateModal(true);
  };

  const confirmDueDateUpdate = () => {
    if (!tempReason.trim()) {
      alert('Please provide a reason for changing the due date.');
      return;
    }
    setDueDate(tempDueDate);
    setChangeDueDateReason(tempReason);
    setShowDueDateModal(false);

    // Auto recalculate priority based on new due date
    const d = new Date(tempDueDate);
    const now = new Date();
    const diffHours = (d - now) / (1000 * 60 * 60);
    if (!isNaN(diffHours)) {
      if (diffHours <= 48) setPriority('High');
      else if (diffHours <= 120) setPriority('Medium');
      else setPriority('Low');
    }

    // Add activity record
    const newActivity = {
      id: `act-${Date.now()}`,
      month: 'Aug 2026',
      type: 'activity',
      title: 'Due Date Changed',
      timestamp: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      actor: serviceAgent,
      content: `Changed due date to ${tempDueDate}. Reason: ${tempReason}`,
    };
    setTimelineItems((prev) => [newActivity, ...prev]);
    showToast('Due date updated successfully');
  };

  const handleStatusSelect = (st) => {
    if (st === 'Closed' && !ticketResult.trim()) {
      showToast('Validation Warning: Ticket Result is required before closing.');
      return;
    }
    setStatus(st);
    setIsStatusOpen(false);
    showToast(`Status updated to ${st}`);
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const item = {
      id: `note-${Date.now()}`,
      month: 'Aug 2026',
      type: 'note',
      title: 'Note',
      timestamp: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      actor: serviceAgent.split(' ')[0] + ' ' + (serviceAgent.split(' ')[1] || ''),
      isExpanded: true,
      content: newNoteContent.trim(),
    };
    setTimelineItems((prev) => [item, ...prev]);
    setNewNoteContent('');
    setShowNoteComposer(false);
    showToast('Note published to timeline');
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    const item = {
      id: `task-${Date.now()}`,
      month: 'Aug 2026',
      type: 'task',
      title: 'Task Created',
      timestamp: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      actor: serviceAgent,
      content: `Task: ${taskTitle} (Due: ${taskDue})`,
    };
    setTimelineItems((prev) => [item, ...prev]);
    setTaskTitle('');
    setShowTaskModal(false);
    showToast('Task added to ticket');
  };

  const handleSendEmail = () => {
    if (!emailBody.trim()) return;
    const item = {
      id: `email-${Date.now()}`,
      month: 'Aug 2026',
      type: 'email',
      title: 'Email Sent',
      timestamp: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      actor: serviceAgent,
      content: `Subject: ${emailSubject}\n${emailBody}`,
    };
    setTimelineItems((prev) => [item, ...prev]);
    setEmailBody('');
    setShowEmailModal(false);
    showToast('Email logged to timeline');
  };

  const toggleItemExpand = (id) => {
    setTimelineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item))
    );
  };

  const handleCollapseAll = () => {
    setTimelineItems((prev) => prev.map((item) => ({ ...item, isExpanded: false })));
  };

  const handleExpandAll = () => {
    setTimelineItems((prev) => prev.map((item) => ({ ...item, isExpanded: true })));
  };

  // Group timeline items by month
  const filteredTimeline = timelineItems.filter((item) => {
    if (filterAuthor !== 'all' && !item.actor.toLowerCase().includes(filterAuthor.toLowerCase())) {
      return false;
    }
    if (activeCenterTab === 'notes') return item.type === 'note';
    if (activeCenterTab === 'emails') return item.type === 'email';
    if (activeCenterTab === 'tasks') return item.type === 'task';
    return true; // 'activity' tab shows all
  });

  const months = Array.from(new Set(filteredTimeline.map((item) => item.month)));

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-hidden text-slate-800 text-xs font-sans selection:bg-blue-600 selection:text-white" ref={dropdownRef}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0F2962] text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP HEADER BAR ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-md text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            <span>Ticket Detail</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>View history</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Ticket refreshed')}
            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN BODY ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT COLUMN: Ticket Properties & About ───────────────────── */}
        <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {/* Header Ticket Profile Card */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              {/* Orange round avatar with A2 */}
              <div className="w-10 h-10 rounded-full bg-[#E05638] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                A2
              </div>
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                      className="w-full text-xs font-bold border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveTitle}
                      className="text-emerald-600 hover:text-emerald-800 p-0.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-slate-800 truncate" title={ticketTitle}>
                      {ticketTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setTempTitle(ticketTitle);
                        setIsEditingTitle(true);
                      }}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                  </div>
                )}

                {/* Sub-properties list matching screenshot */}
                <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                  {/* Priority */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">bookmark</span>
                      <span>Priority:</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        <span>{priority}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_drop_down</span>
                      </button>
                      {isPriorityOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-28">
                          {PRIORITY_OPTIONS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setPriority(p);
                                setIsPriorityOpen(false);
                                showToast(`Priority set to ${p}`);
                              }}
                              className="w-full text-left px-3 py-1 hover:bg-slate-50 text-xs flex items-center gap-1.5"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  p === 'High'
                                    ? 'bg-rose-500'
                                    : p === 'Medium'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                      <span>Close date:</span>
                    </div>
                    <span className="font-semibold text-slate-700">{closeDate}</span>
                  </div>

                  {/* Pipeline */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">account_tree</span>
                      <span>Pipeline:</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPipelineOpen(!isPipelineOpen)}
                        className="flex items-center gap-0.5 font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
                      >
                        <span>{pipeline}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_drop_down</span>
                      </button>
                      {isPipelineOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-36">
                          {PIPELINE_OPTIONS.map((pl) => (
                            <button
                              key={pl}
                              type="button"
                              onClick={() => {
                                setPipeline(pl);
                                setIsPipelineOpen(false);
                                showToast(`Pipeline set to ${pl}`);
                              }}
                              className="w-full text-left px-3 py-1 hover:bg-slate-50 text-xs"
                            >
                              {pl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Status */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">task_alt</span>
                      <span>Ticket Status:</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        className="flex items-center gap-0.5 font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                      >
                        <span>{status}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_drop_down</span>
                      </button>
                      {isStatusOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-48">
                          {STATUS_OPTIONS.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusSelect(st)}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center justify-between"
                            >
                              <span>{st}</span>
                              {st === status && (
                                <span className="material-symbols-outlined text-xs text-blue-600">check</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar: Information + View all properties */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs border-b-2 border-blue-600 pb-0.5">
              <span className="material-symbols-outlined text-[15px]">description</span>
              <span>Information</span>
            </div>
            <button
              type="button"
              onClick={() => showToast('All properties view')}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">visibility</span>
              <span>View all properties</span>
            </button>
          </div>

          {/* Accordion: About this ticket */}
          <div className="p-4 space-y-4">
            <button
              type="button"
              onClick={() => setAboutOpen(!aboutOpen)}
              className="w-full flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-blue-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-600 transition-transform">
                {aboutOpen ? 'expand_more' : 'chevron_right'}
              </span>
              <span>About this ticket</span>
            </button>

            {aboutOpen && (
              <div className="space-y-3 pl-1">
                {/* 1. Priority */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Priority</label>
                  <div className="relative">
                    <div
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-slate-300"
                    >
                      <span>{priority}</span>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setPriority('Medium');
                          }}
                          className="hover:text-slate-600 text-[11px]"
                        >
                          ✕
                        </span>
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Ticket Due Date */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Ticket Due Date</label>
                  <div className="relative">
                    <div
                      onClick={() => handleDueDateChange(dueDate)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-blue-400"
                    >
                      <span>{dueDate}</span>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDueDateChange('');
                          }}
                          className="hover:text-slate-600 text-[11px]"
                        >
                          ✕
                        </span>
                        <span className="material-symbols-outlined text-[15px] text-slate-500">calendar_month</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Service Agent */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Service Agent</label>
                  <div className="relative">
                    <div
                      onClick={() => setIsServiceAgentOpen(!isServiceAgentOpen)}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-slate-300"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#B25E3B] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          SN
                        </span>
                        <span className="truncate">{serviceAgent}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 shrink-0">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setServiceAgent('');
                          }}
                          className="hover:text-slate-600 text-[11px]"
                        >
                          ✕
                        </span>
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                      </div>
                    </div>

                    {isServiceAgentOpen && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-full">
                        {AGENT_OPTIONS.map((ag) => (
                          <button
                            key={ag.name}
                            type="button"
                            onClick={() => {
                              setServiceAgent(ag.name);
                              setIsServiceAgentOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center gap-2"
                          >
                            <span className={`w-5 h-5 rounded-full ${ag.bg} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>
                              {ag.avatar}
                            </span>
                            <span className="truncate">{ag.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Ticket Result */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Ticket Result</label>
                  <input
                    type="text"
                    value={ticketResult}
                    onChange={(e) => setTicketResult(e.target.value)}
                    placeholder="Enter result..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 5. Change Due Date Reason */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Change Due Date Reason</label>
                  <input
                    type="text"
                    value={changeDueDateReason}
                    onChange={(e) => setChangeDueDateReason(e.target.value)}
                    placeholder="Reason for change..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 6. Carrier */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. UHC - RMHP, Ambetter"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 7. Ticket Owner */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Ticket Owner</label>
                  <div className="relative">
                    <div
                      onClick={() => setIsTicketOwnerOpen(!isTicketOwnerOpen)}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-slate-300"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          TT
                        </span>
                        <span className="truncate">{ticketOwner}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 shrink-0">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setTicketOwner('');
                          }}
                          className="hover:text-slate-600 text-[11px]"
                        >
                          ✕
                        </span>
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                      </div>
                    </div>

                    {isTicketOwnerOpen && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-full">
                        {AGENT_OPTIONS.map((ag) => (
                          <button
                            key={ag.name}
                            type="button"
                            onClick={() => {
                              setTicketOwner(ag.name);
                              setIsTicketOwnerOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center gap-2"
                          >
                            <span className={`w-5 h-5 rounded-full ${ag.bg} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>
                              {ag.avatar}
                            </span>
                            <span className="truncate">{ag.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER COLUMN: Activity Feed, Notes, Composer ────────────── */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto custom-scrollbar">
          {/* Top Sub-Nav Tabs: Activity, Notes, Emails, Tasks + Actions */}
          <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveCenterTab('activity')}
                className={`py-3 flex items-center gap-1.5 font-bold text-xs border-b-2 transition cursor-pointer ${
                  activeCenterTab === 'activity'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">feed</span>
                <span>Activity</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCenterTab('notes')}
                className={`py-3 flex items-center gap-1.5 font-bold text-xs border-b-2 transition cursor-pointer ${
                  activeCenterTab === 'notes'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCenterTab('emails')}
                className={`py-3 flex items-center gap-1.5 font-bold text-xs border-b-2 transition cursor-pointer ${
                  activeCenterTab === 'emails'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>Emails</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCenterTab('tasks')}
                className={`py-3 flex items-center gap-1.5 font-bold text-xs border-b-2 transition cursor-pointer ${
                  activeCenterTab === 'tasks'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span>Tasks</span>
              </button>
            </div>

            {/* Action Buttons on Right: + Note, + Email, + Task */}
            <div className="flex items-center gap-4 text-xs font-semibold text-blue-600">
              <button
                type="button"
                onClick={() => setShowNoteComposer(!showNoteComposer)}
                className="flex items-center gap-1 hover:text-blue-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">note_add</span>
                <span>Note</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-1 hover:text-blue-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1 hover:text-blue-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_task</span>
                <span>Task</span>
              </button>
            </div>
          </div>

          {/* Subtoolbar: Filters & Collapse/Expand/Refresh */}
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Filters:</span>
              <div className="relative">
                <select
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:outline-none cursor-pointer pr-6"
                >
                  <option value="all">Search by created by...</option>
                  <option value="Sean Ngo">Sean Ngo</option>
                  <option value="Tri Tran">Tri Tran</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <button
                type="button"
                onClick={handleCollapseAll}
                className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">unfold_less</span>
                <span>Collapse all</span>
              </button>

              <button
                type="button"
                onClick={handleExpandAll}
                className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">unfold_more</span>
                <span>Expand all</span>
              </button>

              <button
                type="button"
                onClick={() => showToast('Activity feed refreshed')}
                className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Note Composer (when toggled) */}
          {showNoteComposer && (
            <div className="p-4 mx-6 mt-4 bg-white border border-blue-200 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  New Note
                </span>
                <button
                  type="button"
                  onClick={() => setShowNoteComposer(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Type your note here..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteComposer(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Grouped Timeline by Month */}
          <div className="p-6 space-y-6">
            {months.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">chat_bubble_outline</span>
                <p>No activity records match your filter.</p>
              </div>
            ) : (
              months.map((month) => {
                const itemsInMonth = filteredTimeline.filter((item) => item.month === month);
                return (
                  <div key={month} className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700">{month}</h3>

                    <div className="space-y-3">
                      {itemsInMonth.map((item) => {
                        if (item.type === 'deal_activity') {
                          return (
                            <div
                              key={item.id}
                              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-900">{item.title}</span>
                                <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-slate-800">{item.actor}</span> moved deal{' '}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectDeal &&
                                    onSelectDeal({
                                      id: 'D26005033',
                                      title: item.dealName,
                                      pipeline: ticketData.dealPipeline,
                                      stage: item.targetStage,
                                      carrier: ticketData.dealCarrier,
                                      contactName: ticketData.contactName,
                                    })
                                  }
                                  className="text-blue-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <span>{item.dealName}</span>
                                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                </button>{' '}
                                to <span className="font-semibold text-slate-800">{item.targetStage}</span>.{' '}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectDeal &&
                                    onSelectDeal({
                                      id: 'D26005033',
                                      title: item.dealName,
                                      pipeline: ticketData.dealPipeline,
                                      stage: item.targetStage,
                                      carrier: ticketData.dealCarrier,
                                      contactName: ticketData.contactName,
                                    })
                                  }
                                  className="text-blue-600 font-medium hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
                                >
                                  <span>View Details</span>
                                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Note or Activity or Email or Task Item
                        return (
                          <div
                            key={item.id}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:shadow-xs transition"
                          >
                            <div
                              onClick={() => toggleItemExpand(item.id)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-slate-400">
                                  {item.isExpanded ? 'expand_more' : 'chevron_right'}
                                </span>
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                                  {item.title}
                                </span>
                                <span className="text-xs text-slate-600">
                                  published by <span className="font-semibold text-slate-800">{item.actor}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                                <span>{item.timestamp}</span>
                              </div>
                            </div>

                            {item.isExpanded && item.content && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 pl-6 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                {item.content}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Companies, Contacts, Deals Linked Cards ────── */}
        <div className="w-[300px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {/* Card 1: Companies (0) */}
          <div className="border-b border-slate-100">
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition">
              <button
                type="button"
                onClick={() => setCompaniesOpen(!companiesOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {companiesOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Companies (0)</span>
              </button>
              <div className="flex items-center gap-2 text-slate-400">
                <button type="button" title="Add company" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button type="button" title="Refresh" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {companiesOpen && (
              <div className="p-4 flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-2xl">inbox</span>
                </div>
                <span className="font-bold text-slate-700 text-xs">No data here!</span>
                <span className="text-[11px] text-slate-400 mt-0.5">There is no data to show right now.</span>
              </div>
            )}
          </div>

          {/* Card 2: Contacts (1) */}
          <div className="border-b border-slate-100">
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition">
              <button
                type="button"
                onClick={() => setContactsOpen(!contactsOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {contactsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Contacts (1)</span>
              </button>
              <div className="flex items-center gap-2 text-slate-400">
                <button type="button" title="Add contact" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button type="button" title="Refresh" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {contactsOpen && (
              <div className="p-3">
                <div
                  onClick={() =>
                    onSelectContact &&
                    onSelectContact({
                      id: 'CT26002600',
                      fullName: ticketData.contactName || 'Minh trang Tran',
                      phone: ticketData.contactPhone || '3462158034',
                      email: ticketData.contactEmail || 'dungnguyen20041960@gmail.com',
                      leadOwner: ticketData.leadOwner || 'Tri Tran',
                    })
                  }
                  className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition font-bold text-[11px]">
                      MT
                    </div>
                    <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs">
                      {ticketData.contactName || 'Minh trang Tran'}
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                      <span className="text-slate-500">{ticketData.contactPhone || '3462158034'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                      <span className="text-slate-500 truncate">{ticketData.contactEmail || 'dungnguyen20041960@gmail...'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                      <span className="text-slate-500">Lead Owner:</span>
                      <span className="font-semibold text-slate-800">{ticketData.leadOwner || 'Tri Tran'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSelectContact &&
                    onSelectContact({
                      id: 'CT26002600',
                      fullName: ticketData.contactName || 'Minh trang Tran',
                      phone: ticketData.contactPhone || '3462158034',
                      email: ticketData.contactEmail || 'dungnguyen20041960@gmail.com',
                      leadOwner: ticketData.leadOwner || 'Tri Tran',
                    })
                  }
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  » View Associated Contact
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Deals (1) */}
          <div className="border-b border-slate-100">
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition">
              <button
                type="button"
                onClick={() => setDealsOpen(!dealsOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {dealsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Deals (1)</span>
              </button>
              <div className="flex items-center gap-2 text-slate-400">
                <button type="button" title="Add deal" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button type="button" title="Refresh" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {dealsOpen && (
              <div className="p-3">
                <div
                  onClick={() =>
                    onSelectDeal &&
                    onSelectDeal({
                      id: 'D26005033',
                      title: ticketData.dealTitle || 'Tien Dung Nguyen + Minh Trang Tran- OB 6/26',
                      pipeline: ticketData.dealPipeline || 'Obamacare 2026',
                      stage: ticketData.dealStage || 'Enrolled - Active',
                      carrier: ticketData.dealCarrier || 'UHC - RMHP',
                      contactName: ticketData.contactName || 'Minh trang Tran',
                    })
                  }
                  className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition">
                      <span className="material-symbols-outlined text-[15px]">trending_up</span>
                    </div>
                    <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs truncate">
                      {ticketData.dealTitle || 'Tien Dung Nguyen + Minh Trung...'}
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">bar_chart</span>
                      <span className="text-slate-500">Pipeline:</span>
                      <span className="font-semibold text-slate-800">{ticketData.dealPipeline || 'Obamacare 2026'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">trending_up</span>
                      <span className="text-slate-500">Stage:</span>
                      <span className="font-semibold text-slate-800">{ticketData.dealStage || 'Enrolled - Active'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                      <span className="text-slate-500">Deal Owner:</span>
                      <span className="font-semibold text-slate-800">{ticketData.dealOwner || 'Tri Tran'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">verified_user</span>
                      <span className="text-slate-500">Carrier:</span>
                      <span className="font-semibold text-slate-800">{ticketData.dealCarrier || 'UHC - RMHP'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSelectDeal &&
                    onSelectDeal({
                      id: 'D26005033',
                      title: ticketData.dealTitle || 'Tien Dung Nguyen + Minh Trang Tran- OB 6/26',
                      pipeline: ticketData.dealPipeline || 'Obamacare 2026',
                      stage: ticketData.dealStage || 'Enrolled - Active',
                      carrier: ticketData.dealCarrier || 'UHC - RMHP',
                      contactName: ticketData.contactName || 'Minh trang Tran',
                    })
                  }
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  » View Associated Deal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: Due Date Reason Requirement ───────────────────────── */}
      {showDueDateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit_calendar</span>
                Change Ticket Due Date
              </h3>
              <button
                type="button"
                onClick={() => setShowDueDateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Due Date</label>
                <input
                  type="date"
                  value={tempDueDate}
                  onChange={(e) => setTempDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for changing Due Date <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={tempReason}
                  onChange={(e) => setTempReason(e.target.value)}
                  placeholder="Required: State why the due date is being extended or changed..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDueDateModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDueDateUpdate}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: View History ──────────────────────────────────────── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">history</span>
                Ticket Change History
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Status changed to DONE</span>
                  <span className="text-[11px] text-slate-400">08/14/2026, 06:19</span>
                </div>
                <p className="text-slate-600">Updated by Sean Ngo (sean75@8)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Note published</span>
                  <span className="text-[11px] text-slate-400">05/20/2026, 08:13</span>
                </div>
                <p className="text-slate-600">Uploaded ACA verification documents to Marketplace portal.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Ticket Created</span>
                  <span className="text-[11px] text-slate-400">05/14/2026, 09:00</span>
                </div>
                <p className="text-slate-600">Created by Tri Tran (tritran92@5) with Priority High</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Send Email ────────────────────────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">mail</span>
                Compose Email to Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">To</label>
                <input
                  type="text"
                  readOnly
                  value={`${ticketData.contactName} <${ticketData.contactEmail}>`}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Dear client, regarding your ACA account verification..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Create Task ────────────────────────────────────────── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">add_task</span>
                Create Follow-up Task
              </h3>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Call Marketplace to verify document upload"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
