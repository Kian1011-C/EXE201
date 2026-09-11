import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, BadgeDollarSign, ArrowRight, CheckCircle2, ChevronRight, User, Users, HeartHandshake, Briefcase } from 'lucide-react';
import { services, targetProfiles } from '../data/servicesData';

export default function ServicesPage({ onOpenQuote }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.id === selectedCategory);

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-[#0f2942] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-400/10 px-3.5 py-1.5 rounded-full">
            Full Portfolio
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Comprehensive Insurance Products
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            As an independent insurance agency, we search across dozens of reputable carriers to build the exact coverage package you and your loved ones need.
          </p>
        </div>
      </section>

      {/* Category Filter Buttons */}
      <section className="bg-white border-b border-gray-200 py-4 px-4 sticky top-16 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
          {[
            { id: 'all', label: 'All Insurance Plans' },
            { id: 'medicare', label: 'Medicare Solutions' },
            { id: 'health-insurance', label: 'Health Insurance (ACA)' },
            { id: 'life-insurance', label: 'Life & Wealth Protection' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-2 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0f2942] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16">
          {filteredServices.map((svc) => (
            <div key={svc.id} className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                    {svc.highlight}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">{svc.title}</h2>
                  <p className="text-sm text-gray-600">{svc.shortDesc}</p>
                </div>
                <div>
                  <Link
                    to={svc.slug}
                    className="bg-[#0f2942] hover:bg-[#183d60] text-white text-xs md:text-sm font-bold py-3 px-5 rounded-xl inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <span>View Dedicated Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Subtypes Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {svc.subtypes.map((sub) => (
                  <div key={sub.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 mb-2">{sub.name}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">{sub.desc}</p>
                      
                      <div className="space-y-1.5 border-t border-gray-200/60 pt-3">
                        {sub.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3">
                      <button
                        onClick={onOpenQuote}
                        className="w-full bg-white hover:bg-gray-100 text-[#0f2942] border border-gray-200 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audiences ("I Am...") */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#0f2942] font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Personalized Matching
            </span>
            <h2 className="text-3xl font-black text-[#0f2942] mt-2">Coverage Based On Who You Are</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select your profile to see our tailored recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetProfiles.map((p, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-between hover:border-[#0f2942] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0f2942] flex items-center justify-center font-bold">
                    {idx === 0 && <User className="w-5 h-5" />}
                    {idx === 1 && <Users className="w-5 h-5" />}
                    {idx === 2 && <HeartHandshake className="w-5 h-5" />}
                    {idx === 3 && <Briefcase className="w-5 h-5" />}
                  </div>

                  <h3 className="font-bold text-base text-gray-900">{p.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Recommended:</span>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {p.recommended.map((rec, i) => (
                        <li key={i} className="flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onOpenQuote}
                    className="w-full bg-[#0f2942] hover:bg-[#183d60] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Match Plans
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
