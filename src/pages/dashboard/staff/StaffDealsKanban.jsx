import React, { useState, useMemo } from 'react';

// ── Currency parsing and formatting helpers ──────────────────────────────────
export function parseAmount(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCurrency(num) {
  if (num === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ── Clean Stage Label & Normalization Helpers ─────────────────────────────────
export function getCleanStageLabel(stage) {
  if (!stage) return 'UNASSIGNED';
  return stage
    .replace(/\s*\((Obamacare|Medicare)\s*\d*\)/gi, '')
    .trim()
    .toUpperCase();
}

export function normalizeStageName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s*\((obamacare|medicare)\s*\d*\)/gi, '')
    .trim();
}

// ── Standard Pipeline Stage Sequences ─────────────────────────────────────────
export const PIPELINE_STAGE_TEMPLATES = {
  'Obamacare 2026': [
    'New Opportunity/Call to Renew (Obamacare 2026)',
    'Need Agent Contact (Obamacare 2026)',
    'Need to Quote (Obamacare 2026)',
    'Quoted - Need Client Confirm (Obamacare 2026)',
    'Waiting for document (Obamacare 2026)',
    'Uploaded - Waiting for Verification',
    'Need Agent Enroll (Obamacare 2026)',
    'Ready to Enroll (Obamacare 2026)',
    '$0 plan - Ready to enroll (Obamacare 2026)',
    'Enrolled - Need 1st Payment (Obamacare 2026)',
    'Enrolled - 1st Payment done (Obamacare 2026)',
    'Enrolled - Active (Obamacare 2026)',
    'Non-Commission - Active (Obamacare 2026)',
    'Need Telesale Review (Obamacare 2026)',
    'Termination (Obamacare 2026)',
    'Deal Lost (Obamacare 2026)',
    'Do not contact (Obamacare 2026)',
  ],
  'Medicare 2026': [
    'New Opportunity/Call to Renew (Medicare 2026)',
    'Ready to Enroll (Medicare 2026)',
    'Enrolled (Medicare 2026)',
    'Enrolled - HRA Done (Medicare 2026)',
    'Enrolled - Active (Medicare 2026)',
    'Enrolled - HRA Done - Active (Medicare 2026)',
    'Auto Renew - Active (Medicare 2026)',
    'Need Telesale Review (Medicare 2026)',
    'Deal Lost (Medicare 2026)',
    'Do Not Contact (Medicare 2026)',
  ],
  all: [
    'New Opportunity/Call to Renew (Obamacare 2026)',
    'Need to Quote (Obamacare 2026)',
    'Waiting for document (Obamacare 2026)',
    'Uploaded - Waiting for Verification',
    'Ready to Enroll (Obamacare 2026)',
    '$0 plan - Ready to enroll (Obamacare 2026)',
    'Enrolled - Need 1st Payment (Obamacare 2026)',
    'Enrolled - 1st Payment done (Obamacare 2026)',
    'Enrolled - Active (Obamacare 2026)',
    'Non-Commission - Active (Obamacare 2026)',
    'Auto Renew - Active (Medicare 2026)',
    'Enrolled - HRA Done - Active (Medicare 2026)',
    'Termination (Obamacare 2026)',
    'Deal Lost (Obamacare 2026)',
  ],
};

export function getStageColorClasses(norm) {
  if (norm.includes('ready')) {
    return {
      headerColor: 'text-indigo-800',
      dotColor: 'bg-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderHover: 'hover:border-indigo-400',
    };
  }
  if (norm.includes('document') || norm.includes('upload')) {
    return {
      headerColor: 'text-amber-800',
      dotColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderHover: 'hover:border-amber-400',
    };
  }
  if (norm.includes('need') && norm.includes('payment')) {
    return {
      headerColor: 'text-amber-800',
      dotColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      borderHover: 'hover:border-amber-400',
    };
  }
  if (norm.includes('payment done')) {
    return {
      headerColor: 'text-blue-800',
      dotColor: 'bg-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      borderHover: 'hover:border-blue-400',
    };
  }
  if (norm.includes('active')) {
    if (norm.includes('non-commission')) {
      return {
        headerColor: 'text-purple-800',
        dotColor: 'bg-purple-500',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        borderHover: 'hover:border-purple-400',
      };
    }
    return {
      headerColor: 'text-emerald-800',
      dotColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderHover: 'hover:border-emerald-400',
    };
  }
  if (norm.includes('lost') || norm.includes('termination') || norm.includes('do not contact')) {
    return {
      headerColor: 'text-rose-800',
      dotColor: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      borderHover: 'hover:border-rose-400',
    };
  }
  return {
    headerColor: 'text-slate-800',
    dotColor: 'bg-slate-500',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    borderHover: 'hover:border-blue-400',
  };
}

export default function StaffDealsKanban({
  deals = [],
  pipeline = 'Obamacare 2026',
  onSelectDeal,
  onUpdateDealStage,
  collapsedColumns = {},
  onToggleCollapse,
}) {
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' (all stages) | 'active' (only stages with deals)

  // Dynamically assemble all columns based on pipeline + deal stages
  const columns = useMemo(() => {
    let baseStages = [];
    if (pipeline && pipeline.toLowerCase().includes('medicare')) {
      baseStages = [...PIPELINE_STAGE_TEMPLATES['Medicare 2026']];
    } else if (pipeline && pipeline.toLowerCase().includes('obamacare')) {
      baseStages = [...PIPELINE_STAGE_TEMPLATES['Obamacare 2026']];
    } else {
      baseStages = [...PIPELINE_STAGE_TEMPLATES.all];
    }

    // Always scan deals: if any deal has a stage not yet in baseStages, append it dynamically!
    deals.forEach((d) => {
      if (!d.stage) return;
      const norm = normalizeStageName(d.stage);
      const found = baseStages.some((st) => normalizeStageName(st) === norm);
      if (!found) {
        baseStages.push(d.stage);
      }
    });

    const mapped = baseStages.map((stageStr) => {
      const norm = normalizeStageName(stageStr);
      const cleanLabel = getCleanStageLabel(stageStr);
      const colDeals = deals.filter((d) => normalizeStageName(d.stage) === norm);
      const totalAmount = colDeals.reduce((sum, d) => sum + parseAmount(d.amount), 0);
      const colors = getStageColorClasses(norm);

      return {
        id: norm.replace(/[^a-z0-9]+/g, '_'),
        rawStage: stageStr,
        canonicalStage: stageStr,
        label: cleanLabel,
        norm,
        deals: colDeals,
        count: colDeals.length,
        totalAmount,
        ...colors,
      };
    });

    if (filterMode === 'active') {
      return mapped.filter((c) => c.count > 0);
    }
    return mapped;
  }, [deals, pipeline, filterMode]);

  function handleDragStart(e, deal) {
    setDraggedDealId(deal.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
  }

  function handleDragOver(e, colId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  }

  function handleDragLeave(e, colId) {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  }

  function handleDrop(e, col) {
    e.preventDefault();
    setDragOverColId(null);
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    setDraggedDealId(null);

    if (dealId && onUpdateDealStage) {
      onUpdateDealStage(dealId, col.canonicalStage);
    }
  }

  const activeColumnsCount = useMemo(() => {
    return columns.filter((c) => c.count > 0).length;
  }, [columns]);

  return (
    <div className="flex flex-col flex-grow select-none">
      {/* ── Sub-toolbar for Kanban stage display preferences ─────────────── */}
      <div className="flex items-center justify-between pb-2 pt-0.5 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Hiển thị các cột Kanban:</span>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả các Stage ({columns.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('active')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                filterMode === 'active'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chỉ các Stage có Deal ({activeColumnsCount})
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Kéo thả thẻ giữa các cột để chuyển Stage trực tiếp
        </div>
      </div>

      {/* ── Kanban Columns Track ─────────────────────────────────────────── */}
      <div className="flex-grow flex gap-3 overflow-x-auto pb-4 pt-1 px-1 min-h-[580px] scrollbar-thin">
        {columns.map((col) => {
          const isCollapsed = Boolean(collapsedColumns[col.id]);
          const isDragOver = dragOverColId === col.id;

          if (isCollapsed) {
            return (
              <div
                key={col.id}
                onClick={() => onToggleCollapse && onToggleCollapse(col.id)}
                className="w-11 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 shrink-0 shadow-2xs group"
                title={`Nhấn để mở rộng cột ${col.label}`}
              >
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-500 group-hover:text-blue-600 transition">
                    chevron_right
                  </span>
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {col.count}
                  </span>
                </div>

                {/* Rotated vertical text label */}
                <div
                  className="text-[10px] font-black text-slate-600 tracking-wider uppercase whitespace-nowrap"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {col.label}
                </div>

                <div className="text-[10px] font-bold text-slate-500 pb-1">
                  {col.totalAmount > 0 ? formatCurrency(col.totalAmount) : '$0'}
                </div>
              </div>
            );
          }

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col)}
              className={`w-[290px] sm:w-[315px] bg-slate-50/80 rounded-xl border flex flex-col shrink-0 shadow-2xs transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 ring-2 ring-blue-300/40 bg-blue-50/30'
                  : 'border-slate-200/80'
              }`}
            >
              {/* ── Column Header ──────────────────────────────────────────── */}
              <div className="p-3 bg-white/95 rounded-t-xl border-b border-slate-200/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                  <h3
                    className={`text-[11px] font-black uppercase tracking-tight truncate ${col.headerColor}`}
                    title={col.label}
                  >
                    {col.label}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    ({col.count})
                  </span>
                </div>

                {/* Collapse button '<' */}
                <button
                  type="button"
                  onClick={() => onToggleCollapse && onToggleCollapse(col.id)}
                  className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Thu gọn cột"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
              </div>

              {/* ── Deals Cards Container ──────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 max-h-[calc(100vh-320px)] min-h-[380px]">
                {col.deals.length === 0 ? (
                  <div
                    className={`h-36 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center transition ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50/50 text-blue-600'
                        : 'border-slate-200 bg-white/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px] mb-1 opacity-60">
                      move_to_inbox
                    </span>
                    <span className="font-medium text-[11px]">Kéo deal vào đây</span>
                  </div>
                ) : (
                  col.deals.map((deal) => {
                    const isBeingDragged = draggedDealId === deal.id;
                    const formattedTime = deal.lastModifiedTime || '09/18/2026, 15:39';

                    return (
                      <div
                        key={deal.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onClick={() => onSelectDeal && onSelectDeal(deal)}
                        className={`bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs hover:shadow-md ${col.borderHover} transition-all duration-150 cursor-grab active:cursor-grabbing relative group ${
                          isBeingDragged ? 'opacity-40 scale-95 border-blue-400' : ''
                        }`}
                      >
                        {/* Deal Title */}
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate mb-1.5 flex items-center justify-between gap-1">
                          <span className="truncate" title={deal.title}>
                            {deal.shortTitle || deal.title}
                          </span>
                          <span className="material-symbols-outlined text-[14px] text-slate-300 opacity-0 group-hover:opacity-100 transition shrink-0">
                            open_in_new
                          </span>
                        </div>

                        {/* Row 1: Amount */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                            monetization_on
                          </span>
                          <span>Amount:</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {deal.amount || '$0'}
                          </span>
                        </div>

                        {/* Row 2: Carrier */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                            public
                          </span>
                          <span>Carrier:</span>
                          <span className="font-semibold text-slate-800 truncate">
                            {deal.carrier || 'BCBS'}
                          </span>
                        </div>

                        {/* Row 3: Created time */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                            calendar_today
                          </span>
                          <span className="text-[10px]">Created time:</span>
                          <span className="font-mono text-[10px] text-slate-600">
                            {formattedTime}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── Column Footer: Total ───────────────────────────────────── */}
              <div className="p-2.5 bg-white/90 rounded-b-xl border-t border-slate-200/80 text-center shrink-0">
                <span className="text-xs font-bold text-slate-800">
                  Total:{' '}
                  <span className="font-mono text-slate-900">
                    {formatCurrency(col.totalAmount)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
