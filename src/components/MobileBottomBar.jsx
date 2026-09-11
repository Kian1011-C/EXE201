import React from 'react';
import { motion } from 'motion/react';

export default function MobileBottomBar({ onOpenQuote }) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex items-center gap-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <a 
        href="tel:8336336868"
        className="flex-1 py-2.5 px-3 rounded-xl border border-primary/30 bg-primary/5 text-primary font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
      >
        <span className="w-2 h-2 rounded-full bg-success-emerald animate-ping shrink-0"></span>
        <span className="material-symbols-outlined text-[17px]">call</span>
        <span className="truncate">Gọi: (833) 633-6868</span>
      </a>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onOpenQuote}
        className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md btn-shimmer active:scale-95 transition-all text-center cursor-pointer"
      >
        <span className="material-symbols-outlined text-[17px]">bolt</span>
        <span className="truncate">Báo Giá Miễn Phí</span>
      </motion.button>
    </div>
  );
}
