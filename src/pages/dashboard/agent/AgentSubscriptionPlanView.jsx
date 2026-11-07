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

const CANONICAL_PLAN_SPECS = {
  starter: {
    name: 'Starter',
    tagline: 'Cá nhân đại lý bảo hiểm độc lập',
    badge: 'TIÊU CHUẨN',
    monthlyVnd: 990000,
    annualVnd: 9900000,
    monthlyUsd: 39,
    annualUsdPerMonth: 32,
    maxSeats: 1,
    maxContacts: 100,
    storageGb: 5,
    accent: 'emerald',
    icon: 'person_Check',
    highlights: [
      '1 Licensed Agent Seat (Single User)',
      'Quản lý tối đa 100 Hồ sơ khách hàng (Contacts)',
      '5 GB SSD Cloud lưu trữ tài liệu bảo mật HIPAA',
      'Full Pipeline Obamacare (ACA) & Medicare 2026',
      'Theo dõi Hoa hồng (Commission Ledger) tự động',
      'Tích hợp tạo Ticket hỗ trợ & Nhắc lịch gia hạn',
    ],
  },
  professional: {
    name: 'Professional',
    tagline: 'Đội nhóm kinh doanh tăng trưởng (1–3 người)',
    badge: 'PHỔ BIẾN NHẤT',
    monthlyVnd: 1990000,
    annualVnd: 19900000,
    monthlyUsd: 79,
    annualUsdPerMonth: 65,
    maxSeats: 3,
    maxContacts: 200,
    storageGb: 15,
    accent: 'blue',
    icon: 'rocket_launch',
    highlights: [
      'Tối đa 3 Agent Seats làm việc nhóm đồng thời',
      'Nâng cấp hạn mức 200 Hồ sơ khách hàng (Contacts)',
      '15 GB SSD Cloud lưu trữ hồ sơ & ghi âm cuộc gọi',
      'Ưu tiên nhận Lead từ cổng Matchmaking Portal',
      'Tự động cảnh báo khách sắp tròn 65 tuổi (Medicare)',
      'Báo cáo doanh thu & đối soát hoa hồng nâng cao',
    ],
  },
  agency: {
    name: 'Agency',
    tagline: 'Tổng đại lý / Văn phòng bảo hiểm quy mô lớn',
    badge: 'DOANH NGHIỆP',
    monthlyVnd: 4990000,
    annualVnd: 49900000,
    monthlyUsd: 199,
    annualUsdPerMonth: 165,
    maxSeats: 10,
    maxContacts: 300,
    storageGb: 50,
    accent: 'violet',
    icon: 'apartment',
    highlights: [
      'Tối đa 10 Seats phân quyền Quản lý / Staff / Agent',
      'Hạn mức tối đa 300+ Hồ sơ khách hàng VIP',
      '50 GB SSD Cloud tốc độ cao & sao lưu tự động',
      'Phân bổ Lead tự động (Round-Robin Lead Routing)',
      'API Webhook kết nối CRM & báo cáo đa chi nhánh',
      'Chuyên viên hỗ trợ kỹ thuật & vận hành 24/7 riêng',
    ],
  },
};

export default function AgentSubscriptionPlanView({
  agentName = '',
  agentEmail = 'khanh@insurmatch.us',
  onOpenFullCheckout,
}) {
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const togglePillRef = useRef(null);
  const monthlyBtnRef = useRef(null);
  const annualBtnRef = useRef(null);
  const heroSpotlightRef = useRef(null);
  const priceRefs = useRef({});
  const heroPriceRef = useRef(null);

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
            storageLimitGb: beSub.storageLimitGb != null ? beSub.storageLimitGb : (quota.storageLimitGb != null ? quota.storageLimitGb : (planMeta.storageLimitGb || 5)),
            contactsCount: quota.usedContacts != null ? quota.usedContacts : (prev.contactsCount || 1),
            seatsUsed: quota.usedSeats != null ? quota.usedSeats : (prev.seatsUsed || 1),
            daysRemaining: quota.daysRemaining != null ? quota.daysRemaining : 86,
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

  const currentPlanKey = (
    subscription?.planTier ||
    subscription?.plan ||
    'starter'
  ).toLowerCase().includes('trial')
    ? 'trial'
    : (subscription?.planTier || subscription?.plan || '')
        .toLowerCase()
        .includes('agency')
    ? 'agency'
    : (subscription?.planTier || subscription?.plan || '')
        .toLowerCase()
        .includes('professional')
    ? 'professional'
    : 'starter';

  const currentSpec = CANONICAL_PLAN_SPECS[currentPlanKey] || CANONICAL_PLAN_SPECS.starter;
  const maxSeats = subscription?.maxSeats || currentSpec.maxSeats;
  const usedSeats = subscription?.seatsUsed || 1;
  const maxContacts = subscription?.maxContacts || currentSpec.maxContacts;
  const usedContacts = subscription?.contactsCount != null ? subscription.contactsCount : 1;
  const storageGb = subscription?.storageLimitGb || currentSpec.storageGb;
  const daysLeft = subscription?.daysRemaining != null ? subscription.daysRemaining : 86;

  const seatsPct = gsap.utils.clamp(8, 100, Math.round((usedSeats / maxSeats) * 100));
  const contactsPct = gsap.utils.clamp(6, 100, Math.round((usedContacts / maxContacts) * 100));
  const storagePct = 24;
  const renewalPct = gsap.utils.clamp(15, 100, Math.round((daysLeft / 90) * 100));

  // ── 1. Master GSAP Entrance Timeline + Ambient Loop ────────────────────────
  const { contextSafe } = useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.65 },
      });

      tl.addLabel('start', 0)
        .from('.gsap-top-nav', { y: -24, autoAlpha: 0, duration: 0.55 }, 'start')
        .from(
          '.gsap-bento-hero',
          { y: 32, autoAlpha: 0, scale: 0.975, duration: 0.75, ease: 'expo.out' },
          'start+=0.1'
        )
        .from(
          '.gsap-bento-stat',
          {
            y: 24,
            autoAlpha: 0,
            scale: 0.94,
            stagger: 0.08,
            duration: 0.55,
            ease: 'back.out(1.4)',
          },
          'start+=0.28'
        )
        .from(
          '.gsap-fee-panel',
          { x: 28, autoAlpha: 0, duration: 0.6, ease: 'power3.out' },
          'start+=0.32'
        )
        .addLabel('pricing', 'start+=0.4')
        .from(
          '.gsap-section-header',
          { y: 24, autoAlpha: 0, duration: 0.55 },
          'pricing'
        )
        .from(
          '.gsap-plan-card',
          {
            y: 44,
            autoAlpha: 0,
            scale: 0.95,
            stagger: 0.12,
            duration: 0.7,
            ease: 'expo.out',
          },
          'pricing+=0.15'
        )
        .from(
          '.gsap-ledger-section',
          { y: 30, autoAlpha: 0, duration: 0.6 },
          '-=0.3'
        );

      // SVG circular ring gauges animation
      gsap.utils.toArray('.gsap-ring-progress').forEach((circle) => {
        const targetOffset = Number(circle.getAttribute('data-offset') || 0);
        gsap.fromTo(
          circle,
          { strokeDashoffset: 138 },
          {
            strokeDashoffset: targetOffset,
            duration: 1.4,
            ease: 'expo.out',
            delay: 0.45,
          }
        );
      });

      // Linear bar fills
      gsap.fromTo(
        '.gsap-bar-fill',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 1.25,
          ease: 'expo.out',
          stagger: 0.08,
          delay: 0.4,
        }
      );

      // Ambient floating orbs (infinite yoyo timeline)
      gsap.to('.gsap-aurora-orb-1', {
        x: 35,
        y: -25,
        scale: 1.12,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.gsap-aurora-orb-2', {
        x: -30,
        y: 25,
        scale: 1.15,
        duration: 7.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Continuous subtle pulse on savings badge
      gsap.to('.gsap-savings-badge', {
        scale: 1.05,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: containerRef }
  );

  // ── 2. GSAP Number Counter & Sliding Pill on Billing Cycle Change ──────────
  useGSAP(
    () => {
      // Animate sliding pill background in toggle
      const activeBtn = billingCycle === 'Monthly' ? monthlyBtnRef.current : annualBtnRef.current;
      if (activeBtn && togglePillRef.current) {
        gsap.to(togglePillRef.current, {
          x: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
          duration: 0.45,
          ease: 'expo.out',
        });
      }

      // Roll price numbers smoothly using gsap.utils.snap
      ['starter', 'professional', 'agency'].forEach((key, idx) => {
        const el = priceRefs.current[key];
        if (!el) return;
        const spec = CANONICAL_PLAN_SPECS[key];
        const targetVal = billingCycle === 'Annual' ? spec.annualVnd : spec.monthlyVnd;
        const prevVal = Number(el.getAttribute('data-val') || targetVal);

        const counter = { val: prevVal };
        gsap.to(counter, {
          val: targetVal,
          duration: 0.65,
          ease: 'power3.out',
          onUpdate: () => {
            const snapped = gsap.utils.snap(1000, counter.val);
            el.textContent = snapped.toLocaleString('vi-VN');
          },
          onComplete: () => {
            el.setAttribute('data-val', String(targetVal));
            el.textContent = targetVal.toLocaleString('vi-VN');
          },
        });

        gsap.fromTo(
          el,
          { y: -8, scale: 0.96 },
          { y: 0, scale: 1, duration: 0.45, delay: idx * 0.04, ease: 'back.out(2)' }
        );
      });
    },
    { scope: containerRef, dependencies: [billingCycle] }
  );

  // ── 3. Interactive 3D Card Tilt & Spotlight via contextSafe + quickTo ──────
  const handleHeroMouseMove = contextSafe((e) => {
    if (!heroSpotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    gsap.to(heroSpotlightRef.current, {
      x: relX - 220,
      y: relY - 220,
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  const handleHeroMouseLeave = contextSafe(() => {
    if (!heroSpotlightRef.current) return;
    gsap.to(heroSpotlightRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  });

  const handleCardMouseMove = contextSafe((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const normX = gsap.utils.normalize(0, rect.width, e.clientX - rect.left);
    const normY = gsap.utils.normalize(0, rect.height, e.clientY - rect.top);
    const rotateY = gsap.utils.mapRange(0, 1, -4.5, 4.5, normX);
    const rotateX = gsap.utils.mapRange(0, 1, 4.5, -4.5, normY);

    gsap.to(card, {
      rotateX,
      rotateY,
      y: -8,
      transformPerspective: 1000,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  const handleCardMouseLeave = contextSafe((e) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.65,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto',
    });
  });

  // ── 4. GSAP Modal Entrance ─────────────────────────────────────────────────
  useGSAP(
    () => {
      if (checkoutModalOpen && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.9, autoAlpha: 0, y: 24 },
          { scale: 1, autoAlpha: 1, y: 0, duration: 0.42, ease: 'back.out(1.6)' }
        );
      }
    },
    { dependencies: [checkoutModalOpen] }
  );

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

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Ring stroke-dashoffset helper (circumference = 2 * PI * 22 ≈ 138.2)
  const calcRingOffset = (pct) => Math.round(138.2 * (1 - gsap.utils.clamp(0, 100, pct) / 100));

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#F4F7FB] text-slate-900 overflow-x-hidden pb-16"
    >
      {/* Background Subtle Architectural Grid + Top Radial Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-blue-600/[0.06] via-indigo-500/[0.03] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ── 0. Executive Command Bar ────────────────────────────────────── */}
        <div className="gsap-top-nav flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 backdrop-blur-xl px-5 py-4 rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#0B1120] text-white shadow-lg shadow-blue-950/20 border border-slate-700/80">
              <span className="material-symbols-outlined text-[22px] text-cyan-400">
                deployed_code
              </span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                  INSURMATCH CLOUD B2B
                </span>
                <span className="text-[11px] font-semibold text-slate-400">•</span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Cổng thanh toán tự động VietQR PayOS 24/7
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Quản Lý Gói Thuê Bao &amp; Hạ Tầng Tài Nguyên Đại Lý
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenFullCheckout && (
              <button
                type="button"
                onClick={() => onOpenFullCheckout('professional', billingCycle.toLowerCase())}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">
                  open_in_new
                </span>
                <span>Trang Checkout Độc Lập</span>
              </button>
            )}

            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1120] text-white border border-slate-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-slate-400 font-medium">Gói hiện tại:</span>
              <span className="text-cyan-300 font-black uppercase tracking-wider">
                {currentSpec.name}
              </span>
            </div>
          </div>
        </div>

        {/* ── 1. Bento Resource Command Center (Hero) ──────────────────────── */}
        <div
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="gsap-bento-hero relative rounded-[28px] bg-[#070B14] text-white p-6 sm:p-8 lg:p-9 shadow-[0_24px_60px_-15px_rgba(7,11,20,0.65)] border border-slate-800/90 overflow-hidden"
        >
          {/* Interactive GSAP Cursor Spotlight */}
          <div
            ref={heroSpotlightRef}
            className="pointer-events-none absolute top-0 left-0 w-[440px] h-[440px] rounded-full bg-radial from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl opacity-0 will-change-transform"
          />

          {/* Continuous GSAP Floating Aurora Orbs */}
          <div className="gsap-aurora-orb-1 pointer-events-none absolute -top-28 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-500/15 to-transparent blur-3xl will-change-transform" />
          <div className="gsap-aurora-orb-2 pointer-events-none absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-500/15 via-cyan-500/15 to-transparent blur-3xl will-change-transform" />

          {/* Subtle Tech Grid Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left 8 Columns: Agency Status & 4 Radial Gauge Bento Cards */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] bg-blue-500/15 text-cyan-300 border border-cyan-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    ACTIVE AGENCY WORKSPACE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    CMS &amp; HIPAA Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-300 bg-white/5 border border-white/10">
                    Chu kỳ: {subscription?.billingCycle === 'Annual' ? 'Thanh Toán Năm' : 'Thanh Toán Hàng Tháng'}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-white leading-tight">
                    {subscription?.agencyName || `${agentName || 'Nguyen Phuong Khai'} Insurance Agency`}
                  </h2>
                  <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30">
                    {currentSpec.name} Tier
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-2">
                  <span>
                    Licensed Principal Agent:{' '}
                    <strong className="text-white font-semibold">
                      {subscription?.agentName || agentName || 'Nguyen Phuong Khai'}
                    </strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>
                    Email:{' '}
                    <span className="text-slate-300 font-mono text-xs">{agentEmail}</span>
                  </span>
                </p>
              </div>

              {/* 4 SVG Radial Gauge Bento Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {/* Gauge 1: Account Seats */}
                <div className="gsap-bento-stat group relative rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 p-4 transition-all duration-300 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Account Seats
                      </span>
                      <div className="text-xl font-black text-white mt-1 tabular-nums">
                        {usedSeats} <span className="text-slate-500 font-normal">/</span> {maxSeats}
                        <span className="text-[11px] font-medium text-slate-400 ml-1">chỗ</span>
                      </div>
                    </div>
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="4.5"
                        />
                        <circle
                          className="gsap-ring-progress"
                          data-offset={calcRingOffset(seatsPct)}
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray="138.2"
                          strokeDashoffset="138.2"
                        />
                      </svg>
                      <span className="material-symbols-outlined text-[16px] text-cyan-400 absolute">
                        badge
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="gsap-bar-fill h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${seatsPct}%` }}
                    />
                  </div>
                </div>

                {/* Gauge 2: Customer Contacts Quota */}
                <div className="gsap-bento-stat group relative rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 p-4 transition-all duration-300 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Contacts Quota
                      </span>
                      <div className="text-xl font-black text-white mt-1 tabular-nums">
                        {usedContacts} <span className="text-slate-500 font-normal">/</span> {maxContacts}
                        <span className="text-[11px] font-medium text-slate-400 ml-1">hồ sơ</span>
                      </div>
                    </div>
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="4.5"
                        />
                        <circle
                          className="gsap-ring-progress"
                          data-offset={calcRingOffset(contactsPct)}
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="#34D399"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray="138.2"
                          strokeDashoffset="138.2"
                        />
                      </svg>
                      <span className="material-symbols-outlined text-[16px] text-emerald-400 absolute">
                        folder_shared
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="gsap-bar-fill h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300"
                      style={{ width: `${contactsPct}%` }}
                    />
                  </div>
                </div>

                {/* Gauge 3: Cloud Storage SSD */}
                <div className="gsap-bento-stat group relative rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 p-4 transition-all duration-300 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Cloud SSD
                      </span>
                      <div className="text-xl font-black text-white mt-1 tabular-nums">
                        {storageGb}
                        <span className="text-xs font-semibold text-indigo-300 ml-1">GB NVMe</span>
                      </div>
                    </div>
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="4.5"
                        />
                        <circle
                          className="gsap-ring-progress"
                          data-offset={calcRingOffset(storagePct)}
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="#818CF8"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray="138.2"
                          strokeDashoffset="138.2"
                        />
                      </svg>
                      <span className="material-symbols-outlined text-[16px] text-indigo-400 absolute">
                        cloud_done
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="gsap-bar-fill h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                      style={{ width: `${storagePct}%` }}
                    />
                  </div>
                </div>

                {/* Gauge 4: Next Renewal */}
                <div className="gsap-bento-stat group relative rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 p-4 transition-all duration-300 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Gia Hạn Tiếp
                      </span>
                      <div className="text-sm font-black text-white mt-1.5 font-mono">
                        {subscription?.nextRenewalDate || '2027-02-02'}
                      </div>
                    </div>
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="4.5"
                        />
                        <circle
                          className="gsap-ring-progress"
                          data-offset={calcRingOffset(renewalPct)}
                          cx="26"
                          cy="26"
                          r="22"
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeDasharray="138.2"
                          strokeDashoffset="138.2"
                        />
                      </svg>
                      <span className="material-symbols-outlined text-[16px] text-amber-400 absolute">
                        event_upcoming
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">Còn {daysLeft} ngày</span>
                    <span className="text-slate-400 font-mono">Auto-PayOS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Glowing Subscription Fee & Quick Upgrade Panel */}
            <div className="gsap-fee-panel lg:col-span-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 p-6 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
              <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-400/15 blur-2xl" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Phí Duy Trì Hiện Tại
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Napas 24/7
                  </span>
                </div>

                <div className="pt-1 flex items-baseline gap-1.5">
                  <span
                    ref={heroPriceRef}
                    className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight"
                  >
                    {(subscription?.billingCycle === 'Annual'
                      ? currentSpec.annualVnd
                      : currentSpec.monthlyVnd
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    / {subscription?.billingCycle === 'Annual' ? 'năm' : 'tháng'}
                  </span>
                </div>

                <div className="text-xs font-bold text-cyan-300">
                  Quy đổi: ~${subscription?.billingCycle === 'Annual' ? currentSpec.annualUsdPerMonth : currentSpec.monthlyUsd} USD / tháng
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Kích hoạt tức thì qua mã QR động PayOS trong 1–3 giây. Giữ 100% hoa hồng từ hãng bảo hiểm.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-white/10 space-y-2.5">
                {currentPlanKey === 'agency' ? (
                  <div className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                    <span>Đang Sử Dụng Gói Cao Cấp Nhất (300 Hồ sơ)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCheckout(
                        currentPlanKey === 'starter' || currentPlanKey === 'trial'
                          ? 'professional'
                          : 'agency'
                      )
                    }
                    className="w-full py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-slate-950 shadow-[0_10px_25px_-5px_rgba(56,189,248,0.45)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                    <span>
                      {currentPlanKey === 'starter' || currentPlanKey === 'trial'
                        ? 'Nâng Cấp Lên Pro (200 Hồ sơ)'
                        : 'Nâng Cấp Lên Agency (300 Hồ sơ)'}
                    </span>
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">
                      lock
                    </span>
                    Bảo mật SSL 256-bit
                  </span>
                  <span>Xuất hóa đơn B2B tự động</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Tiered Pricing Matrix with GSAP Sliding Toggle & 3D Cards ─── */}
        <div className="space-y-8 pt-4">
          <div className="gsap-section-header text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.15em] bg-blue-600/10 text-blue-700 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              CHỌN GÓI HẠ TẦNG CRM THEO QUY MÔ ĐẠI LÝ
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Đầu Tư Một Lần — Tăng Tốc Chốt Deal Bảo Hiểm
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Không chia sẻ hoa hồng, không phí ẩn. Nâng cấp hạn mức hồ sơ khách hàng bất kỳ lúc nào chỉ với 1 lần quét VietQR.
            </p>

            {/* GSAP Sliding Pill Toggle */}
            <div className="pt-2 flex justify-center">
              <div className="relative inline-flex items-center p-1.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg">
                {/* Sliding Active Background Pill */}
                <div
                  ref={togglePillRef}
                  className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md"
                  style={{ width: '176px', transform: 'translateX(6px)' }}
                />

                <button
                  ref={monthlyBtnRef}
                  type="button"
                  onClick={() => setBillingCycle('Monthly')}
                  className={`relative z-10 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                    billingCycle === 'Monthly'
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Thanh Toán Hàng Tháng
                </button>

                <button
                  ref={annualBtnRef}
                  type="button"
                  onClick={() => setBillingCycle('Annual')}
                  className={`relative z-10 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 ${
                    billingCycle === 'Annual'
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Thanh Toán Theo Năm</span>
                  <span className="gsap-savings-badge px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                    Tiết kiệm 2 tháng
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 High-Contrast Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch pt-2">
            {['starter', 'professional', 'agency'].map((key) => {
              const spec = CANONICAL_PLAN_SPECS[key];
              const isCurrent = currentPlanKey === key;
              const isPro = key === 'professional';
              const isAgency = key === 'agency';

              const displayVnd = billingCycle === 'Annual' ? spec.annualVnd : spec.monthlyVnd;
              const displayUsd = billingCycle === 'Annual' ? spec.annualUsdPerMonth : spec.monthlyUsd;
              const annualSavingsVnd = spec.monthlyVnd * 2;

              return (
                <div
                  key={key}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  className={`gsap-plan-card relative rounded-[28px] flex flex-col justify-between p-7 sm:p-8 will-change-transform transition-shadow duration-300 ${
                    isPro
                      ? 'bg-gradient-to-b from-[#090E1A] via-[#0F172A] to-[#17153B] text-white border-2 border-cyan-400/60 shadow-[0_28px_70px_-15px_rgba(37,99,235,0.45)] lg:-mt-3 lg:mb-3'
                      : isAgency
                      ? 'bg-white text-slate-900 border-2 border-indigo-200/90 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.12)]'
                      : 'bg-white text-slate-900 border-2 border-slate-200/90 shadow-[0_16px_40px_-15px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  {/* Top Decorative Glow on Pro Card */}
                  {isPro && (
                    <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full bg-cyan-400/20 blur-3xl" />
                  )}

                  {/* Top Floating Ribbon Badge */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : isPro
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-sm shadow-cyan-400/30'
                          : isAgency
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isCurrent ? 'check_circle' : isPro ? 'auto_awesome' : 'verified'}
                      </span>
                      <span>{isCurrent ? 'ĐANG SỬ DỤNG' : spec.badge}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        isPro
                          ? 'bg-white/10 text-cyan-300 border border-white/15'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      {spec.maxSeats} {spec.maxSeats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  <div>
                    {/* Plan Name & Subtitle */}
                    <div>
                      <h3
                        className={`text-2xl font-black tracking-tight ${
                          isPro ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {spec.name}
                      </h3>
                      <p
                        className={`text-xs font-medium mt-1 ${
                          isPro ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {spec.tagline}
                      </p>
                    </div>

                    {/* Animated Price Block */}
                    <div className="mt-6 pt-5 border-t border-current/10">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          ref={(el) => {
                            if (el) priceRefs.current[key] = el;
                          }}
                          data-val={displayVnd}
                          className={`text-3xl sm:text-[38px] font-black tracking-tight tabular-nums leading-none ${
                            isPro ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {displayVnd.toLocaleString('vi-VN')}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isPro ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          đ / {billingCycle === 'Annual' ? 'năm' : 'tháng'}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isPro ? 'text-cyan-300' : 'text-slate-500'
                          }`}
                        >
                          Quy đổi: ~${displayUsd} USD / tháng
                        </span>

                        {billingCycle === 'Annual' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-950 bg-amber-400 px-2 py-0.5 rounded-md">
                            -{annualSavingsVnd.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Resource Quota Bento Strip inside Card */}
                    <div
                      className={`mt-5 p-3.5 rounded-2xl grid grid-cols-2 gap-3 border ${
                        isPro
                          ? 'bg-white/[0.06] border-white/15'
                          : isAgency
                          ? 'bg-indigo-50/50 border-indigo-100'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isPro
                              ? 'bg-cyan-400/20 text-cyan-300'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            contacts
                          </span>
                        </span>
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase block ${
                              isPro ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            Hạn mức
                          </span>
                          <strong
                            className={`text-xs font-black block ${
                              isPro ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {spec.maxContacts} Hồ sơ
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isPro
                              ? 'bg-indigo-400/20 text-indigo-300'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            hard_drive
                          </span>
                        </span>
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase block ${
                              isPro ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            Lưu trữ
                          </span>
                          <strong
                            className={`text-xs font-black block ${
                              isPro ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {spec.storageGb} GB SSD
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="mt-6 space-y-3 text-xs">
                      {spec.highlights.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span
                            className={`material-symbols-outlined text-[17px] shrink-0 mt-0.5 ${
                              isPro ? 'text-cyan-400' : 'text-emerald-600'
                            }`}
                          >
                            check_circle
                          </span>
                          <span
                            className={`font-medium leading-relaxed ${
                              isPro ? 'text-slate-200' : 'text-slate-700'
                            }`}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="mt-8 pt-5 border-t border-current/10">
                    {isCurrent ? (
                      <button
                        type="button"
                        disabled
                        className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-default ${
                          isPro
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Đang Sử Dụng Gói Này</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(key)}
                        className={`w-full py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                          isPro
                            ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-[0_12px_30px_-6px_rgba(56,189,248,0.55)]'
                            : isAgency
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                        <span>
                          {isAgency
                            ? 'Nâng Cấp Lên Agency (300 Hồ sơ)'
                            : isPro
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

        {/* ── 3. Billing & Invoices Ledger ─────────────────────────────────── */}
        <div className="gsap-ledger-section bg-white rounded-[24px] border border-slate-200/90 shadow-[0_12px_36px_-12px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-[#0B1120] text-cyan-400 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Lịch Sử Giao Dịch &amp; Hóa Đơn Điện Tử B2B SaaS
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biên lai thanh toán tự động đối soát qua cổng PayOS VietQR &amp; Stripe
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.success('Toàn bộ bảng kê hóa đơn đã được gửi qua email!')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">
                forward_to_inbox
              </span>
              <span>Xuất &amp; Gửi Hóa Đơn Qua Email</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/70 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Mã Hóa Đơn</th>
                  <th className="py-3.5 px-5">Ngày Thanh Toán</th>
                  <th className="py-3.5 px-5">Gói Dịch Vụ</th>
                  <th className="py-3.5 px-5">Chu Kỳ</th>
                  <th className="py-3.5 px-5 text-right">Số Tiền (USD)</th>
                  <th className="py-3.5 px-5">Cổng Thanh Toán</th>
                  <th className="py-3.5 px-5 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-5 text-center">Biên Lai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices?.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-blue-50/35 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {inv.invoiceId}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {new Date(inv.paidAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {inv.planName} Tier
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{inv.billingCycle}</td>
                    <td className="py-3.5 px-5 text-right font-black text-slate-900 tabular-nums">
                      ${Number(inv.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Đã Thanh Toán
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => toast(`Đang tải hóa đơn ${inv.invoiceId}...`, { icon: '📄' })}
                        className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
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
      </div>

      {/* ── 4. Checkout & Activation Modal (VietQR PayOS + Card) ──────────── */}
      {checkoutModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[95vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#0B1120] text-white shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </span>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    Thanh Toán Nâng Cấp Gói SaaS CRM
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    InsurMatch B2B Platform • Cổng Thanh Toán Tự Động PayOS (VietQR)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Selected Plan Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 block">
                    Gói dịch vụ đã chọn
                  </span>
                  <span className="text-lg font-black text-blue-950 mt-0.5 block">
                    {CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.name || SAAS_PLANS[selectedPlanForCheckout]?.displayName} Tier
                  </span>
                  <span className="text-xs text-blue-700 font-medium">
                    Hạn mức:{' '}
                    <strong>
                      {CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.maxContacts || 200} Hồ sơ
                    </strong>{' '}
                    •{' '}
                    <strong>
                      {CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.storageGb || 15} GB SSD
                    </strong>{' '}
                    • Chu kỳ: {billingCycle === 'Annual' ? 'Thanh toán Năm (-2 tháng)' : 'Hàng tháng'}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-blue-950 block tabular-nums">
                    $
                    {billingCycle === 'Annual'
                      ? (CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.annualUsdPerMonth || 65) * 12
                      : CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.monthlyUsd || 79}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 block tabular-nums">
                    ≈{' '}
                    {Number(
                      payosData?.amount ||
                        (billingCycle === 'Annual'
                          ? CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.annualVnd
                          : CANONICAL_PLAN_SPECS[selectedPlanForCheckout]?.monthlyVnd)
                    ).toLocaleString('vi-VN')}{' '}
                    VNĐ
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Chọn phương thức thanh toán:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethodType('payos');
                      if (!payosData) initPayosLink(selectedPlanForCheckout, billingCycle);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      paymentMethodType === 'payos'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white">
                      1–3s
                    </span>
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-emerald-600">
                      qr_code_scanner
                    </span>
                    <span className="block leading-tight font-bold">VietQR PayOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethodType === 'card'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-blue-600">
                      credit_card
                    </span>
                    <span className="block leading-tight font-medium">Thẻ Quốc Tế</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('stripe')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethodType === 'stripe'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] block mx-auto mb-1 text-indigo-600">
                      account_balance
                    </span>
                    <span className="block leading-tight font-medium">Stripe / ACH</span>
                  </button>
                </div>
              </div>

              {/* ── METHOD 1: PAYOS VIETQR VIEW ── */}
              {paymentMethodType === 'payos' && (
                <div className="space-y-4">
                  {isPaidSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                        <span className="material-symbols-outlined text-[34px]">check</span>
                      </div>
                      <h4 className="text-base font-black text-emerald-900">
                        Thanh Toán Thành Công Qua PayOS!
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                        Hệ thống đã nhận được giao dịch và tự động kích hoạt gói{' '}
                        <strong>{SAAS_PLANS[selectedPlanForCheckout]?.displayName}</strong>. Hạn mức
                        mới: <strong>{SAAS_PLANS[selectedPlanForCheckout]?.maxContacts} Contacts</strong>.
                      </p>
                    </div>
                  ) : loadingPayos ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                      <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
                      <p className="text-xs font-semibold text-slate-700">
                        Đang khởi tạo mã VietQR động từ PayOS...
                      </p>
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
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Chờ chuyển khoản Napas 24/7 (Tự động kích hoạt)</span>
                        </div>
                        <div className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          ⏱ {formatTimer(countdownSeconds)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                          <div className="w-44 h-44 rounded-xl overflow-hidden bg-white p-1 border border-slate-100 flex items-center justify-center">
                            <img
                              src={
                                payosData?.qrCodeUrl ||
                                `https://img.vietqr.io/image/970422-0838780005-compact2.png?amount=${
                                  payosData?.amount || 1990000
                                }&addInfo=${encodeURIComponent(
                                  payosData?.description || 'IM PROFESSIONAL'
                                )}&accountName=THE%20BEST%20RATE%20INSURANCE`
                              }
                              alt="VietQR Napas 247"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-center font-medium">
                            Mở App ngân hàng (MB, VCB, Techcombank,...) quét mã để thanh toán tức thì
                          </p>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                                NGÂN HÀNG
                              </span>
                              <strong className="text-slate-900 block text-xs">
                                MB Bank (Quân Đội)
                              </strong>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Napas 247
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                                SỐ TÀI KHOẢN
                              </span>
                              <strong className="text-slate-900 font-mono text-sm block">
                                0838780005
                              </strong>
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
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                              CHỦ TÀI KHOẢN
                            </span>
                            <strong className="text-slate-900 block text-xs uppercase">
                              {payosData?.accountName || 'THE BEST RATE INSURANCE'}
                            </strong>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                                SỐ TIỀN CẦN THANH TOÁN
                              </span>
                              <strong className="text-emerald-700 font-mono text-sm block">
                                {Number(payosData?.amount || 1990000).toLocaleString('vi-VN')} VNĐ
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(payosData?.amount || 1990000, 'Số tiền')
                              }
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              Copy tiền
                            </button>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                                NỘI DUNG CHUYỂN KHOẢN
                              </span>
                              <strong className="text-blue-900 font-mono text-xs block">
                                {payosData?.description ||
                                  `IM ${selectedPlanForCheckout.toUpperCase()}`}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  payosData?.description ||
                                    `IM ${selectedPlanForCheckout.toUpperCase()}`,
                                  'Nội dung CK'
                                )
                              }
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              Copy ND
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 space-y-2.5">
                        {payosData?.checkoutUrl && payosData.checkoutUrl.startsWith('http') && (
                          <a
                            href={payosData.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center justify-center gap-2 text-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              open_in_new
                            </span>
                            <span>Mở Trang Thanh Toán PayOS (Cổng Thanh Toán Trực Tuyến)</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={handleSimulateSuccess}
                          disabled={isSimulating}
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
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
                        <label className="block text-slate-600 font-medium mb-1">
                          Expiration Date (MM/YY)
                        </label>
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
                      <label className="block text-slate-600 font-medium mb-1">
                        Cardholder Name
                      </label>
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
                    <span className="material-symbols-outlined text-[20px] text-indigo-600">
                      lock
                    </span>
                    <span>Cổng Thanh Toán Quốc Tế Stripe 3D-Secure</span>
                  </div>
                  <p>
                    Hệ thống sẽ chuyển hướng bạn đến trang thanh toán bảo mật Stripe để hoàn tất
                    giao dịch bằng thẻ quốc tế hoặc tài khoản doanh nghiệp US ACH.
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
