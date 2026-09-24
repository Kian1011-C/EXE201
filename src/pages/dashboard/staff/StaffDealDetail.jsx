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

  useEffect(() => {
    if (deal) {
      if (deal.title) setDealTitle(deal.title);
      if (deal.pipeline) setPipeline(deal.pipeline);
      if (deal.stage) setStage(deal.stage);
      if (deal.amount) setAmount(deal.amount);
      if (deal.closeDate) setCloseDate(deal.closeDate);
      if (deal.activities) setActivitiesList(deal.activities);
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
    setActivitiesList((prev) => [newAct, ...prev]);

    if (onUpdateDeal) {
      onUpdateDeal({
        ...dealInfo,
        title: dealTitle,
        pipeline,
        stage: newStage,
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
    dealInfo.adminOnly?.saleSupportStatus || 'Completed'
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
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

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

  function handleCreateNote() {
    if (!newNoteText.trim()) return;
    const note = {
      id: 'note-' + Date.now(),
      text: newNoteText,
      author: 'Anya Nguyen',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setNotes([note, ...notes]);
    setNewNoteText('');
    setIsAddingNote(false);
    showToast('Note added successfully');
  }

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: 'task-' + Date.now(),
      title: newTaskTitle,
      assignedTo: 'Anya Nguyen',
      status: 'Pending',
      dueDate: 'Tomorrow',
    };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
    setIsAddingTask(false);
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
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Sale Support Status
                    </label>
                    <select
                      value={saleSupportStatus}
                      onChange={(e) => setSaleSupportStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700"
                    >
                      <option>Completed</option>
                      <option>In Progress</option>
                      <option>Pending Verification</option>
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
        <div className="flex-grow bg-white p-4 overflow-y-auto flex flex-col gap-3">
          {/* Tabs + Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
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
                  <span className="material-symbols-outlined text-[16px]">
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Actions: + Note, + Task */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAddingNote(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-medium transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">
                  edit_note
                </span>
                <span>Note</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-medium transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">
                  check_circle
                </span>
                <span>Task</span>
              </button>
            </div>
          </div>

          {/* Quick Note Editor */}
          {isAddingNote && (
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 animate-fade-in text-xs">
              <label className="font-bold text-slate-800">Add Deal Note</label>
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter your note about this deal..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="px-3 py-1 bg-[#104882] text-white font-semibold rounded cursor-pointer hover:bg-blue-700"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Quick Task Editor */}
          {isAddingTask && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 animate-fade-in text-xs">
              <label className="font-bold text-slate-800">Add Deal Task</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task description (e.g. Call client for payment verification)..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateTask}
                  className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded cursor-pointer hover:bg-emerald-700"
                >
                  Save Task
                </button>
              </div>
            </div>
          )}

          {/* Tab Content: Activities */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Timeline Activities
              </div>

              {activitiesList && activitiesList.length > 0 ? (
                activitiesList.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs flex flex-col gap-1 text-xs animate-fade-in"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-700">{act.type}</span>
                      <span>{act.time}</span>
                    </div>
                    <div className="text-slate-800 leading-relaxed">
                      <span className="font-semibold text-slate-900">{act.actor}</span>{' '}
                      <span>{act.summary}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No activity recorded yet
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Deal Notes ({notes.length})
              </div>

              {notes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-slate-300">
                    note_stack
                  </span>
                  <p>No notes for this deal yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    + Add first note
                  </button>
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{n.author}</span>
                      <span>{n.date} at {n.time}</span>
                    </div>
                    <p className="text-slate-800">{n.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content: Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Deal Tasks ({tasks.length})
              </div>

              {tasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] text-slate-300">
                    checklist
                  </span>
                  <p>No tasks created for this deal yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(true)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    + Create a task
                  </button>
                </div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">
                        radio_button_unchecked
                      </span>
                      <span className="font-medium text-slate-800">{t.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                      {t.status}
                    </span>
                  </div>
                ))
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

            {rightTicketsOpen && (
              <div className="p-3">
                <div
                  onClick={() => {
                    if (onSelectTicket) {
                      onSelectTicket({
                        id: 'TC2600101',
                        title: 'ACA account 2026',
                        pipeline: 'ACA account',
                        status: 'DONE',
                        rawStatus: 'Uploaded - Waiting for Verification',
                        priority: 'High',
                        closeDate: '05/27/2026',
                        dueDate: '05/14/2026',
                        serviceAgent: 'Sean Ngo (sean75@8)',
                        ticketOwner: 'Tri Tran (tritran92@5)',
                        ticketResult: '',
                        changeDueDateReason: '',
                        carrier: dealInfo.carrier || 'UHC - RMHP',
                        contactName: dealInfo.contactName || 'Minh trang Tran',
                        contactPhone: dealInfo.contactPhone || '3462158034',
                        contactEmail: dealInfo.contactEmail || 'dungnguyen20041960@gmail.com',
                        leadOwner: 'Tri Tran',
                        dealTitle: dealInfo.title || 'Tien Dung Nguyen + Minh Trang Tran- OB 6/26',
                        dealPipeline: dealInfo.pipeline || 'Obamacare 2026',
                        dealStage: dealInfo.stage || 'Enrolled - Active',
                        dealOwner: dealInfo.dealOwner || 'Tri Tran',
                        dealCarrier: dealInfo.carrier || 'UHC - RMHP',
                      });
                    }
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                >
                  {/* Title row with badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition">
                      <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                    </div>
                    <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs">ACA account 2026</span>
                  </div>

                  {/* Properties list with icons matching screenshot */}
                  <div className="space-y-1.5 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">bar_chart</span>
                      <span className="text-slate-500">Pipeline:</span>
                      <span className="font-semibold text-slate-800">ACA account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">trending_up</span>
                      <span className="text-slate-500">Ticket Status:</span>
                      <span className="font-semibold text-slate-800">Uploaded - Waiting for...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                      <span className="text-slate-500">Ticket Owner:</span>
                      <span className="font-semibold text-slate-800">Khanh Nguyen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                      <span className="text-slate-500">Close Date:</span>
                      <span className="text-slate-400 tracking-wider">----------</span>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectTicket) {
                      onSelectTicket({
                        id: 'TC2600101',
                        title: 'ACA account 2026',
                        pipeline: 'ACA account',
                        status: 'DONE',
                        rawStatus: 'Uploaded - Waiting for Verification',
                        priority: 'High',
                        closeDate: '05/27/2026',
                        dueDate: '05/14/2026',
                        serviceAgent: 'Sean Ngo (sean75@8)',
                        ticketOwner: 'Tri Tran (tritran92@5)',
                        ticketResult: '',
                        changeDueDateReason: '',
                        carrier: dealInfo.carrier || 'UHC - RMHP',
                        contactName: dealInfo.contactName || 'Minh trang Tran',
                        contactPhone: dealInfo.contactPhone || '3462158034',
                        contactEmail: dealInfo.contactEmail || 'dungnguyen20041960@gmail.com',
                        leadOwner: 'Tri Tran',
                        dealTitle: dealInfo.title || 'Tien Dung Nguyen + Minh Trang Tran- OB 6/26',
                        dealPipeline: dealInfo.pipeline || 'Obamacare 2026',
                        dealStage: dealInfo.stage || 'Enrolled - Active',
                        dealOwner: dealInfo.dealOwner || 'Tri Tran',
                        dealCarrier: dealInfo.carrier || 'UHC - RMHP',
                      });
                    }
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  » View Associated Ticket
                </button>
              </div>
            )}
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
