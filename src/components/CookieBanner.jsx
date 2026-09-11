import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('thebestrateins_cookie_consent');
    if (!consent) {
      // Show floating popover after 1.5s delay so it doesn't jarringly pop on immediate page load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('thebestrateins_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('thebestrateins_cookie_consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-md z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/90 p-4 sm:p-5 text-gray-800"
          role="region"
          aria-label="Cookie Consent Banner"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <span>Cookie &amp; Privacy Choices</span>
            </div>
            <button
              onClick={handleDecline}
              aria-label="Close cookie banner"
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            This website uses cookies to enhance your browsing experience, provide tailored Texas insurance rate comparisons, and analyze site traffic in compliance with privacy regulations.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAccept}
              className="flex-1 py-2 px-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="py-2 px-3.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              Essential Only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
