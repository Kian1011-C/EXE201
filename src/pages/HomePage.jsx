import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import CarrierLogosStrip from '../components/CarrierLogos';
import { locations } from '../data/locationsData';

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
                <span>INSURMATCH / INSURANCE, MATCHED TO YOU</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-deep tracking-tight leading-[1.08]">
                Find coverage <br />
                that <span className="font-serif italic font-normal text-navy-midnight">fits your life.</span>
              </h1>

              {/* Subhead */}
              <p className="text-base sm:text-lg text-charcoal/75 max-w-xl leading-relaxed">
                Compare your options, understand your coverage, and find a plan that makes sense for you. Independent guidance with zero broker fees.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuote}
                  className="px-7 py-3.5 rounded-lg bg-navy-deep text-ivory hover:bg-navy-midnight transition-colors duration-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Start Matching</span>
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
                <span>3 Physical Texas Hubs</span>
                <span className="text-champagne font-bold">•</span>
                <span>30+ Top Carriers</span>
                <span className="text-champagne font-bold">•</span>
                <span>Bilingual: English &amp; Tiếng Việt</span>
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
                  <span className="text-ivory/80">YOUR NEEDS</span>
                  <span className="text-champagne font-serif text-sm">→</span>
                  <span className="text-champagne">YOUR MATCH</span>
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
              Insurance is personal. <br />
              <span className="font-serif italic font-normal text-navy-midnight">Your coverage should be too.</span>
            </h2>
          </div>

          {/* Three concepts with thin dividers and pure typography — NO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-stroke-subtle">
            
            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne block">
                01 — UNDERSTAND
              </span>
              <h3 className="text-xl font-bold text-navy-deep tracking-tight">
                Know what you're choosing.
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                We break down deductibles, network restrictions, and drug formulary tiers into clear, plain language so there are no surprises when you need care.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne block">
                02 — COMPARE
              </span>
              <h3 className="text-xl font-bold text-navy-deep tracking-tight">
                See your options clearly.
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                As an independent platform, we evaluate 30+ A-rated national and regional insurers to present objective rate comparisons matched to your doctor networks.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne block">
                03 — MATCH
              </span>
              <h3 className="text-xl font-bold text-navy-deep tracking-tight">
                Find coverage aligned with your needs.
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Whether transitioning into Medicare, optimizing marketplace health credits, or securing life protection, we pair you with the exact right policy.
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
            COMPARING 30+ TOP-RATED INSURANCE CARRIERS ACROSS TEXAS &amp; NATIONWIDE
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
              THE INSURMATCH PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              A simpler way <br />
              <span className="font-serif italic font-normal text-navy-midnight">to find coverage.</span>
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
                  TELL US ABOUT YOU
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Answer a few straightforward questions about your household size, zip code, and doctors.
                </p>
              </div>

              <div className="space-y-3 text-left relative">
                <div className="inline-block px-3 py-1 bg-ivory border border-stroke-subtle rounded-md font-serif text-xs font-bold text-champagne mb-2">
                  02
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                  EXPLORE YOUR OPTIONS
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Review side-by-side plan comparisons with verified doctor networks, copays, and subsidies.
                </p>
              </div>

              <div className="space-y-3 text-left relative">
                <div className="inline-block px-3 py-1 bg-ivory border border-stroke-subtle rounded-md font-serif text-xs font-bold text-champagne mb-2">
                  03
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                  CHOOSE YOUR MATCH
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Enroll with confidence, supported by licensed advisors who help with renewals and claims.
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
                <span className="text-xs font-bold uppercase tracking-widest text-slate-muted">MEDICARE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                Navigate Medicare <br />
                <span className="font-serif italic font-normal text-navy-midnight">with more clarity.</span>
              </h2>

              <p className="text-base text-charcoal/75 leading-relaxed">
                Explore Medicare options and understand the coverage available for your needs. We verify your doctors, hospital networks, and medications across Medicare Advantage (Part C), Medigap, and Part D drug plans.
              </p>

              <div className="pt-2">
                <Link
                  to="/insurance-services/medicare"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-deep hover:text-champagne transition-colors border-b-2 border-navy-deep hover:border-champagne pb-1"
                >
                  <span>Explore Medicare</span>
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
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-muted">ACA</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                  Coverage for <br />
                  <span className="font-serif italic font-normal text-navy-midnight">where life takes you.</span>
                </h2>

                <p className="text-base text-charcoal/75 leading-relaxed">
                  Explore individual and family coverage options and understand what may fit your situation. We calculate federal advance premium tax credits (subsidies) to significantly reduce monthly premiums.
                </p>

                <div className="pt-2">
                  <Link
                    to="/insurance-services/health-insurance"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-deep hover:text-champagne transition-colors border-b-2 border-navy-deep hover:border-champagne pb-1"
                  >
                    <span>Explore ACA</span>
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
                  <span className="font-serif italic font-normal text-champagne">beyond today.</span>
                </h2>

                <p className="text-base text-ivory/75 leading-relaxed">
                  Explore protection options designed around long-term priorities. From term life with living benefits to permanent cash-value policies and fixed indexed annuities for guarded retirement accumulation.
                </p>

                <div className="pt-2">
                  <Link
                    to="/insurance-services/life-insurance"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ivory hover:text-champagne transition-colors border-b-2 border-champagne pb-1"
                  >
                    <span>Explore Life &amp; Annuities</span>
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
              Your needs. Your options. <br />
              <span className="font-serif italic font-normal text-navy-midnight">One clearer match.</span>
            </h2>
          </div>

          {/* Converging Typography Graphic (Section 14) */}
          <div className="py-12 px-6 sm:px-12 border border-stroke-subtle rounded-2xl bg-sand/20 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-2xl mx-auto">
              
              {/* Converging branch 1 */}
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-muted">01 / INPUT</div>
                <div className="text-2xl font-black text-navy-deep tracking-tight">YOU</div>
                <div className="text-xs text-charcoal/60">Stage of life &amp; budget</div>
              </div>

              {/* Converging SVG lines */}
              <div className="hidden md:flex flex-col items-center justify-center w-36 relative">
                <svg viewBox="0 0 140 60" className="w-full h-12 text-champagne stroke-current fill-none">
                  <path d="M 0 10 C 60 10, 80 30, 140 30" strokeWidth="1.5" />
                  <path d="M 0 50 C 60 50, 80 30, 140 30" strokeWidth="1.5" />
                  <circle cx="140" cy="30" r="3" className="fill-champagne" />
                </svg>
              </div>

              {/* Converging branch 2 */}
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-muted">02 / NEED</div>
                <div className="text-2xl font-black text-navy-deep tracking-tight">OPTIONS</div>
                <div className="text-xs text-charcoal/60">30+ verified carriers</div>
              </div>

              {/* Converging Destination */}
              <div className="p-4 px-6 rounded-xl bg-navy-deep text-ivory shadow-sm text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-champagne">RESULT</div>
                <div className="text-2xl font-black text-ivory tracking-widest mt-0.5">MATCH</div>
                <div className="text-[10px] text-ivory/60 mt-0.5">INSURMATCH</div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-stroke-subtle text-xs text-charcoal/60 text-center">
              A refined algorithm backed by human Texas advisors to eliminate coverage gaps.
            </div>
          </div>

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
                HUMAN GUIDANCE
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                Technology can compare. <br />
                <span className="font-serif italic font-normal text-navy-midnight">People can explain.</span>
              </h2>

              <p className="text-base text-charcoal/75 leading-relaxed">
                Insurance can be complicated. When you need help understanding plan nuances, prescription tiers, or claim procedures, our team of licensed advisors is right here.
              </p>

              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="px-7 py-3.5 rounded-lg bg-navy-deep text-ivory hover:bg-navy-midnight transition-colors duration-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Talk to an Advisor</span>
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
                  alt="InsurMatch team of dedicated Texas advisors" 
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
              TEXAS ROOTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              Real people. <br />
              <span className="font-serif italic font-normal text-navy-midnight">Right here in Texas.</span>
            </h2>
            <p className="text-sm text-charcoal/70 mt-2">
              Select a location point on the Texas map or list below to view office addresses, hours, and direct advisor lines.
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
                  title="Garland Office (DFW Area)"
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
                  title="Houston Office"
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
                  title="Katy Headquarters"
                >
                  <span className={`w-4 h-4 rounded-full block transition-all ${activeLocationId === 'katy' ? 'bg-navy-deep ring-4 ring-champagne scale-125' : 'bg-navy-deep hover:scale-110'}`} />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-navy-deep whitespace-nowrap bg-ivory/90 px-1.5 py-0.5 rounded border border-stroke-subtle shadow-xs">
                    Katy (HQ)
                  </span>
                </button>

              </div>

              <div className="text-[11px] text-slate-muted mt-4">
                Click map marker or location below to inspect office
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
                    {loc.name.split(' ')[0]} {loc.isHQ ? '(HQ)' : ''}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-champagne">
                    {selectedLocation.isHQ ? 'Texas Headquarters' : 'Branch Office'}
                  </span>
                  <h3 className="text-2xl font-black text-navy-deep mt-0.5">{selectedLocation.name}</h3>
                  <p className="text-sm text-charcoal/75 mt-1">{selectedLocation.address}, {selectedLocation.city}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stroke-subtle text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-muted block mb-1">Direct Phone</span>
                    <a href={`tel:${selectedLocation.phoneRaw}`} className="text-sm font-bold text-navy-deep hover:underline">
                      {selectedLocation.phone}
                    </a>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-muted block mb-1">Business Hours</span>
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
                    <span>Google Maps</span>
                    <span className="material-symbols-outlined text-[15px] text-champagne">directions</span>
                  </a>
                  <button
                    onClick={onOpenQuote}
                    className="px-5 py-2.5 rounded-lg border border-stroke-subtle hover:border-navy-deep text-charcoal text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Request Consultation
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
            <span>INSURMATCH / YOUR NEXT STEP</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ivory tracking-tight leading-[1.08]">
            Ready to find <br />
            <span className="font-serif italic font-normal text-champagne">your match?</span>
          </h2>

          <p className="text-base sm:text-lg text-ivory/70 max-w-xl mx-auto leading-relaxed">
            Tell us what matters to you. We'll help you understand your options and connect with coverage tailored to your life.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenQuote}
              className="px-8 py-4 rounded-lg bg-champagne text-navy-deep hover:bg-champagne-light transition-colors duration-200 font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-md group"
            >
              <span>Start Matching</span>
              <span className="material-symbols-outlined text-[16px] text-navy-deep group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <Link
              to="/contact"
              className="px-7 py-4 rounded-lg border border-white/20 text-ivory hover:border-champagne hover:text-champagne transition-colors duration-200 font-semibold text-xs tracking-wider uppercase"
            >
              Talk to an Advisor
            </Link>
          </div>

          <div className="pt-8 text-xs text-ivory/50">
            No broker fees • Zero spam guarantee • Direct independent Texas guidance
          </div>

        </div>
      </section>

    </div>
  );
}
