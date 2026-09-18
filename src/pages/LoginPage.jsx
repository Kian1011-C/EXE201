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
  { role: 'Admin', email: 'admin@thebestrateins.com', password: 'Admin@123', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { role: 'Staff', email: 'staff@thebestrateins.com', password: 'Staff@123', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { role: 'Agent', email: 'agent@thebestrateins.com', password: 'Agent@123', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
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
      setError(err.message || 'Login failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-trust-navy-deep via-primary to-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring', damping: 22 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-stroke-subtle">

          {/* Header */}
          <div className="bg-trust-navy-deep px-8 py-7 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <span className="material-symbols-outlined text-cyan-ice text-[28px]">shield_with_heart</span>
              <span className="text-white font-bold text-lg tracking-tight">The Best Rate Insurance</span>
            </Link>
            <h1 className="text-headline-sm font-headline-sm font-bold text-white">Staff Portal</h1>
            <p className="text-body-sm font-body-sm text-cyan-ice/80 mt-1">Sign in to manage your dashboard</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-label-md font-label-md font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">mail</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@thebestrateins.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stroke-subtle bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-label-md font-label-md font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-stroke-subtle bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-body-sm font-body-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold transition-all btn-shimmer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Account Hints */}
            <div className="mt-6">
              <p className="text-label-md font-label-md text-outline uppercase tracking-wider mb-2 text-center">
                Demo Accounts
              </p>
              <div className="space-y-2">
                {DEMO_HINTS.map((hint) => (
                  <button
                    key={hint.role}
                    type="button"
                    onClick={() => fillDemo(hint)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-body-sm font-body-sm transition hover:opacity-80 cursor-pointer ${hint.color}`}
                  >
                    <span className="font-bold">{hint.role}</span>
                    <span className="font-mono text-xs opacity-80">{hint.email}</span>
                    <span className="text-xs opacity-60">Click to fill</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Back to site */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-primary hover:text-primary-container transition"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to main website</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
