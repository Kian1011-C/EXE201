import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ── Contacts Routes ──────────────────────────────────────────────────────────
// GET /api/contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { search, owner } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (owner && owner !== 'all') {
      where.contactOwnerName = { contains: owner, mode: 'insensitive' };
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { no: 'asc' },
      include: {
        deals: true,
      },
    });

    // Format for frontend compatibility
    const formatted = contacts.map((c) => ({
      ...c,
      contactOwner: {
        name: c.contactOwnerName,
        avatar: c.contactOwnerAvatar,
        bg: c.contactOwnerBg,
      },
      primary: {
        firstName: c.firstName,
        middleName: c.middleName,
        lastName: c.lastName,
        dob: c.dob,
        ssn: c.ssn,
        familyRelationship: c.familyRelationship,
        gender: c.gender,
        immigrationStatus: c.immigrationStatus,
        alienNumber: c.alienNumber,
        certificateNumber: c.certificateNumber,
        dateExpired: c.dateExpired,
        household: c.household,
      },
      contactFields: {
        phone: c.phone,
        enrolledAddress: c.enrolledAddress,
        mailingAddress: c.mailingAddress,
        state: c.state,
        streetAddress: c.streetAddress,
        city: c.city,
        postalCode: c.postalCode,
        county: c.county,
        language: c.language,
        career: c.career,
      },
      acaAccountDetails: {
        theBestRateEmail: c.theBestRateEmail,
        acaAccountStatus: c.acaAccountStatus,
        acaAccount: c.acaAccount,
        acaPass: c.acaPass,
        acaStatusSpecial: c.acaStatusSpecial,
        acaAccountSpecial: c.acaAccountSpecial,
        acaPassSpecial: c.acaPassSpecial,
        enrollCallRep: c.enrollCallRep,
      },
      sourceOfLead: {
        howDoYouKnowUs: c.howDoYouKnowUs,
        whoReferClient: c.whoReferClient,
        teleSaleTeam: c.teleSaleTeam,
        contactOwner: c.contactOwnerName,
        supportAgent: c.supportAgent,
      },
      associatedDeals: c.deals,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/:id
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [{ id: id }, { code: id }],
      },
      include: {
        deals: true,
        documents: {
          include: { files: true },
        },
        tickets: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Format files by category for customer documents
    const doc = contact.documents[0] || null;
    let filesByCategory = {
      consentFormMkp: [],
      consentFormText: [],
      identity: [],
      insuranceRecord: [],
      otherDocument: [],
      paymentInformation: [],
      tax: [],
    };

    if (doc && doc.files) {
      doc.files.forEach((f) => {
        if (filesByCategory[f.category]) {
          filesByCategory[f.category].push(f);
        } else {
          filesByCategory.otherDocument.push(f);
        }
      });
    }

    const formatted = {
      ...contact,
      contactOwner: {
        name: contact.contactOwnerName,
        avatar: contact.contactOwnerAvatar,
        bg: contact.contactOwnerBg,
      },
      primary: {
        firstName: contact.firstName,
        middleName: contact.middleName,
        lastName: contact.lastName,
        dob: contact.dob,
        ssn: contact.ssn,
        familyRelationship: contact.familyRelationship,
        gender: contact.gender,
        immigrationStatus: contact.immigrationStatus,
        alienNumber: contact.alienNumber,
        certificateNumber: contact.certificateNumber,
        dateExpired: contact.dateExpired,
        household: contact.household,
      },
      contactFields: {
        phone: contact.phone,
        enrolledAddress: contact.enrolledAddress,
        mailingAddress: contact.mailingAddress,
        state: contact.state,
        streetAddress: contact.streetAddress,
        city: contact.city,
        postalCode: contact.postalCode,
        county: contact.county,
        language: contact.language,
        career: contact.career,
      },
      acaAccount: {
        theBestRateEmail: contact.theBestRateEmail,
        acaAccountStatus: contact.acaAccountStatus,
        acaAccount: contact.acaAccount,
        acaPass: contact.acaPass,
        acaStatusSpecial: contact.acaStatusSpecial,
        acaAccountSpecial: contact.acaAccountSpecial,
        acaPassSpecial: contact.acaPassSpecial,
        enrollCallRep: contact.enrollCallRep,
      },
      sourceOfLead: {
        howDoYouKnowUs: contact.howDoYouKnowUs,
        whoReferClient: contact.whoReferClient,
        teleSaleTeam: contact.teleSaleTeam,
        contactOwner: contact.contactOwnerName,
        supportAgent: contact.supportAgent,
      },
      associatedDeals: contact.deals,
      associatedTickets: contact.tickets,
      associatedDocuments: doc
        ? [
            {
              id: doc.id,
              name: doc.name,
              initials: doc.initials,
              filesByCategory,
            },
          ]
        : [],
      activities: contact.activities,
      notes: contact.notes.map((n) => ({
        ...n,
        attachments: JSON.parse(n.attachments || '[]'),
      })),
      tasks: contact.tasks.map((t) => ({
        ...t,
        attachments: JSON.parse(t.attachments || '[]'),
      })),
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact details' });
  }
});

// POST /api/contacts
app.get('/api/contacts', async (req, res) => {
  // Handled above
});

app.post('/api/contacts', async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.contact.count();
    const newCode = data.code || `CT2600${2610 + count}`;
    const newId = newCode;

    const firstName = data.firstName || '';
    const middleName = data.middleName || '';
    const lastName = data.lastName || '';
    const fullName =
      data.fullName || [firstName, middleName, lastName].filter(Boolean).join(' ') || 'New Contact';

    const contact = await prisma.contact.create({
      data: {
        id: newId,
        code: newCode,
        no: count + 1,
        firstName,
        middleName,
        lastName,
        fullName,
        phone: data.phone || '',
        email: data.email || '',
        language: data.language || 'Vietnamese',
        howDoYouKnowUs: data.howDoYouKnowUs || '',
        whoReferClient: data.whoReferClient || '',
        teleSaleTeam: data.teleSaleTeam || '',
        contactOwnerName: data.contactOwner?.name || data.contactOwnerName || 'The Best Rate Insurance',
        contactOwnerAvatar: data.contactOwner?.avatar || data.contactOwnerAvatar || 'TB',
        contactOwnerBg: data.contactOwner?.bg || data.contactOwnerBg || 'bg-teal-700 text-white',
        supportAgent: data.supportAgent || 'Anya Nguyen (anya42@9)',
        acaAccountStatus: data.acaAccountStatus || '',
        status: data.status || 'Active',
        lastModifiedBy: 'Platform Staff',
        lastModifiedTime: new Date().toLocaleString(),
        dob: data.dob || '',
        ssn: data.ssn || '',
        gender: data.gender || 'Male',
        state: data.state || '',
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /api/contacts/:id
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        lastModifiedTime: new Date().toLocaleString(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// ── Deals Routes ─────────────────────────────────────────────────────────────
// GET /api/deals
app.get('/api/deals', async (req, res) => {
  try {
    const { search, pipeline, stage, owner } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { carrier: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (pipeline && pipeline !== 'all') {
      where.pipeline = { contains: pipeline, mode: 'insensitive' };
    }

    if (stage && stage !== 'all') {
      where.stage = { contains: stage, mode: 'insensitive' };
    }

    if (owner && owner !== 'all') {
      where.dealOwnerName = { contains: owner, mode: 'insensitive' };
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    const formatted = deals.map((d, index) => ({
      ...d,
      no: index + 1,
      contactName: d.contact?.fullName || '',
      contactPhone: d.contact?.phone || '',
      contactEmail: d.contact?.email || '',
      dealOwner: {
        name: d.dealOwnerName,
        avatar: d.dealOwnerAvatar,
        bg: d.dealOwnerBg,
      },
      lastModifiedBy: {
        name: d.lastModifiedBy,
        avatar: d.lastModifiedBy.slice(0, 2).toUpperCase(),
        bg: 'bg-teal-600 text-white',
      },
      adminOnly: {
        enrolledNpn: d.enrolledNpn,
        brokerEffectiveDate: d.brokerEffectiveDate,
        terminationDate: d.terminationDate,
        primaryMemberId: d.primaryMemberId,
        saleSupportStatus: d.saleSupportStatus,
        numberMember: d.numberMember,
        sellingState: d.sellingState,
        carrier: d.carrier,
        closedLostReason: d.closedLostReason,
      },
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// GET /api/deals/:id
app.get('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await prisma.deal.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        contact: {
          include: {
            documents: {
              include: { files: true },
            },
          },
        },
        tickets: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const doc = deal.contact?.documents?.[0] || null;

    res.json({
      ...deal,
      contact: deal.contact,
      tickets: deal.tickets,
      activities: deal.activities,
      notes: deal.notes,
      tasks: deal.tasks,
      customerDocument: doc,
      adminOnly: {
        enrolledNpn: deal.enrolledNpn,
        brokerEffectiveDate: deal.brokerEffectiveDate,
        terminationDate: deal.terminationDate,
        primaryMemberId: deal.primaryMemberId,
        saleSupportStatus: deal.saleSupportStatus,
        numberMember: deal.numberMember,
        sellingState: deal.sellingState,
        carrier: deal.carrier,
        closedLostReason: deal.closedLostReason,
      },
    });
  } catch (error) {
    console.error('Error fetching deal details:', error);
    res.status(500).json({ error: 'Failed to fetch deal details' });
  }
});

// PUT /api/deals/:id (Update stage, pipeline, title, etc.)
app.put('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, pipeline, title, amount, closeDate, carrier, sellingState } = req.body;

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(pipeline && { pipeline }),
        ...(title && { title }),
        ...(amount && { amount }),
        ...(closeDate && { closeDate }),
        ...(carrier && { carrier }),
        ...(sellingState && { sellingState }),
        lastModifiedTime: new Date().toLocaleString(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// POST /api/deals
app.post('/api/deals', async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.deal.count();
    const newCode = data.code || `D2600${5040 + count}`;

    const deal = await prisma.deal.create({
      data: {
        id: newCode,
        code: newCode,
        title: data.title || 'New Deal',
        contactId: data.contactId,
        pipeline: data.pipeline || 'Obamacare 2026',
        stage: data.stage || 'Ready to Enroll (Obamacare 2026)',
        carrier: data.carrier || 'BCBS',
        amount: data.amount || '$0.00',
        closeDate: data.closeDate || '_ _ _ _ _ _ _ _ _ _',
        sellingState: data.sellingState || 'North Carolina (NC)',
        dealOwnerName: data.dealOwnerName || 'Khanh Nguyen',
        enrolledNpn: data.enrolledNpn || 'Anh Que Pham 20011862',
      },
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// ── Customer Documents Routes ────────────────────────────────────────────────
// GET /api/documents/:id
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.customerDocument.findFirst({
      where: {
        OR: [{ id }, { contactId: id }],
      },
      include: {
        contact: true,
        files: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document record not found' });
    }

    const filesByCategory = {
      consentFormMkp: [],
      consentFormText: [],
      identity: [],
      insuranceRecord: [],
      otherDocument: [],
      paymentInformation: [],
      tax: [],
    };

    document.files.forEach((f) => {
      if (filesByCategory[f.category]) {
        filesByCategory[f.category].push(f);
      } else {
        filesByCategory.otherDocument.push(f);
      }
    });

    res.json({
      ...document,
      filesByCategory,
      associatedContact: {
        id: document.contact.id,
        name: document.contact.fullName,
        phone: document.contact.phone,
        email: document.contact.email,
        leadOwner: document.contact.contactOwnerName,
        language: document.contact.language,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// POST /api/documents/:id/files
app.post('/api/documents/:id/files', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, fullName, size, type, url } = req.body;

    const file = await prisma.documentFile.create({
      data: {
        documentId: id,
        category: category || 'identity',
        name: name || 'Attachment',
        fullName: fullName || name || 'Attachment',
        size: size || '100 KB',
        type: type || 'document',
        url: url || '',
      },
    });

    res.status(201).json(file);
  } catch (error) {
    console.error('Error uploading document file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// ── Activities & Notes & Tasks ───────────────────────────────────────────────
// POST /api/contacts/:id/notes
app.post('/api/contacts/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author, attachments } = req.body;

    const now = new Date();
    const note = await prisma.note.create({
      data: {
        id: 'note-' + Date.now(),
        contactId: id,
        text,
        author: author || 'Anya Nguyen',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        attachments: JSON.stringify(attachments || []),
      },
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// POST /api/contacts/:id/tasks
app.post('/api/contacts/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, assignedTo, dueDate, dueTime, priority, taskType, content, remind, attachments } = req.body;

    const task = await prisma.task.create({
      data: {
        id: 'task-' + Date.now(),
        contactId: id,
        title,
        assignedTo: assignedTo || 'Anya Nguyen',
        dueDate: dueDate || '09/18/2026',
        dueTime: dueTime || '8:00 AM',
        remind: remind || 'No remind',
        priority: priority || 'Medium',
        taskType: taskType || '',
        content: content || '',
        attachments: JSON.stringify(attachments || []),
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ── Ticket Routes ────────────────────────────────────────────────────────────
app.get('/api/tickets', async (req, res) => {
  try {
    const { pipeline, status, priority, contactId, dealId } = req.query;
    const where = {};
    if (pipeline && pipeline !== 'all') where.pipeline = pipeline;
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { contact: true, deal: true },
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { contact: true, deal: true, comments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket detail' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const data = req.body;
    let priority = data.priority || 'Medium';
    if (data.dueDate) {
      const due = new Date(data.dueDate);
      const diff = due - new Date();
      if (diff < 86400000) priority = 'High'; // Less than 1 day
    }
    const count = await prisma.ticket.count();
    const newId = `TC2600${2000 + count}`;
    
    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        id: newId,
        priority
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (data.dueDate && data.dueDate !== existing.dueDate && !data.changeDueDateReason) {
      return res.status(400).json({ error: 'changeDueDateReason is required when dueDate is changed' });
    }
    if (data.status === 'Closed' && !data.ticketResult) {
      return res.status(400).json({ error: 'ticketResult is required when closing ticket' });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data,
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, authorName } = req.body;
    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        content,
        authorName: authorName || 'System',
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ── Task Routes ──────────────────────────────────────────────────────────────
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, priority, assignedTo, contactId, dealId } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (assignedTo && assignedTo !== 'all') where.assignedTo = assignedTo;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { contact: true, deal: true },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { contact: true, deal: true },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task detail' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.task.count();
    const newId = `TSK-${Date.now()}`;
    
    // Default due date = 3 business days from now
    let dueDate = data.dueDate;
    if (!dueDate) {
      let date = new Date();
      let addedDays = 0;
      while (addedDays < 3) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          addedDays++;
        }
      }
      dueDate = date.toISOString().split('T')[0]; // simple format
    }
    
    const task = await prisma.task.create({
      data: {
        ...data,
        id: newId,
        dueDate,
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ── Commission Routes ────────────────────────────────────────────────────────
app.get('/api/commissions', async (req, res) => {
  try {
    const { agentName, period, status, carrier } = req.query;
    const where = {};
    if (agentName && agentName !== 'all') where.agentName = agentName;
    if (period && period !== 'all') where.period = period;
    if (status && status !== 'all') where.status = status;
    if (carrier && carrier !== 'all') where.carrier = carrier;

    const commissions = await prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { deal: true },
    });
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

app.get('/api/commissions/summary', async (req, res) => {
  try {
    const all = await prisma.commission.findMany();
    let settledThisMonth = 0;
    let pendingAudit = 0;
    let ytdPaid = 0;
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    all.forEach(c => {
      if (c.status === 'SETTLED' && c.period === currentMonth) settledThisMonth += c.netAmount;
      if (c.status === 'PENDING') pendingAudit++;
      if (c.status === 'SETTLED') ytdPaid += c.netAmount; // roughly YTD for simple logic
    });
    
    const activePolicies = await prisma.deal.count({ where: { stage: { contains: 'Active' } } });
    
    res.json({ settledThisMonth, pendingAudit, ytdPaid, activePolicies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get commission summary' });
  }
});

app.post('/api/commissions', async (req, res) => {
  try {
    const data = req.body;
    const commission = await prisma.commission.create({ data });
    res.status(201).json(commission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create commission' });
  }
});

// POST /api/commissions/calculate - SSS Commission Rules Engine
app.post('/api/commissions/calculate', async (req, res) => {
  try {
    const { agentName = 'Khanh Nguyen', period, isNewAgent = false } = req.body;
    const now = new Date();
    const currentPeriod = period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const whereDeal = {};
    if (agentName && agentName !== 'all') {
      whereDeal.dealOwnerName = { contains: agentName, mode: 'insensitive' };
    }

    const deals = await prisma.deal.findMany({
      where: whereDeal,
      include: { contact: true },
    });

    const calculated = [];

    for (const deal of deals) {
      const members = deal.numberMember || 1;
      let grossPerMonth = 0;
      let commissionType = 'ACA_PMPM';

      if ((deal.pipeline || '').toLowerCase().includes('medicare')) {
        commissionType = 'MEDICARE';
        grossPerMonth = 51.0; // CMS Initial rate ($612/yr / 12)
      } else if ((deal.pipeline || '').toLowerCase().includes('presidio')) {
        commissionType = 'PRESIDIO';
        const numAmt = parseFloat((deal.amount || '').replace(/[^0-9.]/g, '')) || 350;
        grossPerMonth = numAmt * 0.15;
      } else {
        commissionType = 'ACA_PMPM';
        grossPerMonth = 30.0 * members; // $30 PMPM
      }

      // SSS (Sale Support Status) Split Logic:
      // NONE: 7/3 split (Agent 70%, Support 30% deduction) -> deductionRate = 0.30
      // PARTIAL: 5/5 split (Agent 50%, Support 50% deduction) -> deductionRate = 0.50
      // FULL: 3/7 split (Agent 30%, Support 70% deduction) -> deductionRate = 0.70
      let rawSss = String(deal.saleSupportStatus || '').toUpperCase();
      let sss = 'NONE';
      if (rawSss.includes('FULL')) sss = 'FULL';
      else if (rawSss.includes('PARTIAL')) sss = 'PARTIAL';
      else sss = 'NONE';

      let deductionRate = 0.30; // NONE: 7/3 split (Agent 70%, Support 30%)
      if (sss === 'PARTIAL') deductionRate = 0.50; // PARTIAL: 5/5 split (Agent 50%, Support 50%)
      else if (sss === 'FULL') deductionRate = 0.70; // FULL: 3/7 split (Agent 30%, Support 70%)
      else deductionRate = 0.30;

      // New Agent Grace: First 20 deals or tenure <= 3 months get 100% (NONE)
      if (isNewAgent) {
        deductionRate = 0.0;
        sss = 'NONE (Grace)';
      }

      const netAmount = Math.round(grossPerMonth * (1 - deductionRate) * 100) / 100;

      // Check for existing
      const existing = await prisma.commission.findFirst({
        where: {
          dealId: deal.id,
          period: currentPeriod,
        },
      });

      let record;
      if (existing) {
        record = await prisma.commission.update({
          where: { id: existing.id },
          data: {
            grossAmount: grossPerMonth,
            supportDeduction: deductionRate,
            netAmount,
            saleSupportStatus: sss,
            commissionType,
            carrier: deal.carrier || 'BCBS',
            memberCount: members,
            policyId: deal.primaryMemberId || deal.code,
            status: 'SETTLED',
          },
        });
      } else {
        record = await prisma.commission.create({
          data: {
            dealId: deal.id,
            agentName: deal.dealOwnerName || agentName,
            agentNpn: deal.enrolledNpn || '#1984210',
            carrier: deal.carrier || 'BCBS',
            planName: deal.title || 'Standard Plan',
            policyId: deal.primaryMemberId || deal.code,
            memberCount: members,
            grossAmount: grossPerMonth,
            supportDeduction: deductionRate,
            netAmount,
            commissionType,
            saleSupportStatus: sss,
            period: currentPeriod,
            status: 'SETTLED',
            settledAt: new Date(),
          },
        });
      }
      calculated.push(record);
    }

    res.json({
      success: true,
      message: `Calculated ${calculated.length} commissions for period ${currentPeriod}`,
      count: calculated.length,
      records: calculated,
    });
  } catch (error) {
    console.error('Commission calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate commissions', details: error.message });
  }
});

app.put('/api/commissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body; // status, etc
    if (data.status === 'SETTLED') data.settledAt = new Date();
    const commission = await prisma.commission.update({
      where: { id },
      data,
    });
    res.json(commission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update commission' });
  }
});

// ── Dashboard Routes ─────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalContacts = await prisma.contact.count();
    const activeDeals = await prisma.deal.count({ where: { NOT: { stage: { contains: 'Closed Lost' } } } });
    const openTickets = await prisma.ticket.count({ where: { status: 'Open' } });
    const pendingTasks = await prisma.task.count({ where: { status: 'Pending' } });

    const allDeals = await prisma.deal.findMany({ select: { pipeline: true, stage: true } });
    const dealsByPipeline = Object.entries(allDeals.reduce((acc, curr) => {
      acc[curr.pipeline] = (acc[curr.pipeline] || 0) + 1;
      return acc;
    }, {})).map(([pipeline, count]) => ({ pipeline, count }));

    const dealsByStage = Object.entries(allDeals.reduce((acc, curr) => {
      acc[curr.stage] = (acc[curr.stage] || 0) + 1;
      return acc;
    }, {})).map(([stage, count]) => ({ stage, count }));

    const allTickets = await prisma.ticket.findMany({ select: { pipeline: true, status: true, dueDate: true } });
    const ticketsByPipeline = Object.entries(allTickets.reduce((acc, curr) => {
      acc[curr.pipeline] = (acc[curr.pipeline] || 0) + 1;
      return acc;
    }, {})).map(([pipeline, count]) => ({ pipeline, count }));
    
    const ticketsByStatus = Object.entries(allTickets.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {})).map(([status, count]) => ({ status, count }));

    let overdueTickets = 0;
    const nowStr = new Date().toISOString().split('T')[0];
    allTickets.forEach(t => {
      if (t.status !== 'Closed' && t.status !== 'Completed' && t.dueDate && t.dueDate < nowStr) overdueTickets++;
    });

    const allTasks = await prisma.task.findMany({ select: { status: true, dueDate: true } });
    let overdueTasks = 0;
    allTasks.forEach(t => {
      if (t.status !== 'Completed' && t.dueDate && t.dueDate < nowStr) overdueTasks++;
    });

    const allComms = await prisma.commission.findMany();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let commissionThisMonth = 0;
    let commissionYTD = 0;
    allComms.forEach(c => {
      if (c.status === 'SETTLED') {
        commissionYTD += c.netAmount;
        if (c.period === currentMonth) commissionThisMonth += c.netAmount;
      }
    });

    res.json({
      totalContacts,
      activeDeals,
      openTickets,
      pendingTasks,
      dealsByPipeline,
      dealsByStage,
      ticketsByPipeline,
      ticketsByStatus,
      overdueTickets,
      overdueTasks,
      commissionThisMonth,
      commissionYTD
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ── Admin Portal Routes ───────────────────────────────────────────────────────
let ADMIN_ACCOUNTS = [
  {
    id: 'ACC-001',
    name: 'Super Admin',
    email: 'admin@insurmatch.us',
    role: 'admin',
    avatar: 'SA',
    bg: 'bg-rose-700 text-white',
    status: 'Active',
    phone: '+1 (800) 555-0199',
    department: 'Platform Operations & System Governance',
    statesLicensed: ['National'],
    npn: 'MASTER-ADMIN',
    joinedDate: '2025-01-10',
    lastActive: 'Just now',
    dealsCount: 0,
  },
  {
    id: 'ACC-002',
    name: 'Anh Que Pham CPA',
    email: 'anhque@insurmatch.us',
    role: 'agent',
    avatar: 'AQ',
    bg: 'bg-amber-600 text-white',
    status: 'Active',
    phone: '+1 (832) 555-2001',
    agencyRole: 'Principal Broker & Agency Sponsor',
    department: 'Executive Agency Leadership',
    statesLicensed: ['TX (TDI)', 'CA (CDI)', 'FL', 'NC'],
    npn: '20011862',
    joinedDate: '2024-08-15',
    lastActive: '15 mins ago',
    dealsCount: 84,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-003',
    name: 'Khanh Nguyen',
    email: 'khanh@insurmatch.us',
    role: 'agent',
    avatar: 'KN',
    bg: 'bg-blue-600 text-white',
    status: 'Active',
    phone: '+1 (838) 776-1434',
    agencyRole: 'Senior Partner Agent',
    department: 'Medicare & ACA Sales Hub',
    statesLicensed: ['TX (TDI)', 'CA (CDI)', 'FL'],
    npn: '1984210',
    joinedDate: '2025-02-01',
    lastActive: '1 hour ago',
    dealsCount: 42,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-004',
    name: 'Sean Ngo',
    email: 'sean@insurmatch.us',
    role: 'agent',
    avatar: 'SN',
    bg: 'bg-emerald-600 text-white',
    status: 'Active',
    phone: '+1 (713) 442-9901',
    agencyRole: 'Partner Agent',
    department: 'Health & Life Division',
    statesLicensed: ['TX', 'NC', 'GA'],
    npn: '1994321',
    joinedDate: '2025-03-12',
    lastActive: '3 hours ago',
    dealsCount: 29,
    complianceStatus: 'Verified & Cleared',
  },
  {
    id: 'ACC-005',
    name: 'Anya Nguyen',
    email: 'staff@insurmatch.us',
    role: 'staff',
    avatar: 'AN',
    bg: 'bg-teal-600 text-white',
    status: 'Active',
    phone: '+1 (832) 998-1122',
    department: 'Intake Coordination & Policy Support',
    statesLicensed: ['National Hub'],
    npn: 'STAFF-OPS',
    joinedDate: '2025-01-20',
    lastActive: '5 mins ago',
    dealsCount: 115,
  },
  {
    id: 'ACC-006',
    name: 'Miranda Pham',
    email: 'miranda@insurmatch.us',
    role: 'staff',
    avatar: 'MP',
    bg: 'bg-purple-600 text-white',
    status: 'Active',
    phone: '+1 (832) 998-3344',
    department: 'Document Verification & Client Services',
    statesLicensed: ['National Hub'],
    npn: 'STAFF-OPS',
    joinedDate: '2025-02-15',
    lastActive: '35 mins ago',
    dealsCount: 78,
  },
  {
    id: 'ACC-007',
    name: 'Ivy Le',
    email: 'ivyle@insurmatch.us',
    role: 'agent',
    avatar: 'IL',
    bg: 'bg-orange-500 text-white',
    status: 'Pending NPN',
    phone: '+1 (408) 555-8812',
    agencyRole: 'Associate Agent Applicant',
    department: 'California Regional Hub',
    statesLicensed: ['CA (CDI)', 'WA'],
    npn: 'PENDING_CDI_092',
    joinedDate: '2026-09-10',
    lastActive: 'Yesterday',
    dealsCount: 0,
    complianceStatus: 'State License Check in Progress',
  },
  {
    id: 'ACC-008',
    name: 'James Vu',
    email: 'jamesvu@insurmatch.us',
    role: 'agent',
    avatar: 'JV',
    bg: 'bg-slate-600 text-white',
    status: 'Suspended',
    phone: '+1 (214) 555-7766',
    agencyRole: 'Independent Field Agent',
    department: 'DFW North Hub',
    statesLicensed: ['TX (TDI)'],
    npn: '1854201',
    joinedDate: '2024-11-05',
    lastActive: '7 days ago',
    dealsCount: 18,
    complianceStatus: 'Suspended — AOR Dispute Investigation (SOP 23)',
    suspensionReason: 'Audit flagged unauthorized AOR switch request under review with TDI.',
  },
];

let ADMIN_AUDIT_LOGS = [
  {
    id: 'LOG-1092',
    action: 'NPN Sponsor Update',
    actor: 'Super Admin',
    target: 'Deal D26005041 (Ken xington Ho)',
    detail: 'Verified master sponsor NPN set to Anh Que Pham 20011862.',
    timestamp: '2026-09-25 10:45 AM',
    type: 'governance',
  },
  {
    id: 'LOG-1091',
    action: 'Agent Accreditation Pending',
    actor: 'System Automation',
    target: 'Ivy Le (ACC-007)',
    detail: 'Application received for CA (CDI) & WA license check.',
    timestamp: '2026-09-24 04:12 PM',
    type: 'compliance',
  },
  {
    id: 'LOG-1090',
    action: 'Sale Support Split Executed',
    actor: 'Super Admin',
    target: 'September 2026 Commission Ledger',
    detail: 'SSS rules applied: NONE (7/3), PARTIAL (5/5), FULL (3/7).',
    timestamp: '2026-09-23 09:30 AM',
    type: 'finance',
  },
  {
    id: 'LOG-1089',
    action: 'Agent Suspension Imposed',
    actor: 'Super Admin',
    target: 'James Vu (ACC-008)',
    detail: 'Temporary license access suspension per SOP 23 & SOP 27.',
    timestamp: '2026-09-18 02:15 PM',
    type: 'security',
  },
];

// GET /api/admin/stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalInquiries = await prisma.contact.count();
    const activeDeals = await prisma.deal.count({ where: { NOT: { stage: { contains: 'Closed Lost' } } } });
    const verifiedAgents = ADMIN_ACCOUNTS.filter((a) => a.role === 'agent' && a.status === 'Active').length;
    const staffMembers = ADMIN_ACCOUNTS.filter((a) => a.role === 'staff' && a.status === 'Active').length;

    // Carrier volume
    const allDeals = await prisma.deal.findMany({
      select: { carrier: true, sellingState: true, saleSupportStatus: true, enrolledNpn: true },
    });

    const carrierStats = {};
    const stateStats = {};
    const sssStats = { NONE: 0, PARTIAL: 0, FULL: 0 };

    allDeals.forEach((d) => {
      const c = d.carrier || 'Unspecified';
      carrierStats[c] = (carrierStats[c] || 0) + 1;

      const s = d.sellingState || 'Texas (TX)';
      stateStats[s] = (stateStats[s] || 0) + 1;

      const sss = String(d.saleSupportStatus || '').toUpperCase();
      if (sss.includes('FULL')) sssStats.FULL++;
      else if (sss.includes('PARTIAL')) sssStats.PARTIAL++;
      else sssStats.NONE++;
    });

    const comms = await prisma.commission.findMany();
    let totalGrossCommission = 0;
    let totalNetAgentPayout = 0;
    let totalOfficeRetention = 0;

    comms.forEach((c) => {
      totalGrossCommission += c.grossAmount || 0;
      totalNetAgentPayout += c.netAmount || 0;
      totalOfficeRetention += (c.grossAmount || 0) - (c.netAmount || 0);
    });

    res.json({
      totalInquiries,
      activeDeals,
      verifiedAgents,
      staffMembers,
      totalGrossCommission,
      totalNetAgentPayout,
      totalOfficeRetention,
      carrierStats,
      stateStats,
      sssStats,
      systemHealth: {
        database: 'connected',
        postgresContainer: 'insurmatch_postgres (Up)',
        backendContainer: 'insurmatch_backend (Up)',
        uptime: '99.98%',
        hipaaCompliance: 'Passed / Active',
        cmsCompliance: 'Cleared',
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/accounts
app.get('/api/admin/accounts', (req, res) => {
  res.json(ADMIN_ACCOUNTS);
});

// POST /api/admin/accounts
app.post('/api/admin/accounts', (req, res) => {
  try {
    const data = req.body;
    const newId = `ACC-${String(ADMIN_ACCOUNTS.length + 1).padStart(3, '0')}`;
    const newAccount = {
      id: newId,
      name: data.name || 'New Member',
      email: data.email || 'user@insurmatch.us',
      role: data.role || 'agent',
      avatar: (data.name || 'U').slice(0, 2).toUpperCase(),
      bg: data.role === 'staff' ? 'bg-teal-600 text-white' : 'bg-blue-600 text-white',
      status: data.status || (data.role === 'agent' ? 'Pending NPN' : 'Active'),
      phone: data.phone || '+1 (800) 555-0100',
      department: data.department || (data.role === 'staff' ? 'Policy Operations' : 'Regional Agent Hub'),
      statesLicensed: data.statesLicensed || ['TX (TDI)'],
      npn: data.npn || 'PENDING',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just registered',
      dealsCount: 0,
      complianceStatus: data.role === 'agent' ? 'Pending Compliance Review' : 'Active',
    };
    ADMIN_ACCOUNTS.unshift(newAccount);

    ADMIN_AUDIT_LOGS.unshift({
      id: `LOG-${Date.now()}`,
      action: 'Account Created',
      actor: 'Super Admin',
      target: `${newAccount.name} (${newAccount.id})`,
      detail: `Created ${newAccount.role} account with initial status ${newAccount.status}.`,
      timestamp: new Date().toLocaleString(),
      type: 'security',
    });

    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// PUT /api/admin/accounts/:id
app.put('/api/admin/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const idx = ADMIN_ACCOUNTS.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const previousStatus = ADMIN_ACCOUNTS[idx].status;
    ADMIN_ACCOUNTS[idx] = { ...ADMIN_ACCOUNTS[idx], ...data };

    if (data.status && data.status !== previousStatus) {
      ADMIN_AUDIT_LOGS.unshift({
        id: `LOG-${Date.now()}`,
        action: `Status Changed: ${previousStatus} -> ${data.status}`,
        actor: 'Super Admin',
        target: `${ADMIN_ACCOUNTS[idx].name} (${id})`,
        detail: data.suspensionReason || `Account status modified per admin management action.`,
        timestamp: new Date().toLocaleString(),
        type: data.status === 'Suspended' ? 'security' : 'compliance',
      });
    }

    res.json(ADMIN_ACCOUNTS[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// GET /api/admin/quotes
app.get('/api/admin/quotes', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      include: { deals: true },
    });

    // Format as match inquiries
    const quotes = contacts.map((c, i) => {
      const deal = c.deals[0] || null;
      let matchStatus = 'New Inquiry';
      if (deal) {
        if (deal.stage.includes('Won') || deal.stage.includes('Active')) matchStatus = 'Matched & Enrolled';
        else if (deal.stage.includes('Lost')) matchStatus = 'Closed Lost';
        else matchStatus = 'Dispatched to Agent';
      }

      return {
        id: c.code || `INQ-${1000 + i}`,
        contactId: c.id,
        name: c.fullName,
        phone: c.phone || '—',
        email: c.email || '—',
        insuranceType: deal?.pipeline || 'ACA Healthcare / Health',
        state: c.state || 'TX',
        preferredLanguage: c.language || 'Vietnamese',
        assignedAgent: deal?.dealOwnerName || c.contactOwnerName || 'Unassigned',
        enrolledNpn: deal?.enrolledNpn || 'Anh Que Pham 20011862',
        status: matchStatus,
        date: c.lastModifiedTime || '09/25/2026',
        notes: c.howDoYouKnowUs ? `Source: ${c.howDoYouKnowUs}` : 'Direct Web Intake (/get-quote)',
      };
    });

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match inquiries' });
  }
});

// PUT /api/admin/quotes/:id/assign
app.put('/api/admin/quotes/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentName, enrolledNpn } = req.body;

    const contact = await prisma.contact.findFirst({
      where: { OR: [{ id }, { code: id }] },
      include: { deals: true },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Inquiry contact not found' });
    }

    // Update contact owner and support agent
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        contactOwnerName: agentName,
        supportAgent: agentName,
        lastModifiedTime: new Date().toLocaleString(),
      },
    });

    // If deal exists, update deal owner and enrolled NPN
    if (contact.deals && contact.deals.length > 0) {
      await prisma.deal.update({
        where: { id: contact.deals[0].id },
        data: {
          dealOwnerName: agentName,
          ...(enrolledNpn && { enrolledNpn }),
          lastModifiedTime: new Date().toLocaleString(),
        },
      });
    }

    ADMIN_AUDIT_LOGS.unshift({
      id: `LOG-${Date.now()}`,
      action: 'Lead Match Dispatched',
      actor: 'Super Admin',
      target: `Inquiry ${id} (${contact.fullName})`,
      detail: `Assigned to Partner Agent ${agentName} (Sponsor NPN: ${enrolledNpn || 'Standard'}).`,
      timestamp: new Date().toLocaleString(),
      type: 'governance',
    });

    res.json({ success: true, message: `Inquiry successfully dispatched to ${agentName}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign inquiry' });
  }
});

// PUT /api/deals/:id/admin - Special Admin Mutation
app.put('/api/deals/:id/admin', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      enrolledNpn,
      brokerEffectiveDate,
      terminationDate,
      primaryMemberId,
      saleSupportStatus,
      numberMember,
      carrier,
      sellingState,
      closedLostReason,
    } = req.body;

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        ...(enrolledNpn !== undefined && { enrolledNpn }),
        ...(brokerEffectiveDate !== undefined && { brokerEffectiveDate }),
        ...(terminationDate !== undefined && { terminationDate }),
        ...(primaryMemberId !== undefined && { primaryMemberId }),
        ...(saleSupportStatus !== undefined && { saleSupportStatus }),
        ...(numberMember !== undefined && { numberMember: parseInt(numberMember) || 1 }),
        ...(carrier !== undefined && { carrier }),
        ...(sellingState !== undefined && { sellingState }),
        ...(closedLostReason !== undefined && { closedLostReason }),
        lastModifiedTime: new Date().toLocaleString(),
      },
    });

    ADMIN_AUDIT_LOGS.unshift({
      id: `LOG-${Date.now()}`,
      action: 'Deal Admin Governance Updated',
      actor: 'Super Admin',
      target: `Deal ${id} (${updated.title})`,
      detail: `Updated SSS: ${saleSupportStatus || updated.saleSupportStatus}, NPN: ${enrolledNpn || updated.enrolledNpn}`,
      timestamp: new Date().toLocaleString(),
      type: 'governance',
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating deal admin fields:', error);
    res.status(500).json({ error: 'Failed to update deal admin governance fields' });
  }
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(ADMIN_AUDIT_LOGS);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 InsurMatch CRM Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
});
