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

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 InsurMatch CRM Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
});
