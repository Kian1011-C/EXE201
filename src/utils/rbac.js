// ============================================================
// rbac.js — Role-Based Access Control & Ownership Scoping
// Enforces rules:
// 1. Agent chỉ được xem Contact, Deal, Ticket, CustomerDocument, Task mà mình là Owner / Assignee.
// 2. Chỉ có Admin mới được xem thông tin gói mua SaaS (Starter $39, Pro $79, Agency $199) và bảng kê doanh thu.
// ============================================================

/**
 * Normalizes text for lenient name & handle matching (removes accents, lowercase, removes symbols)
 */
export function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extracts string representation from various owner object / string formats
 */
export function extractOwnerString(ownerField) {
  if (!ownerField) return '';
  if (typeof ownerField === 'string') return ownerField;
  if (typeof ownerField === 'object') {
    return (
      ownerField.name ||
      ownerField.fullName ||
      ownerField.handle ||
      ownerField.username ||
      ownerField.email ||
      `${ownerField.firstName || ''} ${ownerField.lastName || ''}`.trim() ||
      ''
    );
  }
  return String(ownerField);
}

/**
 * Resolves the active agent identity from current user session
 */
export function getAgentIdentity(user) {
  if (!user) return { name: 'Khanh Nguyen', email: 'agent@insurmatch.us' };
  
  // Default fallback for generic agent demo account
  let name = user.name || 'Khanh Nguyen';
  if (name === 'Licensed Agent Partner' || name.toLowerCase() === 'agent') {
    name = 'Khanh Nguyen';
  }

  return {
    name,
    email: user.email || '',
    id: user.id || '',
    role: user.role || 'agent',
  };
}

/**
 * Checks whether an entity's owner field matches the agent's identity
 */
export function isOwnerMatch(ownerField, user) {
  if (!ownerField) return false;
  
  // If user is admin or staff, always has access
  if (user && (user.role === 'admin' || user.role === 'staff')) {
    return true;
  }

  const agent = getAgentIdentity(user);
  const normAgentName = normalizeText(agent.name);
  const normAgentEmail = normalizeText(agent.email);
  const normOwner = normalizeText(extractOwnerString(ownerField));

  if (!normOwner) return false;

  // Direct containment checks
  if (normAgentName && (normOwner.includes(normAgentName) || normAgentName.includes(normOwner))) {
    return true;
  }
  if (normAgentEmail && normOwner.includes(normAgentEmail)) {
    return true;
  }

  // Handle word-token overlap (e.g., "Khanh Nguyen (khanhnguyen31@7)" vs "Khanh Nguyen")
  const agentTokens = normAgentName.split(/\s+/).filter(Boolean);
  if (agentTokens.length >= 2) {
    const allTokensPresent = agentTokens.every((token) => normOwner.includes(token));
    if (allTokensPresent) return true;
  }

  return false;
}

/**
 * Contact filtering for Agent
 */
export function filterContactsForAgent(contactsList, user) {
  if (!Array.isArray(contactsList)) return [];
  if (!user || user.role !== 'agent') return contactsList;

  return contactsList.filter((c) => {
    return (
      isOwnerMatch(c.contactOwner, user) ||
      isOwnerMatch(c.sourceOfLead?.contactOwner, user) ||
      isOwnerMatch(c.obShareOwner, user) ||
      isOwnerMatch(c.medicareShareOwner, user) ||
      isOwnerMatch(c.lifeShareOwner, user) ||
      isOwnerMatch(c.agentName, user)
    );
  });
}

/**
 * Deal filtering for Agent
 */
export function filterDealsForAgent(dealsList, user) {
  if (!Array.isArray(dealsList)) return [];
  if (!user || user.role !== 'agent') return dealsList;

  return dealsList.filter((d) => {
    return (
      isOwnerMatch(d.dealOwner, user) ||
      isOwnerMatch(d.leadOwner, user) ||
      isOwnerMatch(d.supportAgent, user) ||
      isOwnerMatch(d.agentName, user) ||
      isOwnerMatch(d.adminOnly?.dealOwner, user)
    );
  });
}

/**
 * Ticket filtering for Agent
 */
export function filterTicketsForAgent(ticketsList, user) {
  if (!Array.isArray(ticketsList)) return [];
  if (!user || user.role !== 'agent') return ticketsList;

  return ticketsList.filter((t) => {
    return (
      isOwnerMatch(t.ticketOwner, user) ||
      isOwnerMatch(t.owner, user) ||
      isOwnerMatch(t.serviceAgent, user) ||
      isOwnerMatch(t.agentName, user)
    );
  });
}

/**
 * Task filtering for Agent
 */
export function filterTasksForAgent(tasksList, user) {
  if (!Array.isArray(tasksList)) return [];
  if (!user || user.role !== 'agent') return tasksList;

  return tasksList.filter((t) => {
    return (
      isOwnerMatch(t.assignee, user) ||
      isOwnerMatch(t.assignedTo, user) ||
      isOwnerMatch(t.owner, user)
    );
  });
}

/**
 * Can an agent view a specific single record?
 */
export function canAgentAccessItem(item, user, entityType = 'contact') {
  if (!item) return false;
  if (!user || user.role !== 'agent') return true; // Admin and Staff can view

  if (entityType === 'contact') {
    return (
      isOwnerMatch(item.contactOwner, user) ||
      isOwnerMatch(item.sourceOfLead?.contactOwner, user) ||
      isOwnerMatch(item.obShareOwner, user) ||
      isOwnerMatch(item.medicareShareOwner, user) ||
      isOwnerMatch(item.lifeShareOwner, user) ||
      isOwnerMatch(item.agentName, user)
    );
  }

  if (entityType === 'deal') {
    return (
      isOwnerMatch(item.dealOwner, user) ||
      isOwnerMatch(item.leadOwner, user) ||
      isOwnerMatch(item.supportAgent, user) ||
      isOwnerMatch(item.agentName, user) ||
      isOwnerMatch(item.adminOnly?.dealOwner, user)
    );
  }

  if (entityType === 'ticket') {
    return (
      isOwnerMatch(item.ticketOwner, user) ||
      isOwnerMatch(item.owner, user) ||
      isOwnerMatch(item.serviceAgent, user) ||
      isOwnerMatch(item.agentName, user)
    );
  }

  if (entityType === 'task') {
    return (
      isOwnerMatch(item.assignee, user) ||
      isOwnerMatch(item.assignedTo, user) ||
      isOwnerMatch(item.owner, user)
    );
  }

  if (entityType === 'document') {
    return (
      isOwnerMatch(item.contactOwner, user) ||
      isOwnerMatch(item.owner, user) ||
      isOwnerMatch(item.uploadedBy, user)
    );
  }

  return false;
}

/**
 * Package Purchase Visibility Rule:
 * "Và gói ai mua như nào chỉ có admin thấy"
 * Only Admin returns true. Staff and Agent return false.
 */
export function canViewSaaSPackages(user) {
  if (!user) return false;
  return user.role === 'admin';
}
