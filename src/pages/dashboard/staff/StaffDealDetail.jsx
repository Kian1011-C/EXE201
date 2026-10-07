import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { createTicket, updateDeal, updateDealStage, getUsers, getAdminAccounts, createTask, updateTask, addDealNote } from '../../../services/api';
import InAppFilePreviewModal from '../../../components/InAppFilePreviewModal';
import PropertyHistoryModal, { PropertyLabelWithHistory } from './PropertyHistoryModal';
import {
  recordPropertyUpdate,
  recordPropertyUpdatesBatch,
  getCurrentActor,
} from '../../../services/propertyHistoryService';
import { useAuth } from '../../../auth/AuthContext';
import toast from 'react-hot-toast';
import {
  ALL_CARRIERS,
  OBAMACARE_DEAL_STAGES,
  MEDICARE_DEAL_STAGES,
  CARRIER_COMMISSION_RATES,
  getActiveAgentAccounts,
} from '../../../utils/constants';

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
  const dealInfo = deal || {};

  // State for deal editing
  const [dealTitle, setDealTitle] = useState(
    deal?.title || (deal ? 'Deal mới' : dealInfo.title || 'Deal mới')
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [pipeline, setPipeline] = useState(deal?.pipeline || dealInfo.pipeline || 'Obamacare 2026');
  const [stage, setStage] = useState(
    deal?.stage || dealInfo.stage || 'Ready to Enroll (Obamacare 2026)'
  );
  const [amount, setAmount] = useState(deal?.amount !== undefined ? deal.amount : (deal ? '_ _ _ _ _ _ _ _ _ _' : dealInfo.amount || '_ _ _ _ _ _ _ _ _ _'));
  const [closeDate, setCloseDate] = useState(
    deal?.closeDate !== undefined ? deal.closeDate : (deal ? '_ _ _ _ _ _ _ _ _ _' : dealInfo.closeDate || '_ _ _ _ _ _ _ _ _ _')
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
  const [stageHistory, setStageHistory] = useState(dealInfo.stageHistory || []);
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

      // Merge dynamic tasks store with deal.tasks to prevent task loss when navigating
      const dId = String(nextId || deal?.code || dealInfo.code || '');
      const dTitle = String(deal?.title || dealInfo.title || '')?.trim()?.toLowerCase();
      const dynamicTasks = typeof window !== 'undefined' ? [] : [];
      const storeDealTasks = dynamicTasks?.filter(
        (t) =>
          (dId && (String(t.dealId) === dId || String(t.deal?.id) === dId || String(t.deal?.code) === dId)) ||
          (dTitle && t.dealName && String(t.dealName)?.trim()?.toLowerCase() === dTitle)
      );
      const existingTasks = Array.isArray(deal?.tasks) ? deal.tasks : (dealInfo.tasks || []);
      const mergedTasks = [
        ...storeDealTasks,
        ...(existingTasks || []).filter((et) => !storeDealTasks?.some((st) => String(st.id) === String(et.id))),
      ];
      setTasksList(mergedTasks);

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
      setEnrollAmount(deal?.amount && deal.amount !== '_ _ _ _ _ _ _ _ _ _' ? String(deal.amount)?.replace('$', '')?.trim() : '');
      setMonthlyPremium(deal?.monthlyPremium || '');
      setSubsidyAmount(deal?.subsidyAmount || '');
      setAgencyCommission(deal?.agencyCommission || '');
      setBonusTier(deal?.bonusTier || 'Standard Tier');
      const ownerVal = typeof deal?.dealOwner === 'object'
        ? (deal?.dealOwner?.name || deal?.dealOwner?.fullName || '')
        : (deal?.dealOwner || deal?.adminOnly?.dealOwner || '');
      if (ownerVal) setDealOwner(ownerVal);
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

  const filteredStages = currentPipelineStages?.filter((st) =>
    st?.toLowerCase().includes(stageSearchQuery?.toLowerCase()?.trim())
  );

  function handleSelectStage(newStage, overridePipeline) {
    const activePipeline = overridePipeline || pipeline;
    if (newStage === stage && !overridePipeline) {
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
    const dealId = deal?.id || dealInfo.id || '';
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

    const updatedDeal = {
      ...dealInfo,
      ...(deal || {}),
      title: dealTitle,
      dealName: dealTitle,
      pipeline: activePipeline,
      stage: newStage,
      dealStage: newStage,
      activities: updatedActivities,
      notes: notesList,
      tasks: tasksList,
    };

    if (onUpdateDeal) {
      onUpdateDeal(updatedDeal);
    }

    if (dealId) {
      updateDealStage(dealId, newStage, currentActor).catch(() => {
        updateDeal(dealId, updatedDeal).catch(() => null);
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
    handleSelectStage(defaultStage, newPipeline);
    showToast(`Pipeline changed to ${newPipeline}`);
  }

  // Left sidebar collapse state
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  // Accordion states
  const [adminOnlyOpen, setAdminOnlyOpen] = useState(false);
  const [readyToEnrollOpen, setReadyToEnrollOpen] = useState(false);
  const [feeBonusPaymentOpen, setFeeBonusPaymentOpen] = useState(false);

  // Dynamic DB users for dynamic agent roster (Tất cả agent hiện tại)
  const [agentAccounts, setAgentAccounts] = useState(() => getActiveAgentAccounts());

  useEffect(() => {
    function handleAccountsUpdated() {
      setAgentAccounts(getActiveAgentAccounts());
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  useEffect(() => {
    getUsers().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const backendAgents = data?.filter((u) => {
          const role = (u.role || '')?.toLowerCase();
          const status = (u.status || '')?.toLowerCase();
          return (role === 'agent' || role === 'broker') && status !== 'suspended';
        });
        if (backendAgents.length > 0) {
          setAgentAccounts(
            backendAgents?.map((b) => ({
              id: String(b.id),
              name: b.name || `${b.firstName || ''} ${b.lastName || ''}`?.trim(),
              role: 'agent',
              avatar: b.avatar,
              bg: b.bg,
              email: b.email,
              phone: b.phone,
            }))
          );
        } else {
          setAgentAccounts(getActiveAgentAccounts());
        }
      }
    }).catch(() => {});
  }, []);

  const allAvailableAgents = useMemo(() => {
    const list = agentAccounts?.map((a) => ({
      name: a.name,
      handle: a.handle || a.email?.split('@')[0],
      avatar: a.avatar || a.name.slice(0, 2).toUpperCase(),
      bg: a.bg || 'bg-[#2563EB]',
    }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [agentAccounts]);

  // Form states for ADMIN ONLY
  const initialDealOwner = typeof dealInfo.dealOwner === 'object'
    ? (dealInfo.dealOwner?.name || dealInfo.dealOwner?.fullName || '')
    : (dealInfo.dealOwner || dealInfo.adminOnly?.dealOwner || '');
  const [dealOwner, setDealOwner] = useState(initialDealOwner);

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

  const enrolledNpnOptions = useMemo(() => {
    const baseline = [
      'Anh Que Pham 20011862',
      'Trono Truong 19823412',
      'Nancy Pham 20491823',
      '',
      'Sean Ngo 1994321',
      'Ivy Le PENDING_CDI_092',
      'James Vu 1854201',
    ];

    const fromAgents = agentAccounts?.map((a) => {
      const npnStr = a.npn ? ` ${a.npn}` : '';
      return `${a.name}${npnStr}`?.trim();
    });

    const combined = [...fromAgents, ...baseline];
    if (enrolledNpn && enrolledNpn?.trim()) {
      combined.unshift(enrolledNpn?.trim());
    }

    const seen = new Set();
    return combined?.filter((item) => {
      if (!item || seen.has(item?.toLowerCase())) return false;
      seen.add(item?.toLowerCase());
      return true;
    });
  }, [agentAccounts, enrolledNpn]);

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
    dealInfo.amount && dealInfo.amount !== '_ _ _ _ _ _ _ _ _ _' ? String(dealInfo.amount)?.replace('$', '')?.trim() : ''
  );
  const [needUpload, setNeedUpload] = useState(
    deal?.needUpload || (deal?.uploadRequest ? 'Yes' : 'No')
  );
  const [dealTickets, setDealTickets] = useState(
    deal?.associatedTickets || deal?.tickets || []
  );

  const handleOpenTicket = (ticketItem) => {
    if (!ticketItem) return;
    const enriched = {
      ...ticketItem,
      id: ticketItem.id || ticketItem.code,
      code: ticketItem.code || ticketItem.id,
      title: ticketItem.title || `Upload documents - ${dealTitle}`,
      pipeline: ticketItem.pipeline || 'Upload document',
      contactName: ticketItem.contactName || dealInfo.contactName || deal?.contactName || '',
      contactId: ticketItem.contactId || dealInfo.contactId || deal?.contactId || '',
      contactPhone: ticketItem.contactPhone || dealInfo.contactPhone || deal?.contactPhone || '',
      contactEmail: ticketItem.contactEmail || dealInfo.contactEmail || deal?.contactEmail || '',
      leadOwner: ticketItem.leadOwner || (typeof dealInfo.dealOwner === 'object' ? dealInfo.dealOwner?.name : dealInfo.dealOwner) || '',
      carrier: ticketItem.carrier || dealInfo.carrier || deal?.carrier || '',
      dealTitle: ticketItem.dealTitle || dealTitle,
      dealId: ticketItem.dealId || dealInfo.id || dealInfo.code || '',
      ticketOwner: ticketItem.ticketOwner || (typeof dealInfo.dealOwner === 'object' ? dealInfo.dealOwner?.name : dealInfo.dealOwner) || '',
      serviceAgent: ticketItem.serviceAgent || 'Platform Staff',
      status: ticketItem.status || ticketItem.stage || 'Open',
    };
    null;
    if (onSelectTicket) {
      onSelectTicket(enriched);
    }
  };

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
        ticketOwner: typeof dealInfo.dealOwner === 'object' ? (dealInfo.dealOwner?.name || '') : (dealInfo.dealOwner || ''),
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
      null;
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

      const dealId = deal?.id || dealInfo.id || '';
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
      const dealId = deal?.id || dealInfo.id || '';
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

  // Form states for FEE, BONUS, PAYMENT (Matching Image 1)
  const [paymentStatus, setPaymentStatus] = useState(dealInfo.paymentStatus || '');
  const [payThroughDate, setPayThroughDate] = useState(dealInfo.payThroughDate || '');
  const [quoteCloseDealRep, setQuoteCloseDealRep] = useState(dealInfo.quoteCloseDealRep || '');
  const [autopayDate, setAutopayDate] = useState(dealInfo.autopayDate || '');
  const [nameOnCreditCard, setNameOnCreditCard] = useState(dealInfo.nameOnCreditCard || '');
  const [creditCardNumber, setCreditCardNumber] = useState(dealInfo.creditCardNumber || '');
  const [expirationDate, setExpirationDate] = useState(dealInfo.expirationDate || '');
  const [cvv, setCvv] = useState(dealInfo.cvv || '');
  const [monthlyPremium, setMonthlyPremium] = useState(dealInfo.monthlyPremium || '');
  const [subsidyAmount, setSubsidyAmount] = useState(dealInfo.subsidyAmount || '');
  const [agencyCommission, setAgencyCommission] = useState(dealInfo.agencyCommission || '');
  const [bonusTier, setBonusTier] = useState(dealInfo.bonusTier || 'Standard Tier');
  const [paymentOption, setPaymentOption] = useState(dealInfo.paymentOption || '');
  const [paymentVerification, setPaymentVerification] = useState(dealInfo.paymentVerification || '');

  // Dynamically resolve contact linked to this deal with latest deal stage & properties
  const resolvedContact = useMemo(() => {
    let base = null;
    if (dealInfo.contact && typeof dealInfo.contact === 'object') {
      const c = dealInfo.contact;
      if (c.fullName || c.name || c.id || c.phone || c.email) {
        base = {
          id: c.id || dealInfo.contactId || '',
          fullName: c.fullName || c.name || dealInfo.contactName || '',
          phone: c.phone || dealInfo.contactPhone || '',
          email: c.email || dealInfo.contactEmail || '',
          ...c,
        };
      }
    }

    const cId = String(
      dealInfo.contactId || (typeof dealInfo.contact === 'string' ? dealInfo.contact : '') || ''
    )?.trim();
    const cName = String(dealInfo.contactName || '')?.trim();

    if (!base && (cId || cName)) {
      const allContacts = [];
      const found = allContacts.find(
        (c) =>
          (cId && (String(c.id) === cId || String(c.code) === cId)) ||
          (cName && c.fullName && c.fullName?.trim()?.toLowerCase() === cName?.toLowerCase())
      );
      if (found) {
        base = {
          id: found.id || found.code || cId,
          fullName:
            found.fullName ||
            `${found.firstName || ''} ${found.lastName || ''}`?.trim() ||
            cName,
          phone: found.phone || found.contactFields?.phonePrimary || dealInfo.contactPhone || '',
          email: found.email || found.contactFields?.emailPrimary || dealInfo.contactEmail || '',
          ...found,
        };
      } else if (cName) {
        base = {
          id: cId || '',
          fullName: cName,
          phone: dealInfo.contactPhone || '',
          email: dealInfo.contactEmail || '',
        };
      }
    }

    if (!base) return null;

    const currentDealItem = {
      ...dealInfo,
      ...(deal || {}),
      id: deal?.id || dealInfo.id || deal?.code || dealInfo.code,
      code: deal?.code || dealInfo.code || deal?.id || dealInfo.id,
      title: dealTitle || deal?.title || dealInfo.title || 'Deal',
      dealName: dealTitle || deal?.title || dealInfo.title || 'Deal',
      pipeline: pipeline || deal?.pipeline || dealInfo.pipeline || 'Obamacare 2026',
      stage: stage || deal?.stage || dealInfo.stage || 'Ready to Enroll (Obamacare 2026)',
      dealStage: stage || deal?.dealStage || dealInfo.dealStage || 'Ready to Enroll (Obamacare 2026)',
      amount: enrollAmount ? `$${enrollAmount}` : amount,
      contactId: base.id || dealInfo.contactId || '',
      contactName: base.fullName || dealInfo.contactName || '',
    };
    const existingDeals = Array.isArray(base.associatedDeals)
      ? base.associatedDeals
      : (Array.isArray(base.deals) ? base.deals : []);
    const filteredDeals = existingDeals?.filter(
      (d) => (d.id || d.code) !== currentDealItem.id
    );
    const updatedDeals = [currentDealItem, ...filteredDeals];

    return {
      ...base,
      associatedDeals: updatedDeals,
      deals: updatedDeals,
    };
  }, [dealInfo, deal, stage, pipeline, dealTitle, enrollAmount, amount]);

  // Auto-save states for deal details
  const [dealSaveStatus, setDealSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const autoSaveDealTimerRef = useRef(null);
  const handleSaveDealChangesRef = useRef(null);
  const isDealInitialMountRef = useRef(true);
  const lastSavedDealJsonRef = useRef('');

  function handleSaveDealChanges(options = {}) {
    const { isAutoSave = false } = options;
    const updatedDeal = {
      ...(deal || {}),
      dealOwner: dealOwner ? { name: dealOwner } : deal?.dealOwner,
      title: dealTitle,
      dealName: dealTitle,
      pipeline,
      stage,
      dealStage: stage,
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
        dealOwner,
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
    const dealId = deal?.id || dealInfo.id || '';
    const oldAdmin = deal?.adminOnly || dealInfo.adminOnly || {};
    const newAmountStr = enrollAmount ? `$${enrollAmount}` : amount;

    const updates = [
      { fieldName: 'Deal Title', oldValue: deal?.title || dealInfo.title || '', newValue: dealTitle },
      { fieldName: 'Deal Owner', oldValue: deal?.dealOwner?.name || deal?.adminOnly?.dealOwner || dealInfo.adminOnly?.dealOwner || '', newValue: dealOwner },
      { fieldName: 'Pipeline', oldValue: deal?.pipeline || dealInfo.pipeline || '', newValue: pipeline },
      { fieldName: 'Stage', oldValue: deal?.stage || dealInfo.stage || '', newValue: stage },
      { fieldName: 'Amount', oldValue: deal?.amount !== undefined ? deal.amount : (dealInfo.amount || ''), newValue: newAmountStr },
      { fieldName: 'Carrier', oldValue: deal?.carrier || oldAdmin.carrier || '', newValue: carrier },
      { fieldName: 'Payment Status', oldValue: deal?.paymentStatus || '', newValue: paymentStatus },
      { fieldName: 'Pay Through Date', oldValue: deal?.payThroughDate || '', newValue: payThroughDate },
      { fieldName: 'Quote Close Deal Rep', oldValue: deal?.quoteCloseDealRep || '', newValue: quoteCloseDealRep },
      { fieldName: 'Autopay Date', oldValue: deal?.autopayDate || '', newValue: autopayDate },
      { fieldName: 'Name On Credit Card', oldValue: deal?.nameOnCreditCard || '', newValue: nameOnCreditCard },
      { fieldName: 'Credit Card Number', oldValue: deal?.creditCardNumber || '', newValue: creditCardNumber },
      { fieldName: 'Expiration Date', oldValue: deal?.expirationDate || '', newValue: expirationDate },
      { fieldName: 'CVV', oldValue: deal?.cvv || '', newValue: cvv },
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
    null;

    if (deal?.id) {
      updateDeal(deal.id, updatedDeal).catch(() => null);
    }

    null;

    if (onUpdateDeal) {
      onUpdateDeal(updatedDeal);
    }

    if (!isAutoSave) {
      showToast('Đã lưu thông tin Deal thành công!');
    }
  }

  handleSaveDealChangesRef.current = handleSaveDealChanges;

  // Current snapshot for debounced auto-save
  const currentDealSnapshot = useMemo(() => {
    return JSON.stringify({
      dealTitle: String(dealTitle || '')?.trim(),
      dealOwner: String(typeof dealOwner === 'object' ? dealOwner?.name || '' : dealOwner || '')?.trim(),
      pipeline: String(pipeline || '')?.trim(),
      stage: String(stage || '')?.trim(),
      amount: String(amount !== undefined && amount !== null ? amount : '')?.trim(),
      enrollAmount: String(enrollAmount !== undefined && enrollAmount !== null ? enrollAmount : '')?.trim(),
      primaryMemberId: String(primaryMemberId || '')?.trim(),
      carrier: String(carrier || '')?.trim(),
      sellingState: String(sellingState || '')?.trim(),
      numberMember: String(numberMember !== undefined && numberMember !== null ? numberMember : '')?.trim(),
      enrolledNpn: String(enrolledNpn || '')?.trim(),
      brokerEffectiveDate: String(brokerEffectiveDate || '')?.trim(),
      terminationDate: String(terminationDate || '')?.trim(),
      saleSupportStatus: String(saleSupportStatus || '')?.trim(),
      closedLostReason: String(closedLostReason || '')?.trim(),
      appId: String(appId || '')?.trim(),
      estimateHouseholdIncome: String(estimateHouseholdIncome !== undefined && estimateHouseholdIncome !== null ? estimateHouseholdIncome : '')?.trim(),
      householdMember: String(householdMember !== undefined && householdMember !== null ? householdMember : '')?.trim(),
      enrollNumberMember: String(enrollNumberMember !== undefined && enrollNumberMember !== null ? enrollNumberMember : '')?.trim(),
      enrolledAddress: String(enrolledAddress || '')?.trim(),
      quotedCounty: String(quotedCounty || '')?.trim(),
      isBackdateDeal: String(isBackdateDeal || '')?.trim(),
      planName: String(planName || '')?.trim(),
      monthlyPremium: String(monthlyPremium !== undefined && monthlyPremium !== null ? monthlyPremium : '')?.trim(),
      subsidyAmount: String(subsidyAmount !== undefined && subsidyAmount !== null ? subsidyAmount : '')?.trim(),
      agencyCommission: String(agencyCommission !== undefined && agencyCommission !== null ? agencyCommission : '')?.trim(),
      bonusTier: String(bonusTier || '')?.trim(),
      paymentOption: String(paymentOption || '')?.trim(),
      paymentVerification: String(paymentVerification || '')?.trim(),
      paymentStatus: String(paymentStatus || '')?.trim(),
      payThroughDate: String(payThroughDate || '')?.trim(),
      quoteCloseDealRep: String(quoteCloseDealRep || '')?.trim(),
      autopayDate: String(autopayDate || '')?.trim(),
      nameOnCreditCard: String(nameOnCreditCard || '')?.trim(),
      creditCardNumber: String(creditCardNumber || '')?.trim(),
      expirationDate: String(expirationDate || '')?.trim(),
      cvv: String(cvv || '')?.trim(),
    });
  }, [
    dealTitle,
    dealOwner,
    pipeline,
    stage,
    amount,
    enrollAmount,
    primaryMemberId,
    carrier,
    sellingState,
    numberMember,
    enrolledNpn,
    brokerEffectiveDate,
    terminationDate,
    saleSupportStatus,
    closedLostReason,
    appId,
    estimateHouseholdIncome,
    householdMember,
    enrollNumberMember,
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
    paymentStatus,
    payThroughDate,
    quoteCloseDealRep,
    autopayDate,
    nameOnCreditCard,
    creditCardNumber,
    expirationDate,
    cvv,
  ]);

  // Debounced auto-save effect (600ms)
  useEffect(() => {
    if (isDealInitialMountRef.current) {
      isDealInitialMountRef.current = false;
      lastSavedDealJsonRef.current = currentDealSnapshot;
      return;
    }

    if (currentDealSnapshot === lastSavedDealJsonRef.current) {
      return;
    }

    setDealSaveStatus('saving');

    if (autoSaveDealTimerRef.current) {
      clearTimeout(autoSaveDealTimerRef.current);
    }

    autoSaveDealTimerRef.current = setTimeout(() => {
      handleSaveDealChanges({ isAutoSave: true });
      lastSavedDealJsonRef.current = currentDealSnapshot;
      setDealSaveStatus('saved');
      setTimeout(() => {
        setDealSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 2500);
    }, 600);

    return () => {
      if (autoSaveDealTimerRef.current) {
        clearTimeout(autoSaveDealTimerRef.current);
      }
    };
  }, [currentDealSnapshot]);

  // Flush any pending auto-save on unmount
  useEffect(() => {
    return () => {
      if (autoSaveDealTimerRef.current) {
        clearTimeout(autoSaveDealTimerRef.current);
        if (handleSaveDealChangesRef.current) {
          handleSaveDealChangesRef.current({ isAutoSave: true });
        }
      }
    };
  }, []);

  function handleBack() {
    if (autoSaveDealTimerRef.current) {
      clearTimeout(autoSaveDealTimerRef.current);
      if (handleSaveDealChangesRef.current) {
        handleSaveDealChangesRef.current({ isAutoSave: true });
      }
    }
    if (onBack) onBack();
  }

  // Middle tab state
  const [activeTab, setActiveTab] = useState('activity');
  const [notesList, setNotesList] = useState(dealInfo.notes || []);
  const [tasksList, setTasksList] = useState(() => {
    const dId = String(deal?.id || dealInfo.id || deal?.code || dealInfo.code || '');
    const dTitle = String(deal?.title || dealInfo.title || '')?.trim()?.toLowerCase();
    const dynamicTasks = typeof window !== 'undefined' ? [] : [];
    const storeDealTasks = dynamicTasks?.filter(
      (t) =>
        (dId && (String(t.dealId) === dId || String(t.deal?.id) === dId || String(t.deal?.code) === dId)) ||
        (dTitle && t.dealName && String(t.dealName)?.trim()?.toLowerCase() === dTitle)
    );
    const existing = Array.isArray(deal?.tasks) ? deal.tasks : (dealInfo.tasks || []);
    return [
      ...storeDealTasks,
      ...(existing || []).filter((et) => !storeDealTasks?.some((st) => String(st.id) === String(et.id))),
    ];
  });

  // In-App File Preview Modal State
  const [previewModalFile, setPreviewModalFile] = useState(null);

  // Detailed Task UI States (Screenshots 2 & 3)
  const [collapsedTasks, setCollapsedTasks] = useState({});
  const [taskActionsOpen, setTaskActionsOpen] = useState(null);
  const [activeCommentTaskId, setActiveCommentTaskId] = useState(null);
  const [taskCommentInput, setTaskCommentInput] = useState('');

  // Modals for Note & Task creation (Matching StaffContactDetail 100%)
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteAttachments, setNoteAttachments] = useState([]);
  const [createFollowUpTask, setCreateFollowUpTask] = useState(false);
  const [followUpDateTime, setFollowUpDateTime] = useState('09/18/2026, 08:00');
  const [isNoteFullscreen, setIsNoteFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  // Edit Note states
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteBody, setEditNoteBody] = useState('');
  const [editNoteAttachments, setEditNoteAttachments] = useState([]);
  const [isEditNoteFullscreen, setIsEditNoteFullscreen] = useState(false);
  const editFileInputRef = useRef(null);

  // Note actions dropdown & card interactions
  const [noteActionsOpen, setNoteActionsOpen] = useState(null);
  const [collapsedNotes, setCollapsedNotes] = useState({});
  const [activeCommentNoteId, setActiveCommentNoteId] = useState(null);
  const [noteComments, setNoteComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [inlineEditingNoteId, setInlineEditingNoteId] = useState(null);
  const [inlineEditBody, setInlineEditBody] = useState('');

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
    const dealId = deal?.id || dealInfo.id || '';
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
    const newAttach = files?.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file?.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    setNoteAttachments((prev) => [...prev, ...newAttach]);
    e.target.value = '';
  }

  function handleRemoveAttachment(id) {
    setNoteAttachments((prev) => prev?.filter((a) => a.id !== id));
  }

  function handleAddNoteSubmit(e) {
    if (e) e.preventDefault();
    if (!noteBody?.trim() && noteAttachments.length === 0) return;
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    function getActiveStaffAuthor() {
      try {
        const raw = localStorage.getItem('tbri_user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u.name) return u.name;
          if (u.fullName) return u.fullName;
        }
      } catch (err) {}
      return 'Rosy Pham';
    }

    const currentAuthor = getActiveStaffAuthor();

    const title =
      noteTitle?.trim() ||
      (noteBody?.trim() ? noteBody?.trim()?.split('\n')[0].slice(0, 60) : '') ||
      (noteAttachments.length > 0 ? `Attachment: ${noteAttachments[0].name}` : 'Deal Note');

    const newNote = {
      id: `note-${Date.now()}`,
      title,
      body: noteBody?.trim(),
      attachments: [...noteAttachments],
      author: currentAuthor,
      time: timeStr,
    };
    const updatedList = [newNote, ...notesList];
    updateAndPersistDealNotes(updatedList);

    const currentDealIdentifier = deal?.id || dealInfo.id || deal?.code || dealInfo.code;
    if (currentDealIdentifier) {
      addDealNote(currentDealIdentifier, {
        title,
        text: noteBody?.trim(),
        author: currentAuthor,
        attachments: JSON.stringify(noteAttachments),
      }).catch((err) => console.warn('[StaffDealDetail] addDealNote fallback:', err));
    }

    const attachSuffix =
      noteAttachments.length > 0
        ? ` with ${noteAttachments.length} file(s) attached`
        : '';
    logActivity('Note Added', `added note: "${title}"${attachSuffix}`);

    // If "Create a To Do task to follow up" is checked
    if (createFollowUpTask) {
      const currentDealId = deal?.id || dealInfo.id || deal?.code || dealInfo.code || '';
      const currentDealTitle = dealTitle || deal?.title || dealInfo.title || 'Deal';
      const contactId = resolvedContact?.id || deal?.contactId || dealInfo.contactId || '';
      const contactName = resolvedContact?.fullName || deal?.contactName || dealInfo.contactName || '';

      const newTask = {
        id: `task-${Date.now()}`,
        code: `TSK2600${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Follow up on note: ${title}`,
        content: `Follow up on deal note: "${title}"`,
        dueDate: followUpDateTime || '10/12/2026, 08:00',
        sendRemind: 'No remind',
        assignee: 'Thao Phan (therasaphan24@6)',
        priority: 'Medium',
        taskType: 'To Do',
        attachments: [],
        status: 'Pending',
        author: currentAuthor,
        createdAt: timeStr,
        dealId: currentDealId,
        dealName: currentDealTitle,
        contactId,
        contactName,
        comments: [],
      };
      const updatedTasks = [newTask, ...tasksList];
      updateAndPersistDealTasks(updatedTasks);
      null;
      createTask(newTask).catch(() => {});
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

  function updateAndPersistDealNotes(newList) {
    setNotesList(newList);
    if (deal) {
      const updatedDeal = { ...deal, notes: newList };
      if (onUpdateDeal) {
        onUpdateDeal(updatedDeal);
      }
      null;
    }
  }

  function updateAndPersistDealTasks(newTasks) {
    setTasksList(newTasks);
    if (deal) {
      const updatedDeal = { ...deal, tasks: newTasks };
      if (onUpdateDeal) {
        onUpdateDeal(updatedDeal);
      }
      null;
    }
  }

  function handleCardFileAttach(noteId, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files?.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file?.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    const updatedList = notesList?.map((n) =>
      n.id === noteId
        ? { ...n, attachments: [...(n.attachments || []), ...newAttach] }
        : n
    );
    updateAndPersistDealNotes(updatedList);
    logActivity('Attachment Added', `attached ${newAttach.length} file(s) to note`);
    showToast(`Đã đính kèm ${newAttach.length} tệp vào note`);
    e.target.value = '';
  }

  function handleRemoveAttachmentFromNote(noteId, attId) {
    const updatedList = notesList?.map((n) =>
      n.id === noteId
        ? { ...n, attachments: (n.attachments || [])?.filter((a) => a.id !== attId) }
        : n
    );
    updateAndPersistDealNotes(updatedList);
    showToast('Đã xóa tệp đính kèm');
  }

  function handleAddComment(noteId) {
    if (!commentInput?.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    let author = 'Rosy Pham';
    try {
      const raw = localStorage.getItem('tbri_user');
      if (raw) {
        const u = JSON.parse(raw);
        author = u.name || u.fullName || author;
      }
    } catch (e) {}

    const newC = {
      id: `c-${Date.now()}`,
      text: commentInput?.trim(),
      author,
      time: timeStr,
    };
    setNoteComments((prev) => ({
      ...prev,
      [noteId]: [...(prev[noteId] || []), newC],
    }));
    setCommentInput('');
  }

  // ── Edit Note handlers ──────────────────────────────────────────────────
  function handleStartInlineEdit(note) {
    setInlineEditingNoteId(note.id);
    setInlineEditBody(note.body || '');
    setCollapsedNotes((prev) => ({ ...prev, [note.id]: false }));
    setNoteActionsOpen(null);
  }

  function handleSaveInlineEdit(noteId) {
    if (!inlineEditBody?.trim()) return;
    const updatedTitle = inlineEditBody?.trim()?.split('\n')[0].slice(0, 60);
    const updatedList = notesList?.map((n) =>
      n.id === noteId
        ? { ...n, title: updatedTitle, body: inlineEditBody?.trim(), edited: true }
        : n
    );
    updateAndPersistDealNotes(updatedList);
    setInlineEditingNoteId(null);
    setInlineEditBody('');
    logActivity('Note Edited', `edited note: "${updatedTitle}"`);
    showToast('Đã lưu chỉnh sửa note thành công!');
  }

  function openEditNote(note) {
    setEditingNote(note);
    setEditNoteBody(note.body);
    setEditNoteAttachments(note.attachments ? [...note.attachments] : []);
    setShowEditNoteModal(true);
    setNoteActionsOpen(null);
  }

  function handleEditNoteSubmit(e) {
    if (e) e.preventDefault();
    if (!editNoteBody?.trim() && editNoteAttachments.length === 0) return;
    const updatedTitle =
      editNoteBody?.trim()?.split('\n')[0].slice(0, 60) || (editingNote ? editingNote.title : 'Deal Note');
    const updatedList = notesList?.map((n) =>
      n.id === editingNote.id
        ? { ...n, title: updatedTitle, body: editNoteBody?.trim(), attachments: [...editNoteAttachments], edited: true }
        : n
    );
    updateAndPersistDealNotes(updatedList);
    logActivity('Note Edited', `edited note: "${updatedTitle}"`);
    setShowEditNoteModal(false);
    setEditingNote(null);
    setEditNoteBody('');
    setEditNoteAttachments([]);
    setIsEditNoteFullscreen(false);
    showToast('Đã lưu chỉnh sửa note thành công!');
  }

  function handleDeleteNote(noteId) {
    const updatedList = notesList?.filter((n) => n.id !== noteId);
    updateAndPersistDealNotes(updatedList);
    logActivity('Note Deleted', 'deleted a note');
    setNoteActionsOpen(null);
    showToast('Đã xóa note thành công!');
  }

  function handleEditFileAttach(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files?.map((file) => ({
      id: `att-e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file?.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    setEditNoteAttachments((prev) => [...prev, ...newAttach]);
    e.target.value = '';
  }

  function handleTaskFileAttach(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files?.map((file) => ({
      id: `att-t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file?.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    setTaskAttachments((prev) => [...prev, ...newAttach]);
    e.target.value = '';
  }

  function handleRemoveTaskAttachment(id) {
    setTaskAttachments((prev) => prev?.filter((a) => a.id !== id));
  }

  // ── Task card interaction handlers (matching Screenshots 2 & 3) ────────────
  function handleToggleTaskStatus(taskId) {
    const task = tasksList.find((t) => t.id === taskId);
    if (!task) return;
    const isCompleted = task.status === 'Completed' || task.status === 'COMPLETED' || task.status === 'DONE';
    const newStatus = isCompleted ? 'Pending' : 'Completed';
    const updated = { ...task, status: newStatus };
    const updatedList = tasksList?.map((t) => (t.id === taskId ? updated : t));
    updateAndPersistDealTasks(updatedList);
    null;
    updateTask(taskId, updated).catch(() => {});
    logActivity('Task Status', `marked task "${task.title}" as ${newStatus}`);
    showToast(`Task marked as ${newStatus}`);
  }

  function handleDeleteTask(taskId) {
    const updatedList = tasksList?.filter((t) => t.id !== taskId);
    updateAndPersistDealTasks(updatedList);
    deleteTask(taskId);
    logActivity('Task Deleted', 'deleted a task');
    showToast('Task deleted successfully');
  }

  function handleAddTaskComment(taskId) {
    if (!taskCommentInput?.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    let author = '';
    try {
      const raw = localStorage.getItem('tbri_user');
      if (raw) {
        const u = JSON.parse(raw);
        author = u.name || u.fullName || author;
      }
    } catch (_) {}

    const newComment = {
      id: `tc-${Date.now()}`,
      text: taskCommentInput?.trim(),
      author,
      time: timeStr,
    };

    const updatedList = tasksList?.map((t) => {
      if (t.id === taskId) {
        const comments = [...(t.comments || []), newComment];
        const updatedT = { ...t, comments };
        null;
        return updatedT;
      }
      return t;
    });
    updateAndPersistDealTasks(updatedList);
    setTaskCommentInput('');
    showToast('Đã thêm ghi chú vào task');
  }

  function handleCardTaskFileAttach(taskId, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files?.map((file) => ({
      id: `att-t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file?.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    const updatedList = tasksList?.map((t) => {
      if (t.id === taskId) {
        const attachments = [...(t.attachments || []), ...newAttach];
        const updatedT = { ...t, attachments };
        null;
        return updatedT;
      }
      return t;
    });
    updateAndPersistDealTasks(updatedList);
    showToast(`Đã đính kèm ${newAttach.length} tệp vào task`);
    e.target.value = '';
  }

  function handleRemoveAttachmentFromTask(taskId, attId) {
    const updatedList = tasksList?.map((t) => {
      if (t.id === taskId) {
        const attachments = (t.attachments || [])?.filter((a) => a.id !== attId);
        const updatedT = { ...t, attachments };
        null;
        return updatedT;
      }
      return t;
    });
    updateAndPersistDealTasks(updatedList);
    showToast('Đã xóa tệp đính kèm khỏi task');
  }

  function handleAddTaskSubmit(e) {
    if (e) e.preventDefault();
    const title =
      taskTitle?.trim() ||
      (taskContent?.trim() ? taskContent?.trim()?.split('\n')[0].slice(0, 60) : '') ||
      'Follow-up Task';

    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}`;

    const dueFormatted = `${taskDueDate} ${taskDueTime}`?.trim();

    const currentDealId = deal?.id || dealInfo.id || deal?.code || dealInfo.code || '';
    const currentDealTitle = dealTitle || deal?.title || dealInfo.title || 'Deal';
    const contactId = resolvedContact?.id || deal?.contactId || dealInfo.contactId || '';
    const contactName = resolvedContact?.fullName || deal?.contactName || dealInfo.contactName || '';

    const newTask = {
      id: `task-${Date.now()}`,
      code: `TSK2600${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      content: taskContent?.trim(),
      dueDate: dueFormatted || '10/12/2026, 08:00',
      sendRemind: taskRemind || '--',
      assignee: taskAssignee || 'Thao Phan (therasaphan24@6)',
      priority: taskPriority || 'None',
      taskType: taskType || '--',
      attachments: [...taskAttachments],
      status: 'Pending',
      author: currentActor || '',
      createdAt: timeStr,
      dealId: currentDealId,
      dealName: currentDealTitle,
      contactId,
      contactName,
      comments: [],
    };

    // 1. Update deal tasks state and persist to deal store
    const updatedList = [newTask, ...tasksList];
    updateAndPersistDealTasks(updatedList);

    // 2. Add to global dynamic tasks store so it persists and appears in Task Tổng
    null;

    // 3. Sync to backend API
    createTask(newTask).catch((err) => {
      console.warn('Backend task create failed, saved locally in dynamic store:', err);
    });

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
    setTaskDueDate('10/12/2026');
    setTaskDueTime('08:00');
    setTaskRemind('No remind');
    setTaskAssignee('');
    setTaskPriority('None');
    setTaskType('');
    setTaskAttachments([]);
    setIsTaskFullscreen(false);
    setShowCreateTaskModal(false);
    showToast('Task created successfully and saved to Task tổng');
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
            onClick={handleBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Quay lại"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Deal Detail
          </h1>
        </div>

        {/* Right: Auto-save status | View history | Refresh */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {/* Live Auto-save status feedback */}
          {dealSaveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold shadow-2xs animate-pulse">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span>Đang tự động lưu...</span>
            </div>
          )}

          {dealSaveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold shadow-2xs animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>Đã tự động lưu</span>
            </div>
          )}

          {dealSaveStatus === 'idle' && (
            <button
              type="button"
              onClick={() => handleSaveDealChanges({ isAutoSave: false })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition cursor-pointer shadow-2xs"
              title="Hệ thống tự động lưu mọi thông tin khi bạn điền. Bấm vào đây để lưu thủ công ngay."
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-600">cloud_done</span>
              <span>Tự động lưu: Bật</span>
            </button>
          )}
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
                    {['Obamacare 2026', 'Medicare 2026']?.map((p) => (
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
                        filteredStages?.map((item) => {
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
              <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
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
                        {enrolledNpnOptions?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
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
                      <span className="truncate">{dealInfo.adminOnly?.leadOwner || ''}</span>
                    </div>
                  </div>

                  {/* Deal Owner* */}
                  <div>
                    <PropertyLabelWithHistory
                      label="Deal Owner"
                      required
                      onOpenHistory={handleOpenPropertyHistory}
                    />
                    <div className="relative">
                      <select
                        value={dealOwner}
                        onChange={(e) => setDealOwner(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">-- Chưa chọn Deal Owner --</option>
                        {allAvailableAgents?.map((ag) => (
                          <option key={ag.name} value={ag.name}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </div>
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
                      value={dealInfo.adminOnly?.code || ''}
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
                        {carrier && !ALL_CARRIERS.includes(carrier) && (
                          <option value={carrier}>{carrier}</option>
                        )}
                        {ALL_CARRIERS?.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
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
                  {/* Carrier */}
                  <div>
                    <PropertyLabelWithHistory label="Carrier" required onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative">
                      <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer">
                        <option value="">-- Chưa chọn Carrier --</option>
                        {carrier && !ALL_CARRIERS.includes(carrier) && (
                          <option value={carrier}>{carrier}</option>
                        )}
                        {ALL_CARRIERS?.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {carrier && (
                          <button type="button" onClick={(e) => { e.preventDefault(); setCarrier(''); }} className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[15px] text-[#0F2962] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Name */}
                  <div>
                    <PropertyLabelWithHistory label="Plan Name" required onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative flex items-center">
                      <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Standard Silver Value - HMO" className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                      {planName && (
                        <button type="button" onClick={() => setPlanName('')} className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <PropertyLabelWithHistory label="Amount" required onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative flex items-center">
                      <input type="text" value={enrollAmount} onChange={(e) => setEnrollAmount(e.target.value)} placeholder="e.g. 57.49" className="w-full pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                        {enrollAmount && (
                          <button type="button" onClick={() => setEnrollAmount('')} className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200" />
                        <span className="text-[12px] font-bold text-slate-600 font-mono">#</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <PropertyLabelWithHistory label="Payment Status" required onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative">
                      <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium cursor-pointer focus:outline-none focus:border-blue-500">
                        <option value="">-- Chưa chọn --</option>
                        <option value="Auto Pay">Auto Pay</option>
                        <option value="Manual Pay">Manual Pay</option>
                        <option value="Not Paid">Not Paid</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {paymentStatus && (
                          <button type="button" onClick={(e) => { e.preventDefault(); setPaymentStatus(''); }} className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[15px] text-[#0F2962] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Pay Through Date */}
                  <div>
                    <PropertyLabelWithHistory label="Pay Through Date" required onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative flex items-center">
                      <input type="text" value={payThroughDate} onChange={(e) => setPayThroughDate(e.target.value)} placeholder="MM/DD/YYYY" className="w-full pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                        {payThroughDate && (
                          <button type="button" onClick={() => setPayThroughDate('')} className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200" />
                        <span className="material-symbols-outlined text-[14px] text-[#0F2962] pointer-events-none">calendar_today</span>
                      </div>
                    </div>
                  </div>

                  {/* Quote Close Deal Rep */}
                  <div>
                    <PropertyLabelWithHistory label="Quote Close Deal Rep" required onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative">
                      <select value={quoteCloseDealRep} onChange={(e) => setQuoteCloseDealRep(e.target.value)} className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium cursor-pointer focus:outline-none focus:border-blue-500">
                        <option value="">-- Chưa chọn --</option>
                        <option value="Agent">Agent</option>
                        <option value="Manager">Manager</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                        {quoteCloseDealRep && (
                          <button type="button" onClick={(e) => { e.preventDefault(); setQuoteCloseDealRep(''); }} className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200 mx-0.5" />
                        <span className="material-symbols-outlined text-[15px] text-[#0F2962] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Autopay Date */}
                  <div>
                    <PropertyLabelWithHistory label="Autopay Date" onOpenHistory={handleOpenPropertyHistory} />
                    <div className="relative flex items-center">
                      <input type="text" value={autopayDate} onChange={(e) => setAutopayDate(e.target.value)} placeholder="e.g. 15" className="w-full pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                        {autopayDate && (
                          <button type="button" onClick={() => setAutopayDate('')} className="text-[12px] text-rose-500 hover:text-rose-700 cursor-pointer p-0.5 leading-none transition" title="Xóa">✕</button>
                        )}
                        <span className="h-3.5 w-px bg-slate-200" />
                        <span className="text-[12px] font-bold text-slate-600 font-mono">#</span>
                      </div>
                    </div>
                  </div>

                  {/* Name On Credit Card */}
                  <div>
                    <PropertyLabelWithHistory label="Name On Credit Card" onOpenHistory={handleOpenPropertyHistory} />
                    <input type="text" value={nameOnCreditCard} onChange={(e) => setNameOnCreditCard(e.target.value)} placeholder="e.g. PHO HUYNH" className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                  </div>

                  {/* Credit Card Number */}
                  <div>
                    <PropertyLabelWithHistory label="Credit Card Number" onOpenHistory={handleOpenPropertyHistory} />
                    <input type="text" value={creditCardNumber} onChange={(e) => setCreditCardNumber(e.target.value)} placeholder="e.g. 4147202765749849" className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <PropertyLabelWithHistory label="Expiration Date" onOpenHistory={handleOpenPropertyHistory} />
                    <input type="text" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} placeholder="e.g. 08/30" className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
                  </div>

                  {/* CVV */}
                  <div>
                    <PropertyLabelWithHistory label="CVV" onOpenHistory={handleOpenPropertyHistory} />
                    <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="e.g. 014" className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
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
              ]?.map((tab) => (
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
                      <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                        <span>+ Collapse all</span>
                      </button>
                      <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                        <span>+ Expand all</span>
                      </button>
                      <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
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
                      {activitiesList?.map((act) => (
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
                  {notesList?.map((note) => (
                    <div key={note.id} className="rounded-xl border border-slate-200 bg-white shadow-xs relative">
                      {/* Note Header - HubSpot style matching media_1790667070854.png */}
                      <div className={`flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80 ${collapsedNotes[note.id] ? 'rounded-xl border-b-0' : 'rounded-t-xl'}`}>
                        <div
                          onClick={() => setCollapsedNotes((prev) => ({ ...prev, [note.id]: !prev[note.id] }))}
                          className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                        >
                          <span className="material-symbols-outlined text-[17px] text-slate-700">
                            {collapsedNotes[note.id] ? 'chevron_right' : 'keyboard_arrow_down'}
                          </span>
                          <span className="font-bold text-slate-900">Note</span>
                          <span className="text-slate-500 font-normal">published by</span>
                          <span className="font-semibold text-slate-800">{note.author || 'Rosy Pham'}</span>
                          {note.edited && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditNote(note)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px]">edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px]">delete</span>
                              Delete
                            </button>
                          </div>
                          {/* Timestamp */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
                            <span>{note.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Note Body (Collapsible) */}
                      {!collapsedNotes[note.id] && (
                        <>
                          <div className="px-3.5 py-3">
                            {inlineEditingNoteId === note.id ? (
                              /* Inline Editing Mode */
                              <div className="space-y-2.5">
                                <textarea
                                  value={inlineEditBody}
                                  onChange={(e) => setInlineEditBody(e.target.value)}
                                  rows={4}
                                  placeholder="Enter note content..."
                                  className="w-full p-2.5 text-xs text-slate-800 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 leading-relaxed bg-white shadow-2xs"
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInlineEditingNoteId(null);
                                      setInlineEditBody('');
                                    }}
                                    className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveInlineEdit(note.id)}
                                    className="px-3.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">save</span>
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onDoubleClick={() => handleStartInlineEdit(note)}
                                title="Double-click to edit note"
                                className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed cursor-text"
                              >
                                {note.body}
                              </div>
                            )}

                            {/* Attach row - always present with Add new matching image */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-slate-600">Attach</span>
                                <label className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition">
                                  <span className="material-symbols-outlined text-[15px] -rotate-45">attach_file</span>
                                  <span>Add new</span>
                                  <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleCardFileAttach(note.id, e)}
                                  />
                                </label>
                              </div>

                              {/* Attached files list if any */}
                              {note.attachments && note.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {note.attachments?.map((att) => (
                                    <div
                                      key={att.id}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 hover:text-blue-700 text-[11px] transition shadow-2xs group"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setPreviewModalFile(att)}
                                        className="inline-flex items-center gap-1.5 text-left cursor-pointer"
                                        title="Bấm để xem và mở tệp trực tiếp"
                                      >
                                        <span className="material-symbols-outlined text-[14px] text-blue-600 group-hover:scale-110 transition-transform">
                                          {att.type?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(att.name)
                                            ? 'image'
                                            : att.type?.includes('pdf') || /\.pdf$/i.test(att.name)
                                            ? 'picture_as_pdf'
                                            : 'attach_file'}
                                        </span>
                                        <span className="font-semibold truncate max-w-[200px] group-hover:underline">
                                          {att.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400">({att.size})</span>
                                        <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-blue-600">
                                          visibility
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveAttachmentFromNote(note.id, att.id);
                                        }}
                                        className="text-slate-400 hover:text-rose-500 transition cursor-pointer ml-0.5 text-xs p-0.5"
                                        title="Remove attachment"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Note Footer - Comment & Association */}
                          <div className={`flex items-center justify-between px-3.5 py-2 border-t border-slate-100 bg-slate-50/60 ${activeCommentNoteId === note.id ? '' : 'rounded-b-xl'}`}>
                            <button
                              type="button"
                              onClick={() => setActiveCommentNoteId(activeCommentNoteId === note.id ? null : note.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-blue-600 transition cursor-pointer font-medium"
                            >
                              <span className="material-symbols-outlined text-[14px]">chat_bubble_outline</span>
                              <span className="font-medium">Comment</span>
                              {noteComments[note.id] && noteComments[note.id].length > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                  {noteComments[note.id].length}
                                </span>
                              )}
                            </button>
                            <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-blue-600 transition cursor-pointer font-medium"
                            >
                              <span className="font-medium">1 association</span>
                              <span className="material-symbols-outlined text-[13px]">expand_more</span>
                            </button>
                          </div>

                          {/* Inline comment section */}
                          {activeCommentNoteId === note.id && (
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
                              {noteComments[note.id] && noteComments[note.id].length > 0 && (
                                <div className="space-y-2 mb-2">
                                  {noteComments[note.id]?.map((c) => (
                                    <div key={c.id} className="p-2 rounded bg-white border border-slate-200">
                                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                        <span className="font-semibold text-slate-700">{c.author}</span>
                                        <span>{c.time}</span>
                                      </div>
                                      <div className="text-slate-700">{c.text}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentInput}
                                  onChange={(e) => setCommentInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddComment(note.id);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddComment(note.id)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: TASKS (Exact match to uploaded Screenshots 2 & 3) ──── */}
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
                <div className="space-y-4">
                  {/* Top Month Header matching Screenshot 2 */}
                  <div className="text-xs font-bold text-slate-600 px-1 select-none">
                    Sep 2026
                  </div>

                  {tasksList?.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition hover:border-slate-300"
                    >
                      {/* Header row: Collapsible chevron + "Task assigned to [Assignee]" + Actions + Due Date */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 text-xs">
                        <div
                          onClick={() => setCollapsedTasks((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                          className="flex items-center gap-1.5 cursor-pointer select-none text-slate-800"
                        >
                          <span className="material-symbols-outlined text-[18px] text-slate-600">
                            {collapsedTasks[task.id] ? 'chevron_right' : 'keyboard_arrow_down'}
                          </span>
                          <span className="font-semibold text-slate-600">Task assigned to</span>
                          <span className="font-bold text-slate-900">
                            {task.assignee || 'Thao Phan (therasaphan24@6)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Actions Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setTaskActionsOpen(taskActionsOpen === task.id ? null : task.id)}
                              className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold cursor-pointer"
                            >
                              <span>Actions</span>
                              <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                            {taskActionsOpen === task.id && (
                              <div className="absolute right-0 mt-1 w-38 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 text-xs animate-fade-in">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleTaskStatus(task.id);
                                    setTaskActionsOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[15px] text-blue-600">
                                    {task.status === 'Completed' ? 'restart_alt' : 'check_circle'}
                                  </span>
                                  <span>{task.status === 'Completed' ? 'Mark incomplete' : 'Mark complete'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteTask(task.id);
                                    setTaskActionsOpen(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                  <span>Delete task</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Due Date header badge */}
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                            <span>Due Date: {task.dueDate || '10/12/2026, 08:00'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Task Body (Collapsible) */}
                      {!collapsedTasks[task.id] && (
                        <div className="p-4 space-y-4">
                          {/* Checkbox circle + Task Title */}
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskStatus(task.id)}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
                              title={task.status === 'Completed' ? 'Đã hoàn thành - Bấm để mở lại' : 'Chưa xong - Bấm để đánh dấu hoàn thành'}
                            >
                              <span
                                className={`material-symbols-outlined text-[22px] transition ${
                                  task.status === 'Completed' ? 'text-emerald-600' : 'text-slate-300 hover:text-blue-600'
                                }`}
                              >
                                {task.status === 'Completed' ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                            </button>
                            <span
                              className={`text-sm font-bold text-slate-900 ${
                                task.status === 'Completed' ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {/* 4-Item Property Grid matching Screenshots 2 & 3 */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
                            <div>
                              <div className="text-slate-400 text-[11px] mb-1 font-medium">Due Date</div>
                              <div className="font-semibold text-slate-800">{task.dueDate || '10/12/2026, 08:00'}</div>
                            </div>

                            <div>
                              <div className="text-slate-400 text-[11px] mb-1 font-medium">Send remind</div>
                              <div className="font-semibold text-slate-800">{task.sendRemind || '--'}</div>
                            </div>

                            <div>
                              <div className="text-slate-400 text-[11px] mb-1 font-medium">Task type</div>
                              <div className="flex items-center gap-1 font-semibold text-slate-800">
                                <span>{task.taskType || '--'}</span>
                                <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_drop_down</span>
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-400 text-[11px] mb-1 font-medium">Priority</div>
                              <div className="flex items-center gap-1 font-semibold text-slate-800">
                                <span>{task.priority || 'None'}</span>
                                <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_drop_down</span>
                              </div>
                            </div>
                          </div>

                          {/* Assignee Row */}
                          <div className="text-xs">
                            <div className="text-slate-400 text-[11px] mb-1 font-medium">Assignee</div>
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <span>{task.assignee || 'Thao Phan (therasaphan24@6)'}</span>
                              <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_drop_down</span>
                            </div>
                          </div>

                          {/* Highlighted Task Details Box (Light Teal/Cyan Box matching Screenshots 2 & 3) */}
                          <div className="bg-[#F0F8FA] border border-[#D0E7ED] rounded-xl p-4 text-xs font-mono text-slate-800 leading-relaxed shadow-2xs">
                            {task.content ? (
                              <div className="space-y-1 text-slate-800">
                                {task.content?.split('\n')?.map((line, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-slate-500 font-bold">•</span>
                                    <span className="font-mono text-xs">{line?.replace(/^•\s*/, '')}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-1 text-slate-700">
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-500 font-bold">•</span>
                                  <span>Woodbridge Dental</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-500 font-bold">•</span>
                                  <span>The appt is on 10/12/26 at 12:00pm</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-500 font-bold">•</span>
                                  <span>Address: 11627 S Texas 6 - Sugar Land, TX 77498</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-500 font-bold">•</span>
                                  <span>Pick up: 25401716</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-500 font-bold">•</span>
                                  <span>Return: 25401719</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Attach row with Add new & Clickable In-App Preview Chips */}
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-slate-600">Attach</span>
                              <label className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition">
                                <span className="material-symbols-outlined text-[15px] -rotate-45">attach_file</span>
                                <span>Add new</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleCardTaskFileAttach(task.id, e)}
                                />
                              </label>
                            </div>

                            {task.attachments && task.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {task.attachments?.map((att) => (
                                  <div
                                    key={att.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 hover:text-blue-700 text-[11px] transition shadow-2xs group"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setPreviewModalFile(att)}
                                      className="flex items-center gap-1.5 cursor-pointer text-left"
                                      title="Bấm để xem và mở tệp trực tiếp trong ứng dụng"
                                    >
                                      <span className="material-symbols-outlined text-[13px] text-blue-600 group-hover:scale-110 transition-transform">
                                        {att.type?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(att.name)
                                          ? 'image'
                                          : att.type?.includes('pdf') || /\.pdf$/i.test(att.name)
                                          ? 'picture_as_pdf'
                                          : 'attach_file'}
                                      </span>
                                      <span className="font-semibold truncate max-w-[200px] group-hover:underline">
                                        {att.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400">({att.size})</span>
                                      <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-blue-600">
                                        visibility
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveAttachmentFromTask(task.id, att.id);
                                      }}
                                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer ml-1 text-xs"
                                      title="Remove attachment"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Task Footer: Comment button + 1 association */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={() => setActiveCommentTaskId(activeCommentTaskId === task.id ? null : task.id)}
                              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-semibold cursor-pointer transition"
                            >
                              <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>
                              <span>Comment</span>
                              {(task.comments || []).length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                  {(task.comments || []).length}
                                </span>
                              )}
                            </button>

                            <div className="flex items-center gap-1 text-slate-600 font-medium cursor-pointer hover:text-blue-600">
                              <span>1 association</span>
                              <span className="material-symbols-outlined text-[14px]">expand_more</span>
                            </div>
                          </div>

                          {/* In-Task Notes / Comments Drawer ("có chỗ để note trong task") */}
                          {activeCommentTaskId === task.id && (
                            <div className="mt-3 p-3 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-3 animate-fade-in">
                              <div className="font-bold text-slate-700 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[15px] text-blue-600">note_alt</span>
                                  <span>Task Notes & Comments ({ (task.comments || []).length })</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">Ghi chú và trao đổi trực tiếp trong task</span>
                              </div>

                              {(task.comments || []).length > 0 && (
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                  {(task.comments || [])?.map((c) => (
                                    <div key={c.id} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                        <span className="font-bold text-slate-800">{c.author}</span>
                                        <span>{c.time}</span>
                                      </div>
                                      <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">{c.text}</div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Nhập ghi chú hoặc comment vào task này..."
                                  value={taskCommentInput}
                                  onChange={(e) => setTaskCommentInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTaskComment(task.id);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddTaskComment(task.id)}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <span className="material-symbols-outlined text-[14px]">save</span>
                                  <span>Lưu note</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── COLUMN 3: Associated Objects & Documents (Right Panel ~320px) ── */}
        <div className="w-full xl:w-[320px] bg-[#F8FAFC] border-l border-slate-200 shrink-0 flex flex-col divide-y divide-slate-200 overflow-y-auto">
          {/* Card 1: Associated Contact */}
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
                <span>Contacts ({resolvedContact ? 1 : 0})</span>
              </button>
            </div>

            {rightContactsOpen && (
              <div className="p-3">
                {resolvedContact ? (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[15px]">assignment_ind</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (autoSaveDealTimerRef.current) {
                            clearTimeout(autoSaveDealTimerRef.current);
                            if (handleSaveDealChangesRef.current) {
                              handleSaveDealChangesRef.current({ isAutoSave: true });
                            }
                          }
                          if (onSelectContact) {
                            onSelectContact(resolvedContact);
                          }
                        }}
                        className="font-bold text-[#104882] text-xs hover:underline cursor-pointer text-left"
                      >
                        {resolvedContact.fullName || 'Khách hàng'}
                      </button>
                    </div>

                    <div className="space-y-1 text-slate-600 text-[11px] pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">call</span>
                        <span>Phone:</span>
                        <span className="font-semibold text-slate-800">{resolvedContact.phone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">mail</span>
                        <span>Email:</span>
                        <span className="font-semibold text-slate-800">{resolvedContact.email || '—'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-[28px] text-slate-300 block mb-1">
                      person_off
                    </span>
                    <p className="font-medium text-slate-500">No contact linked</p>
                    <p className="text-[11px] text-slate-400">There is no contact associated with this deal.</p>
                  </div>
                )}
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
                  dealTickets?.map((associatedTicket) => (
                    <div key={associatedTicket.id || associatedTicket.code || Math.random()} className="space-y-1">
                      <div
                        onClick={() => handleOpenTicket(associatedTicket)}
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
                        onClick={() => handleOpenTicket(associatedTicket)}
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
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Undo"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">undo</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
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
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Bold"
                      className="px-1.5 py-0.5 rounded font-bold hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      B
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Italic"
                      className="px-1.5 py-0.5 rounded italic font-serif hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      I
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Underline"
                      className="px-1.5 py-0.5 rounded underline hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      U
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Lists */}
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Bullet List"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Numbered List"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* Alignments */}
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Align Left"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_left</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Align Center"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_center</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                      type="button"
                      title="Align Right"
                      className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">format_align_right</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
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
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
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
                    {noteAttachments?.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs shadow-2xs hover:bg-blue-50 transition group"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewModalFile(file)}
                          className="flex items-center gap-1.5 cursor-pointer text-left"
                          title="Bấm để xem và mở tệp trực tiếp"
                        >
                          <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                          <span className="font-semibold max-w-[200px] truncate group-hover:underline">{file?.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-blue-600">visibility</span>
                        </button>
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

      {/* ── Edit Note Modal (Exact match to Contact Detail & HubSpot) ──────────────── */}
      {showEditNoteModal && editingNote && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditNoteModal(false);
              setIsEditNoteFullscreen(false);
            }
          }}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 my-auto ${
              isEditNoteFullscreen
                ? 'fixed inset-2 max-w-none w-auto h-auto'
                : 'max-w-3xl w-full'
            }`}
          >
            {/* Header */}
            <div className="bg-[#173A75] px-4 py-2.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
                <span className="material-symbols-outlined text-[17px]">edit</span>
                <span>EDIT NOTE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditNoteFullscreen(!isEditNoteFullscreen)}
                  title={isEditNoteFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isEditNoteFullscreen ? 'close_fullscreen' : 'crop_free'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditNoteModal(false);
                    setIsEditNoteFullscreen(false);
                  }}
                  title="Close"
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleEditNoteSubmit} className="p-5 flex flex-col gap-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Content <span className="text-rose-500">*</span>
                </label>
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-400/30 transition">
                  {/* Toolbar */}
                  <div className="bg-[#F8FAFC] border-b border-slate-200 px-2 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 text-xs select-none">
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Bold" className="px-1.5 py-0.5 rounded font-bold hover:bg-slate-200 text-slate-800 cursor-pointer">B</button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Italic" className="px-1.5 py-0.5 rounded italic font-serif hover:bg-slate-200 text-slate-800 cursor-pointer">I</button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Underline" className="px-1.5 py-0.5 rounded underline hover:bg-slate-200 text-slate-800 cursor-pointer">U</button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Bullet List" className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Numbered List" className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                    </button>
                  </div>
                  <textarea
                    rows={isEditNoteFullscreen ? 16 : 8}
                    required
                    value={editNoteBody}
                    onChange={(e) => setEditNoteBody(e.target.value)}
                    placeholder=""
                    className="w-full p-4 focus:outline-none text-slate-800 text-xs sm:text-sm resize-y leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* Attach */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800">Attach</span>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition"
                  >
                    <span className="material-symbols-outlined text-[16px] -rotate-45">attach_file</span>
                    <span>Add new</span>
                  </button>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    onChange={handleEditFileAttach}
                    className="hidden"
                  />
                </div>
                {editNoteAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {editNoteAttachments?.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs shadow-2xs hover:bg-blue-50 transition group"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewModalFile(file)}
                          className="flex items-center gap-1.5 cursor-pointer text-left"
                          title="Bấm để xem và mở tệp trực tiếp"
                        >
                          <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                          <span className="font-semibold max-w-[200px] truncate group-hover:underline">{file?.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-blue-600">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditNoteAttachments((prev) => prev?.filter((a) => a.id !== file.id))}
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

              {/* Action buttons */}
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
                    setShowEditNoteModal(false);
                    setIsEditNoteFullscreen(false);
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
                      <option value="Khanh Nguyen (khanhnguyen31@7)"></option>
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
                    {taskAttachments?.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs shadow-2xs hover:bg-blue-50 transition group"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewModalFile(file)}
                          className="flex items-center gap-1.5 cursor-pointer text-left"
                          title="Bấm để xem và mở tệp trực tiếp"
                        >
                          <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                          <span className="font-semibold max-w-[200px] truncate group-hover:underline">{file?.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-blue-600">visibility</span>
                        </button>
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
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Undo" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">undo</span>
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Redo" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
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
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Bold" className="px-1.5 py-0.5 rounded font-bold hover:bg-slate-200 text-slate-800 cursor-pointer">
                      B
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Italic" className="px-1.5 py-0.5 rounded italic font-serif hover:bg-slate-200 text-slate-800 cursor-pointer">
                      I
                    </button>
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Underline" className="px-1.5 py-0.5 rounded underline hover:bg-slate-200 text-slate-800 cursor-pointer">
                      U
                    </button>

                    <div className="h-4 w-px bg-slate-300 mx-1" />

                    {/* More */}
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="More options" className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer">
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
              {stageHistory?.map((h, i) => (
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
        entityId={deal?.id || dealInfo.id || ''}
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
          paymentStatus,
          payThroughDate,
          quoteCloseDealRep,
          autopayDate,
          nameOnCreditCard,
          creditCardNumber,
          expirationDate,
          cvv,
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
          'Payment Status',
          'Pay Through Date',
          'Quote Close Deal Rep',
          'Autopay Date',
          'Name On Credit Card',
          'Credit Card Number',
          'Expiration Date',
          'CVV',
        ]}
      />

      {/* ── In-App File Preview Modal (Open & view documents/images right in CRM) ─ */}
      <InAppFilePreviewModal
        file={previewModalFile}
        onClose={() => setPreviewModalFile(null)}
      />
    </div>
  );
}
