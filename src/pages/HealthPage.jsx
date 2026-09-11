import React from 'react';
import { HeartPulse, CheckCircle2, DollarSign, Calendar, ArrowRight, Shield, Activity, HelpCircle } from 'lucide-react';
import { services } from '../data/servicesData';

export default function HealthPage({ onOpenQuote }) {
  const healthData = services.find((s) => s.id === 'health-insurance');

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0e3b30] via-[#134e3f] to-[#1a6452] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>ACA Marketplace & Income Protection</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Health & Family Protection Plans
          </h1>
          <p className="text-base text-emerald-100 max-w-2xl mx-auto">
            Comprehensive individual and family medical coverage with maximum federal tax subsidies. Keep your preferred doctors and afford quality prescriptions.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenQuote}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg cursor-pointer text-sm"
            >
              Calculate Your Federal Subsidy (ACA)
            </button>
          </div>
        </div>
      </section>

      {/* Subsidies Notice */}
      <section className="bg-emerald-50 border-b border-emerald-200 py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>
              <strong>Did You Know?</strong> 4 out of 5 Texas applicants qualify for health insurance plans starting at <strong>\$0 to \$10/month</strong> after federal subsidies!
            </span>
          </div>
          <button onClick={onOpenQuote} className="font-bold underline text-emerald-900 hover:text-emerald-700 cursor-pointer">
            Check Your Eligibility Now →
          </button>
        </div>
      </section>

      {/* Subtypes breakdown */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-[#0f2942]">Healthcare & Financial Shield</h2>
            <p className="text-sm text-gray-500 mt-2">
              Beyond doctor visits and hospital stays, we help you guard your monthly income against unexpected disability or prolonged care needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {healthData.subtypes.map((plan) => (
              <div 
                key={plan.id}
                className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-emerald-600 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <HeartPulse className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{plan.desc}</p>

                  <div className="pt-2 space-y-2 border-t border-gray-200/80">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Plan Highlights:</span>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    onClick={onOpenQuote}
                    className="w-full bg-[#0f2942] hover:bg-[#133c63] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Compare {plan.name.split(' ')[0]} Quotes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When Can You Enroll Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-[#0f2942]">When Can You Enroll in Health Insurance?</h2>
            <p className="text-xs text-gray-500 mt-1">Understanding Open Enrollment vs Special Enrollment in Texas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Open Enrollment Period</h3>
                  <div className="text-xs font-semibold text-blue-700">November 1 – January 15</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                This is the standard window each year when anyone can enroll, switch plans, or adjust family members on the ACA Marketplace without requiring a qualifying life event.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Special Enrollment Period (SEP)</h3>
                  <div className="text-xs font-semibold text-emerald-700">Any Time Throughout The Year</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                If you experienced a major life event within the last 60 days (loss of employer coverage, marriage, divorce, birth of a baby, or moving to Texas), you can enroll right now!
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onOpenQuote}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Check If You Qualify For Special Enrollment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
