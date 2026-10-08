import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getPropertyHistory,
  exportPropertyHistoryCSV,
} from '../../../services/propertyHistoryService';

/**
 * PROPERTY HISTORY Modal
 * Exact match to screenshot media_1790590629171.png
 */
export default function PropertyHistoryModal({
  isOpen,
  onClose,
  initialFieldName = '',
  entityType = 'contact', // 'contact' | 'deal'
  entityId = '',
  entityName = '',
  entityData = {},
  availableFields = [], // array of string names or objects
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedField, setSelectedField] = useState(initialFieldName || 'All');
  const [actorQuery, setActorQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [fieldSearchTerm, setFieldSearchTerm] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const fieldDropdownRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Sync initialFieldName when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedField(initialFieldName || 'All');
      setActorQuery('');
      setDateFilter('');
      setActionFilter('All');
      setShowFieldDropdown(false);
      setShowMoreMenu(false);
    }
  }, [isOpen, initialFieldName]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (fieldDropdownRef.current && !fieldDropdownRef.current.contains(event.target)) {
        setShowFieldDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [historyVersion, setHistoryVersion] = useState(0);

  // Listen to property history update events
  useEffect(() => {
    function handleHistoryUpdated(e) {
      if (!entityId || e?.detail?.entityId === entityId) {
        setHistoryVersion((v) => v + 1);
      }
    }
    window.addEventListener('insurmatch:history_updated', handleHistoryUpdated);
    return () => window.removeEventListener('insurmatch:history_updated', handleHistoryUpdated);
  }, [entityId]);

  // Fetch history list from service/localStorage
  const rawHistoryList = useMemo(() => {
    if (!isOpen || !entityId) return [];
    return getPropertyHistory(entityType, entityId, entityData);
  }, [isOpen, entityType, entityId, entityData, historyVersion]);

  // Build field options list
  const fieldOptions = useMemo(() => {
    const list = new Set();
    rawHistoryList.forEach((item) => {
      if (item?.fieldName) list.add(item?.fieldName);
    });
    if (Array.isArray(availableFields)) {
      availableFields.forEach((f) => {
        const name = typeof f === 'string' ? f : f.label || f.name || f.key;
        if (name) list.add(name);
      });
    }
    if (initialFieldName) list.add(initialFieldName);
    return Array.from(list).sort();
  }, [rawHistoryList, availableFields, initialFieldName]);

  // Filtered field options for search inside the dropdown
  const filteredFieldOptions = useMemo(() => {
    if (!fieldSearchTerm?.trim()) return fieldOptions;
    return fieldOptions?.filter((f) =>
      f?.toLowerCase().includes(fieldSearchTerm?.toLowerCase())
    );
  }, [fieldOptions, fieldSearchTerm]);

  // Filtered history records
  const filteredHistory = useMemo(() => {
    return rawHistoryList?.filter((item) => {
      // 1. Field name filter
      if (selectedField && selectedField !== 'All') {
        if ((item?.fieldName || '')?.toLowerCase() !== selectedField?.toLowerCase()) {
          return false;
        }
      }
      // 2. Actor filter
      if (actorQuery?.trim()) {
        const actor = (item.sourceActor || '')?.toLowerCase();
        if (!actor.includes(actorQuery?.toLowerCase())) return false;
      }
      // 3. Date filter
      if (dateFilter?.trim()) {
        const madeOn = (item.madeOn || '')?.toLowerCase();
        if (!madeOn.includes(dateFilter?.toLowerCase())) return false;
      }
      // 4. Action filter
      if (actionFilter && actionFilter !== 'All' && actionFilter !== 'Action...') {
        if ((item.action || '')?.toLowerCase() !== actionFilter?.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [rawHistoryList, selectedField, actorQuery, dateFilter, actionFilter]);

  function handleExport() {
    exportPropertyHistoryCSV(filteredHistory, `${entityType}_${entityName || entityId}`);
  }

  function handleResetFilters() {
    setSelectedField('All');
    setActorQuery('');
    setDateFilter('');
    setActionFilter('All');
    setShowMoreMenu(false);
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={`bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 border border-slate-200 my-auto ${
          isFullscreen
            ? 'fixed inset-0 w-full h-full rounded-none max-w-none max-h-none z-50'
            : 'w-full max-w-6xl max-h-[88vh]'
        }`}
      >
        {/* ── Modal Header (Navy Blue: exact match to media_1790590629171.png) ── */}
        <div className="px-4 py-2.5 bg-[#104882] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-white">edit</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              PROPERTY HISTORY
            </h3>
            {entityName && (
              <span className="text-[11px] text-blue-200 font-normal ml-2">
                — {entityName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Restore' : 'Fullscreen'}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'close_fullscreen' : 'fullscreen'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* ── Filters Bar (Matching media_1790590629171.png) ────────────── */}
        <div className="px-4 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Left filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-slate-800 text-[11px] shrink-0">Filters:</span>

            {/* Field name dropdown selector */}
            <div className="relative" ref={fieldDropdownRef}>
              <button
                type="button"
                onClick={() => setShowFieldDropdown(!showFieldDropdown)}
                className="h-8 px-2.5 rounded border border-slate-200 hover:border-slate-300 bg-white text-xs text-slate-800 flex items-center justify-between gap-2 min-w-[160px] cursor-pointer shadow-2xs font-medium"
              >
                <span className="truncate">
                  {selectedField === 'All' ? 'All Properties' : selectedField}
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">
                  expand_more
                </span>
              </button>

              {showFieldDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      autoFocus
                      value={fieldSearchTerm}
                      onChange={(e) => setFieldSearchTerm(e.target.value)}
                      placeholder="Search property..."
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedField('All');
                        setShowFieldDropdown(false);
                        setFieldSearchTerm('');
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-blue-50/70 transition cursor-pointer flex items-center justify-between ${
                        selectedField === 'All'
                          ? 'font-bold text-blue-600 bg-blue-50/50'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>All Properties</span>
                      {selectedField === 'All' && (
                        <span className="material-symbols-outlined text-[15px] text-blue-600">
                          check
                        </span>
                      )}
                    </button>
                    {filteredFieldOptions?.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedField(opt);
                          setShowFieldDropdown(false);
                          setFieldSearchTerm('');
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-blue-50/70 transition cursor-pointer flex items-center justify-between ${
                          selectedField === opt
                            ? 'font-bold text-blue-600 bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {selectedField === opt && (
                          <span className="material-symbols-outlined text-[15px] text-blue-600">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Source actor input */}
            <div className="relative">
              <input
                type="text"
                value={actorQuery}
                onChange={(e) => setActorQuery(e.target.value)}
                placeholder="Source actor..."
                className="h-8 pl-2.5 pr-7 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44 shadow-2xs"
              />
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                search
              </span>
            </div>

            {/* Made on date input */}
            <div className="relative">
              <input
                type="text"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Made on..."
                className="h-8 pl-2.5 pr-7 rounded border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-28 sm:w-36 shadow-2xs"
              />
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                calendar_today
              </span>
            </div>

            {/* Action dropdown */}
            <div className="relative">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-2xs w-28"
              >
                <option value="All">Action...</option>
                <option value="Create">Create</option>
                <option value="Update">Update</option>
                <option value="Delete">Delete</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Right actions: Export + 3-dots */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleExport}
              title="Export CSV"
              className="h-8 px-2.5 rounded border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-600">
                download
              </span>
              <span>Export</span>
            </button>

            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="h-8 w-8 rounded border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
                title="More options"
              >
                <span className="material-symbols-outlined text-[17px]">more_vert</span>
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    <span>Reset filters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExport();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    <span>Export CSV</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Table Container (Matching media_1790590629171.png) ────────── */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full border-collapse text-left text-xs min-w-[860px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">No.</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-44">Field name</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-48">Old value</th>
                <th className="py-2.5 px-3 border-r border-slate-200">New value</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-48">Source actor</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-36">Made on</th>
                <th className="py-2.5 px-3 w-28">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[32px] text-slate-300">
                        history_toggle_drop_down
                      </span>
                      <p className="text-xs font-medium">No audit history found matching filters.</p>
                      {(selectedField !== 'All' || actorQuery || dateFilter || actionFilter !== 'All') && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-1 text-blue-600 hover:underline text-xs font-semibold cursor-pointer"
                        >
                          Clear filters to view all
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory?.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* No. */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    {/* Field name */}
                    <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-800">
                      {item?.fieldName || '—'}
                    </td>

                    {/* Old value */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-500 break-words">
                      {item.oldValue ? (
                        <span>{item.oldValue}</span>
                      ) : (
                        <span className="text-slate-300 font-mono italic"></span>
                      )}
                    </td>

                    {/* New value */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-900 font-medium break-words">
                      {item.newValue || <span className="text-slate-400 italic">(Empty)</span>}
                    </td>

                    {/* Source actor */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                      {item.sourceActor || 'System'}
                    </td>

                    {/* Made on */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 whitespace-nowrap">
                      {item.madeOn || '—'}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3">
                      {item.action === 'Create' && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>Create</span>
                        </span>
                      )}
                      {item.action === 'Update' && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          <span>Update</span>
                        </span>
                      )}
                      {item.action === 'Delete' && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          <span>Delete</span>
                        </span>
                      )}
                      {!['Create', 'Update', 'Delete'].includes(item.action) && (
                        <span className="text-slate-600">{item.action || 'Update'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Status Bar ─────────────────────────────────── */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>
            Showing <strong className="text-slate-700">{filteredHistory.length}</strong> of{' '}
            <strong className="text-slate-700">{rawHistoryList.length}</strong> property history records
          </span>
          {selectedField !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedField('All')}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Show all properties
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Reusable Field Label with History Button
 * Matches exact UI in screenshot media_1790590606226.png and media_1790590615878.png
 * Only shows the history button when hovering near the field/label
 */
export function PropertyLabelWithHistory({
  label,
  fieldName,
  required = false,
  onOpenHistory,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`property-history-row group/proplabel flex items-center justify-between mb-1 ${className}`}
    >
      <label className="text-slate-700 font-semibold text-[11px] flex items-center gap-1 truncate cursor-pointer select-none">
        <span>{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </label>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onOpenHistory) {
            onOpenHistory(fieldName || label);
          }
        }}
        title={`View change history: ${label}`}
        className={`property-history-btn w-5 h-5 rounded-md bg-[#F1F5F9] hover:bg-blue-100 hover:text-blue-700 text-blue-600 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ml-1.5 shadow-2xs ${
          isHovered
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        } group-hover/proplabel:opacity-100 group-hover/proplabel:scale-100 group-hover/proplabel:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto`}
      >
        <span className="material-symbols-outlined text-[14px] leading-none hover:scale-110 transition-transform">
          history
        </span>
      </button>
    </div>
  );
}
