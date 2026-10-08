import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  FileText, 
  Bell, 
  Layers, 
  Laptop, 
  CheckCircle2, 
  HelpCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import CarrierLogosStrip from '../components/CarrierLogos';
import CustomerMatchModal from '../components/CustomerMatchModal';

export default function HomePage({ onOpenQuote, onOpenMatch }) {
  const [internalMatchOpen, setInternalMatchOpen] = useState(false);
  const handleMatchClick = onOpenMatch || (() => setInternalMatchOpen(true));
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const dailyQuestions = [
    {
      num: '01',
      question: 'Who needs attention today?',
      answer: 'Instant prioritized queue of follow-up tasks, new inbound leads, and client requests needing same-day response.',
      icon: 'priority_high',
    },
    {
      num: '02',
      question: 'What client or contract requires action?',
      answer: 'Track document upload deadlines, Marketplace verifications, PCP selections, and carrier policy status.',
      icon: 'rule',
    },
    {
      num: '03',
      question: 'When is a renewal or deadline approaching?',
      answer: 'Automated 30/60/90-day renewal alerts so you retain policyholders before Open Enrollment or Annual Election periods.',
      icon: 'event_repeat',
    },
    {
      num: '04',
      question: 'How is your agency performing operationally?',
      answer: 'Real-time pipeline analytics, lead conversion velocity, agent productivity metrics, and commission visibility.',
      icon: 'monitoring',
    },
  ];

  const coreFeatures = [
    {
      title: 'Customer & Contact Management',
      desc: 'Centralized profiles with complete contact details, policy numbers, household member counts, and notes in one place.',
      icon: Users,
    },
    {
      title: 'Structured CRM Pipelines',
      desc: 'Pre-built and customizable stage workflows for ACA Obamacare, Medicare Initial/Renewal, and special enrollment periods.',
      icon: Layers,
    },
    {
      title: 'Renewal & Appointment Tracking',
      desc: 'Never let a client lapse. Calendar reminders and automated renewal alerts built directly around health insurance cycles.',
      icon: Calendar,
    },
    {
      title: 'Smart Follow-up Sequences',
      desc: 'Automate post-sale follow-ups: binder payments, document collection, doctor selection, and customer check-ins.',
      icon: Clock,
    },
    {
      title: 'Compliant Email & SMS Communication',
      desc: 'Use pre-approved compliant templates and communication histories so your team maintains consistent client touchpoints.',
      icon: Bell,
    },
    {
      title: 'Commission Visibility & Reporting',
      desc: 'Track expected carrier payouts and policy volume in one place without handling payments or giving up a percentage.',
      icon: TrendingUp,
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Log in', desc: 'Secure agent access from any browser' },
    { step: '02', title: "View Today's Priorities", desc: 'Clear task list and urgent deadlines' },
    { step: '03', title: 'Identify Pending Leads & Renewals', desc: 'Pipeline status with color badges' },
    { step: '04', title: 'Search & Update Records', desc: 'Fast client lookup and SOP-guided notes' },
    { step: '05', title: 'Complete Follow-up Activities', desc: 'Close tickets, send texts, log calls' },
    { step: '06', title: 'Review Pipeline Dashboard', desc: 'Real-time visibility for agents & managers' },
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      target: 'Individual Agent',
      monthlyPrice: 39,
      annualPrice: 32,
      users: '1 User included',
      popular: false,
      description: 'Ideal for independent licensed agents replacing spreadsheets and organizing their client book.',
      features: [
        'Centralized customer profiles',
        'Basic lead capture & tracking',
        'Standard ACA & Medicare pipelines',
        'Calendar, tasks & renewal reminders',
        'Basic compliant email templates',
        'Individual activity overview',
        '14-day free trial included',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      target: 'Growing Agent or Small Team',
      monthlyPrice: 79,
      annualPrice: 65,
      users: 'Up to 3 Users',
      popular: true,
      description: 'For growing agents needing customizable pipelines, automation, and deeper visibility.',
      features: [
        'Everything in Starter, plus:',
        'Up to 3 team member seats',
        'Advanced lead management & custom tags',
        'Customizable CRM pipeline stages',
        'Shared calendar & automated follow-ups',
        'Email automation & limited SMS workflows',
        'Pipeline, deal & productivity analytics',
        'Commission visibility & policy tracking',
        'Priority email & ticket support',
      ],
    },
    {
      id: 'agency',
      name: 'Agency',
      target: 'Multi-Agent Agency',
      monthlyPrice: 199,
      annualPrice: 165,
      users: 'Up to 10 Users',
      popular: false,
      description: 'For agency principals managing multiple agents, staff coordinators, and team lead routing.',
      features: [
        'Everything in Professional, plus:',
        'Up to 10 team seats (agents & staff)',
        'Shared team lead routing & assignment',
        'Multiple team pipelines across lines',
        'Team task oversight, deadlines & audit logs',
        'Advanced team automation & sequences',
        'Agency-wide & agent-level operational reporting',
        'Master commission visibility & ledger',
        'Full role-based permissions & compliance',
      ],
    },
  ];

  return (
    <div className="w-full bg-ivory text-charcoal selection:bg-champagne selection:text-navy-deep">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO — B2B SaaS CRM Value Proposition
         ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-stroke-subtle overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-7 flex flex-col items-center"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/80 border border-stroke-subtle text-[11px] font-bold tracking-widest uppercase text-navy-deep">
              <Sparkles className="w-3.5 h-3.5 text-champagne" />
              <span>B2B SaaS CRM for Independent Insurance Agents</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-navy-deep tracking-tight leading-[1.08] max-w-3xl">
              Replace Spreadsheets.{' '}
              <span className="block font-serif italic font-normal text-navy-midnight mt-2">
                Never Miss a Policy Renewal.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg lg:text-xl text-charcoal/75 max-w-2xl leading-relaxed mx-auto">
              InsurMatch is the web-based CRM purpose-built for licensed independent insurance agents and small agencies in the United States. Centralize customer data, manage ACA &amp; Medicare pipelines, automate follow-ups, and keep 100% of your carrier commissions.
            </p>

            {/* CTAs: Giữ nguyên giao diện gốc + thêm 1 NÚT duy nhất */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={onOpenQuote}
                className="px-7 py-3.5 rounded-xl bg-navy-deep text-ivory hover:bg-navy-midnight transition-colors duration-200 font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-xs group"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-champagne group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onOpenQuote}
                className="px-6 py-3.5 rounded-xl border border-navy-deep bg-white hover:bg-sand/60 text-navy-deep font-semibold text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer"
              >
                Book a Free Demo
              </button>

              {/* Client Matchmaking Portal CTA */}
              <button
                type="button"
                onClick={handleMatchClick}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Client Matchmaking Portal</span>
              </button>
            </div>
            
            <div className="pt-2">
              <Link
                to="/pricing"
                className="text-xs font-bold text-charcoal/70 hover:text-navy-deep underline underline-offset-4"
              >
                View Plans ($39 – $199/mo)
              </Link>
            </div>

            {/* Fine Signature Subline */}
            <div className="pt-6 flex flex-wrap justify-center items-center gap-5 text-xs text-charcoal/70 max-w-xl">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                No Credit Card Required
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                Keep 100% Carrier Commissions
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                Cancel Anytime
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CARRIER COMPATIBILITY STRIP
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        className="py-8 bg-sand/30 border-b border-stroke-subtle">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-muted mb-4">
            Supports All Major Health, Medicare &amp; Life Carriers in the US
          </p>
          <CarrierLogosStrip />
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          2. THE 4 DAILY QUESTIONS (Page 3 of Proposal)
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand text-navy-deep text-xs font-bold uppercase tracking-wider mb-3">
            <span>Built Around Daily Agent Reality</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            Designed to Answer Four Practical Questions Every Day
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-charcoal/70 leading-relaxed">
            Independent agents don&apos;t just need a place to store names. They need a structured workflow that turns customer chaos into clear daily actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dailyQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-stroke-subtle shadow-xs hover:shadow-md transition-shadow relative text-left flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-extrabold text-champagne/80 font-mono block mb-2">
                  {q.num}
                </span>
                <h3 className="text-base font-bold text-navy-deep mb-2.5 leading-snug">
                  {q.question}
                </h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  {q.answer}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand flex items-center gap-1.5 text-xs font-bold text-navy-deep">
                <span className="material-symbols-outlined text-[18px] text-champagne">{q.icon}</span>
                <span>Structured in InsurMatch</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          3. CORE PRODUCT CAPABILITIES (Page 3-4 of Proposal)
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        id="features" className="py-20 bg-sand/30 border-y border-stroke-subtle px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              One Workspace. Complete Control.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              Everything independent insurance agents and agencies need to run daily operations smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-3xl bg-white border border-stroke-subtle shadow-xs hover:border-champagne/60 transition-all text-left space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sand/70 text-navy-deep flex items-center justify-center">
                    <Icon className="w-6 h-6 text-champagne stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-navy-deep">{feat.title}</h3>
                  <p className="text-xs text-charcoal/70 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          4. CORE USER WORKFLOW TIMELINE (Page 4 of Proposal)
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand text-navy-deep text-xs font-bold uppercase tracking-wider mb-3">
            <span>Seamless Daily Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            How Independent Agents Use InsurMatch Daily
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-charcoal/70">
            Reducing the distance between finding client information and taking immediate action.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-stroke-subtle shadow-2xs text-left relative flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-champagne bg-sand/60 px-2 py-0.5 rounded">
                  {step.step}
                </span>
                <h4 className="font-bold text-xs text-navy-deep mt-3 mb-1">{step.title}</h4>
                <p className="text-[11px] text-charcoal/70 leading-snug">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          5. PRICING SECTION (Page 6 of Proposal)
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        id="pricing" className="py-20 bg-sand/20 border-t border-stroke-subtle px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand/80 border border-stroke-subtle text-xs font-semibold text-navy-deep mb-4">
            <Sparkles className="w-3.5 h-3.5 text-champagne" />
            <span>Transparent SaaS Packages</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            Predictable Pricing. Zero Commission Cuts.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-charcoal/70 max-w-2xl mx-auto">
            All plans include a 14-day free trial with no credit card required. Keep 100% of your carrier commission payouts.
          </p>

          {/* Toggle */}
          <div className="mt-8 mb-12 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-sand/60 border border-stroke-subtle">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-navy-deep text-ivory shadow-xs' : 'text-charcoal/70 hover:text-navy-deep'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual' ? 'bg-navy-deep text-ivory shadow-xs' : 'text-charcoal/70 hover:text-navy-deep'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-champagne text-navy-deep font-extrabold text-[10px]">
                Save 15%
              </span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl p-7 lg:p-8 transition-all text-left ${
                    plan.popular
                      ? 'bg-white border-2 border-navy-deep shadow-xl ring-4 ring-navy-deep/5 md:-translate-y-2'
                      : 'bg-white/80 border border-stroke-subtle shadow-xs'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-navy-deep text-champagne text-[11px] font-bold tracking-wider uppercase shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div className="border-b border-sand pb-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-navy-deep">{plan.name}</h3>
                      <span className="text-[11px] font-semibold text-slate-muted uppercase">
                        {plan.target}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-navy-deep font-mono tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs font-semibold text-charcoal/60">
                        / mo {billingCycle === 'annual' && '(billed annually)'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-champagne-light bg-navy-deep inline-block px-2.5 py-1 rounded-md">
                      {plan.users}
                    </div>

                    <p className="mt-3 text-xs text-charcoal/70 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="py-6 flex-grow space-y-2.5 text-xs text-charcoal/85">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 leading-snug">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-sand">
                    <button
                      type="button"
                      onClick={onOpenQuote}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-navy-deep hover:bg-navy-midnight text-ivory shadow-xs'
                          : 'bg-sand hover:bg-sand/80 text-navy-deep'
                      }`}
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4 text-champagne" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/pricing"
              className="text-xs font-bold text-navy-deep hover:underline inline-flex items-center gap-1.5"
            >
              <span>See full feature-by-feature comparison table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          6. BUSINESS BOUNDARY & COMPLIANCE (Page 13 of Proposal)
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        className="py-14 bg-navy-deep text-ivory px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/15 text-champagne text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>B2B Software Boundary &amp; Compliance Commitment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            InsurMatch is a CRM Software Provider
          </h2>
          <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed max-w-2xl mx-auto">
            InsurMatch does not sell insurance, provide insurance advice, collect insurance premiums, or receive carrier commissions. All carrier compensation remains 100% between licensed agents, authorized clearinghouses, and carriers.
          </p>
        </div>
      </motion.section>

      {/* ─────────────────────────────────────────────────────────────
          7. BOTTOM CTA
         ───────────────────────────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: '-40px' }} 
        transition={{ duration: 0.6 }} 
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-sand/60 border border-stroke-subtle p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            Start Your 14-Day Free Trial
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/75 max-w-xl mx-auto">
            Set up your CRM workspace in under 3 minutes. No credit card required. Experience why independent agents choose InsurMatch.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenQuote}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-navy-deep text-ivory font-bold text-xs hover:bg-navy-midnight transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-champagne" />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-navy-deep text-navy-deep font-bold text-xs hover:bg-sand transition-colors text-center"
            >
              Log In to Portal
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Modal Khách Hàng Kết Nối Đại Lý (fallback if not managed by parent) */}
      {!onOpenMatch && (
        <CustomerMatchModal
          isOpen={internalMatchOpen}
          onClose={() => setInternalMatchOpen(false)}
        />
      )}
    </div>
  );
}
