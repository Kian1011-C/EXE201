import React, { useState, useMemo } from 'react';
import { updateAdminAccount, createAdminAccount } from '../../../services/api';
import { VALID_ACCOUNT_ROLES, isValidEmail, isValidNpn } from '../../../data/mockAdminAccounts';

const DEFAULT_DEPARTMENT_BY_ROLE = {
  agent: 'Regional Agent Network',
  staff: 'Intake & Policy Support',
  admin: 'System Administration',
};

const EMPTY_ACCOUNT_FORM = {
  name: '',
  email: '',
  role: 'agent',
  phone: '',
  npn: '',
  statesLicensed: 'TX (TDI), CA (CDI)',
  department: DEFAULT_DEPARTMENT_BY_ROLE.agent,
};

// Normalised status: falls back to the legacy `active` flag when `status` is missing
function getStatus(account) {
  return account?.status || (account?.active !== false ? 'Active' : 'Suspended');
}

// Covers both 'Pending' (new agents) and 'Pending NPN' (seed data)
function isPendingStatus(account) {
  return getStatus(account).includes('Pending');
}

export default function AdminAccountsTab({
  accounts = [],
  onRefresh,
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'inspect' | 'suspend' | 'create' | 'credentials'
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form for creating new account
  const [newAccountForm, setNewAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  // Temporary credentials shown once after a successful create (kept in memory only)
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const [localAccounts, setLocalAccounts] = useState(accounts);

  React.useEffect(() => {
    if (accounts && accounts.length > 0) setLocalAccounts(accounts);
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return localAccounts.filter((a) => {
      const aName = a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || '';
      const aEmail = a.email || '';
      const aNpn = a.npn || '';
      const aId = String(a.id || '');
      const aStatus = a.status || (a.active !== false ? 'Active' : 'Suspended');
      const aRole = (a.role || '').toLowerCase();

      const matchSearch =
        !search ||
        aName.toLowerCase().includes(search.toLowerCase()) ||
        aEmail.toLowerCase().includes(search.toLowerCase()) ||
        aNpn.toLowerCase().includes(search.toLowerCase()) ||
        aId.toLowerCase().includes(search.toLowerCase());

      const matchRole =
        roleFilter === 'all' ||
        aRole === roleFilter.toLowerCase() ||
        (roleFilter === 'staff' && (aRole === 'support' || aRole === 'telesales')) ||
        (roleFilter === 'admin' && aRole === 'manager');

      const matchStatus =
        statusFilter === 'all' ||
        aStatus.toLowerCase().includes(statusFilter.toLowerCase());

      return matchSearch && matchRole && matchStatus;
    });
  }, [localAccounts, search, roleFilter, statusFilter]);

  function handleOpenInspect(account) {
    setSelectedAccount(account);
    setModalMode('inspect');
  }

  function handleOpenSuspend(account) {
    setSelectedAccount(account);
    setSuspensionReason(account.suspensionReason || 'Routine license compliance audit per SOP 23/27');
    setModalMode('suspend');
  }

  async function handleApproveAgent(account) {
    if (!isPendingStatus(account)) return; // only Pending accounts can be approved
    if (!window.confirm(`Approve accreditation and activate agent ${account.name}?`)) return;
    setIsProcessing(true);
    try {
      await updateAdminAccount(account.id, {
        status: 'Active',
        complianceStatus: 'Verified & Cleared',
      });

      setLocalAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id
            ? { ...a, status: 'Active', complianceStatus: 'Verified & Cleared' }
            : a
        )
      );

      setToastMessage(`Accredited and activated ${account.name}!`);
      setTimeout(() => setToastMessage(''), 4000);
      setModalMode(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmSuspend(e) {
    e.preventDefault();
    if (!selectedAccount) return;
    // Only Active agents can be suspended (Pending agents must be approved or left pending)
    if (getStatus(selectedAccount) !== 'Active') {
      alert('Only Active accounts can be suspended.');
      return;
    }
    const reason = suspensionReason.trim();
    if (!reason) {
      alert('A suspension reason is required.');
      return;
    }
    setIsProcessing(true);
    try {
      await updateAdminAccount(selectedAccount.id, {
        status: 'Suspended',
        complianceStatus: `Suspended: ${reason}`,
        suspensionReason: reason,
      });

      setLocalAccounts((prev) =>
        prev.map((a) =>
          a.id === selectedAccount.id
            ? { ...a, status: 'Suspended', complianceStatus: `Suspended: ${reason}`, suspensionReason: reason }
            : a
        )
      );

      setToastMessage(`Suspended account ${selectedAccount.name} per SOP 23.`);
      setTimeout(() => setToastMessage(''), 4000);
      setModalMode(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Suspension failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReinstateAgent(account) {
    if (getStatus(account) !== 'Suspended') return; // only Suspended accounts can be reinstated
    if (!window.confirm(`Reinstate full partner permissions for ${account.name}?`)) return;
    setIsProcessing(true);
    try {
      await updateAdminAccount(account.id, {
        status: 'Active',
        complianceStatus: 'Verified & Cleared',
        suspensionReason: '',
      });

      setLocalAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id
            ? { ...a, status: 'Active', complianceStatus: 'Verified & Cleared', suspensionReason: '' }
            : a
        )
      );

      setToastMessage(`Reinstated account ${account.name}!`);
      setTimeout(() => setToastMessage(''), 4000);
      setModalMode(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Reinstate failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  function setFormField(key, value) {
    setNewAccountForm((prev) => {
      const next = { ...prev, [key]: value };
      // Swap the department default when switching role, but keep any custom input
      if (key === 'role' && Object.values(DEFAULT_DEPARTMENT_BY_ROLE).includes(prev.department)) {
        next.department = DEFAULT_DEPARTMENT_BY_ROLE[value] || prev.department;
      }
      return next;
    });
    setFieldErrors((prev) => (prev[key] || (key === 'role' && (prev.npn || prev.phone)) ? { ...prev, [key]: undefined, ...(key === 'role' ? { npn: undefined, phone: undefined } : {}) } : prev));
    setFormError('');
  }

  const isAgentForm = newAccountForm.role === 'agent';

  function fieldBorder(key) {
    return fieldErrors[key] ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500';
  }

  function validateCreateForm(form) {
    const errors = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const npn = form.npn.trim();

    if (!VALID_ACCOUNT_ROLES.includes(form.role)) errors.role = 'Role must be agent, staff or admin.';
    if (!name) errors.name = 'Full name is required.';

    if (!email) errors.email = 'Email address is required.';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address (e.g. name@domain.com).';
    else if (localAccounts.some((a) => String(a.email || '').trim().toLowerCase() === email.toLowerCase())) {
      errors.email = 'An account with this email already exists.';
    }

    if (form.role === 'agent') {
      if (!phone) errors.phone = 'Phone number is required for agents.';
      if (!npn) errors.npn = 'NPN is required for agents.';
      else if (!isValidNpn(npn)) errors.npn = 'NPN must be 7-8 digits (numbers only).';
      else if (localAccounts.some((a) => String(a.npn || '').trim() === npn)) {
        errors.npn = 'This NPN is already registered to another account.';
      }
    }
    return errors;
  }

  function resetCreateForm() {
    setNewAccountForm(EMPTY_ACCOUNT_FORM);
    setFieldErrors({});
    setFormError('');
  }

  function handleOpenCreate() {
    resetCreateForm();
    setModalMode('create');
  }

  function handleCloseCreate() {
    setModalMode(null);
    resetCreateForm();
  }

  function handleCloseCredentials() {
    // Drop the temp password from memory as soon as the panel is dismissed
    setCreatedCredentials(null);
    setPasswordCopied(false);
    setModalMode(null);
  }

  async function handleCopyPassword() {
    if (!createdCredentials?.tempPassword) return;
    try {
      await navigator.clipboard.writeText(createdCredentials.tempPassword);
    } catch {
      // Fallback for non-secure contexts / older browsers
      const ta = document.createElement('textarea');
      ta.value = createdCredentials.tempPassword;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (isProcessing) return;

    const errors = validateCreateForm(newAccountForm);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('Please fix the highlighted fields before provisioning the account.');
      return;
    }
    setFormError('');

    setIsProcessing(true);
    try {
      const statesArr = newAccountForm.statesLicensed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Status / complianceStatus are decided by the backend (agents start Pending,
      // staff/admin start Active) — the form only sends identity data.
      const payload = {
        name: newAccountForm.name.trim(),
        email: newAccountForm.email.trim(),
        role: newAccountForm.role,
        phone: newAccountForm.phone.trim(),
        statesLicensed: statesArr,
        department: newAccountForm.department.trim(),
      };
      if (newAccountForm.role === 'agent') payload.npn = newAccountForm.npn.trim();

      const { tempPassword, offline, ...created } = await createAdminAccount(payload);

      // Đặt lại bộ lọc để tài khoản mới luôn hiển thị ngay lập tức
      setRoleFilter('all');
      setStatusFilter('all');
      setSearch('');

      setLocalAccounts((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);

      // Temp password lives only in component state (never localStorage)
      setCreatedCredentials({
        name: created.name,
        email: created.email,
        role: created.role,
        status: getStatus(created),
        avatar: created.avatar,
        bg: created.bg,
        tempPassword,
        offline: Boolean(offline),
      });
      setPasswordCopied(false);

      setToastMessage(`Created new ${created.role} account for ${created.name}!`);
      setTimeout(() => setToastMessage(''), 4000);
      setModalMode('credentials');
      resetCreateForm();
      if (onRefresh) onRefresh();
    } catch (err) {
      // Keep the form open so the admin can correct and resubmit
      const msg = err.message || 'Account creation failed.';
      if (/email/i.test(msg) && /(exist|duplicate|already|taken|in use)/i.test(msg)) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      } else if (/npn/i.test(msg) && /(exist|duplicate|already|taken|in use|digit|format|invalid)/i.test(msg)) {
        setFieldErrors((prev) => ({ ...prev, npn: msg }));
      }
      setFormError(msg);
    } finally {
      setIsProcessing(false);
    }
  }


  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Platform Account Roster & Accreditation</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
              {filteredAccounts.length} members
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Staff credentials and inspect independent Agent NPNs, state insurance department clearances, and disciplinary offboarding (SOP 23 & 27).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-52">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search name, NPN, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="agent">Licensed Agents</option>
              <option value="staff">Platform Staff</option>
              <option value="admin">System Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending NPN</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Account Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Member Identity</th>
                <th className="px-5 py-3.5">Role & Department</th>
                <th className="px-5 py-3.5">National Producer # (NPN)</th>
                <th className="px-5 py-3.5">State Licenses</th>
                <th className="px-5 py-3.5">Accreditation Status</th>
                <th className="px-5 py-3.5">Policies Enrolled</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const isActive = getStatus(acc) === 'Active';
                const isPending = isPendingStatus(acc);
                const isSuspended = getStatus(acc) === 'Suspended';

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${acc.bg || 'bg-slate-700 text-white'} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                          {acc.avatar || acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{acc.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{acc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            acc.role === 'admin'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : acc.role === 'staff'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{acc.department}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-800">{acc.npn}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(acc.statesLicensed || []).map((st) => (
                          <span key={st} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200">
                            {st}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                        {isPending ? 'Pending NPN' : acc.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800">{acc.dealsCount || 0}</span>
                      <span className="text-[11px] text-slate-400 ml-1">deals</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenInspect(acc)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          title="Inspect Credentials"
                        >
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </button>

                        {isPending && (
                          <button
                            onClick={() => handleApproveAgent(acc)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-bold text-[11px] cursor-pointer shadow-2xs"
                          >
                            Approve
                          </button>
                        )}

                        {isActive && acc.role === 'agent' && (
                          <button
                            onClick={() => handleOpenSuspend(acc)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition font-bold text-[11px] cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}

                        {isSuspended && (
                          <button
                            onClick={() => handleReinstateAgent(acc)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition font-bold text-[11px] cursor-pointer shadow-2xs"
                          >
                            Reinstate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Inspect Accreditation ──────────────────────────────── */}
      {modalMode === 'inspect' && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">verified</span>
                <h3 className="text-base font-bold text-slate-900">Accreditation & License Inspector</h3>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className={`w-12 h-12 rounded-xl ${selectedAccount.bg} flex items-center justify-center text-white font-bold text-base`}>
                {selectedAccount.avatar}
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">{selectedAccount.name}</div>
                <div className="text-xs text-slate-500">{selectedAccount.email} • {selectedAccount.phone}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{selectedAccount.department}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">National Producer #</span>
                <strong className="text-slate-900 font-mono text-sm">{selectedAccount.npn}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Compliance Status</span>
                <strong className="text-slate-900 text-xs">{selectedAccount.complianceStatus || 'Verified'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">State Licenses</span>
                <strong className="text-slate-900 text-xs">{(selectedAccount.statesLicensed || []).join(', ')}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled Policies</span>
                <strong className="text-slate-900 text-xs">{selectedAccount.dealsCount || 0} Deals in Pipeline</strong>
              </div>
            </div>

            {selectedAccount.suspensionReason && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong className="font-bold block mb-1">Disciplinary Action Notes (SOP 23):</strong>
                <span>{selectedAccount.suspensionReason}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              {isPendingStatus(selectedAccount) && (
                <button
                  type="button"
                  onClick={() => handleApproveAgent(selectedAccount)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                >
                  Approve Accreditation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Suspend Account (SOP 23) ───────────────────────────── */}
      {modalMode === 'suspend' && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[24px]">gavel</span>
                <h3 className="text-base font-bold text-slate-900">Enforce Account Suspension (SOP 23 & 27)</h3>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
              Suspending <strong>{selectedAccount.name}</strong> will immediately revoke access to new match inquiries, disable client portal communication, and freeze commission settlements pending audit review.
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Disciplinary / Compliance Justification (Recorded in Audit Log)
                </label>
                <textarea
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  placeholder="Explain reason per SOP 23 (e.g. AOR dispute, unauthorized carrier modification, client data breach)..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isProcessing ? 'Enforcing...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Create Account ─────────────────────────────────────── */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">person_add</span>
                <h3 className="text-base font-bold text-slate-900">Provision New Platform Member</h3>
              </div>
              <button
                onClick={handleCloseCreate}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAccount} noValidate className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newAccountForm.name}
                    onChange={(e) => setFormField('name', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${fieldBorder('name')}`}
                    placeholder="e.g. Danny Tran"
                  />
                  {fieldErrors.name && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role <span className="text-rose-500">*</span></label>
                  <select
                    value={newAccountForm.role}
                    onChange={(e) => setFormField('role', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="agent">Licensed Partner Agent</option>
                    <option value="staff">Platform Staff</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    value={newAccountForm.email}
                    onChange={(e) => setFormField('email', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${fieldBorder('email')}`}
                    placeholder="e.g. danny@insurmatch.us"
                  />
                  {fieldErrors.email && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number {isAgentForm && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    value={newAccountForm.phone}
                    onChange={(e) => setFormField('phone', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${fieldBorder('phone')}`}
                    placeholder="+1 (832) 000-0000"
                  />
                  {fieldErrors.phone && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isAgentForm && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">National Producer # (NPN) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newAccountForm.npn}
                      onChange={(e) => setFormField('npn', e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border focus:outline-none font-mono ${fieldBorder('npn')}`}
                      placeholder="e.g. 2018892"
                    />
                    {fieldErrors.npn
                      ? <p className="mt-1 text-[11px] text-rose-600 font-semibold">{fieldErrors.npn}</p>
                      : <p className="mt-1 text-[11px] text-slate-400">7-8 digits. Agent stays Pending until NPN is verified.</p>}
                  </div>
                )}
                <div className={isAgentForm ? '' : 'col-span-2'}>
                  <label className="block font-bold text-slate-700 mb-1">Department / Branch</label>
                  <input
                    type="text"
                    value={newAccountForm.department}
                    onChange={(e) => setFormField('department', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="Houston Regional Hub"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State Licenses (comma-separated)</label>
                <input
                  type="text"
                  value={newAccountForm.statesLicensed}
                  onChange={(e) => setFormField('statesLicensed', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="TX (TDI), CA (CDI), FL"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isProcessing ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Account Created — Temporary Credentials ─────────────── */}
      {modalMode === 'credentials' && createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="material-symbols-outlined text-emerald-600 text-[26px]">check_circle</span>
              <h3 className="text-base font-bold text-slate-900">Account Created</h3>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className={`w-10 h-10 rounded-xl ${createdCredentials.bg || 'bg-slate-700 text-white'} flex items-center justify-center font-bold text-xs shrink-0`}>
                {createdCredentials.avatar}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{createdCredentials.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{createdCredentials.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 capitalize">{createdCredentials.role}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    createdCredentials.status.includes('Pending')
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {createdCredentials.status.includes('Pending') ? 'Pending NPN' : createdCredentials.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Temporary Password</label>
              <div className="flex items-stretch gap-2">
                <code className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-sm font-bold select-all break-all">
                  {createdCredentials.tempPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">{passwordCopied ? 'check' : 'content_copy'}</span>
                  {passwordCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Shown only once. The member should change it after first sign-in.</p>
            </div>

            {createdCredentials.offline ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                <strong>Offline mode:</strong> the server could not be reached, so no welcome email was sent. Please share the credentials with the member manually.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0">mail</span>
                <span>A welcome email has been sent automatically to <strong>{createdCredentials.email}</strong>.</span>
              </div>
            )}

            {createdCredentials.status.includes('Pending') && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                This agent is <strong>Pending NPN verification</strong>. Use <strong>Approve</strong> in the roster to activate the account once the NPN is cleared.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseCredentials}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
