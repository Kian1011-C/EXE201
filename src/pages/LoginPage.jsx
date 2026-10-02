import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { login } from '../auth/authService';
import { useAuth } from '../auth/AuthContext';

const ROLE_REDIRECT = {
  admin: '/dashboard/admin',
  manager: '/dashboard/admin',
  staff: '/dashboard/staff',
  support: '/dashboard/staff',
  telesales: '/dashboard/staff',
  agent: '/dashboard/agent',
};

const DEMO_HINTS = [
  { role: 'Admin', email: 'admin@insurmatch.us', password: 'Admin@123', label: 'System Admin' },
  { role: 'Staff', email: 'staff@insurmatch.us', password: 'Staff@123', label: 'Operations' },
  { role: 'Agent', email: 'agent@insurmatch.us', password: 'Agent@123', label: 'Licensed Agent Partner' },
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
    <div className="bg-[#0A1628] h-screen w-full flex text-slate-800 antialiased overflow-hidden">
      
      {/* Left Side: Branding / Visual (Hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#0F2962] to-[#0A1628] flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div class="absolute top-[40%] -right-[20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 text-white mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <img src="/images/insurmatch-logo.png" alt="InsurMatch" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight">InsurMatch</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-6">
            Streamline your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">insurance workflow</span>
          </h1>
          <p className="text-blue-100/70 text-lg max-w-md leading-relaxed">
            The all-in-one portal for agents and staff to manage client matching, carrier contracts, and policy quotes efficiently.
          </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[45vh] flex items-center justify-center bg-black/20"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 to-transparent pointer-events-none z-10" />
          <img src="/images/hero-illustration.jpg" alt="InsurMatch Platform" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
        </motion.div>

        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 flex items-center gap-4 text-sm text-blue-200/60 font-medium"
        >
          <span>&copy; {new Date().getFullYear()} The Best Rate Insurance</span>
          <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
          <span>Enterprise CRM</span>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-[55%] bg-white flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Mobile Logo (shows only on small screens) */}
        <div className="lg:hidden flex items-center gap-2 text-slate-900 mb-10 mt-8">
          <div className="w-8 h-8 rounded-lg bg-[#0A1628] flex items-center justify-center shadow-sm">
            <img src="/images/insurmatch-logo.png" alt="InsurMatch" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight">InsurMatch</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Please enter your details to sign in to your portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input 
                  type="email" 
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advisor@insurmatch.com" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 tracking-wider" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
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

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0A1628] hover:bg-[#122340] disabled:bg-[#0A1628]/70 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-slate-900/10 flex justify-center items-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Fill Section */}
          <div className="mt-10">
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink-0 mx-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Demo Quick Fill</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {DEMO_HINTS.map((hint) => {
                let icon = 'shield_person';
                let colorClass = 'text-slate-600 group-hover:text-blue-600 bg-slate-100 group-hover:bg-blue-100';
                let borderClass = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50';
                
                if (hint.role === 'Staff') {
                  icon = 'support_agent';
                  colorClass = 'text-blue-600 bg-blue-100 shadow-sm';
                  borderClass = 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20';
                } else if (hint.role === 'Agent') {
                  icon = 'cases';
                }

                return (
                  <button 
                    key={hint.role}
                    type="button"
                    onClick={() => fillDemo(hint)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all group cursor-pointer ${borderClass}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${colorClass}`}>
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">{hint.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-8 text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to InsurMatch home
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
