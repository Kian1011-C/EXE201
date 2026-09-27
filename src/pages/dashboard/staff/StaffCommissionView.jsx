import React, { useState, useMemo } from 'react';

export default function StaffCommissionView({ onSelectDeal, onSelectContact }) {
  // ── SAAS REVENUE & INTERNAL SALES COMMS STATE (Matching Coms.pdf Page 6, 11-12, 15) ──
  const [starterCount, setStarterCount] = useState(20);
  const [proCount, setProCount] = useState(15);
  const [agencyCount, setAgencyCount] = useState(5);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  const saasFinancials = useMemo(() => {
    const starterRev = starterCount * 39;
    const proRev = proCount * 79;
    const agencyRev = agencyCount * 199;
    const totalMRR = starterRev + proRev + agencyRev;
    const totalARR = totalMRR * 12;

    // Sales commission rates per Coms.pdf Page 12
    const starterComm = starterCount * 3.90; // 10%
    const proComm = proCount * 9.48; // 12%
    const agencyComm = agencyCount * 29.85; // 15%
    const totalSalesComm = starterComm + proComm + agencyComm;
    const netRevenue = totalMRR - totalSalesComm;
    const fixedInfraCost = 350;
    const estimatedNetProfit = netRevenue - fixedInfraCost;

    return {
      starterRev,
      proRev,
      agencyRev,
      totalMRR,
      totalARR,
      starterComm,
      proComm,
      agencyComm,
      totalSalesComm,
      netRevenue,
      fixedInfraCost,
      estimatedNetProfit,
      totalSubscribers: starterCount + proCount + agencyCount,
    };
  }, [starterCount, proCount, agencyCount]);

  // Sample SaaS Agency Subscribers List (Coms.pdf)
  const subscribersList = [
    { id: 'SUB-101', name: 'John Miller Insurance', agent: 'John Miller', plan: 'Professional', price: 79, users: 3, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-102', name: 'Nguyen Financial & Health', agent: 'Khanh Nguyen', plan: 'Agency', price: 199, users: 8, billing: 'Annual', status: 'Active', salesRep: 'Sarah Tran', commPaid: 29.85 },
    { id: 'SUB-103', name: 'Bellaire Senior Care Solutions', agent: 'Sean Ngo', plan: 'Professional', price: 79, users: 2, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-104', name: 'Lone Star Benefits Group', agent: 'Anh Que Pham', plan: 'Agency', price: 199, users: 10, billing: 'Annual', status: 'Active', salesRep: 'Direct / Founder', commPaid: 0.00 },
    { id: 'SUB-105', name: 'Carol Davis Independent Practice', agent: 'Carol Davis', plan: 'Starter', price: 39, users: 1, billing: 'Monthly', status: 'Active', salesRep: 'Sarah Tran', commPaid: 3.90 },
    { id: 'SUB-106', name: 'Austin Marketplace Advisors', agent: 'Michael Chen', plan: 'Starter', price: 39, users: 1, billing: 'Monthly', status: 'Trial (Day 8)', salesRep: 'Inbound Web', commPaid: 0.00 },
    { id: 'SUB-107', name: 'Sunbelt Medicare Specialists', agent: 'Nancy Pham', plan: 'Professional', price: 79, users: 3, billing: 'Monthly', status: 'Active', salesRep: 'David Pham', commPaid: 9.48 },
    { id: 'SUB-108', name: 'Valley Health Benefits', agent: 'Robert Taylor', plan: 'Professional', price: 79, users: 2, billing: 'Monthly', status: 'Active', salesRep: 'Sarah Tran', commPaid: 9.48 },
  ];

  const filteredSubscribers = useMemo(() => {
    return subscribersList.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        sub.name.toLowerCase().includes(q) ||
        sub.agent.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q) ||
        sub.salesRep.toLowerCase().includes(q);

      const matchPlan = planFilter === 'all' || sub.plan.toLowerCase() === planFilter.toLowerCase();
      return matchSearch && matchPlan;
    });
  }, [subscribersList, searchQuery, planFilter]);

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] overflow-y-auto">
      {/* ── Top Header Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>InsurMatch Revenue &amp; Commission Hub</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  B2B SaaS Business Model
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Theo dõi định kỳ doanh thu thuê bao phần mềm (MRR/ARR) &amp; hoa hồng chi trả cho Sales nội bộ theo Coms.pdf.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('Đã làm mới dữ liệu doanh thu & hoa hồng!')}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-fade-in-up bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Operational Overview Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Bản đề án Coms.pdf
              </span>
              <span className="text-xs text-blue-200">Cơ chế tạo ra dòng tiền của website</span>
            </div>
            <h2 className="text-base font-bold">Mô hình Doanh thu Thuê bao SaaS &amp; Hoa hồng Sales nội bộ</h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              InsurMatch tạo doanh thu từ việc bán phần mềm CRM cho các đại lý bảo hiểm độc lập với 3 gói cước: 
              <strong> Starter ($39)</strong>, <strong>Professional ($79)</strong> và <strong>Agency ($199/tháng)</strong>. 
              Nhân viên kinh doanh (Sales Rep) nhận thưởng hoa hồng trực tiếp trên mỗi hợp đồng thuê bao ký mới 
              (<strong>$3.90</strong>, <strong>$9.48</strong>, <strong>$29.85/khách hàng</strong>).
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-300 font-bold">Quy mô Mục tiêu</div>
              <div className="text-xl font-black text-amber-300 font-mono">{saasFinancials.totalSubscribers} Khách hàng</div>
            </div>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total MRR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh thu tháng (MRR)</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">domain</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ${saasFinancials.totalMRR.toLocaleString()}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold">Chỉ tiêu Giai đoạn 1</span>
              <span>• {saasFinancials.totalSubscribers} văn phòng</span>
            </div>
          </div>

          {/* Card 2: Total ARR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh thu năm (ARR)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              ${saasFinancials.totalARR.toLocaleString()}/yr
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold">+15%</span>
              <span>Tùy chọn thanh toán năm</span>
            </div>
          </div>

          {/* Card 3: Internal Sales Rep Commission */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Hoa hồng đội ngũ Sales</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">badge</span>
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
              ${saasFinancials.totalSalesComm.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2">
              <span>Thưởng 10% - 15% cho nhân viên chốt agency</span>
            </div>
          </div>

          {/* Card 4: Net Software Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh thu thuần InsurMatch</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
              ${saasFinancials.netRevenue.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-purple-600 font-bold font-mono">${saasFinancials.estimatedNetProfit.toFixed(0)}</span>
              <span>lợi nhuận ước tính sau phí máy chủ</span>
            </div>
          </div>
        </div>

        {/* Interactive Package Pricing Simulator (Coms.pdf Page 11-12) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
                <span>Công cụ Mô phỏng Doanh thu Gói &amp; Hoa hồng Sales</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thanh trượt điều chỉnh số lượng khách hàng của 3 gói để giả lập dòng tiền MRR và mức chi trả hoa hồng tương ứng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStarterCount(20);
                setProCount(15);
                setAgencyCount(5);
                showToast('Đã khôi phục mức tiêu chuẩn 40 khách hàng!');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto cursor-pointer"
            >
              Mặc định Đề án (40 khách hàng)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Tier 1: Starter */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">Gói Starter</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">$39 / tháng</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">1 User • 500 Khách hàng • Pipeline tiêu chuẩn</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Số lượng thuê bao:</span>
                  <span className="font-mono text-blue-600 font-bold">{starterCount} khách</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={starterCount}
                  onChange={(e) => setStarterCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Doanh thu MRR</span>
                  <strong className="text-slate-900 font-mono">${saasFinancials.starterRev.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Hoa hồng Sales ($3.90/khách)</span>
                  <strong className="text-amber-600 font-mono">${saasFinancials.starterComm.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Tier 2: Professional */}
            <div className="p-4 rounded-xl border-2 border-blue-500/50 bg-blue-50/20 flex flex-col justify-between relative">
              <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Mục tiêu Trọng tâm
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">Gói Professional</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">$79 / tháng</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Tối đa 3 Users • 2.500 Khách hàng • Tự động hóa tác vụ</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Số lượng thuê bao:</span>
                  <span className="font-mono text-blue-600 font-bold">{proCount} khách</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={proCount}
                  onChange={(e) => setProCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Doanh thu MRR</span>
                  <strong className="text-slate-900 font-mono">${saasFinancials.proRev.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Hoa hồng Sales ($9.48/khách)</span>
                  <strong className="text-amber-600 font-mono">${saasFinancials.proComm.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Tier 3: Agency */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">Gói Agency</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">$199 / tháng</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Tối đa 10 Users • Không giới hạn • Phân quyền &amp; API riêng</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Số lượng thuê bao:</span>
                  <span className="font-mono text-indigo-600 font-bold">{agencyCount} khách</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={agencyCount}
                  onChange={(e) => setAgencyCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Doanh thu MRR</span>
                  <strong className="text-slate-900 font-mono">${saasFinancials.agencyRev.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Hoa hồng Sales ($29.85/khách)</span>
                  <strong className="text-amber-600 font-mono">${saasFinancials.agencyComm.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active SaaS Subscribers & Rep Attribution Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Danh sách Thuê bao Agency &amp; Bảng kê Hoa hồng Sales Rep
              </h3>
              <p className="text-[11px] text-slate-500">
                Chi tiết các văn phòng bảo hiểm đang sử dụng phần mềm và mức hoa hồng trả cho nhân viên kinh doanh.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm agency, agent, sales..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
              >
                <option value="all">Tất cả gói</option>
                <option value="starter">Starter ($39)</option>
                <option value="professional">Professional ($79)</option>
                <option value="agency">Agency ($199)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Mã Hợp đồng</th>
                  <th className="py-2.5 px-4">Văn phòng / Đại lý</th>
                  <th className="py-2.5 px-4">Đại lý Phụ trách</th>
                  <th className="py-2.5 px-4">Gói SaaS</th>
                  <th className="py-2.5 px-4">Đơn giá</th>
                  <th className="py-2.5 px-4">Trạng thái</th>
                  <th className="py-2.5 px-4">Nhân viên Sales</th>
                  <th className="py-2.5 px-4 text-right">Hoa hồng Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sub.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-4 text-slate-600">{sub.agent}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.plan === 'Starter'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : sub.plan === 'Professional'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {sub.plan} ({sub.users} seats)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">${sub.price}/mo</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status.includes('Active')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sub.salesRep}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                      ${sub.commPaid.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
