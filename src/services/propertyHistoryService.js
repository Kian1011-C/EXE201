/**
 * Service to manage and persist property modification history (audit trail)
 * Matching UI specification from screenshot media_1790590629171.png
 */

const STORAGE_PREFIX = 'INSURMATCH_PROP_HISTORY_';

// Default actor matching screenshot
export const DEFAULT_ACTOR = 'Khanh Nguyen (khanhnguyen31@7)';
export const DEFAULT_CREATION_DATE = '09/24/2026, 11:54';

/**
 * Format date to MM/DD/YYYY, HH:mm
 */
export function formatHistoryTimestamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}`;
}

/**
 * Retrieve property history for a given entity (contact or deal)
 */
export function getPropertyHistory(entityType, entityId, entityData = {}) {
  if (!entityId) return [];

  const key = `${STORAGE_PREFIX}${entityType}_${entityId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading property history from localStorage:', err);
  }

  // If no history exists, generate initial audit trail matching screenshot media_1790590629171.png
  const initialHistory = generateDefaultHistory(entityType, entityId, entityData);
  try {
    localStorage.setItem(key, JSON.stringify(initialHistory));
  } catch (e) {
    // ignore
  }
  return initialHistory;
}

/**
 * Generate default realistic history entries for an entity
 */
function generateDefaultHistory(entityType, entityId, entityData = {}) {
  const history = [];
  let idCounter = 1;

  const actor = entityData.leadOwner || entityData.owner || DEFAULT_ACTOR;
  const createdAt = DEFAULT_CREATION_DATE;

  // Enrolled Address (matches screenshot media_1790590629171.png row 1)
  const enrolledAddressVal =
    entityData.contactFields?.enrolledAddress ||
    entityData.enrolledAddress ||
    entityData.address ||
    '3941 N Pine Grove Ave Chicago, IL 60613';

  history.push({
    id: `hist-${idCounter++}`,
    fieldName: 'Enrolled Address',
    oldValue: '',
    newValue: enrolledAddressVal,
    sourceActor: actor,
    madeOn: createdAt,
    action: 'Create',
  });

  if (entityType === 'contact') {
    // Phone
    const phoneVal = entityData.phone || entityData.contactFields?.phone || '+1 804-555-0192';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Phone',
      oldValue: '',
      newValue: phoneVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Contact Owner
    const ownerVal = entityData.contactOwner || entityData.owner || 'The Best Rate Insurance';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Contact Owner',
      oldValue: '',
      newValue: typeof ownerVal === 'string' ? ownerVal : ownerVal.name || 'The Best Rate Insurance',
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Lead Owner
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Lead Owner',
      oldValue: '',
      newValue: 'Trono Truong',
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // State
    const stateVal = entityData.contactFields?.state || entityData.state || 'IL';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'State',
      oldValue: '',
      newValue: stateVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // City
    const cityVal = entityData.contactFields?.city || entityData.city || 'Chicago';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'City',
      oldValue: '',
      newValue: cityVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Postal Code
    const zipVal = entityData.contactFields?.postalCode || entityData.zipCode || '60613';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Postal Code',
      oldValue: '',
      newValue: zipVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // ACA Account Status
    const acaStatus = entityData.acaAccountStatus || entityData.acaAccount?.acaAccountStatus || 'Need Create ACA Account';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'ACA Account Status',
      oldValue: '',
      newValue: acaStatus,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Date Of Birth
    const dobVal = entityData.dateOfBirth || entityData.primary?.dob || '04/15/1988';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Date Of Birth',
      oldValue: '',
      newValue: dobVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });
  } else {
    // Deal specific defaults
    // Broker Effective Date (as in screenshot media_1790590606226.png)
    const brokerEffVal = entityData.brokerEffectiveDate || entityData.adminOnly?.brokerEffectiveDate || '2026-01-01';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Broker Effective Date',
      oldValue: '',
      newValue: brokerEffVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Enrolled NPN
    const npnVal = entityData.enrolledNpn || entityData.adminOnly?.enrolledNpn || 'Anh Que Pham 20011862';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Enrolled NPN',
      oldValue: '',
      newValue: npnVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Deal Owner
    const dealOwnerVal = entityData.dealOwner || entityData.adminOnly?.dealOwner || 'Khanh Nguyen (khanhnguyen31@7)';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Deal Owner',
      oldValue: '',
      newValue: dealOwnerVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Carrier
    const carrierVal = entityData.carrier || 'BCBS';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Carrier',
      oldValue: '',
      newValue: carrierVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Plan Name
    const planVal = entityData.planName || 'Blue Advantage Bronze';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Plan Name',
      oldValue: '',
      newValue: planVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Application ID
    const appId = entityData.applicationId || '8282407051';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Application ID',
      oldValue: '',
      newValue: appId,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });

    // Estimate Household Income
    const incomeVal = entityData.estimateIncome || '$17k';
    history.push({
      id: `hist-${idCounter++}`,
      fieldName: 'Estimate Household Income',
      oldValue: '',
      newValue: incomeVal,
      sourceActor: actor,
      madeOn: createdAt,
      action: 'Create',
    });
  }

  return history;
}

/**
 * Record a field update into history
 */
export function recordPropertyUpdate(
  entityType,
  entityId,
  fieldName,
  oldValue,
  newValue,
  actor = DEFAULT_ACTOR
) {
  if (!entityId || !fieldName) return;
  if (String(oldValue || '').trim() === String(newValue || '').trim()) return;

  const key = `${STORAGE_PREFIX}${entityType}_${entityId}`;
  const existing = getPropertyHistory(entityType, entityId);

  const isDelete = !newValue && !!oldValue;
  const action = isDelete ? 'Delete' : 'Update';

  const newRecord = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fieldName,
    oldValue: String(oldValue || ''),
    newValue: String(newValue || ''),
    sourceActor: actor || DEFAULT_ACTOR,
    madeOn: formatHistoryTimestamp(new Date()),
    action,
  };

  const updatedHistory = [newRecord, ...existing];
  try {
    localStorage.setItem(key, JSON.stringify(updatedHistory));
  } catch (err) {
    console.error('Error saving property history update:', err);
  }
  return newRecord;
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
