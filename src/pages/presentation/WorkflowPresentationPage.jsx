import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Users,
  Briefcase,
  ListTodo,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  DollarSign,
  PhoneCall,
  UserCheck,
  FileCheck2,
  AlertTriangle,
  FolderOpen,
  PieChart,
  Home,
  Check,
} from 'lucide-react';
import { gsap } from 'gsap';

export default function WorkflowPresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const slideContentRef = useRef(null);

  const totalSlides = 3;

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  // GSAP animation on slide change
  useEffect(() => {
    if (slideContentRef.current) {
      gsap.fromTo(
        slideContentRef.current,
        { opacity: 0, y: 15, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden"
    >
      {/* ── Top Presentation Navigation Toolbar ────────────────────────────── */}
      <header className="h-14 border-b border-slate-800/80 bg-[#0A1222]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/agent"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            title="Return to Agent Portal"
          >
            <Home className="w-3.5 h-3.5 text-teal-400" />
            <span>Agent Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-700/60 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-extrabold text-xs">
              IM
            </div>
            <span className="text-sm font-bold tracking-tight text-white hidden md:inline">
              InsurMatch
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-mono border border-teal-500/20">
              Pitch Deck & Business Workflow
            </span>
          </div>
        </div>

        {/* Slide Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setCurrentSlide(0)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                currentSlide === 0
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Main Business Workflow
            </button>
            <button
              onClick={() => setCurrentSlide(1)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                currentSlide === 1
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Real Product: Dashboard & Alerts
            </button>
            <button
              onClick={() => setCurrentSlide(2)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                currentSlide === 2
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Real Product: Core Workspace
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">
              {currentSlide + 1} / {totalSlides}
            </span>
            <button
              onClick={() => setCurrentSlide((p) => Math.min(totalSlides - 1, p + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next Slide (Right Arrow / Space)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (16:9 Presentation Mode)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main 16:9 Presentation Stage ────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-radial from-[#0C1629] via-[#070D18] to-[#04080F]">
        <div
          ref={slideContentRef}
          className="w-full max-w-[1680px] aspect-[16/9] bg-[#0A1424] rounded-2xl border border-slate-800/90 shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative"
        >
          {/* Subtle Ambient Glow Background */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

          {currentSlide === 0 && <SlideA_MainBusinessWorkflow />}
          {currentSlide === 1 && <SlideB1_DashboardAndSmartAlerts />}
          {currentSlide === 2 && <SlideB2_CoreWorkspaceAndLedger />}

          {/* Bottom Slide Footer Bar */}
          <footer className="h-10 px-8 bg-[#060D1A]/95 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0 z-20">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">INSURMATCH TECHNOLOGIES</span>
              <span className="text-slate-600">•</span>
              <span className="text-teal-400 font-medium">Vertical SaaS for US Health & Medicare Agencies</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Production Verified
              </span>
              <span className="text-slate-600">|</span>
              <span>Slide {currentSlide + 1} of {totalSlides}</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// SLIDE A: MAIN BUSINESS WORKFLOW (How Insurance Agencies Manage the Lifecycle)
// ============================================================================
function SlideA_MainBusinessWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'Agency Onboarding',
      desc: 'Agency creates dedicated workspace with NPN licensing and activates capacity via automated VietQR PayOS.',
      moduleIcon: Briefcase,
      moduleLabel: 'Workspace & PayOS',
      highlightBadge: 'Fast Activation',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
    },
    {
      num: '02',
      title: 'Customer Data Centralization',
      desc: 'Centralize policyholder profiles, household dependents, DOBs, and immigration documents with instant auto-save.',
      moduleIcon: Users,
      moduleLabel: 'Contacts 360° CRM',
      highlightBadge: 'Zero Data Loss',
      badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15',
    },
    {
      num: '03',
      title: 'Monitor Customer Milestones',
      desc: 'Smart radar detects Turning-65 clients (120-day Medicare IEP window) and upcoming ACA renewal deadlines.',
      moduleIcon: ShieldAlert,
      moduleLabel: 'Smart Lifecycle Alerts',
      highlightBadge: 'High Revenue Impact',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/20',
      isHeroStep: true,
    },
    {
      num: '04',
      title: 'Agent Follow-Up & Tasks',
      desc: 'Execute outreach, schedule renewal consultations, assign priority tickets, and maintain real-time audit logs.',
      moduleIcon: ListTodo,
      moduleLabel: 'Tasks & Activity Log',
      highlightBadge: 'Actionable Workflow',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15',
    },
    {
      num: '05',
      title: 'Deal & Enrollment Pipeline',
      desc: 'Progress insurance opportunities across a 10-stage visual Kanban from "New Opportunity" to "Enrolled - Active".',
      moduleIcon: Layers,
      moduleLabel: 'Visual Kanban Pipeline',
      highlightBadge: 'Stage Conversion',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/15',
    },
    {
      num: '06',
      title: 'Commission & Retention',
      desc: 'Reconcile multi-carrier commission payouts (Aetna, BCBS, UHC, etc.) and retain high multi-year customer LTV.',
      moduleIcon: DollarSign,
      moduleLabel: 'Carrier Commission Ledger',
      highlightBadge: '100% Transparency',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
    },
  ];

  const outcomes = [
    {
      stat: '+40%',
      title: 'Renewal Retention Rate',
      desc: 'Never miss an ACA open enrollment deadline with automated policy alerts.',
      icon: Clock,
      color: 'text-teal-400',
    },
    {
      stat: '3.2x',
      title: 'Medicare Cross-Sells',
      desc: 'Capture clients aging into 65 within their critical 120-day IEP window.',
      icon: TrendingUp,
      color: 'text-amber-400',
    },
    {
      stat: '100%',
      title: 'Audit-Ready Client Records',
      desc: 'Family members, income proofs, and notes stored in one unified timeline.',
      icon: CheckCircle2,
      color: 'text-blue-400',
    },
    {
      stat: '$0',
      title: 'Commission Discrepancy',
      desc: 'Real-time reconciliation of expected vs paid statements across 9+ carriers.',
      icon: DollarSign,
      color: 'text-emerald-400',
    },
    {
      stat: '5x',
      title: 'Faster Agent Operations',
      desc: 'Eliminate disconnected spreadsheets with unified Kanban deals & task queues.',
      icon: Sparkles,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 sm:p-10 justify-between relative z-10 overflow-hidden">
      {/* ── Slide Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-1 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              Core Architecture Visual
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-semibold">End-to-End Insurance CRM Pipeline</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>INSURMATCH — MAIN BUSINESS WORKFLOW</span>
          </h1>
          <p className="text-sm lg:text-base text-slate-400 mt-1.5 font-medium">
            How Independent Insurance Agencies Systematically Manage the Customer Lifecycle & Retain Revenue
          </p>
        </div>

        {/* Brand Chip */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <div className="text-xs font-bold text-white">InsurMatch CRM</div>
            <div className="text-[10px] text-teal-400">Production Build v1.4</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-extrabold text-sm">
            IM
          </div>
        </div>
      </div>

      {/* ── 6-Stage Process Flow ────────────────────────────────────────────── */}
      <div className="my-auto py-4">
        <div className="grid grid-cols-6 gap-3.5 relative">
          {steps.map((step, idx) => {
            const Icon = step.moduleIcon;
            return (
              <div key={step.num} className="relative flex flex-col">
                {/* Arrow Connector (between cards) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-[#0A1424] border border-slate-700 flex items-center justify-center shadow-md">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                )}

                {/* Card Container */}
                <div
                  className={`flex-1 rounded-xl p-4.5 flex flex-col justify-between transition-all duration-300 relative group ${
                    step.isHeroStep
                      ? 'bg-gradient-to-b from-[#132038] to-[#0E1A2E] border-2 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/90'
                  }`}
                >
                  {/* Top Row: Step Number & Module Tag */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-2xl font-black font-mono tracking-tighter text-slate-500 group-hover:text-teal-400 transition">
                        {step.num}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${step.badgeColor}`}
                      >
                        {step.highlightBadge}
                      </span>
                    </div>

                    {/* Module Icon & Title */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className={`w-7 h-7 rounded-lg ${step.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${step.iconColor}`} />
                      </div>
                      <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                        {step.title}
                      </h3>
                    </div>

                    {/* Step Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom Module Indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">
                      CRM Module:
                    </span>
                    <span className="font-semibold text-slate-300 group-hover:text-teal-300 transition truncate max-w-[110px]">
                      {step.moduleLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Business Outcomes Bar ───────────────────────────────────── */}
      <div className="bg-[#08101E] rounded-xl border border-slate-800/80 p-4 shrink-0">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Expected Measurable Business Outcomes for Agencies
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Validated via InsurMatch Active Field Pilots
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {outcomes.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/60 flex items-start gap-3"
              >
                <div className="p-1.5 rounded-md bg-slate-800/70 shrink-0 mt-0.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-base font-extrabold font-mono ${item.color}`}>
                      {item.stat}
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE B1: REAL PRODUCT EXPERIENCE (Part 1 - Agent Dashboard & Smart Alerts)
// ============================================================================
function SlideB1_DashboardAndSmartAlerts() {
  return (
    <div className="flex-1 flex flex-col p-8 sm:p-10 justify-between relative z-10 overflow-hidden">
      {/* ── Slide Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-1 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              Live Production Interface
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-semibold">Real Agent Experience & Smart Radar</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            INSURMATCH — REAL PRODUCT EXPERIENCE (DASHBOARD)
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Executive Mission Control with Automated Turning-65 (Medicare IEP) & ACA Renewal Alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
            Medicare Turning 65: Active
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
            ACA Renewal Radar: Active
          </span>
        </div>
      </div>

      {/* ── Dashboard Representation ────────────────────────────────────────── */}
      <div className="my-auto py-3 grid grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Top KPIs & Quick Metrics (4 cols) */}
        <div className="col-span-4 flex flex-col justify-between gap-3">
          {/* Active Agent Identity Card */}
          <div className="bg-[#0C172B] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center font-bold text-teal-300 text-sm">
                NK
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Nguyen Phuong Khai</h4>
                <p className="text-[10px] text-slate-400">Licensed Insurance Agent • NPN #123123</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              Active CRM
            </span>
          </div>

          {/* KPI Matrix (2x2) */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-[#0B1527] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Deals Value</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-white font-mono">$164,250</span>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 24 Active Deals
                </p>
              </div>
            </div>

            <div className="bg-[#0B1527] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Policyholders</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-white font-mono">100 / 100</span>
                <p className="text-[10px] text-blue-400 mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 100% Quota Utilized
                </p>
              </div>
            </div>

            <div className="bg-[#0B1527] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Turning 65 Clients</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-purple-400 font-mono">3 Clients</span>
                <p className="text-[10px] text-purple-300 mt-0.5">Eligible for Medicare Switch</p>
              </div>
            </div>

            <div className="bg-[#0B1527] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">ACA Policy Expirations</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-amber-400 font-mono">4 Clients</span>
                <p className="text-[10px] text-amber-300 mt-0.5">Need Subsidy Confirmation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Smart Lifecycle Alerts (8 cols) */}
        <div className="col-span-8 bg-[#091222] border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Radar: Critical Customer Milestones
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Auto-calculated daily from Date of Birth & Policy Start Date
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Turning 65 Medicare Column */}
            <div className="bg-[#0D182E] border border-purple-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    <span className="text-xs font-bold text-purple-300">Turning 65 (Medicare IEP)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    3 In Window
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">
                  Clients within 120 days of their 65th birthday. Agents must contact immediately for Medicare Initial Enrollment.
                </p>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-purple-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Nguyen Van Minh</div>
                      <div className="text-[10px] text-slate-400">DOB: 15/03/1961 • Phone: +1 832-555-0199</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                      Còn 42 ngày
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-purple-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Tran Thi Mai</div>
                      <div className="text-[10px] text-slate-400">DOB: 28/04/1961 • Phone: +1 714-555-0142</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                      Còn 86 ngày
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[10px] text-purple-300">
                <span>Action: Create Medicare Advantage Deal</span>
                <span className="font-bold underline cursor-pointer hover:text-white">Review Profile →</span>
              </div>
            </div>

            {/* ACA Renewal Watchlist Column */}
            <div className="bg-[#0D182E] border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold text-amber-300">ACA Policy Renewal Queue</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    4 Due Soon
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">
                  Policyholders nearing annual renewal. Ensure income proofs and tax subsidies are verified before termination.
                </p>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Le Hoang Long (Family of 4)</div>
                      <div className="text-[10px] text-slate-400">Carrier: Ambetter • Subsidy: $840/mo</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                      Hạn: Còn 6 ngày
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Pham Quoc Bao</div>
                      <div className="text-[10px] text-slate-400">Carrier: BlueCross BlueShield • $0 Plan</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      Hạn: Còn 18 ngày
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-amber-300">
                <span>Action: Trigger Renewal Quote & Confirm</span>
                <span className="font-bold underline cursor-pointer hover:text-white">Open Queue →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Implementation Truth Note ───────────────────────────────── */}
      <div className="bg-[#08101E] rounded-xl border border-slate-800 p-3.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Production Verification:</strong> All alert numbers, contact scopes, and date diff logic run directly against Postgres via Spring Boot REST APIs (`/api/contacts`, `/api/dashboard/stats`).
          </span>
        </div>
        <span className="text-[11px] text-teal-400 font-mono shrink-0">
          Source: src/pages/dashboard/staff/StaffCrmDashboard.jsx
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE B2: REAL PRODUCT EXPERIENCE (Part 2 - Core Workspace Modules)
// ============================================================================
function SlideB2_CoreWorkspaceAndLedger() {
  return (
    <div className="flex-1 flex flex-col p-8 sm:p-10 justify-between relative z-10 overflow-hidden">
      {/* ── Slide Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-1 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              Live Production Interface
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-semibold">Core Agent Operating Modules</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            INSURMATCH — REAL PRODUCT WORKSPACE
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Contacts 360°, 10-Stage Kanban Deals Pipeline, Task Queues, and Carrier Commission Ledger
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800">
            Kanban Stages: 10
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800">
            Carriers: 9 Active
          </span>
        </div>
      </div>

      {/* ── 4-Module Product Grid ───────────────────────────────────────────── */}
      <div className="my-auto py-3 grid grid-cols-2 gap-4.5">
        {/* Module 1: Contacts & Client Profile */}
        <div className="bg-[#0B1424] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  1. Contacts & Client 360° Profile
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                Auto-Save Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Full client record with enrolled address, family members, communication history, and attached insurance IDs.
            </p>

            {/* UI Mockup snippet */}
            <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800/80 space-y-2 text-[10px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-bold text-white">Nguyen Phuong Khai (ID: #20)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Phone & State:</span>
                <span className="text-slate-300 font-mono">+1 (832) 555-0199 • North Carolina (NC)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Household & Docs:</span>
                <span className="text-emerald-400 font-medium">With Family (3 Members) • 2 Verified Docs</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Module: StaffContactDetail.jsx</span>
            <span className="text-teal-400 font-semibold">Strict RBAC Scoped</span>
          </div>
        </div>

        {/* Module 2: Deals & Kanban Pipeline */}
        <div className="bg-[#0B1424] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Deals & Visual Kanban Pipeline
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                Multi-Stage Drag & Drop
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Tracks opportunities from New Lead → Need to Quote → Waiting Document → Ready to Enroll → Enrolled Active.
            </p>

            {/* UI Mockup snippet */}
            <div className="bg-[#070D18] p-2.5 rounded-lg border border-slate-800/80 grid grid-cols-4 gap-1.5 text-[9px] text-center">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="font-bold text-slate-300 truncate">New Opportunity</div>
                <div className="text-cyan-400 font-mono mt-1 font-bold">8 Deals</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="font-bold text-slate-300 truncate">Need to Quote</div>
                <div className="text-amber-400 font-mono mt-1 font-bold">5 Deals</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="font-bold text-slate-300 truncate">Wait Document</div>
                <div className="text-purple-400 font-mono mt-1 font-bold">4 Deals</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-emerald-500/30">
                <div className="font-bold text-emerald-300 truncate">Enrolled Active</div>
                <div className="text-emerald-400 font-mono mt-1 font-bold">12 Deals</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Module: StaffDealsKanban.jsx</span>
            <span className="text-cyan-400 font-semibold">Real-time Stage Movement</span>
          </div>
        </div>

        {/* Module 3: Tasks & Activity Follow-up */}
        <div className="bg-[#0B1424] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  3. Tasks & Outreach Management
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                Priority Routing
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Task queues with priorities (Urgent → Low), due date reminders, assignee delegation, and comment threads.
            </p>

            {/* UI Mockup snippet */}
            <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800/80 space-y-2 text-[10px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-white font-medium">Verify income doc for Tran Van A</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px]">
                  Urgent
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-white font-medium">Schedule Medicare transition call</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px]">
                  Medium
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Module: StaffTasksList.jsx</span>
            <span className="text-purple-400 font-semibold">Delegation & Subtasks</span>
          </div>
        </div>

        {/* Module 4: Commission Ledger */}
        <div className="bg-[#0B1424] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  4. Carrier Commission Ledger
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                100% Payout Tracking
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Automated reconciliation across Aetna, BCBS, UnitedHealthcare, Oscar, and Ambetter with CSV statement export.
            </p>

            {/* UI Mockup snippet */}
            <div className="bg-[#070D18] p-3 rounded-lg border border-slate-800/80 space-y-2 text-[10px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Total Projected Payout:</span>
                <span className="font-bold text-emerald-400 font-mono">$18,450.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settlement Status:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]">Paid: 84%</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px]">Pending: 16%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Module: AgentCommissionLedger.jsx</span>
            <span className="text-emerald-400 font-semibold">Zero Commission Leakage</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Summary ─────────────────────────────────────────────────── */}
      <div className="bg-[#08101E] rounded-xl border border-slate-800 p-3.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong>Architectural Cohesion:</strong> When an agent updates a contact’s stage or documents, deals, tasks, and commission statements sync automatically without manual re-entry.
          </span>
        </div>
        <Link
          to="/dashboard/agent/subscription"
          className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold underline shrink-0"
        >
          View Subscription & Capacity →
        </Link>
      </div>
    </div>
  );
}
