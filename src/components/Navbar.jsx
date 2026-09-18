import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ onOpenQuote }) {
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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="tracking-widest uppercase text-[10px] text-champagne font-semibold">
              Digital Insurance Lead &amp; Matchmaking Platform
            </span>
            <span className="text-white/20">|</span>
            <span className="text-ivory/80 text-[11px]">Connecting Vietnamese Consumers With Licensed Agents</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a 
              href="mailto:support@insurmatch.us" 
              className="text-ivory/90 hover:text-champagne transition-colors flex items-center gap-1.5"
            >
              <span className="text-champagne">Support:</span>
              <span className="font-semibold tracking-wider">support@insurmatch.us</span>
            </a>
            <span className="text-white/20">|</span>
            <Link to="/login" className="text-ivory/80 hover:text-champagne transition-colors font-medium">
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
          <Link className="flex items-center gap-3 group" to="/">
            <img 
              alt="InsurMatch" 
              className="h-9 w-9 object-contain rounded-lg transition-transform duration-200 group-hover:scale-105" 
              src="/images/insurmatch-logo.png" 
            />
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-black tracking-tight text-navy-deep leading-none">
                INSUR<span className="text-slate-muted font-normal">MATCH</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-muted uppercase mt-0.5 font-medium">
                Digital Lead &amp; Agent Matching Platform
              </span>
            </div>
          </Link>

          {/* CENTER: Clean Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-[13px] font-medium tracking-wide text-charcoal/80">
            <Link 
              className={`hover:text-navy-deep transition-colors ${location.pathname.startsWith('/insurance-services') ? 'text-navy-deep font-semibold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/insurance-services"
            >
              Insurance Types
            </Link>
            <a 
              className="hover:text-navy-deep transition-colors" 
              href="#how-it-works"
            >
              How It Works
            </a>
            <Link 
              className={`hover:text-navy-deep transition-colors ${location.pathname === '/get-quote' ? 'text-navy-deep font-semibold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/get-quote"
            >
              Get Matched
            </Link>
            <Link 
              className={`hover:text-navy-deep transition-colors ${location.pathname === '/about' ? 'text-navy-deep font-semibold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/about"
            >
              About Us
            </Link>
            <Link 
              className={`hover:text-navy-deep transition-colors ${location.pathname === '/contact' ? 'text-navy-deep font-semibold border-b-2 border-navy-deep pb-1' : ''}`} 
              to="/contact"
            >
              Contact Support
            </Link>
          </nav>

          {/* RIGHT: Actions (Sign In, Primary CTA & Mobile Toggle) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-4 sm:space-x-5">
              <Link 
                to="/login"
                className="text-xs font-semibold text-charcoal/80 hover:text-navy-deep transition-colors"
              >
                Sign In
              </Link>

              <button 
                onClick={onOpenQuote}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-navy-deep text-ivory hover:bg-navy-midnight shadow-xs hover:shadow-sm transition-all duration-200 font-semibold text-xs tracking-wide group cursor-pointer border border-navy-deep"
              >
                <span>Get Matched</span>
                <span className="material-symbols-outlined ml-1.5 text-[16px] text-champagne group-hover:translate-x-1 transition-transform">
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
                <Link to="/insurance-services" className="py-2 border-b border-sand hover:text-navy-deep">
                  Insurance Types (Medicare, ACA, Life)
                </Link>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-sand hover:text-navy-deep">
                  How It Works
                </a>
                <Link to="/get-quote" className="py-2 border-b border-sand hover:text-navy-deep">
                  Get Matched
                </Link>
                <Link to="/about" className="py-2 border-b border-sand hover:text-navy-deep">
                  About InsurMatch
                </Link>
                <Link to="/contact" className="py-2 border-b border-sand hover:text-navy-deep">
                  Contact Support
                </Link>
                <Link to="/login" className="py-2 text-navy-deep font-semibold flex items-center gap-1.5">
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
                  className="w-full py-3 rounded-lg bg-navy-deep text-ivory font-semibold text-xs tracking-wide text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Matched</span>
                  <span className="material-symbols-outlined text-[16px] text-champagne">arrow_forward</span>
                </button>
                <a 
                  href="mailto:support@insurmatch.us"
                  className="w-full py-2.5 rounded-lg border border-stroke-subtle text-charcoal font-medium text-center block text-xs"
                >
                  Platform Support: support@insurmatch.us
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
