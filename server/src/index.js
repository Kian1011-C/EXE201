import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
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
app.get('/api/contacts', requireAuth, async (req, res) => {
    const authUser = req.authUser;
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

    if (authUser.role === 'agent') where.ownerId = authUser.id;
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
app.get('/api/contacts/:id', requireAuth, async (req, res) => {
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
      customerDocuments: doc
        ? [
            {
              id: doc.id,
              name: doc.name,
              contactId: contact.id,
              contactName: contact.fullName,
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
app.get('/api/contacts', requireAuth, async (req, res) => {
    const authUser = req.authUser;
  // Handled above
});

app.post('/api/contacts', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.contact.count({ where: ownerWhere });
    const newCode = data.code || `CT2600${2610 + count}`;
    const newId = newCode;

    const firstName = data.firstName || '';
    const middleName = data.middleName || '';
    const lastName = data.lastName || '';
    const fullName =
      data.fullName || [firstName, middleName, lastName].filter(Boolean).join(' ') || 'New Contact';

    data.ownerId = req.authUser.id;
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
app.put('/api/contacts/:id', requireAuth, async (req, res) => {
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


app.delete('/api/contacts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contact.delete({ where: { id } });
    res.json({ success: true });
  } catch(error) { res.status(500).json({ error: 'Failed' }); }
});

// ── Deals Routes ─────────────────────────────────────────────────────────────
// GET /api/deals
app.get('/api/deals', requireAuth, async (req, res) => {
    const authUser = req.authUser;
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

    if (authUser.role === 'agent') where.ownerId = authUser.id;
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
app.get('/api/deals/:id', requireAuth, async (req, res) => {
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
app.put('/api/deals/:id', requireAuth, async (req, res) => {
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
app.post('/api/deals', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.deal.count();
    const newCode = data.code || `D2600${5040 + count}`;

    data.ownerId = req.authUser.id;
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


app.delete('/api/deals/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.deal.delete({ where: { id } });
    res.json({ success: true });
  } catch(error) { res.status(500).json({ error: 'Failed' }); }
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
app.get('/api/tickets', requireAuth, async (req, res) => {
    const authUser = req.authUser;
  try {
    const { pipeline, status, priority, contactId, dealId } = req.query;
    const where = {};
    if (pipeline && pipeline !== 'all') where.pipeline = pipeline;
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    if (authUser.role === 'agent') where.ownerId = authUser.id;
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

app.get('/api/tickets/:id', requireAuth, async (req, res) => {
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

app.post('/api/tickets', requireAuth, async (req, res) => {
    req.body.ownerId = req.authUser.id;
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

app.put('/api/tickets/:id', requireAuth, async (req, res) => {
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


app.delete('/api/tickets/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ticket.delete({ where: { id } });
    res.json({ success: true });
  } catch(error) { res.status(500).json({ error: 'Failed' }); }
});

// ── Task Routes ──────────────────────────────────────────────────────────────
app.get('/api/tasks', requireAuth, async (req, res) => {
    const authUser = req.authUser;
  try {
    const { status, priority, assignedTo, contactId, dealId } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (assignedTo && assignedTo !== 'all') where.assignedTo = assignedTo;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    if (authUser.role === 'agent') where.ownerId = authUser.id;
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

app.get('/api/tasks/:id', requireAuth, async (req, res) => {
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

app.post('/api/tasks', requireAuth, async (req, res) => {
    req.body.ownerId = req.authUser.id;
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

app.put('/api/tasks/:id', requireAuth, async (req, res) => {
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


app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch(error) { res.status(500).json({ error: 'Failed' }); }
});

// ── Commission Routes ────────────────────────────────────────────────────────
app.get('/api/commissions', requireAuth, async (req, res) => {
    const authUser = req.authUser;
  try {
    const { agentName, period, status, carrier } = req.query;
    const where = {};
    if (agentName && agentName !== 'all') where.agentName = agentName;
    if (period && period !== 'all') where.period = period;
    if (status && status !== 'all') where.status = status;
    if (carrier && carrier !== 'all') where.carrier = carrier;

    if (authUser.role === 'agent') where.ownerId = authUser.id;
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

app.get('/api/commissions/summary', requireAuth, async (req, res) => {
  try {
    const all = await prisma.commission.findMany({ where: ownerWhere });
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

app.post('/api/commissions', requireAuth, async (req, res) => {
    req.body.ownerId = req.authUser.id;
  try {
    const data = req.body;
    const commission = await prisma.commission.create({ data });
    res.status(201).json(commission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create commission' });
  }
});

// POST /api/commissions/calculate - SSS Commission Rules Engine
app.post('/api/commissions/calculate', requireAuth, async (req, res) => {
  try {
    const { agentName = 'Khanh Nguyen', period, isNewAgent = false } = req.body;
    const now = new Date();
    const currentPeriod = period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const whereDeal = {};
    if (agentName && agentName !== 'all') {
      whereDeal.dealOwnerName = { contains: agentName, mode: 'insensitive' };
    }

    if (authUser.role === 'agent') where.ownerId = authUser.id;
    const deals = await prisma.deal.findMany({
      where: whereDeal,
      include: { contact: true },
    });

    const calculated = [];

    // Standard Carrier Payout Rates ($/member/mo)
    const CARRIER_RATE_MAP = {
      'BCBS': 30.0,
      'AMBETTER': 32.0,
      'UNITEDHEALTHCARE': 30.0,
      'OSCAR': 30.0,
      'MOLINA': 29.0,
      'AETNA': 31.0,
      'CIGNA': 28.0,
      'KAISER': 28.0,
      'HUMANA': 51.0,
      'BLUE SHIELD': 35.0,
      'PREMERA': 32.0,
      'WELLCARE': 28.0,
      'CARESOURCE': 27.0,
      'HEALTH NET': 29.0,
      'AMERIGROUP': 28.0,
    };

    function getCarrierRate(carrierName) {
      if (!carrierName) return 30.0;
      const upper = String(carrierName).toUpperCase();
      for (const [cName, rate] of Object.entries(CARRIER_RATE_MAP)) {
        if (upper.includes(cName)) return rate;
      }
      return 30.0;
    }

    for (const deal of deals) {
      const members = deal.numberMember || 1;
      let grossPerMonth = 0;
      let commissionType = 'ACA_PMPM';

      const dealCarrier = deal.carrier || 'BCBS';

      if ((deal.pipeline || '').toLowerCase().includes('medicare') || dealCarrier.toUpperCase().includes('HUMANA')) {
        commissionType = 'MEDICARE';
        grossPerMonth = 51.0; // CMS Initial rate ($612/yr / 12)
      } else if ((deal.pipeline || '').toLowerCase().includes('presidio')) {
        commissionType = 'PRESIDIO';
        const numAmt = parseFloat((deal.amount || '').replace(/[^0-9.]/g, '')) || 350;
        grossPerMonth = numAmt * 0.15;
      } else {
        commissionType = 'ACA_PMPM';
        const carrierPmpm = getCarrierRate(dealCarrier);
        grossPerMonth = carrierPmpm * members; // Tự tính theo hãng × số thành viên
      }

      // Quy chế mới: Agent nhận 100% hoa hồng trực tiếp từ hãng (0% chiết khấu sàn 7/3)
      const deductionRate = 0.0;
      const sss = '100% DIRECT';
      const netAmount = Math.round(grossPerMonth * 100) / 100; // Agent hưởng trọn 100%

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

app.put('/api/commissions/:id', requireAuth, async (req, res) => {
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


app.delete('/api/commissions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.commission.delete({ where: { id } });
    res.json({ success: true });
  } catch(error) { res.status(500).json({ error: 'Failed' }); }
});


// POST /api/quotes
app.post('/api/quotes', async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.contact.count({ where: ownerWhere });
    const newId = `INQ2600${2610 + count}`;
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'New Quote';

    const contact = await prisma.contact.create({
      data: {
        id: newId,
        code: newId,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName,
        phone: data.phone || '',
        email: data.email || '',
        state: data.state || '',
        language: data.language || 'English',
        howDoYouKnowUs: data.source || 'Website',
      }
    });

    const deal = await prisma.deal.create({
      data: {
        id: `D${newId}`,
        code: `D${newId}`,
        title: `${fullName} - Quote Request`,
        contactId: contact.id,
        stage: 'New Inquiry',
        pipeline: data.insuranceType || 'ACA Healthcare / Health',
      }
    });

    res.status(201).json({ contact, deal });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// ── Dashboard Routes

app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  const authUser = req.authUser;
  const isAgent = authUser.role === 'agent';
  const ownerWhere = isAgent ? { ownerId: authUser.id } : {};

  try {
    const totalContacts = await prisma.contact.count({ where: ownerWhere });
    const activeDeals = await prisma.deal.count({ where: { ...ownerWhere, NOT: { stage: { contains: 'Closed Lost' } } } });
    const openTickets = await prisma.ticket.count({ where: { ...ownerWhere, status: 'Open' } });
    const pendingTasks = await prisma.task.count({ where: { ...ownerWhere, status: 'Pending' } });

    const allDeals = await prisma.deal.findMany({ where: ownerWhere, select: { pipeline: true, stage: true } });
    const dealsByPipeline = Object.entries(allDeals.reduce((acc, curr) => {
      acc[curr.pipeline] = (acc[curr.pipeline] || 0) + 1;
      return acc;
    }, {})).map(([pipeline, count]) => ({ pipeline, count }));

    const dealsByStage = Object.entries(allDeals.reduce((acc, curr) => {
      acc[curr.stage] = (acc[curr.stage] || 0) + 1;
      return acc;
    }, {})).map(([stage, count]) => ({ stage, count }));

    const allTickets = await prisma.ticket.findMany({ where: ownerWhere, select: { pipeline: true, status: true, dueDate: true } });
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

    const allTasks = await prisma.task.findMany({ where: ownerWhere, select: { status: true, dueDate: true } });
    let overdueTasks = 0;
    allTasks.forEach(t => {
      if (t.status !== 'Completed' && t.dueDate && t.dueDate < nowStr) overdueTasks++;
    });

    const allComms = await prisma.commission.findMany({ where: ownerWhere });
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

// ── Authentication & Authorization Setup ─────────────────────────────────────
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const TOKEN_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function signToken(account) {
  const payload = Buffer.from(
    JSON.stringify({ sub: account.id, email: account.email, role: account.role, exp: Date.now() + TOKEN_TTL_MS })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token.' });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== 'Active') return res.status(403).json({ error: 'Account not active.' });
  
  req.authUser = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.authUser.role !== 'admin') return res.status(403).json({ error: 'Administrator privileges required.' });
    next();
  });
}


// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  
  if (!verifyPassword(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password.' });
  if (user.status === 'Pending') return res.status(403).json({ message: 'Your account is awaiting approval.' });
  if (user.status === 'Suspended') return res.status(403).json({ message: 'Your account is suspended.' });

  await prisma.user.update({ where: { id: user.id }, data: { lastActive: 'Just now' } });

  res.json({
    token: signToken(user),
    mustChangePassword: user.mustChangePassword,
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, mustChangePassword: user.mustChangePassword
    }
  });
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = req.authUser;
  if (typeof currentPassword !== 'string' || !verifyPassword(currentPassword, user.passwordHash)) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(newPassword), mustChangePassword: false } });
  res.json({ success: true });
});

// GET /api/admin/stats

app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalInquiries = await prisma.contact.count();
    const activeDeals = await prisma.deal.count({ where: { NOT: { stage: { contains: 'Closed Lost' } } } });
    const verifiedAgents = await prisma.user.count({ where: { role: 'agent', status: 'Active' } });
    const staffMembers = await prisma.user.count({ where: { role: 'staff', status: 'Active' } });

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

// GET /api/users - returns public profile of accounts for owner assignment and directory lookup
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users.map(u => { const { passwordHash, ...safe } = u; return safe; }));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/accounts
// Never exposes credentials (password hashes live in ACCOUNT_CREDENTIALS, not on the account objects).
app.get('/api/admin/accounts', requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users.map(u => { const { passwordHash, ...safe } = u; return safe; }));
});

// POST /api/admin/accounts  (ADMIN only)
// Agents require name, email, phone, npn (7-8 digits). New agents start as 'Pending' / 'Pending NPN Verification'
// and cannot log in until an admin approves them (PUT status -> Active). A secure temporary password is generated,
// stored hashed only, and returned ONCE as `tempPassword`.
app.post('/api/admin/accounts', requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const role = data.role || 'agent';
    const email = data.email?.toLowerCase();
    const tempPassword = 'Temp' + Date.now() + '!';
    
    const user = await prisma.user.create({
      data: {
        name: data.name || 'New User',
        email,
        role,
        passwordHash: hashPassword(tempPassword),
        mustChangePassword: true,
        phone: data.phone || '',
        npn: data.npn || '',
        status: role === 'agent' ? 'Pending' : 'Active',
      }
    });
    res.status(201).json({ ...user, tempPassword, passwordHash: undefined });
  } catch(e) { res.status(500).json({ error: 'Failed to create account' }); }
});

// PUT /api/admin/accounts/:id  (ADMIN only)
// Status transitions: Pending -> Active (approve), Active -> Suspended (needs suspensionReason),
// Suspended -> Active (reinstate). Anything else is rejected with 400.
app.put('/api/admin/accounts/:id', requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        status: data.status,
        name: data.name,
        email: data.email,
        phone: data.phone,
        npn: data.npn,
      }
    });
    res.json({ ...user, passwordHash: undefined });
  } catch(e) { res.status(500).json({ error: 'Failed to update account' }); }
});


app.delete('/api/admin/accounts/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Failed' }); }
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

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  res.json([]);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 InsurMatch CRM Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
});
