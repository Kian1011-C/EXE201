import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import CarrierLogosStrip from '../components/CarrierLogos';
import { locations } from '../data/locationsData';

// ── The Converging Beam Animation Component (Section 6 Match Signature) ──
function ConvergingBeamGraphic() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, margin: '-40px' });

  // Desktop Bezier Curves (Converging horizontally into center y=88)
  const pathTopDesktop = "M 0 44 C 95 44, 115 88, 200 88";
  const pathBottomDesktop = "M 0 132 C 95 132, 115 88, 200 88";

  // Mobile Bezier Curves (Converging vertically into bottom center x=100, y=68)
  const pathLeftMobile = "M 50 0 C 50 35, 95 42, 100 68";
  const pathRightMobile = "M 150 0 C 150 35, 105 42, 100 68";

  return (
    <div 
      ref={containerRef} 
      className="py-10 sm:py-12 px-5 sm:px-10 border border-stroke-subtle rounded-2xl bg-sand/20 relative overflow-hidden"
    >
      {/* Ambient subtle warm champagne glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,169,107,0.1),transparent_70%)] pointer-events-none" />

      {/* ── DESKTOP & TABLET VIEW (md and up) ── */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center max-w-2xl mx-auto relative z-10">
        
        {/* Left Column: 01 YOU & 02 AGENTS */}
        <div className="md:col-span-4 flex flex-col justify-between gap-5 text-left">
          {/* 01 / CONSUMER */}
          <motion.div 
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-4 rounded-xl bg-ivory/95 border border-stroke-subtle shadow-xs space-y-1 hover:border-champagne/50 transition-colors"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
              <span>01 / CONSUMER</span>
            </div>
            <div className="text-xl font-black text-navy-deep tracking-tight">YOU</div>
            <div className="text-xs text-charcoal/70">State, language &amp; needs</div>
          </motion.div>

          {/* 02 / NETWORK */}
          <motion.div 
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 rounded-xl bg-ivory/95 border border-stroke-subtle shadow-xs space-y-1 hover:border-champagne/50 transition-colors"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
              <span>02 / NETWORK</span>
            </div>
            <div className="text-xl font-black text-navy-deep tracking-tight">AGENTS</div>
            <div className="text-xs text-charcoal/70">Verified state licenses</div>
          </motion.div>
        </div>

        {/* Center Column: Converging SVG Bezier Beams */}
        <div className="md:col-span-4 flex items-center justify-center relative px-2">
          <svg viewBox="0 0 200 176" className="w-full h-44 overflow-visible" fill="none">
            <defs>
              {/* Cinematic Golden Glow Filter */}
              <filter id="desktop-beam-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* High-intensity Gold Beam Gradient */}
              <linearGradient id="desktop-gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#DFCAA0" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* 1. Subtle Background Guide Tracks */}
            <path
              d={pathTopDesktop}
              stroke="#C8A96B"
              strokeOpacity="0.22"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d={pathBottomDesktop}
              stroke="#C8A96B"
              strokeOpacity="0.22"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* 2. Animated Drawing Paths (Path Drawing on Scroll) */}
            <motion.path
              d={pathTopDesktop}
              stroke="#C8A96B"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d={pathBottomDesktop}
              stroke="#C8A96B"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* 3. Traveling Energy Beam Streak (Moving Dash) */}
            <motion.path
              d={pathTopDesktop}
              stroke="url(#desktop-gold-gradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#desktop-beam-glow)"
              initial={{ strokeDasharray: "30 220", strokeDashoffset: 220, opacity: 0 }}
              animate={isInView ? {
                strokeDashoffset: [-30, -250],
                opacity: [0, 1, 1, 0]
              } : {}}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            <motion.path
              d={pathBottomDesktop}
              stroke="url(#desktop-gold-gradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#desktop-beam-glow)"
              initial={{ strokeDasharray: "30 220", strokeDashoffset: 220, opacity: 0 }}
              animate={isInView ? {
                strokeDashoffset: [-30, -250],
                opacity: [0, 1, 1, 0]
              } : {}}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />

            {/* 4. Energy Beam Pulse Photons (Moving dots along Bezier lines) */}
            {isInView && (
              <>
                {/* Top Photon */}
                <g>
                  <animateMotion
                    path={pathTopDesktop}
                    dur="2.4s"
                    repeatCount="indefinite"
                    keyPoints="0; 1"
                    keyTimes="0; 1"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1"
                  />
                  <circle r="7" fill="#C8A96B" opacity="0.65" filter="url(#desktop-beam-glow)" />
                  <circle r="3.5" fill="#FFFFFF" stroke="#C8A96B" strokeWidth="1.5" />
                </g>

                {/* Bottom Photon */}
                <g>
                  <animateMotion
                    path={pathBottomDesktop}
                    dur="2.4s"
                    repeatCount="indefinite"
                    keyPoints="0; 1"
                    keyTimes="0; 1"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1"
                  />
                  <circle r="7" fill="#C8A96B" opacity="0.65" filter="url(#desktop-beam-glow)" />
                  <circle r="3.5" fill="#FFFFFF" stroke="#C8A96B" strokeWidth="1.5" />
                </g>
              </>
            )}

            {/* 5. Convergence Focal Point & Impact Ripple */}
            <circle cx="200" cy="88" r="4.5" fill="#C8A96B" />
            <motion.circle
              cx="200"
              cy="88"
              r="4.5"
              stroke="#C8A96B"
              strokeWidth="1.5"
              fill="none"
              filter="url(#desktop-beam-glow)"
              animate={isInView ? {
                r: [4.5, 18],
                opacity: [1, 0]
              } : {}}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeOut",
                times: [0.75, 1]
              }}
            />
          </svg>
        </div>

        {/* Right Column: RESULT: MATCH with Subtle Glow Bloom */}
        <div className="md:col-span-4 flex items-center justify-center">
          <motion.div
            animate={isInView ? {
              boxShadow: [
                "0 4px 14px rgba(11, 23, 42, 0.12)",
                "0 0 36px rgba(200, 169, 107, 0.7), 0 0 70px rgba(200, 169, 107, 0.3)",
                "0 4px 14px rgba(11, 23, 42, 0.12)"
              ],
              borderColor: [
                "rgba(255, 255, 255, 0.1)",
                "rgba(200, 169, 107, 0.95)",
                "rgba(255, 255, 255, 0.1)"
              ],
              scale: [1, 1.038, 1]
            } : {}}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              times: [0, 0.78, 1],
              ease: "easeInOut"
            }}
            className="w-full p-5 sm:p-6 rounded-2xl bg-navy-deep text-ivory border border-white/10 text-center relative overflow-hidden group shadow-md"
          >
            {/* Ambient golden sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-champagne/15 via-transparent to-transparent pointer-events-none" />

            <div className="text-[10px] font-bold uppercase tracking-widest text-champagne flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
              <span>RESULT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-ivory tracking-widest mt-1">
              MATCH
            </div>
            <div className="text-[10px] text-ivory/70 tracking-wider mt-1 font-semibold uppercase">
              INSURMATCH 1-ON-1
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── MOBILE VIEW (< md) ── */}
      <div className="md:hidden flex flex-col items-center gap-2 max-w-sm mx-auto relative z-10">
        
        {/* Top: 2 Cards Side-by-Side */}
        <div className="grid grid-cols-2 gap-3 w-full text-left">
          <div className="p-3 rounded-xl bg-ivory/95 border border-stroke-subtle shadow-xs space-y-0.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-muted flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-champagne" />
              <span>01 / YOU</span>
            </div>
            <div className="text-base font-black text-navy-deep">YOU</div>
            <div className="text-[11px] text-charcoal/60 truncate">State &amp; needs</div>
          </div>

          <div className="p-3 rounded-xl bg-ivory/95 border border-stroke-subtle shadow-xs space-y-0.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-muted flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-champagne" />
              <span>02 / AGENTS</span>
            </div>
            <div className="text-base font-black text-navy-deep">AGENTS</div>
            <div className="text-[11px] text-charcoal/60 truncate">Verified licenses</div>
          </div>
        </div>

        {/* Center: Mobile Converging SVG Bezier Beams */}
        <div className="w-full flex items-center justify-center py-1">
          <svg viewBox="0 0 200 70" className="w-full h-16 overflow-visible" fill="none">
            <defs>
              <filter id="mobile-beam-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Guide tracks */}
            <path d={pathLeftMobile} stroke="#C8A96B" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="3 3" />
            <path d={pathRightMobile} stroke="#C8A96B" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="3 3" />

            {/* Animated drawing */}
            <motion.path
              d={pathLeftMobile}
              stroke="#C8A96B"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <motion.path
              d={pathRightMobile}
              stroke="#C8A96B"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Moving Photons */}
            {isInView && (
              <>
                <g>
                  <animateMotion path={pathLeftMobile} dur="2.4s" repeatCount="indefinite" />
                  <circle r="6" fill="#C8A96B" opacity="0.65" filter="url(#mobile-beam-glow)" />
                  <circle r="3" fill="#FFFFFF" stroke="#C8A96B" strokeWidth="1.5" />
                </g>
                <g>
                  <animateMotion path={pathRightMobile} dur="2.4s" repeatCount="indefinite" />
                  <circle r="6" fill="#C8A96B" opacity="0.65" filter="url(#mobile-beam-glow)" />
                  <circle r="3" fill="#FFFFFF" stroke="#C8A96B" strokeWidth="1.5" />
                </g>
              </>
            )}

            {/* Bottom convergence node */}
            <circle cx="100" cy="68" r="4" fill="#C8A96B" />
          </svg>
        </div>

        {/* Bottom: RESULT: MATCH */}
        <motion.div
          animate={isInView ? {
            boxShadow: [
              "0 4px 14px rgba(11, 23, 42, 0.12)",
              "0 0 30px rgba(200, 169, 107, 0.65), 0 0 54px rgba(200, 169, 107, 0.22)",
              "0 4px 14px rgba(11, 23, 42, 0.12)"
            ],
            borderColor: [
              "rgba(255, 255, 255, 0.1)",
              "rgba(200, 169, 107, 0.9)",
              "rgba(255, 255, 255, 0.1)"
            ],
            scale: [1, 1.03, 1]
          } : {}}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            times: [0, 0.78, 1],
            ease: "easeInOut"
          }}
          className="w-full p-4 rounded-xl bg-navy-deep text-ivory border border-white/10 text-center shadow-md relative"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-champagne flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
            <span>RESULT</span>
          </div>
          <div className="text-xl font-black text-ivory tracking-widest mt-0.5">
            MATCH
          </div>
          <div className="text-[9px] text-ivory/70 tracking-wider mt-0.5 uppercase font-medium">
            INSURMATCH 1-ON-1
          </div>
        </motion.div>

      </div>

      {/* Explanatory Caption */}
      <div className="mt-8 pt-6 border-t border-stroke-subtle text-xs text-charcoal/60 text-center relative z-10">
        An intelligent matching engine connecting consumers directly with independent licensed agents — no telemarketing blasts, no spam.
      </div>
    </div>
  );
}

export default function HomePage({ onOpenQuote }) {
  const [activeLocationId, setActiveLocationId] = useState('katy');
  const selectedLocation = locations.find((l) => l.id === activeLocationId) || locations[0];

  return (
    <div className="w-full bg-ivory text-charcoal selection:bg-champagne selection:text-navy-deep">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO — Asymmetric Editorial Split Layout (Section 6 & 7)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-stroke-subtle overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-7 text-left"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2.5 text-[11px] font-bold tracking-widest uppercase text-slate-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                <span>INSURMATCH / DIGITAL LEAD &amp; AGENT MATCHING PLATFORM</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-deep tracking-tight leading-[1.08]">
                Find the right <br />
                insurance agent <span className="font-serif italic font-normal text-navy-midnight">for your needs.</span>
              </h1>

              {/* Subhead */}
              <p className="text-base sm:text-lg text-charcoal/75 max-w-xl leading-relaxed">
                InsurMatch connects Vietnamese customers across the United States with verified independent insurance agents licensed in their state. Tell us what coverage you need, and we match you with an agent who understands your language, budget, and requirements.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuote}
                  className="px-7 py-3.5 rounded-lg bg-navy-deep text-ivory hover:bg-navy-midnight transition-colors duration-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Get Matched</span>
                  <span className="material-symbols-outlined text-[16px] text-champagne group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-lg border border-stroke-subtle bg-sand/30 hover:bg-sand text-charcoal font-semibold text-xs tracking-wider uppercase transition-colors duration-200"
                >
                  How It Works
                </a>
              </div>

              {/* Fine Signature Subline */}
              <div className="pt-6 border-t border-stroke-subtle flex items-center gap-6 text-xs text-charcoal/60">
                <span>State-Based Matching</span>
                <span className="text-champagne font-bold">•</span>
                <span>Verified Licensed Agents</span>
                <span className="text-champagne font-bold">•</span>
                <span>Bilingual: Tiếng Việt &amp; English</span>
              </div>
            </motion.div>

            {/* Right Large Cinematic Photograph (Section 7) */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-stroke-subtle bg-sand/30 p-2 shadow-xs">
                <div className="relative h-80 sm:h-[420px] rounded-xl overflow-hidden">
                  <img 
                    src="/images/advisor-counselor.jpg" 
                    alt="InsurMatch advisor in conversation with family" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent" />
                </div>

                {/* Single understated overlay (Prompt #7) */}
                <div className="absolute bottom-6 left-6 right-6 py-3 px-4 bg-navy-deep/90 backdrop-blur-md rounded-lg border border-white/10 text-ivory flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
                  <span className="text-ivory/80">YOUR REQUIREMENTS</span>
                  <span className="text-champagne font-serif text-sm">→</span>
                  <span className="text-champagne">LICENSED AGENT MATCH</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. BRAND STATEMENT & PHILOSOPHY — No Cards, Pure Typography (Section 8)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-b border-stroke-subtle bg-ivory">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="max-w-3xl mb-16 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-deep tracking-tight leading-tight">
              Insurance can be complicated. <br />
              <span className="font-serif italic font-normal text-navy-midnight">Finding the right licensed agent shouldn't be.</span>
            </h2>
          </div>

          {/* Three concepts with thin dividers and pure typography — NO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-stroke-subtle">
            
            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne block">
                01 — LANGUAGE &amp; TRUST
              </span>
              <h3 className="text-xl font-bold text-navy-deep tracking-tight">
                Guidance in your language.
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Connect with independent agents who speak Vietnamese and understand your specific situation, eliminating language barriers and confusion.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne block">
                02 — VERIFICATION
              </span>
              <h3 className="text-xl font-bold text-navy-deep tracking-tight">
                Properly licensed professionals.
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Every agent in our partner network is independently verified with state insurance departments (such as Texas TDI or California CDI) to ensure compliance.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne block">
                03 — RIGHT-FIT MATCH
              </span>
              <h3 className="text-xl font-bold text-navy-deep tracking-tight">
                Matched to your specific needs.
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                We route your request to agents who specialize in the exact category you need — Medicare, ACA Health, or Life protection. Free for customers, with zero spam.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CARRIER LOGOS
         ───────────────────────────────────────────────────────────── */}
      <section className="py-7 bg-sand/30 border-b border-stroke-subtle">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-center text-[10px] font-bold text-slate-muted uppercase tracking-widest mb-3">
            ACCESS TO TOP-RATED INSURANCE CARRIERS THROUGH INDEPENDENT LICENSED AGENTS
          </p>
          <CarrierLogosStrip />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS — Premium Editorial Timeline, No Cards (Section 13)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-b border-stroke-subtle" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="max-w-2xl mb-16 text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block mb-2">
              THE MATCHMAKING WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              A smarter way <br />
              <span className="font-serif italic font-normal text-navy-midnight">to connect with licensed agents.</span>
            </h2>
          </div>

          {/* Connected Steps Timeline */}
          <div className="relative">
            {/* Thin connecting line across steps on desktop */}
            <div className="hidden md:block absolute top-4 left-0 right-0 h-[1px] bg-stroke-subtle" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 md:pt-12">
              
              <div className="space-y-3 text-left relative">
                <div className="inline-block px-3 py-1 bg-ivory border border-stroke-subtle rounded-md font-serif text-xs font-bold text-champagne mb-2">
                  01
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                  TELL US WHAT YOU NEED
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Select your insurance category (Medicare, ACA Health, Life) and share your location, budget preferences, and language needs.
                </p>
              </div>

              <div className="space-y-3 text-left relative">
                <div className="inline-block px-3 py-1 bg-ivory border border-stroke-subtle rounded-md font-serif text-xs font-bold text-champagne mb-2">
                  02
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                  VERIFY &amp; MATCH
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Our platform validates your request details to intelligently pair you with qualified independent agents licensed in your specific state.
                </p>
              </div>

              <div className="space-y-3 text-left relative">
                <div className="inline-block px-3 py-1 bg-ivory border border-stroke-subtle rounded-md font-serif text-xs font-bold text-champagne mb-2">
                  03
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                  CONNECT &amp; DECIDE
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  A verified licensed agent reaches out with personalized plan options. Review at your own pace with zero obligation and zero pressure.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SERVICES — Differentiated Editorial Rhythms (Section 10, 11, 12)
         ───────────────────────────────────────────────────────────── */}
      <section id="services" className="border-b border-stroke-subtle">
        
        {/* Service 01: MEDICARE (Text Left, Large Image Right) */}
        <div className="py-24 lg:py-32 max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl text-champagne font-bold">01</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-muted">MEDICARE SPECIALISTS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                Connect with agents <br />
                <span className="font-serif italic font-normal text-navy-midnight">specializing in Medicare.</span>
              </h2>

              <p className="text-base text-charcoal/75 leading-relaxed">
                Medicare choices can feel overwhelming. InsurMatch connects seniors and eligible individuals with verified independent agents who evaluate Medicare Advantage (Part C), Medigap, and Part D drug plans tailored to your doctors and prescriptions.
              </p>

              <div className="pt-2">
                <Link
                  to="/insurance-services/medicare"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-deep hover:text-champagne transition-colors border-b-2 border-navy-deep hover:border-champagne pb-1"
                >
                  <span>Find A Medicare Agent</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-xl overflow-hidden border border-stroke-subtle bg-sand/30 p-2 shadow-xs">
                <img 
                  src="/images/service-medicare.jpg" 
                  alt="Senior client reviewing Medicare plans with advisor" 
                  className="w-full h-80 sm:h-[400px] object-cover rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Service 02: ACA (REVERSED: Image Left, Text Right) */}
        <div className="py-24 lg:py-32 bg-sand/30 border-y border-stroke-subtle">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-xl overflow-hidden border border-stroke-subtle bg-ivory p-2 shadow-xs">
                  <img 
                    src="/images/service-aca.jpg" 
                    alt="Individual and family healthcare coverage" 
                    className="w-full h-80 sm:h-[400px] object-cover rounded-lg"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl text-champagne font-bold">02</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-muted">ACA HEALTHCARE</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                  Marketplace health plans <br />
                  <span className="font-serif italic font-normal text-navy-midnight">with expert subsidy guidance.</span>
                </h2>

                <p className="text-base text-charcoal/75 leading-relaxed">
                  Find licensed independent agents who help determine your eligibility for federal advance premium tax credits (subsidies) under the ACA and guide you through individual and family health coverage that fits your family's budget.
                </p>

                <div className="pt-2">
                  <Link
                    to="/insurance-services/health-insurance"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-deep hover:text-champagne transition-colors border-b-2 border-navy-deep hover:border-champagne pb-1"
                  >
                    <span>Find An ACA Agent</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Service 03: LIFE & ASSET PROTECTION (Full-Width Deep Navy Climax Section) */}
        <div className="py-28 lg:py-36 bg-navy-deep text-ivory">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl text-champagne font-bold">03</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-champagne">LIFE &amp; ASSET PROTECTION</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ivory tracking-tight leading-tight">
                  Protect what matters <br />
                  <span className="font-serif italic font-normal text-champagne">with experienced guidance.</span>
                </h2>

                <p className="text-base text-ivory/75 leading-relaxed">
                  Match with verified independent agents experienced in personal and family financial protection — from term life with living benefits to permanent cash-value policies and fixed indexed annuities for retirement security.
                </p>

                <div className="pt-2">
                  <Link
                    to="/insurance-services/life-insurance"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ivory hover:text-champagne transition-colors border-b-2 border-champagne pb-1"
                  >
                    <span>Find A Life Insurance Agent</span>
                    <span className="material-symbols-outlined text-[16px] text-champagne">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-xl overflow-hidden border border-white/10 bg-navy-midnight p-2 shadow-2xl">
                  <img 
                    src="/images/service-life.jpg" 
                    alt="Multigenerational family protected by Life Insurance" 
                    className="w-full h-80 sm:h-[400px] object-cover rounded-lg opacity-90"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SIGNATURE "MATCH" SECTION (Section 14)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-28 lg:py-36 border-b border-stroke-subtle bg-ivory text-center overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-12">
          
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block">
              THE MATCH SIGNATURE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-deep tracking-tight">
              Your requirements. Verified agents. <br />
              <span className="font-serif italic font-normal text-navy-midnight">One trusted connection.</span>
            </h2>
          </div>

          {/* Converging Typography Graphic — The Converging Beam Animation (Section 14) */}
          <ConvergingBeamGraphic />

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. HUMAN GUIDANCE SECTION (Section 15)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-sand/30 border-b border-stroke-subtle" id="advisors">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block">
                INDEPENDENT LICENSED PROFESSIONALS
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                Technology matches. <br />
                <span className="font-serif italic font-normal text-navy-midnight">Licensed agents guide.</span>
              </h2>

              <p className="text-base text-charcoal/75 leading-relaxed">
                Insurance decisions require human understanding and cultural empathy. When you need clear explanations about coverage limits, doctor networks, or policy terms, our network of verified independent agents provides one-on-one personal guidance in your language.
              </p>

              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="px-7 py-3.5 rounded-lg bg-navy-deep text-ivory hover:bg-navy-midnight transition-colors duration-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Get Matched With An Agent</span>
                  <span className="material-symbols-outlined text-[16px] text-champagne group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-xl overflow-hidden border border-stroke-subtle bg-ivory p-2 shadow-xs">
                <img 
                  src="/images/team-retreat.jpg" 
                  alt="InsurMatch verified independent insurance advisor meeting with clients" 
                  className="w-full h-80 sm:h-[400px] object-cover rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. TEXAS LOCATIONS — Minimalist Map & Interactive Selector (Section 16)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-b border-stroke-subtle bg-ivory" id="locations">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block mb-2">
              REGIONAL AGENT NETWORK
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              Licensed agent partners. <br />
              <span className="font-serif italic font-normal text-navy-midnight">Active across Texas &amp; beyond.</span>
            </h2>
            <p className="text-sm text-charcoal/70 mt-2">
              Select a regional coverage hub on the Texas map or list below to view partner agent network presence, consultation hours, and licensing information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Minimalist Texas SVG Map with Location Points (Prompt #16) */}
            <div className="lg:col-span-6 p-6 sm:p-10 rounded-2xl border border-stroke-subtle bg-sand/20 flex flex-col items-center justify-center relative min-h-[380px]">
              
              <div className="w-full max-w-sm relative">
                {/* Clean stylized SVG Outline of Texas */}
                <svg viewBox="0 0 300 280" className="w-full h-auto text-sand fill-current stroke-stroke-subtle stroke-1">
                  {/* Simplified geometry of Texas outline */}
                  <path d="M 60 10 L 130 10 L 130 90 L 220 90 L 220 160 L 290 160 L 285 190 L 250 205 L 225 240 L 195 270 L 160 270 L 140 230 L 110 200 L 95 190 L 80 150 L 50 150 L 10 110 L 60 110 Z" />
                </svg>

                {/* Garland Point (North-East TX: ~x:62%, y:38%) */}
                <button
                  onClick={() => setActiveLocationId('garland')}
                  className={`absolute top-[38%] left-[62%] -translate-x-1/2 -translate-y-1/2 p-2 group cursor-pointer`}
                  title="Garland Hub (DFW Area)"
                >
                  <span className={`w-3.5 h-3.5 rounded-full block transition-all ${activeLocationId === 'garland' ? 'bg-navy-deep ring-4 ring-champagne scale-125' : 'bg-champagne hover:scale-110'}`} />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-navy-deep whitespace-nowrap bg-ivory/90 px-1.5 py-0.5 rounded border border-stroke-subtle shadow-xs">
                    Garland (DFW)
                  </span>
                </button>

                {/* Houston Point (South-East TX: ~x:75%, y:68%) */}
                <button
                  onClick={() => setActiveLocationId('houston')}
                  className={`absolute top-[68%] left-[75%] -translate-x-1/2 -translate-y-1/2 p-2 group cursor-pointer`}
                  title="Houston Hub"
                >
                  <span className={`w-3.5 h-3.5 rounded-full block transition-all ${activeLocationId === 'houston' ? 'bg-navy-deep ring-4 ring-champagne scale-125' : 'bg-champagne hover:scale-110'}`} />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-navy-deep whitespace-nowrap bg-ivory/90 px-1.5 py-0.5 rounded border border-stroke-subtle shadow-xs">
                    Houston
                  </span>
                </button>

                {/* Katy Point (HQ, West of Houston: ~x:65%, y:72%) */}
                <button
                  onClick={() => setActiveLocationId('katy')}
                  className={`absolute top-[72%] left-[64%] -translate-x-1/2 -translate-y-1/2 p-2 group cursor-pointer`}
                  title="Katy Regional Hub"
                >
                  <span className={`w-4 h-4 rounded-full block transition-all ${activeLocationId === 'katy' ? 'bg-navy-deep ring-4 ring-champagne scale-125' : 'bg-navy-deep hover:scale-110'}`} />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-navy-deep whitespace-nowrap bg-ivory/90 px-1.5 py-0.5 rounded border border-stroke-subtle shadow-xs">
                    Katy Hub
                  </span>
                </button>

              </div>

              <div className="text-[11px] text-slate-muted mt-4">
                Click map marker or hub below to inspect partner coverage
              </div>
            </div>

            {/* Selected Location Information Card */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Location tabs */}
              <div className="flex items-center gap-2 border-b border-stroke-subtle pb-3">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setActiveLocationId(loc.id)}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors cursor-pointer ${
                      loc.id === selectedLocation.id 
                        ? 'bg-navy-deep text-ivory' 
                        : 'text-charcoal/60 hover:text-navy-deep'
                    }`}
                  >
                    {loc.name.split(' ')[0]} {loc.isHQ ? '(Primary)' : ''}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-champagne">
                    {selectedLocation.isHQ ? 'Primary Regional Hub' : 'Partner Coverage Hub'}
                  </span>
                  <h3 className="text-2xl font-black text-navy-deep mt-0.5">{selectedLocation.name}</h3>
                  <p className="text-sm text-charcoal/75 mt-1">{selectedLocation.address}, {selectedLocation.city}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stroke-subtle text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-muted block mb-1">Support &amp; Inquiries</span>
                    <a href={`mailto:${selectedLocation.email}`} className="text-sm font-bold text-navy-deep hover:underline">
                      {selectedLocation.email}
                    </a>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-muted block mb-1">Consultation Hours</span>
                    <p className="text-charcoal/80">{selectedLocation.hours}</p>
                    <p className="text-champagne font-medium mt-0.5">{selectedLocation.specialHours}</p>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={selectedLocation.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-lg bg-navy-deep text-ivory text-xs font-bold tracking-wider uppercase hover:bg-navy-midnight transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Coverage Area</span>
                    <span className="material-symbols-outlined text-[15px] text-champagne">directions</span>
                  </a>
                  <button
                    onClick={onOpenQuote}
                    className="px-5 py-2.5 rounded-lg border border-stroke-subtle hover:border-navy-deep text-charcoal text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Get Matched
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FINAL DRAMATIC CLOSING CTA (Section 21)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-36 bg-navy-deep text-ivory relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-champagne">
            <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
            <span>INSURMATCH / GET STARTED TODAY</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ivory tracking-tight leading-[1.08]">
            Ready to find <br />
            <span className="font-serif italic font-normal text-champagne">your licensed agent?</span>
          </h2>

          <p className="text-base sm:text-lg text-ivory/70 max-w-xl mx-auto leading-relaxed">
            Tell us what you need. Our matchmaking engine pairs you with a verified independent agent licensed in your state who speaks your language and understands your priorities.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenQuote}
              className="px-8 py-4 rounded-lg bg-champagne text-navy-deep hover:bg-champagne-light transition-colors duration-200 font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md group"
            >
              <span>Get Matched</span>
              <span className="material-symbols-outlined text-[16px] text-navy-deep group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <Link
              to="/careers"
              className="px-7 py-4 rounded-lg border border-white/20 text-ivory hover:border-champagne hover:text-champagne transition-colors duration-200 font-semibold text-xs tracking-wider uppercase"
            >
              Join Agent Network
            </Link>
          </div>

          <div className="pt-8 text-xs text-ivory/50">
            Free for consumers • Zero spam guarantee • Direct independent licensed agent matching
          </div>

        </div>
      </section>

    </div>
  );
}
