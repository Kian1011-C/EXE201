import React, { useState, useMemo } from 'react';
import {
  ALL_CARRIERS,
  CARRIER_COMMISSION_RATES,
  calculateCarrierDealCommission,
} from '../../../data/mockCrmData';

export default function AgentCommissionCalculator({ onClose, onApplyToDeal }) {
  // Simulator State
  const [carrier, setCarrier] = useState('BCBS');
  const [membersCount, setMembersCount] = useState(1);
  const [pipeline, setPipeline] = useState('Obamacare'); // 'Obamacare' | 'Medicare' | 'Presidio'
  const [customPremium, setCustomPremium] = useState(400);

  // Quick preset loader
  function loadPreset(preset) {
    if (preset === 'bcbs') {
      setCarrier('BCBS');
      setMembersCount(1);
      setPipeline('Obamacare');
    } else if (preset === 'ambetter-family') {
      setCarrier('Ambetter');
      setMembersCount(4);
      setPipeline('Obamacare');
    } else if (preset === 'blueshield') {
      setCarrier('Blue Shield of California');
      setMembersCount(2);
      setPipeline('Obamacare');
    } else if (preset === 'humana-medicare') {
      setCarrier('Humana');
      setMembersCount(1);
      setPipeline('Medicare');
    } else if (preset === 'uhc') {
      setCarrier('UnitedHealthcare');
      setMembersCount(2);
      setPipeline('Obamacare');
    }
  }

  // Core Calculation Engine: 100% Agent Payout (No 7/3 split)
  const calculation = useMemo(() => {
    let dealComm;

    if (pipeline === 'Medicare' || carrier.toLowerCase().includes('humana')) {
      dealComm = calculateCarrierDealCommission('Humana', 1);
    } else if (pipeline === 'Presidio') {
      const gross = customPremium * 0.15;
      dealComm = {
        carrierName: 'Presidio 1099 Health',
        carrierCode: 'PRESIDIO',
        category: '1099 Direct',
        pmpmRate: 0,
        rateType: 'Percentage',
        membersCount: 1,
        monthlyCarrierPayout: gross,
        platformDeduction: 0,
        agentPayoutRate: 100,
        agentNetMonthly: gross,
        agentAnnualProjected: gross * 12,
        formula: `15% × $${customPremium} Premium → Agent nhận 100% = $${gross.toFixed(2)}/tháng`,
      };
    } else {
      dealComm = calculateCarrierDealCommission(carrier, membersCount);
    }

    const carrierMeta = CARRIER_COMMISSION_RATES[carrier] || CARRIER_COMMISSION_RATES['BCBS'];

    return {
      ...dealComm,
      carrierMeta,
      grossMonthly: dealComm.monthlyCarrierPayout,
      netMonthly: dealComm.agentNetMonthly,
      netAnnual: dealComm.agentAnnualProjected,
      supportFeeAmount: 0.0,
      deductionPercent: 0.0, // 0% deduction, NO 7/3
      agentSharePercent: 100, // 100%
      ruleCitation: 'Chính sách mới: Agent nhận 100% hoa hồng trực tiếp từ hãng (0% chiết khấu sàn/support). InsurMatch chỉ thu phí gói phần mềm CRM.',
    };
  }, [carrier, membersCount, pipeline, customPremium]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-w-4xl w-full text-left">
      {/* ── Modal / Widget Header ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[24px]">calculate</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                Bộ Tính Hoa Hồng 1 Deal Theo Hãng Bảo Hiểm
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 uppercase">
                100% Agent Payout
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Tự động tính chi trả mỗi tháng của từng hãng • Đại lý nhận trọn 100% (Không áp dụng phân chia 7/3)
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* ── Quick Presets Bar ────────────────────────────────────────────── */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-bold text-slate-500 text-[11px] shrink-0 uppercase tracking-wide">
          Chọn nhanh mẫu deal:
        </span>
        <button
          type="button"
          onClick={() => loadPreset('bcbs')}
          className={`px-2.5 py-1 rounded font-medium shrink-0 transition cursor-pointer ${
            carrier === 'BCBS' && membersCount === 1
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
          }`}
        >
          BCBS (1 người - $30/mo)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('ambetter-family')}
          className={`px-2.5 py-1 rounded font-medium shrink-0 transition cursor-pointer ${
            carrier === 'Ambetter' && membersCount === 4
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
          }`}
        >
          Ambetter (Gia đình 4 người - $128/mo)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('blueshield')}
          className={`px-2.5 py-1 rounded font-medium shrink-0 transition cursor-pointer ${
            carrier === 'Blue Shield of California'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
          }`}
        >
          Blue Shield CA (2 người - $70/mo)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('uhc')}
          className={`px-2.5 py-1 rounded font-medium shrink-0 transition cursor-pointer ${
            carrier === 'UnitedHealthcare'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
          }`}
        >
          UHC (2 người - $60/mo)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('humana-medicare')}
          className={`px-2.5 py-1 rounded font-medium shrink-0 transition cursor-pointer ${
            carrier === 'Humana'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
          }`}
        >
          Humana Medicare ($51/mo CMS)
        </button>
      </div>

      {/* ── Body: Form + Real-time Outcome ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-y-auto max-h-[75vh]">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 p-5 space-y-4">
          {/* 1. Chọn Hãng Bảo Hiểm */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              1. Chọn Hãng Bảo Hiểm (Carrier) &amp; Biểu Phí Hãng Trả
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              {ALL_CARRIERS.map((cName) => {
                const meta = CARRIER_COMMISSION_RATES[cName] || { pmpm: 30.0, rateType: 'PMPM' };
                const rateText = meta.rateType === 'CMS Monthly' ? '$51.00/tháng (CMS)' : `$${meta.pmpm.toFixed(2)} PMPM`;
                return (
                  <option key={cName} value={cName}>
                    {cName} • Mức trả: {rateText}
                  </option>
                );
              })}
            </select>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>Hãng đã chọn: <strong className="text-blue-700">{calculation.carrierName}</strong></span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Định mức: ${calculation.pmpmRate.toFixed(2)} {calculation.rateType === 'CMS Monthly' ? '/tháng' : 'PMPM'}
              </span>
            </div>
          </div>

          {/* 2. Dòng sản phẩm */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              2. Dòng Sản Phẩm Bảo Hiểm (Product Line)
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPipeline('Obamacare')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold cursor-pointer ${
                  pipeline === 'Obamacare'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Obamacare / ACA
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                  ${calculation.pmpmRate} PMPM
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPipeline('Medicare');
                  setCarrier('Humana');
                }}
                className={`p-2.5 rounded-xl border text-center transition font-semibold cursor-pointer ${
                  pipeline === 'Medicare'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Medicare Initial
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                  $51/tháng ($612 CMS)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPipeline('Presidio')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold cursor-pointer ${
                  pipeline === 'Presidio'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                1099 Presidio
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">15% Premium</span>
              </button>
            </div>
          </div>

          {/* 3. Số người trong Deal */}
          {pipeline !== 'Presidio' && pipeline !== 'Medicare' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  3. Số Thành Viên Trong Hợp Đồng (Deal Members)
                </label>
                <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {membersCount} thành viên
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={membersCount}
                onChange={(e) => setMembersCount(parseInt(e.target.value) || 1)}
                className="w-full accent-blue-600 cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 người (Cá nhân)</span>
                <span>2 người (Vợ chồng)</span>
                <span>4 người (Gia đình chuẩn)</span>
                <span>6+ người</span>
              </div>
            </div>
          )}

          {pipeline === 'Presidio' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Phí bảo hiểm hàng tháng ($ Premium)
              </label>
              <input
                type="number"
                value={customPremium}
                onChange={(e) => setCustomPremium(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* 4. Thông báo chính sách 100% Agent Payout */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              <span className="text-xs font-bold text-emerald-950">Chính Sách 100% Hoa Hồng - Không Cắt Phế</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Theo quy định mới, đại lý hưởng <strong>100%</strong> toàn bộ số tiền hãng bảo hiểm chi trả cho mỗi deal (<strong>0% phí khấu trừ sàn 7/3</strong>). Tiền hoa hồng được hãng chuyển khoản trực tiếp (Direct Deposit) về tài khoản của bạn.
            </p>
          </div>
        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-[#F8FAFC] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Tỷ Lệ Đại Lý Hưởng
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                  100% TOÀN BỘ
                </span>
              </div>

              {/* Deduction Indicator: 100% Agent, 0% Company */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Phần đại lý giữ:</span>
                  <span className="text-emerald-600 font-bold font-mono">100% ($0 khấu trừ)</span>
                </div>
                <div className="w-full h-2 bg-emerald-500 rounded-full" />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Đại lý: 100%</span>
                  <span>Phí sàn / Support: 0%</span>
                </div>
              </div>
            </div>

            {/* Payout Numbers Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between">
                <span>Thu Nhập Cho 1 Deal Này</span>
                <span className="text-[10px] text-blue-600 font-bold">{carrier}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Hãng ({carrier}) chi trả / tháng:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${calculation.grossMonthly.toFixed(2)}/tháng
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono -mt-1">{calculation.formula}</div>

                <div className="flex justify-between text-slate-500">
                  <span>Khấu trừ phí sàn (0%):</span>
                  <span className="font-mono font-semibold text-emerald-600">$0.00</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Agent Thực Nhận / Tháng:</span>
                  <span className="font-mono font-black text-2xl text-blue-700">
                    ${calculation.netMonthly.toFixed(2)}
                    <span className="text-xs text-slate-500 font-normal"> / mo</span>
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-bold">Thu Nhập 1 Năm (12 tháng):</span>
                  <span className="font-mono font-black text-blue-950 text-base">
                    ${calculation.netAnnual.toLocaleString('en-US', { minimumFractionDigits: 2 })} / năm
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/80 text-[11px] space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="material-symbols-outlined text-[15px] text-blue-600">info</span>
                <span>Quy chuẩn thanh toán:</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Hãng chi trả vào ngày 15 hàng tháng qua ACH Direct Deposit trực tiếp vào tài khoản ngân hàng của đại lý theo NPN #1984210.
              </p>
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
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Áp dụng mức hoa hồng này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
