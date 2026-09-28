import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  OBAMACARE_DEAL_STAGES,
  MEDICARE_DEAL_STAGES,
  addDealToStore,
  addTicketToStore,
  getDynamicDeals,
  SAMPLE_DEALS,
} from '../../../data/mockCrmData';
import { createTicket } from '../../../services/api';
import { useAuth } from '../../../auth/AuthContext';
import { getCurrentActor, getPropertyHistory } from '../../../services/propertyHistoryService';

const OWNER_OPTIONS = [
  '--',
  'Tiger Truong',
  'Khanh Nguyen',
  'Jay Ly',
  'Anya Nguyen',
  'The Best Rate Insurance',
  'Platform Staff',
];

export default function AddDealModal({
  isOpen,
  onClose,
  initialContactName = '',
  initialContactId = '',
  membersList = [],
  onDealCreated,
}) {
  const { user } = useAuth();
  const currentActor = getCurrentActor(user);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'existing'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Form states matching media_1790575726166.png
  const [dealName, setDealName] = useState('');
  const [pipeline, setPipeline] = useState('--');
  const [stage, setStage] = useState('--');
  const [dealOwner, setDealOwner] = useState('--');
  const [contactName, setContactName] = useState(initialContactName || 'Hai Nguyen');
  const [member, setMember] = useState('--');
  const [carrier, setCarrier] = useState('BCBS');
  const [sellingState, setSellingState] = useState('North Carolina (NC)');
  const [needUpload, setNeedUpload] = useState('No');

  // Existing deals search state for "Add existing" tab
  const [searchExisting, setSearchExisting] = useState('');

  // Sync initial contact when opened
  useEffect(() => {
    if (isOpen) {
      setContactName(initialContactName || 'Hai Nguyen');
      setDealName('');
      setPipeline('--');
      setStage('--');
      setDealOwner('--');
      setMember('--');
      setNeedUpload('No');
    }
  }, [isOpen, initialContactName]);

  if (!isOpen) return null;

  // Compute available stages based on pipeline
  const availableStages = pipeline.includes('Medicare')
    ? MEDICARE_DEAL_STAGES
    : OBAMACARE_DEAL_STAGES;

  function handleSubmit(e) {
    e.preventDefault();
    const finalTitle = dealName.trim() || `${contactName} - ${pipeline}`;
    const newCode = `D2600${Math.floor(5000 + Math.random() * 900)}`;

    const newDeal = {
      id: newCode,
      code: newCode,
      title: finalTitle,
      shortTitle: finalTitle.length > 25 ? finalTitle.slice(0, 25) + '...' : finalTitle,
      pipeline: pipeline === '--' ? 'Obamacare 2026' : pipeline,
      stage: stage === '--' ? 'Ready to Enroll (Obamacare 2026)' : stage,
      stageBadge: stage.includes('Ready') ? 'Ready to Enroll' : (stage === '--' ? 'Ready to Enroll' : stage.slice(0, 15)),
      stageColor: 'bg-blue-50 text-blue-700 border-blue-200',
      carrier: carrier,
      planName: '',
      amount: '_ _ _ _ _ _ _ _ _ _',
      closeDate: '_ _ _ _ _ _ _ _ _ _',
      sellingState: sellingState,
      contactName: contactName,
      contactId: initialContactId || 'CT26002600',
      member: member === '--' ? contactName : member,
      uploadRequest: needUpload === 'Yes',
      needUpload: needUpload,
      dealOwner: {
        name: dealOwner === '--' ? 'Khanh Nguyen' : dealOwner,
        avatar: (dealOwner === '--' ? 'KN' : dealOwner.slice(0, 2)).toUpperCase(),
        bg: 'bg-blue-600 text-white',
      },
      lastModifiedBy: {
        name: 'Anya Nguyen',
        avatar: 'AN',
        bg: 'bg-teal-600 text-white',
      },
      lastModifiedTime: 'Just now',
      adminOnly: {
        enrolledNpn: '',
        brokerEffectiveDate: '',
        terminationDate: '',
        leadOwner: dealOwner === '--' ? '' : dealOwner,
        dealOwner: dealOwner === '--' ? '' : dealOwner,
        code: newCode,
        primaryMemberId: '',
        saleSupportStatus: 'None',
        numberMember: '',
        sellingState: sellingState === '--' ? '' : sellingState,
        carrier: carrier === '--' ? '' : carrier,
        closedLostReason: '---',
      },
      enrolledAddress: '',
      applicationId: '',
      estimateHouseholdIncome: '',
      householdMember: '',
      numberMember: '',
      quotedCounty: '',
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'Deal Created',
          time: new Date().toLocaleString(),
          actor: 'Platform Staff',
          summary: `Created deal: ${finalTitle}`,
        },
      ],
      notes: [],
      tasks: [],
      associatedTickets: [],
    };

    let generatedTicket = null;

    // Quy trình: Nếu Need upload = Yes -> tự động xuất ticket upload documents
    if (needUpload === 'Yes') {
      generatedTicket = {
        id: `TC2600${Math.floor(1000 + Math.random() * 9000)}`,
        code: `TC2600${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Upload documents - ${finalTitle}`,
        pipeline: 'Upload document',
        stage: 'Waiting on verification',
        status: 'Open',
        priority: 'High',
        category: 'Upload Document',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
        ticketOwner: dealOwner === '--' ? 'Khanh Nguyen' : dealOwner,
        serviceAgent: 'Platform Staff',
        contactName: contactName,
        contactId: initialContactId || 'CT26002600',
        dealId: newCode,
        dealTitle: finalTitle,
        carrier: carrier,
        createdAt: new Date().toISOString(),
        activities: [],
        comments: [],
      };
      createTicket(generatedTicket).catch(() => {});
      addTicketToStore(generatedTicket);
      newDeal.associatedTickets = [generatedTicket];
    }

    addDealToStore(newDeal);

    // Initialize real property history with current actor
    getPropertyHistory('deal', newCode, newDeal, currentActor);

    if (onDealCreated) {
      onDealCreated(newDeal, generatedTicket);
    }
    onClose();
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 animate-fade-in overflow-y-auto">
      <div
        className={`bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-scale-in my-auto ${
          isFullscreen
            ? 'fixed inset-0 rounded-none w-screen h-screen'
            : 'rounded-xl border border-slate-200 w-full max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* ── 1. Top Header Banner (Exact match to media_1790575726166.png: #183968) ── */}
        <div className="bg-[#183968] px-4 py-3 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-white">edit</span>
            <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white">
              ADD DEAL
            </h2>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              className="hover:text-white p-1 rounded transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">
                {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="hover:text-white p-1 rounded transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>
        </div>

        {/* ── 2. Tab Bar: "Create new" | "Add existing" ── */}
        <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-6 text-xs select-none">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 py-3 font-semibold transition cursor-pointer border-b-2 ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
            <span>Create new</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`flex items-center gap-1.5 py-3 font-semibold transition cursor-pointer border-b-2 ${
              activeTab === 'existing'
                ? 'border-blue-600 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">input</span>
            <span>Add existing</span>
          </button>
        </div>

        {/* ── 3. Tab Body ── */}
        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {/* Field 1: Name * (Full width with pencil icon) */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="--"
                  className="w-full px-3 py-2 pr-9 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                />
                <span className="material-symbols-outlined absolute right-2.5 text-[15px] text-slate-400 pointer-events-none">
                  edit
                </span>
              </div>
            </div>

            {/* Row 2: Pipeline * & Stage * */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pipeline */}
              <div>
                <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                  Pipeline <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={pipeline}
                    onChange={(e) => {
                      const pl = e.target.value;
                      setPipeline(pl);
                      setStage(pl.includes('Medicare') ? MEDICARE_DEAL_STAGES[0] : (pl === '--' ? '--' : OBAMACARE_DEAL_STAGES[0]));
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="--">--</option>
                    <option value="Obamacare 2026">Obamacare 2026</option>
                    <option value="Medicare 2026">Medicare 2026</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                  Stage <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="--">--</option>
                    {availableStages.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Deal Owner * */}
            <div>
              <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                Deal Owner <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={dealOwner}
                  onChange={(e) => setDealOwner(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  {OWNER_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Row 4: Contact * & Member * */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact */}
              <div>
                <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                  Contact <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Hai Nguyen"
                    className="w-full px-3 py-2 pr-9 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 text-[15px] text-slate-400 pointer-events-none">
                    edit
                  </span>
                </div>
              </div>

              {/* Member */}
              <div>
                <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                  Member <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={member}
                    onChange={(e) => setMember(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="--">--</option>
                    <option value={`${contactName} (Self)`}>{contactName} (Self)</option>
                    {membersList.map((m) => (
                      <option key={m.id || m.name} value={`${m.name} (${m.relation || 'Member'})`}>
                        {m.name} ({m.relation || 'Member'})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Row 5: Section "Associate Deal with" */}
            <div className="pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 mb-2">Associate Deal with</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Carrier */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Carrier <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-xs font-semibold text-blue-700 cursor-pointer shadow-2xs"
                  >
                    <option value="BCBS">BCBS</option>
                    <option value="Ambetter">Ambetter</option>
                    <option value="UnitedHealthcare">UnitedHealthcare</option>
                    <option value="Oscar">Oscar</option>
                    <option value="Molina Healthcare">Molina Healthcare</option>
                    <option value="Kaiser Permanente">Kaiser Permanente</option>
                    <option value="Aetna">Aetna</option>
                    <option value="Cigna">Cigna</option>
                  </select>
                </div>

                {/* Selling State */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Selling State <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    value={sellingState}
                    onChange={(e) => setSellingState(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-xs cursor-pointer shadow-2xs"
                  >
                    <option value="North Carolina (NC)">North Carolina (NC)</option>
                    <option value="Texas (TX)">Texas (TX)</option>
                    <option value="California (CA)">California (CA)</option>
                    <option value="Georgia (GA)">Georgia (GA)</option>
                    <option value="Florida (FL)">Florida (FL)</option>
                  </select>
                </div>

                {/* Need Upload (Quy trình: Yes -> xuất ticket upload, No -> không xuất) */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1 text-[11px] flex items-center justify-between">
                    <span>Need Upload <span className="text-rose-500 font-bold">*</span></span>
                    {needUpload === 'Yes' && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300">
                        ⚡ Xuất Ticket
                      </span>
                    )}
                  </label>
                  <select
                    value={needUpload}
                    onChange={(e) => setNeedUpload(e.target.value)}
                    className={`w-full px-3 py-2 rounded border text-xs font-semibold cursor-pointer transition shadow-2xs ${
                      needUpload === 'Yes'
                        ? 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30'
                        : 'border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <option value="No">No (Không xuất ticket)</option>
                    <option value="Yes">Yes (Tự động xuất ticket Upload doc)</option>
                  </select>
                </div>
              </div>

              {/* Feedback explanation for Need Upload */}
              <p className="text-[11px] text-slate-500 mt-1.5">
                {needUpload === 'Yes'
                  ? '⚡ Khi chọn Yes: Hệ thống sẽ tự động xuất 1 Ticket "Upload documents" trong pipeline Upload document.'
                  : '✓ Không xuất ticket upload tài liệu.'}
              </p>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded bg-[#183968] hover:bg-[#122b50] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Deal</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: "Add existing" */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            <div>
              <label className="block text-slate-800 font-semibold mb-1 text-[11px]">
                Search Existing Deals
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchExisting}
                  onChange={(e) => setSearchExisting(e.target.value)}
                  placeholder="Search by deal title, code, or carrier..."
                  className="w-full px-3 py-2 pl-9 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
                  search
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {[...getDynamicDeals(), ...SAMPLE_DEALS]
                .filter((d) =>
                  !searchExisting ||
                  (d.title && d.title.toLowerCase().includes(searchExisting.toLowerCase())) ||
                  (d.code && d.code.toLowerCase().includes(searchExisting.toLowerCase()))
                )
                .slice(0, 10)
                .map((d) => (
                  <div
                    key={d.id || d.code}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => {
                      const linkedDeal = {
                        ...d,
                        contactName: contactName,
                        member: member,
                      };
                      if (onDealCreated) onDealCreated(linkedDeal, null);
                      onClose();
                    }}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{d.title || d.code}</div>
                      <div className="text-[11px] text-slate-500">
                        {d.pipeline} • {d.carrier} • Stage: {d.stage}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      <span>Link</span>
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
