import React, { useState, useEffect } from 'react';
import {
  SAAS_PLANS,
  getAgentSubscription,
  subscribeOrUpgradePlan,
  getInvoicesForAgent,
} from '../../../services/subscriptionService';
import toast from 'react-hot-toast';

export default function AgentSubscriptionPlanView({ agentName = 'Khanh Nguyen', agentEmail = 'khanh@insurmatch.us' }) {
  const [subscription, setSubscription] = useState(() => getAgentSubscription(agentName || agentEmail));
  const [invoices, setInvoices] = useState(() => getInvoicesForAgent(agentName || agentEmail));
  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Annual'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethodType, setPaymentMethodType] = useState('card'); // 'card' | 'qr' | 'stripe'
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states for checkout card
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('889');
  const [cardName, setCardName] = useState(agentName || 'Khanh Nguyen');

  useEffect(() => {
    const sub = getAgentSubscription(agentName || agentEmail);
    setSubscription(sub);
    setInvoices(getInvoicesForAgent(agentName || agentEmail));
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

  const currentPlanKey = (subscription?.plan || 'Professional').toLowerCase();

  function handleOpenCheckout(planKey) {
    setSelectedPlanForCheckout(planKey);
    setCheckoutModalOpen(true);
  }

  function handleConfirmPayment(e) {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setIsProcessing(true);

    setTimeout(() => {
      const paymentDisplay =
        paymentMethodType === 'card'
          ? `Visa •••• ${cardNumber.replace(/\D/g, '').slice(-4) || '8812'}`
          : paymentMethodType === 'qr'
          ? 'VietQR Instant Transfer'
          : 'Stripe Direct Gateway';

      const updated = subscribeOrUpgradePlan({
        agentName: agentName || subscription?.agentName || 'Khanh Nguyen',
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
        `Chúc mừng! Bạn đã kích hoạt thành công ${targetPlanInfo.displayName} (${billingCycle === 'Annual' ? 'Thanh toán năm' : 'Thanh toán tháng'})!`,
        { duration: 4000 }
      );
    }, 1000);
  }

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
                Gói Thuê Bao CRM &amp; Quản Lý Dịch Vụ
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem thông tin gói cước hiện tại, nâng cấp tài nguyên đại lý và tra cứu lịch sử hóa đơn B2B
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Đang hoạt động: {subscription?.plan || 'Professional'} Plan
          </span>
        </div>
      </div>

      {/* ── 1. Current Active Plan Details Card ──────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0A1628] to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Gói Hiện Tại Của Bạn
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Kích hoạt hợp lệ
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-3">
                <span>{subscription?.agencyName || 'InsurMatch Partner Agency'}</span>
                <span className="text-lg font-normal text-slate-400">({subscription?.plan} Tier)</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Đại lý phụ trách: <strong className="text-white">{subscription?.agentName}</strong> • Chu kỳ: <span className="font-semibold text-blue-300">{subscription?.billingCycle === 'Annual' ? 'Thanh toán theo năm' : 'Thanh toán hàng tháng'}</span>
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-medium">Hạn mức tài khoản (Seats)</span>
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
                <span className="text-[11px] text-slate-400 block font-medium">Hồ sơ khách hàng (Contacts)</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {subscription?.contactsCount || 142} / {subscription?.maxContacts === 999999 ? '∞' : (subscription?.maxContacts || 2500)}
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, ((subscription?.contactsCount || 142) / (subscription?.maxContacts || 2500)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block font-medium">Gia hạn kế tiếp</span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">
                  {subscription?.nextRenewalDate || '2026-10-15'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {subscription?.paymentMethod || 'Visa •••• 4242'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Upgrade CTA */}
          <div className="lg:border-l lg:border-white/10 lg:pl-8 flex flex-col justify-center items-start lg:items-end text-left lg:text-right shrink-0">
            <span className="text-xs text-slate-400 font-medium">Chi phí thuê bao</span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              ${subscription?.price || 79}
              <span className="text-sm font-normal text-slate-400">/tháng</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
              Tự động gia hạn theo điều khoản B2B SaaS của InsurMatch.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = currentPlanKey === 'agency' ? 'professional' : 'agency';
                  handleOpenCheckout(target);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">upgrade</span>
                <span>{currentPlanKey === 'agency' ? 'Đổi cấu hình gói' : 'Nâng cấp lên Agency'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Pricing & Plan Comparison (Coms.pdf Model) ──────────────────── */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Chọn Gói Thuê Bao Phù Hợp Cho Doanh Nghiệp Bạn
          </h2>
          <p className="text-xs text-slate-500">
            Hạ tầng CRM chuyên biệt cho ngành Bảo hiểm Sức khỏe (ACA/Marketplace) &amp; Medicare tại Hoa Kỳ.
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
              Thanh toán Hàng tháng
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
              <span>Thanh toán Hàng năm</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950">
                -15% Tiết kiệm
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {Object.entries(SAAS_PLANS).map(([key, plan]) => {
            const isCurrent = currentPlanKey === key;
            const displayPrice = billingCycle === 'Annual' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

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
                    ★ Gói Phổ Biến Nhất
                  </div>
                )}
                {isCurrent && !plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                    ✓ Đang sử dụng
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      {plan.maxSeats} {plan.maxSeats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">${displayPrice}</span>
                    <span className="text-xs text-slate-500 font-medium">/tháng</span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    {billingCycle === 'Annual'
                      ? `Thanh toán $${plan.annualPrice}/năm (tiết kiệm ${(plan.monthlyPrice * 12) - plan.annualPrice}$)`
                      : 'Thanh toán định kỳ hàng tháng, linh hoạt hủy bất kỳ lúc nào.'}
                  </p>

                  <div className="border-t border-slate-100 my-5" />

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
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
                      <span>Gói Đang Hoạt Động</span>
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
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      <span>
                        {key === 'agency'
                          ? 'Nâng cấp lên Agency'
                          : key === 'professional'
                          ? 'Chọn gói Professional'
                          : 'Chọn gói Starter'}
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
              Lịch Sử Thanh Toán &amp; Hóa Đơn Thuê Bao
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hóa đơn dịch vụ B2B SaaS được xuất tự động sau mỗi chu kỳ thanh toán
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success('Đã gửi toàn bộ bản sao kê hóa đơn vào email của bạn!')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">mail</span>
            <span>Gửi hóa đơn qua Email</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Mã hóa đơn</th>
                <th className="py-3 px-4">Ngày thanh toán</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Chu kỳ</th>
                <th className="py-3 px-4 text-right">Số tiền</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Biên lai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
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
                      Đã thanh toán
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

      {/* ── 4. Checkout & Activation Modal ───────────────────────────────── */}
      {checkoutModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Xác Nhận Đăng Ký Gói Cước</h3>
                  <p className="text-xs text-slate-500">InsurMatch B2B CRM Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-5 text-left text-xs">
              {/* Plan Summary Box */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                    Gói dịch vụ lựa chọn
                  </span>
                  <span className="text-base font-black text-blue-950 mt-0.5 block">
                    {SAAS_PLANS[selectedPlanForCheckout]?.displayName}
                  </span>
                  <span className="text-xs text-blue-700">
                    Chu kỳ: {billingCycle === 'Annual' ? 'Hàng năm (15% Off)' : 'Hàng tháng'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-950">
                    $
                    {billingCycle === 'Annual'
                      ? SAAS_PLANS[selectedPlanForCheckout]?.annualPrice
                      : SAAS_PLANS[selectedPlanForCheckout]?.monthlyPrice}
                  </span>
                  <span className="text-[10px] text-blue-700 block">
                    {billingCycle === 'Annual' ? '/năm' : '/tháng'}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">Chọn phương thức thanh toán:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('card')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethodType === 'card'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] block mx-auto mb-1 text-blue-600">credit_card</span>
                    <span>Thẻ Visa / Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('qr')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethodType === 'qr'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] block mx-auto mb-1 text-emerald-600">qr_code_2</span>
                    <span>Quét mã VietQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('stripe')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethodType === 'stripe'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] block mx-auto mb-1 text-indigo-600">account_balance</span>
                    <span>Stripe Gateway</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Details */}
              {paymentMethodType === 'card' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Số thẻ thanh toán</label>
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
                      <label className="block text-slate-600 font-medium mb-1">Ngày hết hạn (MM/YY)</label>
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
                    <label className="block text-slate-600 font-medium mb-1">Tên chủ thẻ</label>
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
              )}

              {paymentMethodType === 'qr' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=InsurMatch_${selectedPlanForCheckout}_${agentName}`}
                      alt="VietQR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Ngân hàng: <strong>Techcombank</strong> • STK: <strong>1903829102919</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Nội dung: <code>INSMATCH SUB {selectedPlanForCheckout.toUpperCase()}</code>
                  </p>
                </div>
              )}

              {paymentMethodType === 'stripe' && (
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 text-slate-700 text-xs flex items-center gap-3">
                  <span className="material-symbols-outlined text-indigo-600 text-[24px]">lock</span>
                  <p>
                    Bạn sẽ được chuyển hướng an toàn sang cổng thanh toán quốc tế Stripe 3D-Secure để xác thực giao dịch.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xử lý kích hoạt...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Xác Nhận &amp; Kích Hoạt Gói</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
