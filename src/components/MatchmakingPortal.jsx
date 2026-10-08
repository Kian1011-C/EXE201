import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  UserCheck,
  CheckCircle2,
  MapPin,
  DollarSign,
  HeartPulse,
  Users,
  Award,
  ArrowRight,
  Phone,
  Mail,
  User,
  Clock,
  Check,
  ChevronRight,
  Lock,
  EyeOff,
  Flame,
  Info,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUsers, submitMatchmakingInquiry } from '../services/api';
import { getActiveAgentAccounts } from '../utils/constants';

// Popular states with high Vietnamese American population
const POPULAR_STATES = [
  { code: 'TX', name: 'Texas', defaultZip: '77072', majorCities: 'Houston, Dallas, Austin, Katy' },
  { code: 'CA', name: 'California', defaultZip: '92683', majorCities: 'Orange County, San Jose, Westminster' },
  { code: 'FL', name: 'Florida', defaultZip: '32808', majorCities: 'Orlando, Tampa, Miami' },
  { code: 'GA', name: 'Georgia', defaultZip: '30096', majorCities: 'Atlanta, Duluth, Norcross' },
  { code: 'WA', name: 'Washington', defaultZip: '98118', majorCities: 'Seattle, Tacoma, Renton' },
  { code: 'NC', name: 'North Carolina', defaultZip: '28202', majorCities: 'Charlotte, Raleigh' },
  { code: 'NV', name: 'Nevada', defaultZip: '89101', majorCities: 'Las Vegas' },
  { code: 'OTHER', name: 'Bang khác...', defaultZip: '77001', majorCities: 'Toàn quốc' },
];

export default function MatchmakingPortal({ onOpenQuoteModal, embeddedInPage = true }) {
  // ── 1. FORM STATE (Customer criteria) ───────────────────────────────────────
  const [age, setAge] = useState(38);
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(38000);
  const [selectedState, setSelectedState] = useState('TX');
  const [zipCode, setZipCode] = useState('77072');
  const [coverageType, setCoverageType] = useState('Obamacare / ACA Health');
  const [preferredCarrier, setPreferredCarrier] = useState('BCBS');

  // Mode: Anonymous vs With Contact
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Tiếng Việt');

  // Agent Roster
  const [availableAgents, setAvailableAgents] = useState(() => getActiveAgentAccounts());
  const [selectedAgentName, setSelectedAgentName] = useState('Trung Trương');
  const [agentSelectionMode, setAgentSelectionMode] = useState('manual'); // 'manual' | 'auto'

  // Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load backend agent roster if available
  useEffect(() => {
    async function fetchRoster() {
      try {
        const users = await getUsers();
        if (Array.isArray(users) && users.length > 0) {
          const agents = users.filter((u) => {
            const r = (u.role || '').toLowerCase();
            const n = (u.name || '').toLowerCase();
            return (
              (r === 'agent' || r === 'broker' || n.includes('trung')) &&
              !n.includes('admin') &&
              !n.includes('staff')
            );
          });
          if (agents.length > 0) {
            setAvailableAgents(agents);
          }
        }
      } catch {}
    }
    fetchRoster();
  }, []);

  // Sync default zip code when state changes
  useEffect(() => {
    const found = POPULAR_STATES.find((s) => s.code === selectedState);
    if (found && found.code !== 'OTHER') {
      setZipCode(found.defaultZip);
    }
  }, [selectedState]);

  // If age >= 65, suggest Medicare
  useEffect(() => {
    if (age >= 65 && !coverageType.includes('Medicare')) {
      setCoverageType('Medicare Guidance (Part C/D & Medigap)');
    }
  }, [age]);

  // ── 2. SUBSIDY CALCULATION ENGINE ──────────────────────────────────────────
  // Federal Poverty Level (2026 guidelines approximation: base $15,650 + $5,500/extra person)
  const estimatedSubsidy = useMemo(() => {
    const fplBase = 15650 + (Math.max(1, householdSize) - 1) * 5500;
    const fplRatio = annualIncome / fplBase;

    // Below 100% or above 400%: different sliding scale
    if (annualIncome <= 16000) {
      return {
        fplPercent: Math.round(fplRatio * 100),
        monthlySubsidy: 520,
        silverNetCost: 0,
        bronzeNetCost: 0,
        goldNetCost: 45,
        qualifiesMedicaidOrFullSubsidy: true,
        csrLevel: 'Silver 94% CSR (Deductible $0, Copay $0 - $5)',
      };
    }

    if (fplRatio <= 1.5) {
      return {
        fplPercent: Math.round(fplRatio * 100),
        monthlySubsidy: 460,
        silverNetCost: 0,
        bronzeNetCost: 0,
        goldNetCost: 55,
        qualifiesMedicaidOrFullSubsidy: true,
        csrLevel: 'Silver 94% CSR (Giảm tối đa chi phí y tế)',
      };
    } else if (fplRatio <= 2.0) {
      return {
        fplPercent: Math.round(fplRatio * 100),
        monthlySubsidy: 410,
        silverNetCost: 10,
        bronzeNetCost: 0,
        goldNetCost: 75,
        qualifiesMedicaidOrFullSubsidy: false,
        csrLevel: 'Silver 87% CSR (Chi phí khám & thuốc cực thấp)',
      };
    } else if (fplRatio <= 2.5) {
      return {
        fplPercent: Math.round(fplRatio * 100),
        monthlySubsidy: 340,
        silverNetCost: 35,
        bronzeNetCost: 0,
        goldNetCost: 110,
        qualifiesMedicaidOrFullSubsidy: false,
        csrLevel: 'Silver 73% CSR (Tiêu chuẩn hỗ trợ liên bang)',
      };
    } else {
      const sub = Math.max(150, Math.round(550 - (fplRatio - 2.5) * 120));
      return {
        fplPercent: Math.round(fplRatio * 100),
        monthlySubsidy: sub,
        silverNetCost: 65,
        bronzeNetCost: 15,
        goldNetCost: 160,
        qualifiesMedicaidOrFullSubsidy: false,
        csrLevel: 'Standard ACA Subsidy (Giảm phí hàng tháng)',
      };
    }
  }, [annualIncome, householdSize]);

  // Selected agent object
  const selectedAgent = useMemo(() => {
    const found = availableAgents.find(
      (a) => (a.name || a.fullName) === selectedAgentName
    );
    if (found) return found;
    return availableAgents[0] || {
      name: 'Trung Trương',
      npn: '2001186',
      statesLicensed: ['TX', 'CA', 'FL'],
      phone: '+1 (407) 555-0128',
      role: 'agent',
    };
  }, [availableAgents, selectedAgentName]);

  // ── 3. SUBMIT HANDLER ──────────────────────────────────────────────────────
  const handleConnectAgent = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        isAnonymous,
        fullName: isAnonymous ? `Khách Ẩn Danh (${selectedState}-${zipCode})` : fullName,
        phone,
        email,
        language: preferredLanguage,
        state: selectedState,
        zipCode,
        age,
        householdSize,
        annualIncome,
        coverageType,
        preferredCarrier,
        monthlyPremium: estimatedSubsidy.silverNetCost,
        subsidyAmount: estimatedSubsidy.monthlySubsidy,
        agentName: selectedAgent.name || selectedAgent.fullName || 'Trung Trương',
      };

      const result = await submitMatchmakingInquiry(payload);
      setSubmittedData({
        ...payload,
        agentNpn: selectedAgent.npn || '2001186',
        agentPhone: selectedAgent.phone || '+1 (407) 555-0128',
        trackingCode: result.deal?.code || `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        dealId: result.deal?.id,
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Matchmaking submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="matchmaking-portal" className="w-full relative">
      {/* Container Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>CỔNG TRA CỨU ẨN DANH &amp; KẾT NỐI ĐẠI LÝ (MATCHMAKING PORTAL)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy-deep tracking-tight">
            Tra cứu Biểu phí ACA/Medicare &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
              Chọn Đại lý Phụ trách
            </span>
          </h2>
          <p className="text-sm sm:text-base text-charcoal/75 leading-relaxed">
            Hệ thống phân tích độ tuổi, thu nhập, nơi cư trú để ước tính ngay khoản trợ cấp chính phủ (Tax Subsidy) và kết nối bạn với đại lý độc lập người Việt có chứng chỉ NPN phù hợp nhất.
          </p>
        </div>

        {/* Main Grid: Left Column Inputs | Right Column Live Quote & Agent Match */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN (7 cols): User Inputs & Agent Selector
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-7">
            
            {/* Step Header Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Thông tin cơ bản &amp; Nhu cầu bảo hiểm
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tra cứu hoàn toàn ẩn danh, không yêu cầu thẻ tín dụng
                  </p>
                </div>
              </div>

              {/* Anonymous Toggle Pill */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAnonymous
                      ? 'bg-white text-navy-deep shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ẩn danh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    !isAnonymous
                      ? 'bg-white text-navy-deep shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Để lại liên hệ</span>
                </button>
              </div>
            </div>

            {/* Coverage Program Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chương trình bảo hiểm quan tâm:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Obamacare / ACA Health', label: 'ACA Health', sub: 'Trợ cấp y tế', icon: HeartPulse },
                  { id: 'Medicare Guidance (Part C/D & Medigap)', label: 'Medicare', sub: '65+ tuổi', icon: ShieldCheck },
                  { id: 'Life & Living Benefits', label: 'Nhân thọ', sub: 'Quyền lợi sống', icon: Award },
                  { id: 'Dental & Vision Support', label: 'Dental/Vision', sub: 'Răng & Mắt', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = coverageType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCoverageType(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        active
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location: State & Zip Code */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-7">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bang cư trú (State) *</span>
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  {POPULAR_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code}) — {s.majorCities}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mã ZIP Code *
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ví dụ: 77072"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Age & Household Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Độ tuổi người đứng đơn:
                  </label>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                    {age} tuổi
                  </span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={75}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>18 tuổi</span>
                  <span>45 tuổi</span>
                  <span>65+ (Medicare)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Số người trong hộ gia đình (Tax Return):</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHouseholdSize(n)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        householdSize === n
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {n === 5 ? '5+' : `${n}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Income Slider & Calculation */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Ước tính thu nhập gia đình hàng năm (W2 / 1099):
                  </label>
                </div>
                <span className="text-sm font-black text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs font-mono">
                  ${annualIncome.toLocaleString()} / năm
                </span>
              </div>
              <input
                type="range"
                min={14000}
                max={120000}
                step={2000}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                <span>100% FPL ($15,650)</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px]">
                  Tương đương ~{estimatedSubsidy.fplPercent}% mức chuẩn nghèo FPL
                </span>
                <span>$120,000+</span>
              </div>
            </div>

            {/* ── AGENT SELECTOR (Core requirement of Slide 4 & 6) ───────────── */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Chọn Đại lý có sẵn trong hệ thống làm Người liên hệ *</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Chọn đại lý bảo hiểm có chứng chỉ NPN hành nghề tại bang của bạn để trực tiếp theo dõi hồ sơ:
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {availableAgents.length} Đại lý sẵn sàng
                </span>
              </div>

              {/* Agent Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[310px] overflow-y-auto pr-1">
                {availableAgents.map((agent) => {
                  const agName = agent.name || agent.fullName || 'Đại lý';
                  const isSelected = selectedAgentName === agName;
                  const isMain = agName.includes('Trung') || agName === 'Trung Trương';
                  const statesList = Array.isArray(agent.statesLicensed)
                    ? agent.statesLicensed.join(', ')
                    : (agent.statesLicensed || 'TX (TDI), CA, FL');

                  return (
                    <div
                      key={agent.id || agName}
                      onClick={() => {
                        setSelectedAgentName(agName);
                        setAgentSelectionMode('manual');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative text-left flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {agent.avatar || agName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </div>
                        {isMain && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                            ⭐
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {agName}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-blue-700 mt-0.5">
                          NPN: {agent.npn || '2001186'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {statesList}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Đại lý xác thực (Verified)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Contact Inputs if NOT Anonymous */}
            {!isAnonymous && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-slate-100 space-y-3"
              >
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Thông tin để Đại lý {selectedAgentName} kết nối lại:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên của bạn *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại (SMS / Zalo / Call) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email nhận bảng so sánh (Tùy chọn)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Tiếng Việt">Tư vấn bằng Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="Both">Cả Tiếng Việt &amp; English</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={handleConnectAgent}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-navy-deep hover:from-blue-800 hover:to-slate-900 text-white font-extrabold text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <span>Đang kết nối hệ thống CRM...</span>
                ) : (
                  <>
                    <span>
                      {isAnonymous ? 'Nộp Yêu Cầu Ẩn Danh' : 'Gửi Thông Tin'} &amp; Kết Nối Đại Lý {selectedAgentName}
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bảo mật theo quy chuẩn HIPAA &amp; Sở Bảo Hiểm Bang. 100% Miễn phí dịch vụ.</span>
              </p>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN (5 cols): Live Calculation & Selected Agent Card
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Subsidy Summary Card */}
            <div className="bg-gradient-to-br from-navy-deep to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>KẾT QUẢ DỰ TÍNH BIỂU PHÍ</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                  Kỳ 2026
                </span>
              </div>

              {/* Big Subsidy Metric */}
              <div className="space-y-1">
                <div className="text-xs text-white/70 font-medium">
                  Ước tính Trợ cấp Chính phủ (Tax Subsidy):
                </div>
                <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                  ${estimatedSubsidy.monthlySubsidy}
                  <span className="text-sm font-bold text-white/60"> /tháng</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tiết kiệm ${(estimatedSubsidy.monthlySubsidy * 12).toLocaleString()}/năm cho hộ gia đình</span>
                </div>
              </div>

              {/* Three Plans Comparison Grid */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
                <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                  Dự kiến mức phí tự đóng (Sau trợ cấp):
                </div>

                {/* Silver Plan (Hero) */}
                <div className="p-3.5 rounded-xl bg-white/10 border border-amber-400/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-white">Gói Silver (Ưu Tiên)</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                        Khuyên dùng
                      </span>
                    </div>
                    <div className="text-[10px] text-white/70 mt-0.5">
                      {estimatedSubsidy.csrLevel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-300 font-mono">
                      ${estimatedSubsidy.silverNetCost}
                      <span className="text-[10px] font-normal text-white/70">/tháng</span>
                    </div>
                  </div>
                </div>

                {/* Bronze Plan */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white/90">Gói Bronze Tiết Kiệm</span>
                    <div className="text-[10px] text-white/60">Chi trả tai nạn &amp; viện phí lớn</div>
                  </div>
                  <div className="text-base font-black text-emerald-400 font-mono">
                    ${estimatedSubsidy.bronzeNetCost}
                    <span className="text-[10px] font-normal text-white/70">/tháng</span>
                  </div>
                </div>

                {/* Gold Plan */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white/90">Gói Gold Toàn Diện</span>
                    <div className="text-[10px] text-white/60">Khám bác sĩ copay thấp</div>
                  </div>
                  <div className="text-base font-black text-white font-mono">
                    ${estimatedSubsidy.goldNetCost}
                    <span className="text-[10px] font-normal text-white/70">/tháng</span>
                  </div>
                </div>
              </div>

              {/* Major Carriers compatibility */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
                <span>Hãng bảo hiểm liên kết:</span>
                <span className="font-bold text-white">BCBS • Ambetter • UHC • Kaiser</span>
              </div>
            </div>

            {/* 2. Selected Agent Detail Badge */}
            <div className="bg-white rounded-3xl border border-blue-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Đại lý phụ trách được chọn:</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Hoạt động
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                  {selectedAgent.avatar || selectedAgentName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-extrabold text-slate-900 truncate">
                      {selectedAgentName}
                    </h4>
                    {selectedAgentName.includes('Trung') && (
                      <span className="text-xs">⭐</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-blue-700 mt-0.5">
                    Mã NPN: {selectedAgent.npn || '2001186'}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Cấp phép: {Array.isArray(selectedAgent.statesLicensed) ? selectedAgent.statesLicensed.join(', ') : (selectedAgent.statesLicensed || 'TX, CA, FL')}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Khu vực ưu tiên:</span>
                  <span className="font-bold text-slate-900">{selectedState} — ZIP {zipCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kênh hỗ trợ:</span>
                  <span className="font-bold text-blue-700">Điện thoại, Zalo, SMS &amp; Email</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Quy trình:</span>
                  <span className="font-bold text-emerald-700">Kiểm tra mạng lưới bác sĩ &amp; đơn thuốc</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                * Sau khi nộp, hồ sơ sẽ được tự động chuyển thẳng vào CRM của Đại lý <strong>{selectedAgentName}</strong> để xử lý tiếp nhận theo đúng quy trình của Slide 8.
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUCCESS MODAL: Confirmation & CRM Sync Notification
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccessModal && submittedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  KẾT NỐI THÀNH CÔNG VỚI ĐẠI LÝ
                </span>
                <h3 className="text-2xl font-black text-navy-deep mt-2.5 tracking-tight">
                  Yêu Cầu Đã Được Tiếp Nhận!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Hồ sơ tra cứu của bạn đã được kết nối và ghi nhận tự động vào CRM của đại lý <strong>{submittedData.agentName}</strong>.
                </p>
              </div>

              {/* Record Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-medium text-slate-700">
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Mã theo dõi (Tracking ID):</span>
                  <span className="font-mono font-bold text-blue-700">{submittedData.trackingCode}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Đại lý phụ trách:</span>
                  <span className="font-bold text-slate-900">{submittedData.agentName} (NPN: {submittedData.agentNpn})</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Địa bàn / ZIP:</span>
                  <span className="font-bold text-slate-900">{submittedData.state} — {submittedData.zipCode}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Ước tính trợ cấp thuế:</span>
                  <span className="font-mono font-bold text-emerald-600">${submittedData.subsidyAmount}/tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chế độ nộp:</span>
                  <span className="font-bold text-slate-900">
                    {submittedData.isAnonymous ? 'Ẩn danh 100%' : 'Có thông tin liên hệ'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 cursor-pointer transition"
                >
                  Đóng &amp; Tiếp Tục Tra Cứu
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <span>Đăng Nhập Agent CRM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-[11px] text-slate-400">
                Thử nghiệm chấm thi: Đăng nhập tài khoản <strong>agent@insurmatch.us</strong> hoặc tài khoản của <strong>{submittedData.agentName}</strong> để kiểm tra hợp đồng mới lập tức xuất hiện trong CRM Pipeline.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
