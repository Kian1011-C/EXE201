import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Phone, HeartPulse, ShieldCheck, BadgeDollarSign, Shield } from 'lucide-react';

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    coverageType: 'health',
    zipCode: '',
    householdSize: '1',
    annualIncome: '$35,000 - $55,000',
    currentDoctor: '',
    name: '',
    phone: '',
    email: '',
    preferredLanguage: 'Both',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      setStep(4);
    }, 600);
  };

  return (
    <div className="w-full py-16 lg:py-24 bg-ivory min-h-[85vh] text-charcoal">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        
        {/* Progress Header (Section 17) */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
            <span>INSURMATCH / FIND YOUR MATCH</span>
          </div>

          {/* Small 4-step Progress Indicator (Section 17) */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 text-[11px] font-bold tracking-wider uppercase">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-navy-deep' : 'text-charcoal/40'}`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-navy-deep text-ivory' : 'bg-sand text-charcoal/60'}`}>01</span>
              <span>YOU</span>
            </div>
            <span className="text-stroke-subtle">──</span>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-navy-deep' : 'text-charcoal/40'}`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-navy-deep text-ivory' : 'bg-sand text-charcoal/60'}`}>02</span>
              <span>NEEDS</span>
            </div>
            <span className="text-stroke-subtle">──</span>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-navy-deep' : 'text-charcoal/40'}`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-navy-deep text-ivory' : 'bg-sand text-charcoal/60'}`}>03</span>
              <span>OPTIONS</span>
            </div>
            <span className="text-stroke-subtle">──</span>
            <div className={`flex items-center gap-1.5 ${isCompleted ? 'text-navy-deep' : 'text-charcoal/40'}`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${isCompleted ? 'bg-champagne text-navy-deep' : 'bg-sand text-charcoal/60'}`}>04</span>
              <span>MATCH</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-sand/30 rounded-2xl p-6 sm:p-10 border border-stroke-subtle shadow-xs">
          {isCompleted ? (
            /* 04 — MATCH Result Screen */
            <div className="text-center py-8 space-y-6">
              <div className="w-14 h-14 bg-ivory text-navy-deep rounded-xl flex items-center justify-center mx-auto border border-stroke-subtle shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-champagne">04 — YOUR MATCH STATUS</span>
                <h2 className="text-3xl font-extrabold text-navy-deep tracking-tight">
                  Your Match is Underway
                </h2>
                <p className="text-sm text-charcoal/75 max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Our intelligent matching engine is connecting your request for zip code <strong>{formData.zipCode}</strong> with a verified independent agent licensed in your state.
                </p>
              </div>

              <div className="bg-ivory border border-stroke-subtle rounded-xl p-5 text-left text-xs text-charcoal/80 space-y-2.5 max-w-md mx-auto shadow-xs">
                <div className="font-bold flex items-center gap-2 text-navy-deep">
                  <Clock className="w-4 h-4 text-champagne" />
                  <span>What to expect next:</span>
                </div>
                <p>Phone confirmation: <strong>{formData.phone}</strong></p>
                <p>Email delivery: <strong>{formData.email}</strong></p>
                <p className="text-charcoal/60 pt-1 border-t border-stroke-subtle">
                  Need assistance with your match request? Reach our support team at <a href="mailto:support@insurmatch.us" className="font-bold text-navy-deep underline">support@insurmatch.us</a>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { setIsCompleted(false); setStep(1); }}
                  className="bg-navy-deep hover:bg-navy-midnight text-ivory font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start Another Match Request
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Step 1: 01 — YOU (Coverage Type & Location) */}
              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-8 text-left">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-champagne">01 — YOU</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-deep tracking-tight">
                      What kind of coverage are you looking for?
                    </h2>
                    <p className="text-xs sm:text-sm text-charcoal/70">
                      Select a category to begin comparing available independent options.
                    </p>
                  </div>

                  {/* Large Selectable Options (Section 17) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'health', title: 'Health Insurance', desc: 'ACA / Marketplace Subsidies', icon: HeartPulse },
                      { id: 'medicare', title: 'Medicare Guidance', desc: 'Part C, D, & Medigap', icon: ShieldCheck },
                      { id: 'life', title: 'Life & Asset Protection', desc: 'Term, Living Benefits, Annuities', icon: BadgeDollarSign },
                    ].map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.coverageType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setFormData({ ...formData, coverageType: type.id })}
                          className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-navy-deep text-ivory border-navy-deep shadow-xs'
                              : 'bg-ivory hover:bg-sand/60 border-stroke-subtle text-charcoal'
                          }`}
                        >
                          <div>
                            <Icon className={`w-5 h-5 mb-3 ${isSelected ? 'text-champagne' : 'text-slate-muted'}`} />
                            <div className="font-bold text-sm tracking-tight">{type.title}</div>
                            <div className={`text-xs mt-1 ${isSelected ? 'text-ivory/70' : 'text-charcoal/60'}`}>
                              {type.desc}
                            </div>
                          </div>
                          <div className="pt-4 flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-champagne' : 'text-charcoal/40'}`}>
                              {isSelected ? 'Selected' : 'Select'}
                            </span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-champagne" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Texas & Partner States Zip Code */}
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep">
                      Your Zip Code &amp; State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 77450 (Katy, TX) or 77072 (Houston, TX)"
                      maxLength={5}
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                    />
                    <p className="text-[11px] text-charcoal/60">
                      Independent agent licensing and plan availability are determined by state and zip code.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-navy-deep hover:bg-navy-midnight text-ivory font-bold px-7 py-3.5 rounded-lg transition-colors flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer"
                    >
                      <span>Continue to Needs</span>
                      <ArrowRight className="w-4 h-4 text-champagne" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: 02 — NEEDS (Household & Healthcare Preferences) */}
              {step === 2 && (
                <form onSubmit={handleNext} className="space-y-6 text-left">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-champagne">02 — NEEDS</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-deep tracking-tight">
                      Tell us about your coverage needs.
                    </h2>
                    <p className="text-xs sm:text-sm text-charcoal/70">
                      This information helps match you with licensed agents specializing in appropriate subsidy and carrier options.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1.5">
                        Household Size
                      </label>
                      <select
                        value={formData.householdSize}
                        onChange={(e) => setFormData({ ...formData, householdSize: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                      >
                        <option value="1">1 Person (Individual)</option>
                        <option value="2">2 Persons (Couple)</option>
                        <option value="3">3 Persons (Family)</option>
                        <option value="4">4 Persons (Family)</option>
                        <option value="5+">5+ Persons</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1.5">
                        Estimated Annual Household Income
                      </label>
                      <select
                        value={formData.annualIncome}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                      >
                        <option value="Under $25k">Under $25,000 / year</option>
                        <option value="$25,000 - $40,000">$25,000 – $40,000</option>
                        <option value="$40,000 - $70,000">$40,000 – $70,000</option>
                        <option value="$70,000 - $100,000">$70,000 – $100,000</option>
                        <option value="Over $100k">Over $100,000</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1.5">
                      Preferred Doctor, Clinic, or Hospital (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Memorial Hermann, Houston Methodist, or Doctor's name"
                      value={formData.currentDoctor}
                      onChange={(e) => setFormData({ ...formData, currentDoctor: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                    />
                    <p className="text-[11px] text-charcoal/60 mt-1">
                      Your matched licensed agent will review network doctors and plan formularies before presenting options.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:text-navy-deep px-3 py-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="bg-navy-deep hover:bg-navy-midnight text-ivory font-bold px-7 py-3.5 rounded-lg transition-colors flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer"
                    >
                      <span>Continue to Options</span>
                      <ArrowRight className="w-4 h-4 text-champagne" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: 03 — OPTIONS & CONTACT */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-champagne">03 — OPTIONS</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-deep tracking-tight">
                      Where should we send your matched options?
                    </h2>
                    <p className="text-xs sm:text-sm text-charcoal/70">
                      A verified independent agent licensed in your state will review your needs with 100% free matching and zero broker fees.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="David Nguyen"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(832) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy-deep mb-1">
                        Preferred Consultation Language
                      </label>
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-stroke-subtle bg-ivory text-sm focus:outline-none focus:border-navy-deep"
                      >
                        <option value="Both">English &amp; Tiếng Việt</option>
                        <option value="Vietnamese">Tiếng Việt</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:text-navy-deep px-3 py-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-navy-deep hover:bg-navy-midnight text-ivory font-bold px-8 py-3.5 rounded-lg transition-colors flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span>Matching Licensed Agents...</span>
                      ) : (
                        <>
                          <span>Submit Match Request</span>
                          <ArrowRight className="w-4 h-4 text-champagne" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Confidentiality Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-charcoal/60 mt-6">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Your data is 100% confidential. No robo-callers • Verified licensed independent agent match.</span>
        </div>

      </div>
    </div>
  );
}
