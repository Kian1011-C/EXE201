import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, ArrowRight, CheckCircle2, Clock, Sparkles, Calendar, Laptop, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitQuote } from '../services/api';

export default function QuoteModal({ isOpen, onClose, initialMode = 'trial' }) {
  const [activeMode, setActiveMode] = useState(initialMode); // 'trial' | 'demo'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    agencyName: '',
    state: 'TX',
    bookSize: '100-300',
    selectedPlan: 'Professional ($79/mo)',
    demoDate: '',
    biggestChallenge: 'Manual spreadsheets & notes',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const parts = formData.name.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      await submitQuote({
        firstName,
        lastName,
        phone: formData.phone,
        email: formData.email,
        howDoYouKnowUs: `B2B ${activeMode} - ${formData.agencyName}`,
        state: formData.state,
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-ivory rounded-3xl shadow-2xl overflow-hidden border border-stroke-subtle my-8"
          >
            {/* Modal Header */}
            <div className="bg-navy-deep text-ivory p-6 sm:p-7 relative border-b border-white/10">
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-ivory transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-champagne text-[11px] font-bold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INSURMATCH B2B SAAS CRM</span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="mt-2 flex items-center gap-2 p-1 rounded-xl bg-white/10 max-w-xs">
                <button
                  type="button"
                  onClick={() => { setActiveMode('trial'); setSubmitted(false); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === 'trial' ? 'bg-champagne text-navy-deep shadow-xs' : 'text-ivory/80 hover:text-ivory'
                  }`}
                >
                  14-Day Free Trial
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMode('demo'); setSubmitted(false); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === 'demo' ? 'bg-champagne text-navy-deep shadow-xs' : 'text-ivory/80 hover:text-ivory'
                  }`}
                >
                  Book a Free Demo
                </button>
              </div>

              <p className="text-xs text-ivory/70 mt-2.5">
                {activeMode === 'trial'
                  ? 'Get instant 14-day access to InsurMatch CRM. No credit card required. Keep 100% of your carrier commissions.'
                  : 'Schedule a 20-minute tailored walkthrough of InsurMatch CRM workflows for independent agents and agencies.'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  
                  <h4 className="text-2xl font-bold text-navy-deep tracking-tight">
                    {activeMode === 'trial' ? 'Your 14-Day Workspace is Ready!' : 'Demo Request Received!'}
                  </h4>
                  
                  <p className="text-xs sm:text-sm text-charcoal/75 max-w-md mx-auto leading-relaxed">
                    {activeMode === 'trial'
                      ? `Welcome aboard, ${formData.name || 'Agent'}! We’ve configured your trial CRM instance for ${formData.agencyName || 'your agency'} (${formData.selectedPlan}).`
                      : `Thank you, ${formData.name || 'Agent'}. Our product specialist will confirm your personalized demo session shortly.`}
                  </p>

                  <div className="bg-sand/40 border border-stroke-subtle p-4 rounded-2xl text-left text-xs text-charcoal/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-navy-deep">
                      <Clock className="w-4 h-4 text-champagne" />
                      <span>Next Steps for Activation:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-charcoal/70 pl-1">
                      <li>Log in to your workspace with your work email: <strong>{formData.email || 'your-email@agency.com'}</strong>.</li>
                      <li>Add your first 5 client records or import your book of business.</li>
                      <li>Create your first follow-up task and test the renewal tracking calendar.</li>
                      <li>Questions? Contact support at <a href="mailto:support@insurmatch.us" className="font-bold text-navy-deep underline">support@insurmatch.us</a>.</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/login"
                      onClick={handleReset}
                      className="flex-1 bg-navy-deep hover:bg-navy-midnight text-ivory font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors text-center cursor-pointer shadow-xs"
                    >
                      Log In to CRM Portal
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-3.5 rounded-xl border border-stroke-subtle text-charcoal font-semibold text-xs hover:bg-sand/40 transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Selected Plan / Package indicator */}
                  <div className="bg-sand/40 p-3 rounded-xl border border-stroke-subtle flex items-center justify-between text-xs">
                    <span className="font-medium text-charcoal/80">Selected SaaS Package:</span>
                    <select
                      value={formData.selectedPlan}
                      onChange={(e) => setFormData({ ...formData, selectedPlan: e.target.value })}
                      className="font-bold text-navy-deep bg-white px-2.5 py-1 rounded-lg border border-stroke-subtle text-xs cursor-pointer focus:outline-none focus:border-navy-deep"
                    >
                      <option value="Starter ($39/mo)">Starter — $39 / mo (1 User)</option>
                      <option value="Professional ($79/mo)">Professional — $79 / mo (Up to 3 Users)</option>
                      <option value="Agency ($199/mo)">Agency — $199 / mo (Up to 10 Users)</option>
                    </select>
                  </div>

                  {/* Personal Contact Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Miller, Licensed Agent"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@millerinsurance.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(713) 555-0199"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        Agency or Practice Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Miller Financial & Insurance"
                        value={formData.agencyName}
                        onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        State of Operation *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep cursor-pointer"
                      >
                        <option value="TX">Texas (TX)</option>
                        <option value="NC">North Carolina (NC)</option>
                        <option value="CA">California (CA)</option>
                        <option value="FL">Florida (FL)</option>
                        <option value="GA">Georgia (GA)</option>
                        <option value="VA">Virginia (VA)</option>
                        <option value="OTHER">Other State</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        Active Policyholders / Book Size
                      </label>
                      <select
                        value={formData.bookSize}
                        onChange={(e) => setFormData({ ...formData, bookSize: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep cursor-pointer"
                      >
                        <option value="1-100">1 – 100 active clients</option>
                        <option value="100-300">100 – 300 active clients</option>
                        <option value="300-500">300 – 500 active clients</option>
                        <option value="500+">500+ active clients (Call Center / Agency)</option>
                      </select>
                    </div>
                  </div>

                  {activeMode === 'demo' ? (
                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        Preferred Demo Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.demoDate}
                        onChange={(e) => setFormData({ ...formData, demoDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-navy-deep mb-1">
                        What workflow are you looking to replace?
                      </label>
                      <select
                        value={formData.biggestChallenge}
                        onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stroke-subtle bg-white text-xs text-charcoal focus:outline-none focus:border-navy-deep cursor-pointer"
                      >
                        <option value="Manual spreadsheets & notes">Excel spreadsheets &amp; manual notes</option>
                        <option value="Missed renewals & follow-ups">Missed annual renewal windows</option>
                        <option value="Generic CRM too complex">Generic CRM is too complex &amp; expensive</option>
                        <option value="Team coordination chaos">Team coordination &amp; lead tracking</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-deep hover:bg-navy-midnight text-ivory font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60 text-xs tracking-wider uppercase"
                  >
                    {loading ? (
                      <span>Setting Up Your Workspace...</span>
                    ) : (
                      <>
                        <span>{activeMode === 'trial' ? 'Start 14-Day Free Trial' : 'Schedule My Free Demo'}</span>
                        <ArrowRight className="w-4 h-4 text-champagne" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal/60 pt-1 text-center">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>No credit card required • Cancel anytime • You keep 100% of carrier commissions</span>
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
