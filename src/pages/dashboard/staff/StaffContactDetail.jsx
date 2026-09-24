import React, { useState, useEffect, useRef } from 'react';
import { CONTACT_DETAIL_DATA } from '../../../data/mockCrmData';

export default function StaffContactDetail({
  contact,
  onBack,
  onSelectDeal,
  onSelectCustomerDocument,
  onSelectTicket,
}) {
  const [activeTab, setActiveTab] = useState('activity');
  // Accordion states: mở ra mở vô được
  const [sourceLeadOpen, setSourceLeadOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [acaAccountOpen, setAcaAccountOpen] = useState(false);
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  // Right panel accordion states
  const [rightDealsOpen, setRightDealsOpen] = useState(true);
  const [rightTicketsOpen, setRightTicketsOpen] = useState(true);
  const [rightDocsOpen, setRightDocsOpen] = useState(true);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Spouse');
  const [newMemberDob, setNewMemberDob] = useState('');
  const [newMemberGender, setNewMemberGender] = useState('Female');

  // Activities, Notes, and Tasks lists (Empty by default: "tới mục giữa làm data trống lại đi khi thay đổi thông tin gì thì mới cập nhật lên")
  const [activitiesList, setActivitiesList] = useState(contact?.activities || []);
  const [notesList, setNotesList] = useState(contact?.notes || []);
  const [tasksList, setTasksList] = useState(contact?.tasks || []);

  // Modals for Note & Task creation
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

  function logActivity(type, summary, linkText = '', dealId = null) {
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newAct = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      time: timeStr,
      actor: 'Platform Staff',
      summary,
      linkText,
      dealId,
    };
    setActivitiesList((prev) => [newAct, ...prev]);
  }

  // Primary fields (synchronized with create contact)
  const initialPrimary = contact?.primary || CONTACT_DETAIL_DATA.primary || {};
  const [primaryFirstName, setPrimaryFirstName] = useState(
    contact?.firstName || initialPrimary.firstName || 'Nhat Huu Tuan'
  );
  const [primaryMiddleName, setPrimaryMiddleName] = useState(
    contact?.middleName || initialPrimary.middleName || ''
  );
  const [primaryLastName, setPrimaryLastName] = useState(
    contact?.lastName || initialPrimary.lastName || 'Dang'
  );
  const [primaryDob, setPrimaryDob] = useState(initialPrimary.dob || '12/28/1995');
  const [primarySsn, setPrimarySsn] = useState(initialPrimary.ssn || '673-73-0055');
  const [primaryRelation, setPrimaryRelation] = useState(initialPrimary.familyRelationship || 'Self');
  const [primaryGender, setPrimaryGender] = useState(initialPrimary.gender || 'Male');
  const [primaryImmigration, setPrimaryImmigration] = useState(initialPrimary.immigrationStatus || 'Permanent Resident');
  const [primaryAlienNumber, setPrimaryAlienNumber] = useState(initialPrimary.alienNumber || '219802465');
  const [primaryCertificateNumber, setPrimaryCertificateNumber] = useState(initialPrimary.certificateNumber || 'IOE0921776907');
  const [primaryDateExpired, setPrimaryDateExpired] = useState(initialPrimary.dateExpired || '03/31/2036');
  const [primaryHousehold, setPrimaryHousehold] = useState(initialPrimary.household || '');

  // Contact fields
  const [contactPhone, setContactPhone] = useState(
    contact?.rawPhone || (contact?.phone ? contact.phone.replace(/^\+1\s*/, '') : '(714) 837-2395')
  );
  const [contactLanguage, setContactLanguage] = useState(contact?.language || 'Vietnamese');
  const [contactEmail, setContactEmail] = useState(contact?.email || 'tuannhat.n2@gmail.com');

  // Source of Lead fields
  const [leadHowDoYouKnowUs, setLeadHowDoYouKnowUs] = useState(contact?.howDoYouKnowUs || '---');
  const [leadWhoRefer, setLeadWhoRefer] = useState(contact?.whoReferClient || '');
  const [leadContactOwner, setLeadContactOwner] = useState(
    contact?.contactOwner?.name || contact?.contactOwner || 'Khanh Nguyen (khanhnguyen31@7)'
  );
  const [leadSupportAgent, setLeadSupportAgent] = useState(
    contact?.supportAgent || 'Anya Nguyen (anya42@9)'
  );

  // Sync state whenever selected contact changes
  useEffect(() => {
    if (contact) {
      const p = contact.primary || {};
      const fName = contact.firstName !== undefined ? contact.firstName : (p.firstName || '');
      const mName = contact.middleName !== undefined ? contact.middleName : (p.middleName || '');
      const lName = contact.lastName !== undefined ? contact.lastName : (p.lastName || '');

      setPrimaryFirstName(fName || (contact.fullName ? contact.fullName.split(' ')[0] : 'Nhat Huu Tuan'));
      setPrimaryMiddleName(mName || '');
      setPrimaryLastName(lName || (contact.fullName ? contact.fullName.split(' ').slice(-1)[0] : 'Dang'));
      setPrimaryDob(p.dob || '12/28/1995');
      setPrimarySsn(p.ssn || '673-73-0055');
      setPrimaryRelation(p.familyRelationship || 'Self');
      setPrimaryGender(p.gender || 'Male');
      setPrimaryImmigration(p.immigrationStatus || 'Permanent Resident');
      setPrimaryAlienNumber(p.alienNumber || '219802465');
      setPrimaryCertificateNumber(p.certificateNumber || 'IOE0921776907');
      setPrimaryDateExpired(p.dateExpired || '03/31/2036');
      setPrimaryHousehold(p.household || '');

      setContactPhone(
        contact.rawPhone || (contact.phone ? contact.phone.replace(/^\+1\s*/, '') : '(714) 837-2395')
      );
      setContactLanguage(contact.language || 'Vietnamese');
      setContactEmail(contact.email || 'tuannhat.n2@gmail.com');

      setLeadHowDoYouKnowUs(contact.howDoYouKnowUs || '---');
      setLeadWhoRefer(contact.whoReferClient || '');
      setLeadContactOwner(
        contact.contactOwner?.name || contact.contactOwner || 'The Best Rate Insurance'
      );
      setLeadSupportAgent(contact.supportAgent || 'Anya Nguyen (anya42@9)');

      setActivitiesList(contact.activities || []);
      setNotesList(contact.notes || []);
      setTasksList(contact.tasks || []);
    }
  }, [contact]);

  function handleAddMemberSubmit(e) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const memberName = newMemberName.trim();
    setMembersList([
      ...membersList,
      {
        id: Date.now(),
        name: memberName,
        relation: newMemberRelation,
        dob: newMemberDob || '—',
        gender: newMemberGender,
      },
    ]);
    logActivity('Member Added', `added family member: ${memberName} (${newMemberRelation})`);
    setNewMemberName('');
    setNewMemberDob('');
    setShowAddMemberModal(false);
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
      (noteAttachments.length > 0 ? `Attachment: ${noteAttachments[0].name}` : 'General Note');

    const newNote = {
      id: `note-${Date.now()}`,
      title,
      body: noteBody.trim(),
      attachments: [...noteAttachments],
      author: 'Platform Staff',
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
        author: 'Platform Staff',
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
      author: 'Platform Staff',
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
  }

  // Use passed contact info or fallback to CONTACT_DETAIL_DATA
  const contactInfo = {
    ...CONTACT_DETAIL_DATA,
    ...(contact || {}),
  };

  // Dynamic Full Name and Initials
  const currentFullName = [primaryFirstName, primaryMiddleName, primaryLastName]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' ') || contactInfo.fullName || 'Nhat Huu Tuan Dang';

  const currentInitials = currentFullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ND';

  const dealItem = contactInfo.associatedDeals[0];

  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleSaveContactChanges() {
    logActivity('Contact Updated', `updated contact details for ${currentFullName}`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* ── Top Bar Breadcrumbs & Actions (Image 2) ───────────────────────── */}
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Contact Detail</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-md animate-in fade-in">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>Changes Saved & Logged!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveContactChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>Save Contact Info</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>View history</span>
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 3-Column Content Layout (Image 2) ─────────────────────────────── */}
      <div className="flex-grow flex flex-col xl:flex-row overflow-auto">
        {/* ── COLUMN 1: Contact Information (Left Panel ~320px) ───────────── */}
        <div
          className={`bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all duration-200 relative ${
            leftPanelCollapsed ? 'w-12 overflow-hidden' : 'w-full xl:w-[320px] overflow-y-auto'
          }`}
        >
          {/* Collapse/Expand Toggle Button on the border */}
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            title={leftPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
            className="absolute -right-3 top-3 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 z-20 cursor-pointer text-xs"
          >
            <span className="material-symbols-outlined text-[14px]">
              {leftPanelCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {!leftPanelCollapsed && (
            <div className="p-4 flex flex-col gap-3">
              {/* Contact Profile Header (Exact match to uploaded image) */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#4FA0C7] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                  {currentInitials}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      {currentFullName}
                    </h2>
                    <button
                      type="button"
                      title="Edit contact"
                      className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                    <span className="truncate text-blue-700 font-medium">{contactEmail}</span>
                    <button
                      type="button"
                      title="Copy email"
                      className="text-slate-400 hover:text-slate-600 ml-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                    <span>
                      <span className="text-slate-500">Phone:</span> {contactPhone ? (contactPhone.startsWith('+1') ? contactPhone : `+1 ${contactPhone}`) : contactInfo.phone}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">language</span>
                    <span>
                      <span className="text-slate-500">Language:</span> {contactLanguage}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 my-1" />

              {/* Information Bar */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-1.5 font-bold text-[#0F2962]">
                  <span className="material-symbols-outlined text-[17px]">menu_book</span>
                  <span>Information</span>
                </div>
                <button
                  type="button"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium text-[11px]"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>View all properties</span>
                </button>
              </div>

              {/* ── 6 COLLAPSIBLE ACCORDIONS (Exact match to uploaded image) ──── */}
              <div className="border-t border-slate-200 divide-y divide-slate-200">
                {/* 1. Source of Lead */}
                <div className="py-0.5">
                  <button
                    onClick={() => setSourceLeadOpen(!sourceLeadOpen)}
                    className="w-full py-2 flex items-center gap-2 text-left font-bold text-[13px] text-[#0F2962] hover:text-blue-700 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                      {sourceLeadOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span>Source of Lead</span>
                  </button>

                  {sourceLeadOpen && (
                    <div className="p-3 bg-slate-50/70 rounded-lg my-1 space-y-3 text-xs border border-slate-200">
                      {/* 1. Contact Owner */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Contact Owner</label>
                        <div className="relative flex items-center rounded border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-blue-500 hover:border-slate-300 transition">
                          <div className="w-5 h-5 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                            {(leadContactOwner || 'KN').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="flex-grow text-xs text-slate-800 truncate font-medium">
                            {leadContactOwner || 'Khanh Nguyen (khanhnguyen31@7)'}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                            <span
                              onClick={() => setLeadContactOwner('')}
                              className="text-[12px] text-rose-500 hover:text-rose-700 cursor-pointer font-bold px-0.5"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] text-slate-600 pointer-events-none">
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Lead Owner */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Lead Owner</label>
                        <div className="flex items-center rounded border border-slate-200 bg-white px-2.5 py-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                            {(leadContactOwner || 'KN').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="flex-grow text-xs text-slate-800 truncate font-medium">
                            {leadContactOwner || 'Khanh Nguyen (khanhnguyen...'}
                          </span>
                        </div>
                      </div>

                      {/* 3. Support Agent */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Support Agent</label>
                        <div className="relative flex items-center rounded border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-blue-500 hover:border-slate-300 transition">
                          <div className="w-5 h-5 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                            {(leadSupportAgent || 'AN').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="flex-grow text-xs text-slate-800 truncate font-medium">
                            {leadSupportAgent || 'Anya Nguyen (anya42@9)'}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                            <span
                              onClick={() => setLeadSupportAgent('')}
                              className="text-[12px] text-rose-500 hover:text-rose-700 cursor-pointer font-bold px-0.5"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] text-slate-600 pointer-events-none">
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* 4. Contact (Exact match to uploaded image 1) */}
                <div className="py-0.5">
                  <button
                    onClick={() => setContactOpen(!contactOpen)}
                    className="w-full py-2 flex items-center gap-2 text-left font-bold text-[13px] text-[#0F2962] hover:text-blue-700 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                      {contactOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span>Contact</span>
                  </button>

                  {contactOpen && (
                    <div className="p-3 bg-slate-50/70 rounded-lg my-1 space-y-3 text-xs border border-slate-200">
                      {/* Phone */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Phone</label>
                        <div className="relative flex rounded border border-slate-200 bg-white overflow-hidden focus-within:border-blue-500">
                          <span className="px-3 py-1.5 bg-slate-50 border-r border-slate-200 text-slate-700 font-medium text-xs">
                            +1
                          </span>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="flex-grow pl-3 pr-14 py-1.5 text-xs text-slate-800 focus:outline-none bg-transparent"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setContactPhone('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[15px]">call</span>
                          </div>
                        </div>
                      </div>

                      {/* Enrolled Address */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Enrolled Address</label>
                        <input
                          type="text"
                          defaultValue="4301 Laurel Pond Way, Raleigh, NC 27616"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Mailing Address */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Mailing Address</label>
                        <input
                          type="text"
                          defaultValue="4301 Laurel Pond Way, Raleigh, NC 27616"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">State</label>
                        <div className="relative">
                          <select
                            defaultValue="North Carolina (NC)"
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option>North Carolina (NC)</option>
                            <option>Texas (TX)</option>
                            <option>California (CA)</option>
                            <option>Florida (FL)</option>
                            <option>Georgia (GA)</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                            <span className="text-[12px]">✕</span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Street Address */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Street Address</label>
                        <input
                          type="text"
                          defaultValue="4301 Laurel Pond Way"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">City</label>
                        <input
                          type="text"
                          defaultValue="Raleigh"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Postal Code */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Postal Code</label>
                        <input
                          type="text"
                          defaultValue="27616"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* County */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">County</label>
                        <input
                          type="text"
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Language* */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                          Language <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={contactLanguage}
                            onChange={(e) => setContactLanguage(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="Vietnamese">Vietnamese</option>
                            <option value="English">English</option>
                            <option value="Bilingual">Bilingual</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Career */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Career</label>
                        <input
                          type="text"
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. ACA account (Exact match to uploaded image 2) */}
                <div className="py-0.5">
                  <button
                    onClick={() => setAcaAccountOpen(!acaAccountOpen)}
                    className="w-full py-2 flex items-center gap-2 text-left font-bold text-[13px] text-[#0F2962] hover:text-blue-700 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                      {acaAccountOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span>ACA account</span>
                  </button>

                  {acaAccountOpen && (
                    <div className="p-3 bg-slate-50/70 rounded-lg my-1 space-y-3 text-xs border border-slate-200">
                      {/* The Best Rate Ins Email */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">The Best Rate Ins Email</label>
                        <input
                          type="email"
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* ACA Account Status - Normal state */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">ACA Account Status - Normal state</label>
                        <div className="relative">
                          <select
                            defaultValue="Uploaded - Waiting for Verification"
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="Uploaded - Waiting for Verification">Uploaded - Waiting for Verificati...</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="DONE">DONE</option>
                            <option value="Pending - Waiting for Document">Pending - Waiting for Document</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                            <span className="text-[12px]">✕</span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Aca Account */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Aca Account</label>
                        <input
                          type="text"
                          defaultValue="frankdang641@gmail.com"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Aca Pass */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Aca Pass</label>
                        <input
                          type="text"
                          defaultValue="Thebest@2026"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* ACA Account Status - Special States */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">ACA Account Status - Special States</label>
                        <div className="relative">
                          <select
                            defaultValue=""
                            className="w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* ACA Account - Special States */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">ACA Account - Special States</label>
                        <input
                          type="text"
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* ACA Account Password - Special Stat... */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">ACA Account Password - Special Stat...</label>
                        <input
                          type="password"
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Enroll Call Rep */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Enroll Call Rep</label>
                        <div className="relative">
                          <select
                            defaultValue=""
                            className="w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Rep 1">Agent Rep 1</option>
                            <option value="Rep 2">Agent Rep 2</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Primary (Exact match to uploaded image 3) */}
                <div className="py-0.5">
                  <button
                    onClick={() => setPrimaryOpen(!primaryOpen)}
                    className="w-full py-2 flex items-center gap-2 text-left font-bold text-[13px] text-[#0F2962] hover:text-blue-700 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0F2962]">
                      {primaryOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span>Primary</span>
                  </button>

                  {primaryOpen && (
                    <div className="p-3 bg-slate-50/70 rounded-lg my-1 space-y-3 text-xs border border-slate-200">
                      {/* First Name */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">First Name</label>
                        <input
                          type="text"
                          value={primaryFirstName}
                          onChange={(e) => setPrimaryFirstName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Middle Name */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Middle Name</label>
                        <input
                          type="text"
                          value={primaryMiddleName}
                          onChange={(e) => setPrimaryMiddleName(e.target.value)}
                          placeholder=""
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Last Name</label>
                        <input
                          type="text"
                          value={primaryLastName}
                          onChange={(e) => setPrimaryLastName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Date Of Birth */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Date Of Birth</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={primaryDob}
                            onChange={(e) => setPrimaryDob(e.target.value)}
                            className="w-full px-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setPrimaryDob('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                          </div>
                        </div>
                      </div>

                      {/* SSN */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">SSN</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={primarySsn}
                            onChange={(e) => setPrimarySsn(e.target.value)}
                            className="w-full px-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setPrimarySsn('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[15px]">badge</span>
                          </div>
                        </div>
                      </div>

                      {/* Family Relationship */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Family Relationship</label>
                        <div className="relative">
                          <select
                            value={primaryRelation}
                            onChange={(e) => setPrimaryRelation(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Self">Self</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setPrimaryRelation('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Gender</label>
                        <div className="relative">
                          <select
                            value={primaryGender}
                            onChange={(e) => setPrimaryGender(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setPrimaryGender('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Immigration Status */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Immigration Status</label>
                        <div className="relative">
                          <select
                            value={primaryImmigration}
                            onChange={(e) => setPrimaryImmigration(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Permanent Resident">Permanent Resident</option>
                            <option value="US Citizen">US Citizen</option>
                            <option value="Work Visa">Work Visa</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setPrimaryImmigration('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Alien Number */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Alien Number</label>
                        <input
                          type="text"
                          value={primaryAlienNumber}
                          onChange={(e) => setPrimaryAlienNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Certificate Number */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Certificate Number</label>
                        <input
                          type="text"
                          value={primaryCertificateNumber}
                          onChange={(e) => setPrimaryCertificateNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Date Expired */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Date Expired</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={primaryDateExpired}
                            onChange={(e) => setPrimaryDateExpired(e.target.value)}
                            className="w-full px-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            <span
                              onClick={() => setPrimaryDateExpired('')}
                              className="text-[12px] hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </span>
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                          </div>
                        </div>
                      </div>

                      {/* Who live with you in your household? */}
                      <div>
                        <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Who live with you in your household?</label>
                        <div className="relative">
                          <select
                            value={primaryHousehold}
                            onChange={(e) => setPrimaryHousehold(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Alone">Alone</option>
                            <option value="With Spouse">With Spouse</option>
                            <option value="With Family">With Family / Children</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Display added members if any */}
                      {membersList.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-slate-700 font-semibold mb-1.5 text-[11px]">
                            Dependent / Family Members ({membersList.length})
                          </label>
                          <div className="space-y-1.5">
                            {membersList.map((m) => (
                              <div
                                key={m.id}
                                className="p-2 rounded border border-slate-200 bg-white flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-semibold text-slate-800">{m.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {m.relation} • {m.dob} • {m.gender}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setMembersList(membersList.filter((x) => x.id !== m.id))}
                                  className="text-rose-500 hover:text-rose-700 text-xs px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Add Member Button (Exact match to uploaded image) ──────────── */}
              <div className="pt-3 pb-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2962] hover:text-blue-700 hover:bg-blue-50/60 px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600">person_add</span>
                  <span>Add Member</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── COLUMN 2: Timeline & Activity Feed (Middle Panel) ───────────── */}
        <div className="flex-grow bg-white p-4 overflow-y-auto flex flex-col gap-3">
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
                    Changes to contact information, notes, tasks, or member updates will be logged here automatically.
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
                            {act.dealId && (
                              <button
                                onClick={() => onSelectDeal && onSelectDeal(dealItem)}
                                className="text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1 font-semibold"
                              >
                                (Click to open Deal Detail ↗)
                              </button>
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
                    There are no notes recorded for this contact yet. Add notes to keep track of calls or special requests.
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
                    Keep track of follow-ups and action items for this contact by creating your first task.
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
                            className={`font-semibold text-slate-900 ${
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

        {/* ── COLUMN 3: Associated Objects (Right Panel ~320px) ────────────── */}
        <div className="w-full xl:w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col divide-y divide-slate-200 overflow-y-auto">
          {/* Section 1: Deals (1) ─────────────────────────────────────────── */}
          <div>
            {/* Header Accordion Bar */}
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition border-b border-slate-100">
              <button
                type="button"
                onClick={() => setRightDealsOpen(!rightDealsOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0F2962] hover:text-blue-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-700">
                  {rightDealsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span>Deals (1)</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  title="Add deal"
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

            {/* Content Body */}
            {rightDealsOpen && (() => {
              const dealItem = contact?.deals?.[0] || contact?.associatedDeals?.[0] || {
                id: 'D26005033',
                title: 'Non-CMS - Nhat H Dang - OB 10/2026 (NC)',
                shortTitle: 'Non-CMS - Nhat H Dang - OB...',
                pipeline: 'Obamacare 2026',
                stage: 'Ready to Enroll (Obamacare 2026)',
                dealOwner: 'Khanh Nguyen',
                carrier: 'BCBS',
                member: contact?.fullName || 'Nhat Huu Tuan Dang',
              };
              return (
                <div className="p-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs">
                    {/* Title row with badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[15px]">handshake</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectDeal && onSelectDeal(dealItem)}
                        className="font-bold text-[#104882] hover:text-blue-700 hover:underline cursor-pointer truncate text-left text-xs leading-snug"
                      >
                        {dealItem?.shortTitle || dealItem?.title || 'Non-CMS - Nhat H Dang - OB...'}
                      </button>
                    </div>

                    {/* Properties list with icons */}
                    <div className="space-y-1.5 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">bar_chart</span>
                        <span className="text-slate-500">Pipeline:</span>
                        <span className="font-semibold text-slate-800">{dealItem?.pipeline || 'Obamacare 2026'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">trending_up</span>
                        <span className="text-slate-500">Stage:</span>
                        <span className="font-semibold text-slate-800">{dealItem?.stage || 'Ready to Enroll'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
                        <span className="text-slate-500">Deal Owner:</span>
                        <span className="font-semibold text-slate-800">{dealItem?.dealOwner || 'Khanh Nguyen'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">public</span>
                        <span className="text-slate-500">Carrier:</span>
                        <span className="font-semibold text-slate-800">{dealItem?.carrier || 'BCBS'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">badge</span>
                          <span className="text-slate-500">Member:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                            {dealItem?.member || contact?.fullName || 'Nhat Huu Tuan Dang'}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[15px] text-slate-400">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Link */}
                  <button
                    type="button"
                    onClick={() => onSelectDeal && onSelectDeal(dealItem)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer pl-0.5"
                  >
                    <span>» View Associated Deal</span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Section 2: Tickets (1) ───────────────────────────────────────── */}
          <div>
            {/* Header Accordion Bar */}
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

            {/* Content Body */}
            {rightTicketsOpen && (() => {
              const isPaymentContact =
                contact?.fullName?.toLowerCase().includes('hoai thanh') ||
                contact?.email?.includes('nguyenleminhquang');
              const isKenHoContact =
                contact?.fullName?.toLowerCase().includes('ken') ||
                contact?.id === 'CT26002607' ||
                contact?.email?.includes('kylieho');

              const associatedTicket = isPaymentContact
                ? {
                    id: 'TC2600201',
                    title: 'Oct/26 Company Pay ticket',
                    avatar: 'OT',
                    avatarBg: 'bg-[#B25E3B]',
                    pipeline: 'Payment',
                    status: 'Make payment',
                    rawStatus: 'Make payment',
                    priority: 'None',
                    openDays: 9,
                    closeDate: '',
                    dueDate: '09/20/2026',
                    serviceAgent: 'Anya Nguyen (anya42@9)',
                    serviceAgentAvatar: 'AN',
                    ticketOwner: 'Khanh Nguyen (khanhnguyen31@7)',
                    ticketOwnerAvatar: 'KN',
                    carrier: contact?.dealCarrier || 'Kaiser Permanente',
                    contactName: contact?.fullName || 'Hoai thanh Nguyen',
                    contactPhone: contact?.phone || '+1 (838) 776-1434',
                    contactEmail: contact?.email || 'nguyenleminhquang1215@gmail.com',
                    leadOwner: 'Khanh Nguyen',
                    dealTitle: 'Non Commission - Hoai thanh Nguyen - OB 2026',
                    dealShortTitle: 'Non Commission - Hoai thanh...',
                    dealPipeline: 'Obamacare 2026',
                    dealStage: 'Non-Commission - Active',
                    dealOwner: 'Khanh Nguyen',
                    dealCarrier: contact?.dealCarrier || 'Kaiser Permanente',
                  }
                : {
                    id: 'TC2600101',
                    title: 'ACA account 2026',
                    avatar: 'A2',
                    avatarBg: 'bg-[#E05638]',
                    pipeline: 'ACA account',
                    status: 'DONE',
                    rawStatus: 'DONE',
                    priority: 'High',
                    closeDate: '07/20/2026',
                    dueDate: '07/15/2026',
                    serviceAgent: 'Ivy Lu (ivy)',
                    serviceAgentAvatar: 'IL',
                    ticketOwner: 'Jay Ly (trichauly24@7)',
                    ticketOwnerAvatar: 'JL',
                    carrier: contact?.dealCarrier || 'BCBS',
                    contactName: contact?.fullName || (isKenHoContact ? 'Ken xington Ho' : 'Ken xington Ho'),
                    contactPhone: contact?.phone || '+1 (832) 998-9804',
                    contactEmail: contact?.email || 'kylieho@thesuperiorskilledlearners.com',
                    leadOwner: contact?.contactOwner?.name || contact?.contactOwner || 'Jay Ly',
                    dealTitle: isKenHoContact
                      ? 'Ken Ho + Kylie Ho + Kaylee Ho - OB 08/2026'
                      : `${contact?.fullName || 'Client'} - OB 2026`,
                    dealShortTitle: isKenHoContact
                      ? 'Ken Ho + Kylie Ho + Kaylee Ho - ...'
                      : `${contact?.fullName || 'Client'} - OB 2026`,
                    dealPipeline: 'Obamacare 2026',
                    dealStage: 'Enrolled - Active',
                    dealOwner: contact?.contactOwner?.name || contact?.contactOwner || 'Jay Ly',
                    dealCarrier: contact?.dealCarrier || 'BCBS',
                  };

              return (
                <div className="p-3">
                  <div
                    onClick={() => onSelectTicket && onSelectTicket(associatedTicket)}
                    className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
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
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer pl-0.5"
                  >
                    <span>» View Associated Ticket</span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Section 3: Customer Documents (1) (Image 2) ───────────────────── */}
          <div>
            {/* Header Accordion Bar */}
            <div className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 transition border-b border-slate-100">
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
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                  title="Add document"
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

            {/* Content Body */}
            {rightDocsOpen && (
              <div className="p-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs">
                  {/* Title row with document badge */}
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

                  {/* Document categories tree */}
                  <div className="space-y-1 pt-1">
                    {/* Item 1: Identity */}
                    <div
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-700">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600">
                          description
                        </span>
                        <span className="text-xs font-medium">Identity</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">
                        3
                      </span>
                    </div>

                    {/* Item 2: Consent Form Text */}
                    <div
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-700">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600">
                          description
                        </span>
                        <span className="text-xs font-medium">Consent Form Text</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">
                        1
                      </span>
                    </div>

                    {/* Item 3: Payment Information */}
                    <div
                      onClick={() => onSelectCustomerDocument && onSelectCustomerDocument()}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-700">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600">
                          description
                        </span>
                        <span className="text-xs font-medium">Payment Information</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">
                        1
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: LAST UPDATE */}
                  <div className="border-t border-slate-100 pt-2 mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                      <span className="uppercase text-slate-400 font-semibold tracking-wider">LAST UPDATE:</span>
                      <span className="font-bold text-[#0F2962]">09/11/2026</span>
                    </div>
                    <span className="text-[10px] text-slate-400">17:45</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      {/* ── Add Member Modal ────────────────────────────────────────────── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">person_add</span>
                <span>Add Family / Dependent Member</span>
              </h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Member Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Mary Dang"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 bg-white"
                  >
                    <option value="Spouse">Spouse (Vợ/Chồng)</option>
                    <option value="Child">Child (Con cái)</option>
                    <option value="Parent">Parent (Bố/Mẹ)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={newMemberDob}
                  onChange={(e) => setNewMemberDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Note Modal (Exact match to uploaded image) ────────────── */}
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

      {/* ── Create Task Modal (Exact match to uploaded image) ────────────── */}
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
    </div>
  );
}
