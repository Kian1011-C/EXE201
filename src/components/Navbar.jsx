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
      {/* Top Utility Bar */}
      <div className="bg-primary text-on-primary text-xs py-2 px-4 lg:px-8 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a 
              className="flex items-center space-x-1.5 text-cyan-ice hover:text-white transition-colors duration-200" 
              href="tel:8336336868"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span className="font-bold tracking-wider">(833) 633-6868</span>
            </a>
            <a 
              className="flex items-center space-x-1.5 text-white/90 hover:text-white transition-colors duration-200" 
              href="mailto:info@thebestrateins.com"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Email Us</span>
            </a>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-ice/20 text-cyan-ice text-[11px] font-semibold tracking-wide border border-cyan-ice/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse"></span>
              24/7 Phone Assistance
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-white/70">Connect with us:</span>
            <a 
              aria-label="Facebook" 
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition-colors" 
              href="https://www.facebook.com/thebestrateinsurance"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[14px]">public</span>
            </a>
            <a 
              aria-label="Yelp" 
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition-colors" 
              href="https://www.yelp.com/biz/the-best-rate-insurance-houston-4"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[14px]">star</span>
            </a>
            <a 
              aria-label="Instagram" 
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition-colors" 
              href="https://www.instagram.com/healthinsurancetips/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </a>
            <a 
              aria-label="LinkedIn" 
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition-colors" 
              href="https://www.linkedin.com/company/the-best-rate-insurance/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[14px]">work</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-stroke-subtle shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center h-20">
          
          {/* Official Brand Logo */}
          <Link className="flex items-center gap-3 group" to="/">
            <img 
              alt="The Best Rate Insurance Logo" 
              className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105" 
              src="/images/logo.png" 
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm">
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/about' ? 'text-primary font-bold border-b-2 border-primary pb-1.5' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/about"
            >
              About
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname.startsWith('/insurance-services') ? 'text-primary font-bold border-b-2 border-primary pb-1.5' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/insurance-services"
            >
              Insurance
            </Link>
            <Link 
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" 
              to="/insurance-services"
            >
              Partners
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/careers' ? 'text-primary font-bold border-b-2 border-primary pb-1.5' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/careers"
            >
              Careers
            </Link>
            <Link 
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" 
              to="/contact"
            >
              Resources
            </Link>
            <Link 
              className={`transition-all duration-200 ${location.pathname === '/contact' ? 'text-primary font-bold border-b-2 border-primary pb-1.5' : 'text-on-surface-variant font-medium hover:text-primary'}`} 
              to="/contact"
            >
              Contact
            </Link>
          </nav>

          {/* Trailing Action Cluster */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link 
              className="hidden md:inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-surface-container-low transition-all duration-150 font-bold text-sm hover:-translate-y-0.5" 
              to="/contact"
            >
              Contact Us
            </Link>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenQuote}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-xs hover:shadow-md transition-all duration-200 font-bold text-sm group cursor-pointer btn-shimmer"
            >
              <span>Get A Quote</span>
              <span className="material-symbols-outlined ml-1.5 text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </motion.button>
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
                <Link to="/about" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  About Us
                </Link>
                <Link to="/insurance-services" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Insurance Products (Medicare, ACA, Life)
                </Link>
                <Link to="/careers" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Careers &amp; Bootcamp
                </Link>
                <Link to="/locations" className="py-2 border-b border-gray-100 text-on-surface hover:text-primary">
                  Office Locations (Katy, Houston, Garland)
                </Link>
                <Link to="/contact" className="py-2 text-on-surface hover:text-primary">
                  Contact Us
                </Link>
              </nav>

              <div className="pt-2 space-y-2">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuote();
                  }}
                  className="w-full py-3 rounded-lg bg-primary text-on-primary font-bold text-center flex items-center justify-center gap-2 btn-shimmer"
                >
                  <span>Get Free Quote Now</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <a 
                  href="tel:8336336868"
                  className="w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-center block text-sm"
                >
                  Call: (833) 633-6868
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
