import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Check,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Building2,
  DollarSign,
  ChevronDown,
  Activity,
  FileCheck,
} from 'lucide-react';
import CarrierLogosStrip from '../components/CarrierLogos';
import CustomerMatchModal from '../components/CustomerMatchModal';

const WORKFLOW_TABS = [
  {
    id: 'client-360',
    label: '1. Client & Household 360°',
    title: 'Centralize Every Policy, Dependent, and Document in One Audit-Ready Vault',
    description:
      'Stop hunting across carrier portals and spreadsheets. InsurMatch connects health tax dependents, Medicare Beneficiary Identifiers (MBI), doctor networks, and prescriptions into a single verified contact card.',
    preview: {
      clientName: 'Robert & Sarah Jenkins',
      household: 'Household of 2 • Austin, TX',
      activePolicies: [
        {
          type: 'Medicare Advantage',
          carrier: 'UnitedHealthcare Dual Complete',
          policyId: 'UHC-TX-882910',
          status: 'In-Force',
          statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          renewal: 'Nov 15, 2026 (AEP)',
          premium: '$0/mo',
        },
        {
          type: 'Dental & Vision Supplement',
          carrier: 'Ameritas Premier Plus',
          policyId: 'AME-99412',
          status: 'Active',
          statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
          renewal: 'Annual Auto-Renew',
          premium: '$42.50/mo',
        },
      ],
      complianceTags: ['Signed SOA (48h Logged)', 'MBI Card Verified', 'Dr. Patel In-Network'],
    },
  },
  {
    id: 'renewal-radar',
    label: '2. 30/60/90-Day Renewal Radar',
    title: 'Automated Retention Alerts Before Clients Are Lost to Automated Marketplace Re-Enrollment',
    description:
      'Every autumn, Open Enrollment (OEP) and Medicare AEP cause massive agent churn. InsurMatch automatically groups approaching policy anniversaries into actionable 30, 60, and 90-day outreach queues.',
    preview: {
      alertStats: [
        { label: '30-Day Window (Urgent)', count: 18, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        { label: '60-Day Window (AEP Review)', count: 42, color: 'text-amber-700 bg-amber-50 border-amber-200' },
        { label: '90-Day Window (Auto-Sequence)', count: 96, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      ],
      recentOutreach: [
        { name: 'Elena Rostova', action: 'Annual Notice of Change (ANOC) comparison sent', time: '14m ago' },
        { name: 'Tran Minh Duc', action: 'ACA Subsidy Recertification reminder scheduled', time: '1h ago' },
        { name: 'Maria Santos', action: 'Dr. Patel network confirmation logged', time: '3h ago' },
      ],
    },
  },
  {
    id: 'commission-reconciliation',
    label: '3. Commission Statement Reconciliation',
    title: 'Match Carrier Direct Deposits Against In-Force Books to Protect Every Dollar',
    description:
      'Carriers frequently miss commission credits or apply unexpected chargebacks. InsurMatch matches monthly carrier EFT statements against your active client book so you reconcile street commissions down to the penny.',
    preview: {
      payoutTotal: '$35,895.00',
      payoutSubtitle: '100% Retained Direct from Carriers • $0 Platform Take',
      reconciledCarriers: [
        { carrier: 'BlueCross BlueShield', lives: '482 Lives', status: 'Reconciled', amount: '$14,460.00' },
        { carrier: 'UnitedHealthcare', lives: '390 Lives', status: 'Reconciled', amount: '$11,895.00' },
        { carrier: 'Aetna & Humana', lives: '318 Lives', status: 'Pending EFT', amount: '$9,540.00' },
      ],
    },
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'ACA & Medicare Specific Fields (SOA, MBI, FPL)',
    spreadsheet: 'Manual columns prone to data corruption',
    genericCrm: 'Requires $10,000+ custom field setup',
    insurmatch: 'Built-in out of the box with CMS compliance',
  },
  {
    feature: 'Carrier Commission & Statement Reconciliation',
    spreadsheet: 'Hours of error-prone VLOOKUP formulas',
    genericCrm: 'Not supported without complex enterprise plugins',
    insurmatch: 'Automated policy-to-EFT matching',
  },
  {
    feature: '30/60/90-Day OEP & AEP Renewal Radar',
    spreadsheet: 'Missed dates lead to client churn',
    genericCrm: 'Generic deal stages unrelated to enrollment cycles',
    insurmatch: 'Synchronized with health & Medicare annual calendars',
  },
  {
    feature: 'Platform Take / Commission Split',
    spreadsheet: '0%',
    genericCrm: '0%',
    insurmatch: '0% (You keep 100% of street commissions)',
  },
  {
    feature: 'Setup Time for Independent Agents',
    spreadsheet: 'Weeks of DIY building',
    genericCrm: '3 to 6 weeks of agency onboarding',
    insurmatch: 'Ready in under 3 minutes',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does InsurMatch take any cut of my commissions or carrier overrides?',
    a: 'Absolutely zero. InsurMatch operates as a pure software subscription ($39–$199/month). All carrier commissions, street rates, renewals, and overrides are paid 100% directly from the insurance carriers to you.',
  },
  {
    q: 'Can I import my existing book of business from Excel or another CRM?',
    a: 'Yes. Our automated CSV importer maps your policyholders, household members, policy numbers, effective dates, and renewal dates in minutes with built-in duplicate detection.',
  },
  {
    q: 'How does InsurMatch keep client records HIPAA & CMS compliant?',
    a: 'All data is secured with AES-256 bit encryption at rest and TLS 1.3 in transit. Client vaults feature role-based permissions, comprehensive audit logs, and dedicated fields for digital Scope of Appointment (SOA) timestamps and 10-year ACA consent archiving.',
  },
  {
    q: 'Can I use InsurMatch if I write policies across multiple states and carriers?',
    a: 'Yes. InsurMatch is completely carrier-agnostic and FMO-independent. You can manage policyholders from all 50 states across any major carrier (BCBS, UnitedHealthcare, Humana, Aetna, Cigna, Ambetter, Mutual of Omaha, and more).',
  },
  {
    q: 'What is included in the 60-day free trial?',
    a: 'You get full, unrestricted access to the CRM workspace, client vaults, renewal radar, and pipeline workflows. No credit card is required to begin, and you can export your data at any time.',
  },
];

export default function HomePage({ onOpenQuote, onOpenMatch }) {
  const [internalMatchOpen, setInternalMatchOpen] = useState(false);
  const handleMatchClick = onOpenMatch || (() => setInternalMatchOpen(true));

  const [activeWorkflowTab, setActiveWorkflowTab] = useState('client-360');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const currentTab = WORKFLOW_TABS.find((t) => t.id === activeWorkflowTab) || WORKFLOW_TABS[0];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      target: 'Individual Licensed Agent',
      monthlyPrice: 39,
      annualPrice: 32,
      seats: '1 Agent Seat',
      popular: false,
      tagline: 'Replace messy spreadsheets with an organized, compliant client vault.',
      features: [
        'Centralized customer & household profiles',
        'Standard ACA & Medicare policy tracking',
        '30/60/90-day renewal alerts',
        'Basic CMS Scope of Appointment (SOA) logging',
        'CSV book-of-business import & export',
        'Email & ticket customer support',
        '60-day free trial included',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      target: 'Top Producer & Growing Practice',
      monthlyPrice: 79,
      annualPrice: 65,
      seats: 'Up to 3 Agent Seats',
      popular: true,
      tagline: 'Customizable pipelines, automated renewal sequences, and commission tracking.',
      features: [
        'Everything in Starter, plus:',
        'Up to 3 licensed agent seats',
        'Automated SMS & email renewal sequences',
        'Carrier commission & statement reconciliation',
        'Data Matching Issue (DMI) deadline tracker',
        'Custom tags & pipeline stage customization',
        'Priority agent support & phone onboarding',
      ],
    },
    {
      id: 'agency',
      name: 'Agency',
      target: 'Multi-Agent General Agency',
      monthlyPrice: 199,
      annualPrice: 165,
      seats: 'Up to 10 Seats (Agents & Staff)',
      popular: false,
      tagline: 'Multi-agent lead routing, staff oversight, and agency-wide production reporting.',
      features: [
        'Everything in Professional, plus:',
        'Up to 10 seats (licensed agents + staff coordinators)',
        'Shared inbound lead distribution & round-robin',
        'Staff task assignment & deadline oversight',
        'Agency-wide commission & production telemetry',
        'Role-based permissions & compliance audit trail',
        'Dedicated account manager',
      ],
    },
  ];

  return (
    <div className="w-full bg-[#fbfaf7] text-charcoal selection:bg-champagne selection:text-navy-deep overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO — Clean, High-Authority Editorial SaaS Showcase
         ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-stroke-subtle overflow-hidden">
        {/* Subtle grid background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0b172a_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stroke-subtle shadow-2xs text-xs font-semibold text-navy-deep tracking-wide"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Purpose-Built for US Licensed Health &amp; Life Insurance Agents</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-deep tracking-tight leading-[1.12]"
            >
              Stop Managing Clients on Spreadsheets.{' '}
              <span className="block font-serif font-normal italic text-slate-muted mt-2">
                Protect Your Book of Business with InsurMatch.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-base sm:text-lg text-charcoal/80 max-w-2xl mx-auto leading-relaxed"
            >
              The all-in-one CRM designed specifically for independent agents writing ACA, Medicare, and Life policies.
              Eliminate dropped renewals, resolve DMIs before subsidies lapse, and keep{' '}
              <strong className="font-bold text-navy-deep">100% of your carrier commissions</strong>.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={onOpenQuote}
                className="min-h-[48px] px-7 py-3.5 rounded-xl bg-navy-deep text-white hover:bg-navy-midnight transition-colors font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep"
              >
                <span>Start 60-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-champagne" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleMatchClick}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
                <span>Client Matchmaking Portal</span>
              </button>

              <button
                type="button"
                onClick={onOpenQuote}
                className="min-h-[48px] px-6 py-3.5 rounded-xl border border-stroke-subtle bg-white text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-sand/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep"
              >
                Book a Live Walkthrough
              </button>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-charcoal/75"
            >
              <span className="flex items-center gap-1.5 font-medium text-navy-deep">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" aria-hidden="true" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5 font-medium text-navy-deep">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" aria-hidden="true" />
                Zero Commission Splits (You Keep 100%)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-navy-deep">
                <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
                HIPAA &amp; CMS Compliant Vault
              </span>
            </motion.div>
          </div>

          {/* ── Realistic Desktop Browser CRM Showcase ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-14 max-w-5xl mx-auto rounded-3xl bg-white border border-stroke-subtle shadow-[0_20px_50px_rgba(11,23,42,0.08)] overflow-hidden"
          >
            {/* macOS Style Window Header */}
            <div className="px-5 py-3.5 bg-[#f4f2eb] border-b border-stroke-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 px-3 py-1 rounded-md bg-white border border-stroke-subtle/80 font-mono text-[11px] text-slate-muted">
                  app.insurmatch.io/agency/book-of-business
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-navy-deep">
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  NPN Verified • 50 States
                </span>
              </div>
            </div>

            {/* CRM Interface Body Preview */}
            <div className="p-6 sm:p-8 bg-white grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: KPI Highlights */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-1">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-muted">
                    Total Active Book
                  </p>
                  <p className="text-2xl font-extrabold text-navy-deep font-mono tabular-nums">
                    1,420 <span className="text-xs font-normal text-slate-muted font-sans">Policies</span>
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">+38 enrolled during recent OEP</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-1">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-muted">
                    Annual Retention Rate
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
                    98.4%
                  </p>
                  <p className="text-xs text-charcoal/70">Protected via 30/60/90d Radar</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-1">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-muted">
                    Monthly Carrier Renewals
                  </p>
                  <p className="text-2xl font-extrabold text-navy-deep font-mono tabular-nums">
                    $35,895<span className="text-xs font-normal text-slate-muted font-sans">.00</span>
                  </p>
                  <p className="text-xs text-navy-deep font-semibold">100% Direct Payout ($0 Fee)</p>
                </div>
              </div>

              {/* Right Column: Realistic Client Profile Record */}
              <div className="lg:col-span-8 p-5 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stroke-subtle">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-navy-deep">Robert &amp; Sarah Jenkins</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                        Medicare + Supp
                      </span>
                    </div>
                    <p className="text-xs text-slate-muted">Household NPN Sync: #2099412 • Travis County, TX</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    AEP Renewal: Safe
                  </span>
                </div>

                {/* Sub-cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-stroke-subtle space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-muted">Primary Coverage</span>
                    <p className="font-bold text-navy-deep">UnitedHealthcare Dual Complete</p>
                    <p className="text-charcoal/70">Plan ID: UHC-TX-882910 • $0/mo</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stroke-subtle space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-muted">Supplemental Line</span>
                    <p className="font-bold text-navy-deep">Ameritas Dental &amp; Vision</p>
                    <p className="text-charcoal/70">Plan ID: AME-99412 • $42.50/mo</p>
                  </div>
                </div>

                {/* Compliance checklist inside profile */}
                <div className="p-3.5 rounded-xl bg-white border border-stroke-subtle space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-muted block">
                    CMS &amp; Scope of Appointment (SOA) Audit Trail
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      Digital SOA Signed (48h Logged)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      MBI Beneficiary ID Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                      <Clock className="w-3 h-3 text-blue-600" />
                      30-Day AEP Outreach Sent
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CARRIER ECOSYSTEM — Real 50-State Compatibility
         ───────────────────────────────────────────────────────────── */}
      <CarrierLogosStrip />

      {/* ─────────────────────────────────────────────────────────────
          3. CORE CAPABILITIES — Solving the Real Headaches of Agents
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand/70 border border-stroke-subtle text-xs font-bold text-navy-deep uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-champagne" aria-hidden="true" />
            <span>Built by Insurance Specialists</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            Designed for Real Health &amp; Life Agency Operations
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal/75 leading-relaxed">
            Generic sales CRMs force you to customize endless fields that don&apos;t understand Medicare AEP deadlines,
            ACA household tax logic, or carrier commission statements. InsurMatch works on day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: 'Household & Dependent Vault',
              desc: 'Store tax dependents, Modified AGI, Medicare Beneficiary Identifiers (MBI), and doctor networks in one unified client profile.',
              tag: 'ACA & Medicare Ready',
            },
            {
              icon: Calendar,
              title: '30/60/90-Day Renewal Radar',
              desc: 'Never miss an AEP or OEP anniversary. Automated calendar triggers notify you before clients are auto-assigned by the Marketplace.',
              tag: '98.4% Retention',
            },
            {
              icon: DollarSign,
              title: 'Direct Carrier Commission Reconciliation',
              desc: 'Match monthly carrier direct deposits against active client lists. Catch missing payouts and chargebacks without messy spreadsheets.',
              tag: '100% Street Rate',
            },
            {
              icon: FileCheck,
              title: 'DMI & Document Resolution Queue',
              desc: 'Track citizenship, income, and immigration Data Matching Issues with automated client reminder sequences before coverage cancels.',
              tag: 'Zero Lost Subsidies',
            },
            {
              icon: Shield,
              title: 'CMS Scope of Appointment (SOA)',
              desc: 'Log audio/digital Scope of Appointment timestamps adhering strictly to the CMS 48-hour rule with 10-year tamper-evident archiving.',
              tag: 'HIPAA & CMS Compliant',
            },
            {
              icon: TrendingUp,
              title: 'Cross-Sell Gap Detection',
              desc: 'Automatically flag ACA and Medicare policyholders who lack dental, vision, final expense, or hospital indemnity coverage.',
              tag: '3.2x Revenue Lift',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white border border-stroke-subtle shadow-2xs hover:shadow-md transition-shadow text-left flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-sand/60 text-navy-deep flex items-center justify-center">
                      <Icon className="w-6 h-6 text-navy-deep stroke-[2]" aria-hidden="true" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f4f2eb] border border-stroke-subtle text-[11px] font-semibold text-navy-deep">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-deep">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE WORKFLOW TOUR — Tabbed Walkthrough
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-[#f4f2eb] border-y border-stroke-subtle px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-muted">
              Interactive Product Walkthrough
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight mt-2">
              See How an Independent Agent Runs Their Book
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white border border-stroke-subtle shadow-2xs max-w-2xl mx-auto mb-10">
            {WORKFLOW_TABS.map((tab) => {
              const active = tab.id === activeWorkflowTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveWorkflowTab(tab.id)}
                  className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep ${
                    active ? 'bg-navy-deep text-white shadow-xs' : 'text-charcoal/70 hover:text-navy-deep'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Showcase Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stroke-subtle shadow-sm space-y-6 text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-deep">{currentTab.title}</h3>
              <p className="text-sm text-charcoal/75 mt-1.5 leading-relaxed">{currentTab.description}</p>
            </div>

            {/* Dynamic Tab Body */}
            {currentTab.id === 'client-360' && (
              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-navy-deep">{currentTab.preview.clientName}</p>
                    <p className="text-xs text-slate-muted">{currentTab.preview.household}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentTab.preview.complianceTags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentTab.preview.activePolicies.map((pol, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-stroke-subtle space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-muted">{pol.type}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pol.statusClass}`}>
                          {pol.status}
                        </span>
                      </div>
                      <p className="text-sm font-extrabold text-navy-deep">{pol.carrier}</p>
                      <p className="text-xs text-slate-muted font-mono">{pol.policyId} • {pol.premium}</p>
                      <p className="text-xs text-charcoal/70 pt-1 border-t border-stroke-subtle/60 mt-1">
                        Renewal: <strong className="text-navy-deep">{pol.renewal}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab.id === 'renewal-radar' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentTab.preview.alertStats.map((st, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${st.color} space-y-1 text-center`}>
                      <p className="text-[11px] font-bold uppercase">{st.label}</p>
                      <p className="text-2xl font-extrabold font-mono tabular-nums">{st.count} Policies</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-muted">Recent Automated Touchpoints</p>
                  {currentTab.preview.recentOutreach.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-stroke-subtle flex items-center justify-between text-xs">
                      <span className="font-bold text-navy-deep">{item.name}</span>
                      <span className="text-charcoal/70">{item.action}</span>
                      <span className="text-slate-muted font-mono text-[11px]">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab.id === 'commission-reconciliation' && (
              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stroke-subtle space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stroke-subtle">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-muted">Monthly Street Total</span>
                    <p className="text-3xl font-extrabold text-navy-deep font-mono tabular-nums">{currentTab.preview.payoutTotal}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {currentTab.preview.payoutSubtitle}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {currentTab.preview.reconciledCarriers.map((row, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-stroke-subtle flex items-center justify-between">
                      <div>
                        <p className="font-bold text-navy-deep">{row.carrier}</p>
                        <p className="text-slate-muted text-[11px]">{row.lives}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-navy-deep font-mono tabular-nums">{row.amount}</p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. COMPARISON TABLE — Spreadsheets vs Generic CRM vs InsurMatch
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-muted">
            The Agent Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight mt-2">
            Why Generic Tools Fall Short for Insurance
          </h2>
          <p className="mt-3 text-sm text-charcoal/75">
            Spreadsheets break as your book grows. Generic CRMs require thousands in developer consulting.
            InsurMatch delivers insurance-native workflows on day one.
          </p>
        </div>

        <div className="rounded-2xl border border-stroke-subtle bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#f4f2eb] border-b border-stroke-subtle text-navy-deep font-bold">
                <tr>
                  <th className="p-4 sm:p-5">Capability</th>
                  <th className="p-4 sm:p-5 text-slate-muted">Excel / Sheets</th>
                  <th className="p-4 sm:p-5 text-slate-muted">Generic CRMs (HubSpot)</th>
                  <th className="p-4 sm:p-5 bg-navy-deep text-white font-extrabold">InsurMatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-subtle">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-[#faf9f5] transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-navy-deep">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-charcoal/70">{row.spreadsheet}</td>
                    <td className="p-4 sm:p-5 text-charcoal/70">{row.genericCrm}</td>
                    <td className="p-4 sm:p-5 font-bold text-navy-deep bg-sand/20">{row.insurmatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. PRICING — Clean, Transparent & Fair
         ───────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 lg:py-24 bg-[#f4f2eb] border-y border-stroke-subtle px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-muted">
            Transparent SaaS Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight mt-2">
            Predictable Plans. Zero Commission Cuts.
          </h2>
          <p className="mt-3 text-sm text-charcoal/75 max-w-xl mx-auto">
            60-day free trial on all plans. No credit card required. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Toggle */}
          <div className="mt-8 mb-12 inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-stroke-subtle shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep ${
                billingCycle === 'monthly' ? 'bg-navy-deep text-white shadow-xs' : 'text-charcoal/70 hover:text-navy-deep'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep ${
                billingCycle === 'annual' ? 'bg-navy-deep text-white shadow-xs' : 'text-charcoal/70 hover:text-navy-deep'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-champagne text-navy-deep font-extrabold text-[10px]">
                Save 15%
              </span>
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch text-left">
            {plans.map((p) => {
              const price = billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;
              return (
                <div
                  key={p.id}
                  className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                    p.popular
                      ? 'bg-white border-2 border-navy-deep shadow-xl ring-4 ring-navy-deep/5 md:-translate-y-2'
                      : 'bg-white/90 border border-stroke-subtle shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {p.popular && (
                      <span className="inline-block px-3 py-1 rounded-full bg-navy-deep text-champagne text-[10px] font-extrabold uppercase tracking-wider">
                        Most Popular for Top Producers
                      </span>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-navy-deep">{p.name}</h3>
                      <p className="text-xs text-slate-muted">{p.target}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5 pt-2">
                      <span className="text-4xl font-extrabold text-navy-deep font-mono tabular-nums">${price}</span>
                      <span className="text-xs text-slate-muted">/ month {billingCycle === 'annual' && '(billed annually)'}</span>
                    </div>

                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#f4f2eb] text-navy-deep text-xs font-bold">
                      {p.seats}
                    </span>

                    <p className="text-xs text-charcoal/75 leading-relaxed min-h-[36px]">{p.tagline}</p>

                    <div className="py-4 border-t border-stroke-subtle/80 space-y-2.5 text-xs text-charcoal/85">
                      {p.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stroke-subtle/80 mt-6">
                    <button
                      type="button"
                      onClick={onOpenQuote}
                      className={`w-full min-h-[48px] py-3.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep ${
                        p.popular
                          ? 'bg-navy-deep hover:bg-navy-midnight text-white shadow-xs'
                          : 'bg-[#f4f2eb] hover:bg-sand text-navy-deep'
                      }`}
                    >
                      <span>Start 60-Day Free Trial</span>
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
              className="text-xs font-bold text-navy-deep hover:underline inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep rounded px-2 py-1"
            >
              <span>See full feature-by-feature comparison table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. B2B SOFTWARE COMPLIANCE STATEMENT
         ───────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-navy-deep text-white px-4 sm:px-6 lg:px-8 border-t border-navy-midnight">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/15 text-champagne text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Pure B2B Software Boundary</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            InsurMatch is an Independent Software Vendor (ISV)
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl mx-auto">
            InsurMatch does not sell insurance, provide insurance advice, collect client premiums, or receive carrier commissions. All carrier appointments, contracting, and commission compensation remain 100% between licensed agents, authorized FMOs, and insurance carriers.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FREQUENTLY ASKED QUESTIONS (Accordion)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-muted">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight mt-2">
            Everything You Need to Know Before Switching
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-stroke-subtle overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full min-h-[56px] px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-sand/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy-deep"
                >
                  <span className="text-sm sm:text-base font-extrabold text-navy-deep">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-navy-deep shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-champagne' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-charcoal/80 leading-relaxed border-t border-stroke-subtle/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. BOTTOM CTA — Conversion Banner
         ───────────────────────────────────────────────────────────── */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-sand/60 border border-stroke-subtle p-8 sm:p-14 text-center space-y-5 shadow-2xs">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            Ready to Protect Your Book of Business?
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/80 max-w-lg mx-auto leading-relaxed">
            Set up your agency CRM workspace in under 3 minutes. Keep 100% of your carrier street commissions. No credit card required.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onOpenQuote}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-navy-deep text-white font-bold text-xs uppercase tracking-wider hover:bg-navy-midnight transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep"
            >
              <span>Start 60-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 text-champagne" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleMatchClick}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>Client Matchmaking Portal</span>
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl border border-stroke-subtle bg-white text-navy-deep font-bold text-xs uppercase tracking-wider hover:bg-sand transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-deep"
            >
              Log In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Fallback CustomerMatchModal when not controlled by parent */}
      {!onOpenMatch && (
        <CustomerMatchModal
          isOpen={internalMatchOpen}
          onClose={() => setInternalMatchOpen(false)}
        />
      )}
    </div>
  );
}
