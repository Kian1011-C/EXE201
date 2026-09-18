import React, { useState } from 'react';
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, Clock, Phone, HeartPulse, ShieldCheck, BadgeDollarSign } from 'lucide-react';

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    coverageType: 'health',
    zipCode: '',
    householdSize: '1',
    annualIncome: '\$35,000 - \$55,000',
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
    }, 700);
  };

  return (
    <div className="w-full py-12 md:py-20 bg-gray-50 min-h-[85vh]">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Progress header */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
            100% Free • No Broker Fees
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-[#0f2942]">Compare Insurance Quotes</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Guaranteed response with multiple carrier rate options within 24 to 48 business hours.
          </p>

          {/* Stepper Dots */}
          {!isCompleted && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 1 ? 'text-[#0f2942]' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#0f2942] text-white' : 'bg-gray-200'}`}>1</span>
                <span>Type & Location</span>
              </div>
              <span className="text-gray-300">——</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 2 ? 'text-[#0f2942]' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#0f2942] text-white' : 'bg-gray-200'}`}>2</span>
                <span>Details & Subsidies</span>
              </div>
              <span className="text-gray-300">——</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 3 ? 'text-[#0f2942]' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#0f2942] text-white' : 'bg-gray-200'}`}>3</span>
                <span>Contact Info</span>
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xl">
          {isCompleted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Quote Request is In Progress!</h2>
              <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Our licensed Texas agents are now checking quotes from top providers for zip code <strong>{formData.zipCode}</strong>.
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left text-xs text-blue-950 space-y-2 max-w-md mx-auto">
                <div className="font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>Expect a call or email from our agent:</span>
                </div>
                <p>Phone: <strong>{formData.phone}</strong></p>
                <p>Email: <strong>{formData.email}</strong></p>
                <p className="text-gray-600 pt-1">
                  Want to speak immediately? Call our office directly at <a href="tel:8336336868" className="font-bold text-blue-800 underline">(833) 633-6868</a>.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => { setIsCompleted(false); setStep(1); }}
                  className="bg-[#0f2942] hover:bg-[#183d60] text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors"
                >
                  Submit Another Quote Request
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Step 1: Coverage type & Zip code */}
              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      Select The Insurance You Need:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'health', title: 'Health Insurance', desc: 'ACA / Obamacare', icon: HeartPulse },
                        { id: 'medicare', title: 'Medicare Plans', desc: 'Part C, D, Medigap', icon: ShieldCheck },
                        { id: 'life', title: 'Life Insurance', desc: 'Term, IUL, Annuities', icon: BadgeDollarSign },
                      ].map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.id}
                            onClick={() => setFormData({ ...formData, coverageType: type.id })}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              formData.coverageType === type.id
                                ? 'border-[#0f2942] bg-blue-50/50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mb-2 ${formData.coverageType === type.id ? 'text-[#0f2942]' : 'text-gray-400'}`} />
                            <div className="font-bold text-sm text-gray-900">{type.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{type.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Zip Code in Texas *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 77450 (Katy) or 77072 (Houston)"
                      maxLength={5}
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Rates and available doctors depend on your county and zip code.</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-container text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span>Continue to Step 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Household & Subsidies details */}
              {step === 2 && (
                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Household Size (Persons on Tax Return)
                      </label>
                      <select
                        value={formData.householdSize}
                        onChange={(e) => setFormData({ ...formData, householdSize: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white"
                      >
                        <option value="1">Just Me (1 Person)</option>
                        <option value="2">2 Persons (Couple)</option>
                        <option value="3">3 Persons (Family)</option>
                        <option value="4">4 Persons (Family)</option>
                        <option value="5+">5+ Persons</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Estimated Annual Household Income
                      </label>
                      <select
                        value={formData.annualIncome}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white"
                      >
                        <option value="Under \$25k">Under \$25,000 / year</option>
                        <option value="\$25,000 - \$40,000">\$25,000 – \$40,000</option>
                        <option value="\$40,000 - \$70,000">\$40,000 – \$70,000</option>
                        <option value="\$70,000 - \$100,000">\$70,000 – \$100,000</option>
                        <option value="Over \$100k">Over \$100,000</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Preferred Doctor or Clinic (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Memorial Hermann, Houston Methodist, or Doctor's name"
                      value={formData.currentDoctor}
                      onChange={(e) => setFormData({ ...formData, currentDoctor: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">We will verify that your preferred providers are in-network before presenting options.</p>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-container text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span>Continue to Final Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Contact Info & Submission */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="David Nguyen"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(832) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Language
                      </label>
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                      >
                        <option value="Both">English & Tiếng Việt</option>
                        <option value="Vietnamese">Tiếng Việt</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary-container text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                         <span>Processing Quote Request...</span>
                      ) : (
                        <>
                          <span>Submit Quote Request</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
