import React, { useState } from 'react';
import { X, CheckCircle2, Shield, Phone, ArrowRight, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuoteModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    zipCode: '',
    insuranceType: 'health',
    ageRange: '35-50',
    preferredLanguage: 'Both',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate instant secure processing
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
        
        {/* Header */}
        <div className="bg-[#0f2942] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Fast & Free • No Obligation</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight">Compare Insurance Quotes</h3>
          <p className="text-xs text-gray-300 mt-1">
            Get personalized rate comparisons from top carriers in Texas within 24-48 business hours.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900">Thank You, {formData.name || 'Friend'}!</h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your quote request has been received by our Texas licensed agents. We are currently comparing rates across top insurance carriers.
              </p>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-left text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>Next Steps:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
                  <li>An agent will review your information for maximum savings & subsidies.</li>
                  <li>We will contact you by phone at <strong>{formData.phone || '(833) 633-6868'}</strong> or email.</li>
                  <li>Need urgent assistance? Call us directly at <a href="tel:8336336868" className="font-bold text-blue-800 underline">(833) 633-6868</a>.</li>
                </ul>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-[#0f2942] hover:bg-[#183d60] text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Coverage Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'health', label: 'Health (ACA)' },
                    { id: 'medicare', label: 'Medicare (65+)' },
                    { id: 'life', label: 'Life / Annuities' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, insuranceType: type.id })}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        formData.insuranceType === type.id
                          ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Nguyen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(832) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Texas Zip Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="77450"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Age Bracket
                  </label>
                  <select
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                  >
                    <option value="18-34">18 - 34 years old</option>
                    <option value="35-50">35 - 50 years old</option>
                    <option value="51-64">51 - 64 years old</option>
                    <option value="65+">65+ years old (Medicare eligible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942] bg-white"
                  >
                    <option value="Both">English & Tiếng Việt</option>
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 btn-shimmer active:scale-[0.98]"
              >
                {loading ? (
                  <span>Checking Available Plans...</span>
                ) : (
                  <>
                    <span>Get Instant Quote Comparison</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your information is 100% confidential and never sold to spam callers.</span>
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
