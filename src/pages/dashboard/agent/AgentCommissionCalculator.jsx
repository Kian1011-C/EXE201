import React, { useState, useMemo } from 'react';

export default function AgentCommissionCalculator({ onClose, onApplyToDeal }) {
  // Simulator State
  const [pipeline, setPipeline] = useState('Obamacare'); // 'Obamacare' | 'MedicareInitial' | 'MedicareRenewal' | 'Presidio'
  const [quoteBy, setQuoteBy] = useState('Agent'); // 'Agent' | 'Support'
  const [enrollBy, setEnrollBy] = useState('Agent'); // 'Agent' | 'Support'
  const [territory, setTerritory] = useState('InState'); // 'InState' | 'OutOfState'
  const [isNewAgent, setIsNewAgent] = useState(false);
  const [membersCount, setMembersCount] = useState(1);
  const [carrier, setCarrier] = useState('BCBS');
  const [customPremium, setCustomPremium] = useState(400);

  // Quick preset loader
  function loadPreset(preset) {
    if (preset === 'solo') {
      setPipeline('Obamacare');
      setQuoteBy('Agent');
      setEnrollBy('Agent');
      setTerritory('InState');
      setIsNewAgent(false);
      setMembersCount(1);
      setCarrier('BCBS');
    } else if (preset === 'family-support') {
      setPipeline('Obamacare');
      setQuoteBy('Agent');
      setEnrollBy('Support');
      setTerritory('InState');
      setIsNewAgent(false);
      setMembersCount(4);
      setCarrier('UnitedHealthcare');
    } else if (preset === 'new-agent') {
      setPipeline('Obamacare');
      setQuoteBy('Agent');
      setEnrollBy('Support');
      setTerritory('InState');
      setIsNewAgent(true);
      setMembersCount(2);
      setCarrier('Ambetter');
    } else if (preset === 'medicare') {
      setPipeline('MedicareInitial');
      setQuoteBy('Agent');
      setEnrollBy('Agent');
      setTerritory('InState');
      setIsNewAgent(false);
      setMembersCount(1);
      setCarrier('Humana');
    } else if (preset === 'outofstate') {
      setPipeline('Obamacare');
      setQuoteBy('Support');
      setEnrollBy('Support');
      setTerritory('OutOfState');
      setIsNewAgent(false);
      setMembersCount(2);
      setCarrier('Blue Shield of CA');
    }
  }

  // Core SSS & Commission Calculation Engine (SOP grounded)
  const calculation = useMemo(() => {
    // 1. Determine Base Gross Payout
    let grossMonthly = 0;
    let rateLabel = '';

    if (pipeline === 'Obamacare') {
      const pmpm = 30.0; // Standard ACA $30 PMPM
      grossMonthly = pmpm * membersCount;
      rateLabel = `$${pmpm.toFixed(2)} PMPM × ${membersCount} member(s)`;
    } else if (pipeline === 'MedicareInitial') {
      grossMonthly = 51.0; // CMS Initial: $612 / 12 = $51/mo
      rateLabel = '$51.00 / mo ($612.00 CMS Initial Year)';
    } else if (pipeline === 'MedicareRenewal') {
      grossMonthly = 25.5; // CMS Renewal: $306 / 12 = $25.50/mo
      rateLabel = '$25.50 / mo ($306.00 CMS Renewal Year)';
    } else if (pipeline === 'Presidio') {
      grossMonthly = customPremium * 0.15; // 15% tier
      rateLabel = `15% of $${customPremium} Premium`;
    }

    // 2. Determine SSS (Sale Support Status)
    let sss = 'NONE';
    let deductionPercent = 0.0;
    let ruleCitation = '';
    let npnNote = '';

    if (quoteBy === 'Agent' && enrollBy === 'Agent') {
      sss = 'NONE';
      deductionPercent = 0.0;
      ruleCitation = 'Rule 1: Agent Quotes + Agent Enrolls → SSS = NONE (0% Support Deduction)';
    } else if (quoteBy === 'Agent' && enrollBy === 'Support') {
      sss = 'PARTIAL';
      deductionPercent = 0.40;
      ruleCitation = 'Rule 2: Agent Quotes + Company Support Enrolls → SSS = PARTIAL (40% TBR Support Fee)';
    } else if (quoteBy === 'Support' && enrollBy === 'Support') {
      sss = 'FULL';
      deductionPercent = 0.75;
      ruleCitation = 'Rule 3: Company Quotes + Company Support Enrolls → SSS = FULL (75% TBR Support Fee)';
    } else if (quoteBy === 'Support' && enrollBy === 'Agent') {
      sss = 'PARTIAL';
      deductionPercent = 0.40;
      ruleCitation = 'Rule 4: Support Quote Hand-off → SSS = PARTIAL (40% TBR Support Fee)';
    }

    // Territory & NPN Master Override (Anh Que Pham NPN 20011862)
    if (territory === 'OutOfState') {
      npnNote = 'Out-of-State: Written under Company Master NPN #20011862 (Anh Que Pham). TBR collects carrier clearinghouse payout and transfers net to Agent.';
    } else {
      npnNote = 'In-State: Written under Licensed Agent NPN (#1984210). Direct deposit from clearinghouse.';
    }

    // New Agent Grace Override
    let graceApplied = false;
    if (isNewAgent && deductionPercent > 0) {
      graceApplied = true;
      deductionPercent = 0.0;
      ruleCitation = 'New Agent Grace Privilege: Agent with ≤ 3 months tenure or < 20 health sales qualifies for 100% net commission (0% fee override)!';
    }

    // Financial breakdown
    const supportFeeAmount = grossMonthly * deductionPercent;
    const netMonthly = grossMonthly - supportFeeAmount;
    const netAnnual = netMonthly * 12;

    return {
      grossMonthly,
      rateLabel,
      sss,
      deductionPercent: deductionPercent * 100,
      supportFeeAmount,
      netMonthly,
      netAnnual,
      ruleCitation,
      npnNote,
      graceApplied,
    };
  }, [pipeline, quoteBy, enrollBy, territory, isNewAgent, membersCount, customPremium]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-w-4xl w-full">
      {/* ── Modal / Widget Header ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[24px]">calculate</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Agent Commission &amp; SSS Rules Engine</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                SOP Standard
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate exact payout formulas: NONE, PARTIAL, FULL based on quote, enrollment &amp; carrier terms.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Quick Presets ────────────────────────────────────────────────── */}
      <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-medium shrink-0">Presets:</span>
        <button
          type="button"
          onClick={() => loadPreset('solo')}
          className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 font-medium shrink-0 transition"
        >
          Solo ACA (100% Agent)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('family-support')}
          className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 font-medium shrink-0 transition"
        >
          Family of 4 (Support Enroll)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('new-agent')}
          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium shrink-0 transition"
        >
          New Agent Grace
        </button>
        <button
          type="button"
          onClick={() => loadPreset('medicare')}
          className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 font-medium shrink-0 transition"
        >
          Medicare Initial
        </button>
        <button
          type="button"
          onClick={() => loadPreset('outofstate')}
          className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 font-medium shrink-0 transition"
        >
          Out-of-State Master NPN
        </button>
      </div>

      {/* ── Body: Form + Real-time Outcome ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-y-auto max-h-[75vh]">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 p-5 space-y-4">
          {/* 1. Line of Business */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              1. Policy Line &amp; Carrier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPipeline('Obamacare')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  pipeline === 'Obamacare'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Obamacare / ACA
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">$30 PMPM</span>
              </button>
              <button
                type="button"
                onClick={() => setPipeline('MedicareInitial')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  pipeline === 'MedicareInitial'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Medicare Initial
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">$612/yr CMS</span>
              </button>
              <button
                type="button"
                onClick={() => setPipeline('MedicareRenewal')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  pipeline === 'MedicareRenewal'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Medicare Renewal
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">$306/yr CMS</span>
              </button>
              <button
                type="button"
                onClick={() => setPipeline('Presidio')}
                className={`p-2.5 rounded-lg border text-center transition font-semibold ${
                  pipeline === 'Presidio'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                1099 Presidio
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">15% Tier</span>
              </button>
            </div>
          </div>

          {/* Members / Premium Input */}
          <div className="grid grid-cols-2 gap-3">
            {pipeline === 'Obamacare' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Enrolled Members (Count)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={membersCount}
                    onChange={(e) => setMembersCount(parseInt(e.target.value))}
                    className="flex-grow accent-blue-600 cursor-pointer"
                  />
                  <span className="w-10 text-center font-bold text-sm bg-slate-100 rounded py-1 border border-slate-200">
                    {membersCount}
                  </span>
                </div>
              </div>
            ) : pipeline === 'Presidio' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Monthly Premium ($)
                </label>
                <input
                  type="number"
                  value={customPremium}
                  onChange={(e) => setCustomPremium(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none"
                >
                  <option value="Humana">Humana Medicare</option>
                  <option value="UHC">UnitedHealthcare Medicare</option>
                  <option value="Aetna">Aetna Medicare Advantage</option>
                  <option value="Cigna">Cigna Healthcare</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Territory</label>
              <select
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none"
              >
                <option value="InState">In-State (Licensed State - TX/CA/NC)</option>
                <option value="OutOfState">Out-of-State (Under Master NPN #20011862)</option>
              </select>
            </div>
          </div>

          {/* 2. Responsibilities (Who quotes, Who enrolls) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>2. Workflow Responsibility Split (Determines SSS)</span>
              <span className="text-[11px] font-normal text-slate-500">SOP Rule §2.1</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Who generated Quote?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuoteBy('Agent')}
                    className={`py-1.5 px-2 rounded border text-center font-medium transition ${
                      quoteBy === 'Agent'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Agent (Me)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteBy('Support')}
                    className={`py-1.5 px-2 rounded border text-center font-medium transition ${
                      quoteBy === 'Support'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    TBR Support
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Who submitted Enrollment?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEnrollBy('Agent')}
                    className={`py-1.5 px-2 rounded border text-center font-medium transition ${
                      enrollBy === 'Agent'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Agent (Me)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnrollBy('Support')}
                    className={`py-1.5 px-2 rounded border text-center font-medium transition ${
                      enrollBy === 'Support'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    TBR Support
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. New Agent Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">school</span>
              <div>
                <div className="text-xs font-bold text-emerald-950">New Agent Privilege (3-Month Grace)</div>
                <div className="text-[11px] text-emerald-700">
                  First 20 deals or tenure ≤ 3 months receive 100% agent commission (0% TBR deduction).
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isNewAgent}
                onChange={(e) => setIsNewAgent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-[#F8FAFC] flex flex-col justify-between">
          <div className="space-y-4">
            {/* SSS Status Badge Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Sale Support Status (SSS)
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border tracking-wide uppercase ${
                    calculation.sss.includes('NONE')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : calculation.sss === 'PARTIAL'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  SSS: {calculation.sss}
                </span>
              </div>

              {/* Deduction Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>TBR Support Deduction:</span>
                  <span className={calculation.deductionPercent > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {calculation.deductionPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${100 - calculation.deductionPercent}%` }}
                    title="Agent Share"
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${calculation.deductionPercent}%` }}
                    title="Support Fee Share"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Agent: {100 - calculation.deductionPercent}%</span>
                  <span>Company: {calculation.deductionPercent}%</span>
                </div>
              </div>
            </div>

            {/* Payout Numbers Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                Financial Statement Payout
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Carrier Payout:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${calculation.grossMonthly.toFixed(2)}/mo
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono -mt-1">{calculation.rateLabel}</div>

                {calculation.supportFeeAmount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>- Support Service Fee ({calculation.deductionPercent}%):</span>
                    <span className="font-mono font-semibold">
                      -${calculation.supportFeeAmount.toFixed(2)}/mo
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Agent Net Commission:</span>
                  <span className="font-mono font-black text-xl text-blue-700">
                    ${calculation.netMonthly.toFixed(2)}
                    <span className="text-xs text-slate-500 font-normal"> / mo</span>
                  </span>
                </div>

                <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-semibold">12-Month Projected:</span>
                  <span className="font-mono font-black text-blue-950 text-sm">
                    ${calculation.netAnnual.toLocaleString('en-US', { minimumFractionDigits: 2 })} / yr
                  </span>
                </div>
              </div>
            </div>

            {/* Rule Citation & SOP grounding */}
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/80 text-[11px] space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-blue-600">verified</span>
                <span>Grounding: {calculation.ruleCitation}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{calculation.npnNote}</p>
            </div>
          </div>

          {/* Action bottom button */}
          <div className="pt-4 border-t border-slate-200 mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onApplyToDeal) {
                  onApplyToDeal(calculation);
                } else if (onClose) {
                  onClose();
                }
              }}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Apply SSS Standard to Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
