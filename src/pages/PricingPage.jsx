import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, ArrowRight, HelpCircle, Shield, Sparkles, Building, User, Users, Zap } from 'lucide-react';

export default function PricingPage({ onOpenQuote }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      target: 'Individual Agent',
      badge: 'Solopreneur',
      monthlyPrice: 39,
      annualPrice: 32, // ~$390/yr
      users: '1 user included',
      description: 'Ideal for independent licensed agents looking to replace spreadsheets and organize their client book.',
      popular: false,
      features: [
        'Centralized customer & contact profiles',
        'Basic lead capture & tracking',
        'Standard ACA & Medicare pipelines',
        'Calendar, appointments & task reminders',
        'Basic compliant email templates',
        'Individual activity overview',
        '14-day free trial included',
        'Standard email support',
      ],
      notIncluded: [
        'Team collaboration & shared access',
        'Automated multi-step SMS workflows',
        'Customizable pipeline stages',
        'Agency-wide commission visibility',
      ],
      ctaText: 'Start 14-Day Free Trial',
    },
    {
      id: 'professional',
      name: 'Professional',
      target: 'Growing Agent or Small Team',
      badge: 'Most Popular',
      monthlyPrice: 79,
      annualPrice: 65, // ~$790/yr
      users: 'Up to 3 users',
      description: 'Designed for high-producing agents or small teams needing customizable pipelines, automation, and deeper visibility.',
      popular: true,
      features: [
        'Everything in Starter, plus:',
        'Up to 3 team member seats',
        'Advanced lead management & custom tags',
        'Customizable CRM pipeline stages',
        'Shared team calendar & automated follow-ups',
        'Email automation & limited SMS workflows',
        'Pipeline, deal & productivity analytics',
        'Commission visibility & policy tracking',
        'Basic user roles & permissions',
        'Priority email & ticket support',
      ],
      notIncluded: [
        'Multi-team lead distribution rules',
        'Agency master commission ledger',
      ],
      ctaText: 'Start 14-Day Free Trial',
    },
    {
      id: 'agency',
      name: 'Agency',
      target: 'Multi-Agent Insurance Agency',
      badge: 'Full Platform',
      monthlyPrice: 199,
      annualPrice: 165, // ~$1,990/yr
      users: 'Up to 10 users',
      description: 'Built for insurance agency owners needing team lead routing, staff oversight, and operational reporting.',
      popular: false,
      features: [
        'Everything in Professional, plus:',
        'Up to 10 team seats (agents & staff)',
        'Shared team lead assignment & auto-routing',
        'Multiple team pipelines across lines of business',
        'Team task oversight, deadlines & audit logs',
        'Advanced team automation & sequences',
        'Agency-wide & agent-level operational reporting',
        'Master commission visibility & ledger',
        'Full role-based permissions & compliance controls',
        'Dedicated onboarding assistance & priority support',
      ],
      notIncluded: [],
      ctaText: 'Start 14-Day Free Trial',
    },
  ];

  const comparisonFeatures = [
    {
      category: 'Core CRM & Leads',
      items: [
        { name: 'Customer & Contact Management', starter: true, pro: true, agency: true },
        { name: 'Lead Capture & Tracking', starter: 'Basic', pro: 'Advanced', agency: 'Team Routing' },
        { name: 'CRM Pipeline Customization', starter: 'Standard (ACA/Medicare)', pro: 'Custom Stages', agency: 'Multiple Team Pipelines' },
        { name: 'Active User Seats Included', starter: '1 User', pro: 'Up to 3 Users', agency: 'Up to 10 Users' },
      ],
    },
    {
      category: 'Workflows & Reminders',
      items: [
        { name: 'Calendar, Appointments & Tasks', starter: 'Basic', pro: 'Shared + Automated', agency: 'Team Assignment + Oversight' },
        { name: 'Renewal Date Tracking', starter: true, pro: true, agency: true },
        { name: 'Follow-up Task Sequences', starter: 'Manual', pro: 'Automated', agency: 'Advanced Multi-step' },
        { name: 'Email & SMS Automation', starter: 'Basic Templates', pro: 'Automation + Limited SMS', agency: 'Full Multi-Channel Automation' },
      ],
    },
    {
      category: 'Analytics & Management',
      items: [
        { name: 'Performance Dashboard', starter: 'Individual Overview', pro: 'Productivity & Pipeline', agency: 'Agency-wide & Agent-level' },
        { name: 'Commission Visibility Tools', starter: 'Basic Records', pro: 'Policy-level Tracking', agency: 'Master Agency Ledger' },
        { name: 'User Roles & Access Permissions', starter: false, pro: 'Basic Roles', agency: 'Granular Admin/Staff/Agent Controls' },
        { name: 'Compliance & Audit Logging', starter: 'Standard', pro: 'Enhanced', agency: 'Complete Audit Trail' },
      ],
    },
  ];

  const faqs = [
    {
      q: 'Does InsurMatch take a percentage of my insurance commissions?',
      a: 'No, absolutely not. InsurMatch is a pure B2B SaaS software provider. We charge a flat monthly or annual software subscription fee. You keep 100% of your insurance carrier commissions, and all your client records belong strictly to you.',
    },
    {
      q: 'What happens during the 14-day free trial?',
      a: 'You receive complete access to all CRM capabilities for 14 days without entering any credit card. You can import contacts, test pipelines, schedule follow-ups, and experience the platform firsthand. At the end of the trial, you can choose Starter, Professional, or Agency.',
    },
    {
      q: 'Can I add more users if my agency expands beyond 10 agents?',
      a: 'Yes! The Agency package includes 10 seats. For larger agencies or call centers with more than 10 agents, contact our team for enterprise tier options ($15/month per additional agent).',
    },
    {
      q: 'Is our customer and healthcare data protected?',
      a: 'Yes. InsurMatch employs bank-grade SSL/TLS encrypted transmission, role-based access controls, regular database backups, and strict compliance safeguards suitable for insurance professionals handling ACA and Medicare client data.',
    },
    {
      q: 'Can I cancel or switch plans at any time?',
      a: 'Yes. Monthly plans can be cancelled anytime with no penalty. You can also upgrade or downgrade your tier seamlessly from your Account Settings as your book of business grows.',
    },
  ];

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className="pt-16 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand/70 border border-stroke-subtle text-xs font-semibold text-navy-deep mb-6">
          <Sparkles className="w-3.5 h-3.5 text-champagne" />
          <span>B2B SaaS Pricing for Insurance Professionals</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-deep tracking-tight max-w-4xl mx-auto leading-tight">
          Simple, Transparent Pricing.{' '}
          <span className="text-slate-muted font-normal block sm:inline">No Hidden Cuts.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-charcoal/70 max-w-2xl mx-auto leading-relaxed">
          Replace fragmented spreadsheets and missed renewals with a purpose-built insurance CRM. 
          Keep 100% of your carrier commissions.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-sand/60 border border-stroke-subtle">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-navy-deep text-ivory shadow-xs'
                : 'text-charcoal/70 hover:text-navy-deep'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-navy-deep text-ivory shadow-xs'
                : 'text-charcoal/70 hover:text-navy-deep'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-champagne text-navy-deep font-extrabold text-[10px]">
              Save 15%
            </span>
          </button>
        </div>
      </section>

      {/* ── PRICING CARDS ───────────────────────────────────────────── */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-7 lg:p-8 transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white border-2 border-navy-deep shadow-xl ring-4 ring-navy-deep/5 md:-translate-y-2'
                    : 'bg-white/80 border border-stroke-subtle shadow-xs hover:shadow-md'
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-navy-deep text-champagne text-[11px] font-bold tracking-wider uppercase shadow-xs">
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className="border-b border-sand pb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-navy-deep">{plan.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-muted uppercase tracking-wider">
                      {plan.target}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl lg:text-5xl font-extrabold text-navy-deep font-mono tracking-tight">
                      ${price}
                    </span>
                    <span className="text-xs font-semibold text-charcoal/60">
                      / month {billingCycle === 'annual' && '(billed annually)'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-champagne-light bg-navy-deep/90 inline-block px-2.5 py-1 rounded-md">
                    {plan.users}
                  </div>

                  <p className="mt-3 text-xs text-charcoal/70 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="py-6 flex-grow space-y-3 text-xs text-charcoal/85">
                  <div className="font-bold text-navy-deep text-[11px] uppercase tracking-wider mb-2">
                    Included capabilities:
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 leading-snug">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}

                  {plan.notIncluded.length > 0 && (
                    <div className="pt-3 border-t border-sand/60 space-y-2 opacity-50">
                      {plan.notIncluded.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-muted">
                          <span className="text-[13px] leading-none">✕</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTA Button */}
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
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4 text-champagne" />
                  </button>
                  <p className="text-[10px] text-center text-slate-muted mt-2">
                    14-day free trial • No credit card required
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── B2B SAAS FINANCIAL & COMPLIANCE TRANSPARENCY ──────────── */}
      <section className="py-14 bg-navy-deep text-ivory px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-10 bg-navy-midnight border border-white/10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/15 text-champagne text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Strict B2B SaaS Business Boundary</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Our Business Model is 100% Software Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-xs max-w-3xl mx-auto pt-2">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-bold text-champagne flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>What InsurMatch Does:</span>
              </div>
              <ul className="space-y-1.5 text-ivory/80 list-disc list-inside">
                <li>Provides centralized web CRM & daily workflow tools</li>
                <li>Automates renewal reminders, client follow-ups & tasks</li>
                <li>Helps agents track policy pipelines & organize statements</li>
                <li>Earns revenue strictly from predictable SaaS subscriptions</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <span className="text-base font-black">✕</span>
                <span>What InsurMatch Never Does:</span>
              </div>
              <ul className="space-y-1.5 text-ivory/80 list-disc list-inside">
                <li>Never sells insurance or gives insurance advice</li>
                <li>Never collects, holds, or transmits insurance premiums</li>
                <li>Never receives or takes cuts of carrier commissions</li>
                <li>Never claims ownership of your policyholders or leads</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-navy-deep tracking-tight">
            Detailed Capability Comparison
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-charcoal/70">
            Compare features across Starter, Professional, and Agency tiers to find the right fit for your practice.
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl border border-stroke-subtle shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sand bg-sand/30">
                <th className="py-4 px-6 font-bold text-navy-deep w-2/5">Capability</th>
                <th className="py-4 px-4 font-bold text-navy-deep text-center w-1/5">Starter ($39)</th>
                <th className="py-4 px-4 font-bold text-navy-deep text-center w-1/5 bg-navy-deep/5">
                  Professional ($79)
                </th>
                <th className="py-4 px-4 font-bold text-navy-deep text-center w-1/5">Agency ($199)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {comparisonFeatures.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="bg-sand/20 font-bold text-navy-deep">
                    <td colSpan={4} className="py-3 px-6 text-[11px] uppercase tracking-wider text-slate-muted">
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-sand/10 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-800">{row.name}</td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="font-semibold text-slate-700">{row.starter}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-navy-deep/[0.02]">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="font-bold text-navy-deep">{row.pro}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.agency === 'boolean' ? (
                          row.agency ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="font-bold text-emerald-700">{row.agency}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stroke-subtle">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-deep tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs text-charcoal/70">
            Everything you need to know about InsurMatch subscriptions and data security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-stroke-subtle shadow-2xs">
              <h3 className="font-bold text-sm text-navy-deep flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="mt-2.5 text-xs text-charcoal/75 leading-relaxed pl-6.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-navy-deep text-ivory p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Daily Workflow?
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed">
              Join hundreds of independent insurance agents across the United States who trust InsurMatch 
              to manage their policyholders, renewals, and daily tasks.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenQuote}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-champagne text-navy-deep font-bold text-xs hover:bg-champagne-light transition-colors shadow-xs cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 text-ivory font-bold text-xs hover:bg-white/10 transition-colors cursor-pointer text-center"
              >
                Sign In to CRM Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
