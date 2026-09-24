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

// ── Kanban Column Specifications (Exact Match to media_1790228065239.png) ────
export const KANBAN_COLUMNS = [
  {
    id: 'PENDING_ENROLLMENT',
    label: 'PENDING ENROLLMENT',
    canonicalStage: 'Ready to Enroll (Obamacare 2026)',
    headerColor: 'text-slate-800',
    dotColor: 'bg-slate-400',
    match: (stage) => {
      const s = (stage || '').toLowerCase();
      return (
        s.includes('pending enrollment') ||
        s.includes('ready to enroll') ||
        s.includes('new opportunity') ||
        s.includes('need agent contact') ||
        s.includes('need to quote') ||
        s.includes('quoted') ||
        s.includes('waiting for document') ||
        s.includes('$0 plan') ||
        s.includes('uploaded - waiting')
      );
    },
  },
  {
    id: 'NEED_1ST_PAYMENT',
    label: 'ENROLLED - NEED 1ST PAYMENT',
    canonicalStage: 'Enrolled - Need 1st Payment (Obamacare 2026)',
    headerColor: 'text-amber-800',
    dotColor: 'bg-amber-500',
    match: (stage) => {
      const s = (stage || '').toLowerCase();
      return s.includes('need 1st payment') || s.includes('need payment');
    },
  },
  {
    id: 'PAYMENT_DONE',
    label: 'ENROLLED - 1ST PAYMENT DONE',
    canonicalStage: 'Enrolled - 1st Payment done (Obamacare 2026)',
    headerColor: 'text-blue-800',
    dotColor: 'bg-blue-500',
    match: (stage) => {
      const s = (stage || '').toLowerCase();
      return s.includes('1st payment done') || s.includes('first payment done');
    },
  },
  {
    id: 'ENROLLED_ACTIVE',
    label: 'ENROLLED - ACTIVE',
    canonicalStage: 'Enrolled - Active (Obamacare 2026)',
    headerColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
    match: (stage) => {
      const s = (stage || '').toLowerCase();
      return (
        (s.includes('enrolled') && s.includes('active')) ||
        s.includes('hra done') ||
        s.includes('verified') ||
        s.includes('closed won')
      );
    },
  },
  {
    id: 'NON_COMMISSION_ACTIVE',
    label: 'NON-COMMISSION - ACTIVE',
    canonicalStage: 'Non-Commission - Active (Obamacare 2026)',
    headerColor: 'text-purple-800',
    dotColor: 'bg-purple-500',
    match: (stage) => {
      const s = (stage || '').toLowerCase();
      return s.includes('non-commission') || s.includes('non commission');
    },
  },
  {
    id: 'CAN_NOT_CONTACT',
    label: 'CAN NOT CONTACT - AUTO RENEW',
    canonicalStage: 'Can Not Contact - Auto Renew (Obamacare 2026)',
    headerColor: 'text-rose-800',
    dotColor: 'bg-rose-500',
    match: (stage) => {
      const s = (stage || '').toLowerCase();
      return (
        s.includes('can not contact') ||
        s.includes('do not contact') ||
        s.includes('auto renew') ||
        s.includes('deal lost') ||
        s.includes('termination')
      );
    },
  },
];

export default function StaffDealsKanban({
  deals = [],
  onSelectDeal,
  onUpdateDealStage,
  collapsedColumns = {},
  onToggleCollapse,
}) {
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  // Group deals into columns
  const columnData = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => {
      const colDeals = deals.filter((d) => col.match(d.stage));
      const totalAmount = colDeals.reduce((sum, d) => sum + parseAmount(d.amount), 0);
      return {
        ...col,
        deals: colDeals,
        totalAmount,
        count: colDeals.length,
      };
    });
  }, [deals]);

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

  return (
    <div className="flex-grow flex gap-3 overflow-x-auto pb-4 pt-1 px-1 min-h-[580px] scrollbar-thin select-none">
      {columnData.map((col) => {
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
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {col.count}
                </span>
              </div>

              {/* Rotated vertical text label */}
              <div
                className="text-[11px] font-bold text-slate-600 tracking-wider uppercase whitespace-nowrap"
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
            className={`w-[290px] sm:w-[310px] bg-slate-50/70 rounded-xl border flex flex-col shrink-0 shadow-2xs transition-all duration-200 ${
              isDragOver
                ? 'border-blue-400 ring-2 ring-blue-300/40 bg-blue-50/30'
                : 'border-slate-200/80'
            }`}
          >
            {/* ── Column Header ────────────────────────────────────────────── */}
            <div className="p-3 bg-white/95 rounded-t-xl border-b border-slate-200/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
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

            {/* ── Deals Cards Container ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 max-h-[calc(100vh-280px)] min-h-[380px]">
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
                      className={`bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-150 cursor-grab active:cursor-grabbing relative group ${
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

            {/* ── Column Footer: Total ─────────────────────────────────────── */}
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
  );
}
