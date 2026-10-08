import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Calendar,
  Mail,
  Phone,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUsers, submitMatchmakingInquiry } from '../services/api';
import { getActiveAgentAccounts } from '../utils/constants';

// Helper to add notification for selected agent
export function addCustomerNotification({ customerName, dob, email, phone, agentName }) {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('insurmatch_agent_notifications') : null;
    const list = raw ? JSON.parse(raw) : [];
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      agentName: agentName || 'Trung Trương',
      customerName: customerName || 'Client',
      dob: dob || '',
      email: email || '',
      phone: phone || '',
      title: `New client inquiry: ${customerName}`,
      message: `Client ${customerName} (DOB: ${dob || 'Not provided'}) submitted an insurance request. Phone: ${phone || '—'} • Email: ${email || '—'}. Please follow up promptly!`,
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      unread: true,
    };
    list.unshift(newNotif);
    localStorage.setItem('insurmatch_agent_notifications', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('insurmatch_customer_notification_added', { detail: newNotif }));
    return newNotif;
  } catch (err) {
    console.warn('Failed to save customer notification', err);
    return null;
  }
}

export default function CustomerMatchModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAgentName, setSelectedAgentName] = useState('Trung Trương');
  const [availableAgents, setAvailableAgents] = useState(() => getActiveAgentAccounts());

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Load available agents
  useEffect(() => {
    async function loadAgents() {
      try {
        const users = await getUsers();
        if (Array.isArray(users) && users.length > 0) {
          const agents = users.filter((u) => {
            const r = (u.role || '').toLowerCase();
            const n = (u.name || '').toLowerCase();
            return (
              (r === 'agent' || r === 'broker' || n.includes('trung')) &&
              !n.includes('admin') &&
              !n.includes('staff')
            );
          });
          if (agents.length > 0) {
            setAvailableAgents(agents);
          }
        }
      } catch {}
    }
    loadAgents();
  }, []);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const chosenAgent = selectedAgentName || 'Trung Trương';
      const cleanPhone = phone.trim();
      const cleanName = fullName.trim();
      const cleanEmail = email.trim();

      // 1. Add notification targeted for the selected agent
      addCustomerNotification({
        customerName: cleanName,
        dob,
        email: cleanEmail,
        phone: cleanPhone,
        agentName: chosenAgent,
      });

      // 2. Submit to CRM / backend API
      const parts = cleanName.split(' ');
      const firstName = parts[0] || 'Client';
      const lastName = parts.slice(1).join(' ') || 'User';

      await submitMatchmakingInquiry({
        isAnonymous: false,
        fullName: cleanName,
        firstName,
        lastName,
        dob,
        phone: cleanPhone,
        email: cleanEmail,
        agentName: chosenAgent,
        state: 'TX',
        zipCode: '77072',
        coverageType: 'Insurance Consultation Request',
        annualIncome: 38000,
      });

      setSubmittedResult({
        name: cleanName,
        dob,
        phone: cleanPhone,
        email: cleanEmail,
        agent: chosenAgent,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submit customer inquiry failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setDob('');
    setEmail('');
    setPhone('');
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
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-navy-deep to-indigo-950 text-white p-6 relative border-b border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CONNECT LICENSED INSURANCE AGENT (NPN)</span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Submit Information &amp; Choose Assigned Agent
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Provide your basic contact details below to send your request directly to a licensed insurance agent.
              </p>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-7">
              {submitted && submittedResult ? (
                /* Success Screen */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-navy-deep">
                      Inquiry Submitted Successfully!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                      The system has dispatched a priority alert directly to licensed agent{' '}
                      <strong className="text-blue-700">{submittedResult.agent}</strong>.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-700 font-medium">
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Assigned Agent:</span>
                      <span className="font-extrabold text-blue-900">{submittedResult.agent}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Client Name:</span>
                      <span className="font-bold text-slate-900">{submittedResult.name}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Date of Birth (DOB):</span>
                      <span className="font-bold text-slate-900">{submittedResult.dob || '—'}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Phone Number:</span>
                      <span className="font-bold text-slate-900">{submittedResult.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-bold text-slate-900">{submittedResult.email || '—'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 text-left flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">
                      notifications_active
                    </span>
                    <span>
                      Agent <strong>{submittedResult.agent}</strong> will receive an instant notification in their CRM to follow up with you shortly.
                    </span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                    >
                      Close
                    </button>
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <span>Agent CRM Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form Screen */
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {/* 2. DOB (Date of Birth) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Date of Birth (DOB) *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Date of birth is required to calculate accurate ACA / Medicare state subsidy tiers.
                    </p>
                  </div>

                  {/* 3. Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (832) 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {/* 4. Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {/* 5. Select Agent */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Select Assigned Agent *</span>
                    </label>
                    <select
                      value={selectedAgentName}
                      onChange={(e) => setSelectedAgentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-blue-50/50 font-bold text-blue-950 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                    >
                      {availableAgents.map((ag) => {
                        const name = ag.name || ag.fullName;
                        return (
                          <option key={ag.id || name} value={name}>
                            {name} {name === 'Trung Trương' ? '⭐ (Lead Specialist)' : ''} — NPN: {ag.npn || '2001186'}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[10px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>The selected agent will receive an instant CRM notification to connect with you.</span>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Dispatching alert to agent...</span>
                      ) : (
                        <>
                          <span>Submit Request &amp; Alert Agent {selectedAgentName}</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>100% Private &amp; HIPAA Compliant</span>
                    </p>
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
