// designs/checkout-page/checkout-artboards.jsx
// Three high-fidelity checkout variations for InsurMatch B2B SaaS CRM
// Exports to window: SwissCleanCheckout, DarkFintechCheckout, WizardCheckout

const { useState, useEffect, useRef } = React;

// Shared Mock Plans & Bank Config
const CHECKOUT_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    audience: 'Cá nhân đại lý độc lập (Solopreneur)',
    monthlyVnd: 990000,
    annualVnd: 9900000,
    monthlyUsd: 39,
    annualUsd: 32,
    contacts: 100,
    seats: 1,
    storage: '2 GB',
    badge: 'Tiết kiệm',
    features: ['1 User Seat', '100 Hồ sơ ACA/Medicare', 'Turning 65 Alerts', 'Email Support']
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    audience: 'Đội nhóm đại lý phát triển (Small Team)',
    monthlyVnd: 1990000,
    annualVnd: 19900000,
    monthlyUsd: 79,
    annualUsd: 65,
    contacts: 200,
    seats: 3,
    storage: '25 GB',
    badge: 'Phổ biến nhất',
    features: ['3 Team Seats', '200 Hồ sơ ACA/Medicare', 'SLA 48h Reminders', 'Bảng đối soát hoa hồng 100%']
  },
  agency: {
    id: 'agency',
    name: 'Agency Enterprise Plan',
    audience: 'Văn phòng tổng đại lý (Multi-Agent Agency)',
    monthlyVnd: 4990000,
    annualVnd: 49900000,
    monthlyUsd: 199,
    annualUsd: 165,
    contacts: 300,
    seats: 10,
    storage: '100 GB',
    badge: 'Doanh nghiệp',
    features: ['10 Seats Quản trị', '300 Hồ sơ Khách hàng', 'Lead Auto-routing', 'Master Commission Ledger']
  }
};

const BANK_INFO = {
  bankName: 'MB Bank (Ngân Hàng Quân Đội)',
  bin: '970422',
  accountNumber: '0838780005',
  accountName: 'THE BEST RATE INSURANCE',
};

// =========================================================================
// VARIATION 1: Swiss B2B SaaS Clean (Clean 2-Column Enterprise Layout)
// =========================================================================
function SwissCleanCheckout() {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [cycle, setCycle] = useState('annual'); // 'monthly' | 'annual'
  const [paymentMethod, setPaymentMethod] = useState('payos'); // 'payos' | 'card' | 'vat'
  const [copiedField, setCopiedField] = useState(null);
  const [countdown, setCountdown] = useState(895);
  const [isPaid, setIsPaid] = useState(false);
  const [vatRequested, setVatRequested] = useState(false);

  const plan = CHECKOUT_PLANS[selectedPlan];
  const amountVnd = cycle === 'annual' ? plan.annualVnd : plan.monthlyVnd;
  const orderCode = '8829104';
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?amount=${amountVnd}&addInfo=IM%20${selectedPlan.toUpperCase()}%20${orderCode}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const copy = (val, label) => {
    if (navigator.clipboard) navigator.clipboard.writeText(String(val));
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-[1020px] bg-[#FAF9F5] text-slate-800 font-sans p-7 select-none">
      {/* Top Breadcrumb & Brand */}
      <div className="flex items-center justify-between pb-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
            IM
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              InsurMatch B2B SaaS Checkout
            </h1>
            <p className="text-xs text-slate-500">
              Trang thanh toán chính thức • Hóa đơn &amp; Cổng VietQR Napas 24/7 PayOS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Bảo Mật SSL 256-bit • Napas 24/7
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-12 gap-7 mt-6 items-start">
        {/* Left: Order Summary & Plan Config */}
        <div className="col-span-5 space-y-5">
          {/* Plan Selector */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Gói Dịch Vụ SaaS
              </span>
              {/* Billing Cycle Toggle */}
              <div className="inline-flex p-0.5 bg-stone-100 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCycle('monthly')}
                  className={`px-2.5 py-1 rounded-md transition ${cycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('annual')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${cycle === 'annual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  <span>Năm</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">-2 Tháng</span>
                </button>
              </div>
            </div>

            {/* Plan Cards List */}
            <div className="space-y-2">
              {Object.keys(CHECKOUT_PLANS).map((k) => {
                const item = CHECKOUT_PLANS[k];
                const active = selectedPlan === k;
                const price = cycle === 'annual' ? item.annualVnd : item.monthlyVnd;
                return (
                  <div
                    key={k}
                    onClick={() => setSelectedPlan(k)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      active
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500/30'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-600' : 'border-stone-300'}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-stone-200 text-slate-700">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {item.seats} Seat • {item.contacts} Contacts • {item.storage}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">
                        {Number(price).toLocaleString('vi-VN')} đ
                      </div>
                      <span className="text-[10px] text-slate-400">/{cycle === 'annual' ? 'năm' : 'tháng'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quota & Feature Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-3.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Quyền Lợi &amp; Hạn Mức Gói
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">HỒ SƠ KHÁCH</span>
                <span className="text-sm font-black text-slate-900">{plan.contacts} Contacts</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">CHỖ NGỒI (SEATS)</span>
                <span className="text-sm font-black text-slate-900">{plan.seats} Seat</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block">DUNG LƯỢNG SSD</span>
                <span className="text-sm font-black text-slate-900">{plan.storage}</span>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
              <li className="flex items-center gap-1.5 text-blue-700 font-medium">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Kích hoạt tự động sau 1–3s qua Webhook PayOS</span>
              </li>
            </ul>

            {/* Price Summary Row */}
            <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Đơn giá gói ({cycle === 'annual' ? 'Năm' : 'Tháng'}):</span>
                <span>{Number(amountVnd).toLocaleString('vi-VN')} đ</span>
              </div>
              {cycle === 'annual' && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Khuyến mãi trả theo năm (Tiết kiệm 2 tháng):</span>
                  <span>-{Number((selectedPlan === 'starter' ? 990000 : selectedPlan === 'professional' ? 1990000 : 4990000) * 2).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Thuế GTGT / Phí cổng thanh toán:</span>
                <span className="text-emerald-600 font-semibold">Miễn phí 0đ</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-stone-200">
                <span>TỔNG THANH TOÁN:</span>
                <span className="text-blue-600 text-base">{Number(amountVnd).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Method & QR Display */}
        <div className="col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm space-y-5">
            {/* Payment Method Switcher */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                3. Phương Thức Thanh Toán
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('payos')}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    paymentMethod === 'payos'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      QR
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">VietQR Napas 24/7</strong>
                      <span className="text-[10px] text-slate-500">Qua cổng PayOS tự động 1–3s</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Khuyên dùng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">Thẻ Quốc Tế</strong>
                      <span className="text-[10px] text-slate-500">Visa, MasterCard, JCB, Amex</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* PayOS VietQR Details View */}
            {paymentMethod === 'payos' && (
              <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200 space-y-4">
                {isPaid ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-2xl flex items-center justify-center mx-auto shadow-sm">
                      ✓
                    </div>
                    <h3 className="text-base font-black text-emerald-950">Thanh Toán Hoàn Tất!</h3>
                    <p className="text-xs text-emerald-800">
                      Gói <strong>{plan.name}</strong> đã được kích hoạt thành công trên tài khoản InsurMatch của bạn.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Quét mã VietQR bằng App Ngân Hàng để kích hoạt ngay</span>
                      </div>
                      <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-stone-200 font-bold">
                        ⏱ {formatTime(countdown)}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-5 items-center">
                      {/* Dynamic QR */}
                      <div className="col-span-5 flex flex-col items-center">
                        <div className="w-44 h-44 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center">
                          <img src={qrUrl} alt="VietQR" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] text-slate-500 text-center mt-2">
                          Mở App ngân hàng (MB, VCB, Techcombank, VPBank,...) quét mã
                        </span>
                      </div>

                      {/* Bank Fields */}
                      <div className="col-span-7 space-y-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">NGÂN HÀNG THỤ HƯỞNG</span>
                            <span className="font-bold text-slate-900">{BANK_INFO.bankName}</span>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">Napas 247</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">SỐ TÀI KHOẢN</span>
                            <span className="font-mono text-sm font-black text-slate-900">{BANK_INFO.accountNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copy(BANK_INFO.accountNumber, 'stk')}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-slate-700"
                          >
                            {copiedField === 'stk' ? '✓ Đã chép' : 'Copy STK'}
                          </button>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">SỐ TIỀN CẦN CHUYỂN</span>
                            <span className="font-mono text-sm font-black text-emerald-700">
                              {Number(amountVnd).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copy(amountVnd, 'amount')}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-slate-700"
                          >
                            {copiedField === 'amount' ? '✓ Đã chép' : 'Copy Tiền'}
                          </button>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">NỘI DUNG CHUYỂN KHOẢN</span>
                            <span className="font-mono text-xs font-bold text-blue-900">
                              IM {selectedPlan.toUpperCase()} {orderCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copy(`IM ${selectedPlan.toUpperCase()} ${orderCode}`, 'desc')}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-slate-700"
                          >
                            {copiedField === 'desc' ? '✓ Đã chép' : 'Copy ND'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Simulate Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPaid(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <span>⚡ Mô Phỏng Thanh Toán Thành Công (Demo Test Không Cần Quét)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* International Card Option */}
            {paymentMethod === 'card' && (
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Số thẻ tín dụng / ghi nợ</label>
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 8812"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Hạn dùng (MM/YY)</label>
                    <input type="text" defaultValue="12/28" className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-mono text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã bảo mật CVV</label>
                    <input type="password" defaultValue="889" className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-mono text-xs" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Xác Nhận Thanh Toán {Number(amountVnd).toLocaleString('vi-VN')} đ
                </button>
              </div>
            )}

            {/* VAT Invoice Accordion */}
            <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={vatRequested}
                  onChange={(e) => setVatRequested(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Yêu cầu xuất hóa đơn giá trị gia tăng (VAT e-Invoice B2B)</span>
              </label>

              {vatRequested && (
                <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-stone-200 text-xs">
                  <input type="text" placeholder="Tên công ty / Doanh nghiệp" className="col-span-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-white" />
                  <input type="text" placeholder="Mã số thuế (MST)" className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white" />
                  <input type="email" placeholder="Email nhận hóa đơn điện tử" className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white" />
                  <input type="text" placeholder="Địa chỉ đăng ký kinh doanh" className="col-span-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// VARIATION 2: Modern Fintech Dark Mode (High-Velocity PayOS View)
// =========================================================================
function DarkFintechCheckout() {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [cycle, setCycle] = useState('monthly');
  const [simulated, setSimulated] = useState(false);
  const plan = CHECKOUT_PLANS[selectedPlan];
  const amountVnd = cycle === 'annual' ? plan.annualVnd : plan.monthlyVnd;
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?amount=${amountVnd}&addInfo=IM%20${selectedPlan.toUpperCase()}%208829&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div className="w-[1020px] bg-[#0A111E] text-slate-100 font-sans p-7 select-none border border-slate-800 rounded-3xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">InsurMatch PayOS Terminal</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Webhook Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Cổng thanh toán tự động VietQR Napas 24/7 tức thì 1–3s</p>
          </div>
        </div>

        {/* Plan Switch Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
          {['starter', 'professional', 'agency'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedPlan(k)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${selectedPlan === k ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Dark Grid */}
      <div className="relative z-10 grid grid-cols-12 gap-7 mt-6 items-start">
        {/* Left: Glass Card Details */}
        <div className="col-span-5 space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-blue-400 tracking-wider block">Gói được chọn</span>
                <h3 className="text-xl font-black text-white mt-0.5">{plan.name}</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-400/20">
                {plan.seats} Seats
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{plan.audience}</p>

            {/* Quota Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Contacts Quota</span>
                <strong className="text-emerald-400 text-sm block mt-0.5">{plan.contacts} Hồ sơ</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Cloud SSD</span>
                <strong className="text-blue-400 text-sm block mt-0.5">{plan.storage}</strong>
              </div>
            </div>

            {/* Pricing Tag */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-300 block font-semibold">Số tiền thanh toán:</span>
                <span className="text-2xl font-black text-white tracking-tight">
                  {Number(amountVnd).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                0% Phí giao dịch
              </span>
            </div>
          </div>

          {/* Real-time Webhook Stream Simulation */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                PayOS Webhook Radar
              </span>
              <span className="text-[10px] font-mono text-slate-500">ID: #990142</span>
            </div>
            <div className="bg-black/50 p-2.5 rounded-xl font-mono text-[11px] text-slate-400 space-y-1">
              <div>[2026-11-05 06:46] Listening on /payments/payos/webhook...</div>
              <div className="text-emerald-400">[READY] Waiting for MB Bank Napas transfer...</div>
            </div>
          </div>
        </div>

        {/* Right: Glowing VietQR */}
        <div className="col-span-7 bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-5 shadow-2xl">
          {simulated ? (
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                ✓
              </div>
              <h3 className="text-lg font-black text-white">Xác Nhận Thành Công 100%!</h3>
              <p className="text-xs text-emerald-300">
                Hệ thống tự động đồng bộ hạn mức mới {plan.contacts} Contacts &amp; {plan.seats} Seats vào tài khoản.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-5 items-center">
              {/* QR Container with Glow */}
              <div className="col-span-6 flex flex-col items-center">
                <div className="p-2.5 rounded-2xl bg-white shadow-xl shadow-blue-500/10 relative group">
                  <div className="w-48 h-48 flex items-center justify-center">
                    <img src={qrUrl} alt="VietQR Dark" className="w-full h-full object-contain" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 text-center block">
                  Quét mã qua app mọi ngân hàng Việt Nam 24/7
                </span>
              </div>

              {/* Transfer Details */}
              <div className="col-span-6 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">TÀI KHOẢN NHẬN TIỀN</span>
                  <span className="font-mono text-sm font-black text-emerald-400 block mt-0.5">{BANK_INFO.accountNumber}</span>
                  <span className="text-[10px] text-slate-300 block">{BANK_INFO.accountName} • MB Bank</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">SỐ TIỀN CHÍNH XÁC</span>
                  <span className="font-mono text-base font-black text-white block mt-0.5">
                    {Number(amountVnd).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC)</span>
                  <span className="font-mono text-xs font-bold text-blue-300 block mt-0.5">
                    IM {selectedPlan.toUpperCase()} 8829
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSimulated(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <span>⚡ Kích Hoạt Demo (Mô Phỏng IPN Webhook)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// VARIATION 3: Conversion-Optimized 3-Step Wizard Checkout
// =========================================================================
function WizardCheckout() {
  const [step, setStep] = useState(1); // 1: Plan, 2: Agency VAT, 3: Payment
  const [planKey, setPlanKey] = useState('professional');
  const [cycle, setCycle] = useState('annual');
  const [paid, setPaid] = useState(false);

  const plan = CHECKOUT_PLANS[planKey];
  const amountVnd = cycle === 'annual' ? plan.annualVnd : plan.monthlyVnd;
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?amount=${amountVnd}&addInfo=IM%20WIZARD%20${planKey.toUpperCase()}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div className="w-[1020px] bg-white text-slate-900 font-sans p-7 select-none border border-slate-200 rounded-3xl shadow-lg">
      {/* Wizard Step Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900">Nâng Cấp Gói InsurMatch B2B SaaS</h2>
          <p className="text-xs text-slate-500">Quy trình 3 bước xác nhận và kích hoạt hạ tầng CRM</p>
        </div>

        {/* Stepper indicators */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Chọn Gói' },
            { num: 2, label: 'Thông Tin Đại Lý & VAT' },
            { num: 3, label: 'Quét Mã Thanh Toán' }
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                step === st.num
                  ? 'bg-blue-600 text-white'
                  : step > st.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {step > st.num ? '✓' : st.num}
              </span>
              <span className={`text-xs font-semibold ${step === st.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {st.label}
              </span>
              {st.num < 3 && <span className="text-slate-300 mx-1">›</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-6 min-h-[380px]">
        {/* STEP 1: Select Plan & Cycle */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold text-slate-900">Bước 1: Chọn gói cước phù hợp với quy mô đại lý</h3>
              {/* Cycle Toggle */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg ${cycle === 'monthly' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                >
                  Thanh Toán Hàng Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('annual')}
                  className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 ${cycle === 'annual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  <span>Thanh Toán Năm</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">Tiết kiệm 2 tháng</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {Object.keys(CHECKOUT_PLANS).map((k) => {
                const item = CHECKOUT_PLANS[k];
                const active = planKey === k;
                const price = cycle === 'annual' ? item.annualVnd : item.monthlyVnd;
                return (
                  <div
                    key={k}
                    onClick={() => setPlanKey(k)}
                    className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'border-blue-600 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-base">{item.name}</h4>
                        <span className="text-xs font-bold font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {item.seats} Seats
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{item.audience}</p>

                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {Number(price).toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">đ / {cycle === 'annual' ? 'năm' : 'tháng'}</span>
                      </div>

                      <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                        Hạn mức: <strong>{item.contacts} Contacts</strong> • <strong>{item.storage}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-5 py-2 rounded-xl text-xs font-bold ${
                        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {active ? '✓ Đang Chọn' : 'Chọn Gói Này'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>Tiếp tục: Thông tin đại lý &amp; VAT</span>
                <span>›</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Agency Info & VAT */}
        {step === 2 && (
          <div className="max-w-xl mx-auto space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Bước 2: Thông tin đại lý &amp; Xuất hóa đơn VAT điện tử</h3>
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Tên Agency / Đại Lý</label>
                <input type="text" defaultValue="Nguyen Phuong Khai Insurance Agency" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Licensed Agent</label>
                  <input type="text" defaultValue="Nguyen Phuong Khai" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white" />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email Nhận Kích Hoạt</label>
                  <input type="email" defaultValue="agent@insurmatch.us" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Mã số thuế doanh nghiệp (Nếu cần xuất hóa đơn VAT)</label>
                <input type="text" placeholder="0312345678" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white" />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                ‹ Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>Tiếp tục: Cổng thanh toán VietQR</span>
                <span>›</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PayOS QR Payment */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-5">
            {paid ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white text-2xl flex items-center justify-center mx-auto shadow-md">
                  ✓
                </div>
                <h3 className="text-lg font-black text-emerald-950">Đã Kích Hoạt Gói {plan.name}!</h3>
                <p className="text-xs text-emerald-800">
                  Hạn mức mới: <strong>{plan.contacts} Contacts</strong> • <strong>{plan.seats} Seats</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs mt-3"
                >
                  Quay Lại Quản Lý
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Gói: {plan.name} ({cycle === 'annual' ? 'Năm' : 'Tháng'})</h4>
                    <span className="text-emerald-700 font-bold">Số tiền: {Number(amountVnd).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 font-bold">⏱ 14:59</span>
                </div>

                <div className="grid grid-cols-12 gap-5 items-center">
                  <div className="col-span-5 flex flex-col items-center">
                    <div className="w-44 h-44 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                      <img src={qrUrl} alt="VietQR" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 text-center">Quét bằng App Ngân Hàng Napas</span>
                  </div>

                  <div className="col-span-7 space-y-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">SỐ TÀI KHOẢN (MB BANK)</span>
                      <strong className="font-mono text-sm text-slate-900">0838780005</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">NỘI DUNG CHUYỂN TIỀN</span>
                      <strong className="font-mono text-xs text-blue-900">IM WIZARD {planKey.toUpperCase()}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaid(true)}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      ⚡ Mô Phỏng Thanh Toán Thành Công (Demo Test)
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-1.5 rounded-xl text-slate-600 font-bold"
                  >
                    ‹ Sửa Thông Tin
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Expose components to window for DesignCanvas
Object.assign(window, {
  SwissCleanCheckout,
  DarkFintechCheckout,
  WizardCheckout
});
