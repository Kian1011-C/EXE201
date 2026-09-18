import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { login } from '../auth/authService';
import { useAuth } from '../auth/AuthContext';

const ROLE_REDIRECT = {
  admin: '/dashboard/admin',
  staff: '/dashboard/staff',
  agent: '/dashboard/agent',
};

const DEMO_HINTS = [
  { role: 'Admin', email: 'admin@thebestrateins.com', password: 'Admin@123', label: 'System Admin' },
  { role: 'Staff', email: 'staff@thebestrateins.com', password: 'Staff@123', label: 'Operations' },
  { role: 'Agent', email: 'agent@thebestrateins.com', password: 'Agent@123', label: 'Licensed Advisor' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await login(email, password);
      loginSuccess(session);
      const dest = from || ROLE_REDIRECT[session.user.role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(hint) {
    setEmail(hint.email);
    setPassword(hint.password);
    setError('');
  }

  return (
    <div className="min-h-screen bg-[#0B172A] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#C8A96B] selection:text-[#0B172A]">
      {/* Architectural subtle background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3352_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#14243A] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#14243A] rounded-full blur-3xl opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-[#F7F5EF] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.35)] overflow-hidden border border-[#ECE8DE]">
          {/* Header */}
          <div className="p-8 pb-6 border-b border-[#ECE8DE] bg-[#F7F5EF]">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <img src="/images/insurmatch-logo.png" alt="InsurMatch" className="w-8 h-8 object-contain rounded-lg shadow-xs" />
                <span className="font-black text-xl tracking-tight text-[#0B172A]">
                  INSUR<span className="text-[#C8A96B]">MATCH</span>
                </span>
              </Link>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#17202A]/60 bg-[#ECE8DE] px-2.5 py-1 rounded-full">
                Portal Access
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#0B172A] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#17202A]/60 mt-1">
              Sign in to manage client matching, carrier contracts, and quotes.
            </p>
          </div>

          {/* Form */}
          <div className="p-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#17202A]/70 mb-1.5 uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9ba5] text-[18px] pointer-events-none">mail</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advisor@insurmatch.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECE8DE] bg-white text-sm text-[#17202A] placeholder:text-[#8c9ba5] focus:outline-none focus:border-[#0B172A] focus:ring-1 focus:ring-[#0B172A] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#17202A]/70 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9ba5] text-[18px] pointer-events-none">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#ECE8DE] bg-white text-sm text-[#17202A] placeholder:text-[#8c9ba5] focus:outline-none focus:border-[#0B172A] focus:ring-1 focus:ring-[#0B172A] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c9ba5] hover:text-[#17202A] transition cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0B172A] hover:bg-[#14243A] text-white text-xs sm:text-sm font-semibold tracking-wide transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <span className="text-[#C8A96B]">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Account Hints */}
            <div className="mt-6 pt-5 border-t border-[#ECE8DE]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold text-[#17202A]/50 uppercase tracking-widest">
                  Demo Quick Fill
                </span>
                <span className="text-[10px] text-[#17202A]/40">Click to autofill</span>
              </div>
              <div className="space-y-1.5">
                {DEMO_HINTS.map((hint) => (
                  <button
                    key={hint.role}
                    type="button"
                    onClick={() => fillDemo(hint)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#ECE8DE] bg-white hover:border-[#C8A96B] hover:bg-[#FDFBF7] transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#0B172A] w-12">{hint.role}</span>
                      <span className="text-[11px] text-[#17202A]/60 font-mono">{hint.email}</span>
                    </div>
                    <span className="text-[10px] text-[#C8A96B] font-semibold opacity-0 group-hover:opacity-100 transition">
                      Fill →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Back to site */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#17202A]/60 hover:text-[#0B172A] transition font-medium"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                <span>Back to InsurMatch home</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
