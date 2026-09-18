import React, { useState } from 'react';
import { Briefcase, CheckCircle2, ArrowRight, Award, Users, BookOpen, DollarSign, Send } from 'lucide-react';

export default function CareersPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    isLicensed: 'no',
    experienceYears: '0',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0b2138] to-[#153e67] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-400/10 px-3.5 py-1.5 rounded-full">
            Agent Partner Network
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Join Our Verified Agent Partner Network
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Connect with pre-qualified Vietnamese-American insurance consumers seeking licensed Medicare, ACA, and Life specialists in your state.
          </p>
        </div>
      </section>

      {/* Partner Value Proposition */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                Independent Agent Partnership
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0f2942] tracking-tight">
                Grow Your Book with High-Intent Matches
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Finding high-intent consumers shouldn't require spam tactics. The <strong>InsurMatch Partner Network</strong> pairs licensed independent agents directly with Vietnamese consumers actively searching for coverage guidance in your licensed state.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Pre-Qualified Leads</span>
                  </div>
                  <p className="text-xs text-gray-600">Every match request is validated with confirmed phone, email, zip code, and specific product intent.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Pay-Per-Lead Model</span>
                  </div>
                  <p className="text-xs text-gray-600">Transparent per-lead wallet billing. No agency commission splitting, lock-in, or hidden desk fees.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Bilingual Community</span>
                  </div>
                  <p className="text-xs text-gray-600">Meet growing demand among Vietnamese consumers who specifically request bilingual Vietnamese &amp; English agents.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Verified Professional Status</span>
                  </div>
                  <p className="text-xs text-gray-600">We verify your NPN and state licenses to establish consumer confidence and prevent unverified competition.</p>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-5">
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg">
                <h3 className="text-xl font-bold text-[#0f2942] mb-1">Apply For Agent Partner Access</h3>
                <p className="text-xs text-gray-500 mb-6">Submit your licensing credentials for onboarding review.</p>

                {submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">Application Received!</h4>
                    <p className="text-xs text-gray-600">
                      Our agent partnership team will verify your NPN and license credentials and follow up within 1-2 business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Nguyen, Licensed Agent"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="(832) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="agent@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Lines of Authority</label>
                        <select
                          value={formData.isLicensed}
                          onChange={(e) => setFormData({ ...formData, isLicensed: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                        >
                          <option value="life_health">Life &amp; Health Licensed</option>
                          <option value="medicare">Medicare Certified Specialist</option>
                          <option value="aca">ACA Marketplace Certified</option>
                          <option value="all">Comprehensive (Life, Health &amp; Medicare)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">State &amp; NPN Number</label>
                        <input
                          type="text"
                          placeholder="e.g. TX - NPN #19876543"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0f2942] hover:bg-[#1a4773] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Partner Application</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
