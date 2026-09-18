import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Shield, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="w-full bg-background text-on-background">
      {/* Header Banner - Upgraded to match Homepage Hero Caliber */}
      <section className="relative bg-gradient-to-b from-surface to-surface-container-low border-b border-stroke-subtle pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-ice/40 blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center space-y-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-ice text-primary text-xs font-bold tracking-wide shadow-xs animate-float"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span>WE ARE HERE TO HELP • DIGITAL MATCHING PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-on-surface tracking-tight leading-[1.15]"
          >
            Contact <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-container to-secondary">InsurMatch</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
          >
            Have questions about how InsurMatch connects you with verified independent agents, or need assistance with your match request? Reach out to our support team for prompt assistance.
          </motion.p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 md:py-24 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Form Column */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 border border-stroke-subtle shadow-md">
                <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-stroke-subtle">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-ice text-primary flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface">Send A Secure Message</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Guaranteed support response within 24 to 48 business hours.</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface">Message Received!</h3>
                    <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                      Thank you for contacting InsurMatch. Our support team will review your inquiry and follow up promptly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 bg-primary text-on-primary text-xs font-bold py-3 px-6 rounded-xl hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-on-surface mb-1.5">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. David Nguyen"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-stroke-subtle bg-surface-container-lowest text-on-surface text-base sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-on-surface mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="(832) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-stroke-subtle bg-surface-container-lowest text-on-surface text-base sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-on-surface mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-stroke-subtle bg-surface-container-lowest text-on-surface text-base sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-on-surface mb-1.5">Reason for Contact</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-stroke-subtle bg-surface-container-lowest text-on-surface text-base sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          <option value="general">General Match Inquiry</option>
                          <option value="medicare">Medicare Advantage / Supplement (Medigap)</option>
                          <option value="health">ACA Marketplace / Subsidies</option>
                          <option value="life">Life Insurance &amp; Annuities</option>
                          <option value="agent">Licensed Agent Partnership (Join Network)</option>
                          <option value="support">Technical &amp; Account Support</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-on-surface mb-1.5">Your Message / Questions *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your needs, current policy, or preferred consultation time..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-3.5 rounded-xl border border-stroke-subtle bg-surface-container-lowest text-on-surface text-base sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>

                    {/* Brand Cohesive Primary Blue Button */}
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Secure Message</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-outline pt-2">
                      <Shield className="w-4 h-4 text-success-emerald" />
                      <span>Your information is strictly confidential. Zero spam guarantee.</span>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right Column: Unified Cohesive Direct Assistance & Locations */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Direct Assistance Card - Matching White / Subtle Stroke Aesthetic */}
              <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-stroke-subtle shadow-md space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">Platform Assistance</h3>
                    <p className="text-xs text-on-surface-variant">Connecting consumers and verified agent partners</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-success-emerald animate-pulse"></span>
                    24/7 Matching
                  </span>
                </div>
                
                <div className="space-y-5 text-sm">
                  {/* General Support Email */}
                  <a 
                    href="mailto:support@insurmatch.us"
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-surface-container-low hover:bg-cyan-ice/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-ice text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface-variant">Consumer Support:</div>
                      <div className="text-lg font-extrabold text-primary group-hover:underline">
                        support@insurmatch.us
                      </div>
                      <span className="text-[11px] text-outline">Bilingual English &amp; Tiếng Việt Matching Support</span>
                    </div>
                  </a>

                  {/* Agent Network Email */}
                  <a 
                    href="mailto:agents@insurmatch.us"
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-surface-container-low hover:bg-cyan-ice/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-ice text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface-variant">Agent Network Inquiries:</div>
                      <div className="text-sm font-bold text-on-surface group-hover:text-primary">
                        agents@insurmatch.us
                      </div>
                      <span className="text-[11px] text-outline">Licensed Agent Verification &amp; Onboarding</span>
                    </div>
                  </a>

                  {/* Schedule */}
                  <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-surface-container-low">
                    <div className="w-10 h-10 rounded-xl bg-cyan-ice text-primary flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-on-surface-variant">Operating Schedule:</div>
                      <div className="text-on-surface font-semibold">Mon – Fri: 9:00am – 6:00pm CST</div>
                      <div className="text-primary font-medium text-[11px]">Matchmaking Engine: 24/7 Always Active</div>
                      <div className="text-secondary font-medium text-[11px]">Expanded AEP Support: Oct – Dec</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Locations Card - Harmonized Layout */}
              <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-stroke-subtle shadow-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h4 className="font-bold text-on-surface text-base">Regional Partner Network Hubs:</h4>
                  </div>
                  <span className="text-xs text-outline font-medium">Verified Local Agent Hubs</span>
                </div>

                <div className="space-y-3.5 text-xs text-on-surface-variant">
                  {locations.map((loc) => (
                    <div key={loc.id} className="p-3 rounded-xl border border-stroke-subtle hover:border-primary/40 hover:bg-surface-container-low transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface text-sm">{loc.name}</span>
                        <a 
                          href={loc.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(loc.address)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary font-semibold text-[11px] hover:underline flex items-center gap-0.5"
                        >
                          <span>Coverage</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="mt-1 text-on-surface-variant">{loc.address}, {loc.city}</div>
                      <div className="text-primary font-bold mt-1">
                        <a href={loc.phone.includes('@') ? `mailto:${loc.phone}` : `tel:${loc.phone.replace(/\D/g, '')}`}>{loc.phone}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
