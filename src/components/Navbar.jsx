import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ onOpenQuote, onOpenMatch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Subtle Announcement / Phone Line */}
      <div className="bg-navy-deep text-ivory/85 text-xs py-2 px-4 lg:px-8 border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center space-x-3 lg:space-x-4 min-w-0">
            <button 
              type="button"
              onClick={onOpenMatch}
              className="tracking-wider uppercase text-[10px] text-champagne font-bold whitespace-nowrap bg-white/5 hover:bg-champagne/20 hover:text-white px-2.5 py-1 rounded-full border border-champagne/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[13px] text-champagne">travel_explore</span>
              <span>Cổng Khách Hàng: Chọn Đại Lý</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
            <span className="text-white/20 hidden lg:inline">|</span>
            <span className="text-ivory/75 text-[11px] hidden lg:inline whitespace-nowrap">
              Matchmaking Portal cho Khách hàng &amp; B2B CRM cho Đại lý
            </span>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6 text-[11px] shrink-0">
            <a 
              href="mailto:support@insurmatch.us" 
              className="text-ivory/90 hover:text-champagne transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-champagne font-medium">Support:</span>
              <span className="font-semibold tracking-wider">support@insurmatch.us</span>
            </a>
            <span className="text-white/20">|</span>
            <Link to="/pricing" className="text-champagne hover:text-white transition-colors font-bold whitespace-nowrap">
              Plans from $39/mo
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/login" className="text-ivory/80 hover:text-champagne transition-colors font-medium whitespace-nowrap">
              Agent &amp; Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-ivory/95 backdrop-blur-md border-b border-sand shadow-xs py-3.5' 
            : 'bg-ivory border-b border-stroke-subtle py-4 lg:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center">
          
          {/* LEFT: INSURMATCH Brand */}
          <Link className="flex items-center gap-3 group shrink-0" to="/">
            <img 
              alt="InsurMatch" 
              className="h-9 w-9 object-contain rounded-lg transition-transform duration-200 group-hover:scale-105" 
              src="/images/insurmatch-logo.png" 
            />
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-black tracking-tight text-navy-deep leading-none">
                INSUR<span className="text-slate-muted font-normal">MATCH</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-muted uppercase mt-0.5 font-medium whitespace-nowrap">
                B2B SaaS CRM for Insurance Agents
              </span>
            </div>
          </Link>

          {/* CENTER: Clean Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-[13px] font-medium tracking-wide text-charcoal/80">
            <a 
              className="hover:text-navy-deep transition-colors whitespace-nowrap" 
              href="/#features"
            >
              CRM Features
            </a>
            <a 
              className="hover:text-navy-deep transition-colors whitespace-nowrap" 
              href="/#how-it-works"
            >
              How It Works
            </a>
            <Link 
              className={`hover:text-navy-deep transition-colors whitespace-nowrap ${location.pathname === '/pricing' ? 'text-navy-deep font-bold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/pricing"
            >
              Pricing Plans
            </Link>
            <Link 
              className={`hover:text-navy-deep transition-colors whitespace-nowrap ${location.pathname === '/about' ? 'text-navy-deep font-semibold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/about"
            >
              About
            </Link>
            <Link 
              className={`hover:text-navy-deep transition-colors whitespace-nowrap ${location.pathname === '/contact' ? 'text-navy-deep font-semibold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/contact"
            >
              Contact
            </Link>
          </nav>

          {/* RIGHT: Actions (Sign In, Primary CTA & Mobile Toggle) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
              <Link 
                to="/login"
                className="text-xs font-semibold text-charcoal/80 hover:text-navy-deep transition-colors px-2 py-1 whitespace-nowrap"
              >
                Sign In
              </Link>

              <button 
                type="button"
                onClick={onOpenMatch}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-navy-deep/20 bg-white/80 hover:bg-navy-deep hover:text-ivory text-navy-deep transition-all duration-200 font-bold text-xs tracking-wide cursor-pointer shadow-2xs whitespace-nowrap group"
              >
                <span className="material-symbols-outlined text-[16px] text-champagne">travel_explore</span>
                <span>Kết Nối Đại Lý</span>
              </button>

              <button 
                onClick={onOpenQuote}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-navy-deep text-ivory hover:bg-navy-midnight shadow-2xs hover:shadow-xs transition-all duration-200 font-bold text-xs tracking-wide group cursor-pointer border border-navy-deep whitespace-nowrap"
              >
                <span>14-Day Trial</span>
                <span className="material-symbols-outlined ml-1.5 text-[16px] text-champagne group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu" 
              className="lg:hidden p-2 rounded-lg text-charcoal hover:bg-sand/60 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-ivory border-t border-stroke-subtle px-6 py-6 space-y-4 shadow-xl overflow-hidden"
            >
              <nav className="flex flex-col space-y-3 font-medium text-sm text-charcoal">
                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenMatch && onOpenMatch();
                  }} 
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 text-blue-900 font-extrabold flex items-center justify-between border border-blue-200 cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">travel_explore</span>
                    <span>Kết Nối Đại Lý</span>
                  </span>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">Chọn Đại Lý</span>
                </button>
                <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-sand hover:text-navy-deep">
                  CRM Features
                </a>
                <a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-sand hover:text-navy-deep">
                  How It Works
                </a>
                <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-sand text-navy-deep font-bold flex items-center justify-between">
                  <span>Pricing Plans</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-champagne text-navy-deep">From $39/mo</span>
                </Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-sand hover:text-navy-deep">
                  About InsurMatch CRM
                </Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-sand hover:text-navy-deep">
                  Contact Support
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 text-navy-deep font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-champagne">lock</span>
                  <span>Agent &amp; Staff Portal</span>
                </Link>
              </nav>

              <div className="pt-2 space-y-2.5">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuote();
                  }}
                  className="w-full py-3 rounded-xl bg-navy-deep text-ivory font-bold text-xs tracking-wide text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Start 14-Day Free Trial</span>
                  <span className="material-symbols-outlined text-[16px] text-champagne">arrow_forward</span>
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuote();
                  }}
                  className="w-full py-2.5 rounded-xl border border-navy-deep text-navy-deep font-semibold text-xs tracking-wide text-center block cursor-pointer"
                >
                  Book a Free Demo
                </button>
                <a 
                  href="mailto:support@insurmatch.us"
                  className="w-full py-2 rounded-lg border border-stroke-subtle text-charcoal/80 font-medium text-center block text-xs"
                >
                  Support: support@insurmatch.us
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
