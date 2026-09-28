/**
 * Service to manage and persist property modification history (audit trail)
 * Supports dynamic actor identification (whichever account is logged in or performed the change),
 * accurate timestamping, real old/new value tracking, and persistent storage.
 */

const STORAGE_PREFIX = 'INSURMATCH_PROP_HISTORY_';

/**
 * Format helper for contact / deal person name
 */
export function getPersonName(val, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return (
      val.name ||
      [val.firstName, val.lastName].filter(Boolean).join(' ') ||
      val.fullName ||
      val.email ||
      fallback
    );
  }
  return String(val);
}

/**
 * Resolves current logged-in user or active actor dynamically.
 * Priority:
 * 1. passedUser (if already a custom actor string or user object)
 * 2. localStorage 'tbri_user' session
 * 3. Fallback to active staff
 */
export function getCurrentActor(passedUser = null) {
  // If explicitly passed a string
  if (typeof passedUser === 'string' && passedUser.trim()) {
    // If it's not the old legacy hardcoded dummy string, use it
    if (passedUser !== 'Khanh Nguyen (khanhnguyen31@7)') {
      return passedUser.trim();
    }
  }

  // If passed a user object
  if (passedUser && typeof passedUser === 'object') {
    const name = passedUser.name || passedUser.fullName || passedUser.username;
    if (name) {
      const detail = passedUser.email || passedUser.role || (passedUser.npn ? `NPN: ${passedUser.npn}` : '');
      return detail ? `${name} (${detail})` : name;
    }
    if (passedUser.email) return passedUser.email;
  }

  // Check localStorage session user ('tbri_user')
  try {
    const raw = localStorage.getItem('tbri_user');
    if (raw) {
      const u = JSON.parse(raw);
      const name = u.name || u.fullName || u.username;
      if (name) {
        const detail = u.email || u.role || (u.npn ? `NPN: ${u.npn}` : '');
        return detail ? `${name} (${detail})` : name;
      }
      if (u.email) return u.email;
    }
  } catch (e) {
    // ignore
  }

  return 'Platform Staff (staff@insurmatch.us)';
}

/**
 * Format date to MM/DD/YYYY, HH:mm
 */
export function formatHistoryTimestamp(date = new Date()) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}`;
}

/**
 * Retrieve property history for a given entity (contact or deal).
 * Automatically cleans up old legacy mock templates and generates real history.
 */
export function getPropertyHistory(entityType, entityId, entityData = {}, currentActor = null) {
  if (!entityId) return [];

  const key = `${STORAGE_PREFIX}${entityType}_${entityId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Detect and discard stale legacy hardcoded mock entries
        const isLegacyMock =
          parsed.length === 9 &&
          parsed.every(
            (p) =>
              p.sourceActor === 'Khanh Nguyen (khanhnguyen31@7)' &&
              p.madeOn === '09/24/2026, 11:54'
          );
        if (!isLegacyMock) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error loading property history from localStorage:', err);
  }

  // If no history exists or it was the legacy mock template, generate real initial audit trail
  const initialHistory = generateDefaultHistory(entityType, entityId, entityData, currentActor);
  try {
    localStorage.setItem(key, JSON.stringify(initialHistory));
  } catch (e) {
    // ignore
  }
  return initialHistory;
}

/**
 * Generate real initial history entries for an entity using actual entity fields and actual creator
 */
export function generateDefaultHistory(entityType, entityId, entityData = {}, currentActor = null) {
  const history = [];
  let idCounter = 1;

  const activeActor = getCurrentActor(currentActor);
  const creatorActor =
    (entityData.creator ? getCurrentActor(entityData.creator) : null) ||
    (entityData.createdBy ? getCurrentActor(entityData.createdBy) : null) ||
    (entityData.contactOwner ? getPersonName(entityData.contactOwner) : null) ||
    (entityData.dealOwner ? getPersonName(entityData.dealOwner) : null) ||
    (entityData.leadOwner ? getPersonName(entityData.leadOwner) : null) ||
    activeActor;

  const rawCreated =
    entityData.createdAt ||
    entityData.createdDate ||
    entityData.created_at ||
    entityData.creationDate;
  const createdAt = rawCreated
    ? formatHistoryTimestamp(rawCreated)
    : formatHistoryTimestamp(new Date());

  if (entityType === 'contact') {
    const cf = entityData.contactFields || {};
    const primary = entityData.primary || {};
    const aca = entityData.acaAccount || {};

    const contactCandidates = [
      { name: 'Enrolled Address', val: cf.enrolledAddress || entityData.enrolledAddress || entityData.address },
      { name: 'Phone', val: entityData.phone || cf.phone },
      { name: 'Email', val: entityData.email || cf.email },
      { name: 'Contact Owner', val: entityData.contactOwner ? getPersonName(entityData.contactOwner) : '' },
      { name: 'Lead Owner', val: entityData.leadOwner ? getPersonName(entityData.leadOwner) : '' },
      { name: 'First Name', val: entityData.firstName || primary.firstName },
      { name: 'Last Name', val: entityData.lastName || primary.lastName },
      { name: 'Date Of Birth', val: entityData.dateOfBirth || primary.dob },
      { name: 'SSN', val: entityData.ssn || primary.ssn },
      { name: 'City', val: cf.city || entityData.city },
      { name: 'State', val: cf.state || entityData.state },
      { name: 'Postal Code', val: cf.postalCode || entityData.zipCode },
      { name: 'County', val: cf.county || entityData.county },
      { name: 'Mailing Address', val: cf.mailingAddress },
      { name: 'Language', val: entityData.language },
      { name: 'ACA Account Status', val: entityData.acaAccountStatus || aca.acaAccountStatus || aca.status },
      { name: 'Aca Account', val: aca.acaAccount },
      { name: 'How do you know us', val: entityData.howDoYouKnowUs },
      { name: 'Who refer client', val: entityData.whoReferClient },
    ];

    contactCandidates.forEach(({ name, val }) => {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        history.push({
          id: `hist-${idCounter++}`,
          fieldName: name,
          oldValue: '',
          newValue: String(val).trim(),
          sourceActor: creatorActor,
          madeOn: createdAt,
          action: 'Create',
        });
      }
    });

    if (history.length === 0) {
      history.push({
        id: `hist-${idCounter++}`,
        fieldName: 'Contact Record',
        oldValue: '',
        newValue: entityData.fullName || entityData.code || entityId || 'Created',
        sourceActor: creatorActor,
        madeOn: createdAt,
        action: 'Create',
      });
    }
  } else {
    // Deal specific fields
    const adminOnly = entityData.adminOnly || {};
    const dealCandidates = [
      { name: 'Deal Title', val: entityData.title },
      { name: 'Pipeline', val: entityData.pipeline },
      { name: 'Stage', val: entityData.stage },
      { name: 'Deal Owner', val: entityData.dealOwner ? getPersonName(entityData.dealOwner) : '' },
      { name: 'Lead Owner', val: entityData.leadOwner ? getPersonName(entityData.leadOwner) : '' },
      { name: 'Carrier', val: entityData.carrier || adminOnly.carrier },
      { name: 'Plan Name', val: entityData.planName },
      { name: 'Amount', val: entityData.amount || entityData.enrollAmount },
      { name: 'Monthly Premium', val: entityData.monthlyPremium },
      { name: 'Subsidy Amount (APTC)', val: entityData.subsidyAmount },
      { name: 'Agency Commission', val: entityData.agencyCommission },
      { name: 'Bonus Tier', val: entityData.bonusTier },
      { name: 'Payment Option', val: entityData.paymentOption },
      { name: 'Payment Verification', val: entityData.paymentVerification },
      { name: 'Enrolled NPN', val: entityData.enrolledNpn || adminOnly.enrolledNpn },
      { name: 'Broker Effective Date', val: entityData.brokerEffectiveDate || adminOnly.brokerEffectiveDate },
      { name: 'Termination Date', val: entityData.terminationDate || adminOnly.terminationDate },
      { name: 'Application ID', val: entityData.applicationId },
      { name: 'Estimate Household Income', val: entityData.estimateHouseholdIncome || entityData.estimateIncome },
      { name: 'Household Member', val: entityData.householdMember },
      { name: 'Number Member', val: entityData.numberMember },
      { name: 'Enrolled Address', val: entityData.enrolledAddress },
      { name: 'Quoted county', val: entityData.quotedCounty },
      { name: 'Selling State', val: entityData.sellingState || adminOnly.sellingState },
      { name: 'Sale Support Status', val: entityData.saleSupportStatus || adminOnly.saleSupportStatus },
      { name: 'Need Upload', val: entityData.needUpload },
      { name: 'Primary Member Id', val: entityData.primaryMemberId || adminOnly.primaryMemberId },
    ];

    dealCandidates.forEach(({ name, val }) => {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        history.push({
          id: `hist-${idCounter++}`,
          fieldName: name,
          oldValue: '',
          newValue: String(val).trim(),
          sourceActor: creatorActor,
          madeOn: createdAt,
          action: 'Create',
        });
      }
    });

    if (history.length === 0) {
      history.push({
        id: `hist-${idCounter++}`,
        fieldName: 'Deal Record',
        oldValue: '',
        newValue: entityData.title || entityId || 'Created',
        sourceActor: creatorActor,
        madeOn: createdAt,
        action: 'Create',
      });
    }
  }

  return history;
}

/**
 * Record a single field update into history
 */
export function recordPropertyUpdate(
  entityType,
  entityId,
  fieldName,
  oldValue,
  newValue,
  actor = null
) {
  if (!entityId || !fieldName) return;
  const strOld = String(oldValue ?? '').trim();
  const strNew = String(newValue ?? '').trim();
  if (strOld === strNew) return;

  const key = `${STORAGE_PREFIX}${entityType}_${entityId}`;
  const existing = getPropertyHistory(entityType, entityId);

  const isDelete = !strNew && !!strOld;
  const isCreate = !!strNew && !strOld;
  const action = isDelete ? 'Delete' : isCreate ? 'Create' : 'Update';

  const realActor = getCurrentActor(actor);

  const newRecord = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fieldName,
    oldValue: strOld,
    newValue: strNew,
    sourceActor: realActor,
    madeOn: formatHistoryTimestamp(new Date()),
    action,
  };

  const updatedHistory = [newRecord, ...existing];
  try {
    localStorage.setItem(key, JSON.stringify(updatedHistory));
    window.dispatchEvent(
      new CustomEvent('insurmatch:history_updated', {
        detail: { entityType, entityId, record: newRecord },
      })
    );
  } catch (err) {
    console.error('Error saving property history update:', err);
  }
  return newRecord;
}

/**
 * Record multiple property updates in batch (e.g. on full form save)
 */
export function recordPropertyUpdatesBatch(
  entityType,
  entityId,
  updates = [], // array of { fieldName, oldValue, newValue }
  actor = null
) {
  if (!entityId || !Array.isArray(updates) || updates.length === 0) return [];

  const realActor = getCurrentActor(actor);
  const nowStr = formatHistoryTimestamp(new Date());
  const validRecords = [];

  for (const item of updates) {
    if (!item || !item.fieldName) continue;
    const strOld = String(item.oldValue ?? '').trim();
    const strNew = String(item.newValue ?? '').trim();
    if (strOld === strNew) continue;

    const isDelete = !strNew && !!strOld;
    const isCreate = !!strNew && !strOld;
    const action = isDelete ? 'Delete' : isCreate ? 'Create' : 'Update';

    validRecords.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      fieldName: item.fieldName,
      oldValue: strOld,
      newValue: strNew,
      sourceActor: realActor,
      madeOn: nowStr,
      action,
    });
  }

  if (validRecords.length === 0) return [];

  const key = `${STORAGE_PREFIX}${entityType}_${entityId}`;
  const existing = getPropertyHistory(entityType, entityId);
  const updatedHistory = [...validRecords, ...existing];

  try {
    localStorage.setItem(key, JSON.stringify(updatedHistory));
    window.dispatchEvent(
      new CustomEvent('insurmatch:history_updated', {
        detail: { entityType, entityId, records: validRecords },
      })
    );
  } catch (err) {
    console.error('Error saving batch property history update:', err);
  }

  return validRecords;
}

/**
 * Clear history for an entity
 */
export function clearEntityHistory(entityType, entityId) {
  if (!entityId) return;
  const key = `${STORAGE_PREFIX}${entityType}_${entityId}`;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
}

/**
 * Export history records to CSV
 */
export function exportPropertyHistoryCSV(historyRecords = [], entityName = 'Record') {
  if (!historyRecords || historyRecords.length === 0) return;

  const headers = ['No.', 'Field name', 'Old value', 'New value', 'Source actor', 'Made on', 'Action'];
  const rows = historyRecords.map((item, idx) => [
    idx + 1,
    `"${(item.fieldName || '').replace(/"/g, '""')}"`,
    `"${(item.oldValue || '').replace(/"/g, '""')}"`,
    `"${(item.newValue || '').replace(/"/g, '""')}"`,
    `"${(item.sourceActor || '').replace(/"/g, '""')}"`,
    `"${(item.madeOn || '').replace(/"/g, '""')}"`,
    `"${(item.action || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Property_History_${(entityName || 'Entity').replace(/\s+/g, '_')}_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
