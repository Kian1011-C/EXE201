import React from 'react';
import { BadgeDollarSign, CheckCircle2, Shield, TrendingUp, Heart, Home, ArrowRight } from 'lucide-react';
import { services } from '../data/servicesData';

export default function LifePage({ onOpenQuote }) {
  const lifeData = services.find((s) => s.id === 'life-insurance');

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#2b1e11] via-[#452e18] to-[#5a3c1e] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <BadgeDollarSign className="w-4 h-4" />
            <span>Legacy Planning & Wealth Preservation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Life Insurance & Fixed Annuities
          </h1>
          <p className="text-base text-amber-100 max-w-2xl mx-auto">
            Protect the home you've built, guarantee your children's future, and establish guaranteed lifetime retirement income without market volatility risk.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenQuote}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg cursor-pointer text-sm"
            >
              Get A Custom Life Insurance Illustration
            </button>
          </div>
        </div>
      </section>

      {/* 4 Life Insurance Subtypes */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-[#0f2942]">Custom Solutions For Every Budget</h2>
            <p className="text-sm text-gray-500 mt-2">
              From \$25/month term life to multimillion-dollar wealth transfer strategies, our independent agents tailor every policy to your exact financial objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lifeData.subtypes.map((plan) => (
              <div 
                key={plan.id}
                className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-amber-500 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      {plan.id === 'individual-life' && <Shield className="w-6 h-6" />}
                      {plan.id === 'final-expense' && <Heart className="w-6 h-6" />}
                      {plan.id === 'fixed-annuities' && <TrendingUp className="w-6 h-6" />}
                      {plan.id === 'mortgage-protection' && <Home className="w-6 h-6" />}
                    </div>
                    <span className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 uppercase">
                      Living Benefits
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{plan.desc}</p>

                  <div className="pt-2 space-y-2 border-t border-gray-200/80">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Key Benefits:</span>
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
                    className="w-full bg-[#0f2942] hover:bg-[#183d60] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Request Quote for {plan.name.split('(')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Living Benefits Spotlight */}
      <section className="py-16 bg-amber-50/60 border-t border-amber-200/60">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md border border-amber-200 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <span className="text-amber-700 font-extrabold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">
                Modern Life Insurance Feature
              </span>
              <h3 className="text-2xl font-bold text-gray-900">
                Did You Know You Don't Have to Die to Use Modern Life Insurance?
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Traditional life insurance only pays out when you pass away. Today's modern policies include <strong>Living Benefits</strong>, allowing you to access cash directly from your death benefit if you suffer a heart attack, stroke, cancer, or major disability while still alive!
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-700 pt-1">
                <span className="bg-gray-100 px-3 py-1 rounded-lg">Critical Illness</span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg">Chronic Illness</span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg">Terminal Illness</span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg">Tax-Free Cash Flow</span>
              </div>
            </div>

            <div className="md:col-span-4 text-center md:text-right">
              <button
                onClick={onOpenQuote}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm cursor-pointer"
              >
                Quote Living Benefits Plan
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
