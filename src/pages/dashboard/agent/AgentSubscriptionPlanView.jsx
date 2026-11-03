import React, { useState, useEffect, useRef } from 'react';
import {
  SAAS_PLANS,
  getAgentSubscription,
  subscribeOrUpgradePlan,
  getInvoicesForAgent,
  createPayosPaymentLink,
  checkPayosPaymentStatus,
  fetchMyBackendSubscription,
} from '../../../services/subscriptionService';
import toast from 'react-hot-toast';

export default function AgentSubscriptionPlanView({ agentName = '', agentEmail = 'khanh@insurmatch.us' }) {
  const [subscription, setSubscription] = useState(() => getAgentSubscription(agentName || agentEmail));
  const [invoices, setInvoices] = useState(() => getInvoicesForAgent(agentName || agentEmail));
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Annual'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethodType, setPaymentMethodType] = useState('payos'); // 'payos' | 'card' | 'stripe'
  const [isProcessing, setIsProcessing] = useState(false);

  // PayOS QR & Polling state
  const [payosData, setPayosData] = useState(null);
  const [loadingPayos, setLoadingPayos] = useState(false);
  const [payosError, setPayosError] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  // Form states for checkout card
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('889');
  const [cardName, setCardName] = useState(agentName || 'KHANH NGUYEN');

  // Hydrate subscription from backend if available
  useEffect(() => {
    const sub = getAgentSubscription(agentName || agentEmail);
    setSubscription(sub);
    setInvoices(getInvoicesForAgent(agentName || agentEmail));

    fetchMyBackendSubscription()
      .then((data) => {
        if (data && data.subscription) {
          const beSub = data.subscription;
          const quota = data.quota || {};
          const planKey = (beSub.planTier || 'PROFESSIONAL').toLowerCase();
          const planMeta = SAAS_PLANS[planKey] || SAAS_PLANS.professional;

          setSubscription((prev) => ({
            ...prev,
            plan: planMeta.name,
            billingCycle: beSub.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly',
            maxSeats: beSub.seatsLimit || planMeta.maxSeats,
            maxContacts: beSub.contactsLimit || planMeta.maxContacts,
            contactsCount: quota.usedContacts != null ? quota.usedContacts : (prev.contactsCount || 8),
            nextRenewalDate: beSub.endDate ? beSub.endDate.split('T')[0] : prev.nextRenewalDate,
            paymentMethod: beSub.lastPaymentMethod || prev.paymentMethod,
          }));
        }
      })
      .catch((err) => console.warn('[Subscription] BE sync info:', err.message));
  }, [agentName, agentEmail]);

  // Listen for storage updates across tabs
  useEffect(() => {
    function handleStorageUpdate() {
      const sub = getAgentSubscription(agentName || agentEmail);
      setSubscription(sub);
      setInvoices(getInvoicesForAgent(agentName || agentEmail));
    }
    window.addEventListener('insurmatch_subscriptions_updated', handleStorageUpdate);
    return () => window.removeEventListener('insurmatch_subscriptions_updated', handleStorageUpdate);
  }, [agentName, agentEmail]);

  // Cleanup polling and timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentPlanKey = (subscription?.plan || 'Professional')?.toLowerCase();

  // Helper to copy text to clipboard
  function copyToClipboard(text, label) {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast.success(`Đã sao chép ${label}!`, { duration: 2500 });
  }

  // Handle opening checkout modal
  function handleOpenCheckout(planKey) {
    setSelectedPlanForCheckout(planKey);
    setCheckoutModalOpen(true);
    setPaymentMethodType('payos');
    setIsPaidSuccess(false);
    setPayosData(null);
    setPayosError(null);
    setCountdownSeconds(900);
    initPayosLink(planKey, billingCycle);
  }

  // Initialize PayOS Payment Link
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
      console.error('Failed to init PayOS link:', err);
      setPayosError(err.message || 'Không thể kết nối cổng PayOS');
    } finally {
      setLoadingPayos(false);
    }
  }

  // Countdown timer (15 minutes)
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

  // Start polling status every 3s
  function startPolling(orderCode, planKey, cycle) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkPayosPaymentStatus(orderCode);
        if (res && (res.isPaid || res.status === 'PAID')) {
          handlePaymentSuccess(planKey, cycle, orderCode);
        }
      } catch (e) {
        console.warn('PayOS polling check error:', e);
      }
    }, 3000);
  }

  // Payment completed
  function handlePaymentSuccess(planKey, cycle, orderCode) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaidSuccess(true);

    const updated = subscribeOrUpgradePlan({
      agentName: agentName || subscription?.agentName || '',
      agentEmail: agentEmail || subscription?.agentEmail || 'khanh@insurmatch.us',
      planKey,
      billingCycle: cycle,
      paymentMethod: `VietQR PayOS (Mã #${orderCode})`,
    });

    setSubscription(updated);
    setInvoices(getInvoicesForAgent(agentName || agentEmail));

    // Re-fetch backend subscription to refresh quota
    fetchMyBackendSubscription().then((data) => {
      if (data && data.subscription) {
        const beSub = data.subscription;
        const quota = data.quota || {};
        const planMeta = SAAS_PLANS[planKey.toLowerCase()] || SAAS_PLANS.professional;
        setSubscription((prev) => ({
          ...prev,
          plan: planMeta.name,
          maxSeats: beSub.seatsLimit || planMeta.maxSeats,
          maxContacts: beSub.contactsLimit || planMeta.maxContacts,
          contactsCount: quota.usedContacts != null ? quota.usedContacts : prev.contactsCount,
          nextRenewalDate: beSub.endDate ? beSub.endDate.split('T')[0] : prev.nextRenewalDate,
        }));
      }
    });

    const targetPlanInfo = SAAS_PLANS[planKey] || SAAS_PLANS.professional;
    toast.success(
      `🎉 Chúc mừng! Gói ${targetPlanInfo.displayName} đã được kích hoạt thành công qua PayOS!`,
      { duration: 5000 }
    );

    setTimeout(() => {
      setCheckoutModalOpen(false);
      setIsPaidSuccess(false);
    }, 2800);
  }

  // Handle standard credit card form submission
  function handleConfirmCardPayment(e) {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setIsProcessing(true);
    setTimeout(() => {
      const paymentDisplay = `Visa •••• ${cardNumber?.replace(/\D/g, '').slice(-4) || '8812'}`;

      const updated = subscribeOrUpgradePlan({
        agentName: agentName || subscription?.agentName || '',
        agentEmail: agentEmail || subscription?.agentEmail || 'khanh@insurmatch.us',
        planKey: selectedPlanForCheckout,
        billingCycle,
        paymentMethod: paymentDisplay,
      });

      setSubscription(updated);
      setInvoices(getInvoicesForAgent(agentName || agentEmail));
      setIsProcessing(false);
      setCheckoutModalOpen(false);

      const targetPlanInfo = SAAS_PLANS[selectedPlanForCheckout] || SAAS_PLANS.professional;
      toast.success(
        `Congratulations! You have successfully activated ${targetPlanInfo.displayName} (${billingCycle === 'Annual' ? 'Annual Billing' : 'Monthly Billing'})!`,
        { duration: 4000 }
      );
    }, 1000);
  }

  // Format seconds into MM:SS
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-[#F8FAFC]">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">card_membership</span>
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                CRM Subscription Plans &amp; Resource Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem thông tin gói, nâng cấp hạn mức hồ sơ (100 / 200 / 300) và thanh toán tự động VietQR qua cổng PayOS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Tier: {subscription?.plan || 'Professional'} Plan
          </span>
        </div>
      </div>

      {/* ── 1. Current Active Plan Details Card ──────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0A1628] to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Your Current Subscription
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Active & Verified
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-3">
                <span>{subscription?.agencyName || 'InsurMatch Partner Agency'}</span>
                <span className="text-lg font-normal text-slate-400">({subscription?.plan} Tier)</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Licensed Agent: <strong className="text-white">{subscription?.agentName}</strong> • Cycle: <span className="font-semibold text-blue-300">{subscription?.billingCycle === 'Annual' ? 'Billed Annually' : 'Billed Monthly'}</span>
              </p>
            </div>

            {/* Quick Metrics Bar with Quotas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-medium">Account Seats</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {subscription?.seatsUsed || 1} / {subscription?.maxSeats || 3} <span className="text-xs font-normal text-slate-400">seats</span>
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, ((subscription?.seatsUsed || 1) / (subscription?.maxSeats || 3)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-medium">Customer Contacts Quota</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {subscription?.contactsCount != null ? subscription?.contactsCount : 8} / {subscription?.maxContacts || 200}
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (((subscription?.contactsCount != null ? subscription?.contactsCount : 8) / (subscription?.maxContacts || 200)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block font-medium">Next Renewal</span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">
                  {subscription?.nextRenewalDate || '2026-11-30'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 truncate">
                  {subscription?.paymentMethod || 'VietQR PayOS'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Upgrade CTA */}
          <div className="lg:border-l lg:border-white/10 lg:pl-8 flex flex-col justify-center items-start lg:items-end text-left lg:text-right shrink-0">
            <span className="text-xs text-slate-400 font-medium">Subscription Fee</span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              ${subscription?.price || 79}
              <span className="text-sm font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              ≈ {subscription?.price === 39 ? '990.000' : subscription?.price === 199 ? '4.990.000' : '1.990.000'} VNĐ / tháng
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
              Tự động gia hạn qua cổng PayOS VietQR hoặc Thẻ tín dụng.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = currentPlanKey === 'agency' ? 'professional' : 'agency';
                  handleOpenCheckout(target);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                <span>{currentPlanKey === 'agency' ? 'Đổi Gói Dịch Vụ' : 'Nâng Cấp Lên Agency (300 Hồ sơ)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Pricing & Plan Comparison (100 / 200 / 300 Quotas) ──────────── */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Chọn Gói Đăng Ký CRM Phù Hợp Với Quy Mô Đại Lý
          </h2>
          <p className="text-xs text-slate-500">
            Hạ tầng CRM chuyên biệt cho đại lý bảo hiểm ACA / Medicare tại Hoa Kỳ với cổng thanh toán VietQR tự động 1–3s.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle('Monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'Monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thanh Toán Hàng Tháng
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('Annual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'Annual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Thanh Toán Theo Năm</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950">
                Tiết Kiệm 2 Tháng
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards: Starter (100), Pro (200), Agency (300) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {Object.entries(SAAS_PLANS).map(([key, plan]) => {
            const isCurrent = currentPlanKey === key;
            const displayPriceUsd = billingCycle === 'Annual' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const displayPriceVnd = billingCycle === 'Annual' ? plan.annualVnd : plan.monthlyVnd;

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 relative ${
                  plan.recommended
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
                    : isCurrent
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Ribbon Tag */}
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                    ★ Phổ Biến Nhất
                  </div>
                )}
                {isCurrent && !plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                    ✓ Đang Sử Dụng
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                      {plan.maxSeats} {plan.maxSeats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">${displayPriceUsd}</span>
                    <span className="text-xs text-slate-500 font-medium">/tháng</span>
                  </div>

                  <div className="mt-1 text-xs font-bold text-emerald-700">
                    ≈ {Number(displayPriceVnd).toLocaleString('vi-VN')} VNĐ {billingCycle === 'Annual' ? '/năm' : '/tháng'} (PayOS)
                  </div>

                  {/* Quota Highlight Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">contact_page</span>
                    <span className="text-xs font-bold text-slate-800">
                      Hạn mức: {plan.maxContacts} Hồ sơ Khách hàng
                    </span>
                  </div>

                  <div className="border-t border-slate-100 my-4" />

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.features?.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">done</span>
                      <span>Gói Hiện Tại</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(key)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                        plan.recommended
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                      <span>
                        {key === 'agency'
                          ? 'Nâng Cấp Lên Agency (300 Contacts)'
                          : key === 'professional'
                          ? 'Chọn Gói Professional (200 Contacts)'
                          : 'Chọn Gói Starter (100 Contacts)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Billing & Invoices History Table ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Lịch Sử Thanh Toán &amp; Hóa Đơn B2B SaaS
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hóa đơn dịch vụ B2B SaaS tự động xuất và kích hoạt tức thì qua cổng VietQR PayOS
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success('Toàn bộ bảng kê hóa đơn đã được gửi qua email!')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">mail</span>
            <span>Gửi Hóa Đơn Qua Email</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Mã Hóa Đơn</th>
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4">Gói Dịch Vụ</th>
                <th className="py-3 px-4">Chu Kỳ</th>
                <th className="py-3 px-4 text-right">Số Tiền (USD)</th>
                <th className="py-3 px-4">Hình Thức</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Biên Lai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices?.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceId}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(inv.paidAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {inv.planName} Tier
                  </td>
                  <td className="py-3 px-4 text-slate-500">{inv.billingCycle}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ${Number(inv.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{inv.paymentMethod}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đã Thanh Toán
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toast(`Đang tải hóa đơn ${inv.invoiceId}...`, { icon: '📄' })}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Checkout & Activation Modal (VietQR PayOS + Card) ──────────── */}
      {checkoutModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-scale-up max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Thanh Toán Nâng Cấp Gói SaaS CRM</h3>
                  <p className="text-xs text-slate-500">InsurMatch B2B Platform • Cổng Thanh Toán PayOS (VietQR)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Plan Summary Box */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                    Gói dịch vụ đã chọn
                  </span>
                  <span className="text-lg font-black text-blue-950 mt-0.5 block">
                    {SAAS_PLANS[selectedPlanForCheckout]?.displayName}
                  </span>
                  <span className="text-xs text-blue-700 font-medium">
                    Hạn mức: <strong>{SAAS_PLANS[selectedPlanForCheckout]?.maxContacts} Hồ sơ</strong> • Chu kỳ: {billingCycle === 'Annual' ? 'Thanh toán Năm (Tiết kiệm 2 tháng)' : 'Hàng tháng'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-950 block">
                    ${billingCycle === 'Annual' ? SAAS_PLANS[selectedPlanForCheckout]?.annualPrice : SAAS_PLANS[selectedPlanForCheckout]?.monthlyPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 block">
                    ≈ {Number(billingCycle === 'Annual' ? SAAS_PLANS[selectedPlanForCheckout]?.annualVnd : SAAS_PLANS[selectedPlanForCheckout]?.monthlyVnd).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">Chọn phương thức thanh toán:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethodType('payos');
                      if (!payosData) initPayosLink(selectedPlanForCheckout, billingCycle);
                    }}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer relative ${
                      paymentMethodType === 'payos'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                      1–3s
                    </span>
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-emerald-600">qr_code_scanner</span>
                    <span className="block leading-tight font-bold">VietQR PayOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('card')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethodType === 'card'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-blue-600">credit_card</span>
                    <span className="block leading-tight font-medium">Thẻ Quốc Tế</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('stripe')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethodType === 'stripe'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-indigo-600">account_balance</span>
                    <span className="block leading-tight font-medium">Stripe / ACH</span>
                  </button>
                </div>
              </div>

              {/* ── METHOD 1: PAYOS VIETQR VIEW ── */}
              {paymentMethodType === 'payos' && (
                <div className="space-y-4">
                  {isPaidSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                      <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                        <span className="material-symbols-outlined text-[32px]">check</span>
                      </div>
                      <h4 className="text-base font-black text-emerald-900">
                        Thanh Toán Thành Công Qua PayOS!
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Hệ thống đã nhận được giao dịch và tự động kích hoạt gói <strong>{SAAS_PLANS[selectedPlanForCheckout]?.displayName}</strong>. Hạn mức mới: <strong>{SAAS_PLANS[selectedPlanForCheckout]?.maxContacts} Contacts</strong>.
                      </p>
                    </div>
                  ) : loadingPayos ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                      <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
                      <p className="text-xs font-semibold text-slate-700">Đang khởi tạo mã VietQR động từ PayOS...</p>
                    </div>
                  ) : payosError ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
                      <p className="text-xs font-semibold text-rose-800">{payosError}</p>
                      <button
                        type="button"
                        onClick={() => initPayosLink(selectedPlanForCheckout, billingCycle)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
                      {/* Top instruction & countdown */}
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Chờ chuyển khoản Napas 24/7 (Tự động kích hoạt)</span>
                        </div>
                        <div className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                          ⏱ {formatTimer(countdownSeconds)}
                        </div>
                      </div>

                      {/* QR and Transfer Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* QR Code Container */}
                        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <div className="w-44 h-44 rounded-lg overflow-hidden bg-white p-1 border border-slate-100 flex items-center justify-center">
                            <img
                              src={
                                payosData?.qrCodeUrl ||
                                `https://img.vietqr.io/image/970422-0838780005-compact2.png?amount=${payosData?.amount || 1990000}&addInfo=${encodeURIComponent(payosData?.description || 'IM PROFESSIONAL')}&accountName=THE%20BEST%20RATE%20INSURANCE`
                              }
                              alt="VietQR Napas 247"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-center">
                            Mở App ngân hàng (MB, VCB, Techcombank,...) quét mã để thanh toán tức thì
                          </p>
                        </div>

                        {/* Account Details with Copy Buttons */}
                        <div className="space-y-2.5 text-xs">
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

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-semibold">CHỦ TÀI KHOẢN</span>
                            <strong className="text-slate-900 block text-xs uppercase">
                              {payosData?.accountName || 'THE BEST RATE INSURANCE'}
                            </strong>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">SỐ TIỀN CẦN THANH TOÁN</span>
                              <strong className="text-emerald-700 font-mono text-sm block">
                                {Number(payosData?.amount || 1990000).toLocaleString('vi-VN')} VNĐ
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(payosData?.amount || 1990000, 'Số tiền')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              Copy tiền
                            </button>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">NỘI DUNG CHUYỂN KHOẢN</span>
                              <strong className="text-blue-900 font-mono text-xs block">
                                {payosData?.description || `IM ${selectedPlanForCheckout.toUpperCase()}`}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(payosData?.description || `IM ${selectedPlanForCheckout.toUpperCase()}`, 'Nội dung CK')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              Copy ND
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Real PayOS Payment Actions & Webhook Status */}
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

              {/* ── METHOD 2: CREDIT CARD VIEW ── */}
              {paymentMethodType === 'card' && (
                <form onSubmit={handleConfirmCardPayment} className="space-y-4">
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 8812"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Expiration Date (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="KHANH NGUYEN"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs uppercase text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Đang xử lý thẻ...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Xác Nhận Thanh Toán Thẻ</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ── METHOD 3: STRIPE VIEW ── */}
              {paymentMethodType === 'stripe' && (
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 text-slate-700 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600">lock</span>
                    <span>Cổng Thanh Toán Quốc Tế Stripe 3D-Secure</span>
                  </div>
                  <p>
                    Hệ thống sẽ chuyển hướng bạn đến trang thanh toán bảo mật Stripe để hoàn tất giao dịch bằng thẻ quốc tế hoặc tài khoản doanh nghiệp US ACH.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toast.success('Đang kết nối cổng Stripe Sandbox...')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition"
                    >
                      Mở Cổng Stripe Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
