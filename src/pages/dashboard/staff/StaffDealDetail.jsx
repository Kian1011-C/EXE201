import React, { useState, useRef, useEffect } from 'react';
import {
  DEAL_DETAIL_DATA,
  OBAMACARE_DEAL_STAGES,
  MEDICARE_DEAL_STAGES,
} from '../../../data/mockCrmData';

export default function StaffDealDetail({
  deal,
  onBack,
  onSelectContact,
  onSelectCustomerDocument,
  onSelectTicket,
  onSelectTask,
  onUpdateDeal,
}) {
  const dealInfo = {
    ...DEAL_DETAIL_DATA,
    ...(deal || {}),
  };

  // State for deal editing
  const [dealTitle, setDealTitle] = useState(
    dealInfo.title || 'Non-CMS - Nhat H Dang - OB 10/2026 (NC)'
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [pipeline, setPipeline] = useState(dealInfo.pipeline || 'Obamacare 2026');
  const [stage, setStage] = useState(
    dealInfo.stage || 'Ready to Enroll (Obamacare 2026)'
  );
  const [amount, setAmount] = useState(dealInfo.amount || '_ _ _ _ _ _ _ _ _ _');
  const [closeDate, setCloseDate] = useState(
    dealInfo.closeDate || '_ _ _ _ _ _ _ _ _ _'
  );

  // Stage dropdown & history state (Matching media_1789720398557.png)
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [stageSearchQuery, setStageSearchQuery] = useState('');
  const [showStageHistoryModal, setShowStageHistoryModal] = useState(false);
  const [isPipelineDropdownOpen, setIsPipelineDropdownOpen] = useState(false);
  const [stageHistory, setStageHistory] = useState([
    {
      from: 'Waiting for document (Obamacare 2026)',
      to: dealInfo.stage || 'Ready to Enroll (Obamacare 2026)',
      date: '09/09/2026, 13:05',
      user: 'Khanh Nguyen (khanhnguyen31@7)',
    },
  ]);
  const [activitiesList, setActivitiesList] = useState(dealInfo.activities || []);

  const currentDealIdRef = useRef(deal?.id || dealInfo.id);

  useEffect(() => {
    const nextId = deal?.id || dealInfo.id;
    if (nextId !== currentDealIdRef.current) {
      currentDealIdRef.current = nextId;
      if (deal?.title) setDealTitle(deal.title);
      if (deal?.pipeline) setPipeline(deal.pipeline);
      if (deal?.stage) setStage(deal.stage);
      if (deal?.amount) setAmount(deal.amount);
      if (deal?.closeDate) setCloseDate(deal.closeDate);
      if (deal?.activities) setActivitiesList(deal.activities);
      if (deal?.notes) setNotesList(deal.notes);
      if (deal?.tasks) setTasksList(deal.tasks);
      const sss = deal?.adminOnly?.saleSupportStatus || deal?.saleSupportStatus;
      if (sss) setSaleSupportStatus(sss);
    }
  }, [deal]);

  const stageDropdownRef = useRef(null);
  const pipelineDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        stageDropdownRef.current &&
        !stageDropdownRef.current.contains(event.target)
      ) {
        setIsStageDropdownOpen(false);
      }
      if (
        pipelineDropdownRef.current &&
        !pipelineDropdownRef.current.contains(event.target)
      ) {
        setIsPipelineDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered stage options based on selected pipeline & search query
  const currentPipelineStages = pipeline.includes('Medicare')
    ? MEDICARE_DEAL_STAGES
    : OBAMACARE_DEAL_STAGES;

  const filteredStages = currentPipelineStages.filter((st) =>
    st.toLowerCase().includes(stageSearchQuery.toLowerCase().trim())
  );

  function handleSelectStage(newStage) {
    if (newStage === stage) {
      setIsStageDropdownOpen(false);
      setStageSearchQuery('');
      return;
    }
    const oldStage = stage;
    setStage(newStage);
    setIsStageDropdownOpen(false);
    setStageSearchQuery('');

    // Add to stage history
    const now = new Date();
    const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    setStageHistory((prev) => [
      {
        from: oldStage,
        to: newStage,
        date: dateStr,
        user: 'Anya Nguyen (anya42@9)',
      },
      ...prev,
    ]);

    // Log activity in middle timeline
    const newAct = {
      id: 'deal-act-' + Date.now(),
      type: 'Deal Activity',
      time: dateStr,
      actor: 'Anya Nguyen (anya42@9)',
      summary: `moved deal stage from "${oldStage}" to "${newStage}"`,
      dealId: dealInfo.id,
      dealTitle: dealTitle,
      linkText: 'View Details',
    };
    const updatedActivities = [newAct, ...(activitiesList || [])];
    setActivitiesList(updatedActivities);

    if (onUpdateDeal) {
      onUpdateDeal({
        ...dealInfo,
        title: dealTitle,
        pipeline,
        stage: newStage,
        activities: updatedActivities,
        notes: notesList,
        tasks: tasksList,
      });
    }

    showToast(`Stage updated to: ${newStage}`);
  }

  function handleSelectPipeline(newPipeline) {
    setPipeline(newPipeline);
    setIsPipelineDropdownOpen(false);
    const defaultStage = newPipeline.includes('Medicare')
      ? MEDICARE_DEAL_STAGES[1]
      : OBAMACARE_DEAL_STAGES[7];
    handleSelectStage(defaultStage);
    showToast(`Pipeline changed to ${newPipeline}`);
  }

  // Left sidebar collapse state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  // 5 Accordion states (closed by default matching media_1789718765735.png)
  const [adminOnlyOpen, setAdminOnlyOpen] = useState(false);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [readyToEnrollOpen, setReadyToEnrollOpen] = useState(false);
  const [feeBonusPaymentOpen, setFeeBonusPaymentOpen] = useState(false);
  const [notInCarrierOpen, setNotInCarrierOpen] = useState(false);

  // Form states for ADMIN ONLY
  const [primaryMemberId, setPrimaryMemberId] = useState(
    dealInfo.adminOnly?.primaryMemberId || 'MID-98234710'
  );
  const [carrier, setCarrier] = useState(dealInfo.adminOnly?.carrier || 'BCBS');
  const [sellingState, setSellingState] = useState(
    dealInfo.adminOnly?.sellingState || 'North Carolina (NC)'
  );
  const [numberMember, setNumberMember] = useState(
    dealInfo.adminOnly?.numberMember || 1
  );
  const [enrolledNpn, setEnrolledNpn] = useState(
    dealInfo.adminOnly?.enrolledNpn || 'Anh Que Pham 20011862'
  );
  const [brokerEffectiveDate, setBrokerEffectiveDate] = useState(
    dealInfo.adminOnly?.brokerEffectiveDate || '2026-09-09'
  );
  const [terminationDate, setTerminationDate] = useState(
    dealInfo.adminOnly?.terminationDate || '2027-12-31'
  );
  const [saleSupportStatus, setSaleSupportStatus] = useState(
    dealInfo.adminOnly?.saleSupportStatus || dealInfo.saleSupportStatus || 'None'
  );
  const [closedLostReason, setClosedLostReason] = useState(
    dealInfo.adminOnly?.closedLostReason || '---'
  );

  // Form states for GENERAL
  const [dealType, setDealType] = useState('New Business');
  const [priority, setPriority] = useState('Medium');

  // Form states for READY-TO-ENROLL & AFTER-SALE
  const [appId, setAppId] = useState('APP-2026-9812');
  const [policyNumber, setPolicyNumber] = useState('POL-BCBS-84920');
  const [planSelected, setPlanSelected] = useState(
    'Blue Cross Blue Shield Silver 2026'
  );
  const [afterSaleStatus, setAfterSaleStatus] = useState(
    'Enrolled - Pending First Premium'
  );
  const [memberLanguage, setMemberLanguage] = useState('Vietnamese');

  // Form states for FEE, BONUS, PAYMENT
  const [monthlyPremium, setMonthlyPremium] = useState('$0.00');
  const [subsidyAmount, setSubsidyAmount] = useState('$485.00');
  const [agencyCommission, setAgencyCommission] = useState('$25.00');
  const [bonusTier, setBonusTier] = useState('Standard Tier');
  const [paymentOption, setPaymentOption] = useState('EFT Auto-pay');
  const [paymentVerification, setPaymentVerification] = useState('Verified');

  // Form states for Not In Carrier
  const [carrierSyncStatus, setCarrierSyncStatus] = useState('Not In Carrier');
  const [carrierErrorCode, setCarrierErrorCode] = useState('---');
  const [carrierNotes, setCarrierNotes] = useState(
    'Customer enrolled through Marketplace, awaiting carrier portal confirmation.'
  );

  // Middle tab state
  const [activeTab, setActiveTab] = useState('activity');
  const [notesList, setNotesList] = useState(dealInfo.notes || []);
  const [tasksList, setTasksList] = useState(dealInfo.tasks || []);

  // Modals for Note & Task creation (Matching StaffContactDetail 100%)
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteAttachments, setNoteAttachments] = useState([]);
  const [createFollowUpTask, setCreateFollowUpTask] = useState(false);
  const [followUpDateTime, setFollowUpDateTime] = useState('09/18/2026, 08:00');
  const [isNoteFullscreen, setIsNoteFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('09/18/2026');
  const [taskDueTime, setTaskDueTime] = useState('8:00 AM');
  const [taskRemind, setTaskRemind] = useState('No remind');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('None');
  const [taskType, setTaskType] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [isTaskFullscreen, setIsTaskFullscreen] = useState(false);
  const taskFileInputRef = useRef(null);

  // Right column accordion states
  const [rightContactsOpen, setRightContactsOpen] = useState(true);
  const [rightTicketsOpen, setRightTicketsOpen] = useState(true);
  const [rightDocsOpen, setRightDocsOpen] = useState(true);

  // Quick toast
  const [toastMsg, setToastMsg] = useState(null);
  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }

  function logActivity(type, summary, linkText = '', contactId = null) {
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newAct = {
      id: `deal-act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      time: timeStr,
      actor: 'Anya Nguyen (anya42@9)',
      summary,
      linkText,
      contactId,
    };
    const updatedActivities = [newAct, ...(activitiesList || [])];
    setActivitiesList(updatedActivities);

    if (onUpdateDeal) {
      onUpdateDeal({
        ...dealInfo,
        title: dealTitle,
        pipeline,
        stage,
        activities: updatedActivities,
        notes: notesList,
        tasks: tasksList,
      });
    }
  }

  function handleUpdateSaleSupportStatus(newSss) {
    setSaleSupportStatus(newSss);
    logActivity('Deal Property Updated', `changed Sale Support Status to "${newSss}"`);
    if (onUpdateDeal) {
      onUpdateDeal({
        ...dealInfo,
        title: dealTitle,
        pipeline,
        stage,
        adminOnly: { ...(dealInfo.adminOnly || {}), saleSupportStatus: newSss },
        saleSupportStatus: newSss,
      });
    }
    showToast(`Sale Support Status updated to ${newSss}`);
  }

  function handleFileAttach(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
    }));
    setNoteAttachments((prev) => [...prev, ...newAttach]);
    e.target.value = '';
  }

  function handleRemoveAttachment(id) {
    setNoteAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleAddNoteSubmit(e) {
    if (e) e.preventDefault();
    if (!noteBody.trim() && noteAttachments.length === 0) return;
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const title =
      noteTitle.trim() ||
      (noteBody.trim() ? noteBody.trim().split('\n')[0].slice(0, 60) : '') ||
      (noteAttachments.length > 0 ? `Attachment: ${noteAttachments[0].name}` : 'Deal Note');

    const newNote = {
      id: `note-${Date.now()}`,
      title,
      body: noteBody.trim(),
      attachments: [...noteAttachments],
      author: 'Anya Nguyen (anya42@9)',
      time: timeStr,
    };
    setNotesList((prev) => [newNote, ...prev]);

    const attachSuffix =
      noteAttachments.length > 0
        ? ` with ${noteAttachments.length} file(s) attached`
        : '';
    logActivity('Note Added', `added note: "${title}"${attachSuffix}`);

    // If "Create a To Do task to follow up" is checked
    if (createFollowUpTask) {
      const newTask = {
        id: `task-${Date.now()}`,
        title: `Follow up on note: ${title}`,
        dueDate: followUpDateTime || '09/18/2026, 08:00',
        priority: 'Medium',
        status: 'Pending',
        author: 'Anya Nguyen (anya42@9)',
        createdAt: timeStr,
      };
      setTasksList((prev) => [newTask, ...prev]);
      logActivity('Task Created', `created follow-up task: "${newTask.title}" (Due: ${newTask.dueDate})`);
    }

    setNoteTitle('');
    setNoteBody('');
    setNoteAttachments([]);
    setCreateFollowUpTask(false);
    setIsNoteFullscreen(false);
    setShowCreateNoteModal(false);
    showToast('Note added successfully');
  }

  function handleTaskFileAttach(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files.map((file) => ({
      id: `att-t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
    }));
    setTaskAttachments((prev) => [...prev, ...newAttach]);
    e.target.value = '';
  }

  function handleRemoveTaskAttachment(id) {
    setTaskAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleAddTaskSubmit(e) {
    if (e) e.preventDefault();
    const title =
      taskTitle.trim() ||
      (taskContent.trim() ? taskContent.trim().split('\n')[0].slice(0, 60) : '') ||
      'Follow-up Task';

    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}`;

    const dueFormatted = `${taskDueDate} ${taskDueTime}`.trim();

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      content: taskContent.trim(),
      dueDate: dueFormatted || '09/18/2026, 8:00 AM',
      sendRemind: taskRemind,
      assignee: taskAssignee || 'Khanh Nguyen (khanhnguyen31@7)',
      priority: taskPriority || 'None',
      taskType: taskType || 'To Do',
      attachments: [...taskAttachments],
      status: 'Pending',
      author: 'Anya Nguyen (anya42@9)',
      createdAt: timeStr,
    };
    setTasksList((prev) => [newTask, ...prev]);

    const attachSuffix =
      taskAttachments.length > 0
        ? ` with ${taskAttachments.length} file(s) attached`
        : '';
    logActivity(
      'Task Created',
      `created task: "${newTask.title}" (Due: ${newTask.dueDate})${attachSuffix}`
    );

    setTaskTitle('');
    setTaskContent('');
    setTaskDueDate('09/18/2026');
    setTaskDueTime('8:00 AM');
    setTaskRemind('No remind');
    setTaskAssignee('');
    setTaskPriority('None');
    setTaskType('');
    setTaskAttachments([]);
    setIsTaskFullscreen(false);
    setShowCreateTaskModal(false);
    showToast('Task created successfully');
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Top Bar Header (Matching Image media_1789718765735.png) ──────── */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        {/* Left: Back Arrow + Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Back to Contact Detail"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Deal Detail
          </h1>
        </div>

        {/* Right: View history | Refresh */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">history</span>
            <span>View history</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => showToast('Deal details refreshed')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 3-Column Layout ─────────────────────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden relative">
        {/* ── COLUMN 1: Left Deal Panel (Matching media_1789718765735.png) ── */}
        <div
          className={`${
            leftPanelCollapsed ? 'w-0 hidden' : 'w-[320px] xl:w-[350px]'
          } bg-white border-r border-slate-200 shrink-0 flex flex-col overflow-y-auto relative transition-all duration-200`}
        >
          {/* Collapse button on right border */}
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="absolute right-2 top-3 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
            title="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-[14px]">
              keyboard_double_arrow_left
            </span>
          </button>

          {/* Profile Header Area */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              {/* Purple Circle Avatar: N2 */}
              <div className="w-12 h-12 rounded-full bg-[#967CD7] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs tracking-wide">
                N2
              </div>

              {/* Deal Title + Edit Icon */}
              <div className="min-w-0 flex-grow pr-5">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 border border-blue-400 rounded px-1.5 py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="text-emerald-600 hover:text-emerald-800 p-0.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="text-[15px] font-bold text-slate-900 leading-snug break-words">
                      {dealTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      title="Edit deal title"
                      className="text-slate-600 hover:text-blue-600 transition p-0.5 shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Properties summary below avatar */}
            <div className="mt-3.5 space-y-2 text-xs">
              {/* Amount */}
              <div className="flex items-center gap-2 text-slate-600">
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  monetization_on
                </span>
                <span className="text-slate-500 font-medium w-20">Amount:</span>
                <span className="font-mono text-slate-700 tracking-wider">
                  {amount}
                </span>
              </div>

              {/* Close date */}
              <div className="flex items-center gap-2 text-slate-600">
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  calendar_today
                </span>
                <span className="text-slate-500 font-medium w-20">Close date:</span>
                <span className="font-mono text-slate-700 tracking-wider">
                  {closeDate}
                </span>
              </div>

              {/* Pipeline */}
              <div ref={pipelineDropdownRef} className="flex items-center gap-2 text-slate-600 relative">
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  account_tree
                </span>
                <span className="text-slate-500 font-medium w-20">Pipeline:</span>
                <div
                  onClick={() => setIsPipelineDropdownOpen(!isPipelineDropdownOpen)}
                  className="inline-flex items-center gap-1 font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer select-none"
                >
                  <span>{pipeline}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_drop_down
                  </span>
                </div>

                {isPipelineDropdownOpen && (
                  <div className="absolute left-20 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-xs animate-fade-in">
                    {['Obamacare 2026', 'Medicare 2026'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleSelectPipeline(p)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer ${
                          pipeline === p
                            ? 'font-bold text-blue-600 bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{p}</span>
                        {pipeline === p && (
                          <span className="material-symbols-outlined text-[14px]">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stage (Matching media_1789720398557.png) */}
              <div ref={stageDropdownRef} className="flex items-center gap-2 text-slate-600 relative">
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  desktop_windows
                </span>
                <span className="text-slate-500 font-medium w-20">Stage:</span>
                <div
                  onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                  className="inline-flex items-center gap-1 font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer truncate max-w-[170px] select-none group"
                  title={stage}
                >
                  <span className="truncate">{stage}</span>
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-slate-500 group-hover:text-blue-700">
                    arrow_drop_down
                  </span>
                </div>

                {/* Clock history icon matching screenshot */}
                <button
                  type="button"
                  onClick={() => setShowStageHistoryModal(true)}
                  title="Stage change history"
                  className="text-slate-400 hover:text-blue-600 p-0.5 rounded cursor-pointer transition shrink-0 ml-0.5"
                >
                  <span className="material-symbols-outlined text-[16px]">history</span>
                </button>

                {/* Dropdown Popup matching Image media_1789720398557.png */}
                {isStageDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-[310px] sm:w-[330px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2.5 animate-fade-in text-xs">
                    {/* Search box with blue focus border */}
                    <div className="mb-2">
                      <input
                        type="text"
                        value={stageSearchQuery}
                        onChange={(e) => setStageSearchQuery(e.target.value)}
                        placeholder="Search stage..."
                        autoFocus
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs text-slate-800"
                      />
                    </div>

                    {/* Dashed divider line */}
                    <div className="border-t border-dashed border-slate-200 my-1.5" />

                    {/* Stage options list with scrollbar */}
                    <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                      {filteredStages.length === 0 ? (
                        <div className="py-3 text-center text-slate-400 text-[11px]">
                          No matching stages found
                        </div>
                      ) : (
                        filteredStages.map((item) => {
                          const isSelected = item === stage;
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleSelectStage(item)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11.5px] transition cursor-pointer flex items-center justify-between gap-1 leading-snug ${
                                isSelected
                                  ? 'bg-[#EAF2FE] text-[#0F2962] font-bold'
                                  : 'text-slate-700 hover:bg-slate-100 font-normal'
                              }`}
                            >
                              <span className="break-words">{item}</span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0">
                                  check
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-nav: Information & View all properties */}
            <div className="mt-3.5 pt-2.5 flex items-center justify-between border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#0F2962]">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Information</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">visibility</span>
                <span>View all properties</span>
              </button>
            </div>
          </div>

          {/* ── 5 ACCORDION SECTIONS (Matching media_1789718765735.png) ──────── */}
          <div className="divide-y divide-slate-200">
            {/* 1. ADMIN ONLY */}
            <div>
              <button
                type="button"
                onClick={() => setAdminOnlyOpen(!adminOnlyOpen)}
                className="w-full py-2.5 px-4 flex items-center gap-2 text-left font-bold text-xs text-[#0F2962] hover:bg-slate-50 hover:text-blue-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                  {adminOnlyOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>ADMIN ONLY</span>
              </button>

              {adminOnlyOpen && (
                <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  {/* Enrolled NPN* */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Enrolled NPN <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={enrolledNpn}
                      onChange={(e) => setEnrolledNpn(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option>Anh Que Pham 20011862</option>
                      <option>Trono Truong 19823412</option>
                      <option>Nancy Pham 20491823</option>
                    </select>
                  </div>

                  {/* Broker Effective Date */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Broker Effective Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={brokerEffectiveDate}
                        onChange={(e) => setBrokerEffectiveDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 pr-8 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Termination Date */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Termination Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={terminationDate}
                        onChange={(e) => setTerminationDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 pr-8 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Lead Owner */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Lead Owner
                    </label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800">
                      <div className="w-4 h-4 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        KN
                      </div>
                      <span className="truncate">{dealInfo.adminOnly?.leadOwner || 'Khanh Nguyen (khanhnguyen31@7)'}</span>
                    </div>
                  </div>

                  {/* Deal Owner* */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Deal Owner <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800">
                      <div className="w-4 h-4 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        KN
                      </div>
                      <span className="truncate flex-grow">
                        {dealInfo.adminOnly?.dealOwner || 'Khanh Nguyen (khanhnguyen31@7)'}
                      </span>
                      <span className="text-[11px] text-slate-400">✕</span>
                    </div>
                  </div>

                  {/* Support Agent* */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Support Agent <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800">
                      <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        AN
                      </div>
                      <span className="truncate">{dealInfo.adminOnly?.supportAgent || 'Anya Nguyen (anya42@9)'}</span>
                    </div>
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Code
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={dealInfo.adminOnly?.code || 'D26005033'}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-100 font-mono text-xs text-slate-700"
                    />
                  </div>

                  {/* Primary Member Id */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Primary Member Id
                    </label>
                    <input
                      type="text"
                      value={primaryMemberId}
                      onChange={(e) => setPrimaryMemberId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-blue-300 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sale Support Status */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 font-semibold text-[11px]">
                        Sale Support Status
                      </label>
                      <span className="text-[10px] font-bold text-blue-600">
                        {saleSupportStatus === 'None' || saleSupportStatus === 'NONE'
                          ? '7/3 Split (Agent 70% / Support 30%)'
                          : saleSupportStatus === 'Partial' || saleSupportStatus === 'PARTIAL'
                          ? '5/5 Split (Agent 50% / Support 50%)'
                          : saleSupportStatus === 'Full' || saleSupportStatus === 'FULL'
                          ? '3/7 Split (Agent 30% / Support 70%)'
                          : ''}
                      </span>
                    </div>
                    <select
                      value={saleSupportStatus}
                      onChange={(e) => handleUpdateSaleSupportStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="None">None (7/3)</option>
                      <option value="Partial">Partial (5/5)</option>
                      <option value="Full">Full (3/7)</option>
                    </select>
                  </div>

                  {/* Number Member* */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Number Member <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={numberMember}
                      onChange={(e) => setNumberMember(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-bold"
                    />
                  </div>

                  {/* Selling State* */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Selling State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={sellingState}
                      onChange={(e) => setSellingState(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium"
                    >
                      <option>North Carolina (NC)</option>
                      <option>Texas (TX)</option>
                      <option>California (CA)</option>
                      <option>Georgia (GA)</option>
                      <option>Florida (FL)</option>
                    </select>
                  </div>

                  {/* Carrier* */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Carrier <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-bold text-blue-700"
                    >
                      <option>BCBS</option>
                      <option>Ambetter</option>
                      <option>Oscar</option>
                      <option>UnitedHealthcare</option>
                      <option>Molina Healthcare</option>
                      <option>Aetna</option>
                    </select>
                  </div>

                  {/* Closed Lost Reason */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Closed Lost Reason
                    </label>
                    <select
                      value={closedLostReason}
                      onChange={(e) => setClosedLostReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>---</option>
                      <option>Price too high</option>
                      <option>Chose competitor</option>
                      <option>Not eligible</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2. GENERAL */}
            <div>
              <button
                type="button"
                onClick={() => setGeneralOpen(!generalOpen)}
                className="w-full py-2.5 px-4 flex items-center gap-2 text-left font-bold text-xs text-[#0F2962] hover:bg-slate-50 hover:text-blue-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                  {generalOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>GENERAL</span>
              </button>

              {generalOpen && (
                <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Deal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Pipeline <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={pipeline}
                      onChange={(e) => setPipeline(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>Obamacare 2026</option>
                      <option>Obamacare 2025</option>
                      <option>Medicare 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Deal Type
                    </label>
                    <select
                      value={dealType}
                      onChange={(e) => setDealType(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>New Business</option>
                      <option>Renewal</option>
                      <option>Carrier Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>Medium</option>
                      <option>High</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. READY-TO-ENROLL & AFTER-SALE */}
            <div>
              <button
                type="button"
                onClick={() => setReadyToEnrollOpen(!readyToEnrollOpen)}
                className="w-full py-2.5 px-4 flex items-center gap-2 text-left font-bold text-xs text-[#0F2962] hover:bg-slate-50 hover:text-blue-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                  {readyToEnrollOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>READY-TO-ENROLL & AFTER-SALE</span>
              </button>

              {readyToEnrollOpen && (
                <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Application ID
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Plan Selected
                    </label>
                    <input
                      type="text"
                      value={planSelected}
                      onChange={(e) => setPlanSelected(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      After-Sale Status
                    </label>
                    <select
                      value={afterSaleStatus}
                      onChange={(e) => setAfterSaleStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium"
                    >
                      <option>Enrolled - Pending First Premium</option>
                      <option>Active - Card Received</option>
                      <option>Needs Customer Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Language Preference
                    </label>
                    <select
                      value={memberLanguage}
                      onChange={(e) => setMemberLanguage(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>Vietnamese</option>
                      <option>English</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 4. FEE, BONUS, PAYMENT */}
            <div>
              <button
                type="button"
                onClick={() => setFeeBonusPaymentOpen(!feeBonusPaymentOpen)}
                className="w-full py-2.5 px-4 flex items-center gap-2 text-left font-bold text-xs text-[#0F2962] hover:bg-slate-50 hover:text-blue-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                  {feeBonusPaymentOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>FEE, BONUS, PAYMENT</span>
              </button>

              {feeBonusPaymentOpen && (
                <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Monthly Premium
                    </label>
                    <input
                      type="text"
                      value={monthlyPremium}
                      onChange={(e) => setMonthlyPremium(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Subsidy Amount (APTC)
                    </label>
                    <input
                      type="text"
                      value={subsidyAmount}
                      onChange={(e) => setSubsidyAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Agency Commission
                    </label>
                    <input
                      type="text"
                      value={agencyCommission}
                      onChange={(e) => setAgencyCommission(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Bonus Tier
                    </label>
                    <select
                      value={bonusTier}
                      onChange={(e) => setBonusTier(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>Standard Tier</option>
                      <option>Tier 1 Bonus ($50)</option>
                      <option>Tier 2 Bonus ($100)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Payment Option
                    </label>
                    <select
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>EFT Auto-pay</option>
                      <option>Direct Carrier Pay</option>
                      <option>Credit / Debit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Payment Verification
                    </label>
                    <select
                      value={paymentVerification}
                      onChange={(e) => setPaymentVerification(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium"
                    >
                      <option>Verified</option>
                      <option>Pending Verification</option>
                      <option>Failed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Not In Carrier */}
            <div>
              <button
                type="button"
                onClick={() => setNotInCarrierOpen(!notInCarrierOpen)}
                className="w-full py-2.5 px-4 flex items-center gap-2 text-left font-bold text-xs text-[#0F2962] hover:bg-slate-50 hover:text-blue-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                  {notInCarrierOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Not In Carrier</span>
              </button>

              {notInCarrierOpen && (
                <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Carrier Sync Status
                    </label>
                    <select
                      value={carrierSyncStatus}
                      onChange={(e) => setCarrierSyncStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium text-amber-700"
                    >
                      <option>Not In Carrier</option>
                      <option>Synced</option>
                      <option>Needs Re-submission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Error Code
                    </label>
                    <input
                      type="text"
                      value={carrierErrorCode}
                      onChange={(e) => setCarrierErrorCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Notes & Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={carrierNotes}
                      onChange={(e) => setCarrierNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsed Sidebar Restore Button */}
        {leftPanelCollapsed && (
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(false)}
            className="absolute left-2 top-3 z-20 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition cursor-pointer"
            title="Expand sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">
              keyboard_double_arrow_right
            </span>
          </button>
        )}

        {/* ── COLUMN 2: Middle Timeline & Activity Feed ────────────────────── */}
        <div className="flex-1 bg-white p-4 flex flex-col gap-4 overflow-y-auto min-w-[340px]">
          {/* Tabs + Dynamic Action Button (Activity: none, Notes: Create Note, Tasks: Create Task) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            {/* 3 Nav Tabs: Activity, Notes, Tasks */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { key: 'activity', label: 'Activity', icon: 'history' },
                { key: 'notes', label: 'Notes', icon: 'note' },
                { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Top Right Action Button: Only visible in Notes or Tasks */}
            <div>
              {activeTab === 'notes' && (
                <button
                  type="button"
                  onClick={() => setShowCreateNoteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Create Note</span>
                </button>
              )}
              {activeTab === 'tasks' && (
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Create Task</span>
                </button>
              )}
            </div>
          </div>

          {/* ── TAB 1: ACTIVITY ────────────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="flex flex-col gap-3">
              {activitiesList.length === 0 ? (
                /* Empty state when no activity yet */
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[28px] text-slate-400">history</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">No activity yet</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-sm">
                    Changes to deal information, notes, tasks, or stage updates will be logged here automatically.
                  </div>
                </div>
              ) : (
                <>
                  {/* Filter / Search within Activity */}
                  <div className="flex items-center justify-between gap-2 py-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Filters:</span>
                      <div className="relative">
                        <select className="appearance-none pl-2 pr-6 py-1 rounded border border-slate-200 bg-white text-xs text-slate-700">
                          <option>Search by created by...</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                        <span>+ Collapse all</span>
                      </button>
                      <button type="button" className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                        <span>+ Expand all</span>
                      </button>
                      <button type="button" className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Timeline Feed Group */}
                  <div className="mt-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Recent Activity
                    </div>

                    <div className="space-y-2.5">
                      {activitiesList.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs flex flex-col gap-1 text-xs"
                        >
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span className="font-semibold text-slate-700">{act.type}</span>
                            <span>{act.time}</span>
                          </div>

                          <div className="text-slate-800 leading-relaxed">
                            <span className="font-semibold text-slate-900">{act.actor}</span>{' '}
                            <span>{act.summary}</span>{' '}
                            {act.linkText && (
                              <span className="text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1">
                                {act.linkText}
                                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB 2: NOTES ───────────────────────────────────────────────── */}
          {activeTab === 'notes' && (
            <div className="flex flex-col gap-3">
              {notesList.length === 0 ? (
                /* Empty state when no notes yet */
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[28px] text-slate-400">edit_note</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">No notes yet</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                    There are no notes recorded for this deal yet. Add notes to keep track of calls or special requests.
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateNoteModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Create Note</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mt-1">
                  {notesList.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-600 text-[16px]">description</span>
                          <span>{note.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{note.time}</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {note.body}
                      </div>
                      {/* Attached files */}
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {note.attachments.map((att) => (
                            <span
                              key={att.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
                            >
                              <span className="material-symbols-outlined text-[13px] text-blue-600">attach_file</span>
                              <span className="font-medium truncate max-w-[200px]">{att.name}</span>
                              <span className="text-[10px] text-slate-400">({att.size})</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">person</span>
                        <span>By {note.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: TASKS ───────────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-3">
              {tasksList.length === 0 ? (
                /* Empty state when no tasks yet */
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[28px] text-slate-400">task_alt</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">No tasks yet</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                    Keep track of follow-ups and action items for this deal by creating your first task.
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateTaskModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Create Task</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mt-1">
                  {tasksList.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={task.status === 'Completed'}
                          onChange={() => {
                            const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
                            setTasksList(tasksList.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
                            logActivity('Task Status', `marked task "${task.title}" as ${newStatus}`);
                          }}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <div
                            onClick={() => onSelectTask && onSelectTask(task)}
                            className={`font-semibold text-slate-900 hover:text-blue-600 cursor-pointer ${
                              task.status === 'Completed' ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.content && (
                            <div className="text-slate-600 text-xs mt-1 whitespace-pre-wrap leading-relaxed">
                              {task.content}
                            </div>
                          )}
                          {task.attachments && task.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {task.attachments.map((att) => (
                                <span
                                  key={att.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
                                >
                                  <span className="material-symbols-outlined text-[13px] text-blue-600">attach_file</span>
                                  <span className="font-medium truncate max-w-[180px]">{att.name}</span>
                                  <span className="text-[10px] text-slate-400">({att.size})</span>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                              <span>Due: {task.dueDate}</span>
                            </span>
                            {task.taskType && task.taskType !== '--' && (
                              <>
                                <span>•</span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                  {task.taskType}
                                </span>
                              </>
                            )}
                            {task.assignee && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">person</span>
                                  <span>{task.assignee}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : task.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── COLUMN 3: Associated Objects & Documents (Right Panel ~320px) ── */}
        <div className="w-full xl:w-[320px] bg-[#F8FAFC] border-l border-slate-200 shrink-0 flex flex-col divide-y divide-slate-200 overflow-y-auto">
          {/* Card 1: Associated Contact (1) */}
          <div>
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition">
              <button
                type="button"
                onClick={() => setRightContactsOpen(!rightContactsOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {rightContactsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Contacts (1)</span>
              </button>
            </div>

            {rightContactsOpen && (
              <div className="p-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[15px]">assignment_ind</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectContact && onSelectContact(dealInfo.contact)}
                      className="font-bold text-[#104882] text-xs hover:underline cursor-pointer text-left"
                    >
                      {dealInfo.contact?.fullName || 'Nhat Huu Tuan Dang'}
                    </button>
                  </div>

                  <div className="space-y-1 text-slate-600 text-[11px] pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">call</span>
                      <span>Phone:</span>
                      <span className="font-semibold text-slate-800">{dealInfo.contact?.phone || '+1 (714) 837-2395'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">mail</span>
                      <span>Email:</span>
                      <span className="font-semibold text-slate-800">{dealInfo.contact?.email || 'tuannhat.n2@gmail.com'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Tickets (1) ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition border-b border-slate-100">
              <button
                type="button"
                onClick={() => setRightTicketsOpen(!rightTicketsOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {rightTicketsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Tickets (1)</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  title="Add ticket"
                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                </button>
                <button
                  type="button"
                  title="Refresh"
                  className="hover:text-blue-600 p-0.5 rounded cursor-pointer text-slate-500"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {rightTicketsOpen && (() => {
              const isPaymentDeal =
                (dealInfo.pipeline || '').toLowerCase().includes('payment') ||
                (dealInfo.title || '').toLowerCase().includes('pay') ||
                (dealInfo.title || '').toLowerCase().includes('hoai thanh');

              const isKenHoDeal =
                (dealInfo.title || '').toLowerCase().includes('ken ho') ||
                (dealInfo.contactName || '').toLowerCase().includes('ken');

              const associatedTicket = isPaymentDeal
                ? {
                    id: 'TC2600201',
                    title: 'Oct/26 Company Pay ticket',
                    avatar: 'OT',
                    avatarBg: 'bg-[#B25E3B]',
                    pipeline: 'Payment',
                    status: 'Make payment',
                    priority: 'None',
                    openDays: 9,
                    dueDate: '09/20/2026',
                    serviceAgent: 'Anya Nguyen (anya42@9)',
                    serviceAgentAvatar: 'AN',
                    ticketOwner: 'Khanh Nguyen (khanhnguyen31@7)',
                    ticketOwnerAvatar: 'KN',
                    paymentStatus: 'Company Pay',
                    carrier: dealInfo.carrier || 'Kaiser Permanente',
                    contactName: dealInfo.contactName || 'Hoai thanh Nguyen',
                    contactPhone: dealInfo.contactPhone || '+1 (838) 776-1434',
                    contactEmail: dealInfo.contactEmail || 'nguyenleminhquang1215@gmail.com',
                    leadOwner: 'Khanh Nguyen',
                    dealTitle: dealInfo.title || 'Non Commission - Hoai thanh Nguyen - OB 2026',
                    dealShortTitle: dealInfo.shortTitle || 'Non Commission - Hoai thanh...',
                    dealPipeline: dealInfo.pipeline || 'Obamacare 2026',
                    dealStage: dealInfo.stage || 'Non-Commission - Active',
                    dealOwner: dealInfo.dealOwner?.name || dealInfo.dealOwner || 'Khanh Nguyen',
                    dealCarrier: dealInfo.carrier || 'Kaiser Permanente',
                  }
                : {
                    id: 'TC2600101',
                    title: 'ACA account 2026',
                    avatar: 'A2',
                    avatarBg: 'bg-[#E05638]',
                    pipeline: 'ACA account',
                    status: dealInfo.contact?.acaAccountStatus || dealInfo.acaAccountStatus || 'DONE',
                    rawStatus: dealInfo.contact?.acaAccountStatus || dealInfo.acaAccountStatus || 'DONE',
                    priority: 'High',
                    closeDate: isKenHoDeal ? '07/20/2026' : (dealInfo.closeDate || '07/20/2026'),
                    dueDate: isKenHoDeal ? '07/15/2026' : (dealInfo.dueDate || '07/15/2026'),
                    serviceAgent: isKenHoDeal ? 'Ivy Lu (ivy)' : (dealInfo.serviceAgent || 'Ivy Lu (ivy)'),
                    serviceAgentAvatar: 'IL',
                    ticketOwner: isKenHoDeal ? 'Jay Ly (trichauly24@7)' : (dealInfo.dealOwner?.name || dealInfo.dealOwner || 'Jay Ly (trichauly24@7)'),
                    ticketOwnerAvatar: 'JL',
                    carrier: dealInfo.carrier || (isKenHoDeal ? 'BCBS' : ''),
                    contactName: dealInfo.contactName || (isKenHoDeal ? 'Ken xington Ho' : 'Ken xington Ho'),
                    contactPhone: dealInfo.contactPhone || (isKenHoDeal ? '+1 (832) 998-9804' : '+1 (832) 998-9804'),
                    contactEmail: dealInfo.contactEmail || (isKenHoDeal ? 'kylieho@thesuperiorskilledlearners.com' : 'kylieho@thesuperiorskilledlearners.com'),
                    leadOwner: isKenHoDeal ? 'Jay Ly' : (dealInfo.dealOwner?.name || dealInfo.dealOwner || 'Jay Ly'),
                    dealTitle: dealInfo.title || 'Ken Ho + Kylie Ho + Kaylee Ho - OB 08/2026',
                    dealShortTitle: dealInfo.shortTitle || 'Ken Ho + Kylie Ho + Kaylee Ho - ...',
                    dealPipeline: dealInfo.pipeline || 'Obamacare 2026',
                    dealStage: dealInfo.stage || 'Enrolled - Active',
                    dealOwner: isKenHoDeal ? 'Jay Ly' : (dealInfo.dealOwner?.name || dealInfo.dealOwner || 'Jay Ly'),
                    dealCarrier: dealInfo.carrier || (isKenHoDeal ? 'BCBS' : 'BCBS'),
                  };

              return (
                <div className="p-3">
                  <div
                    onClick={() => onSelectTicket && onSelectTicket(associatedTicket)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                  >
                    {/* Title row with badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition">
                        <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                      </div>
                      <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs">
                        {associatedTicket.title}
                      </span>
                    </div>

                    {/* Properties list with icons matching screenshot */}
                    <div className="space-y-1.5 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">bar_chart</span>
                        <span className="text-slate-500">Pipeline:</span>
                        <span className="font-semibold text-slate-800">{associatedTicket.pipeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">trending_up</span>
                        <span className="text-slate-500">Ticket Status:</span>
                        <span className="font-semibold text-slate-800">{associatedTicket.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                        <span className="text-slate-500">Ticket Owner:</span>
                        <span className="font-semibold text-slate-800">
                          {associatedTicket.ticketOwner.split(' ')[0]} {associatedTicket.ticketOwner.split(' ')[1] || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                        <span className="text-slate-500">{associatedTicket.openDays ? 'Open:' : 'Close Date:'}</span>
                        <span className="text-slate-600 font-medium">
                          {associatedTicket.openDays
                            ? `${associatedTicket.openDays} Day(s)`
                            : (associatedTicket.closeDate || '----------')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Link */}
                  <button
                    type="button"
                    onClick={() => onSelectTicket && onSelectTicket(associatedTicket)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    » View Associated Ticket
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Card 3: Customer Documents (1) */}
          <div>
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition">
              <button
                type="button"
                onClick={() => setRightDocsOpen(!rightDocsOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {rightDocsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Customer Documents (1)</span>
              </button>
            </div>

            {rightDocsOpen && (
              <div className="p-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="material-symbols-outlined text-[15px]">description</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="font-bold text-[#104882] text-xs hover:underline cursor-pointer text-left"
                    >
                      Nhat H Dang
                    </button>
                  </div>

                  <div className="space-y-1 pt-1 text-[11px]">
                    <div
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">chevron_right</span>
                        <span className="material-symbols-outlined text-[15px] text-slate-400">description</span>
                        <span>Identity</span>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center">
                        3
                      </span>
                    </div>

                    <div
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">chevron_right</span>
                        <span className="material-symbols-outlined text-[15px] text-slate-400">description</span>
                        <span>Consent Form Text</span>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center">
                        1
                      </span>
                    </div>

                    <div
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">chevron_right</span>
                        <span className="material-symbols-outlined text-[15px] text-slate-400">description</span>
                        <span>Payment Information</span>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center">
                        1
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      <span className="uppercase font-semibold">LAST UPDATE:</span>
                      <span className="font-bold text-[#0F2962]">09/11/2026</span>
                    </div>
                    <span>17:45</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Note Modal (Exact match to uploaded image & Contact Detail) ────────────── */}
      {showCreateNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
              isNoteFullscreen
                ? 'fixed inset-2 max-w-none w-auto h-auto'
                : 'max-w-3xl w-full'
            }`}
          >
            {/* Header: Dark Navy Blue with CREATE NOTE and actions */}
            <div className="bg-[#173A75] px-4 py-2.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                <span className="material-symbols-outlined text-[17px]">edit</span>
                <span>CREATE NOTE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteFullscreen(!isNoteFullscreen)}
                  title={isNoteFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isNoteFullscreen ? 'close_fullscreen' : 'crop_free'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateNoteModal(false);
                    setIsNoteFullscreen(false);
                  }}
                  title="Close"
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddNoteSubmit} className="p-5 flex flex-col gap-3.5 overflow-y-auto">
              {/* Content Label */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Content <span className="text-rose-500">*</span>
                </label>

                {/* Editor Container with full toolbar */}
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400/30 transition">
                  {/* Toolbar Row */}
                  <div className="bg-[#F8FAFC] border-b border-slate-200 px-2 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 text-xs select-none">
                    {/* Undo / Redo */}
                    <button
                      type="button"
                      title="Undo"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">undo</span>
                    </button>
                    <button
                      type="button"
                      title="Redo"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">redo</span>
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Font Dropdown */}
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 rounded px-2 pr-5 py-0.5 text-xs text-slate-700 hover:border-slate-300 cursor-pointer focus:outline-none">
                        <option>Helvetica</option>
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    {/* Paragraph Dropdown */}
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 rounded px-2 pr-5 py-0.5 text-xs text-slate-700 hover:border-slate-300 cursor-pointer focus:outline-none">
                        <option>Paragraph</option>
                        <option>Heading 1</option>
                        <option>Heading 2</option>
                        <option>Heading 3</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    {/* Font Size */}
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 rounded px-2 pr-5 py-0.5 text-xs text-slate-700 hover:border-slate-300 cursor-pointer focus:outline-none">
                        <option>10pt</option>
                        <option>11pt</option>
                        <option>12pt</option>
                        <option>14pt</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Bold, Italic, Underline */}
                    <button
                      type="button"
                      title="Bold"
                      className="px-1.5 py-0.5 rounded font-bold hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      className="px-1.5 py-0.5 rounded italic font-serif hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      title="Underline"
                      className="px-1.5 py-0.5 rounded underline hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      U
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Lists */}
                    <button
                      type="button"
                      title="Bullet List"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    </button>
                    <button
                      type="button"
                      title="Numbered List"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Alignments */}
                    <button
                      type="button"
                      title="Align Left"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_left</span>
                    </button>
                    <button
                      type="button"
                      title="Align Center"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_center</span>
                    </button>
                    <button
                      type="button"
                      title="Align Right"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_right</span>
                    </button>
                    <button
                      type="button"
                      title="Justify"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_justify</span>
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Color dropdowns */}
                    <div className="flex items-center px-1 py-0.5 rounded hover:bg-slate-200 cursor-pointer">
                      <span className="font-bold underline text-xs decoration-red-500">A</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-400 ml-0.5">expand_more</span>
                    </div>
                    <div className="flex items-center px-1 py-0.5 rounded hover:bg-slate-200 cursor-pointer">
                      <span className="material-symbols-outlined text-[15px] text-amber-500">edit</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-400 ml-0.5">expand_more</span>
                    </div>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* More */}
                    <button
                      type="button"
                      title="More options"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={isNoteFullscreen ? 16 : 8}
                    required
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder=""
                    className="w-full p-4 focus:outline-none text-slate-800 text-xs sm:text-sm resize-y leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* Follow-up task & Associated record row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                {/* Left: Create To Do task */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={createFollowUpTask}
                    onChange={(e) => setCreateFollowUpTask(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>
                    Create a <strong className="text-slate-900 font-semibold">To Do</strong> task to follow up
                  </span>
                  <span className="font-bold text-[#0F2962] ml-1">{followUpDateTime}</span>
                </label>

                {/* Right: Associated record */}
                <div className="flex items-center gap-1 text-slate-700 font-medium cursor-pointer hover:text-blue-700">
                  <span>
                    Associated with 1 record <span className="text-rose-500">*</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-slate-500">expand_more</span>
                </div>
              </div>

              {/* Attach File Row */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800">Attach</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition"
                  >
                    <span className="material-symbols-outlined text-[16px] -rotate-45">attach_file</span>
                    <span>Add new</span>
                  </button>
                  {/* Hidden file input supporting multiple files */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                </div>

                {/* List of Attached Files (if any) */}
                {noteAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {noteAttachments.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                        <span className="font-medium max-w-[220px] truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">({file.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.id)}
                          className="text-slate-400 hover:text-rose-500 transition cursor-pointer ml-1 text-xs"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons (Centered as in Image) */}
              <div className="flex items-center justify-center gap-3 pt-3 mt-1">
                <button
                  type="submit"
                  className="px-6 py-1.5 rounded-md bg-[#74879E] hover:bg-[#63768c] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateNoteModal(false);
                    setIsNoteFullscreen(false);
                  }}
                  className="px-6 py-1.5 rounded-md bg-[#626F7D] hover:bg-[#525e6c] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Task Modal (Exact match to uploaded image & Contact Detail) ────────────── */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
              isTaskFullscreen
                ? 'fixed inset-2 max-w-none w-auto h-auto'
                : 'max-w-3xl w-full max-h-[92vh]'
            }`}
          >
            {/* Header: Dark Navy Blue with CREATE TASK and actions */}
            <div className="bg-[#173A75] px-4 py-2.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                <span className="material-symbols-outlined text-[17px]">edit</span>
                <span>CREATE TASK</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskFullscreen(!isTaskFullscreen)}
                  title={isTaskFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isTaskFullscreen ? 'close_fullscreen' : 'crop_free'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    setIsTaskFullscreen(false);
                  }}
                  title="Close"
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddTaskSubmit} className="p-5 flex flex-col gap-3.5 overflow-y-auto">
              {/* Field 1: Name * */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="--"
                    className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-xs text-slate-800"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    edit
                  </span>
                </div>
              </div>

              {/* Row 2: Due Date * & Send remind */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: Due Date * */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        placeholder="09/18/2026"
                        className="w-full px-2.5 py-1.5 pr-8 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                        calendar_month
                      </span>
                    </div>
                    <div className="relative w-28">
                      <input
                        type="text"
                        value={taskDueTime}
                        onChange={(e) => setTaskDueTime(e.target.value)}
                        placeholder="8:00 AM"
                        className="w-full px-2.5 py-1.5 pr-8 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                        schedule
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Send remind */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Send remind</label>
                  <div className="relative">
                    <select
                      value={taskRemind}
                      onChange={(e) => setTaskRemind(e.target.value)}
                      className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="No remind">No remind</option>
                      <option value="At time of due date">At time of due date</option>
                      <option value="15 minutes before">15 minutes before</option>
                      <option value="30 minutes before">30 minutes before</option>
                      <option value="1 hour before">1 hour before</option>
                      <option value="1 day before">1 day before</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Assignee * & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: Assignee * */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Assignee <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">--</option>
                      <option value="Khanh Nguyen (khanhnguyen31@7)">Khanh Nguyen (khanhnguyen31@7)</option>
                      <option value="Anya Nguyen (anya42@9)">Anya Nguyen (anya42@9)</option>
                      <option value="The Best Rate Insurance">The Best Rate Insurance</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Right: Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Priority</label>
                  <div className="relative flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                        taskPriority === 'High'
                          ? 'bg-rose-500'
                          : taskPriority === 'Medium'
                          ? 'bg-amber-500'
                          : taskPriority === 'Low'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full appearance-none bg-transparent focus:outline-none text-xs text-slate-800 cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setTaskPriority('None')}
                      className="text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                      title="Clear priority"
                    >
                      ✕
                    </button>
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Task type */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Task type</label>
                <div className="relative">
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    <option value="To Do">To Do</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Review ACA">Review ACA</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Row 5: Attach & Associated with 1 record */}
              <div className="flex flex-col gap-2 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Attach</span>
                    <button
                      type="button"
                      onClick={() => taskFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition"
                    >
                      <span className="material-symbols-outlined text-[16px] -rotate-45">attach_file</span>
                      <span>Add new</span>
                    </button>
                    <input
                      ref={taskFileInputRef}
                      type="file"
                      multiple
                      onChange={handleTaskFileAttach}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-slate-700 font-medium cursor-pointer hover:text-blue-700">
                    <span>
                      Associated with 1 record <span className="text-rose-500">*</span>
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-500">expand_more</span>
                  </div>
                </div>

                {/* Attached Files List */}
                {taskAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {taskAttachments.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                        <span className="font-medium max-w-[220px] truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">({file.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTaskAttachment(file.id)}
                          className="text-slate-400 hover:text-rose-500 transition cursor-pointer ml-1 text-xs"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Content * */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Content <span className="text-rose-500">*</span>
                </label>

                {/* Editor Container with toolbar */}
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400/30 transition">
                  {/* Toolbar Row */}
                  <div className="bg-[#F8FAFC] border-b border-slate-200 px-2 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 text-xs select-none">
                    {/* Undo / Redo */}
                    <button type="button" title="Undo" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">undo</span>
                    </button>
                    <button type="button" title="Redo" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">redo</span>
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Font Dropdown */}
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 rounded px-2 pr-5 py-0.5 text-xs text-slate-700 hover:border-slate-300 cursor-pointer focus:outline-none">
                        <option>Helvetica</option>
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    {/* Paragraph Dropdown */}
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 rounded px-2 pr-5 py-0.5 text-xs text-slate-700 hover:border-slate-300 cursor-pointer focus:outline-none">
                        <option>Paragraph</option>
                        <option>Heading 1</option>
                        <option>Heading 2</option>
                        <option>Heading 3</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    {/* Font Size */}
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 rounded px-2 pr-5 py-0.5 text-xs text-slate-700 hover:border-slate-300 cursor-pointer focus:outline-none">
                        <option>10pt</option>
                        <option>11pt</option>
                        <option>12pt</option>
                        <option>14pt</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Bold, Italic, Underline */}
                    <button type="button" title="Bold" className="px-1.5 py-0.5 rounded font-bold hover:bg-slate-200 text-slate-800 cursor-pointer">
                      B
                    </button>
                    <button type="button" title="Italic" className="px-1.5 py-0.5 rounded italic font-serif hover:bg-slate-200 text-slate-800 cursor-pointer">
                      I
                    </button>
                    <button type="button" title="Underline" className="px-1.5 py-0.5 rounded underline hover:bg-slate-200 text-slate-800 cursor-pointer">
                      U
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* More */}
                    <button type="button" title="More options" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={isTaskFullscreen ? 14 : 6}
                    value={taskContent}
                    onChange={(e) => setTaskContent(e.target.value)}
                    placeholder=""
                    className="w-full p-4 focus:outline-none text-slate-800 text-xs sm:text-sm resize-y leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* Bottom Action Buttons (Centered as in Image) */}
              <div className="flex items-center justify-center gap-3 pt-2 mt-1">
                <button
                  type="submit"
                  className="px-6 py-1.5 rounded-md bg-[#74879E] hover:bg-[#63768c] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    setIsTaskFullscreen(false);
                  }}
                  className="px-6 py-1.5 rounded-md bg-[#626F7D] hover:bg-[#525e6c] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Stage Change History Modal ────────────────────────────────────── */}
      {showStageHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">history</span>
                <h3 className="text-xs font-bold text-slate-900">Stage Change History</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStageHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-3">
              {stageHistory.map((h, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{h.date}</span>
                    <span className="font-semibold text-slate-700">{h.user}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 pt-0.5">
                    <span className="text-slate-400 line-through truncate max-w-[130px]">{h.from}</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_forward</span>
                    <span className="font-bold text-[#0F2962] truncate max-w-[150px]">{h.to}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStageHistoryModal(false)}
                className="px-4 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
