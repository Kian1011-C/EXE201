import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DEAL_DETAIL_DATA,
  OBAMACARE_DEAL_STAGES,
  MEDICARE_DEAL_STAGES,
  addTicketToStore,
} from '../../../data/mockCrmData';
import { createTicket } from '../../../services/api';
import PropertyHistoryModal, { PropertyLabelWithHistory } from './PropertyHistoryModal';
import {
  recordPropertyUpdate,
  recordPropertyUpdatesBatch,
  getCurrentActor,
} from '../../../services/propertyHistoryService';
import { useAuth } from '../../../auth/AuthContext';

export default function StaffDealDetail({
  deal,
  onBack,
  onSelectContact,
  onSelectCustomerDocument,
  onSelectTicket,
  onSelectTask,
  onUpdateDeal,
}) {
  const { user } = useAuth();
  const currentActor = getCurrentActor(user);
  const dealInfo = deal || DEAL_DETAIL_DATA;

  // State for deal editing
  const [dealTitle, setDealTitle] = useState(
    deal?.title || (deal ? 'Deal mới' : dealInfo.title)
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [pipeline, setPipeline] = useState(deal?.pipeline || dealInfo.pipeline || 'Obamacare 2026');
  const [stage, setStage] = useState(
    deal?.stage || dealInfo.stage || 'Ready to Enroll (Obamacare 2026)'
  );
  const [amount, setAmount] = useState(deal?.amount !== undefined ? deal.amount : (deal ? '_ _ _ _ _ _ _ _ _ _' : dealInfo.amount));
  const [closeDate, setCloseDate] = useState(
    deal?.closeDate !== undefined ? deal.closeDate : (deal ? '_ _ _ _ _ _ _ _ _ _' : dealInfo.closeDate)
  );

  // Stage dropdown & history state (Matching media_1789720398557.png)
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [stageSearchQuery, setStageSearchQuery] = useState('');
  const [showStageHistoryModal, setShowStageHistoryModal] = useState(false);
  const [showPropertyHistoryModal, setShowPropertyHistoryModal] = useState(false);
  const [selectedHistoryField, setSelectedHistoryField] = useState('Broker Effective Date');

  function handleOpenPropertyHistory(fieldName) {
    setSelectedHistoryField(fieldName);
    setShowPropertyHistoryModal(true);
  }
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
      setPrimaryMemberId(deal?.adminOnly?.primaryMemberId || deal?.primaryMemberId || '');
      setCarrier(deal?.adminOnly?.carrier || deal?.carrier || 'BCBS');
      setSellingState(deal?.adminOnly?.sellingState || deal?.sellingState || '--');
      setNumberMember(deal?.adminOnly?.numberMember !== undefined && deal?.adminOnly?.numberMember !== null ? String(deal.adminOnly.numberMember) : (deal?.numberMember || ''));
      setEnrolledNpn(deal?.adminOnly?.enrolledNpn || deal?.enrolledNpn || '');
      setBrokerEffectiveDate(deal?.adminOnly?.brokerEffectiveDate || deal?.brokerEffectiveDate || '');
      setTerminationDate(deal?.adminOnly?.terminationDate || deal?.terminationDate || '');
      setAppId(deal?.applicationId || deal?.appId || '');
      setEstimateHouseholdIncome(deal?.estimateHouseholdIncome || '');
      setHouseholdMember(deal?.householdMember || deal?.householdSize || '');
      setEnrollNumberMember(deal?.numberMember || '');
      setEnrolledAddress(deal?.enrolledAddress || deal?.address || '');
      setQuotedCounty(deal?.quotedCounty || '');
      setIsBackdateDeal(deal?.isBackdateDeal || 'No');
      setPlanName(deal?.planName || '');
      setEnrollAmount(deal?.amount && deal.amount !== '_ _ _ _ _ _ _ _ _ _' ? String(deal.amount).replace('$', '').trim() : '');
      setMonthlyPremium(deal?.monthlyPremium || '');
      setSubsidyAmount(deal?.subsidyAmount || '');
      setAgencyCommission(deal?.agencyCommission || '');
      setBonusTier(deal?.bonusTier || 'Standard Tier');
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
        user: currentActor,
      },
      ...prev,
    ]);

    // Record in Property History
    const dealId = deal?.id || dealInfo.id || 'D26005033';
    recordPropertyUpdate('deal', dealId, 'Stage', oldStage, newStage, currentActor);

    // Log activity in middle timeline
    const newAct = {
      id: 'deal-act-' + Date.now(),
      type: 'Deal Activity',
      time: dateStr,
      actor: currentActor,
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

  // Accordion states
  const [adminOnlyOpen, setAdminOnlyOpen] = useState(false);
  const [readyToEnrollOpen, setReadyToEnrollOpen] = useState(false);
  const [feeBonusPaymentOpen, setFeeBonusPaymentOpen] = useState(false);

  // Form states for ADMIN ONLY
  const [primaryMemberId, setPrimaryMemberId] = useState(
    dealInfo.adminOnly?.primaryMemberId || dealInfo.primaryMemberId || ''
  );
  const [carrier, setCarrier] = useState(dealInfo.adminOnly?.carrier || dealInfo.carrier || 'BCBS');
  const [sellingState, setSellingState] = useState(
    dealInfo.adminOnly?.sellingState || dealInfo.sellingState || '--'
  );
  const [numberMember, setNumberMember] = useState(
    dealInfo.adminOnly?.numberMember !== undefined && dealInfo.adminOnly?.numberMember !== null
      ? String(dealInfo.adminOnly.numberMember)
      : (dealInfo.numberMember || '')
  );
  const [enrolledNpn, setEnrolledNpn] = useState(
    dealInfo.adminOnly?.enrolledNpn || dealInfo.enrolledNpn || ''
  );
  const [brokerEffectiveDate, setBrokerEffectiveDate] = useState(
    dealInfo.adminOnly?.brokerEffectiveDate || dealInfo.brokerEffectiveDate || ''
  );
  const [terminationDate, setTerminationDate] = useState(
    dealInfo.adminOnly?.terminationDate || dealInfo.terminationDate || ''
  );
  const [saleSupportStatus, setSaleSupportStatus] = useState(
    dealInfo.adminOnly?.saleSupportStatus || dealInfo.saleSupportStatus || 'None'
  );
  const [closedLostReason, setClosedLostReason] = useState(
    dealInfo.adminOnly?.closedLostReason || dealInfo.closedLostReason || '---'
  );

  // Form states for READY TO ENROLL (Matching media_1790520741199.png & media_1790520762566.png)
  const [appId, setAppId] = useState(dealInfo.applicationId || dealInfo.appId || '');
  const [estimateHouseholdIncome, setEstimateHouseholdIncome] = useState(
    dealInfo.estimateHouseholdIncome || ''
  );
  const [householdMember, setHouseholdMember] = useState(
    dealInfo.householdMember || dealInfo.householdSize || ''
  );
  const [enrollNumberMember, setEnrollNumberMember] = useState(
    dealInfo.numberMember || ''
  );
  const [enrolledAddress, setEnrolledAddress] = useState(
    dealInfo.enrolledAddress || dealInfo.address || ''
  );
  const [quotedCounty, setQuotedCounty] = useState(dealInfo.quotedCounty || '');
  const [isBackdateDeal, setIsBackdateDeal] = useState(
    dealInfo.isBackdateDeal || 'No'
  );
  const [planName, setPlanName] = useState(
    dealInfo.planName || ''
  );
  const [enrollAmount, setEnrollAmount] = useState(
    dealInfo.amount && dealInfo.amount !== '_ _ _ _ _ _ _ _ _ _' ? String(dealInfo.amount).replace('$', '').trim() : ''
  );
  const [needUpload, setNeedUpload] = useState(
    deal?.needUpload || (deal?.uploadRequest ? 'Yes' : 'No')
  );
  const [dealTickets, setDealTickets] = useState(
    deal?.associatedTickets || deal?.tickets || []
  );

  function handleNeedUploadChange(newVal) {
    setNeedUpload(newVal);
    if (newVal === 'Yes') {
      const uploadTicket = {
        id: `TC2600${Math.floor(1000 + Math.random() * 9000)}`,
        code: `TC2600${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Upload documents - ${dealTitle}`,
        pipeline: 'Upload document',
        stage: 'Waiting on verification',
        status: 'Open',
        priority: 'High',
        category: 'Upload Document',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
        ticketOwner: typeof dealInfo.dealOwner === 'object' ? (dealInfo.dealOwner?.name || 'Khanh Nguyen') : (dealInfo.dealOwner || 'Khanh Nguyen'),
        serviceAgent: 'Platform Staff',
        contactName: dealInfo.contactName || 'Client',
        contactId: dealInfo.contactId || '',
        dealId: dealInfo.id || dealInfo.code || '',
        dealTitle: dealTitle,
        carrier: dealInfo.carrier || 'BCBS',
        createdAt: new Date().toISOString(),
        activities: [],
        comments: [],
      };
      createTicket(uploadTicket).catch(() => {});
      addTicketToStore(uploadTicket);
      const updated = [uploadTicket, ...dealTickets];
      setDealTickets(updated);

      const dateStr = new Date().toLocaleString();
      const newAct = {
        id: 'deal-act-' + Date.now(),
        type: 'Ticket Created',
        time: dateStr,
        actor: currentActor,
        summary: `Tự động xuất ticket: ${uploadTicket.title} (Upload document)`,
        dealId: dealInfo.id,
        dealTitle: dealTitle,
      };
      setActivitiesList((prev) => [newAct, ...prev]);

      const dealId = deal?.id || dealInfo.id || 'D26005033';
      recordPropertyUpdate('deal', dealId, 'Need Upload', deal?.needUpload || 'No', 'Yes', currentActor);

      if (onUpdateDeal) {
        onUpdateDeal({
          ...deal,
          needUpload: 'Yes',
          uploadRequest: true,
          associatedTickets: updated,
        });
      }
      showToast('Đã chọn Need Upload = Yes: Tự động xuất Ticket Upload document!');
    } else {
      const dealId = deal?.id || dealInfo.id || 'D26005033';
      recordPropertyUpdate('deal', dealId, 'Need Upload', deal?.needUpload || 'Yes', 'No', currentActor);

      if (onUpdateDeal) {
        onUpdateDeal({
          ...deal,
          needUpload: 'No',
          uploadRequest: false,
        });
      }
      showToast('Đã chuyển Need Upload = No (Không xuất ticket upload)');
    }
  }

  // Form states for FEE, BONUS, PAYMENT (Defaults to empty if no data)
  const [monthlyPremium, setMonthlyPremium] = useState(
    dealInfo.monthlyPremium || ''
  );
  const [subsidyAmount, setSubsidyAmount] = useState(
    dealInfo.subsidyAmount || ''
  );
  const [agencyCommission, setAgencyCommission] = useState(
    dealInfo.agencyCommission || ''
  );
  const [bonusTier, setBonusTier] = useState(
    dealInfo.bonusTier || ''
  );
  const [paymentOption, setPaymentOption] = useState(
    dealInfo.paymentOption || ''
  );
  const [paymentVerification, setPaymentVerification] = useState(
    dealInfo.paymentVerification || ''
  );

  function handleSaveDealChanges() {
    const updatedDeal = {
      ...(deal || {}),
      title: dealTitle,
      pipeline,
      stage,
      amount: enrollAmount ? `$${enrollAmount}` : amount,
      primaryMemberId,
      carrier,
      sellingState,
      numberMember,
      enrolledNpn,
      brokerEffectiveDate,
      terminationDate,
      saleSupportStatus,
      closedLostReason,
      applicationId: appId,
      estimateHouseholdIncome,
      householdMember,
      enrolledAddress,
      quotedCounty,
      isBackdateDeal,
      planName,
      monthlyPremium,
      subsidyAmount,
      agencyCommission,
      bonusTier,
      paymentOption,
      paymentVerification,
      adminOnly: {
        ...(deal?.adminOnly || {}),
        primaryMemberId,
        carrier,
        sellingState,
        numberMember,
        enrolledNpn,
        brokerEffectiveDate,
        terminationDate,
        saleSupportStatus,
        closedLostReason,
      },
    };
    const dealId = deal?.id || dealInfo.id || 'D26005033';
    const oldAdmin = deal?.adminOnly || dealInfo.adminOnly || {};
    const newAmountStr = enrollAmount ? `$${enrollAmount}` : amount;

    const updates = [
      { fieldName: 'Deal Title', oldValue: deal?.title || dealInfo.title || '', newValue: dealTitle },
      { fieldName: 'Pipeline', oldValue: deal?.pipeline || dealInfo.pipeline || '', newValue: pipeline },
      { fieldName: 'Stage', oldValue: deal?.stage || dealInfo.stage || '', newValue: stage },
      { fieldName: 'Amount', oldValue: deal?.amount !== undefined ? deal.amount : (dealInfo.amount || ''), newValue: newAmountStr },
      { fieldName: 'Carrier', oldValue: deal?.carrier || oldAdmin.carrier || '', newValue: carrier },
      { fieldName: 'Plan Name', oldValue: deal?.planName || '', newValue: planName },
      { fieldName: 'Monthly Premium', oldValue: deal?.monthlyPremium || '', newValue: monthlyPremium },
      { fieldName: 'Subsidy Amount (APTC)', oldValue: deal?.subsidyAmount || '', newValue: subsidyAmount },
      { fieldName: 'Agency Commission', oldValue: deal?.agencyCommission || '', newValue: agencyCommission },
      { fieldName: 'Bonus Tier', oldValue: deal?.bonusTier || '', newValue: bonusTier },
      { fieldName: 'Payment Option', oldValue: deal?.paymentOption || '', newValue: paymentOption },
      { fieldName: 'Payment Verification', oldValue: deal?.paymentVerification || '', newValue: paymentVerification },
      { fieldName: 'Enrolled NPN', oldValue: deal?.enrolledNpn || oldAdmin.enrolledNpn || '', newValue: enrolledNpn },
      { fieldName: 'Broker Effective Date', oldValue: deal?.brokerEffectiveDate || oldAdmin.brokerEffectiveDate || '', newValue: brokerEffectiveDate },
      { fieldName: 'Termination Date', oldValue: deal?.terminationDate || oldAdmin.terminationDate || '', newValue: terminationDate },
      { fieldName: 'Sale Support Status', oldValue: deal?.saleSupportStatus || oldAdmin.saleSupportStatus || '', newValue: saleSupportStatus },
      { fieldName: 'Closed Lost Reason', oldValue: deal?.closedLostReason || oldAdmin.closedLostReason || '', newValue: closedLostReason },
      { fieldName: 'Application ID', oldValue: deal?.applicationId || '', newValue: appId },
      { fieldName: 'Estimate Household Income', oldValue: deal?.estimateHouseholdIncome || deal?.estimateIncome || '', newValue: estimateHouseholdIncome },
      { fieldName: 'Household Member', oldValue: deal?.householdMember || '', newValue: householdMember },
      { fieldName: 'Number Member', oldValue: deal?.numberMember || '', newValue: numberMember },
      { fieldName: 'Enrolled Address', oldValue: deal?.enrolledAddress || '', newValue: enrolledAddress },
      { fieldName: 'Quoted county', oldValue: deal?.quotedCounty || '', newValue: quotedCounty },
      { fieldName: 'Is this a backdate deal?', oldValue: deal?.isBackdateDeal || '', newValue: isBackdateDeal },
      { fieldName: 'Selling State', oldValue: deal?.sellingState || oldAdmin.sellingState || '', newValue: sellingState },
      { fieldName: 'Primary Member Id', oldValue: deal?.primaryMemberId || oldAdmin.primaryMemberId || '', newValue: primaryMemberId },
    ];

    recordPropertyUpdatesBatch('deal', dealId, updates, currentActor);

    if (onUpdateDeal) {
      onUpdateDeal(updatedDeal);
    }
    showToast('Đã lưu thông tin Deal thành công!');
  }

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
    const oldSss = saleSupportStatus;
    setSaleSupportStatus(newSss);
    const dealId = deal?.id || dealInfo.id || 'D26005033';
    recordPropertyUpdate('deal', dealId, 'Sale Support Status', oldSss, newSss, currentActor);
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

        {/* Right: Save Deal Info | View history | Refresh */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            onClick={handleSaveDealChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Deal Info</span>
          </button>
          <span className="h-3.5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => handleOpenPropertyHistory('All')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 transition cursor-pointer font-medium"
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
                    <PropertyLabelWithHistory
                      label="Enrolled NPN"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={enrolledNpn}
                        onChange={(e) => setEnrolledNpn(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                      >
                        <option value="">-- Chưa chọn NPN --</option>
                        <option value="Anh Que Pham 20011862">Anh Que Pham 20011862</option>
                        <option value="Trono Truong 19823412">Trono Truong 19823412</option>
                        <option value="Nancy Pham 20491823">Nancy Pham 20491823</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {enrolledNpn && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setEnrolledNpn('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa Enrolled NPN"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Broker Effective Date */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Broker Effective Date"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={brokerEffectiveDate}
                        onChange={(e) => setBrokerEffectiveDate(e.target.value)}
                        className="w-full pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                      {brokerEffectiveDate && (
                        <button
                          type="button"
                          onClick={() => setBrokerEffectiveDate('')}
                          className="absolute right-8 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa ngày active"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Termination Date */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Termination Date"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={terminationDate}
                        onChange={(e) => setTerminationDate(e.target.value)}
                        className="w-full pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                      {terminationDate && (
                        <button
                          type="button"
                          onClick={() => setTerminationDate('')}
                          className="absolute right-8 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa ngày term"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lead Owner */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Lead Owner"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800">
                      <div className="w-4 h-4 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        KN
                      </div>
                      <span className="truncate">{dealInfo.adminOnly?.leadOwner || 'Khanh Nguyen (khanhnguyen31@7)'}</span>
                    </div>
                  </div>

                  {/* Deal Owner* */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Deal Owner"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
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

                  {/* Code */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Code"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <input
                      type="text"
                      readOnly
                      value={dealInfo.adminOnly?.code || 'D26005033'}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-100 font-mono text-xs text-slate-700"
                    />
                  </div>

                  {/* Primary Member Id */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Primary Member Id"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={primaryMemberId}
                        onChange={(e) => setPrimaryMemberId(e.target.value)}
                        placeholder="e.g. MID-98234710"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      {primaryMemberId && (
                        <button
                          type="button"
                          onClick={() => setPrimaryMemberId('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sale Support Status */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Sale Support Status"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="flex items-center justify-between mb-1 -mt-0.5">
                      <span className="text-[10px] font-bold text-blue-600">
                        {saleSupportStatus === 'None' || saleSupportStatus === 'NONE'
                          ? '7/3 Split (Agent 70% / Platform 30%)'
                          : saleSupportStatus === 'Partial' || saleSupportStatus === 'PARTIAL'
                          ? '5/5 Split (Agent 50% / Platform 50%)'
                          : saleSupportStatus === 'Full' || saleSupportStatus === 'FULL'
                          ? '3/7 Split (Agent 30% / Platform 70%)'
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
                    <PropertyLabelWithHistory
                      label="Number Member"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={numberMember}
                        onChange={(e) => setNumberMember(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500"
                      />
                      {numberMember && (
                        <button
                          type="button"
                          onClick={() => setNumberMember('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selling State* */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Selling State"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={sellingState}
                        onChange={(e) => setSellingState(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Chưa chọn State --</option>
                        <option value="North Carolina (NC)">North Carolina (NC)</option>
                        <option value="Texas (TX)">Texas (TX)</option>
                        <option value="California (CA)">California (CA)</option>
                        <option value="Georgia (GA)">Georgia (GA)</option>
                        <option value="Florida (FL)">Florida (FL)</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {sellingState && sellingState !== '--' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSellingState('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa Selling State"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Carrier* */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Carrier"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-bold text-blue-700 cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Chưa chọn Carrier --</option>
                        <option value="BCBS">BCBS</option>
                        <option value="Ambetter">Ambetter</option>
                        <option value="Oscar">Oscar</option>
                        <option value="UnitedHealthcare">UnitedHealthcare</option>
                        <option value="Molina Healthcare">Molina Healthcare</option>
                        <option value="Aetna">Aetna</option>
                        <option value="Cigna">Cigna</option>
                        <option value="Kaiser">Kaiser</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {carrier && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setCarrier('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa Carrier"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Closed Lost Reason */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Closed Lost Reason"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={closedLostReason}
                        onChange={(e) => setClosedLostReason(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">---</option>
                        <option value="Price too high">Price too high</option>
                        <option value="Chose competitor">Chose competitor</option>
                        <option value="Not eligible">Not eligible</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {closedLostReason && closedLostReason !== '---' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setClosedLostReason('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>



            {/* 3. READY TO ENROLL */}
            <div>
              <button
                type="button"
                onClick={() => setReadyToEnrollOpen(!readyToEnrollOpen)}
                className="w-full py-2.5 px-4 flex items-center gap-2 text-left font-bold text-xs text-[#0F2962] hover:bg-slate-50 hover:text-blue-700 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                  {readyToEnrollOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Ready to Enroll</span>
              </button>

              {readyToEnrollOpen && (
                <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  {/* 1. Application ID */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Application ID"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder="e.g. 8282407051"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      {appId && (
                        <button
                          type="button"
                          onClick={() => setAppId('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Estimate Household Income */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Estimate Household Income"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={estimateHouseholdIncome}
                        onChange={(e) => setEstimateHouseholdIncome(e.target.value)}
                        placeholder="e.g. $17,000"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      {estimateHouseholdIncome && (
                        <button
                          type="button"
                          onClick={() => setEstimateHouseholdIncome('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Household Member */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Household Member"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={householdMember}
                        onChange={(e) => setHouseholdMember(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      {householdMember && (
                        <button
                          type="button"
                          onClick={() => setHouseholdMember('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. Number Member */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Number Member"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={enrollNumberMember}
                        onChange={(e) => setEnrollNumberMember(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                        {enrollNumberMember && (
                          <button
                            type="button"
                            onClick={() => setEnrollNumberMember('')}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200" />
                        <span className="text-[12px] font-bold text-slate-600 font-mono">#</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Enrolled Address */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Enrolled Address"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={enrolledAddress}
                        onChange={(e) => setEnrolledAddress(e.target.value)}
                        placeholder="e.g. 6300 Chickasaw, Midland, TX, 79705"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      {enrolledAddress && (
                        <button
                          type="button"
                          onClick={() => setEnrolledAddress('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 6. Quoted county */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Quoted county"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={quotedCounty}
                        onChange={(e) => setQuotedCounty(e.target.value)}
                        placeholder="e.g. Midland"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      {quotedCounty && (
                        <button
                          type="button"
                          onClick={() => setQuotedCounty('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 7. Is this a backdate deal? */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Is this a backdate deal?"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={isBackdateDeal}
                        onChange={(e) => setIsBackdateDeal(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <span className="h-3.5 w-px bg-slate-200 mr-1.5" />
                        <span className="material-symbols-outlined text-[15px] text-[#0F2962]">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 8. Carrier */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Carrier"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">-- Chưa chọn Carrier --</option>
                        <option value="BCBS">BCBS</option>
                        <option value="Ambetter">Ambetter</option>
                        <option value="Oscar">Oscar</option>
                        <option value="UnitedHealthcare">UnitedHealthcare</option>
                        <option value="Molina Healthcare">Molina Healthcare</option>
                        <option value="Aetna">Aetna</option>
                        <option value="Cigna">Cigna</option>
                        <option value="Kaiser">Kaiser</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {carrier && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setCarrier('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa Carrier"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[15px] text-[#0F2962] pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 9. Plan Name */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Plan Name"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="e.g. Blue Advantage Bronze"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      {planName && (
                        <button
                          type="button"
                          onClick={() => setPlanName('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 10. Amount */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Amount"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={enrollAmount}
                        onChange={(e) => setEnrollAmount(e.target.value)}
                        placeholder="e.g. 36.55"
                        className="w-full pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                        {enrollAmount && (
                          <button
                            type="button"
                            onClick={() => setEnrollAmount('')}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200" />
                        <span className="text-[12px] font-bold text-slate-600 font-mono">#</span>
                      </div>
                    </div>
                  </div>

                  {/* 11. Need Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <PropertyLabelWithHistory
                        label="Need Upload"
                        required
                        onOpenHistory={handleOpenPropertyHistory}
                        className="flex-1 !mb-0"
                      />
                      {needUpload === 'Yes' && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 ml-2">
                          ⚡ Đã xuất Ticket Upload
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={needUpload}
                        onChange={(e) => handleNeedUploadChange(e.target.value)}
                        className={`w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border text-xs cursor-pointer font-medium transition ${
                          needUpload === 'Yes'
                            ? 'border-amber-400 bg-amber-50 text-amber-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <option value="No">No (Không xuất ticket upload)</option>
                        <option value="Yes">Yes (Tự động xuất ticket Upload document)</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <span className="h-3.5 w-px bg-slate-200 mr-1.5" />
                        <span className="material-symbols-outlined text-[15px] text-[#0F2962]">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {needUpload === 'Yes'
                        ? '⚡ Khi chọn Yes, hệ thống tự động xuất 1 Ticket Upload document trong danh sách Tickets.'
                        : '✓ Không xuất ticket upload tài liệu.'}
                    </p>
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
                    <PropertyLabelWithHistory
                      label="Monthly Premium"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={monthlyPremium}
                        onChange={(e) => setMonthlyPremium(e.target.value)}
                        placeholder="e.g. $0.00"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      {monthlyPremium && (
                        <button
                          type="button"
                          onClick={() => setMonthlyPremium('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <PropertyLabelWithHistory
                      label="Subsidy Amount (APTC)"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={subsidyAmount}
                        onChange={(e) => setSubsidyAmount(e.target.value)}
                        placeholder="e.g. $485.00"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      {subsidyAmount && (
                        <button
                          type="button"
                          onClick={() => setSubsidyAmount('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <PropertyLabelWithHistory
                      label="Agency Commission"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={agencyCommission}
                        onChange={(e) => setAgencyCommission(e.target.value)}
                        placeholder="e.g. $25.00"
                        className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      {agencyCommission && (
                        <button
                          type="button"
                          onClick={() => setAgencyCommission('')}
                          className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <PropertyLabelWithHistory
                      label="Bonus Tier"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={bonusTier}
                        onChange={(e) => setBonusTier(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Chưa chọn Bonus Tier --</option>
                        <option value="Standard Tier">Standard Tier</option>
                        <option value="Tier 1 Bonus ($50)">Tier 1 Bonus ($50)</option>
                        <option value="Tier 2 Bonus ($100)">Tier 2 Bonus ($100)</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {bonusTier && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setBonusTier('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <PropertyLabelWithHistory
                      label="Payment Option"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={paymentOption}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Chưa chọn Payment Option --</option>
                        <option value="EFT Auto-pay">EFT Auto-pay</option>
                        <option value="Direct Carrier Pay">Direct Carrier Pay</option>
                        <option value="Credit / Debit Card">Credit / Debit Card</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {paymentOption && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentOption('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <PropertyLabelWithHistory
                      label="Payment Verification"
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={paymentVerification}
                        onChange={(e) => setPaymentVerification(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Chưa chọn trạng thái --</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Failed">Failed</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {paymentVerification && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentVerification('');
                            }}
                            className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        )}
                        <span className="h-3 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
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

          {/* Card 2: Tickets ───────────────────────────────────────── */}
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
                <span>Tickets ({dealTickets.length})</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => showToast('Để tạo Ticket Upload: Chọn Need Upload = Yes')}
                  title="Thêm ticket"
                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Đang làm mới danh sách Ticket...')}
                  title="Refresh"
                  className="hover:text-blue-600 p-0.5 rounded cursor-pointer text-slate-500"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {rightTicketsOpen && (
              <div className="p-3 space-y-3">
                {dealTickets.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <span className="material-symbols-outlined text-[28px] text-slate-300 block mb-1">confirmation_number</span>
                    <p className="text-xs font-semibold text-slate-600">Chưa có ticket nào</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      ⚡ Chọn mục <strong>Need Upload = Yes</strong> ở cột trái để tự động xuất Ticket Upload document.
                    </p>
                  </div>
                ) : (
                  dealTickets.map((associatedTicket) => (
                    <div key={associatedTicket.id || associatedTicket.code || Math.random()} className="space-y-1">
                      <div
                        onClick={() => onSelectTicket && onSelectTicket(associatedTicket)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                      >
                        {/* Title row with badge */}
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${associatedTicket.pipeline === 'Upload document' ? 'bg-amber-500' : 'bg-[#52B4C9]'} text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition`}>
                            <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                          </div>
                          <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs truncate">
                            {associatedTicket.title}
                          </span>
                        </div>

                        {/* Properties list with icons */}
                        <div className="space-y-1.5 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">bar_chart</span>
                            <span className="text-slate-500">Pipeline:</span>
                            <span className="font-semibold text-slate-800">{associatedTicket.pipeline}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">trending_up</span>
                            <span className="text-slate-500">Ticket Status:</span>
                            <span className="font-semibold text-slate-800">{associatedTicket.status || associatedTicket.stage}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                            <span className="text-slate-500">Ticket Owner:</span>
                            <span className="font-semibold text-slate-800">
                              {typeof associatedTicket.ticketOwner === 'object'
                                ? associatedTicket.ticketOwner?.name || 'Agent'
                                : (associatedTicket.ticketOwner || 'Agent')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                            <span className="text-slate-500">Due Date:</span>
                            <span className="text-slate-700 font-medium">
                              {associatedTicket.dueDate || '----------'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Link */}
                      <button
                        type="button"
                        onClick={() => onSelectTicket && onSelectTicket(associatedTicket)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer pl-0.5"
                      >
                        » View Associated Ticket
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Note Modal (Exact match to uploaded image & Contact Detail) ────────────── */}
      {showCreateNoteModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 my-auto ${
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
        </div>,
        document.body
      )}

      {/* ── Create Task Modal (Exact match to uploaded image & Contact Detail) ────────────── */}
      {showCreateTaskModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 my-auto ${
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
        </div>,
        document.body
      )}

      {/* ── Stage Change History Modal ────────────────────────────────────── */}
      {showStageHistoryModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-auto">
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
        </div>,
        document.body
      )}

      {/* ── Property History Modal Matching media_1790590629171.png ──────── */}
      <PropertyHistoryModal
        isOpen={showPropertyHistoryModal}
        onClose={() => setShowPropertyHistoryModal(false)}
        initialFieldName={selectedHistoryField}
        entityType="deal"
        entityId={deal?.id || dealInfo.id || 'D26005033'}
        entityName={dealTitle || deal?.title || 'Deal'}
        entityData={{
          ...deal,
          title: dealTitle,
          pipeline,
          stage,
          brokerEffectiveDate,
          enrolledNpn,
          terminationDate,
          carrier,
          planName,
          applicationId: appId,
          estimateHouseholdIncome,
          estimateIncome: estimateHouseholdIncome,
          householdMember,
          numberMember,
          enrolledAddress,
          quotedCounty,
          isBackdateDeal,
          sellingState,
          amount: enrollAmount ? `$${enrollAmount}` : amount,
          monthlyPremium,
          subsidyAmount,
          agencyCommission,
          bonusTier,
          paymentOption,
          paymentVerification,
          saleSupportStatus,
          closedLostReason,
          primaryMemberId,
        }}
        availableFields={[
          'Enrolled NPN',
          'Broker Effective Date',
          'Termination Date',
          'Lead Owner',
          'Deal Owner',
          'Code',
          'Primary Member Id',
          'Sale Support Status',
          'Number Member',
          'Selling State',
          'Carrier',
          'Closed Lost Reason',
          'Application ID',
          'Estimate Household Income',
          'Household Member',
          'Enrolled Address',
          'Quoted county',
          'Is this a backdate deal?',
          'Plan Name',
          'Amount',
          'Need Upload',
          'Monthly Premium',
          'Subsidy Amount (APTC)',
          'Agency Commission',
          'Bonus Tier',
          'Payment Option',
          'Payment Verification',
        ]}
      />
    </div>
  );
}
