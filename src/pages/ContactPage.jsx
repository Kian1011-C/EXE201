import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Shield, MessageSquare } from 'lucide-react';
import { locations } from '../data/locationsData';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-[#0f2942] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-400/10 px-3.5 py-1.5 rounded-full">
            We Are Here To Help
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Contact The Best Rate Insurance
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Have questions about your coverage or looking for a quote? Reach out by phone, email, or stop by one of our physical offices.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f2942] flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Secure Contact Form</h2>
                    <p className="text-xs text-gray-500">Guaranteed response within 24 to 48 business hours.</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Message Dispatched!</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Thank you for reaching out to The Best Rate Insurance. A licensed representative from our team will get back to you promptly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 bg-[#0f2942] text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-[#183d60] transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="(832) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Reason for Contact</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                        >
                          <option value="general">General Question</option>
                          <option value="medicare">Medicare Consultation</option>
                          <option value="health">ACA Health Plan / Subsidies</option>
                          <option value="life">Life Insurance & Annuities</option>
                          <option value="claim">File A Claim Assistance</option>
                          <option value="policy_change">Policy Change Request</option>
                          <option value="billing">Billing & Payments Help</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Your Message / Questions *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about what you need assistance with..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Secure Message</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>We respect your privacy. Zero spam promise.</span>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Contact Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0f2942] text-white rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-bold">Direct Assistance</h3>
                
                <div className="space-y-4 text-xs md:text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-400 text-xs">Toll-Free Phone (24/7):</div>
                      <a href="tel:8336336868" className="text-lg font-bold text-white hover:text-amber-400 transition-colors">
                        (833) 633-6868
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-400 text-xs">Email Customer Service:</div>
                      <a href="mailto:info@thebestrateinsurance.com" className="font-semibold text-white hover:text-amber-400 transition-colors">
                        info@thebestrateinsurance.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-400 text-xs">Phone Operating Schedule:</div>
                      <p className="text-gray-200">Monday – Friday: 9:00am – 6:00pm</p>
                      <p className="text-amber-300/90 text-xs mt-0.5">
                        Available by Phone 24/7. Open Weekends: October – December.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Addresses Summary */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Our Physical Texas Locations:</h4>
                <div className="space-y-3 text-xs text-gray-600">
                  {locations.map((loc) => (
                    <div key={loc.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="font-bold text-gray-900">{loc.name}</div>
                      <div>{loc.address}, {loc.city}</div>
                      <div className="text-emerald-700 font-semibold mt-0.5">{loc.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
