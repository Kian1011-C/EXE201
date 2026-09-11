import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Calendar, Phone, ArrowRight, FileText } from 'lucide-react';
import { services } from '../data/servicesData';

export default function MedicarePage({ onOpenQuote }) {
  const medicareData = services.find((s) => s.id === 'medicare');

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0c2744] via-[#10355d] to-[#154374] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Senior Healthcare & Advantage Plans</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Medicare Solutions in Texas
          </h1>
          <p className="text-base text-gray-200 max-w-2xl mx-auto">
            Navigating Original Medicare, Advantage (Part C), Part D drug coverage, and Medigap Supplements with zero bias.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenQuote}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg cursor-pointer text-sm"
            >
              Check My Medicare Eligibility & Plans
            </button>
          </div>
        </div>
      </section>

      {/* Key Dates Notice */}
      <section className="bg-amber-50 border-b border-amber-200 py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              <strong>Annual Enrollment Period (AEP):</strong> October 15 – December 7 every year. We are open on weekends!
            </span>
          </div>
          <a href="tel:8336336868" className="font-bold underline text-amber-950 hover:text-amber-800">
            Call for Enrollment: (833) 633-6868
          </a>
        </div>
      </section>

      {/* Detailed Plans Breakdown */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-[#0f2942]">Understand Your Medicare Options</h2>
            <p className="text-sm text-gray-500 mt-2">
              Original Medicare (Parts A & B) leaves significant copays and 20% coinsurance without an annual spending cap. Here is how our plans protect you:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {medicareData.subtypes.map((plan) => (
              <div 
                key={plan.id}
                className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-[#0f2942] transition-all flex flex-col justify-between shadow-sm hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0f2942] border border-slate-200 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
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
                    className="w-full bg-[#0f2942] hover:bg-[#1b436c] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Compare {plan.name.split('(')[0]} Rates
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: Medicare Advantage vs Medigap */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-[#0f2942]">
              Medicare Advantage vs. Medicare Supplement (Medigap)
            </h2>
            <p className="text-xs text-gray-500 mt-1">Which option best fits your healthcare lifestyle and budget?</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 text-xs md:text-sm overflow-hidden">
              <thead className="bg-[#0f2942] text-white text-left">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4">Medicare Advantage (Part C)</th>
                  <th className="p-4">Medicare Supplement (Medigap)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-4 font-bold text-gray-800">Monthly Premium</td>
                  <td className="p-4 text-gray-600">Often \$0 or low monthly premium</td>
                  <td className="p-4 text-gray-600">Moderate monthly premium (\$100–\$250+)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-800">Doctor Network</td>
                  <td className="p-4 text-gray-600">HMO/PPO network (requires network doctors)</td>
                  <td className="p-4 text-gray-600">Any doctor nationwide accepting Medicare</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-800">Prescription Drugs</td>
                  <td className="p-4 text-gray-600">Usually included automatically</td>
                  <td className="p-4 text-gray-600">Requires separate stand-alone Part D plan</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-800">Extra Perks</td>
                  <td className="p-4 text-gray-600">Dental, Vision, Hearing, Gym allowances</td>
                  <td className="p-4 text-gray-600">Strictly medical copays & coinsurance gaps</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
            <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Not sure which one to choose?</span> Our licensed agents provide complimentary, unbiased comparisons based on your doctors and daily medications.
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Disclaimer */}
      <section className="py-8 bg-white border-t border-gray-100 text-center text-xs text-gray-400 px-4">
        <div className="max-w-4xl mx-auto">
          <p>
            The Best Rate Insurance is not affiliated with or endorsed by the U.S. government or the federal Medicare program. Calling the numbers above will direct you to a licensed insurance agent in Texas.
          </p>
        </div>
      </section>
    </div>
  );
}
