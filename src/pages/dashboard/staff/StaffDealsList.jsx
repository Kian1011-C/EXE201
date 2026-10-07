import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getDeals, updateDeal, createTicket, getUsers } from '../../../services/api';
import StaffDealsKanban from './StaffDealsKanban';
import AddDealModal from './AddDealModal';
import { useAuth } from '../../../auth/AuthContext';
import { filterDealsForAgent, getAgentIdentity } from '../../../utils/rbac';
import toast from 'react-hot-toast';
import {
  ALL_CARRIERS,
  MEDICARE_DEAL_STAGES,
  OBAMACARE_DEAL_STAGES,
  CARRIER_COMMISSION_RATES,
  getActiveAgentAccounts,
} from '../../../utils/constants';

export default function StaffDealsList({ onSelectDeal, onSelectContact, isAgent = false, agentName = '' }) {
  const [dealsList, setDealsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'list' | 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [activeViewTab, setActiveViewTab] = useState('all');
  const [collapsedColumns, setCollapsedColumns] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Custom Views state (matching media_1790576078619.png)
  const [customViews, setCustomViews] = useState(() => {
    try {
      const saved = localStorage.getItem('insurmatch_custom_deal_views');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAddViewModal, setShowAddViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Custom Deal Owner Dropdown state (matching media_1790576252122.png)
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [ownerSearchText, setOwnerSearchText] = useState('');
  const ownerDropdownRef = useRef(null);

  // Close owner dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(e.target)) {
        setShowOwnerDropdown(false);
      }
    }
    if (showOwnerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOwnerDropdown]);

  // Dynamic DB users for dynamic agent roster
  const [dbUsers, setDbUsers] = useState([]);
  useEffect(() => {
    getUsers()
      .then((data) => {
        if (Array.isArray(data)) setDbUsers(data);
      })
      .catch(() => {});
  }, []);

  // Custom Carrier Dropdown state (Tất cả hãng hiện tại)
  const [showCarrierDropdown, setShowCarrierDropdown] = useState(false);
  const [carrierSearchText, setCarrierSearchText] = useState('');
  const carrierDropdownRef = useRef(null);

  // Close carrier dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (carrierDropdownRef.current && !carrierDropdownRef.current.contains(e.target)) {
        setShowCarrierDropdown(false);
      }
    }
    if (showCarrierDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCarrierDropdown]);

  async function loadDealsData(filters = {}) {
    setLoading(true);
    try {
      const activeSearch = filters.search !== undefined ? filters.search : searchQuery;
      const activePipeline = filters.pipeline !== undefined ? filters.pipeline : pipelineFilter;
      const activeStage = filters.stage !== undefined ? filters.stage : stageFilter;
      const activeCarrier = filters.carrier !== undefined ? filters.carrier : carrierFilter;
      const activeOwner = filters.owner !== undefined ? filters.owner : (ownerFilter !== '__none__' ? ownerFilter : null);

      const data = await getDeals({
        search: activeSearch,
        pipeline: activePipeline,
        stage: activeStage,
        carrier: activeCarrier,
        owner: activeOwner,
      });
      if (Array.isArray(data)) {
        setDealsList(data);
        setIsDbConnected(true);
      } else {
        setDealsList([]);
        setIsDbConnected(false);
      }
    } catch (err) {
      console.warn('[StaffDealsList] API error:', err);
      setDealsList([]);
      setIsDbConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDealsData({
        search: searchQuery,
        pipeline: pipelineFilter,
        stage: stageFilter,
        carrier: carrierFilter,
        owner: ownerFilter,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, pipelineFilter, stageFilter, carrierFilter, ownerFilter]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  const { user } = useAuth();
  const activeIsAgent =
    Boolean(isAgent) ||
    user?.role === 'agent' ||
    user?.role === 'broker' ||
    window.location.pathname.includes('/agent');
  const effectiveAgent = getAgentIdentity(user || (isAgent ? { role: 'agent', name: agentName } : null));

  const [agentAccounts, setAgentAccounts] = useState(() => getActiveAgentAccounts());

  useEffect(() => {
    function handleAccountsUpdated() {
      setAgentAccounts(getActiveAgentAccounts());
    }
    window.addEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
    getUsers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAgentAccounts(getActiveAgentAccounts());
        }
      })
      .catch(() => {});
    return () => window.removeEventListener('insurmatch_accounts_updated', handleAccountsUpdated);
  }, []);

  // Scoped deals by RBAC
  const scopedDeals = useMemo(() => {
    if (activeIsAgent) {
      return filterDealsForAgent(dealsList, user || { role: 'agent', name: effectiveAgent.name });
    }
    return dealsList;
  }, [dealsList, activeIsAgent, user, effectiveAgent.name]);

  // Combined agent directory for Deal Owner dropdown (Tất cả agent hiện tại)
  const allAvailableAgents = useMemo(() => {
    const list = agentAccounts?.map((a) => ({
      name: a.name,
      handle: a.handle || a.email?.split('@')[0],
      avatar: a.avatar || a.name.slice(0, 2).toUpperCase(),
      bg: a.bg || 'bg-[#2563EB]',
    }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [agentAccounts]);

  // Unique owners from deals & registered agents
  const ownerOptions = useMemo(() => {
    return allAvailableAgents?.map((a) => a.name);
  }, [allAvailableAgents]);

  // Filtered agent list for dropdown search
  const filteredAgentList = useMemo(() => {
    const q = ownerSearchText?.trim()?.toLowerCase();
    if (!q) return allAvailableAgents;
    return allAvailableAgents?.filter(
      (a) => a.name?.toLowerCase().includes(q) || a.handle?.toLowerCase().includes(q)
    );
  }, [allAvailableAgents, ownerSearchText]);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return scopedDeals?.filter((d) => {
      // 1. Tab-based matching
      if (activeIsAgent || activeViewTab === 'my') {
        const matchesMy = d.dealOwner?.name?.toLowerCase().includes(effectiveAgent.name?.toLowerCase());
        if (!matchesMy) return false;
      } else if (activeViewTab.startsWith('view_')) {
        const cv = customViews.find((v) => v.id === activeViewTab);
        const targetOwner = cv?.owner || (ownerFilter !== '__none__' && ownerFilter !== 'all' ? ownerFilter : null);
        // If view has no owner assigned yet and ownerFilter is __none__, view is completely EMPTY as per Image 3!
        if (!targetOwner || ownerFilter === '__none__') {
          return false;
        }
        const dOwnerName = d.dealOwner?.name || '';
        const matchesCustom =
          dOwnerName?.toLowerCase().includes(targetOwner?.toLowerCase()) ||
          targetOwner?.toLowerCase().includes(dOwnerName?.toLowerCase());
        if (!matchesCustom) return false;
      }

      // 2. Search query matching
      const q = searchQuery?.toLowerCase()?.trim();
      const matchesSearch =
        !q ||
        (d.title && d.title?.toLowerCase().includes(q)) ||
        (d.dealName && d.dealName?.toLowerCase().includes(q)) ||
        (d.code && d.code?.toLowerCase().includes(q)) ||
        (d.contactName && d.contactName?.toLowerCase().includes(q)) ||
        (d.carrier && d.carrier?.toLowerCase().includes(q));

      // 3. Dropdown owner matching (if on All Deals tab and not agent)
      let matchesOwner = true;
      if (!activeIsAgent && activeViewTab === 'all') {
        matchesOwner =
          ownerFilter === 'all' ||
          ownerFilter === '__none__' ||
          (d.dealOwner?.name && d.dealOwner.name?.toLowerCase().includes(ownerFilter?.toLowerCase()));
      }

      const matchesPipeline =
        pipelineFilter === 'all' ||
        (d.pipeline && d.pipeline?.toLowerCase().includes(pipelineFilter?.toLowerCase()));

      const matchesCarrier =
        carrierFilter === 'all' ||
        (d.carrier && (
          d.carrier?.toLowerCase() === carrierFilter?.toLowerCase() ||
          d.carrier?.toLowerCase().includes(carrierFilter?.toLowerCase()) ||
          carrierFilter?.toLowerCase().includes(d.carrier?.toLowerCase()) ||
          (carrierFilter === 'BCBS' && d.carrier?.toLowerCase().includes('blue cross')) ||
          (carrierFilter?.toLowerCase().includes('blue cross') && d.carrier === 'BCBS') ||
          (carrierFilter === 'UnitedHealthcare' && (d.carrier === 'UHC' || d.carrier?.toLowerCase().includes('united'))) ||
          (carrierFilter === 'UHC' && d.carrier?.toLowerCase().includes('united'))
        ));

      const matchesStage =
        stageFilter === 'all' ||
        (d.stage && d.stage?.toLowerCase().includes(stageFilter?.toLowerCase()));

      return (
        matchesSearch &&
        matchesOwner &&
        matchesPipeline &&
        matchesCarrier &&
        matchesStage
      );
    });
  }, [
    scopedDeals,
    searchQuery,
    ownerFilter,
    pipelineFilter,
    carrierFilter,
    stageFilter,
    activeViewTab,
    customViews,
    activeIsAgent,
    effectiveAgent.name,
  ]);

  // Handle owner selection from dropdown
  function handleSelectOwner(agent) {
    if (!agent) {
      setOwnerFilter('all');
      if (activeViewTab.startsWith('view_')) {
        const updated = customViews?.map((v) =>
          v.id === activeViewTab ? { ...v, owner: '' } : v
        );
        setCustomViews(updated);
        try {
          localStorage.setItem('insurmatch_custom_deal_views', JSON.stringify(updated));
        } catch {}
      }
      setShowOwnerDropdown(false);
      setOwnerSearchText('');
      return;
    }

    setOwnerFilter(agent.name);
    // If currently in a custom view tab, bind this owner to the view and save!
    if (activeViewTab.startsWith('view_')) {
      const updated = customViews?.map((v) =>
        v.id === activeViewTab ? { ...v, owner: agent.name } : v
      );
      setCustomViews(updated);
      try {
        localStorage.setItem('insurmatch_custom_deal_views', JSON.stringify(updated));
      } catch {}
    }
    setShowOwnerDropdown(false);
    setOwnerSearchText('');
    showToast(`Đã chọn Deal Owner: ${agent.name}`);
  }

  // Handle creating custom view
  function handleCreateCustomView(e) {
    if (e) e.preventDefault();
    const trimmed = newViewName?.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên view!');
      return;
    }
    const newView = {
      id: 'view_' + Date.now(),
      name: trimmed,
      owner: '', // Bắt đầu trống như ảnh 3!
    };
    const updated = [...customViews, newView];
    setCustomViews(updated);
    try {
      localStorage.setItem('insurmatch_custom_deal_views', JSON.stringify(updated));
    } catch {}
    setActiveViewTab(newView.id);
    setOwnerFilter('__none__'); // Empty initial state
    setShowAddViewModal(false);
    setNewViewName('');
    showToast(`Đã thêm view "${trimmed}". Chọn Deal Owner để xem danh sách deals.`);
  }

  // Handle deleting custom view
  function handleDeleteCustomView(viewId) {
    const updated = customViews?.filter((v) => v.id !== viewId);
    setCustomViews(updated);
    try {
      localStorage.setItem('insurmatch_custom_deal_views', JSON.stringify(updated));
    } catch {}
    if (activeViewTab === viewId) {
      setActiveViewTab('all');
      setOwnerFilter('all');
    }
    showToast('Đã xóa view tùy chỉnh');
  }

  // Unique carriers (Tất cả hãng bảo hiểm hiện tại trong hệ thống)
  const carrierOptions = useMemo(() => {
    const list = [...ALL_CARRIERS];
    const existing = new Set(list?.map((c) => c?.toLowerCase()));
    dealsList.forEach((d) => {
      if (d.carrier && !existing.has(d.carrier?.toLowerCase())) {
        list.push(d.carrier);
        existing.add(d.carrier?.toLowerCase());
      }
    });
    return list;
  }, [dealsList]);

  // Filtered carriers for dropdown search
  const filteredCarrierList = useMemo(() => {
    const q = carrierSearchText?.trim()?.toLowerCase();
    if (!q) return carrierOptions;
    return carrierOptions?.filter((c) => c?.toLowerCase().includes(q));
  }, [carrierOptions, carrierSearchText]);

  function handleSelectCarrier(carrierName) {
    if (!carrierName) {
      setCarrierFilter('all');
    } else {
      setCarrierFilter(carrierName);
      showToast(`Đã chọn Hãng: ${carrierName}`);
    }
    setShowCarrierDropdown(false);
    setCarrierSearchText('');
  }

  // Handle stage change from Kanban drag and drop
  async function handleUpdateDealStage(dealId, newStage) {
    const now = new Date();
    const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    setDealsList((prev) =>
      prev?.map((d) => {
        if (d.id === dealId) {
          const oldStage = d.stage || 'Ready to Enroll';
          const newAct = {
            id: 'deal-act-' + Date.now(),
            type: 'Deal Activity',
            time: dateStr,
            actor: 'Anya Nguyen (anya42@9)',
            summary: `moved deal stage from "${oldStage}" to "${newStage}"`,
            dealId: d.id,
            dealTitle: d.title,
            linkText: 'View Details',
          };
          return {
            ...d,
            stage: newStage,
            activities: [newAct, ...(d.activities || [])],
          };
        }
        return d;
      })
    );
    try {
      await updateDeal(dealId, { stage: newStage });
      showToast(`Đã chuyển trạng thái deal sang: ${newStage}`);
    } catch (err) {
      console.warn('[StaffDealsList] Error updating deal stage:', err);
      loadDealsData();
    }
  }

  function handleCollapseAll() {
    setCollapsedColumns({
      PENDING_ENROLLMENT: true,
      NEED_1ST_PAYMENT: true,
      PAYMENT_DONE: true,
      ENROLLED_ACTIVE: true,
      NON_COMMISSION_ACTIVE: true,
      CAN_NOT_CONTACT: true,
    });
  }

  function handleExpandAll() {
    setCollapsedColumns({});
  }

  function handleToggleColumn(colId) {
    setCollapsedColumns((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] p-4 lg:p-6 overflow-y-auto space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Breadcrumbs & Header Actions ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">handshake</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>The Best Rate Insurance</span>
              <span>/</span>
              <span className="text-[#104882] font-semibold">Management</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Deals</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              <span>Deals</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                {scopedDeals.length} deals
              </span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">tune</span>
            <span>Actions</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </button>

          <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">upload</span>
            <span>Import</span>
          </button>

          <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={loadDealsData}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#104882] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Create Deal</span>
          </button>
        </div>
      </div>

      {/* ── Agent Scope Indicator Banner ─────────────────────────────────── */}
      {activeIsAgent && (
        <div className="bg-purple-50 border border-purple-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-purple-900 font-semibold">
            <span className="material-symbols-outlined text-[18px] text-purple-600">handshake</span>
            <span>Chế độ Agent: Chỉ hiển thị các Deals được phân công cho <strong>{effectiveAgent.name}</strong></span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
            {filteredDeals.length} deals phụ trách
          </span>
        </div>
      )}

      {/* ── Top View Tabs (Matching Screenshot media_1790575995773.png) ────────── */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-px">
        {activeIsAgent ? (
          <button
            onClick={() => setActiveViewTab('my')}
            className="px-3.5 py-2 border-b-2 border-[#00B4D8] text-[#104882] font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
            <span>My Deals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
              {filteredDeals.length}
            </span>
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setActiveViewTab('all');
                setPipelineFilter('all');
                setStageFilter('all');
                setOwnerFilter('all');
              }}
              className={`px-3.5 py-2 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeViewTab === 'all'
                  ? 'border-[#00B4D8] text-[#104882] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-slate-400">group</span>
              <span>All Deals</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {activeViewTab === 'all' ? filteredDeals.length : scopedDeals.length}
              </span>
            </button>

            {/* Custom Views added by Staff / Admin */}
            {customViews?.map((cv) => {
              const count = cv.owner
                ? scopedDeals?.filter((d) => {
                    const dOwnerName = d.dealOwner?.name || '';
                    return (
                      dOwnerName?.toLowerCase().includes(cv.owner?.toLowerCase()) ||
                      cv.owner?.toLowerCase().includes(dOwnerName?.toLowerCase())
                    );
                  }).length
                : 0;

              return (
                <div
                  key={cv.id}
                  onClick={() => {
                    setActiveViewTab(cv.id);
                    setOwnerFilter(cv.owner ? cv.owner : '__none__');
                  }}
                  className={`group px-3.5 py-2 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeViewTab === cv.id
                      ? 'border-[#00B4D8] text-[#104882] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-400">
                    view_agenda
                  </span>
                  <span>{cv.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustomView(cv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 text-slate-400 p-0.5 rounded transition cursor-pointer"
                    title="Xóa view này"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setNewViewName('');
                setShowAddViewModal(true);
              }}
              className="px-2.5 py-1 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px] font-medium cursor-pointer ml-1 rounded hover:bg-blue-50 transition"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add View</span>
            </button>
          </>
        )}
      </div>

      {/* ── 4. Secondary Control Toolbar (Exact match to media_1790228065239.png) ─ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
        {/* Left Side: View Toggle & Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* List vs Kanban Toggle Button */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#00B4D8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">view_kanban</span>
              <span>Kanban</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-700 ml-1">Filters:</span>

          {/* Pipeline Selector */}
          <div className="relative">
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Pipelines</option>
              <option value="Obamacare 2026">Obamacare 2026</option>
              <option value="Medicare 2026">Medicare 2026</option>
            </select>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Custom Deal Owner Dropdown (Matching Screenshot media_1790576252122.png) - Hidden for Agent Accounts */}
          {!activeIsAgent && (
            <div className="relative" ref={ownerDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowOwnerDropdown(!showOwnerDropdown);
                setOwnerSearchText('');
              }}
              className={`flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-lg border text-xs font-medium cursor-pointer shadow-2xs transition ${
                ownerFilter !== 'all' && ownerFilter !== '__none__'
                  ? 'border-blue-400 bg-blue-50/80 text-blue-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ownerFilter !== 'all' && ownerFilter !== '__none__' ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {ownerFilter.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[130px]">{ownerFilter}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOwner(null);
                    }}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-0.5 text-[11px] px-0.5"
                    title="Xóa bộ lọc Deal Owner"
                  >
                    ✕
                  </span>
                </>
              ) : (
                <span className="text-slate-600">Deal Owner...</span>
              )}
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                expand_more
              </span>
            </button>

            {/* Dropdown Menu Popover */}
            {showOwnerDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-72 max-h-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                {/* Search Header */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                  <div className="relative">
                    <input
                      type="text"
                      value={ownerSearchText}
                      onChange={(e) => setOwnerSearchText(e.target.value)}
                      placeholder="Search..."
                      autoFocus
                      className="w-full pl-7 pr-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                      search
                    </span>
                  </div>
                </div>

                {/* Agents List */}
                <div className="overflow-y-auto flex-grow divide-y divide-slate-50 py-1">
                  <button
                    type="button"
                    onClick={() => handleSelectOwner(null)}
                    className="w-full px-3 py-2 text-left text-xs text-slate-600 hover:bg-blue-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      --
                    </span>
                    <span className="font-medium text-slate-700">Tất cả Deal Owner</span>
                  </button>

                  {filteredAgentList?.map((ag) => {
                    const isSelected =
                      ownerFilter?.toLowerCase() === ag.name?.toLowerCase() ||
                      ownerFilter?.toLowerCase().includes(ag.name?.toLowerCase());
                    return (
                      <button
                        key={ag.handle + ag.name}
                        type="button"
                        onClick={() => handleSelectOwner(ag)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition cursor-pointer ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${ag.bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                        >
                          {ag.avatar}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <span className="truncate block font-medium">
                            {ag.name}{' '}
                            <span className="text-[11px] text-slate-400 font-normal">
                              ({ag.handle})
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredAgentList.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Không tìm thấy agent phù hợp
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Custom Carrier Dropdown (Tất cả hãng bảo hiểm hiện tại) */}
          <div className="relative" ref={carrierDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowCarrierDropdown(!showCarrierDropdown);
                setCarrierSearchText('');
              }}
              className={`flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-lg border text-xs font-medium cursor-pointer shadow-2xs transition ${
                carrierFilter !== 'all'
                  ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {carrierFilter !== 'all' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span className="truncate max-w-[120px]">{carrierFilter}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCarrier(null);
                    }}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-0.5 text-[11px] px-0.5"
                    title="Xóa bộ lọc Carrier"
                  >
                    ✕
                  </span>
                </>
              ) : (
                <span className="text-slate-600">Carrier...</span>
              )}
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                expand_more
              </span>
            </button>

            {/* Dropdown Menu Popover */}
            {showCarrierDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                {/* Search Header */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                  <div className="relative">
                    <input
                      type="text"
                      value={carrierSearchText}
                      onChange={(e) => setCarrierSearchText(e.target.value)}
                      placeholder="Tìm hãng bảo hiểm..."
                      autoFocus
                      className="w-full pl-7 pr-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">
                      search
                    </span>
                  </div>
                </div>

                {/* Carriers List */}
                <div className="overflow-y-auto flex-grow divide-y divide-slate-50 py-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCarrier(null)}
                    className="w-full px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                      --
                    </span>
                    <span className="font-medium text-slate-700">Tất cả Carrier</span>
                  </button>

                  {filteredCarrierList?.map((c) => {
                    const isSelected = carrierFilter?.toLowerCase() === c?.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelectCarrier(c)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">{c}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[15px] text-indigo-600">check</span>
                        )}
                      </button>
                    );
                  })}
                  {filteredCarrierList.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Không tìm thấy hãng phù hợp
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Refresh, Collapse All, Expand All */}
        <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
          <button
            type="button"
            onClick={loadDealsData}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 cursor-pointer transition"
            title="Tải lại dữ liệu"
          >
            <span className={`material-symbols-outlined text-[16px] text-slate-500 ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          {viewMode === 'kanban' && (
            <>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 cursor-pointer transition"
                title="Thu gọn tất cả các cột"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">unfold_less</span>
                <span>Collapse all</span>
              </button>

              <button
                type="button"
                onClick={handleExpandAll}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 cursor-pointer transition"
                title="Mở rộng tất cả các cột"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">unfold_more</span>
                <span>Expand all</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 5. Tertiary Search Sub-row (Matching Image) ──────────────────── */}
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-slate-700">Filters:</span>
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="text-[11px] text-slate-500 font-medium ml-auto">
          Hiển thị <span className="font-bold text-slate-800">{filteredDeals.length}</span> / {dealsList.length} deals
        </div>
      </div>

      {/* ── 6. Main Content Area (Kanban or Table) ────────────────────────── */}
      {viewMode === 'kanban' ? (
        <StaffDealsKanban
          deals={filteredDeals}
          pipeline={pipelineFilter}
          onSelectDeal={onSelectDeal}
          onUpdateDealStage={handleUpdateDealStage}
          collapsedColumns={collapsedColumns}
          onToggleCollapse={handleToggleColumn}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          {/* Table Title Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="material-symbols-outlined text-[16px] text-slate-500">grid_on</span>
            <span>All Deals</span>
            <span className="text-slate-400 font-normal">
              ({filteredDeals.length} displayed)
            </span>
          </div>
          <button
            onClick={() => showToast('Deals list refreshed')}
            title="Refresh Table"
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-700 whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center">No.</th>
                <th className="px-3 py-2.5">Code</th>
                <th className="px-3 py-2.5 font-bold text-slate-900">Deal Name</th>
                <th className="px-3 py-2.5">Associated Contact</th>
                <th className="px-3 py-2.5">Pipeline</th>
                <th className="px-3 py-2.5">Stage</th>
                <th className="px-3 py-2.5">Carrier</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Selling State</th>
                <th className="px-3 py-2.5">Deal Owner</th>
                <th className="px-3 py-2.5">Last modified by</th>
                <th className="px-3 py-2.5">Last modified time</th>
                <th className="px-2 py-2.5 text-center w-8">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <span className="material-symbols-outlined text-[32px]">handshake</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">No deals found!</div>
                      <div className="text-xs text-slate-500">
                        There are no deals matching your current search or filter criteria.
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#104882] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          + Create Deal
                        </button>
                        <button
                          type="button"
                          onClick={loadDealsData}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          Tải lại từ Database
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeals?.map((deal, index) => {
                                    return (
                    <tr
                      key={deal.id}
                      onClick={() => onSelectDeal && onSelectDeal(deal)}
                      className={`hover:bg-blue-50/60 transition-colors cursor-pointer group `}
                    >
                      {/* No. */}
                      <td className="px-3 py-2.5 text-center text-slate-400 font-medium">
                        {deal.no || index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-3 py-2.5 font-mono text-[#104882] font-semibold">
                        {deal.code}
                      </td>

                      {/* Deal Name */}
                      <td className="px-3 py-2.5 font-bold text-slate-900 group-hover:text-blue-700 max-w-[280px]">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="truncate" title={deal.title}>{deal.title}</span>
                          <button
                            type="button"
                            title="Mở trong tab mới"
                            onClick={(e) => {
                              e.stopPropagation();
                              const isStaff = window.location.pathname.includes('/staff');
                              const isAdmin = window.location.pathname.includes('/admin');
                              const isAgent = window.location.pathname.includes('/agent');
                              const baseRoute = isAdmin
                                ? '/dashboard/admin/deals'
                                : isAgent
                                ? '/dashboard/agent/deals'
                                : '/dashboard/staff/deals';
                              const dealUrl = `${baseRoute}/${deal.id || deal.code || ''}`;
                              window.open(dealUrl, '_blank');
                            }}
                            className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          </button>
                        </div>
                      </td>

                      {/* Associated Contact */}
                      <td className="px-3 py-2.5">
                        {deal.contactName ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectContact &&
                                onSelectContact({
                                  id: deal.contactId || (deal.contact?.id) || '',
                                  fullName: deal.contactName,
                                  phone: deal.contactPhone || deal.contact?.phone || '',
                                  email: deal.contactEmail || deal.contact?.email || '',
                                });
                            }}
                            className="text-[#104882] hover:underline font-semibold text-left"
                          >
                            {deal.contactName}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Pipeline */}
                      <td className="px-3 py-2.5 text-slate-700">
                        {deal.pipeline}
                      </td>

                      {/* Stage Badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            deal.stageColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              (deal.stage || '').includes('Ready')
                                ? 'bg-amber-500 animate-pulse'
                                : (deal.stage || '').includes('VERIFIED') || (deal.stage || '').includes('Won')
                                ? 'bg-emerald-500 shadow-2xs'
                                : (deal.stage || '').includes('Lost')
                                ? 'bg-rose-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span>{deal.stageBadge || deal.stage}</span>
                        </span>
                      </td>

                      {/* Carrier */}
                      <td className="px-3 py-2.5 font-semibold text-blue-800">
                        {deal.carrier || 'BCBS'}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {deal.amount}
                      </td>

                      {/* Selling State */}
                      <td className="px-3 py-2.5 text-slate-600">
                        {deal.sellingState}
                      </td>

                      {/* Deal Owner */}
                      <td className="px-3 py-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-800">
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              deal.dealOwner?.bg || 'bg-blue-600 text-white'
                            }`}
                          >
                            {deal.dealOwner?.avatar || 'KN'}
                          </div>
                          <span>{deal.dealOwner?.name || ''}</span>
                        </div>
                      </td>

                      {/* Last modified by */}
                      <td className="px-3 py-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-700">
                          <div
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              deal.lastModifiedBy?.bg || 'bg-teal-600 text-white'
                            }`}
                          >
                            {deal.lastModifiedBy?.avatar || 'AN'}
                          </div>
                          <span>{deal.lastModifiedBy?.name || 'Anya Nguyen'}</span>
                        </div>
                      </td>

                      {/* Last modified time */}
                      <td className="px-3 py-2.5 text-slate-500 font-mono text-[10px]">
                        {deal.lastModifiedTime}
                      </td>

                      {/* Action # */}
                      <td className="px-2 py-2.5 text-center text-slate-400 group-hover:text-slate-700">
                        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredDeals.length}</span> of{' '}
            <span className="font-bold text-slate-800">{dealsList.length}</span> deals
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                type="button"
                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-[15px]">chevron_left</span>
              </button>
              <button onClick={() => toast('Tính năng đang được phát triển!', { icon: '🚧' })}
                type="button"
                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-[15px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* ── Create Deal Modal Matching media_1790575726166.png ── */}
      <AddDealModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDealCreated={(newDeal, uploadTicket) => {
          setDealsList((prev) => [newDeal, ...prev]);
          showToast(
            newDeal.needUpload === 'Yes'
              ? `Đã tạo Deal ${newDeal.code} và tự động xuất Ticket Upload document!`
              : `Đã tạo Deal ${newDeal.code} thành công!`
          );
        }}
      />

      {/* ── Add View Modal (Exact Match to Screenshot media_1790576078619.png) ── */}
      {showAddViewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Dark Navy Blue Header */}
            <div className="bg-[#143B73] px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span className="text-xs font-bold uppercase tracking-wider">ADD VIEW</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddViewModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body - Simple Name Input only as requested */}
            <form onSubmit={handleCreateCustomView}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="Nhập tên view (vd: Quyen Le, Tri Tran - Deal)"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs text-slate-800 font-medium placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    View mới tạo sẽ bắt đầu trống. Bạn có thể chọn Deal Owner ở thanh công cụ để lọc danh sách deal cho agent đó.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddViewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span>
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
