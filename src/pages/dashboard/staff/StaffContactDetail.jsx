import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../../auth/AuthContext';



export const AGENT_OPTIONS = [
  'The Best Rate Insurance',
  'Platform Staff',
  'Khanh Nguyen',
  'Anh Que Pham CPA',
  'Sean Ngo',
  'Ivy Le',
  'James Vu',
];

export default function StaffContactDetail({
  contact,
  onBack,
  onSelectDeal,
  onSelectCustomerDocument,
  onSelectTicket,
  onSelectTask,
  onUpdateContact,
}) {
  const { user } = useAuth();
  const currentActor = getCurrentActor(user);
  
  const [dbUsers, setDbUsers] = useState([]);
  const [agentAccounts, setAgentAccounts] = useState(() => []);

  useEffect(() => {
    function handleAccountsUpdated() {
      setAgentAccounts([]);
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);
  useEffect(() => {
    getUsers().then(data => {
      if (Array.isArray(data)) setDbUsers(data);
    }).catch(console.error);
  }, []);

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

  // Property History Modal State (Matching media_1790590629171.png)
  const [showPropertyHistoryModal, setShowPropertyHistoryModal] = useState(false);
  const [selectedHistoryField, setSelectedHistoryField] = useState('Enrolled Address');

  function handleOpenPropertyHistory(fieldName) {
    setSelectedHistoryField(fieldName);
    setShowPropertyHistoryModal(true);
  }

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newlyAddedMemberId, setNewlyAddedMemberId] = useState(null);
  const [membersList, setMembersList] = useState([]);

  // Activities, Notes, and Tasks lists
  const [activitiesList, setActivitiesList] = useState(contact?.activities || []);
  const [notesList, setNotesList] = useState(contact?.notes || []);
  const [tasksList, setTasksList] = useState(() => {
    const cId = String(contact?.id || contact?.code || '');
    const cName = String(contact?.fullName || '').trim().toLowerCase();
    const dynamicTasks = typeof window !== 'undefined' ? [] : [];
    const storeContactTasks = dynamicTasks.filter(
      (t) =>
        (cId && (String(t.contactId) === cId || String(t.contact?.id) === cId || String(t.contact?.code) === cId)) ||
        (cName && t.contactName && t.contactName.trim().toLowerCase() === cName)
    );
    const existing = Array.isArray(contact?.tasks) ? contact.tasks : [];
    return [
      ...storeContactTasks,
      ...existing.filter((et) => !storeContactTasks.some((st) => String(st.id) === String(et.id))),
    ];
  });

  // In-App File Preview Modal State
  const [previewModalFile, setPreviewModalFile] = useState(null);

  // Detailed Task UI States (Screenshots 2 & 3)
  const [collapsedTasks, setCollapsedTasks] = useState({});
  const [taskActionsOpen, setTaskActionsOpen] = useState(null);
  const [activeCommentTaskId, setActiveCommentTaskId] = useState(null);
  const [taskCommentInput, setTaskCommentInput] = useState('');

  // Modals for Note & Task creation
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteAttachments, setNoteAttachments] = useState([]);
  const [createFollowUpTask, setCreateFollowUpTask] = useState(false);
  const [followUpDateTime, setFollowUpDateTime] = useState('09/18/2026, 08:00');
  const [isNoteFullscreen, setIsNoteFullscreen] = useState(false);

  // Edit Note states
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteBody, setEditNoteBody] = useState('');
  const [editNoteAttachments, setEditNoteAttachments] = useState([]);
  const [isEditNoteFullscreen, setIsEditNoteFullscreen] = useState(false);
  const editFileInputRef = useRef(null);

  // Note actions dropdown & card interactions
  const [noteActionsOpen, setNoteActionsOpen] = useState(null); // note.id or null
  const [collapsedNotes, setCollapsedNotes] = useState({});
  const [activeCommentNoteId, setActiveCommentNoteId] = useState(null);
  const [noteComments, setNoteComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [inlineEditingNoteId, setInlineEditingNoteId] = useState(null);
  const [inlineEditBody, setInlineEditBody] = useState('');
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

  // Address fields
  const [enrolledAddress, setEnrolledAddress] = useState(contact?.address || contact?.contactFields?.enrolledAddress || '');
  const [mailingAddress, setMailingAddress] = useState(contact?.mailingAddress || contact?.contactFields?.mailingAddress || '');
  const [streetAddress, setStreetAddress] = useState(contact?.streetAddress || contact?.contactFields?.streetAddress || '');
  const [city, setCity] = useState(contact?.city || contact?.contactFields?.city || '');
  const [contactState, setContactState] = useState(contact?.state || contact?.contactFields?.state || '');
  const [postalCode, setPostalCode] = useState(contact?.zipCode || contact?.contactFields?.postalCode || '');
  const [county, setCounty] = useState(contact?.county || contact?.contactFields?.county || '');

  // ACA Account fields & Status sync state
  const [theBestRateEmail, setTheBestRateEmail] = useState(
    contact?.acaAccount?.theBestRateEmail || ''
  );
  const [acaAccountStatus, setAcaAccountStatus] = useState(
    contact?.acaAccountStatus ||
      contact?.acaAccount?.acaAccountStatus ||
      contact?.acaAccount?.status ||
      ''
  );
  const [acaAccount, setAcaAccount] = useState(
    contact?.acaAccount?.acaAccount || ''
  );
  const [acaPass, setAcaPass] = useState(
    contact?.acaAccount?.acaPass || ''
  );
  const [acaStatusSpecial, setAcaStatusSpecial] = useState(
    contact?.acaAccount?.acaStatusSpecial || ''
  );
  const [acaAccountSpecial, setAcaAccountSpecial] = useState(
    contact?.acaAccount?.acaAccountSpecial || ''
  );
  const [acaPassSpecial, setAcaPassSpecial] = useState(
    contact?.acaAccount?.acaPassSpecial || ''
  );
  const [enrollCallRep, setEnrollCallRep] = useState(
    contact?.acaAccount?.enrollCallRep || ''
  );
  const [isAcaStatusDropdownOpen, setIsAcaStatusDropdownOpen] = useState(false);
  const acaStatusDropdownRef = useRef(null);

  // Deals and Tickets in right sidebar (Tự động quét từ props, local store và live API)
  const resolveDealsForContact = React.useCallback(() => {
    if (!contact) return [];
    const fromProps = contact.associatedDeals || contact.deals || [];
    const cId = String(contact.id || '').trim();
    const cCode = String(contact.code || '').trim();
    const cName = String(contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '').trim().toLowerCase();

    const localDeals = [...[], ...[]].filter((d) => {
      const dContactId = String(d.contactId || d.contact?.id || d.contact?.code || '').trim();
      const dContactName = String(d.contactName || d.contact?.fullName || d.contact?.name || '').trim().toLowerCase();
      const dTitle = String(d.title || d.dealName || '').trim().toLowerCase();
      return (
        (cId && (dContactId === cId || dContactId.toLowerCase() === cId.toLowerCase())) ||
        (cCode && (dContactId === cCode || dContactId.toLowerCase() === cCode.toLowerCase())) ||
        (cName && dContactName && dContactName === cName) ||
        (cName && (dTitle.startsWith(cName) || dTitle.includes(cName)))
      );
    });

    const combined = [...fromProps, ...localDeals];
    const seen = new Set();
    return combined.filter((d) => {
      const key = d.id || d.code;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [contact]);

  const [contactDeals, setContactDeals] = useState(() => resolveDealsForContact());
  const [contactTickets, setContactTickets] = useState(
    contact?.associatedTickets || contact?.tickets || []
  );

  useEffect(() => {
    const deals = resolveDealsForContact();
    setContactDeals(deals);

    // Đồng bộ live từ Backend API nếu có ID hoặc Code
    const cIdentifier = contact?.id || contact?.code;
    if (cIdentifier) {
      getContactDeals(cIdentifier)
        .then((apiDeals) => {
          if (Array.isArray(apiDeals) && apiDeals.length > 0) {
            setContactDeals((prev) => {
              const merged = [...apiDeals, ...prev];
              const seen = new Set();
              return merged.filter((d) => {
                const key = d.id || d.code;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              });
            });
          }
        })
        .catch(() => {});
    }
  }, [contact, resolveDealsForContact]);

  const handleRefreshDeals = () => {
    const deals = resolveDealsForContact();
    setContactDeals(deals);
    const cIdentifier = contact?.id || contact?.code;
    if (cIdentifier) {
      getContactDeals(cIdentifier)
        .then((apiDeals) => {
          if (Array.isArray(apiDeals) && apiDeals.length > 0) {
            setContactDeals((prev) => {
              const merged = [...apiDeals, ...prev];
              const seen = new Set();
              return merged.filter((d) => {
                const key = d.id || d.code;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              });
            });
          }
          showToast('Đã làm mới danh sách Deal!');
        })
        .catch(() => showToast('Đã làm mới danh sách Deal!'));
    } else {
      showToast('Đã làm mới danh sách Deal!');
    }
  };

  // Create Deal modal state
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);

  // Customer Documents state (empty for clean contacts, populated when files are added or for sample contacts)
  const CATEGORY_LABEL_MAP = {
    consentFormMkp: 'Consent Form MKP',
    consentFormText: 'Consent Form Text',
    identity: 'Identity',
    insuranceRecord: 'Insurance Record',
    otherDocument: 'Other Document',
    paymentInformation: 'Payment Information',
    tax: 'Tax',
  };

  const [customerDocuments, setCustomerDocuments] = useState(() => {
    // Brand new contact or explicitly empty documents list -> no documents!
    if (contact?.isNew || (Array.isArray(contact?.customerDocuments) && contact.customerDocuments.length === 0)) {
      return [];
    }
    let initialList = [];
    if (contact?.customerDocuments && Array.isArray(contact.customerDocuments) && contact.customerDocuments.length > 0) {
      initialList = contact.customerDocuments;
    } else if (contact?.customerDocument) {
      initialList = [contact.customerDocument];
    } else {
      const allDocs = getAllCustomerDocuments();
      const contactId = String(contact?.id || '').trim();
      const contactCode = String(contact?.code || '').trim();
      // Strictly match only by contactId or contact code. Never match loosely by contact name!
      const found = allDocs.filter(
        (d) =>
          (contactId && String(d.contactId).trim() === contactId) ||
          (contactCode && String(d.contactId).trim() === contactCode)
      );
      if (found.length > 0) {
        initialList = found;
      }
    }
    // Deduplicate by id or (name + contactId)
    const seen = new Set();
    const unique = [];
    for (const d of initialList) {
      const key = d.id || `${d.name}_${d.contactId || d.contactName}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(d);
      }
    }
    return unique;
  });
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocCategory, setNewDocCategory] = useState('Identity');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [docLastUpdate, setDocLastUpdate] = useState(() => {
    if (contact?.fullName === '123 123') return { date: '09/11/2026', time: '17:45' };
    return { date: '09/27/2026', time: '10:07' };
  });

  const activeCustomerDocuments = useMemo(() => {
    if (contact?.customerDocument?.filesByCategory) {
      const active = [];
      Object.entries(contact.customerDocument.filesByCategory).forEach(([key, files]) => {
        if (Array.isArray(files) && files.length > 0) {
          active.push({
            key,
            name: CATEGORY_LABEL_MAP[key] || key,
            count: files.length,
          });
        }
      });
      return active;
    }
    if (contact?.customerDocuments && contact.customerDocuments.length > 0) {
      return contact.customerDocuments;
    }
    if (contact?.fullName === '123 123' || contact?.hasDocs) {
      return [
        { name: 'Identity', count: 3 },
        { name: 'Consent Form Text', count: 1 },
        { name: 'Payment Information', count: 1 },
      ];
    }
    return customerDocuments;
  }, [contact?.customerDocument, contact?.customerDocuments, customerDocuments, contact?.fullName, contact?.hasDocs]);

  const activeLastUpdate = useMemo(() => {
    if (contact?.customerDocument?.lastModifiedTime) {
      const parts = String(contact.customerDocument.lastModifiedTime).split(',');
      return {
        date: parts[0]?.trim() || docLastUpdate.date,
        time: parts[1]?.trim() || docLastUpdate.time,
      };
    }
    return docLastUpdate;
  }, [contact?.customerDocument?.lastModifiedTime, docLastUpdate]);

  function handleAddDocument(e) {
    e.preventDefault();
    const updatedDocs = (() => {
      const existing = customerDocuments.find((d) => d.name === newDocCategory);
      if (existing) {
        return customerDocuments.map((d) => (d.name === newDocCategory ? { ...d, count: d.count + 1 } : d));
      } else {
        return [...customerDocuments, { name: newDocCategory, count: 1 }];
      }
    })();
    setCustomerDocuments(updatedDocs);
    const now = new Date();
    const dStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setDocLastUpdate({ date: dStr, time: tStr });
    if (onUpdateContact) {
      onUpdateContact({
        ...(contact || {}),
        customerDocuments: updatedDocs,
      });
    }
    setShowAddDocModal(false);
    setNewDocFileName('');
    showToast(`Đã đính kèm tài liệu vào mục ${newDocCategory}!`);
  }

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  // Close ACA status dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        acaStatusDropdownRef.current &&
        !acaStatusDropdownRef.current.contains(event.target)
      ) {
        setIsAcaStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenTicket = (ticketItem) => {
    if (!ticketItem) return;
    const cName =
      [primaryFirstName, primaryMiddleName, primaryLastName].filter(Boolean).join(' ') ||
      contact?.fullName ||
      'Khách hàng';
    const enriched = {
      ...ticketItem,
      id: ticketItem.id || ticketItem.code,
      code: ticketItem.code || ticketItem.id,
      title: ticketItem.title || `Ticket - ${cName}`,
      pipeline: ticketItem.pipeline || 'ACA account',
      contactName: ticketItem.contactName || cName,
      contactId: ticketItem.contactId || contact?.id || contact?.code || '',
      contactPhone: ticketItem.contactPhone || contactPhone || contact?.phone || '',
      contactEmail: ticketItem.contactEmail || contactEmail || contact?.email || '',
      leadOwner: ticketItem.leadOwner || leadContactOwner || contact?.contactOwner || '',
      carrier: ticketItem.carrier || contact?.dealCarrier || '',
      dealTitle: ticketItem.dealTitle || '',
      dealId: ticketItem.dealId || '',
      ticketOwner: ticketItem.ticketOwner || leadContactOwner || 'Khanh Nguyen',
      serviceAgent: ticketItem.serviceAgent || leadContactOwner || 'Platform Staff',
      status: ticketItem.status || ticketItem.stage || 'Open',
      stage: ticketItem.stage || (ticketItem.pipeline === 'ACA account' ? 'Need Create ACA Account (ACA account)' : ''),
    };
    null;
    if (onSelectTicket) {
      onSelectTicket(enriched);
    }
  };

  function handleAcaAccountStatusChange(newStatus) {
    const val = newStatus === '(Trống / Chưa chọn)' ? '' : newStatus;
    if (val === acaAccountStatus) {
      setIsAcaStatusDropdownOpen(false);
      return;
    }
    const oldStatusVal = acaAccountStatus;
    setAcaAccountStatus(val);
    setIsAcaStatusDropdownOpen(false);

    const contactId = contact?.id || contact?.code || 'CT26002600';
    recordPropertyUpdate(
      'contact',
      contactId,
      'ACA Account Status',
      oldStatusVal,
      val,
      currentActor
    );

    const isAca = (t) =>
      t &&
      (t.pipeline === 'ACA account' ||
        (t.title && t.title.toLowerCase().includes('aca account')) ||
        (t.title && t.title.toLowerCase().includes('create aca')));

    // Find any existing ACA ticket(s) in contactTickets
    const existingAcaTicket = contactTickets.find(isAca);
    // Non-ACA tickets preserved as is
    const nonAcaTickets = contactTickets.filter((t) => !isAca(t));

    let updatedTickets = [];

    // Quy trình: Khi chọn "Need Create ACA Account", tự động xuất Ticket ACA account (chỉ xuất 1 lần nếu chưa có)
    if (val === 'Need Create ACA Account') {
      if (existingAcaTicket) {
        // ACA ticket already exists -> update status & stage, DO NOT create duplicate!
        const updatedAcaTicket = {
          ...existingAcaTicket,
          status: 'Need Create ACA Account',
          stage: 'Need Create ACA Account (ACA account)',
          pipeline: 'ACA account',
        };
        null;
        if (updatedAcaTicket.id) {
          updateTicket(updatedAcaTicket.id, updatedAcaTicket).catch(() => {});
        }
        updatedTickets = [updatedAcaTicket, ...nonAcaTickets];
        setContactTickets(updatedTickets);
        showToast('Đã chuyển trạng thái ACA và cập nhật Ticket ACA account!');
      } else {
        // No ACA ticket exists -> create exactly 1 new ticket
        const cName =
          [primaryFirstName, primaryMiddleName, primaryLastName].filter(Boolean).join(' ') ||
          contact?.fullName ||
          'Khách hàng';
        const newTicketId = `TC2600${Math.floor(1000 + Math.random() * 9000)}`;
        const acaTicket = {
          id: newTicketId,
          code: newTicketId,
          title: `Create ACA account - ${cName}`,
          pipeline: 'ACA account',
          stage: 'Need Create ACA Account (ACA account)',
          status: 'Need Create ACA Account',
          priority: 'High',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          }),
          ticketOwner: leadContactOwner || 'Khanh Nguyen',
          ticketOwnerAvatar: (leadContactOwner || 'KN').slice(0, 2).toUpperCase(),
          serviceAgent: leadContactOwner || 'Platform Staff',
          contactName: cName,
          contactId: contact?.id || contact?.code || '',
          contactPhone: contactPhone || contact?.phone || '',
          contactEmail: contactEmail || contact?.email || '',
          leadOwner: leadContactOwner || contact?.contactOwner || '',
          carrier: contact?.dealCarrier || '',
          dealTitle: '',
          dealId: '',
          description: `Tự động tạo Ticket khi chuyển trạng thái Need Create ACA Account cho khách hàng ${cName}`,
          createdAt: new Date().toISOString(),
          activities: [],
          comments: [],
        };

        createTicket(acaTicket).catch(() => {});
        null;
        updatedTickets = [acaTicket, ...nonAcaTickets];
        setContactTickets(updatedTickets);

        logActivity('Ticket Created', `Tự động xuất ticket: ${acaTicket.title} (ACA account)`);
        showToast(`Đã chuyển trạng thái và tự động xuất Ticket: ${acaTicket.title}!`);
      }
    } else {
      // Khi chuyển sang trường khác (Pending, Uploaded, VERIFIED, Unverified, DONE, Plan Cancelled, hoặc trống)
      // Nếu đã có ACA ticket thì đồng bộ status của ticket theo!
      if (existingAcaTicket) {
        const stageVal =
          val === 'DONE'
            ? 'DONE (ACA account)'
            : val === 'Need Create ACA Account'
            ? 'Need Create ACA Account (ACA account)'
            : val
            ? `${val} (ACA account)`
            : 'ACA account';

        const updatedAcaTicket = {
          ...existingAcaTicket,
          status: val || 'Open',
          stage: stageVal,
          pipeline: 'ACA account',
        };
        null;
        if (updatedAcaTicket.id) {
          updateTicket(updatedAcaTicket.id, updatedAcaTicket).catch(() => {});
        }
        updatedTickets = [updatedAcaTicket, ...nonAcaTickets];
        setContactTickets(updatedTickets);
        showToast(`Đã cập nhật trạng thái ACA: ${val || 'Trống'} và đồng bộ Ticket ACA!`);
      } else {
        updatedTickets = nonAcaTickets;
        setContactTickets(updatedTickets);
        showToast(`Đã cập nhật trạng thái ACA: ${val || 'Trống'}`);
      }
    }

    const nextContact = {
      ...contact,
      acaAccountStatus: val,
      associatedTickets: updatedTickets,
      tickets: updatedTickets,
      acaAccount: {
        ...(contact?.acaAccount || {}),
        acaAccountStatus: val,
        status: val,
      },
    };
    null;
    if (onUpdateContact) {
      onUpdateContact(nextContact);
    }
  }

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

    const contactId = contact?.id || contact?.code;
    if (contactId) {
      addContactActivity(contactId, {
        type,
        description: summary,
        actor: 'Platform Staff',
      }).catch((err) => console.warn('[StaffContactDetail] addContactActivity fallback:', err));
    }
  }

  // Primary fields (synchronized with create contact)
  const initialPrimary = contact?.primary || (contact ? {} : ({}));
  const [primaryFirstName, setPrimaryFirstName] = useState(
    contact?.firstName || initialPrimary.firstName || ''
  );
  const [primaryMiddleName, setPrimaryMiddleName] = useState(
    contact?.middleName || initialPrimary.middleName || ''
  );
  const [primaryLastName, setPrimaryLastName] = useState(
    contact?.lastName || initialPrimary.lastName || ''
  );

  // Quick name edit state & handlers (from pencil icon)
  const [isEditingName, setIsEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editLastName, setEditLastName] = useState('');

  function handleStartEditName() {
    setEditFirstName(primaryFirstName);
    setEditMiddleName(primaryMiddleName);
    setEditLastName(primaryLastName);
    setIsEditingName(true);
  }

  function handleSaveName() {
    const f = (editFirstName || '').trim();
    const m = (editMiddleName || '').trim();
    const l = (editLastName || '').trim();
    setPrimaryFirstName(f);
    setPrimaryMiddleName(m);
    setPrimaryLastName(l);
    setIsEditingName(false);
    const newName = [f, m, l].filter(Boolean).join(' ') || 'Khách hàng';

    const updatedContact = {
      ...(contact || {}),
      firstName: f,
      middleName: m,
      lastName: l,
      fullName: newName,
      name: newName,
      primary: {
        ...(contact?.primary || {}),
        firstName: f,
        middleName: m,
        lastName: l,
      },
    };

    null;
    if (contact?.id) {
      updateContact(contact.id, {
        firstName: f,
        middleName: m,
        lastName: l,
      }).catch(() => null);
    }
    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }
    logActivity('Contact Name Updated', `changed name to "${newName}"`);
    showToast(`Đã đổi tên liên hệ thành: ${newName}`);
  }

  function handleCancelEditName() {
    setIsEditingName(false);
  }
  const [primaryDob, setPrimaryDob] = useState(initialPrimary.dob || '');
  const [primarySsn, setPrimarySsn] = useState(initialPrimary.ssn || '');
  const [primaryRelation, setPrimaryRelation] = useState(initialPrimary.familyRelationship || 'Self');
  const [primaryGender, setPrimaryGender] = useState(initialPrimary.gender || '');
  const [primaryImmigration, setPrimaryImmigration] = useState(initialPrimary.immigrationStatus || '');
  const [primaryAlienNumber, setPrimaryAlienNumber] = useState(initialPrimary.alienNumber || '');
  const [primaryCertificateNumber, setPrimaryCertificateNumber] = useState(initialPrimary.certificateNumber || '');
  const [primaryDateExpired, setPrimaryDateExpired] = useState(initialPrimary.dateExpired || '');
  const [primaryHousehold, setPrimaryHousehold] = useState(initialPrimary.household || '');

  // Contact fields
  const [contactPhone, setContactPhone] = useState(
    contact?.rawPhone || contact?.phone || ''
  );
  const [contactLanguage, setContactLanguage] = useState(contact?.language || 'Vietnamese');
  const [contactEmail, setContactEmail] = useState(contact?.email || '');

  // Source of Lead fields
  const [leadHowDoYouKnowUs, setLeadHowDoYouKnowUs] = useState(contact?.howDoYouKnowUs || '');
  const [leadWhoRefer, setLeadWhoRefer] = useState(contact?.whoReferClient || '');
  const [leadContactOwner, setLeadContactOwner] = useState(
    getPersonName(contact?.contactOwner, 'The Best Rate Insurance')
  );

  // Sync state whenever selected contact changes
  useEffect(() => {
    if (contact) {
      const p = contact.primary || {};
      const fName = contact.firstName !== undefined ? contact.firstName : (p.firstName || '');
      const mName = contact.middleName !== undefined ? contact.middleName : (p.middleName || '');
      const lName = contact.lastName !== undefined ? contact.lastName : (p.lastName || '');

      setPrimaryFirstName(fName || (contact.fullName ? contact.fullName.split(' ')[0] : ''));
      setPrimaryMiddleName(mName || '');
      setPrimaryLastName(lName || (contact.fullName ? contact.fullName.split(' ').slice(-1)[0] : ''));
      setPrimaryDob(p.dob || '');
      setPrimarySsn(p.ssn || '');
      setPrimaryRelation(p.familyRelationship || 'Self');
      setPrimaryGender(p.gender || '');
      setPrimaryImmigration(p.immigrationStatus || '');
      setPrimaryAlienNumber(p.alienNumber || '');
      setPrimaryCertificateNumber(p.certificateNumber || '');
      setPrimaryDateExpired(p.dateExpired || '');
      setPrimaryHousehold(p.household || '');

      setContactPhone(contact.rawPhone || contact.phone || '');
      setContactLanguage(contact.language || 'Vietnamese');
      setContactEmail(contact.email || '');

      const cf = contact.contactFields || {};
      setEnrolledAddress(contact.address || cf.enrolledAddress || '');
      setMailingAddress(contact.mailingAddress || cf.mailingAddress || '');
      setStreetAddress(contact.streetAddress || cf.streetAddress || '');
      setCity(contact.city || cf.city || '');
      setContactState(contact.state || cf.state || '');
      setPostalCode(contact.zipCode || cf.postalCode || '');
      setCounty(contact.county || cf.county || '');

      setLeadHowDoYouKnowUs(contact.howDoYouKnowUs || '');
      setLeadWhoRefer(contact.whoReferClient || '');
      setLeadContactOwner(
        getPersonName(contact.contactOwner, 'The Best Rate Insurance')
      );

      const aca = contact.acaAccount || {};
      const s = contact.acaAccountStatus || aca.acaAccountStatus || aca.status || '';
      setAcaAccountStatus(s);
      setAcaAccount(aca.acaAccount || '');
      setAcaPass(aca.acaPass || '');
      setTheBestRateEmail(aca.theBestRateEmail || '');
      setAcaStatusSpecial(aca.acaStatusSpecial || '');
      setAcaAccountSpecial(aca.acaAccountSpecial || '');
      setAcaPassSpecial(aca.acaPassSpecial || '');
      setEnrollCallRep(aca.enrollCallRep || '');

      setActivitiesList(contact.activities || []);
      setNotesList(contact.notes || []);
      setTasksList(contact.tasks || []);
      setMembersList(contact.members || []);

      setContactDeals(contact.associatedDeals || contact.deals || []);
      const rawTickets = contact.associatedTickets || contact.tickets || [];
      const isAca = (t) =>
        t &&
        (t.pipeline === 'ACA account' ||
          (t.title && t.title.toLowerCase().includes('aca account')) ||
          (t.title && t.title.toLowerCase().includes('create aca')));
      let seenAca = false;
      const deduplicatedTickets = rawTickets.filter((t) => {
        if (isAca(t)) {
          if (seenAca) return false;
          seenAca = true;
          return true;
        }
        return true;
      });
      setContactTickets(deduplicatedTickets);

      // Sync customer documents for this contact
      let initialDocs = [];
      if (contact.isNew || (Array.isArray(contact.customerDocuments) && contact.customerDocuments.length === 0)) {
        initialDocs = [];
      } else if (contact.customerDocuments && Array.isArray(contact.customerDocuments) && contact.customerDocuments.length > 0) {
        initialDocs = contact.customerDocuments;
      } else if (contact.customerDocument) {
        initialDocs = [contact.customerDocument];
      } else {
        const allDocs = getAllCustomerDocuments();
        const contactId = String(contact.id || '').trim();
        const contactCode = String(contact.code || '').trim();
        // Strictly match only by contactId or contact code. Never match loosely by contact name!
        const found = allDocs.filter(
          (d) =>
            (contactId && String(d.contactId).trim() === contactId) ||
            (contactCode && String(d.contactId).trim() === contactCode)
        );
        if (found.length > 0) {
          initialDocs = found;
        }
      }
      // Deduplicate by id or (name + contactId)
      const seen = new Set();
      const uniqueDocs = [];
      for (const d of initialDocs) {
        const key = d.id || `${d.name}_${d.contactId || d.contactName}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueDocs.push(d);
        }
      }
      // If contact has customerDocument with newer files, merge into uniqueDocs (only if not newly created)
      if (contact.customerDocument && !contact.isNew) {
        const docIdx = uniqueDocs.findIndex(
          (d) => d.id === contact.customerDocument.id || d.name === contact.customerDocument.name
        );
        if (docIdx >= 0) {
          uniqueDocs[docIdx] = { ...uniqueDocs[docIdx], ...contact.customerDocument };
        } else if (uniqueDocs.length === 0) {
          uniqueDocs.push(contact.customerDocument);
        }
      }
      setCustomerDocuments(uniqueDocs);

      if (contact.notes) setNotesList(contact.notes);
      if (contact.activities) setActivitiesList(contact.activities);

      const cId = String(contact.id || contact.code || '');
      const cName = String(contact.fullName || '').trim().toLowerCase();
      const dynamicTasks = typeof window !== 'undefined' ? [] : [];
      const storeContactTasks = dynamicTasks.filter(
        (t) =>
          (cId && (String(t.contactId) === cId || String(t.contact?.id) === cId || String(t.contact?.code) === cId)) ||
          (cName && t.contactName && t.contactName.trim().toLowerCase() === cName)
      );
      const existingTasks = Array.isArray(contact.tasks) ? contact.tasks : [];
      const mergedTasks = [
        ...storeContactTasks,
        ...existingTasks.filter((et) => !storeContactTasks.some((st) => String(st.id) === String(et.id))),
      ];
      setTasksList(mergedTasks);
    }
  }, [contact]);

  function handleSaveMember(formData) {
    let relation = 'Dependent';
    if (!membersList.some(m => m.relation === 'Spouse') && formData.isSpouse) {
      relation = 'Spouse';
    }

    const newMember = {
      id: Date.now(),
      ...formData,
      relation: relation
    };

    let updatedList = [...membersList, newMember];
    
    let depCount = 1;
    updatedList = updatedList.map(m => {
      if (m.relation !== 'Spouse') {
        return { ...m, relation: `Dependent ${depCount++}` };
      }
      return m;
    });

    setMembersList(updatedList);
    
    const updatedContact = {
      ...(contact || {}),
      members: updatedList
    };
    null;
    if (onUpdateContact) onUpdateContact(updatedContact);
    
    logActivity('Member Added', `added family member: ${formData.firstName} (${relation})`);
    setShowAddMemberModal(false);
    setNewlyAddedMemberId(newMember.id);
  }

  function handleUpdateMember(id, updatedMember) {
    let updatedList = membersList.map(m => m.id === id ? updatedMember : m);
    // Recalculate dependents just in case (though relation isn't edited directly)
    let depCount = 1;
    updatedList = updatedList.map(m => {
      if (m.relation !== 'Spouse') {
        return { ...m, relation: `Dependent ${depCount++}` };
      }
      return m;
    });
    setMembersList(updatedList);

    const updatedContact = {
      ...(contact || {}),
      members: updatedList
    };
    null;
    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }
  }

  function handleDeleteMember(id) {
    let updatedList = membersList.filter(x => x.id !== id);
    let depCount = 1;
    updatedList = updatedList.map(m => {
      if (m.relation !== 'Spouse') {
        return { ...m, relation: `Dependent ${depCount++}` };
      }
      return m;
    });
    setMembersList(updatedList);
    
    const updatedContact = {
      ...(contact || {}),
      members: updatedList
    };
    null;
    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }
  }

  // Close note actions dropdown when clicking outside
  useEffect(() => {
    if (noteActionsOpen === null) return;
    const handler = () => setNoteActionsOpen(null);
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [noteActionsOpen]);

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
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
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

    const newNote = {
      id: `note-${Date.now()}`,
      title,
      body: noteBody.trim(),
      attachments: [...noteAttachments],
      author: currentAuthor,
      time: timeStr,
    };
    const updatedList = [newNote, ...notesList];
    updateAndPersistNotes(updatedList);

    const targetContactId = contact?.id || contact?.code;
    if (targetContactId) {
      addContactNote(targetContactId, {
        title,
        text: noteBody.trim(),
        body: noteBody.trim(),
        author: currentAuthor,
        attachments: JSON.stringify(noteAttachments),
      }).catch((err) => console.warn('[StaffContactDetail] addContactNote fallback:', err));
    }

    const attachSuffix =
      noteAttachments.length > 0
        ? ` with ${noteAttachments.length} file(s) attached`
        : '';
    logActivity('Note Added', `added note: "${title}"${attachSuffix}`);
    showToast('Đã tạo note thành công!');

    // If "Create a To Do task to follow up" is checked
    if (createFollowUpTask) {
      const newTask = {
        id: `task-${Date.now()}`,
        code: `TSK2600${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Follow up on note: ${title}`,
        content: `Follow up on note: "${title}"`,
        dueDate: followUpDateTime || '10/12/2026, 08:00',
        sendRemind: 'No remind',
        assignee: 'Thao Phan (therasaphan24@6)',
        priority: 'Medium',
        taskType: 'To Do',
        attachments: [],
        status: 'Pending',
        author: currentAuthor,
        createdAt: timeStr,
        contactId: contact?.id || contact?.code || '',
        contactName: currentFullName || contact?.fullName || '',
        comments: [],
      };
      const updatedTasks = [newTask, ...tasksList];
      updateAndPersistTasks(updatedTasks);
      null;
      createTask(newTask).catch(() => {});

      if (targetContactId) {
        addContactTask(targetContactId, {
          title: newTask.title,
          dueDate: newTask.dueDate,
          priority: 'Medium',
          status: 'OPEN',
        }).catch((err) => console.warn('[StaffContactDetail] addContactTask fallback:', err));
      }

      logActivity('Task Created', `created follow-up task: "${newTask.title}" (Due: ${newTask.dueDate})`);
    }

    setNoteTitle('');
    setNoteBody('');
    setNoteAttachments([]);
    setCreateFollowUpTask(false);
    setIsNoteFullscreen(false);
    setShowCreateNoteModal(false);
  }

  function updateAndPersistNotes(newList) {
    setNotesList(newList);
    if (contact) {
      contact.notes = newList;
      if (onUpdateContact) {
        onUpdateContact({ ...contact, notes: newList });
      }
      null;
    }
    
  }

  function updateAndPersistTasks(newTasks) {
    setTasksList(newTasks);
    if (contact) {
      const updated = { ...contact, tasks: newTasks };
      if (onUpdateContact) onUpdateContact(updated);
      null;
    }
    
  }

  function handleCardFileAttach(noteId, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    const updatedList = notesList.map((n) =>
      n.id === noteId
        ? { ...n, attachments: [...(n.attachments || []), ...newAttach] }
        : n
    );
    updateAndPersistNotes(updatedList);
    logActivity('Attachment Added', `attached ${newAttach.length} file(s) to note`);
    showToast(`Đã đính kèm ${newAttach.length} tệp vào note`);
    e.target.value = '';
  }

  function handleRemoveAttachmentFromNote(noteId, attId) {
    const updatedList = notesList.map((n) =>
      n.id === noteId
        ? { ...n, attachments: (n.attachments || []).filter((a) => a.id !== attId) }
        : n
    );
    updateAndPersistNotes(updatedList);
    showToast('Đã xóa tệp đính kèm');
  }

  function handleAddComment(noteId) {
    if (!commentInput.trim()) return;
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
      text: commentInput.trim(),
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
    if (!inlineEditBody.trim()) return;
    const updatedTitle = inlineEditBody.trim().split('\n')[0].slice(0, 60);
    const updatedList = notesList.map((n) =>
      n.id === noteId
        ? { ...n, title: updatedTitle, body: inlineEditBody.trim(), edited: true }
        : n
    );
    updateAndPersistNotes(updatedList);
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
    if (!editNoteBody.trim() && editNoteAttachments.length === 0) return;
    const updatedTitle =
      editNoteBody.trim().split('\n')[0].slice(0, 60) || (editingNote ? editingNote.title : 'Note');
    const updatedList = notesList.map((n) =>
      n.id === editingNote.id
        ? { ...n, title: updatedTitle, body: editNoteBody.trim(), attachments: [...editNoteAttachments], edited: true }
        : n
    );
    updateAndPersistNotes(updatedList);
    logActivity('Note Edited', `edited note: "${updatedTitle}"`);
    setShowEditNoteModal(false);
    setEditingNote(null);
    setEditNoteBody('');
    setEditNoteAttachments([]);
    setIsEditNoteFullscreen(false);
    showToast('Đã lưu chỉnh sửa note thành công!');
  }

  function handleDeleteNote(noteId) {
    const updatedList = notesList.filter((n) => n.id !== noteId);
    updateAndPersistNotes(updatedList);
    logActivity('Note Deleted', 'deleted a note');
    setNoteActionsOpen(null);
    showToast('Đã xóa note thành công!');
  }

  function handleEditFileAttach(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files.map((file) => ({
      id: `att-e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
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
    const newAttach = files.map((file) => ({
      id: `att-t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
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
    setTaskAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  // ── Task card interaction handlers (matching Screenshots 2 & 3) ────────────
  function handleToggleTaskStatus(taskId) {
    const task = tasksList.find((t) => t.id === taskId);
    if (!task) return;
    const isCompleted = task.status === 'Completed' || task.status === 'COMPLETED' || task.status === 'DONE';
    const newStatus = isCompleted ? 'Pending' : 'Completed';
    const updated = { ...task, status: newStatus };
    const updatedList = tasksList.map((t) => (t.id === taskId ? updated : t));
    updateAndPersistTasks(updatedList);
    null;
    updateTask(taskId, updated).catch(() => {});
    logActivity('Task Status', `marked task "${task.title}" as ${newStatus}`);
    showToast(`Task marked as ${newStatus}`);
  }

  function handleDeleteTask(taskId) {
    const updatedList = tasksList.filter((t) => t.id !== taskId);
    updateAndPersistTasks(updatedList);
    deleteTaskFromStore(taskId);
    logActivity('Task Deleted', 'deleted a task');
    showToast('Task deleted successfully');
  }

  function handleAddTaskComment(taskId) {
    if (!taskCommentInput.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    let author = 'Khanh Nguyen (khanhnguyen31@7)';
    try {
      const raw = localStorage.getItem('tbri_user');
      if (raw) {
        const u = JSON.parse(raw);
        author = u.name || u.fullName || author;
      }
    } catch (_) {}

    const newComment = {
      id: `tc-${Date.now()}`,
      text: taskCommentInput.trim(),
      author,
      time: timeStr,
    };

    const updatedList = tasksList.map((t) => {
      if (t.id === taskId) {
        const comments = [...(t.comments || []), newComment];
        const updatedT = { ...t, comments };
        null;
        return updatedT;
      }
      return t;
    });
    updateAndPersistTasks(updatedList);
    setTaskCommentInput('');
    showToast('Đã thêm ghi chú vào task');
  }

  function handleCardTaskFileAttach(taskId, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newAttach = files.map((file) => ({
      id: `att-t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));
    const updatedList = tasksList.map((t) => {
      if (t.id === taskId) {
        const attachments = [...(t.attachments || []), ...newAttach];
        const updatedT = { ...t, attachments };
        null;
        return updatedT;
      }
      return t;
    });
    updateAndPersistTasks(updatedList);
    showToast(`Đã đính kèm ${newAttach.length} tệp vào task`);
    e.target.value = '';
  }

  function handleRemoveAttachmentFromTask(taskId, attId) {
    const updatedList = tasksList.map((t) => {
      if (t.id === taskId) {
        const attachments = (t.attachments || []).filter((a) => a.id !== attId);
        const updatedT = { ...t, attachments };
        null;
        return updatedT;
      }
      return t;
    });
    updateAndPersistTasks(updatedList);
    showToast('Đã xóa tệp đính kèm khỏi task');
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

    const targetContactId = contact?.id || contact?.code || '';
    const targetContactName = currentFullName || contact?.fullName || '';

    const newTask = {
      id: `task-${Date.now()}`,
      code: `TSK2600${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      content: taskContent.trim(),
      dueDate: dueFormatted || '10/12/2026, 08:00',
      sendRemind: taskRemind || '--',
      assignee: taskAssignee || 'Thao Phan (therasaphan24@6)',
      priority: taskPriority || 'None',
      taskType: taskType || '--',
      attachments: [...taskAttachments],
      status: 'Pending',
      author: currentActor || 'Khanh Nguyen (khanhnguyen31@7)',
      createdAt: timeStr,
      contactId: targetContactId,
      contactName: targetContactName,
      comments: [],
    };

    // 1. Update contact tasks state and persist to store
    const updatedList = [newTask, ...tasksList];
    updateAndPersistTasks(updatedList);

    // 2. Add to global dynamic tasks store
    null;

    // 3. Sync to backend API
    createTask(newTask).catch((err) => {
      console.warn('Backend task create failed, saved locally:', err);
    });

    if (targetContactId) {
      addContactTask(targetContactId, {
        title: newTask.title,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        status: 'OPEN',
      }).catch((err) => console.warn('[StaffContactDetail] addContactTask direct fallback:', err));
    }

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

  // Use passed contact info or fallback to null
  const contactInfo = contact || {};

  // Dynamic Full Name and Initials
  const currentFullName = [primaryFirstName, primaryMiddleName, primaryLastName]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' ') || contactInfo.fullName || (contact ? 'Liên hệ mới' : 'Nhat Huu Tuan Dang');

  const currentInitials = currentFullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ND';

  const dealItem = contactDeals[0] || null;

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const autoSaveTimerRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const lastSavedJsonRef = useRef('');

  function handleSaveContactChanges(options = {}) {
    const { isAutoSave = false } = options;
    const updatedContact = {
      ...(contact || {}),
      firstName: primaryFirstName,
      middleName: primaryMiddleName,
      lastName: primaryLastName,
      fullName: currentFullName,
      name: currentFullName,
      phone: contactPhone,
      email: contactEmail,
      language: contactLanguage,
      contactOwner: leadContactOwner,
      leadOwner: leadContactOwner,
      howDoYouKnowUs: leadHowDoYouKnowUs,
      whoReferClient: leadWhoRefer,
      enrolledAddress: enrolledAddress,
      mailingAddress: mailingAddress,
      contactFields: {
        ...(contact?.contactFields || {}),
        enrolledAddress,
        mailingAddress,
        streetAddress,
        city,
        state: contactState,
        postalCode,
        county,
      },
      primary: {
        ...(contact?.primary || {}),
        firstName: primaryFirstName,
        middleName: primaryMiddleName,
        lastName: primaryLastName,
        dob: primaryDob,
        ssn: primarySsn,
        gender: primaryGender,
        immigrationStatus: primaryImmigration,
        alienNumber: primaryAlienNumber,
        certificateNumber: primaryCertificateNumber,
        dateExpired: primaryDateExpired,
        household: primaryHousehold,
      },
      acaAccount: {
        ...(contact?.acaAccount || {}),
        theBestRateEmail,
        acaAccount,
        acaPass,
        acaStatusSpecial,
        acaAccountSpecial,
        acaPassSpecial,
        enrollCallRep,
      },
    };

    null;

    // Record property history updates in batch with dynamic current actor
    const contactId = contact?.id || contact?.code || 'CT26002600';
    const oldCF = contact?.contactFields || {};
    const oldPrimary = contact?.primary || {};
    const oldAca = contact?.acaAccount || {};

    const updates = [
      { fieldName: 'Enrolled Address', oldValue: oldCF.enrolledAddress || contact?.address || '', newValue: enrolledAddress },
      { fieldName: 'Phone', oldValue: contact?.phone || oldCF.phone || '', newValue: contactPhone },
      { fieldName: 'Email', oldValue: contact?.email || oldCF.email || '', newValue: contactEmail },
      { fieldName: 'Mailing Address', oldValue: oldCF.mailingAddress || '', newValue: mailingAddress },
      { fieldName: 'Street Address', oldValue: oldCF.streetAddress || '', newValue: streetAddress },
      { fieldName: 'State', oldValue: oldCF.state || contact?.state || '', newValue: contactState },
      { fieldName: 'City', oldValue: oldCF.city || contact?.city || '', newValue: city },
      { fieldName: 'Postal Code', oldValue: oldCF.postalCode || contact?.zipCode || '', newValue: postalCode },
      { fieldName: 'County', oldValue: oldCF.county || '', newValue: county },
      { fieldName: 'Language', oldValue: contact?.language || 'Vietnamese', newValue: contactLanguage },
      { fieldName: 'First Name', oldValue: contact?.firstName || oldPrimary.firstName || '', newValue: primaryFirstName },
      { fieldName: 'Middle Name', oldValue: contact?.middleName || oldPrimary.middleName || '', newValue: primaryMiddleName },
      { fieldName: 'Last Name', oldValue: contact?.lastName || oldPrimary.lastName || '', newValue: primaryLastName },
      { fieldName: 'Date Of Birth', oldValue: contact?.dateOfBirth || oldPrimary.dob || '', newValue: primaryDob },
      { fieldName: 'SSN', oldValue: contact?.ssn || oldPrimary.ssn || '', newValue: primarySsn },
      { fieldName: 'Gender', oldValue: contact?.gender || oldPrimary.gender || '', newValue: primaryGender },
      { fieldName: 'Immigration Status', oldValue: contact?.immigrationStatus || oldPrimary.immigrationStatus || '', newValue: primaryImmigration },
      { fieldName: 'ACA Account Status', oldValue: contact?.acaAccountStatus || oldAca.acaAccountStatus || oldAca.status || '', newValue: acaAccountStatus },
      { fieldName: 'Contact Owner', oldValue: getPersonName(contact?.contactOwner, ''), newValue: leadContactOwner },
      { fieldName: 'How do you know us', oldValue: contact?.howDoYouKnowUs || '', newValue: leadHowDoYouKnowUs },
      { fieldName: 'Who refer client', oldValue: contact?.whoReferClient || '', newValue: leadWhoRefer },
      { fieldName: 'Aca Account', oldValue: oldAca.acaAccount || '', newValue: acaAccount },
      { fieldName: 'Aca Pass', oldValue: oldAca.acaPass || '', newValue: acaPass },
      { fieldName: 'ACA Status Special', oldValue: oldAca.acaStatusSpecial || '', newValue: acaStatusSpecial },
      { fieldName: 'ACA Account Special', oldValue: oldAca.acaAccountSpecial || '', newValue: acaAccountSpecial },
      { fieldName: 'ACA Pass Special', oldValue: oldAca.acaPassSpecial || '', newValue: acaPassSpecial },
      { fieldName: 'Enroll Call Rep', oldValue: oldAca.enrollCallRep || '', newValue: enrollCallRep },
      { fieldName: 'The Best Rate Email', oldValue: oldAca.theBestRateEmail || '', newValue: theBestRateEmail },
    ];

    recordPropertyUpdatesBatch('contact', contactId, updates, currentActor);

    if (contact?.id) {
      const matchingUser = dbUsers.find(u => (u.fullName || u.name) === leadContactOwner);
      updateContact(contact.id, {
        firstName: primaryFirstName,
        middleName: primaryMiddleName,
        lastName: primaryLastName,
        phone: contactPhone,
        email: contactEmail,
        address: enrolledAddress,
        mailingAddress: mailingAddress,
        streetAddress: streetAddress,
        city: city,
        state: contactState,
        zipCode: postalCode,
        county: county,
        dateOfBirth: primaryDob,
        ssn: primarySsn,
        gender: primaryGender,
        immigrationStatus: primaryImmigration,
        language: contactLanguage,
        acaUsername: acaAccountSpecial || acaAccount,
        acaPassword: acaPassSpecial || acaPass,
        acaStatus: acaStatusSpecial,
        sourceChannel: leadHowDoYouKnowUs,
        sourceDetail: leadWhoRefer,
        whoReferClient: leadWhoRefer,
        contactOwnerId: matchingUser ? matchingUser.id : null,
        contactOwnerName: matchingUser ? (matchingUser.fullName || matchingUser.name) : leadContactOwner,
      }).catch(() => null);
    }
    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    }

    if (!isAutoSave) {
      logActivity('Contact Updated', `updated contact details for ${currentFullName}`);
      setSaveSuccess(true);
      showToast('Đã lưu thông tin liên hệ thành công!');
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  }

  // Serialize current field state to compare and trigger debounced auto-save
  const currentSnapshot = useMemo(() => {
    return JSON.stringify({
      primaryFirstName: (primaryFirstName || '').trim(),
      primaryMiddleName: (primaryMiddleName || '').trim(),
      primaryLastName: (primaryLastName || '').trim(),
      primaryDob: (primaryDob || '').trim(),
      primarySsn: (primarySsn || '').trim(),
      primaryRelation: (primaryRelation || '').trim(),
      primaryGender: (primaryGender || '').trim(),
      primaryImmigration: (primaryImmigration || '').trim(),
      primaryAlienNumber: (primaryAlienNumber || '').trim(),
      primaryCertificateNumber: (primaryCertificateNumber || '').trim(),
      primaryDateExpired: (primaryDateExpired || '').trim(),
      primaryHousehold: (primaryHousehold || '').trim(),
      contactPhone: (contactPhone || '').trim(),
      contactLanguage: (contactLanguage || '').trim(),
      contactEmail: (contactEmail || '').trim(),
      enrolledAddress: (enrolledAddress || '').trim(),
      mailingAddress: (mailingAddress || '').trim(),
      streetAddress: (streetAddress || '').trim(),
      city: (city || '').trim(),
      contactState: (contactState || '').trim(),
      postalCode: (postalCode || '').trim(),
      county: (county || '').trim(),
      leadHowDoYouKnowUs: (leadHowDoYouKnowUs || '').trim(),
      leadWhoRefer: (leadWhoRefer || '').trim(),
      leadContactOwner: (leadContactOwner || '').trim(),
      acaAccountStatus: (acaAccountStatus || '').trim(),
      acaAccount: (acaAccount || '').trim(),
      acaPass: (acaPass || '').trim(),
      theBestRateEmail: (theBestRateEmail || '').trim(),
      acaStatusSpecial: (acaStatusSpecial || '').trim(),
      acaAccountSpecial: (acaAccountSpecial || '').trim(),
      acaPassSpecial: (acaPassSpecial || '').trim(),
      enrollCallRep: (enrollCallRep || '').trim(),
    });
  }, [
    primaryFirstName,
    primaryMiddleName,
    primaryLastName,
    primaryDob,
    primarySsn,
    primaryRelation,
    primaryGender,
    primaryImmigration,
    primaryAlienNumber,
    primaryCertificateNumber,
    primaryDateExpired,
    primaryHousehold,
    contactPhone,
    contactLanguage,
    contactEmail,
    enrolledAddress,
    mailingAddress,
    streetAddress,
    city,
    contactState,
    postalCode,
    county,
    leadHowDoYouKnowUs,
    leadWhoRefer,
    leadContactOwner,
    acaAccountStatus,
    acaAccount,
    acaPass,
    theBestRateEmail,
    acaStatusSpecial,
    acaAccountSpecial,
    acaPassSpecial,
    enrollCallRep,
  ]);

  // Debounced auto-save whenever any field changes
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      lastSavedJsonRef.current = currentSnapshot;
      return;
    }

    if (currentSnapshot === lastSavedJsonRef.current) {
      return;
    }

    setSaveStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveContactChanges({ isAutoSave: true });
      lastSavedJsonRef.current = currentSnapshot;
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 2500);
    }, 600); // 600ms debounce

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentSnapshot]);

  // Flush any pending auto-save on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        handleSaveContactChanges({ isAutoSave: true });
      }
    };
  }, []);

  function handleBack() {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      handleSaveContactChanges({ isAutoSave: true });
    }
    if (onBack) onBack();
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0F2962] text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Bar Breadcrumbs & Actions (Image 2) ───────────────────────── */}
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Contact Detail</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Live Auto-save status feedback */}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold shadow-2xs animate-pulse">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span>Đang tự động lưu...</span>
            </div>
          )}

          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold shadow-2xs animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>Đã tự động lưu</span>
            </div>
          )}

          {saveStatus === 'idle' && (
            <button
              type="button"
              onClick={() => handleSaveContactChanges({ isAutoSave: false })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition cursor-pointer shadow-2xs"
              title="Hệ thống tự động lưu mọi thông tin khi bạn điền. Bấm vào đây để lưu thủ công ngay."
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-600">cloud_done</span>
              <span>Tự động lưu: Bật</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleOpenPropertyHistory('All')}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>View history</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Contact details refreshed')}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 3-Column Content Layout (Image 2) ─────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden relative">
        {/* ── COLUMN 1: Contact Information (Left Panel ~320px) ───────────── */}
        <div
          className={`bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all duration-200 relative h-full min-h-0 ${
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
                  {isEditingName ? (
                    <div className="my-1 p-2.5 bg-blue-50/90 border border-blue-200 rounded-lg space-y-2 shadow-xs">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">First Name *</label>
                          <input
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                            placeholder="First name"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName();
                              if (e.key === 'Escape') handleCancelEditName();
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Last Name *</label>
                          <input
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                            placeholder="Last name"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName();
                              if (e.key === 'Escape') handleCancelEditName();
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Middle Name</label>
                        <input
                          type="text"
                          value={editMiddleName}
                          onChange={(e) => setEditMiddleName(e.target.value)}
                          className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                          placeholder="Middle name (tùy chọn)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') handleCancelEditName();
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEditName}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200/70 rounded border border-slate-200 cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="px-3 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">check</span>
                          <span>Lưu tên</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-slate-900 leading-tight">
                        {currentFullName}
                      </h2>
                      <button
                        type="button"
                        title="Chỉnh sửa họ tên liên hệ"
                        onClick={handleStartEditName}
                        className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5 rounded hover:bg-slate-100"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                    <span className="truncate text-blue-700 font-medium">{contactEmail}</span>
                    <button
                      type="button"
                      title="Copy email"
                      onClick={() => {
                        navigator.clipboard?.writeText(contactEmail);
                        showToast('Email copied to clipboard');
                      }}
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
                  onClick={() => {
                    setSourceLeadOpen(true);
                    setContactOpen(true);
                    setAcaAccountOpen(true);
                    setPrimaryOpen(true);
                    showToast('All contact properties expanded');
                  }}
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium text-[11px] cursor-pointer"
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
                        <PropertyLabelWithHistory
                          label="Contact Owner"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center rounded border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-blue-500 hover:border-slate-300 transition">
                          <div className="w-5 h-5 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                            {leadContactOwner ? String(getPersonName(leadContactOwner, 'TB')).slice(0, 2).toUpperCase() : '--'}
                          </div>
                          <select
                            value={leadContactOwner || ''}
                            onChange={(e) => setLeadContactOwner(e.target.value)}
                            className="flex-grow text-xs text-slate-800 font-medium bg-transparent border-none outline-none cursor-pointer pr-12"
                          >
                            <option value="">-- Chưa chọn --</option>
                            <option value="The Best Rate Insurance">The Best Rate Insurance</option>
                            <option value="Platform Staff">Platform Staff</option>
                            {agentAccounts.map((a) => (
                              <option key={`agent-${a.id}`} value={a.name}>{a.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            {leadContactOwner && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setLeadContactOwner('');
                                }}
                                className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                                title="Xóa Contact Owner"
                              >
                                ✕
                              </button>
                            )}
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] pointer-events-none">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Lead Owner */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Lead Owner"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center rounded border border-slate-200 bg-white px-2.5 py-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#718096] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mr-2">
                            {leadContactOwner ? String(getPersonName(leadContactOwner, 'TB')).slice(0, 2).toUpperCase() : '--'}
                          </div>
                          <span className="flex-grow text-xs text-slate-800 truncate font-medium">
                            {leadContactOwner || '-- Chưa chọn --'}
                          </span>
                          {leadContactOwner && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setLeadContactOwner('');
                              }}
                              className="text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa Lead Owner"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 4. How do you know us */}
                      <div>
                        <PropertyLabelWithHistory
                          label="How do you know us"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative">
                          <select
                            value={leadHowDoYouKnowUs || ''}
                            onChange={(e) => setLeadHowDoYouKnowUs(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">---</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Refer">Refer (Giới thiệu)</option>
                            <option value="Google">Google Search</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Cold Call">Cold Call</option>
                            <option value="Website">Website</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            {leadHowDoYouKnowUs && leadHowDoYouKnowUs !== '---' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLeadHowDoYouKnowUs('');
                                }}
                                className="text-[12px] hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                                title="Xóa"
                              >
                                ✕
                              </button>
                            )}
                            <span className="h-3 w-px bg-slate-200 mx-0.5" />
                            <span className="material-symbols-outlined text-[16px] pointer-events-none">
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 5. Who refer client */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Who refer client"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={leadWhoRefer}
                            onChange={(e) => setLeadWhoRefer(e.target.value)}
                            placeholder="Referral name or note..."
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {leadWhoRefer && (
                            <button
                              type="button"
                              onClick={() => setLeadWhoRefer('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
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
                        <PropertyLabelWithHistory
                          label="Phone"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <PropertyLabelWithHistory
                          label="Enrolled Address"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={enrolledAddress}
                            onChange={(e) => setEnrolledAddress(e.target.value)}
                            placeholder="e.g. 4301 Laurel Pond Way, Raleigh, NC 27616"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
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

                      {/* Mailing Address */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Mailing Address"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={mailingAddress}
                            onChange={(e) => setMailingAddress(e.target.value)}
                            placeholder="e.g. 4301 Laurel Pond Way, Raleigh, NC 27616"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {mailingAddress && (
                            <button
                              type="button"
                              onClick={() => setMailingAddress('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* State */}
                      <div>
                        <PropertyLabelWithHistory
                          label="State"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative">
                          <select
                            value={contactState}
                            onChange={(e) => setContactState(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="North Carolina (NC)">North Carolina (NC)</option>
                            <option value="Texas (TX)">Texas (TX)</option>
                            <option value="California (CA)">California (CA)</option>
                            <option value="Florida (FL)">Florida (FL)</option>
                            <option value="Georgia (GA)">Georgia (GA)</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            {contactState && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setContactState('');
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

                      {/* Street Address */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Street Address"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="e.g. 4301 Laurel Pond Way"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {streetAddress && (
                            <button
                              type="button"
                              onClick={() => setStreetAddress('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <PropertyLabelWithHistory
                          label="City"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Raleigh"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {city && (
                            <button
                              type="button"
                              onClick={() => setCity('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Postal Code */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Postal Code"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 27616"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {postalCode && (
                            <button
                              type="button"
                              onClick={() => setPostalCode('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* County */}
                      <div>
                        <PropertyLabelWithHistory
                          label="County"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={county}
                            onChange={(e) => setCounty(e.target.value)}
                            placeholder="e.g. Wake"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {county && (
                            <button
                              type="button"
                              onClick={() => setCounty('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Language* */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Language"
                          required
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative">
                          <select
                            value={contactLanguage}
                            onChange={(e) => setContactLanguage(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Vietnamese">Vietnamese</option>
                            <option value="English">English</option>
                            <option value="Bilingual">Bilingual</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            {contactLanguage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setContactLanguage('');
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

                      {/* Career */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Career"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                    <div className="p-3 bg-slate-50/70 rounded-lg my-1 space-y-3 text-xs border border-slate-200 relative">
                      {/* Anti-browser-autofill decoy inputs */}
                      <input type="text" style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, width: 0, height: 0 }} tabIndex={-1} autoComplete="off" />
                      <input type="password" style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, width: 0, height: 0 }} tabIndex={-1} autoComplete="new-password" />

                      {/* The Best Rate Ins Email */}
                      <div>
                        <PropertyLabelWithHistory
                          label="The Best Rate Ins Email"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="email"
                            value={theBestRateEmail}
                            onChange={(e) => setTheBestRateEmail(e.target.value)}
                            placeholder="e.g. agent@thebestrate.com"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {theBestRateEmail && (
                            <button
                              type="button"
                              onClick={() => setTheBestRateEmail('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ACA Account Status - Normal state (Matching Image 3) */}
                      <div>
                        <PropertyLabelWithHistory
                          label="ACA Account Status - Normal state"
                          fieldName="ACA Account Status"
                          onOpenHistory={handleOpenPropertyHistory}
                        />

                        <div className="relative" ref={acaStatusDropdownRef}>
                          <div
                            onClick={() => setIsAcaStatusDropdownOpen(!isAcaStatusDropdownOpen)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border ${
                              isAcaStatusDropdownOpen
                                ? 'border-blue-500 ring-1 ring-blue-500/20'
                                : 'border-slate-200'
                            } bg-white text-xs text-slate-800 hover:border-slate-300 cursor-pointer transition select-none shadow-2xs`}
                          >
                            <span className={`truncate font-medium ${acaAccountStatus ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                              {acaAccountStatus || '(Trống / Chưa chọn)'}
                            </span>
                            <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1">
                              {acaAccountStatus && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcaAccountStatusChange('(Trống / Chưa chọn)');
                                  }}
                                  className="text-[12px] hover:text-slate-600 p-0.5 cursor-pointer leading-none"
                                  title="Reset to empty"
                                >
                                  ✕
                                </button>
                              )}
                              <span className="h-3 w-px bg-slate-200" />
                              <span className="material-symbols-outlined text-[16px] text-slate-500">
                                {isAcaStatusDropdownOpen ? 'expand_less' : 'expand_more'}
                              </span>
                            </div>
                          </div>

                          {/* Dropdown Menu matching Image 3 */}
                          {isAcaStatusDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs">
                              {ACA_ACCOUNT_STATUS_OPTIONS.map((opt) => {
                                const isSelected = opt === acaAccountStatus || (opt === '(Trống / Chưa chọn)' && !acaAccountStatus);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleAcaAccountStatusChange(opt)}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#EBF3FC] text-blue-900 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isSelected && (
                                      <span className="material-symbols-outlined text-xs text-blue-600 font-bold">
                                        check
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aca Account */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Aca Account"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="crm_contact_aca_acc"
                            autoComplete="off"
                            data-lpignore="true"
                            value={acaAccount}
                            onChange={(e) => setAcaAccount(e.target.value)}
                            placeholder="e.g. client@gmail.com"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                          />
                          {acaAccount && (
                            <button
                              type="button"
                              onClick={() => setAcaAccount('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Aca Pass */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Aca Pass"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="crm_contact_aca_pwd"
                            autoComplete="off"
                            data-lpignore="true"
                            value={acaPass}
                            onChange={(e) => setAcaPass(e.target.value)}
                            placeholder="e.g. Thebest@2026"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                          />
                          {acaPass && (
                            <button
                              type="button"
                              onClick={() => setAcaPass('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ACA Account Status - Special States */}
                      <div>
                        <PropertyLabelWithHistory
                          label="ACA Account Status - Special States"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative">
                          <select
                            value={acaStatusSpecial}
                            onChange={(e) => setAcaStatusSpecial(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            {acaStatusSpecial && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setAcaStatusSpecial('');
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

                      {/* ACA Account - Special States */}
                      <div>
                        <PropertyLabelWithHistory
                          label="ACA Account - Special States"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="crm_contact_aca_spec_acc"
                            autoComplete="off"
                            data-lpignore="true"
                            value={acaAccountSpecial}
                            onChange={(e) => setAcaAccountSpecial(e.target.value)}
                            placeholder="e.g. client.special@state.gov"
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {acaAccountSpecial && (
                            <button
                              type="button"
                              onClick={() => setAcaAccountSpecial('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ACA Account Password - Special Stat... */}
                      <div>
                        <PropertyLabelWithHistory
                          label="ACA Account Password - Special Stat..."
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            name="crm_contact_aca_spec_pwd"
                            autoComplete="new-password"
                            data-lpignore="true"
                            value={acaPassSpecial}
                            onChange={(e) => setAcaPassSpecial(e.target.value)}
                            placeholder=""
                            className="w-full px-2.5 pr-8 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {acaPassSpecial && (
                            <button
                              type="button"
                              onClick={() => setAcaPassSpecial('')}
                              className="absolute right-2 text-[12px] text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 leading-none transition"
                              title="Xóa"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Enroll Call Rep */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Enroll Call Rep"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <div className="relative">
                          <select
                            value={enrollCallRep}
                            onChange={(e) => setEnrollCallRep(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-14 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="">--</option>
                            <option value="Rep 1">Agent Rep 1</option>
                            <option value="Rep 2">Agent Rep 2</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                            {enrollCallRep && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEnrollCallRep('');
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
                        <PropertyLabelWithHistory
                          label="First Name"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <input
                          type="text"
                          value={primaryFirstName}
                          onChange={(e) => setPrimaryFirstName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Middle Name */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Middle Name"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <PropertyLabelWithHistory
                          label="Last Name"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
                        <input
                          type="text"
                          value={primaryLastName}
                          onChange={(e) => setPrimaryLastName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Date Of Birth */}
                      <div>
                        <PropertyLabelWithHistory
                          label="Date Of Birth"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <PropertyLabelWithHistory
                          label="SSN"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <PropertyLabelWithHistory
                          label="Family Relationship"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <PropertyLabelWithHistory
                          label="Gender"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <PropertyLabelWithHistory
                          label="Immigration Status"
                          onOpenHistory={handleOpenPropertyHistory}
                        />
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
                        <div className="pt-2">
                          {membersList.map((m) => (
                            <MemberSection 
                              key={m.id} 
                              member={m} 
                              onDelete={() => handleDeleteMember(m.id)} 
                              onUpdate={(updated) => handleUpdateMember(m.id, updated)}
                              defaultOpen={m.id === newlyAddedMemberId} 
                            />
                          ))}
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
        <div className="flex-1 min-w-0 h-full min-h-0 bg-white p-4 overflow-y-auto flex flex-col gap-3">
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
                      <button
                        type="button"
                        onClick={() => showToast('Activity timeline collapsed')}
                        className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Collapse all</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Activity timeline expanded')}
                        className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Expand all</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Activity timeline refreshed')}
                        className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
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
                                  {note.attachments.map((att) => (
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
                                  {noteComments[note.id].map((c) => (
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
                <div className="space-y-4">
                  {/* Top Month Header matching Screenshot 2 */}
                  <div className="text-xs font-bold text-slate-600 px-1 select-none">
                    Sep 2026
                  </div>

                  {tasksList.map((task) => (
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
                                {task.content.split('\n').map((line, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-slate-500 font-bold">•</span>
                                    <span className="font-mono text-xs">{line.replace(/^•\s*/, '')}</span>
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
                                {task.attachments.map((att) => (
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
                                  {(task.comments || []).map((c) => (
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

        {/* ── COLUMN 3: Associated Objects (Right Panel ~320px) ────────────── */}
        <div className="w-full xl:w-[320px] bg-white border-l border-slate-200 shrink-0 flex flex-col divide-y divide-slate-200 overflow-y-auto h-full min-h-0">
          {/* Section 1: Deals ─────────────────────────────────────────── */}
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
                <span>Deals ({contactDeals.length})</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowCreateDealModal(true)}
                  title="Tạo Deal mới"
                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefreshDeals}
                  title="Refresh"
                  className="hover:text-blue-600 p-0.5 rounded cursor-pointer text-slate-500"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            {rightDealsOpen && (
              <div className="p-3 space-y-3">
                {contactDeals.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <span className="material-symbols-outlined text-[28px] text-slate-300 block mb-1">handshake</span>
                    <p className="text-xs font-semibold text-slate-600">Chưa có deal nào</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5">Tạo deal mới cho liên hệ này</p>
                    <button
                      type="button"
                      onClick={() => setShowCreateDealModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Tạo Deal cho liên hệ này</span>
                    </button>
                  </div>
                ) : (
                  contactDeals.map((dealItem) => (
                    <div key={dealItem.id || dealItem.code || Math.random()} className="space-y-1">
                      <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs hover:border-blue-400 transition">
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
                            {dealItem?.shortTitle || dealItem?.title || 'Deal'}
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
                            <span className="font-semibold text-slate-800">{getPersonName(dealItem?.dealOwner, leadContactOwner || 'Agent')}</span>
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
                                {dealItem?.member || currentFullName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Link */}
                      <button
                        type="button"
                        onClick={() => onSelectDeal && onSelectDeal(dealItem)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer pl-0.5"
                      >
                        <span>» View Associated Deal</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section 2: Tickets ───────────────────────────────────────── */}
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
                <span>Tickets ({contactTickets.length})</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => showToast('Để tạo Ticket: đổi trạng thái ACA sang "Need Create ACA Account" hoặc tạo Deal với "Need Upload: Yes"')}
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

            {/* Content Body */}
            {rightTicketsOpen && (
              <div className="p-3 space-y-3">
                {contactTickets.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <span className="material-symbols-outlined text-[28px] text-slate-300 block mb-1">confirmation_number</span>
                    <p className="text-xs font-semibold text-slate-600">Chưa có ticket nào</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      ⚡ Chọn trạng thái ACA sang <strong>Need Create ACA Account</strong> hoặc tạo Deal có <strong>Need Upload = Yes</strong> để tự động xuất Ticket.
                    </p>
                  </div>
                ) : (
                  contactTickets.map((associatedTicket) => (
                    <div key={associatedTicket.id || associatedTicket.code || Math.random()} className="space-y-1">
                      <div
                        onClick={() => handleOpenTicket(associatedTicket)}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
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
                              {getPersonName(associatedTicket.ticketOwner, leadContactOwner || 'Agent')}
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
                        <span>» View Associated Ticket</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section 3: Customer Documents ───────────────────── */}
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
                <span>Customer Documents ({customerDocuments.length})</span>
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(true)}
                  title="Create Customer Document"
                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Customer documents refreshed')}
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
                {customerDocuments.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-[24px] text-slate-300 mb-1">
                      description
                    </span>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Chưa có customer document nào</p>
                    <p className="text-[11px] text-slate-400 mb-3">Tạo tài liệu khách hàng mới cho liên hệ này</p>
                    <button
                      type="button"
                      onClick={() => setShowCreateDocModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#104882] text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Tạo Customer Document</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {customerDocuments.map((doc, docIdx) => {
                      const activeSummary = (() => {
                        if (Array.isArray(doc.categoriesSummary) && doc.categoriesSummary.length > 0) {
                          return doc.categoriesSummary;
                        }
                        if (doc.filesByCategory) {
                          const catMap = {
                            consentFormMkp: 'Consent form MKP',
                            consentFormText: 'Consent form text',
                            identity: 'Identity',
                            insuranceRecord: 'Insurance record',
                            otherDocument: 'Other document',
                            paymentInformation: 'Payment information',
                            tax: 'Tax',
                          };
                          const list = [];
                          Object.entries(doc.filesByCategory).forEach(([k, files]) => {
                            if (Array.isArray(files) && files.length > 0) {
                              list.push({
                                key: k,
                                label: catMap[k] || k,
                                count: files.length,
                                files: files,
                              });
                            }
                          });
                          return list;
                        }
                        return [];
                      })();

                      const totalFilesCount = doc.totalFiles || activeSummary.reduce((sum, item) => sum + (item.count || 0), 0);
                      const hasFiles = totalFilesCount > 0 || activeSummary.length > 0;
                      const parts = (doc.lastModifiedTime || '09/28/2026, 10:07').split(',');
                      const updateDate = parts[0]?.trim() || '09/28/2026';
                      const updateTime = parts[1]?.trim() || '10:07';

                      return (
                        <div
                          key={doc.id || docIdx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs"
                        >
                          {/* Title row with document badge */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <span className="material-symbols-outlined text-[15px]">description</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onSelectCustomerDocument && onSelectCustomerDocument(doc)}
                              className="font-bold text-[#104882] text-xs hover:underline cursor-pointer text-left truncate"
                            >
                              {doc.name || currentFullName}
                            </button>
                          </div>

                          {/* Document categories tree OR empty dashed box */}
                          {hasFiles ? (
                            <div className="space-y-1.5 pt-1">
                              {activeSummary.map((item) => (
                                <div key={item.label || item.key} className="space-y-1">
                                  <div
                                    onClick={() => onSelectCustomerDocument && onSelectCustomerDocument(doc)}
                                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-700">
                                      <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600">
                                        description
                                      </span>
                                      <span className="text-xs font-medium">{item.label}</span>
                                    </div>
                                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] flex items-center justify-center">
                                      {item.count}
                                    </span>
                                  </div>
                                  {/* Uploaded file preview chips */}
                                  {Array.isArray(item.files) && item.files.length > 0 && (
                                    <div className="pl-6 pr-1 space-y-1">
                                      {item.files.map((file, fIdx) => (
                                        <div
                                          key={file.id || fIdx}
                                          onClick={() => onSelectCustomerDocument && onSelectCustomerDocument(doc)}
                                          className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-slate-50 border border-slate-100 hover:bg-blue-50/70 hover:border-blue-200 transition cursor-pointer text-slate-700"
                                          title={file.fullName || file.name}
                                        >
                                          <span className="material-symbols-outlined text-[15px] text-rose-500 shrink-0">
                                            {file.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                                          </span>
                                          <span className="text-[11px] font-medium text-slate-700 truncate flex-1">
                                            {file.name || file.fullName}
                                          </span>
                                          {file.size && (
                                            <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                              {file.size}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Exact match to media_1790575754874.png (Ảnh 2) */
                            <div
                              onClick={() => onSelectCustomerDocument && onSelectCustomerDocument(doc)}
                              className="border border-dashed border-slate-200 rounded-lg py-5 px-3 text-center bg-[#F8FAFC] cursor-pointer hover:border-blue-300 transition"
                              title="Click to view details"
                            >
                              <span className="text-slate-400 italic text-xs">No files attached</span>
                            </div>
                          )}

                          {/* Card Footer: LAST UPDATE */}
                          <div className="border-t border-slate-100 pt-2 mt-1 flex items-center justify-between text-[11px] text-slate-400">
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                              <span className="uppercase text-slate-400 font-semibold tracking-wider">LAST UPDATE:</span>
                              <span className="font-bold text-[#0F2962]">{updateDate}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{updateTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      {/* ── Add Member Modal ────────────────────────────────────────────── */}
      <AddMemberPanel 
        isOpen={showAddMemberModal} 
        onClose={() => setShowAddMemberModal(false)} 
        onSave={handleSaveMember} 
        hasSpouse={membersList.some(m => m.relation === 'Spouse')} 
      />

      {/* ── Create Note Modal (Exact match to uploaded image) ────────────── */}
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
                    {noteAttachments.map((file) => (
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
                          <span className="font-semibold max-w-[200px] truncate group-hover:underline">{file.name}</span>
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

      {/* ── Edit Note Modal ──────────────────────────────────────────────── */}
      {showEditNoteModal && editingNote && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowEditNoteModal(false); setIsEditNoteFullscreen(false); } }}
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
                  onClick={() => { setShowEditNoteModal(false); setIsEditNoteFullscreen(false); }}
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
                    {editNoteAttachments.map((file) => (
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
                          <span className="font-semibold max-w-[200px] truncate group-hover:underline">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-blue-600">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditNoteAttachments((prev) => prev.filter((a) => a.id !== file.id))}
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
                  onClick={() => { setShowEditNoteModal(false); setIsEditNoteFullscreen(false); }}
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

      {/* ── Create Task Modal (Exact match to uploaded image) ────────────── */}

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
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs shadow-2xs hover:bg-blue-50 transition group"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewModalFile(file)}
                          className="flex items-center gap-1.5 cursor-pointer text-left"
                          title="Bấm để xem và mở tệp trực tiếp"
                        >
                          <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                          <span className="font-semibold max-w-[200px] truncate group-hover:underline">{file.name}</span>
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

      {/* ── Add Customer Document Modal ── */}
      {showAddDocModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-scale-in my-auto">
            <div className="px-4 py-3 bg-[#183968] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px]">upload_file</span>
                <h3 className="text-xs font-bold uppercase tracking-wide">Attach Customer Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddDocument} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Document Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Identity">Identity (ID / Passport / Driver License)</option>
                  <option value="Consent Form Text">Consent Form Text</option>
                  <option value="Payment Information">Payment Information</option>
                  <option value="Income Proof">Income Proof (W2, 1040)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  File / Description (Optional)
                </label>
                <input
                  type="text"
                  value={newDocFileName}
                  onChange={(e) => setNewDocFileName(e.target.value)}
                  placeholder="e.g. passport_scan.pdf"
                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#183968] text-white hover:bg-[#122b50] font-bold cursor-pointer"
                >
                  Attach File
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Create Deal Modal Matching media_1790575726166.png ── */}
      <AddDealModal
        isOpen={showCreateDealModal}
        onClose={() => setShowCreateDealModal(false)}
        initialContactName={currentFullName}
        initialContactId={contact?.id || contact?.code || ''}
        initialContactPhone={contactPhone || contact?.phone || ''}
        initialContactEmail={contactEmail || contact?.email || ''}
        membersList={membersList}
        onDealCreated={(newDeal, uploadTicket) => {
          const updatedDeals = [newDeal, ...contactDeals];
          setContactDeals(updatedDeals);
          let updatedTickets = contactTickets;
          if (uploadTicket) {
            updatedTickets = [uploadTicket, ...contactTickets];
            setContactTickets(updatedTickets);
            logActivity('Ticket Created', `Tự động xuất ticket: ${uploadTicket.title} (Upload document)`);
          }
          logActivity('Deal Created', `Tạo deal mới: ${newDeal.title}`);
          if (onUpdateContact) {
            onUpdateContact({
              ...contact,
              associatedDeals: updatedDeals,
              associatedTickets: updatedTickets,
            });
          }
          showToast(
            newDeal.needUpload === 'Yes'
              ? `Đã tạo Deal và tự động xuất Ticket Upload document cho ${currentFullName}!`
              : `Đã tạo Deal thành công cho ${currentFullName}!`
          );
        }}
      />
      {/* ── Create Customer Document Modal Matching media_1790590561081.png (Hình 3) ── */}
      <CreateCustomerDocumentModal
        isOpen={showCreateDocModal}
        onClose={() => setShowCreateDocModal(false)}
        contact={contact}
        onSave={(newDoc) => {
          const filtered = customerDocuments.filter(
            (d) => d.id !== newDoc.id && d.name !== newDoc.name
          );
          const updated = [newDoc, ...filtered];
          setCustomerDocuments(updated);
          logActivity('Document Created', `Tạo Customer Document mới: ${newDoc.name}`);
          showToast(`Đã tạo Customer Document: ${newDoc.name}!`);
          if (onUpdateContact) {
            onUpdateContact({
              ...contact,
              customerDocument: newDoc,
              customerDocuments: updated,
            });
          }
        }}
      />

      {/* ── Property History Modal Matching media_1790590629171.png ──────── */}
      <PropertyHistoryModal
        isOpen={showPropertyHistoryModal}
        onClose={() => setShowPropertyHistoryModal(false)}
        initialFieldName={selectedHistoryField}
        entityType="contact"
        entityId={contact?.id || contact?.code || 'CT26002600'}
        entityName={currentFullName || contact?.fullName || 'Contact'}
        entityData={{
          ...contact,
          fullName: currentFullName,
          firstName: primaryFirstName,
          middleName: primaryMiddleName,
          lastName: primaryLastName,
          phone: contactPhone,
          email: contactEmail,
          language: contactLanguage,
          address: enrolledAddress,
          contactFields: {
            ...(contact?.contactFields || {}),
            enrolledAddress,
            mailingAddress,
            streetAddress,
            city,
            state: contactState,
            postalCode,
            county,
          },
          primary: {
            ...(contact?.primary || {}),
            dob: primaryDob,
            ssn: primarySsn,
            gender: primaryGender,
            immigrationStatus: primaryImmigration,
          },
          acaAccount: {
            ...(contact?.acaAccount || {}),
            acaAccountStatus,
            acaAccount,
            acaPass,
            acaStatusSpecial,
            acaAccountSpecial,
            acaPassSpecial,
            enrollCallRep,
            theBestRateEmail,
          },
          acaAccountStatus,
          contactOwner: leadContactOwner,
          howDoYouKnowUs: leadHowDoYouKnowUs,
          whoReferClient: leadWhoRefer,
        }}
        availableFields={[
          'Contact Owner',
          'Lead Owner',
          'How do you know us',
          'Who refer client',
          'Phone',
          'Enrolled Address',
          'Mailing Address',
          'State',
          'Street Address',
          'City',
          'Postal Code',
          'County',
          'Language',
          'Career',
          'The Best Rate Ins Email',
          'ACA Account Status - Normal state',
          'Aca Account',
          'Aca Pass',
          'ACA Account Status - Special States',
          'ACA Account - Special States',
          'ACA Account Password - Special States',
          'Enroll Call Rep',
          'First Name',
          'Middle Name',
          'Last Name',
          'Date Of Birth',
          'SSN',
          'Family Relationship',
          'Gender',
          'Immigration Status',
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
