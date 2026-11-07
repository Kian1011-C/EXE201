import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  SAAS_PLANS,
  getAgentSubscription,
  subscribeOrUpgradePlan,
  getInvoicesForAgent,
  createPayosPaymentLink,
  checkPayosPaymentStatus,
  fetchMyBackendSubscription,
  fetchPublicSaasPlans,
  simulatePayosPaymentSuccess,
} from '../../../services/subscriptionService';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

export default function AgentSubscriptionPlanView({
  agentName = '',
  agentEmail = 'khanh@insurmatch.us',
  onOpenFullCheckout,
}) {
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  const [subscription, setSubscription] = useState(() => getAgentSubscription(agentName || agentEmail));
  const [invoices, setInvoices] = useState(() => getInvoicesForAgent(agentName || agentEmail));
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Annual'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethodType, setPaymentMethodType] = useState('payos'); // 'payos' | 'card' | 'stripe'
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbPlans, setDbPlans] = useState([]);

  // PayOS QR & Polling state
  const [payosData, setPayosData] = useState(null);
  const [loadingPayos, setLoadingPayos] = useState(false);
  const [payosError, setPayosError] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

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

    fetchPublicSaasPlans()
      .then((plans) => {
        if (plans && Array.isArray(plans)) setDbPlans(plans);
      })
      .catch(() => {});

    fetchMyBackendSubscription()
      .then((data) => {
        if (data && data.subscription) {
          const beSub = data.subscription;
          const quota = data.quota || {};
          const tier = (beSub.planTier || 'TRIAL').toUpperCase();
          const planKey = tier.toLowerCase();
          const planMeta = SAAS_PLANS[planKey] || SAAS_PLANS.trial;

          setSubscription((prev) => ({
            ...prev,
            plan: planMeta.name,
            planTier: tier,
            billingCycle: beSub.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly',
            price: beSub.billingCycle === 'ANNUAL' ? Math.round(planMeta.annualPrice / 12) : planMeta.monthlyPrice,
            priceVnd: beSub.billingCycle === 'ANNUAL' ? planMeta.annualVnd : planMeta.monthlyVnd,
            maxSeats: beSub.seatsLimit != null ? beSub.seatsLimit : (quota.maxSeats != null ? quota.maxSeats : planMeta.maxSeats),
            maxContacts: beSub.contactsLimit != null ? beSub.contactsLimit : (quota.maxContacts != null ? quota.maxContacts : planMeta.maxContacts),
            storageLimitGb: beSub.storageLimitGb != null ? beSub.storageLimitGb : (quota.storageLimitGb != null ? quota.storageLimitGb : (planMeta.storageLimitGb || 2)),
            contactsCount: quota.usedContacts != null ? quota.usedContacts : (prev.contactsCount || 0),
            seatsUsed: quota.usedSeats != null ? quota.usedSeats : (prev.seatsUsed || 1),
            daysRemaining: quota.daysRemaining != null ? quota.daysRemaining : 60,
            canAddMore: quota.canAddMore != null ? quota.canAddMore : true,
            nextRenewalDate: quota.nextRenewalDate || (beSub.endDate ? beSub.endDate.split('T')[0] : prev.nextRenewalDate),
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

  // ── GSAP Entrance Timeline ──────────────────────────────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.gsap-header-bar', {
      y: -18,
      opacity: 0,
      duration: 0.55,
    })
      .from(
        '.gsap-hero-card',
        {
          y: 24,
          opacity: 0,
          scale: 0.985,
          duration: 0.65,
        },
        '-=0.3'
      )
      .from(
        '.gsap-metric-card',
        {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.08,
        },
        '-=0.35'
      )
      .from(
        '.gsap-pricing-head',
        {
          y: 18,
          opacity: 0,
          duration: 0.5,
        },
        '-=0.2'
      )
      .from(
        '.gsap-pricing-item',
        {
          y: 28,
          opacity: 0,
          duration: 0.55,
          stagger: 0.1,
        },
        '-=0.3'
      )
      .from(
        '.gsap-invoice-card',
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
        },
        '-=0.2'
      );

    // Animate meter bars filling up smoothly
    gsap.from('.gsap-meter-fill', {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.1,
      ease: 'power2.out',
      delay: 0.35,
      stagger: 0.09,
    });
  }, { scope: containerRef });

  // ── GSAP Reactive Animation when Billing Cycle Toggles ───────────────────────
  useGSAP(() => {
    gsap.fromTo(
      '.gsap-price-figure',
      { y: -6, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.05 }
    );
    gsap.fromTo(
      '.gsap-cycle-pill',
      { scale: 0.92, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
  }, { scope: containerRef, dependencies: [billingCycle] });

  // ── GSAP Modal Entrance ─────────────────────────────────────────────────────
  useGSAP(() => {
    if (checkoutModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }
  }, { dependencies: [checkoutModalOpen] });

  const currentPlanKey = (
    subscription?.planTier ||
    subscription?.plan ||
    'trial'
  ).toLowerCase().includes('trial')
    ? 'trial'
    : (subscription?.planTier || subscription?.plan || '')
        .toLowerCase()
        .includes('starter')
    ? 'starter'
    : (subscription?.planTier || subscription?.plan || '')
        .toLowerCase()
        .includes('agency')
    ? 'agency'
    : (subscription?.planTier || subscription?.plan || '')
        .toLowerCase()
        .includes('professional')
    ? 'professional'
    : 'trial';

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
        agentName: agentName || subscription?.agentName || 'Agent',
        agentEmail: agentEmail || subscription?.agentEmail || 'khanh@insurmatch.us',
        planKey: planKey || 'professional',
        billingCycle: cycle || 'Monthly',
      });

      if (!data || !data.orderCode) {
        throw new Error('Không nhận được thông tin cổng thanh toán PayOS');
      }

      setPayosData(data);
      startPollingPaymentStatus(data.orderCode, planKey, cycle);
      startCountdownTimer();
    } catch (err) {
      console.warn('[PayOS Init] Error:', err);
      setPayosError(err.message || 'Không thể tạo liên kết thanh toán VietQR');
    } finally {
      setLoadingPayos(false);
    }
  }

  // 15-minute countdown timer
  function startCountdownTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdownSeconds(900);
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

  // Polling VietQR PayOS Status
  function startPollingPaymentStatus(orderCode, planKey, cycle) {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await checkPayosPaymentStatus(orderCode);
        if (res && (res.status === 'PAID' || res.status === 'COMPLETED' || res.isPaid)) {
          clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          handlePaymentSuccess(planKey, cycle, orderCode);
        }
      } catch (err) {
        console.warn('[PayOS Polling] Check error:', err.message);
      }
    }, 3000);
  }

  // Handle successful payment activation
  function handlePaymentSuccess(planKey, cycle, orderCode) {
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

    // Re-fetch backend subscription to refresh quota & database updates
    fetchMyBackendSubscription().then((data) => {
      if (data && data.subscription) {
        const beSub = data.subscription;
        const quota = data.quota || {};
        const planMeta = SAAS_PLANS[planKey.toLowerCase()] || SAAS_PLANS.professional;
        setSubscription((prev) => ({
          ...prev,
          plan: planMeta.name,
          planTier: (beSub.planTier || planKey).toUpperCase(),
          billingCycle: beSub.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly',
          maxSeats: beSub.seatsLimit || quota.maxSeats || planMeta.maxSeats,
          maxContacts: beSub.contactsLimit || quota.maxContacts || planMeta.maxContacts,
          storageLimitGb: beSub.storageLimitGb || quota.storageLimitGb || planMeta.storageLimitGb,
          contactsCount: quota.usedContacts != null ? quota.usedContacts : prev.contactsCount,
          seatsUsed: quota.usedSeats != null ? quota.usedSeats : prev.seatsUsed,
          daysRemaining: quota.daysRemaining != null ? quota.daysRemaining : 30,
          nextRenewalDate: quota.nextRenewalDate || (beSub.endDate ? beSub.endDate.split('T')[0] : prev.nextRenewalDate),
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

  // Simulate payment success (Demo / Testing Mode without banking app)
  async function handleSimulateSuccess() {
    if (!payosData?.orderCode) return;
    setIsSimulating(true);
    try {
      const res = await simulatePayosPaymentSuccess(payosData.orderCode);
      toast.success(res?.message || 'Mô phỏng thanh toán thành công! Đang kích hoạt gói...');
      handlePaymentSuccess(selectedPlanForCheckout, billingCycle, payosData.orderCode);
    } catch (err) {
      toast.error(err.message || 'Lỗi khi mô phỏng thanh toán');
    } finally {
      setIsSimulating(false);
    }
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
        `Chúc mừng! Bạn đã kích hoạt thành công gói ${targetPlanInfo.displayName} (${billingCycle === 'Annual' ? 'Thanh toán năm' : 'Thanh toán tháng'})!`,
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

  const seatsRatio = Math.min(
    100,
    ((subscription?.seatsUsed || 1) / (subscription?.maxSeats || (currentPlanKey === 'trial' ? 1 : currentPlanKey === 'starter' ? 1 : currentPlanKey === 'agency' ? 10 : 3))) * 100
  );
  const contactsRatio = Math.min(
    100,
    (((subscription?.contactsCount != null ? subscription?.contactsCount : 1) / (subscription?.maxContacts || (currentPlanKey === 'trial' ? 50 : currentPlanKey === 'starter' ? 100 : currentPlanKey === 'agency' ? 300 : 200))) * 100)
  );

  return (
    <div ref={containerRef} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-50/70 min-h-screen">
      {/* ── Top Header Bar with Glassmorphic Gradient ──────────────────────── */}
      <div className="gsap-header-bar flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-300">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
            </span>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                CRM Subscription Plans &amp; Resource Management
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
              <span>Hạ tầng quản lý gói đại lý</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span>Nâng cấp hạn mức hồ sơ (100 / 200 / 300)</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">bolt</span> VietQR PayOS 24/7
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenFullCheckout && (
            <button
              type="button"
              onClick={() => onOpenFullCheckout('professional', billingCycle.toLowerCase())}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
              <span>Trang Checkout Độc Lập</span>
            </button>
          )}

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 shadow-2xs ${
              currentPlanKey === 'trial'
                ? 'bg-amber-50/90 text-amber-800 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-emerald-50/90 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                currentPlanKey === 'trial' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="font-semibold text-slate-600">Active Tier:</span>
            <span className="font-black tracking-wide text-slate-900">
              {subscription?.plan || (currentPlanKey === 'trial' ? 'Trial 60 Ngày' : 'Starter')}
            </span>
          </div>
        </div>
      </div>

      {/* ── 1. Hero Card: Current Subscription with Deep Luxury Gradient ──── */}
      <div className="gsap-hero-card group relative rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-br from-[#070D1B] via-[#0F172A] to-[#1E293B]">
        {/* Animated Radial Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/25 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Plan Title & Dynamic Metrics */}
          <div className="space-y-5 max-w-2xl flex-grow">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                YOUR CURRENT SUBSCRIPTION
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                Active &amp; Verified
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex flex-wrap items-baseline gap-3">
                <span>{subscription?.agencyName || `${agentName || 'Nguyen Phuong Khai'} Insurance Agency`}</span>
                <span className="text-sm sm:text-base font-bold px-3 py-1 rounded-xl text-cyan-300 bg-cyan-500/15 border border-cyan-400/30">
                  {subscription?.plan || (currentPlanKey === 'trial' ? 'Trial' : 'Starter')}
                </span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-medium flex items-center gap-2 flex-wrap">
                <span>Licensed Agent: <strong className="text-white font-bold">{subscription?.agentName || agentName || 'Nguyen Phuong Khai'}</strong></span>
                <span className="text-slate-500">•</span>
                <span>Chu kỳ: <strong className="text-cyan-300">{currentPlanKey === 'trial' ? 'Dùng Thử Miễn Phí (60 Ngày)' : (subscription?.billingCycle === 'Annual' ? 'Thanh Toán Theo Năm' : 'Thanh Toán Hàng Tháng')}</strong></span>
              </p>
            </div>

            {/* 4 Quick Stat Boxes with Animated Meter Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Stat 1: Seats */}
              <div className="gsap-metric-card bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md hover:bg-white/10 transition-all duration-200">
                <span className="text-[11px] text-slate-400 block font-medium">Account Seats (Chỗ ngồi)</span>
                <span className="text-xl font-black text-white mt-1 block tabular-nums">
                  {subscription?.seatsUsed || 1} / {subscription?.maxSeats || (currentPlanKey === 'trial' ? 1 : currentPlanKey === 'starter' ? 1 : currentPlanKey === 'agency' ? 10 : 3)}{' '}
                  <span className="text-xs font-normal text-slate-400">seats</span>
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="gsap-meter-fill bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${seatsRatio}%` }}
                  />
                </div>
              </div>

              {/* Stat 2: Contacts */}
              <div className="gsap-metric-card bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md hover:bg-white/10 transition-all duration-200">
                <span className="text-[11px] text-slate-400 block font-medium">Customer Contacts Quota</span>
                <span className="text-xl font-black text-white mt-1 block tabular-nums">
                  {subscription?.contactsCount != null ? subscription?.contactsCount : 1} / {subscription?.maxContacts || (currentPlanKey === 'trial' ? 50 : currentPlanKey === 'starter' ? 100 : currentPlanKey === 'agency' ? 300 : 200)}{' '}
                  <span className="text-xs font-normal text-slate-400">hồ sơ</span>
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="gsap-meter-fill bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${contactsRatio}%` }}
                  />
                </div>
              </div>

              {/* Stat 3: Storage */}
              <div className="gsap-metric-card bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md hover:bg-white/10 transition-all duration-200">
                <span className="text-[11px] text-slate-400 block font-medium">Cloud Storage (Lưu trữ)</span>
                <span className="text-xl font-black text-white mt-1 block tabular-nums">
                  {subscription?.storageLimitGb || (currentPlanKey === 'trial' ? 1 : currentPlanKey === 'starter' ? 5 : currentPlanKey === 'agency' ? 50 : 15)}{' '}
                  <span className="text-xs font-normal text-slate-400">GB SSD</span>
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="gsap-meter-fill bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full transition-all duration-300"
                    style={{ width: '20%' }}
                  />
                </div>
              </div>

              {/* Stat 4: Renewal */}
              <div className="gsap-metric-card bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md hover:bg-white/10 transition-all duration-200">
                <span className="text-[11px] text-slate-400 block font-medium">Next Renewal (Gia hạn)</span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">
                  {subscription?.nextRenewalDate || '2027-02-02'}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-1.5 truncate">
                  {subscription?.daysRemaining != null ? `Còn ${subscription.daysRemaining} ngày` : 'Còn 86 ngày'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Quick Action CTA */}
          <div className="lg:border-l lg:border-white/10 lg:pl-8 flex flex-col justify-center items-start lg:items-end text-left lg:text-right shrink-0 min-w-[260px]">
            <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
              Subscription Fee (Phí duy trì)
            </span>

            <div className="text-3xl sm:text-4xl font-black text-white mt-1 tabular-nums tracking-tight">
              {currentPlanKey === 'trial' ? (
                <>0 đ <span className="text-sm font-normal text-slate-400">/ 60 ngày</span></>
              ) : currentPlanKey === 'starter' ? (
                subscription?.billingCycle === 'Annual' ? (
                  <>9.900.000 đ <span className="text-sm font-normal text-slate-400">/ năm</span></>
                ) : (
                  <>990.000 đ <span className="text-sm font-normal text-slate-400">/ tháng</span></>
                )
              ) : currentPlanKey === 'agency' ? (
                subscription?.billingCycle === 'Annual' ? (
                  <>49.900.000 đ <span className="text-sm font-normal text-slate-400">/ năm</span></>
                ) : (
                  <>4.990.000 đ <span className="text-sm font-normal text-slate-400">/ tháng</span></>
                )
              ) : (
                subscription?.billingCycle === 'Annual' ? (
                  <>19.900.000 đ <span className="text-sm font-normal text-slate-400">/ năm</span></>
                ) : (
                  <>1.990.000 đ <span className="text-sm font-normal text-slate-400">/ tháng</span></>
                )
              )}
            </div>

            <p className="text-[11px] text-cyan-300 font-bold mt-1">
              {currentPlanKey === 'trial'
                ? 'Miễn phí 100% không cần thẻ tín dụng'
                : subscription?.billingCycle === 'Annual'
                ? `Quy đổi: ~${currentPlanKey === 'starter' ? 32 : currentPlanKey === 'agency' ? 165 : 65} USD / tháng (Tiết kiệm 2 tháng)`
                : `Quy đổi: ~${currentPlanKey === 'starter' ? 39 : currentPlanKey === 'agency' ? 199 : 79} USD / tháng`}
            </p>

            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
              Tự động kích hoạt qua cổng PayOS VietQR Napas 24/7.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 w-full lg:w-auto">
              {currentPlanKey === 'agency' ? (
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-emerald-400 border border-emerald-400/30 flex items-center justify-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Đang Dùng Gói Cao Nhất (300 Hồ sơ)</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const target = currentPlanKey === 'trial' || currentPlanKey === 'starter'
                      ? 'professional'
                      : 'agency';
                    handleOpenCheckout(target);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">upgrade</span>
                  <span>
                    {currentPlanKey === 'trial'
                      ? 'Nâng Cấp Lên Pro (200 Hồ sơ)'
                      : currentPlanKey === 'starter'
                      ? 'Nâng Cấp Lên Pro (200 Hồ sơ)'
                      : 'Nâng Cấp Lên Agency (300 Hồ sơ)'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Pricing Section & Comparison with Interactive GSAP Toggle ── */}
      <div className="space-y-6 pt-4">
        <div className="gsap-pricing-head text-center max-w-xl mx-auto space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            BẢNG GIÁ DỊCH VỤ SAAS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Chọn Gói Đăng Ký CRM Phù Hợp Với Quy Mô Đại Lý
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hạ tầng CRM chuyên biệt cho đại lý bảo hiểm ACA / Medicare tại Hoa Kỳ với cổng thanh toán VietQR tự động 1–3s.
          </p>

          {/* Monthly / Annual Toggle with Animated Pill */}
          <div className="inline-flex items-center p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/80 mt-3 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('Monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                billingCycle === 'Monthly'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-400/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thanh Toán Hàng Tháng
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('Annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                billingCycle === 'Annual'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Thanh Toán Theo Năm</span>
              <span className="gsap-cycle-pill px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950 shadow-2xs">
                Tiết Kiệm 2 Tháng
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards: Starter (100), Professional (200), Agency (300) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
          {['starter', 'professional', 'agency'].map((key) => {
            const plan = SAAS_PLANS[key] || SAAS_PLANS.professional;
            const isCurrent = currentPlanKey === key;
            const isPopular = key === 'professional';
            const dbMatch = dbPlans.find((p) => {
              const code = (p.planCode || p.plan_code || p.name || '').toUpperCase();
              return code.includes(key.toUpperCase());
            });

            const displayPriceVnd = dbMatch
              ? (billingCycle === 'Annual'
                  ? (dbMatch.annualPriceVnd ?? dbMatch.annual_price_vnd ?? plan.annualVnd)
                  : (dbMatch.monthlyPriceVnd ?? dbMatch.monthly_price_vnd ?? plan.monthlyVnd))
              : (billingCycle === 'Annual' ? plan.annualVnd : plan.monthlyVnd);

            const displayPriceUsd = dbMatch
              ? (billingCycle === 'Annual'
                  ? (dbMatch.annualPriceUsd ?? dbMatch.annual_price_usd ?? Math.round(plan.annualPrice / 12))
                  : (dbMatch.monthlyPriceUsd ?? dbMatch.monthly_price_usd ?? plan.monthlyPrice))
              : (billingCycle === 'Annual' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice);

            const planMaxContacts = dbMatch?.maxContacts ?? dbMatch?.max_contacts ?? plan.maxContacts;
            const planMaxSeats = dbMatch?.maxSeats ?? dbMatch?.max_seats ?? plan.maxSeats;
            const planStorage = dbMatch?.storageLimitGb ?? dbMatch?.storage_limit_gb ?? plan.storageLimitGb ?? (key === 'starter' ? 5 : key === 'professional' ? 15 : 50);
            const planBadge = dbMatch?.badge || (key === 'professional' ? 'PHỔ BIẾN NHẤT' : key === 'agency' ? 'DOANH NGHIỆP' : null);

            let parsedFeatures = plan.features;
            if (dbMatch?.featuresJson) {
              try {
                const parsed = JSON.parse(dbMatch.featuresJson);
                if (Array.isArray(parsed) && parsed.length > 0) parsedFeatures = parsed;
              } catch {
                if (typeof dbMatch.featuresJson === 'string') {
                  parsedFeatures = dbMatch.featuresJson.split(',').map((s) => s.trim());
                }
              }
            } else if (dbMatch?.features) {
              parsedFeatures = Array.isArray(dbMatch.features) ? dbMatch.features : String(dbMatch.features).split(',').map((s) => s.trim());
            }

            return (
              <div
                key={key}
                className={`gsap-pricing-item group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 relative hover:shadow-xl hover:-translate-y-1.5 ${
                  isPopular
                    ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20 bg-gradient-to-b from-blue-50/30 to-white'
                    : isCurrent
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Floating Ribbon Badges */}
                {planBadge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
                    ★ {planBadge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                    <span>Đang Sử Dụng</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{dbMatch?.name || plan.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {dbMatch?.targetAudience || (key === 'starter' ? 'Cá nhân đại lý bảo hiểm' : key === 'professional' ? 'Đội nhóm kinh doanh nhỏ (1–3 người)' : 'Tổng đại lý / Văn phòng bảo hiểm')}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                      {planMaxSeats} {planMaxSeats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  {/* Price Block */}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="gsap-price-figure text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                      {Number(displayPriceVnd).toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      đ / {billingCycle === 'Annual' ? 'năm' : 'tháng'}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] font-semibold text-slate-400">
                    Quy đổi: ~${displayPriceUsd} / tháng {billingCycle === 'Annual' && '(thanh toán năm)'}
                  </div>

                  {billingCycle === 'Annual' && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/90 px-2.5 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">savings</span>
                      <span>Tiết kiệm 2 tháng: {Number((key === 'starter' ? 990000 : key === 'professional' ? 1990000 : 4990000) * 2).toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}

                  {/* Quota Highlights Box */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">contact_page</span>
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Hạn mức hồ sơ</span>
                        <strong className="text-xs text-slate-900 block font-extrabold">{planMaxContacts} Hồ sơ</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">cloud</span>
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Lưu trữ đám mây</span>
                        <strong className="text-xs text-slate-900 block font-extrabold">{planStorage} GB SSD</strong>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-5" />

                  {/* Features List */}
                  <ul className="space-y-3 text-xs text-slate-700">
                    {parsedFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[17px] text-emerald-600 shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span className="font-medium leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>✓ Gói Đang Dùng</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(key)}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                        isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                      <span>
                        {key === 'agency'
                          ? 'Nâng Cấp Lên Agency (300 Hồ sơ)'
                          : isPopular
                          ? 'Nâng Cấp Lên Pro (200 Hồ sơ)'
                          : 'Chọn Gói Starter (100 Hồ sơ)'}
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
      <div className="gsap-invoice-card bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all duration-300">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Lịch Sử Thanh Toán &amp; Hóa Đơn B2B SaaS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hóa đơn dịch vụ B2B SaaS tự động xuất và kích hoạt tức thì qua cổng VietQR PayOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.success('Toàn bộ bảng kê hóa đơn đã được gửi qua email!')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">mail</span>
            <span>Gửi Hóa Đơn Qua Email</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5">Mã Hóa Đơn</th>
                <th className="py-3.5 px-5">Ngày</th>
                <th className="py-3.5 px-5">Gói Dịch Vụ</th>
                <th className="py-3.5 px-5">Chu Kỳ</th>
                <th className="py-3.5 px-5 text-right">Số Tiền (USD)</th>
                <th className="py-3.5 px-5">Hình Thức</th>
                <th className="py-3.5 px-5 text-center">Trạng Thái</th>
                <th className="py-3.5 px-5 text-center">Biên Lai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices?.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{inv.invoiceId}</td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {new Date(inv.paidAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    {inv.planName} Tier
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">{inv.billingCycle}</td>
                  <td className="py-3.5 px-5 text-right font-black text-slate-900 tabular-nums">
                    ${Number(inv.amount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">{inv.paymentMethod}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đã Thanh Toán
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      type="button"
                      onClick={() => toast(`Đang tải hóa đơn ${inv.invoiceId}...`, { icon: '📄' })}
                      className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[95vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Thanh Toán Nâng Cấp Gói SaaS CRM</h3>
                  <p className="text-xs text-slate-500 font-medium">InsurMatch B2B Platform • Cổng Thanh Toán PayOS (VietQR)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Selected Plan Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/80 flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 block">
                    Gói dịch vụ đã chọn
                  </span>
                  <span className="text-lg font-black text-blue-950 mt-0.5 block">
                    {SAAS_PLANS[selectedPlanForCheckout]?.displayName}
                  </span>
                  <span className="text-xs text-blue-700 font-medium">
                    Hạn mức: <strong>{SAAS_PLANS[selectedPlanForCheckout]?.maxContacts} Hồ sơ</strong> • <strong>{SAAS_PLANS[selectedPlanForCheckout]?.storageLimitGb || 2} GB SSD</strong> • Chu kỳ: {billingCycle === 'Annual' ? 'Thanh toán Năm (Tiết kiệm 2 tháng)' : 'Hàng tháng'}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-blue-950 block tabular-nums">
                    ${billingCycle === 'Annual' ? SAAS_PLANS[selectedPlanForCheckout]?.annualPrice : SAAS_PLANS[selectedPlanForCheckout]?.monthlyPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 block tabular-nums">
                    ≈ {Number(payosData?.amount || (billingCycle === 'Annual' ? SAAS_PLANS[selectedPlanForCheckout]?.annualVnd : SAAS_PLANS[selectedPlanForCheckout]?.monthlyVnd)).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">Chọn phương thức thanh toán:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethodType('payos');
                      if (!payosData) initPayosLink(selectedPlanForCheckout, billingCycle);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      paymentMethodType === 'payos'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                      1–3s
                    </span>
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-emerald-600">qr_code_scanner</span>
                    <span className="block leading-tight font-bold">VietQR PayOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethodType === 'card'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-blue-600">credit_card</span>
                    <span className="block leading-tight font-medium">Thẻ Quốc Tế</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('stripe')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethodType === 'stripe'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
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
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3 animate-fade-in shadow-xs">
                      <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                        <span className="material-symbols-outlined text-[34px]">check</span>
                      </div>
                      <h4 className="text-base font-black text-emerald-900">
                        Thanh Toán Thành Công Qua PayOS!
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
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
                        <div className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          ⏱ {formatTimer(countdownSeconds)}
                        </div>
                      </div>

                      {/* QR and Transfer Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* QR Code Container */}
                        <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                          <div className="w-44 h-44 rounded-xl overflow-hidden bg-white p-1 border border-slate-100 flex items-center justify-center">
                            <img
                              src={
                                payosData?.qrCodeUrl ||
                                `https://img.vietqr.io/image/970422-0838780005-compact2.png?amount=${payosData?.amount || 1990000}&addInfo=${encodeURIComponent(payosData?.description || 'IM PROFESSIONAL')}&accountName=THE%20BEST%20RATE%20INSURANCE`
                              }
                              alt="VietQR Napas 247"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-center font-medium">
                            Mở App ngân hàng (MB, VCB, Techcombank,...) quét mã để thanh toán tức thì
                          </p>
                        </div>

                        {/* Account Details with Copy Buttons */}
                        <div className="space-y-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">NGÂN HÀNG</span>
                              <strong className="text-slate-900 block text-xs">MB Bank (Quân Đội)</strong>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Napas 247
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">SỐ TÀI KHOẢN</span>
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
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">CHỦ TÀI KHOẢN</span>
                            <strong className="text-slate-900 block text-xs uppercase">
                              {payosData?.accountName || 'THE BEST RATE INSURANCE'}
                            </strong>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">SỐ TIỀN CẦN THANH TOÁN</span>
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
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">NỘI DUNG CHUYỂN KHOẢN</span>
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

                      {/* Payment Actions & Webhook Status */}
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
