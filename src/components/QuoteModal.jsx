import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function QuoteModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    insuranceType: 'health',
    name: '',
    phone: '',
    email: '',
    zipCode: '',
    ageRange: '26-40',
    preferredLanguage: 'Both',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/75 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-ivory rounded-2xl shadow-2xl overflow-hidden border border-stroke-subtle my-8"
          >
            {/* Modal Header */}
            <div className="bg-navy-deep text-ivory p-6 sm:p-7 relative border-b border-white/10">
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-ivory transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-champagne text-[11px] font-bold uppercase tracking-widest mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                <span>INSURMATCH / REQUEST AN AGENT MATCH</span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-ivory">
                Request an Agent Match
              </h3>
              <p className="text-xs text-ivory/70 mt-1">
                Tell us about your coverage needs and we will connect you with a verified licensed agent in your state.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-sand text-navy-deep rounded-xl flex items-center justify-center mx-auto border border-stroke-subtle">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-navy-deep tracking-tight">Your Match Request is Active</h4>
                  <p className="text-xs sm:text-sm text-charcoal/75 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name || 'Friend'}</strong>. Our platform is matching your request with a verified independent agent licensed in your state for zip code <strong>{formData.zipCode}</strong>.
                  </p>

                  <div className="bg-sand/40 border border-stroke-subtle p-4 rounded-xl text-left text-xs text-charcoal/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-navy-deep">
                      <Clock className="w-4 h-4 text-champagne" />
                      <span>Next Steps:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-charcoal/70 pl-1">
                      <li>A matched independent agent will review your requirements and plan options.</li>
                      <li>The agent will reach out at <strong>{formData.phone || 'your phone number'}</strong> or email.</li>
                      <li>Have questions about your match? Contact support at <a href="mailto:support@insurmatch.us" className="font-bold text-navy-deep underline">support@insurmatch.us</a>.</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full bg-navy-deep hover:bg-navy-midnight text-ivory font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Done &amp; Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Coverage Selector */}
                  <div>
                    <label className="block text-xs font-bold text-navy-deep uppercase tracking-wider mb-2">
                      Select Coverage Category *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'health', label: 'Health (ACA)' },
                        { id: 'medicare', label: 'Medicare (65+)' },
                        { id: 'life', label: 'Life / Annuity' },
                      ].map((type) => {
                        const isSelected = formData.insuranceType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, insuranceType: type.id })}
                            className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-navy-deep text-ivory border-navy-deep shadow-xs'
                                : 'bg-surface-container-lowest text-charcoal/80 border-stroke-subtle hover:border-navy-deep/50'
                            }`}
                          >
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal Contact Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="David Nguyen"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stroke-subtle bg-white text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(832) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stroke-subtle bg-white text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stroke-subtle bg-white text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        State &amp; Zip Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="77450"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stroke-subtle bg-white text-sm focus:outline-none focus:border-navy-deep"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Age Range
                      </label>
                      <select
                        value={formData.ageRange}
                        onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stroke-subtle bg-white text-sm focus:outline-none focus:border-navy-deep"
                      >
                        <option value="Under 26">Under 26</option>
                        <option value="26-40">26 – 40 years</option>
                        <option value="41-64">41 – 64 years</option>
                        <option value="65+">65+ years (Medicare)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Preferred Language
                      </label>
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stroke-subtle bg-white text-sm focus:outline-none focus:border-navy-deep"
                      >
                        <option value="Both">English &amp; Tiếng Việt</option>
                        <option value="Vietnamese">Tiếng Việt</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-deep hover:bg-navy-midnight text-ivory font-bold py-3.5 px-6 rounded-lg shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60 text-xs tracking-wider uppercase"
                  >
                    {loading ? (
                      <span>Matching With Licensed Agents...</span>
                    ) : (
                      <>
                        <span>Submit Match Request</span>
                        <ArrowRight className="w-4 h-4 text-champagne" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal/60 pt-1 text-center">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Your information is shared only with your matched licensed agent. Never sold to telemarketers.</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
