import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ onOpenQuote }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      {/* Top Utility Bar — Grounded Agency Information */}
      <div className="bg-trust-navy-deep text-white text-xs py-2 px-4 lg:px-8 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a 
              className="flex items-center space-x-1.5 text-cyan-ice hover:text-white transition-colors duration-200" 
              href="tel:8336336868"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span className="font-bold tracking-wider">(833) 633-6868</span>
            </a>
            <span className="text-white/60">|</span>
            <span className="text-white/80">Mon–Fri: 9:00 AM – 6:00 PM CT</span>
            <span className="text-white/60">|</span>
            <span className="text-cyan-ice/90 font-medium">Bilingual: English &amp; Tiếng Việt</span>
          </div>

          <div className="flex items-center space-x-5 text-white/80">
            <Link to="/locations" className="hover:text-cyan-ice transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              <span>Texas Offices: Katy • Houston • Garland</span>
            </Link>
            <span className="text-white/40">|</span>
            <Link to="/login" className="text-cyan-ice hover:text-white transition-colors font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-stroke-subtle shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center h-20">
          
          {/* Official Brand Logo & Agency Name */}
          <Link className="flex items-center gap-3 group" to="/">
            <img 
              alt="InsurMatch - The Best Rate Insurance" 
              className="h-11 w-11 object-contain rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-[1.02]" 
              src="/images/insurmatch-logo.png" 
            />
            <div className="flex flex-col">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-primary leading-none">
                Insur<span className="text-secondary">Match</span>
              </div>
              <span className="text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase mt-1">
                The Best Rate Insurance Agency
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm">
            <Link 
              className={`transition-all duration-200 ${location.pathname.startsWith('/insurance-services') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/insurance-services"
            >
              Insurance
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/about' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/about"
            >
              About Us
            </Link>
            <Link 
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" 
              to="/about#team"
            >
              Our Team
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/locations' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/locations"
            >
              Texas Offices
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/careers' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/careers"
            >
              Careers
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/contact' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/contact"
            >
              Contact
            </Link>
          </nav>

          {/* Trailing Action Cluster */}
          <div className="hidden sm:flex items-center space-x-3">
            <a 
              className="hidden xl:inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-semibold text-sm mr-2 transition-colors"
              href="tel:8336336868"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">call</span>
              <span>(833) 633-6868</span>
            </a>

            <button 
              onClick={onOpenQuote}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container shadow-xs hover:shadow-sm transition-all duration-200 font-bold text-sm group cursor-pointer"
            >
              <span>Get A Quote</span>
              <span className="material-symbols-outlined ml-1.5 text-[18px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu" 
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

        </div>

        {/* Animated Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-white border-t border-stroke-subtle px-4 py-6 space-y-4 shadow-xl overflow-hidden"
            >
              <nav className="flex flex-col space-y-3 font-semibold text-sm">
                <Link to="/insurance-services" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Insurance Options (Medicare, ACA, Life)
                </Link>
                <Link to="/about" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  About Us
                </Link>
                <Link to="/about#team" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Meet Our Team
                </Link>
                <Link to="/locations" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Texas Offices (Katy, Houston, Garland)
                </Link>
                <Link to="/careers" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Careers &amp; Agent Mentorship
                </Link>
                <Link to="/contact" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Contact Us
                </Link>
                <Link to="/login" className="py-2 text-primary hover:underline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Staff / Agent Portal</span>
                </Link>
              </nav>

              <div className="pt-2 space-y-2">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuote();
                  }}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-center flex items-center justify-center gap-2 hover:bg-primary-container transition-colors cursor-pointer"
                >
                  <span>Request A Free Quote</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <a 
                  href="tel:8336336868"
                  className="w-full py-2.5 rounded-xl border border-primary text-primary font-bold text-center block text-sm hover:bg-surface-container-low transition-colors"
                >
                  Call Toll-Free: (833) 633-6868
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
