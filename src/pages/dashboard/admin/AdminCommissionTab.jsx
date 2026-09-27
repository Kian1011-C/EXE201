import React, { useState, useMemo } from 'react';

export default function AdminCommissionTab({
  commissions = [],
  accounts = [],
  onRefresh,
}) {
  // ── SAAS REVENUE & INTERNAL SALES COMMS STATE (Matching Coms.pdf Page 6, 11-12, 15) ──
  const [starterCount, setStarterCount] = useState(20);
  const [proCount, setProCount] = useState(15);
  const [agencyCount, setAgencyCount] = useState(5);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // Financial calculations based on Coms.pdf Page 11
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

    // Estimated MVP Infrastructure fixed costs per Coms.pdf Page 15 (~$350/mo avg)
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

  // Sample SaaS Subscribers List
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

  function handleResetBaseline() {
    setStarterCount(20);
    setProCount(15);
    setAgencyCount(5);
    setToastMessage('Đã thiết lập lại chỉ tiêu 40 khách hàng chuẩn (Coms.pdf)');
    setTimeout(() => setToastMessage(''), 4000);
  }

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:underline cursor-pointer">
            Đóng
          </button>
        </div>
      )}

      {/* ── Main SaaS Revenue View ────────────────────────────────────────── */}
      <div className="space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>B2B SaaS Revenue &amp; Internal Sales Commission Ledger</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                Coms.pdf Model
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mô hình tạo doanh thu định kỳ của InsurMatch: 3 gói thuê bao CRM ($39, $79, $199) và hoa hồng chi trả cho Sales Rep ($3.90, $9.48, $29.85/khách).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">restart_alt</span>
              <span>Mặc định 40 khách</span>
            </button>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Làm mới</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Financial Stat Cards (Coms.pdf Page 11) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: MRR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh thu tháng (MRR)</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">domain</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ${saasFinancials.totalMRR.toLocaleString()}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold font-mono">100% Thuê bao CRM</span>
              <span>({saasFinancials.totalSubscribers} khách hàng)</span>
            </div>
          </div>

          {/* Card 2: ARR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh thu năm (ARR)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              ${saasFinancials.totalARR.toLocaleString()}/yr
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold font-mono">Run Rate</span>
              <span>dự phóng 12 tháng</span>
            </div>
          </div>

          {/* Card 3: Sales Rep Commission */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Hoa hồng đội ngũ Sales</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
              ${saasFinancials.totalSalesComm.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium mt-2">
              <span>Thưởng chốt hợp đồng (10% - 15%)</span>
            </div>
          </div>

          {/* Card 4: Net Software Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh thu thuần InsurMatch</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
              ${saasFinancials.netRevenue.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
              <span className="text-purple-600 font-bold font-mono">${saasFinancials.estimatedNetProfit.toFixed(0)}</span>
              <span>lợi nhuận sau phí hạ tầng (~$350)</span>
            </div>
          </div>
        </div>

        {/* Pricing Packages Breakdown & Interactive Simulator (Coms.pdf Page 11) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
                <span>Bộ Mô phỏng Cơ cấu Gói cước &amp; Dòng tiền Định kỳ (Coms.pdf)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thanh trượt để thử nghiệm quy mô thuê bao của 3 gói: Starter ($39), Professional ($79), Agency ($199).
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Tổng số đại lý: <strong className="text-blue-700 font-mono">{saasFinancials.totalSubscribers}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter Plan Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Gói Starter</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    $39 / tháng
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">1 Seat • 500 Hồ sơ • Pipeline tiêu chuẩn</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Khách hàng:</span>
                  <span className="font-mono text-blue-600 font-bold">{starterCount} agencies</span>
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
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh thu MRR</span>
                  <strong className="text-slate-900 font-mono text-sm">${saasFinancials.starterRev.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Hoa hồng Sales ($3.90)</span>
                  <strong className="text-amber-600 font-mono text-sm">${saasFinancials.starterComm.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Professional Plan Card */}
            <div className="p-4 rounded-xl border-2 border-blue-500/50 bg-blue-50/20 flex flex-col justify-between relative">
              <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Mục tiêu Đề án (15 clients)
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Gói Professional</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    $79 / tháng
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Tối đa 3 Seats • 2.500 Hồ sơ • Tự động hóa tác vụ</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Khách hàng:</span>
                  <span className="font-mono text-blue-600 font-bold">{proCount} agencies</span>
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
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh thu MRR</span>
                  <strong className="text-slate-900 font-mono text-sm">${saasFinancials.proRev.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Hoa hồng Sales ($9.48)</span>
                  <strong className="text-amber-600 font-mono text-sm">${saasFinancials.proComm.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Agency Plan Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Gói Agency</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    $199 / tháng
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Tối đa 10 Seats • Không giới hạn • Phân quyền &amp; API</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Khách hàng:</span>
                  <span className="font-mono text-indigo-600 font-bold">{agencyCount} agencies</span>
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
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Doanh thu MRR</span>
                  <strong className="text-slate-900 font-mono text-sm">${saasFinancials.agencyRev.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Hoa hồng Sales ($29.85)</span>
                  <strong className="text-amber-600 font-mono text-sm">${saasFinancials.agencyComm.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscribers Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bảng Kê Hợp Đồng Thuê Bao &amp; Quyết Toán Hoa Hồng Sales Rep
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Danh sách văn phòng bảo hiểm đang sử dụng dịch vụ và hoa hồng trả cho nhân viên sales mang khách về.
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
                  <th className="py-2.5 px-4">Mã Thuê Bao</th>
                  <th className="py-2.5 px-4">Văn Phòng / Đại Lý</th>
                  <th className="py-2.5 px-4">Đại Lý Trưởng</th>
                  <th className="py-2.5 px-4">Gói CRM</th>
                  <th className="py-2.5 px-4">Đơn Giá</th>
                  <th className="py-2.5 px-4">Chu Kỳ</th>
                  <th className="py-2.5 px-4">Trạng Thái</th>
                  <th className="py-2.5 px-4">Sales Rep</th>
                  <th className="py-2.5 px-4 text-right">Hoa Hồng Trả Sales</th>
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
                    <td className="py-3 px-4 text-slate-600">{sub.billing}</td>
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
