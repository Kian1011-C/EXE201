import React, { useState, useEffect, useRef } from 'react';
import {
  SAAS_PLANS,
  subscribeOrUpgradePlan,
  createPayosPaymentLink,
  checkPayosPaymentStatus,
  simulatePayosPaymentSuccess,
  fetchMyBackendSubscription,
  fetchPublicSaasPlans,
} from '../../../services/subscriptionService';
import toast from 'react-hot-toast';

export default function AgentCheckoutPage({
  agentName = '',
  agentEmail = 'khanh@insurmatch.us',
  initialPlan = 'professional',
  initialCycle = 'annual',
  onBack,
}) {
  const [selectedPlanKey, setSelectedPlanKey] = useState(initialPlan);
  const [billingCycle, setBillingCycle] = useState(initialCycle === 'annual' ? 'Annual' : 'Monthly');
  const [paymentMethod, setPaymentMethod] = useState('payos'); // 'payos' | 'card'
  const [dbPlans, setDbPlans] = useState([]);
  const [vatRequested, setVatRequested] = useState(false);
  const [vatInfo, setVatInfo] = useState({
    companyName: '',
    taxCode: '',
    invoiceEmail: agentEmail || '',
    address: '',
  });

  // PayOS QR & Polling state
  const [payosData, setPayosData] = useState(null);
  const [loadingPayos, setLoadingPayos] = useState(false);
  const [payosError, setPayosError] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);

  // Credit card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('889');
  const [cardName, setCardName] = useState(agentName || 'KHANH NGUYEN');

  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  // Load public plans from BE
  useEffect(() => {
    fetchPublicSaasPlans()
      .then((plans) => {
        if (plans && Array.isArray(plans)) setDbPlans(plans);
      })
      .catch(() => {});
  }, []);

  // Initialize or re-initialize PayOS link whenever plan or cycle changes
  useEffect(() => {
    if (paymentMethod === 'payos' && !isPaidSuccess) {
      initPayosLink(selectedPlanKey, billingCycle);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedPlanKey, billingCycle, paymentMethod]);

  // PayOS initialization
  async function initPayosLink(planKey, cycle) {
    setLoadingPayos(true);
    setPayosError(null);
    try {
      const data = await createPayosPaymentLink({
        planTier: planKey,
        billingCycle: cycle,
      });
      setPayosData(data);
      setCountdownSeconds(900);
      startCountdown();
      startPolling(data.orderCode, planKey, cycle);
    } catch (err) {
      console.warn('PayOS link error, fallback to standard VietQR:', err);
      setPayosError(err.message || 'Không thể kết nối cổng PayOS');
    } finally {
      setLoadingPayos(false);
    }
  }

  // 15-minute countdown timer
  function startCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Polling payment status every 3s
  function startPolling(orderCode, planKey, cycle) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkPayosPaymentStatus(orderCode);
        if (res && (res.isPaid || res.status === 'PAID')) {
          handlePaymentSuccess(planKey, cycle, orderCode);
        }
      } catch (e) {
        console.warn('PayOS check status polling error:', e);
      }
    }, 3000);
  }

  // Handle payment completed
  function handlePaymentSuccess(planKey, cycle, orderCode) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaidSuccess(true);

    const targetPlanInfo = SAAS_PLANS[planKey] || SAAS_PLANS.professional;

    subscribeOrUpgradePlan({
      agentName: agentName || 'Khanh Nguyen',
      agentEmail: agentEmail || 'khanh@insurmatch.us',
      planKey,
      billingCycle: cycle,
      paymentMethod: `VietQR PayOS (Mã #${orderCode})`,
    });

    fetchMyBackendSubscription().catch(() => {});

    toast.success(
      `🎉 Chúc mừng! Gói ${targetPlanInfo.displayName} (${cycle === 'Annual' ? 'Thanh toán năm' : 'Hàng tháng'}) đã kích hoạt thành công!`,
      { duration: 6000 }
    );
  }

  // Handle Demo Simulation
  async function handleSimulateSuccess() {
    if (!payosData?.orderCode) return;
    setIsSimulating(true);
    try {
      const res = await simulatePayosPaymentSuccess(payosData.orderCode);
      toast.success(res?.message || 'Mô phỏng thanh toán thành công!');
      handlePaymentSuccess(selectedPlanKey, billingCycle, payosData.orderCode);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi mô phỏng thanh toán');
    } finally {
      setIsSimulating(false);
    }
  }

  // Handle Credit Card submission
  function handleConfirmCardPayment(e) {
    e.preventDefault();
    setIsProcessingCard(true);
    setTimeout(() => {
      const paymentDisplay = `Visa •••• ${cardNumber?.replace(/\D/g, '').slice(-4) || '8812'}`;
      subscribeOrUpgradePlan({
        agentName: agentName || 'Khanh Nguyen',
        agentEmail: agentEmail || 'khanh@insurmatch.us',
        planKey: selectedPlanKey,
        billingCycle,
        paymentMethod: paymentDisplay,
      });

      setIsProcessingCard(false);
      setIsPaidSuccess(true);

      const targetPlanInfo = SAAS_PLANS[selectedPlanKey] || SAAS_PLANS.professional;
      toast.success(
        `🎉 Thanh toán thẻ thành công! Gói ${targetPlanInfo.displayName} đã được kích hoạt.`,
        { duration: 6000 }
      );
    }, 1200);
  }

  function copyToClipboard(text, label) {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success(`Đã sao chép ${label}!`, { duration: 2500 });
  }

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentPlan = SAAS_PLANS[selectedPlanKey] || SAAS_PLANS.professional;
  const dbMatch = dbPlans.find((p) => {
    const code = (p.planCode || p.plan_code || p.name || '').toUpperCase();
    return code.includes(selectedPlanKey.toUpperCase());
  });

  const displayPriceVnd = dbMatch
    ? billingCycle === 'Annual'
      ? (dbMatch.annualPriceVnd ?? currentPlan.annualVnd)
      : (dbMatch.monthlyPriceVnd ?? currentPlan.monthlyVnd)
    : billingCycle === 'Annual' ? currentPlan.annualVnd : currentPlan.monthlyVnd;

  const displayPriceUsd = dbMatch
    ? billingCycle === 'Annual'
      ? (dbMatch.annualPriceUsd ?? Math.round(currentPlan.annualPrice / 12))
      : (dbMatch.monthlyPriceUsd ?? currentPlan.monthlyPrice)
    : billingCycle === 'Annual' ? Math.round(currentPlan.annualPrice / 12) : currentPlan.monthlyPrice;

  const maxContacts = dbMatch?.maxContacts ?? currentPlan.maxContacts;
  const maxSeats = dbMatch?.maxSeats ?? currentPlan.maxSeats;
  const storageLimit = dbMatch?.storageLimitGb ?? currentPlan.storageLimitGb ?? (selectedPlanKey === 'starter' ? 2 : selectedPlanKey === 'agency' ? 100 : 25);

  let planFeatures = currentPlan.features;
  if (dbMatch?.featuresJson) {
    try {
      const parsed = JSON.parse(dbMatch.featuresJson);
      if (Array.isArray(parsed) && parsed.length > 0) planFeatures = parsed;
    } catch {
      // fallback
    }
  }

  const orderAmount = payosData?.amount || displayPriceVnd;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 bg-[#F8FAFC]">
      {/* Top Navigation Bar & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition cursor-pointer"
            title="Quay lại danh sách gói"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                B2B SaaS Checkout
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                PayOS VietQR Napas 24/7
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Thanh Toán &amp; Nâng Cấp Gói InsurMatch CRM
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Bảo mật SSL 256-bit</span>
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">lock</span>
        </div>
      </div>

      {/* Main 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* ── LEFT COLUMN: Order Summary & Plan Options ────────────────── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Plan Selector Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Chọn Gói Dịch Vụ SaaS
              </h2>
              {/* Billing Cycle Toggle */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('Monthly')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    billingCycle === 'Monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hàng Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('Annual')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    billingCycle === 'Annual'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Theo Năm</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-extrabold">-2 Tháng</span>
                </button>
              </div>
            </div>

            {/* Plan Cards Stack */}
            <div className="space-y-2.5">
              {['starter', 'professional', 'agency'].map((k) => {
                const planItem = SAAS_PLANS[k];
                const active = selectedPlanKey === k;
                const dbP = dbPlans.find((p) => (p.planCode || '').toUpperCase().includes(k.toUpperCase()));
                const priceVnd = dbP
                  ? billingCycle === 'Annual'
                    ? (dbP.annualPriceVnd ?? planItem.annualVnd)
                    : (dbP.monthlyPriceVnd ?? planItem.monthlyVnd)
                  : billingCycle === 'Annual' ? planItem.annualVnd : planItem.monthlyVnd;

                return (
                  <div
                    key={k}
                    onClick={() => setSelectedPlanKey(k)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      active
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-600' : 'border-slate-300'}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{planItem.displayName}</span>
                          {k === 'professional' && (
                            <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">
                              Phổ biến
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {planItem.maxSeats} Seats • {planItem.maxContacts} Contacts • {planItem.storageLimitGb || (k === 'starter' ? 2 : k === 'agency' ? 100 : 25)} GB
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block tabular-nums">
                        {Number(priceVnd).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-slate-400">/{billingCycle === 'Annual' ? 'năm' : 'tháng'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quotas & Features Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Quyền Lợi &amp; Hạn Mức Gói {currentPlan.name}
            </h2>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">HỒ SƠ KHÁCH</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{maxContacts} Contacts</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">CHỖ NGỒI (SEATS)</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{maxSeats} Seats</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">DUNG LƯỢNG SSD</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{storageLimit} GB</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 pt-1">
              {planFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                  <span>{feat}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-blue-700 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0 mt-0.5">bolt</span>
                <span>Kích hoạt hạn mức tự động sau 1–3s qua Webhook PayOS</span>
              </li>
            </ul>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Đơn giá gói ({billingCycle === 'Annual' ? 'Thanh toán theo năm' : 'Hàng tháng'}):</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {Number(displayPriceVnd).toLocaleString('vi-VN')} đ
                </span>
              </div>

              {billingCycle === 'Annual' && (
                <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md">
                  <span>Ưu đãi trả theo năm (Tiết kiệm 2 tháng):</span>
                  <span className="tabular-nums">
                    -{Number((selectedPlanKey === 'starter' ? 990000 : selectedPlanKey === 'professional' ? 1990000 : 4990000) * 2).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Thuế GTGT / Phí cổng Napas:</span>
                <span className="text-emerald-600 font-bold">Miễn phí 0đ</span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-900">TỔNG THANH TOÁN:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600 block tabular-nums">
                    {Number(orderAmount).toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Quy đổi: ~${displayPriceUsd} USD / tháng
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Payment Gateway & QR ─────────────────────── */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            {/* Payment Method Selector */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                3. Chọn Phương Thức Thanh Toán
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('payos')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer relative flex items-center justify-between ${
                    paymentMethod === 'payos'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                    </span>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">VietQR PayOS</strong>
                      <span className="text-[10px] text-slate-500">Napas 24/7 tự động 1–3s</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Khuyên Dùng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </span>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">Thẻ Quốc Tế</strong>
                      <span className="text-[10px] text-slate-500">Visa, MasterCard, JCB</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* METHOD 1: VIETQR PAYOS CONTAINER */}
            {paymentMethod === 'payos' && (
              <div className="space-y-4">
                {isPaidSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <span className="material-symbols-outlined text-[32px]">check</span>
                    </div>
                    <h3 className="text-lg font-black text-emerald-950">
                      Thanh Toán Thành Công Qua PayOS!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Gói <strong>{currentPlan.displayName}</strong> đã kích hoạt. Hạn mức mới: <strong>{maxContacts} Hồ sơ</strong> • <strong>{maxSeats} Seats</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Quay Lại Bảng Quản Lý
                    </button>
                  </div>
                ) : loadingPayos ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                    <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
                    <p className="text-xs font-semibold text-slate-700">Đang khởi tạo mã VietQR động từ PayOS...</p>
                  </div>
                ) : payosError ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
                    <p className="text-xs font-semibold text-rose-800">{payosError}</p>
                    <button
                      type="button"
                      onClick={() => initPayosLink(selectedPlanKey, billingCycle)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Thử Lại
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 space-y-4">
                    {/* Header instruction & countdown */}
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Chờ quét mã VietQR Napas 24/7 (Kích hoạt tức thì)</span>
                      </div>
                      <div className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        ⏱ {formatTimer(countdownSeconds)}
                      </div>
                    </div>

                    {/* QR and Transfer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      {/* QR Image Box */}
                      <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="w-44 h-44 rounded-lg overflow-hidden bg-white p-1 border border-slate-100 flex items-center justify-center">
                          <img
                            src={
                              payosData?.qrCodeUrl ||
                              `https://img.vietqr.io/image/970422-0838780005-compact2.png?amount=${orderAmount}&addInfo=${encodeURIComponent(payosData?.description || `IM ${selectedPlanKey.toUpperCase()}`)}&accountName=THE%20BEST%20RATE%20INSURANCE`
                            }
                            alt="VietQR Napas 247"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">
                          Mở App ngân hàng (MB, VCB, Techcombank,...) quét mã thanh toán tức thì
                        </p>
                      </div>

                      {/* Banking Details */}
                      <div className="sm:col-span-7 space-y-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">NGÂN HÀNG</span>
                            <strong className="text-slate-900 block text-xs">MB Bank (Quân Đội)</strong>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Napas 247
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">SỐ TÀI KHOẢN</span>
                            <strong className="text-slate-900 font-mono text-sm block">0838780005</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('0838780005', 'Số tài khoản')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            Copy STK
                          </button>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">SỐ TIỀN CẦN CHUYỂN</span>
                            <strong className="text-emerald-700 font-mono text-sm block tabular-nums">
                              {Number(orderAmount).toLocaleString('vi-VN')} VNĐ
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(orderAmount, 'Số tiền')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            Copy Tiền
                          </button>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">NỘI DUNG CHUYỂN KHOẢN</span>
                            <strong className="text-blue-900 font-mono text-xs block">
                              {payosData?.description || `IM ${selectedPlanKey.toUpperCase()}`}
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(payosData?.description || `IM ${selectedPlanKey.toUpperCase()}`, 'Nội dung CK')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            Copy ND
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PayOS Hosted Link & Demo Simulation Button */}
                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      {payosData?.checkoutUrl && payosData.checkoutUrl.startsWith('http') && (
                        <a
                          href={payosData.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center justify-center gap-2 text-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          <span>Mở Trang Thanh Toán PayOS (Cổng Thanh Toán Trực Tuyến)</span>
                        </a>
                      )}

                      {/* Demo Simulation Button */}
                      <button
                        type="button"
                        onClick={handleSimulateSuccess}
                        disabled={isSimulating}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {isSimulating ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                            <span>Đang mô phỏng giao dịch ngân hàng...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">bolt</span>
                            <span>⚡ Mô Phỏng Thanh Toán Thành Công (Demo Test Không Cần App)</span>
                          </>
                        )}
                      </button>

                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-900 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Cổng thanh toán tự động VietQR Napas 24/7 (Tiền Thật)</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-snug">
                          Vui lòng mở ứng dụng ngân hàng và quét mã QR ở trên để hoàn tất chuyển khoản. Ngay khi tiền vào tài khoản, hệ thống sẽ tự động xác nhận qua PayOS Webhook và nâng cấp hạn mức gói tức thì (1–3 giây).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2: CREDIT CARD CONTAINER */}
            {paymentMethod === 'card' && (
              <form onSubmit={handleConfirmCardPayment} className="space-y-4">
                <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Số thẻ tín dụng / ghi nợ quốc tế</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 8812"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Ngày hết hạn (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Mã bảo mật CVV / CVC</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Tên chủ thẻ</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="KHANH NGUYEN"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white uppercase text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingCard}
                    className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingCard ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang xử lý thẻ...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Xác Nhận Thanh Toán {Number(orderAmount).toLocaleString('vi-VN')} đ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* VAT E-Invoice Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={vatRequested}
                  onChange={(e) => setVatRequested(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Yêu cầu xuất hóa đơn giá trị gia tăng điện tử (VAT e-Invoice B2B)</span>
              </label>

              {vatRequested && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs animate-fade-in">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Tên công ty / Doanh nghiệp</label>
                    <input
                      type="text"
                      value={vatInfo.companyName}
                      onChange={(e) => setVatInfo({ ...vatInfo, companyName: e.target.value })}
                      placeholder="Công ty TNHH Bảo Hiểm ABC"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Mã số thuế (MST)</label>
                    <input
                      type="text"
                      value={vatInfo.taxCode}
                      onChange={(e) => setVatInfo({ ...vatInfo, taxCode: e.target.value })}
                      placeholder="0312345678"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Email nhận hóa đơn</label>
                    <input
                      type="email"
                      value={vatInfo.invoiceEmail}
                      onChange={(e) => setVatInfo({ ...vatInfo, invoiceEmail: e.target.value })}
                      placeholder="ketoan@agency.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Địa chỉ đăng ký kinh doanh</label>
                    <input
                      type="text"
                      value={vatInfo.address}
                      onChange={(e) => setVatInfo({ ...vatInfo, address: e.target.value })}
                      placeholder="Tầng 12, Tòa nhà Bitexco, Q.1, TP.HCM"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
