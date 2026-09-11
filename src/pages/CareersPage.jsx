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
            Join Our Big Family
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Insurance Agent Bootcamp & Careers
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Build a lasting financial career with hands-on coaching from top industry leaders. Whether you're brand new or seasoned, we have a place for you.
          </p>
        </div>
      </section>

      {/* Bootcamp Value Proposition */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                Training & Mentorship Program
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0f2942] tracking-tight">
                Why The Best Rate Insurance Bootcamp?
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Starting out in insurance can feel overwhelming without guidance. Our proprietary <strong>Insurance Agent Bootcamp</strong> eliminates guesswork by pairing you directly with 6-figure and 7-figure earners who guide you step-by-step.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Comprehensive Curriculum</span>
                  </div>
                  <p className="text-xs text-gray-600">Product mastery in Medicare, ACA health subsidies, IUL, and retirement annuities.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Top Tier Commission</span>
                  </div>
                  <p className="text-xs text-gray-600">Direct carrier appointments, transparent vesting, and recurring passive renewals.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Bilingual Community</span>
                  </div>
                  <p className="text-xs text-gray-600">Training conducted in English and Vietnamese, fostering an inclusive family culture.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Pre-Licensing Support</span>
                  </div>
                  <p className="text-xs text-gray-600">Not licensed yet? We provide exam prep materials and mentorship to help you pass fast.</p>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-5">
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg">
                <h3 className="text-xl font-bold text-[#0f2942] mb-1">Apply For Next Cohort</h3>
                <p className="text-xs text-gray-500 mb-6">Fill out your details to speak with our recruiter.</p>

                {submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">Application Received!</h4>
                    <p className="text-xs text-gray-600">
                      Our talent acquisition coordinator will review your profile and contact you within 1-2 business days.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Nguyen"
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
                        <label className="block font-semibold text-gray-700 mb-1">Are you licensed?</label>
                        <select
                          value={formData.isLicensed}
                          onChange={(e) => setFormData({ ...formData, isLicensed: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                        >
                          <option value="no">Not yet (Need training)</option>
                          <option value="life_health">Life & Health Licensed</option>
                          <option value="property_casualty">Property & Casualty</option>
                          <option value="both">Both Lines Licensed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">City / State</label>
                        <input
                          type="text"
                          placeholder="e.g. Houston, TX"
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
                      <span>Submit Career Application</span>
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
