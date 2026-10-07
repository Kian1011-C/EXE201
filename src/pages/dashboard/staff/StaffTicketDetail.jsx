import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getTicket,
  updateTicket,
  addTicketComment,
  getDocuments,
  createDocument,
  addDocumentFile,
  deleteDocumentFile,
  addContactTask,
  getDeals,
} from '../../../services/api';
import toast from 'react-hot-toast';

export function isDealBelongingToContact(deal, contactName, contactId) {
  if (!deal) return false;
  const dContactId = String(deal.contactId || (typeof deal.contact === 'object' ? deal.contact?.id : '') || '')?.trim();
  const cId = String(contactId || '')?.trim();
  const cName = String(contactName || '')?.trim()?.toLowerCase();
  const dContact = String(
    deal.contactName ||
      (typeof deal.contact === 'object' ? (deal.contact?.fullName || deal.contact?.name) : '') ||
      ''
  )?.trim()?.toLowerCase();

  // If both IDs exist, require exact ID match
  if (cId && dContactId) {
    return cId === dContactId;
  }

  // Exact name matching only if no ID mismatch
  if (cName && cName !== 'unknown' && dContact && dContact !== 'unknown') {
    return dContact === cName;
  }

  return false;
}

export function getPersonName(val, fallback = 'Unassigned') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  return val.name || val.fullName || val.label || fallback;
}

export const ACA_TICKET_DEFAULTS = {
  id: '',
  title: 'ACA account',
  avatar: 'A2',
  avatarBg: 'bg-[#E05638]',
  pipeline: 'ACA account',
  status: 'Need Create ACA Account',
  priority: 'High',
  openDays: null,
  closeDate: '',
  dueDate: '',
  serviceAgent: '',
  serviceAgentAvatar: '',
  serviceAgentBg: 'bg-[#0EA5E9]',
  ticketOwner: '',
  ticketOwnerAvatar: '',
  ticketOwnerBg: 'bg-[#10B981]',
  ticketResult: '',
  paymentStatus: '',
  changeDueDateReason: '',
  carrier: '',
  deadlineDate: '',
  paidThroughDate: '',
  files: [],
  proof: [],
  contactName: '',
  contactInitials: '',
  contactPhone: '',
  contactEmail: '',
  leadOwner: '',
  dealTitle: '',
  dealShortTitle: '',
  dealPipeline: '',
  dealStage: '',
  dealOwner: '',
  dealCarrier: '',
  timeline: [],
};

export const PAYMENT_TICKET_DEFAULTS = {
  id: '',
  title: 'Payment ticket',
  avatar: 'OT',
  avatarBg: 'bg-[#B25E3B]',
  pipeline: 'Payment',
  status: 'Make payment',
  priority: 'None',
  openDays: null,
  closeDate: '',
  dueDate: '',
  serviceAgent: '',
  serviceAgentAvatar: '',
  serviceAgentBg: 'bg-slate-600',
  ticketOwner: '',
  ticketOwnerAvatar: '',
  ticketOwnerBg: 'bg-slate-600',
  ticketResult: '',
  paymentStatus: '',
  changeDueDateReason: '',
  carrier: '',
  deadlineDate: '',
  paidThroughDate: '',
  files: [],
  proof: [],
  contactName: '',
  contactInitials: '',
  contactPhone: '',
  contactEmail: '',
  leadOwner: '',
  dealTitle: '',
  dealShortTitle: '',
  dealPipeline: '',
  dealStage: '',
  dealOwner: '',
  dealCarrier: '',
  timeline: [],
};

const PIPELINE_OPTIONS = [
  'ACA account',
  'Payment',
  'Client Support',
  'Collect Document',
  'Choose Doctor',
  'Agent Support',
];

const STATUS_OPTIONS_PAYMENT = [
  'Make payment',
  'Uploaded - Waiting for Verification',
  'Waiting on Customer',
  'Waiting on Carrier',
  'Paid',
  'DONE',
  'Closed',
];

const STATUS_OPTIONS_DEFAULT = [
  'DONE',
  'Uploaded - Waiting for Verification',
  'Need Create ACA Account',
  'Open',
  'In Progress',
  'Waiting on Customer',
  'Resolved',
  'Closed',
];

export const STATUS_OPTIONS_ACA = [
  'Need Create ACA Account',
  'Pending - Waiting for Document',
  'Uploaded - Waiting for Verification',
  'VERIFIED',
  'Unverified - Can not Create',
  'DONE',
  'Plan Cancelled',
];

const PAYMENT_STATUS_OPTIONS = [
  'Company Pay',
  'Client Pay',
  'Need Auto Pay',
  'Auto Pay Setup',
  'Pending Payment',
  'Paid',
  'Refund Requested',
];

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low', 'None'];

export const UPLOAD_CATEGORIES = [
  {
    id: 'income',
    title: 'Proof of Income (Thu nhập)',
    desc: 'W-2, Pay stubs, Tax return...',
    req: true,
    backendCat: 'tax',
    acceptedExt: '.pdf,.png,.jpg,.jpeg,.doc,.docx',
    icon: 'receipt_long',
  },
  {
    id: 'citizenship',
    title: 'Proof of Citizenship / Immigration',
    desc: 'Passport, Green card, Certificate...',
    req: true,
    backendCat: 'identity',
    acceptedExt: '.pdf,.png,.jpg,.jpeg',
    icon: 'badge',
  },
  {
    id: 'ssn',
    title: 'Social Security Card (SSN)',
    desc: 'SSN Card copy',
    req: true,
    backendCat: 'identity',
    acceptedExt: '.pdf,.png,.jpg,.jpeg',
    icon: 'credit_card',
  },
  {
    id: 'id',
    title: 'Driver License / ID',
    desc: 'State ID, Driver License',
    req: true,
    backendCat: 'identity',
    acceptedExt: '.pdf,.png,.jpg,.jpeg',
    icon: 'pin',
  },
  {
    id: 'address',
    title: 'Proof of Address',
    desc: 'Utility bill, Lease agreement...',
    req: false,
    backendCat: 'otherDocument',
    acceptedExt: '.pdf,.png,.jpg,.jpeg',
    icon: 'home',
  },
  {
    id: 'other',
    title: 'Other (Tài liệu khác)',
    desc: 'Any other required documents',
    req: false,
    backendCat: 'otherDocument',
    acceptedExt: '.pdf,.png,.jpg,.jpeg,.doc,.docx',
    icon: 'folder_open',
  },
];

export default function StaffTicketDetail({
  ticket,
  onBack,
  onSelectContact,
  onSelectDeal,
  onUpdateTicket,
}) {
  const isPayment =
    ticket?.pipeline === 'Payment' ||
    (ticket?.title && ticket?.title?.toLowerCase().includes('pay'));

  const baseDefaults = isPayment ? PAYMENT_TICKET_DEFAULTS : ACA_TICKET_DEFAULTS;
  const initialData = {
    ...baseDefaults,
    ...(typeof ticket === 'object' && ticket !== null ? ticket : {}),
  };

  // Ticket fields
  const [ticketTitle, setTicketTitle] = useState(initialData.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(initialData.title);

  const [avatar, setAvatar] = useState(initialData.avatar);
  const [priority, setPriority] = useState(initialData.priority);
  const [openDays, setOpenDays] = useState(initialData.openDays);
  const [closeDate, setCloseDate] = useState(initialData.closeDate);
  const [pipeline, setPipeline] = useState(initialData.pipeline);
  const [status, setStatus] = useState(initialData.status);
  const [dueDate, setDueDate] = useState(initialData.dueDate);

  // Properties in "About this ticket"
  const [platformMembers, setPlatformMembers] = useState(() => [
    { name: 'Platform Staff', avatar: 'PS', bg: 'bg-slate-600' },
    { name: 'The Best Rate Insurance', avatar: 'TB', bg: 'bg-cyan-700' },
    ...[]?.map((a) => ({
      name: a.name,
      avatar: a.avatar || a.name.slice(0, 2).toUpperCase(),
      bg: a.bg || 'bg-blue-600',
    })),
  ]);

  useEffect(() => {
    function handleAccountsUpdated() {
      setPlatformMembers([
        { name: 'Platform Staff', avatar: 'PS', bg: 'bg-slate-600' },
        { name: 'The Best Rate Insurance', avatar: 'TB', bg: 'bg-cyan-700' },
        ...[]?.map((a) => ({
          name: a.name,
          avatar: a.avatar || a.name.slice(0, 2).toUpperCase(),
          bg: a.bg || 'bg-blue-600',
        })),
      ]);
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  const [serviceAgent, setServiceAgent] = useState(getPersonName(initialData.serviceAgent, 'Platform Staff'));
  const [ticketOwner, setTicketOwner] = useState(getPersonName(initialData.ticketOwner, ''));
  const [ticketResult, setTicketResult] = useState(initialData.ticketResult || '');
  const [paymentStatus, setPaymentStatus] = useState(initialData.paymentStatus || '');
  const [changeDueDateReason, setChangeDueDateReason] = useState(initialData.changeDueDateReason || '');
  const [carrier, setCarrier] = useState(initialData.carrier || '');
  const [deadlineDate, setDeadlineDate] = useState(initialData.deadlineDate || '');
  const [paidThroughDate, setPaidThroughDate] = useState(initialData.paidThroughDate || '');

  // Files & Proof
  const [filesList, setFilesList] = useState(initialData.files || []);
  const [proofList, setProofList] = useState(initialData.proof || []);
  const fileInputRef = useRef(null);
  const proofInputRef = useRef(null);

  // Entities
  const [contactName, setContactName] = useState(String(initialData.contactName || ''));
  const [contactPhone, setContactPhone] = useState(String(initialData.contactPhone || ''));
  const [contactEmail, setContactEmail] = useState(String(initialData.contactEmail || ''));
  const [leadOwner, setLeadOwner] = useState(getPersonName(initialData.leadOwner || initialData.ticketOwner, ''));

  // Dynamic Associated Deal State
  const [associatedDeal, setAssociatedDeal] = useState(null);
  const [dealTitle, setDealTitle] = useState('');
  const [dealShortTitle, setDealShortTitle] = useState('');
  const [dealPipeline, setDealPipeline] = useState('');
  const [dealStage, setDealStage] = useState('');
  const [dealOwner, setDealOwner] = useState('');
  const [dealCarrier, setDealCarrier] = useState('');

  // Dropdowns
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isServiceAgentOpen, setIsServiceAgentOpen] = useState(false);
  const [isTicketOwnerOpen, setIsTicketOwnerOpen] = useState(false);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);

  // Modals
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [tempDueDate, setTempDueDate] = useState(dueDate);
  const [tempReason, setTempReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Follow up on ${ticketTitle}`);
  const [emailBody, setEmailBody] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('07/25/2026');

  // Accordion sections
  const [aboutOpen, setAboutOpen] = useState(true);
  const [companiesOpen, setCompaniesOpen] = useState(true);
  const [contactsOpen, setContactsOpen] = useState(true);
  const [dealsOpen, setDealsOpen] = useState(true);

  // Center column tabs & feed
  const [activeCenterTab, setActiveCenterTab] = useState('activity');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [showNoteComposer, setShowNoteComposer] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingTicketNoteId, setEditingTicketNoteId] = useState(null);
  const [editTicketNoteContent, setEditTicketNoteContent] = useState('');

  // Timeline Items
  const [timelineItems, setTimelineItems] = useState(initialData.timeline || []);

  // Document Uploads for isUploadDoc
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadingCatId, setUploadingCatId] = useState(null);
  const [contactDocId, setContactDocId] = useState(null);
  const fileInputRefs = useRef({});

  // Toast feedback
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper to dynamically resolve associated deal strictly for this ticket's contact
  const resolveAndApplyDeal = useCallback((currentTicket) => {
    const cName = String(
      currentTicket.contactName ||
        (typeof currentTicket.contact === 'object'
          ? currentTicket.contact?.fullName || currentTicket.contact?.name
          : '') ||
        ''
    )?.trim();
    const cId = String(
      currentTicket.contactId ||
        (typeof currentTicket.contact === 'object' ? currentTicket.contact?.id : currentTicket.contact) ||
        ''
    )?.trim();
    const dId = String(
      currentTicket.dealId ||
        (typeof currentTicket.deal === 'object' ? currentTicket.deal?.id || currentTicket.deal?.code : currentTicket.deal) ||
        ''
    )?.trim();

    let matched = null;

    // 1. Direct object passed on currentTicket.deal
    if (currentTicket.deal && typeof currentTicket.deal === 'object' && (currentTicket.deal.title || currentTicket.deal.id)) {
      if (isDealBelongingToContact(currentTicket.deal, cName, cId)) {
        matched = currentTicket.deal;
      }
    }

    // 2. Direct title passed on currentTicket.dealTitle ONLY IF dId is also present
    if (!matched && dId && currentTicket.dealTitle && typeof currentTicket.dealTitle === 'string' && currentTicket.dealTitle?.trim()) {
      matched = {
        id: dId,
        code: dId,
        title: currentTicket.dealTitle,
        shortTitle: currentTicket.dealShortTitle || currentTicket.dealTitle,
        pipeline: currentTicket.dealPipeline || 'Obamacare 2026',
        stage: currentTicket.dealStage || 'Ready to Enroll',
        dealOwner: currentTicket.dealOwner || currentTicket.ticketOwner || '',
        carrier: currentTicket.dealCarrier || currentTicket.carrier || '',
      };
    }

    // 3. Search local dynamic deals by exact dealId ONLY
    if (!matched && dId) {
      const dynamicDeals = [];
      if (Array.isArray(dynamicDeals) && dynamicDeals.length > 0) {
        const byId = dynamicDeals.find((d) => (String(d.id) === dId || String(d.code) === dId) && isDealBelongingToContact(d, cName, cId));
        if (byId) matched = byId;
      }
    }

    if (matched) {
      setAssociatedDeal(matched);
      setDealTitle(matched.title || matched.dealName || '');
      setDealShortTitle(matched.shortTitle || matched.title || matched.dealName || '');
      setDealPipeline(matched.pipeline || 'Obamacare 2026');
      setDealStage(matched.stage || matched.dealStage || '');
      setDealOwner(typeof matched.dealOwner === 'object' ? matched.dealOwner.name || '' : matched.dealOwner || '');
      setDealCarrier(matched.carrier || '');
    } else {
      // Clear deal fields completely so no unrelated customer's deal is displayed
      setAssociatedDeal(null);
      setDealTitle('');
      setDealShortTitle('');
      setDealPipeline('');
      setDealStage('');
      setDealOwner('');
      setDealCarrier('');

      // If a specific dealId was requested, try API lookup by dealId ONLY
      if (dId) {
        getDeals()
          .then((apiDeals) => {
            if (Array.isArray(apiDeals) && apiDeals.length > 0) {
              const apiMatched = apiDeals.find((d) => (String(d.id) === dId || String(d.code) === dId) && isDealBelongingToContact(d, cName, cId));
              if (apiMatched) {
                setAssociatedDeal(apiMatched);
                setDealTitle(apiMatched.title || apiMatched.dealName || '');
                setDealShortTitle(apiMatched.shortTitle || apiMatched.title || apiMatched.dealName || '');
                setDealPipeline(apiMatched.pipeline || 'Obamacare 2026');
                setDealStage(apiMatched.stage || apiMatched.dealStage || '');
                setDealOwner(typeof apiMatched.dealOwner === 'object' ? apiMatched.dealOwner.name || '' : apiMatched.dealOwner || '');
                setDealCarrier(apiMatched.carrier || '');
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Synchronize state dynamically whenever ticket prop updates
  useEffect(() => {
    const rawTicket =
      typeof ticket === 'object' && ticket !== null
        ? ticket
        : ([].find((t) => t.id === ticket) || {});

    const isPaymentTicket =
      rawTicket?.pipeline === 'Payment' ||
      (rawTicket?.title && rawTicket.title?.toLowerCase().includes('pay'));
    const base = isPaymentTicket ? PAYMENT_TICKET_DEFAULTS : ACA_TICKET_DEFAULTS;
    const current = {
      ...base,
      ...rawTicket,
    };

    setTicketTitle(current.title || '');
    setTempTitle(current.title || '');
    setAvatar(current.avatar || (isPaymentTicket ? 'OT' : 'A2'));
    setPriority(current.priority || (isPaymentTicket ? 'None' : 'High'));
    setOpenDays(current.openDays);
    setCloseDate(current.closeDate || '');
    setPipeline(current.pipeline || (isPaymentTicket ? 'Payment' : 'ACA account'));
    setStatus(current.status || (isPaymentTicket ? 'Make payment' : 'Need Create ACA Account'));
    setDueDate(current.dueDate || '');
    setTempDueDate(current.dueDate || '');

    setServiceAgent(getPersonName(current.serviceAgent, 'Platform Staff'));
    setTicketOwner(getPersonName(current.ticketOwner, ''));
    setTicketResult(current.ticketResult || '');
    setPaymentStatus(current.paymentStatus || '');
    setChangeDueDateReason(current.changeDueDateReason || '');
    setCarrier(current.carrier || '');
    setDeadlineDate(current.deadlineDate || '');
    setPaidThroughDate(current.paidThroughDate || '');

    setFilesList(current.files || []);
    setProofList(current.proof || []);

    const resolvedContactName = String(
      current.contactName ||
        (typeof current.contact === 'object' ? current.contact?.fullName || current.contact?.name : '') ||
        ''
    );
    setContactName(resolvedContactName);
    setContactPhone(String(current.contactPhone || current.contact?.phone || ''));
    setContactEmail(String(current.contactEmail || current.contact?.email || ''));
    setLeadOwner(getPersonName(current.leadOwner || current.ticketOwner, ''));

    // Resolve associated deal strictly for this contact
    resolveAndApplyDeal(current);

    // Clean timeline items - avoid leaking Ken Ho / Kaylee Ho dummy records
    const rawTimeline = Array.isArray(current.timeline) ? current.timeline : (base.timeline || []);
    const cleanTimeline = rawTimeline?.filter((item) => {
      const dName = String(item.dealName || item.title || item.creator || '')?.toLowerCase();
      if (dName.includes('ken ho') || dName.includes('kaylee ho') || dName.includes('kylie ho')) {
        const cNameLower = resolvedContactName?.toLowerCase();
        if (!cNameLower.includes('ken') && !cNameLower.includes('ho')) return false;
      }
      return true;
    });

    if (cleanTimeline.length > 0) {
      setTimelineItems(cleanTimeline);
    } else {
      const creatorName = getPersonName(current.ticketOwner || current.serviceAgent, 'System');
      const createdItem = {
        id: `ticket-create-${current.id || Date.now()}`,
        month: current.createdAt ? new Date(current.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent',
        type: 'ticket_created',
        title: 'Ticket Activity',
        timestamp: current.createdAt ? new Date(current.createdAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Just now',
        creator: creatorName,
        targetTicketName: current.title || 'Ticket',
      };
      setTimelineItems([createdItem]);
    }

    // Load customer documents for this contact from backend
    const effectiveContactId = current.contactId || (typeof current.contact === 'object' ? current.contact?.id : current.contact);
    if (effectiveContactId) {
      getDocuments({ contactId: effectiveContactId })
        .then((docs) => {
          if (Array.isArray(docs) && docs.length > 0) {
            const doc = docs[0];
            setContactDocId(doc.id);
            const initialMap = {};
            (doc.files || []).forEach((f) => {
              const fname = (f.name || f.fullName || '')?.toLowerCase();
              const ftype = f.type || (fname.endsWith('.pdf') ? 'pdf' : (fname.match(/\.(png|jpg|jpeg)$/) ? 'image' : 'document'));
              const item = {
                id: f.id,
                dbFileId: f.id,
                name: f.name || f.fullName,
                fullName: f.fullName || f.name,
                size: f.size || '1.2 MB',
                type: ftype,
                url: f.url || '',
                uploadedAt: f.createdAt ? new Date(f.createdAt).toLocaleString() : 'Uploaded',
              };
              if (f.category === 'identity' || fname.includes('driver') || fname.includes('license') || fname.includes('id')) {
                if (!initialMap.id) initialMap.id = item;
                else if (!initialMap.citizenship) initialMap.citizenship = item;
                else if (!initialMap.ssn) initialMap.ssn = item;
              } else if (f.category === 'tax' || fname.includes('w2') || fname.includes('income') || fname.includes('tax')) {
                initialMap.income = item;
              } else if (f.category === 'consentFormMkp' || f.category === 'consentFormText' || f.category === 'otherDocument') {
                if (!initialMap.address) initialMap.address = item;
                else if (!initialMap.other) initialMap.other = item;
              }
            });
            setUploadedDocs(initialMap);
          }
        })
        .catch((err) => console.warn('[StaffTicketDetail] getDocuments error:', err));
    }
  }, [ticket, resolveAndApplyDeal]);

  // Document Upload Handlers
  const handleDocUpload = async (catId, file) => {
    if (!file) return;
    setUploadingCatId(catId);
    try {
      const catConfig = UPLOAD_CATEGORIES.find((c) => c.id === catId);
      const ext = (file?.name?.split('.').pop() || '')?.toLowerCase();
      const fileType = ['png', 'jpg', 'jpeg'].includes(ext) ? 'image' : (ext === 'pdf' ? 'pdf' : 'document');
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      // Read file as Data URL
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const newFileItem = {
        id: `doc-${catId}-${Date.now()}`,
        name: file?.name,
        fullName: file?.name,
        size: formattedSize,
        type: fileType,
        category: catConfig?.backendCat || 'otherDocument',
        url: dataUrl,
        uploadedAt: new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const updated = {
        ...uploadedDocs,
        [catId]: newFileItem,
      };
      setUploadedDocs(updated);

      // Call Backend API to save document file
      let targetDocId = contactDocId;
      if (!targetDocId) {
        try {
          const res = await createDocument({
            name: `${contactName} - Customer Documents`,
            contactOwner: ticketOwner || '',
            lastModifiedBy: serviceAgent || 'Platform Staff',
            contactId: ticket?.contactId || '24',
          });
          const createdDoc = res?.data || res;
          if (createdDoc && createdDoc.id) {
            targetDocId = createdDoc.id;
            setContactDocId(createdDoc.id);
          }
        } catch (e) {
          console.warn('[StaffTicketDetail] createDocument fallback:', e);
        }
      }

      if (targetDocId) {
        try {
          const fileRes = await addDocumentFile(targetDocId, {
            name: file?.name,
            fullName: file?.name,
            size: formattedSize,
            type: fileType,
            category: catConfig?.backendCat || 'otherDocument',
            url: dataUrl.slice(0, 500),
          });
          const savedFile = fileRes?.data || fileRes;
          if (savedFile && savedFile.id) {
            newFileItem.dbFileId = savedFile.id;
          }
        } catch (e) {
          console.warn('[StaffTicketDetail] addDocumentFile fallback:', e);
        }
      }

      // Add activity to timeline
      const actContent = `Tải lên file "${file?.name}" cho danh mục "${catConfig?.title || catId}"`;
      const newAct = {
        id: `act-doc-${Date.now()}`,
        month: 'Aug 2026',
        type: 'activity',
        title: 'Document Uploaded',
        timestamp: new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        actor: serviceAgent || 'Platform Staff',
        content: actContent,
      };
      setTimelineItems((prev) => [newAct, ...prev]);

      const ticketTargetId = ticket?.id || ticket?.code || '31';
      addTicketComment(ticketTargetId, {
        author: serviceAgent || 'Platform Staff',
        content: actContent,
      }).catch((err) => console.warn('[StaffTicketDetail] addTicketComment fallback:', err));

      // Check required documents completion
      const requiredCats = ['income', 'citizenship', 'ssn', 'id'];
      const allRequiredUploaded = requiredCats.every((c) => updated[c]);

      if (allRequiredUploaded) {
        setStatus('Uploaded - Waiting for Verification');
        updateTicket(ticketTargetId, {
          ticketStatus: 'Uploaded - Waiting for Verification',
        }).catch((err) => console.warn('[StaffTicketDetail] updateTicket status fallback:', err));
        showToast('Đã tải lên đủ 4/4 tài liệu bắt buộc! Trạng thái ticket đã chuyển sang "Uploaded - Waiting for Verification"');
      } else {
        const countUploaded = requiredCats?.filter((c) => updated[c]).length;
        showToast(`Đã tải lên: ${file?.name} (${countUploaded}/4 tài liệu bắt buộc)`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Lỗi khi tải file: ' + err.message);
    } finally {
      setUploadingCatId(null);
    }
  };

  const handleDocDelete = async (catId) => {
    const docItem = uploadedDocs[catId];
    if (!docItem) return;
    if (!window.confirm(`Bạn có chắc muốn xóa file "${docItem.name}"?`)) return;

    if (contactDocId && docItem.dbFileId) {
      try {
        await deleteDocumentFile(contactDocId, docItem.dbFileId);
      } catch (e) {
        console.warn('[StaffTicketDetail] deleteDocumentFile fallback:', e);
      }
    }

    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[catId];
      return copy;
    });

    const actContent = `Đã xóa tài liệu của danh mục "${catId}": ${docItem.name}`;
    const newAct = {
      id: `act-del-${Date.now()}`,
      month: 'Aug 2026',
      type: 'activity',
      title: 'Document Removed',
      timestamp: new Date().toLocaleString(),
      actor: serviceAgent || 'Platform Staff',
      content: actContent,
    };
    setTimelineItems((prev) => [newAct, ...prev]);

    const ticketTargetId = ticket?.id || ticket?.code || '31';
    addTicketComment(ticketTargetId, {
      author: serviceAgent || 'Platform Staff',
      content: actContent,
    }).catch(() => {});

    showToast(`Đã xóa file: ${docItem.name}`);
  };

  const handleDocDownload = (docItem) => {
    if (!docItem) return;
    const link = document.createElement('a');
    link.href = docItem.url || '#';
    link.download = docItem.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đang tải xuống: ${docItem.name}`);
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
        setIsPaymentStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleSaveTitle = () => {
    if (tempTitle?.trim()) {
      setTicketTitle(tempTitle?.trim());
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
    if (!tempReason?.trim()) {
      alert('Please provide a reason for changing the due date.');
      return;
    }
    setDueDate(tempDueDate);
    setChangeDueDateReason(tempReason);
    setShowDueDateModal(false);

    if (priority !== 'None') {
      const d = new Date(tempDueDate);
      const now = new Date();
      const diffHours = (d - now) / (1000 * 60 * 60);
      if (!isNaN(diffHours)) {
        if (diffHours <= 48) setPriority('High');
        else if (diffHours <= 120) setPriority('Medium');
        else setPriority('Low');
      }
    }

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
    if (st === 'Closed' && !ticketResult?.trim()) {
      showToast('Validation Warning: Ticket Result is required before closing.');
      return;
    }
    setStatus(st);
    setIsStatusOpen(false);

    const safeAgent = getPersonName(serviceAgent, 'Platform Staff');
    // Timeline item
    const newAct = {
      id: `act-${Date.now()}`,
      month: 'Aug 2026',
      type: 'activity',
      title: 'Ticket Activity',
      timestamp: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      actor: safeAgent,
      content: `${safeAgent} moved ticket stage to ${st}.`,
    };
    setTimelineItems((prev) => [newAct, ...prev]);

    const updatedTicket = {
      ...ticket,
      status: st,
      stage: `${st} (${pipeline})`,
      pipeline,
    };
    null;
    if (ticket?.id) {
      updateTicket(ticket.id, updatedTicket).catch(() => {});
    }

    if (onUpdateTicket) {
      onUpdateTicket(updatedTicket);
    }

    showToast(`Status updated to ${st}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        name: file?.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toLocaleDateString(),
      };
      setFilesList((prev) => [...prev, newFile]);
      showToast(`File "${file?.name}" uploaded`);
    }
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newProof = {
        name: file?.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toLocaleDateString(),
      };
      setProofList((prev) => [...prev, newProof]);
      showToast(`Proof "${file?.name}" uploaded`);
    }
  };

  const handleAddNote = () => {
    if (!newNoteContent?.trim()) return;
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
      actor: (typeof serviceAgent === 'string' && serviceAgent) ? (serviceAgent?.trim()?.split(/\s+/)[0] + ' ' + (serviceAgent?.trim()?.split(/\s+/)[1] || ''))?.trim() : 'Unknown',
      isExpanded: true,
      content: newNoteContent?.trim(),
    };
    setTimelineItems((prev) => [item, ...prev]);

    const targetTicketId = ticket?.id || ticket?.code;
    if (targetTicketId) {
      addTicketComment(targetTicketId, {
        author: item.actor,
        content: item.content,
      }).catch((err) => console.warn('[StaffTicketDetail] addTicketComment fallback:', err));
    }

    setNewNoteContent('');
    setShowNoteComposer(false);
    showToast('Note published to timeline');
  };

  const handleSaveTicketNote = (id) => {
    if (!editTicketNoteContent?.trim()) return;
    setTimelineItems((prev) =>
      prev?.map((t) =>
        t.id === id ? { ...t, content: editTicketNoteContent?.trim(), isEdited: true } : t
      )
    );
    setEditingTicketNoteId(null);
    setEditTicketNoteContent('');
    showToast('Note updated successfully');
  };

  const handleDeleteTicketNote = (id) => {
    setTimelineItems((prev) => prev?.filter((t) => t.id !== id));
    showToast('Note deleted');
  };

  const handleCreateTask = () => {
    if (!taskTitle?.trim()) return;
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
    if (!emailBody?.trim()) return;
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
      prev?.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item))
    );
  };

  const handleCollapseAll = () => {
    setTimelineItems((prev) => prev?.map((item) => ({ ...item, isExpanded: false })));
  };

  const handleExpandAll = () => {
    setTimelineItems((prev) => prev?.map((item) => ({ ...item, isExpanded: true })));
  };

  const isAca =
    pipeline === 'ACA account' ||
    (ticket?.title && ticket?.title?.toLowerCase().includes('aca'));

  const isUploadDoc =
    pipeline === 'Upload document' ||
    pipeline === 'Collect Document' ||
    (typeof pipeline === 'string' && pipeline?.toLowerCase().includes('document')) ||
    (typeof ticketTitle === 'string' && ticketTitle?.toLowerCase().includes('upload doc')) ||
    (ticket?.pipeline && typeof ticket.pipeline === 'string' && ticket.pipeline?.toLowerCase().includes('document')) ||
    (ticket?.title && typeof ticket?.title === 'string' && ticket?.title?.toLowerCase().includes('upload doc')) ||
    (ticket?.category && typeof ticket.category === 'string' && ticket.category?.toLowerCase().includes('upload doc'));

  const statusOptions = isPayment
    ? STATUS_OPTIONS_PAYMENT
    : isAca
    ? STATUS_OPTIONS_ACA
    : STATUS_OPTIONS_DEFAULT;

  // Group timeline items by month
  const filteredTimeline = timelineItems?.filter((item) => {
    if (filterAuthor !== 'all') {
      const a = getPersonName(item.actor, '');
      const c = getPersonName(item.creator, '');
      const matchActor = a && a?.toLowerCase().includes(filterAuthor?.toLowerCase());
      const matchCreator = c && c?.toLowerCase().includes(filterAuthor?.toLowerCase());
      if (!matchActor && !matchCreator) return false;
    }
    if (activeCenterTab === 'notes') return item.type === 'note';
    if (activeCenterTab === 'emails') return item.type === 'email';
    if (activeCenterTab === 'tasks') return item.type === 'task';
    return true;
  });

  const months = Array.from(new Set(filteredTimeline?.map((item) => item.month)));

  return (
    <div
      className="flex flex-col h-full bg-[#F4F6F9] overflow-hidden text-slate-800 text-xs font-sans selection:bg-blue-600 selection:text-white"
      ref={dropdownRef}
    >
      {/* Hidden file inputs for Files & Proof */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      <input type="file" ref={proofInputRef} onChange={handleProofUpload} className="hidden" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0F2962] text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP HEADER BAR (Clean & exact match to screenshot) ───────────── */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-md text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 font-bold text-sm"
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
              {/* Round avatar: A2 for ACA (#E05638), OT for Payment (#B25E3B) */}
              <div
                className={`w-10 h-10 rounded-full ${
                  isPayment ? 'bg-[#B25E3B]' : 'bg-[#E05638]'
                } text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
              >
                {avatar}
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
                  {/* 1. Priority */}
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
                        {priority !== 'None' ? (
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${
                              priority === 'High'
                                ? 'bg-rose-500'
                                : priority === 'Medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                        <span>{priority}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_drop_down</span>
                      </button>
                      {isPriorityOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-28">
                          {PRIORITY_OPTIONS?.map((p) => (
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
                              {p !== 'None' ? (
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    p === 'High'
                                      ? 'bg-rose-500'
                                      : p === 'Medium'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300" />
                              )}
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Close date or Open days */}
                  {openDays !== null && openDays !== undefined ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                        <span>Open:</span>
                      </div>
                      <span className="font-semibold text-slate-700">{openDays} Day(s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                        <span>Close date:</span>
                      </div>
                      <span className="font-semibold text-slate-700">{closeDate || '----------'}</span>
                    </div>
                  )}

                  {/* 3. Pipeline */}
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
                          {PIPELINE_OPTIONS?.map((pl) => (
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

                  {/* 4. Ticket Status */}
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
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-56">
                          {statusOptions?.map((st) => (
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
                            setPriority('None');
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
                        {serviceAgent ? (
                          <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {(getPersonName(serviceAgent)?.trim()?.split(/\s+/)[0]?.[0] || '?')}
                            {getPersonName(serviceAgent)?.trim()?.split(/\s+/)[1]?.[0] || ''}
                          </span>
                        ) : null}
                        <span className="truncate">{getPersonName(serviceAgent, 'Unassigned')}</span>
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
                        {platformMembers?.map((ag) => (
                          <button
                            key={ag.name}
                            type="button"
                            onClick={() => {
                              setServiceAgent(ag.name);
                              setIsServiceAgentOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center gap-2"
                          >
                            <span
                              className={`w-5 h-5 rounded-full ${ag.bg} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}
                            >
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
                    placeholder=""
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 5. Payment Status (Only when in Payment pipeline) */}
                {isPayment && (
                  <div>
                    <label className="block text-slate-700 font-medium text-[11px] mb-1">Payment Status</label>
                    <div className="relative">
                      <div
                        onClick={() => setIsPaymentStatusOpen(!isPaymentStatusOpen)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-slate-300"
                      >
                        <span className="font-semibold text-slate-800">{paymentStatus || '--'}</span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaymentStatus('');
                            }}
                            className="hover:text-slate-600 text-[11px]"
                          >
                            ✕
                          </span>
                          <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                        </div>
                      </div>

                      {isPaymentStatusOpen && (
                        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-full">
                          {PAYMENT_STATUS_OPTIONS?.map((ps) => (
                            <button
                              key={ps}
                              type="button"
                              onClick={() => {
                                setPaymentStatus(ps);
                                setIsPaymentStatusOpen(false);
                                showToast(`Payment Status set to ${ps}`);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs font-medium"
                            >
                              {ps}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Change Due Date Reason */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">
                    Change Due Date Reason
                  </label>
                  <input
                    type="text"
                    value={changeDueDateReason}
                    onChange={(e) => setChangeDueDateReason(e.target.value)}
                    placeholder=""
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {!isUploadDoc && (<>
                  {/* 7. Carrier */}
                                  <div>
                                    <label className="block text-slate-700 font-medium text-[11px] mb-1">Carrier</label>
                                    <input
                                      type="text"
                                      value={carrier}
                                      onChange={(e) => setCarrier(e.target.value)}
                                      placeholder=""
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>
                </>)}


                {/* 8. Ticket Owner */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Ticket Owner</label>
                  <div className="relative">
                    <div
                      onClick={() => setIsTicketOwnerOpen(!isTicketOwnerOpen)}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-slate-300"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {ticketOwner ? (
                          <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {(getPersonName(ticketOwner)?.trim()?.split(/\s+/)[0]?.[0] || '?')}
                            {getPersonName(ticketOwner)?.trim()?.split(/\s+/)[1]?.[0] || ''}
                          </span>
                        ) : null}
                        <span className="truncate">{getPersonName(ticketOwner, 'Unassigned')}</span>
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
                        {platformMembers?.map((ag) => (
                          <button
                            key={ag.name}
                            type="button"
                            onClick={() => {
                              setTicketOwner(ag.name);
                              setIsTicketOwnerOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs flex items-center gap-2"
                          >
                            <span
                              className={`w-5 h-5 rounded-full ${ag.bg} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}
                            >
                              {ag.avatar}
                            </span>
                            <span className="truncate">{ag.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 9. Deadline Date */}
                <div>
                  <label className="block text-slate-700 font-medium text-[11px] mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 10. Files */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-medium text-[11px]">Files</label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">add_circle</span>
                      <span>Add new</span>
                    </button>
                  </div>
                  {filesList.length > 0 ? (
                    <div className="space-y-1">
                      {filesList?.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px]"
                        >
                          <span className="truncate font-medium text-slate-700">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => setFilesList((prev) => prev?.filter((_, idx) => idx !== i))}
                            className="text-rose-500 hover:text-rose-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {!isUploadDoc && (<>
                  {/* 11. Paid Through Date */}
                                  <div>
                                    <label className="block text-slate-700 font-medium text-[11px] mb-1">
                                      Paid Through Date
                                    </label>
                                    <div className="relative">
                                      <div
                                        onClick={() => {
                                          const picked = prompt('Enter Paid Through Date (MM/DD/YYYY):', paidThroughDate);
                                          if (picked !== null) setPaidThroughDate(picked);
                                        }}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 cursor-pointer hover:border-slate-300"
                                      >
                                        <span className="text-slate-600">{paidThroughDate || ''}</span>
                                        <span className="material-symbols-outlined text-[15px] text-slate-500">
                                          calendar_month
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                </>)}


                {/* 12. Proof (if available) */}
                {isPayment && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-medium text-[11px]">Proof</label>
                      <button
                        type="button"
                        onClick={() => proofInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">add_circle</span>
                        <span>Add new</span>
                      </button>
                    </div>
                    {proofList.length > 0 && (
                      <div className="space-y-1">
                        {proofList?.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px]"
                          >
                            <span className="truncate font-medium text-slate-700">{p.name}</span>
                            <button
                              type="button"
                              onClick={() => setProofList((prev) => prev?.filter((_, idx) => idx !== i))}
                              className="text-rose-500 hover:text-rose-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER COLUMN: Activity Feed matching media_1790248085814.png ── */}
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
                  <option value="Khanh Nguyen"></option>
                  <option value="Anya Nguyen">Anya Nguyen</option>
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
            
            {/* If isUploadDoc and on Activity tab, show the Document Collection Grid */}
            {isUploadDoc && activeCenterTab === 'activity' && (
              <div className="space-y-4 mb-6">
                {/* ── Document Collection Progress Card ── */}
                <div className="bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 border border-blue-200/80 rounded-xl p-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[18px]">folder_managed</span>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span>Document Collection Progress</span>
                          {Object.keys(uploadedDocs)?.filter((k) => ['income', 'citizenship', 'ssn', 'id'].includes(k)).length >= 4 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              Completed (4/4)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                              In Progress
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {Object.keys(uploadedDocs)?.filter((k) => ['income', 'citizenship', 'ssn', 'id'].includes(k)).length} of 4 required documents uploaded
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700">
                        {Math.round((Object.keys(uploadedDocs)?.filter((k) => ['income', 'citizenship', 'ssn', 'id'].includes(k)).length / 4) * 100)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((Object.keys(uploadedDocs)?.filter((k) => ['income', 'citizenship', 'ssn', 'id'].includes(k)).length / 4) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ── 6 Document Cards Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {UPLOAD_CATEGORIES?.map((doc) => {
                    const uploadedItem = uploadedDocs[doc.id];
                    const isUploading = uploadingCatId === doc.id;

                    return (
                      <div
                        key={doc.id}
                        className={`bg-white border rounded-xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between relative ${
                          uploadedItem ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                        }`}
                      >
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[doc.id] = el)}
                          accept={doc.acceptedExt}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleDocUpload(doc.id, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        <div>
                          {/* Card Header: Title + Status Badge */}
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-slate-500">
                                {doc.icon}
                              </span>
                              <span>{doc.title}</span>
                              {doc.req && <span className="text-rose-500 font-bold">*</span>}
                            </span>

                            {uploadedItem ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                Uploaded
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  doc.req
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {doc.req ? 'Missing' : 'Optional'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mb-3">{doc.desc}</p>
                        </div>

                        {/* File details or Upload button */}
                        {uploadedItem ? (
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">
                                  {uploadedItem.type === 'image'
                                    ? 'image'
                                    : uploadedItem.type === 'pdf'
                                    ? 'picture_as_pdf'
                                    : 'description'}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="text-xs font-semibold text-slate-800 truncate"
                                    title={uploadedItem.name}
                                  >
                                    {uploadedItem.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    {uploadedItem.size} • {uploadedItem.uploadedAt}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                  type="button"
                                  title="Xem trước"
                                  onClick={() => setPreviewDoc(uploadedItem)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-blue-600 transition cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </button>
                                <button
                                  type="button"
                                  title="Tải xuống"
                                  onClick={() => handleDocDownload(uploadedItem)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-blue-600 transition cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">download</span>
                                </button>
                                <button
                                  type="button"
                                  title="Xóa tài liệu"
                                  onClick={() => handleDocDelete(doc.id)}
                                  className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[doc.id]?.click()}
                              className="w-full text-center text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer py-0.5"
                            >
                              Tải lên bản thay thế (Replace file)
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/60 text-slate-600 hover:text-blue-700 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {isUploading ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span>Đang tải lên...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                <span>Upload File</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {months.length === 0 ? (
              !isUploadDoc && (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400">
                  <div className="mb-4">
                    <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 75L35 60L60 45L75 60L50 75Z" fill="#E2E8F0"/>
                      <path d="M35 60V85L60 100V75L35 60Z" fill="#CBD5E1"/>
                      <path d="M75 60V85L60 100V75L75 60Z" fill="#94A3B8"/>
                      <path d="M55 40C45 35 40 20 50 15" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
                      <circle cx="50" cy="15" r="3" fill="#3B82F6"/>
                    </svg>
                  </div>
                  <span className="font-bold text-slate-700 text-sm mb-1">No data here!</span>
                  <span className="text-[12px] text-slate-500">There is no data to show right now.</span>
                </div>
              )
            ) : (
              months?.map((month) => {
                const itemsInMonth = filteredTimeline?.filter((item) => item.month === month);
                return (
                  <div key={month} className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700">{month}</h3>

                    <div className="space-y-3">
                      {itemsInMonth?.map((item, itemIdx) => {
                        // 1. Deal move to Enrolled - Active / Enrolled - 1st Payment done
                        if (item.type === 'deal_move_active' || item.type === 'deal_move_payment') {
                          return (
                            <div
                              key={item.id || `deal_move_${month}_${itemIdx}`}
                              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-900">{String(item.title || 'Deal Activity')}</span>
                                <span className="text-[11px] text-slate-400">{String(item.timestamp || '')}</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-slate-800">{getPersonName(item.actor, 'Staff')}</span> moved deal{' '}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectDeal &&
                                    onSelectDeal({
                                      id: item.dealId || associatedDeal?.id || associatedDeal?.code || '',
                                      title: item.dealName,
                                      pipeline: dealPipeline,
                                      stage: item.targetStage,
                                      carrier: dealCarrier,
                                      contactName: contactName,
                                    })
                                  }
                                  className="text-blue-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <span>{String(item.dealName || '')}</span>
                                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                </button>{' '}
                                to <span className="font-semibold text-slate-800">{String(item.targetStage || '')}</span>.{' '}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectDeal &&
                                    onSelectDeal({
                                      id: item.dealId || associatedDeal?.id || associatedDeal?.code || '',
                                      title: item.dealName,
                                      pipeline: dealPipeline,
                                      stage: item.targetStage,
                                      carrier: dealCarrier,
                                      contactName: contactName,
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

                        // 2. Ticket move from Need Create ACA Account to DONE
                        if (item.type === 'ticket_move_done') {
                          return (
                            <div
                              key={item.id || `ticket_move_${month}_${itemIdx}`}
                              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-900">{String(item.title || 'Ticket Activity')}</span>
                                <span className="text-[11px] text-slate-400">{String(item.timestamp || '')}</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-slate-800">{getPersonName(item.actor, 'Staff')}</span> moved ticket from{' '}
                                <span className="font-semibold text-slate-800">{String(item.fromStatus || '')}</span> to{' '}
                                <span className="font-semibold text-slate-800">{String(item.toStatus || '')}</span>.{' '}
                                <button
                                  type="button"
                                  onClick={() => setShowHistoryModal(true)}
                                  className="text-blue-600 font-medium hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
                                >
                                  <span>View Details</span>
                                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // 3. Ticket created by automation
                        if (item.type === 'ticket_created') {
                          return (
                            <div
                              key={item.id || `ticket_create_${month}_${itemIdx}`}
                              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-900">{String(item.title || 'Ticket Activity')}</span>
                                <span className="text-[11px] text-slate-400">{String(item.timestamp || '')}</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <span>{getPersonName(item.creator, 'System')} created ticket </span>
                                <span className="text-blue-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5">
                                  <span>{String(item.targetTicketName || 'Ticket')}</span>
                                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // 4. Deal created by user
                        if (item.type === 'deal_created') {
                          return (
                            <div
                              key={item.id || `deal_create_${month}_${itemIdx}`}
                              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-900">{String(item.title || 'Deal Activity')}</span>
                                <span className="text-[11px] text-slate-400">{String(item.timestamp || '')}</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-slate-800">{getPersonName(item.actor, 'Staff')}</span> created deal{' '}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectDeal &&
                                    onSelectDeal({
                                      id: item.dealId || associatedDeal?.id || associatedDeal?.code || '',
                                      title: item.dealName,
                                      pipeline: dealPipeline,
                                      stage: dealStage,
                                      carrier: dealCarrier,
                                      contactName: contactName,
                                    })
                                  }
                                  className="text-blue-600 font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <span>{String(item.dealName || '')}</span>
                                  <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Note or other custom activities
                        return (
                          <div
                            key={item.id || `item_${month}_${itemIdx}`}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:shadow-xs transition"
                          >
                            <div className="flex items-center justify-between">
                              <div
                                onClick={() => toggleItemExpand(item.id)}
                                className="flex items-center gap-2 cursor-pointer select-none"
                              >
                                <span className="material-symbols-outlined text-[15px] text-slate-400">
                                  {item.isExpanded ? 'expand_more' : 'chevron_right'}
                                </span>
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                                  {String(item.title || 'Note')}
                                </span>
                                <span className="text-xs text-slate-600">
                                  published by <span className="font-semibold text-slate-800">{getPersonName(item.actor, 'Staff')}</span>
                                </span>
                                {item.isEdited && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {item.type === 'note' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTicketNoteId(item.id);
                                        setEditTicketNoteContent(item.content || '');
                                      }}
                                      className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold cursor-pointer transition"
                                      title="Edit note"
                                    >
                                      <span className="material-symbols-outlined text-[13px]">edit</span>
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTicketNote(item.id)}
                                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition cursor-pointer"
                                      title="Delete note"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                  </>
                                )}
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                                  <span>{String(item.timestamp || '')}</span>
                                </div>
                              </div>
                            </div>

                            {editingTicketNoteId === item.id ? (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 pl-6 space-y-2">
                                <textarea
                                  value={editTicketNoteContent}
                                  onChange={(e) => setEditTicketNoteContent(e.target.value)}
                                  rows={3}
                                  className="w-full p-2 text-xs border border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed bg-white shadow-2xs"
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTicketNoteId(null);
                                      setEditTicketNoteContent('');
                                    }}
                                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveTicketNote(item.id)}
                                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">save</span>
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              item.isExpanded && item.content && (
                                <div
                                  onDoubleClick={() => {
                                    if (item.type === 'note') {
                                      setEditingTicketNoteId(item.id);
                                      setEditTicketNoteContent(item.content || '');
                                    }
                                  }}
                                  title={item.type === 'note' ? 'Double-click to edit note' : ''}
                                  className="mt-2.5 pt-2 border-t border-slate-100 pl-6 text-xs text-slate-700 leading-relaxed whitespace-pre-line cursor-text"
                                >
                                  {item.content}
                                </div>
                              )
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
                <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Add company" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Refresh" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {companiesOpen && (
              <div className="p-4 flex flex-col items-center justify-center text-center py-6">
                <div className="mb-2">
                  <svg width="60" height="60" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 75L35 60L60 45L75 60L50 75Z" fill="#E2E8F0"/>
                    <path d="M35 60V85L60 100V75L35 60Z" fill="#CBD5E1"/>
                    <path d="M75 60V85L60 100V75L75 60Z" fill="#94A3B8"/>
                    <path d="M55 40C45 35 40 20 50 15" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
                    <circle cx="50" cy="15" r="3" fill="#3B82F6"/>
                  </svg>
                </div>
                <span className="font-bold text-slate-700 text-xs">No data here!</span>
                <span className="text-[11px] text-slate-400 mt-0.5">There is no data to show right now.</span>
              </div>
            )}
          </div>

          {/* Card 2: Contacts */}
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
                <span>Contacts ({contactName && contactName !== 'Unknown' ? 1 : 0})</span>
              </button>
              <div className="flex items-center gap-2 text-slate-400">
                <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Add contact" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Refresh" className="hover:text-blue-600">
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                </button>
              </div>
            </div>

            {contactsOpen && (
              <div className="p-3">
                {contactName && contactName !== 'Unknown' ? (
                  <>
                    <div
                      onClick={() => {
                        const cId =
                          ticket?.contactId ||
                          (typeof ticket?.contact === 'object' ? ticket.contact?.id || ticket.contact?.code : ticket?.contact) ||
                          '';
                        if (onSelectContact) {
                          onSelectContact({
                            id: cId,
                            code: ticket?.contact?.code || cId || '',
                            fullName: contactName,
                            name: contactName,
                            phone: contactPhone,
                            email: contactEmail,
                            leadOwner: leadOwner,
                          });
                        }
                      }}
                      className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition font-bold text-[11px]">
                          {contactName ? (String(contactName)?.trim()?.split(/\s+/)[0]?.[0] || 'U') : 'U'}
                          {contactName ? (String(contactName)?.trim()?.split(/\s+/)[1]?.[0] || '') : 'H'}
                        </div>
                        <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs">
                          {contactName}
                        </span>
                      </div>

                      <div className="space-y-1 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                          <span className="text-slate-500">{contactPhone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                          <span className="text-slate-500 truncate" title={contactEmail}>
                            {contactEmail ? (contactEmail.length > 26 ? `${contactEmail.slice(0, 26)}...` : contactEmail) : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                          <span className="text-slate-500">Lead Owner:</span>
                          <span className="font-semibold text-slate-800">{leadOwner || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const cId =
                          ticket?.contactId ||
                          (typeof ticket?.contact === 'object' ? ticket.contact?.id || ticket.contact?.code : ticket?.contact) ||
                          '';
                        if (onSelectContact) {
                          onSelectContact({
                            id: cId,
                            code: ticket?.contact?.code || cId || '',
                            fullName: contactName,
                            name: contactName,
                            phone: contactPhone,
                            email: contactEmail,
                            leadOwner: leadOwner,
                          });
                        }
                      }}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      » View Associated Contact
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-[28px] text-slate-300 block mb-1">person_off</span>
                    <p className="font-medium text-slate-500">No contact linked</p>
                    <p className="text-[11px] text-slate-400">This ticket has no associated contact.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Deals */}
          {(() => {
            const hasAssociatedDeal = Boolean(
              associatedDeal && (associatedDeal.title || associatedDeal.id || associatedDeal.dealName)
            );
            return (
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
                    <span>Deals ({hasAssociatedDeal ? 1 : 0})</span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-400">
                    <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })} type="button" title="Add deal" className="hover:text-blue-600">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                    <button
                      type="button"
                      title="Refresh Deal"
                      onClick={() => resolveAndApplyDeal(ticket)}
                      className="hover:text-blue-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                    </button>
                  </div>
                </div>

                {dealsOpen && (
                  <div className="p-3">
                    {hasAssociatedDeal ? (
                      <>
                        <div
                          onClick={() => {
                            if (onSelectDeal && associatedDeal) {
                              onSelectDeal(associatedDeal);
                            }
                          }}
                          className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#52B4C9] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition font-bold text-[11px]">
                              {dealTitle ? (String(dealTitle)?.trim()?.split(/\s+/)[0]?.[0] || 'D') : 'D'}
                              {dealTitle ? (String(dealTitle)?.trim()?.split(/\s+/)[1]?.[0] || '') : ''}
                            </div>
                            <span className="font-bold text-[#104882] group-hover:text-blue-600 transition text-xs truncate">
                              {dealShortTitle || dealTitle}
                            </span>
                          </div>

                          <div className="space-y-1 pt-0.5 text-[11px] text-slate-600 pl-0.5">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">bar_chart</span>
                              <span className="text-slate-500">Pipeline:</span>
                              <span className="font-semibold text-slate-800">{dealPipeline || 'Obamacare 2026'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">trending_up</span>
                              <span className="text-slate-500">Stage:</span>
                              <span className="font-semibold text-slate-800">{dealStage || 'Ready to Enroll'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                              <span className="text-slate-500">Deal Owner:</span>
                              <span className="font-semibold text-slate-800">{dealOwner || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">verified_user</span>
                              <span className="text-slate-500">Carrier:</span>
                              <span className="font-semibold text-slate-800">{dealCarrier || '—'}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectDeal && associatedDeal) {
                              onSelectDeal(associatedDeal);
                            }
                          }}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          » View Associated Deal
                        </button>
                      </>
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <span className="material-symbols-outlined text-[28px] text-slate-300 block mb-1">
                          inventory_2
                        </span>
                        <p className="font-medium text-slate-500">No data here!</p>
                        <p className="text-[11px] text-slate-400">There is no data to show right now.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
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
                  <span>Status changed to {status}</span>
                  <span className="text-[11px] text-slate-400">07/20/2026, 15:04</span>
                </div>
                <p className="text-slate-600">Updated by {getPersonName(serviceAgent, 'Platform Staff')}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Ticket Created</span>
                  <span className="text-[11px] text-slate-400">07/15/2026, 12:18</span>
                </div>
                <p className="text-slate-600">
                  Created ticket {String(ticketTitle || 'Ticket')} with Priority {String(priority || 'Medium')}
                </p>
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
                  value={`${contactName} <${contactEmail}>`}
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
                  placeholder="Dear client, regarding your ACA account..."
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
                  placeholder="e.g. Verify ACA account credentials with Marketplace"
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

      {/* ── MODAL: Preview Document ────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  {previewDoc.type === 'image' ? 'image' : (previewDoc.type === 'pdf' ? 'picture_as_pdf' : 'description')}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 truncate" title={previewDoc.name}>
                  {previewDoc.name}
                </span>
                <span className="text-[11px] text-slate-400">({previewDoc.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDocDownload(previewDoc)}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[300px]">
              {previewDoc.type === 'image' && previewDoc.url ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-h-[60vh] max-w-full rounded object-contain shadow-sm"
                />
              ) : previewDoc.type === 'pdf' && previewDoc.url ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[60vh] rounded border border-slate-200"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <span className="material-symbols-outlined text-6xl text-slate-400">description</span>
                  <p className="text-xs font-medium text-slate-700">{previewDoc.name}</p>
                  <p className="text-[11px] text-slate-500">Tài liệu đã được tải lên máy chủ. Bạn có thể tải file về để xem chi tiết.</p>
                  <button
                    type="button"
                    onClick={() => handleDocDownload(previewDoc)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Tải xuống file
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
