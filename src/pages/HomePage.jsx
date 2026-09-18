import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import CarrierLogosStrip from '../components/CarrierLogos';
import { leadership } from '../data/teamData';
import { locations } from '../data/locationsData';

export default function HomePage({ onOpenQuote }) {
  const [activeLocation, setActiveLocation] = useState(locations[0]?.id || 'katy');

  const selectedLoc = locations.find((l) => l.id === activeLocation) || locations[0];

  return (
    <div className="w-full bg-ivory text-charcoal selection:bg-champagne selection:text-navy-deep">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO — Editorial Split Layout (Section 10 & 11)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-stroke-subtle overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Small Eyebrow */}
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-slate-muted">
                <span className="w-2 h-2 rounded-full bg-champagne" />
                <span>INSURMATCH / INSURANCE, MATCHED TO YOU</span>
              </div>

              {/* Editorial Headline with Serif Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-deep tracking-tight leading-[1.1]">
                Find coverage that <br />
                <span className="font-serif italic font-normal text-navy-midnight">fits your life.</span>
              </h1>

              {/* Grounded Human Copy */}
              <p className="text-base sm:text-lg text-charcoal/75 max-w-xl leading-relaxed">
                Compare your options, understand your coverage, and find an insurance plan that makes sense for you — guided by licensed independent advisors with zero broker fees.
              </p>

              {/* Actions */}
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
                  className="px-6 py-3.5 rounded-lg border border-stroke-subtle bg-sand/40 hover:bg-sand text-charcoal font-semibold text-xs tracking-wider uppercase transition-colors duration-200"
                >
                  How It Works
                </a>
              </div>

              {/* Factual Credibility Subline */}
              <div className="pt-6 border-t border-stroke-subtle/80 flex flex-wrap items-center gap-6 text-xs text-charcoal/65">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  <span>3 Physical Texas Hubs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  <span>30+ Independent Carriers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                  <span>Bilingual: English &amp; Tiếng Việt</span>
                </div>
              </div>
            </motion.div>

            {/* Right Cinematic Photography + Match Signature Visual (Section 11) */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-stroke-subtle bg-sand/30 p-2 shadow-xs">
                <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden">
                  <img 
                    src="/images/advisor-counselor.jpg" 
                    alt="InsurMatch advisor consulting with a client" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent" />
                </div>

                {/* Single Subtle Match Signature Overlay (Prompt #11) */}
                <div className="absolute bottom-6 left-6 right-6 p-3.5 bg-navy-deep/90 backdrop-blur-md rounded-xl border border-white/10 text-ivory">
                  <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase">
                    <span className="text-ivory/80">YOU</span>
                    <span className="text-champagne">→</span>
                    <span className="text-ivory/80">YOUR NEEDS</span>
                    <span className="text-champagne">→</span>
                    <span className="text-champagne font-bold">YOUR MATCH</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. PHILOSOPHY — Remove Generic Stats (Section 12)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b border-stroke-subtle">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="max-w-3xl mb-16 text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block mb-2">
              OUR PHILOSOPHY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-deep tracking-tight leading-tight">
              Insurance is personal. <br />
              <span className="font-serif italic font-normal text-navy-midnight">Your coverage should be too.</span>
            </h2>
          </div>

          {/* Three Concepts with Editorial Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-stroke-subtle">
            
            <div className="pt-6 md:pt-0 md:pr-8 space-y-3 text-left">
              <div className="text-2xl font-black text-champagne font-serif">01</div>
              <h3 className="text-lg font-bold tracking-tight text-navy-deep uppercase text-xs tracking-widest">
                UNDERSTAND
              </h3>
              <p className="text-sm text-charcoal/75 leading-relaxed">
                Know what you're choosing. We break down network restrictions, deductibles, and out-of-pocket maximums without the insurance industry jargon.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-8 space-y-3 text-left">
              <div className="text-2xl font-black text-champagne font-serif">02</div>
              <h3 className="text-lg font-bold tracking-tight text-navy-deep uppercase text-xs tracking-widest">
                COMPARE
              </h3>
              <p className="text-sm text-charcoal/75 leading-relaxed">
                See your options clearly. As an independent platform, we evaluate 30+ A-rated carriers to present plans truly aligned with your budget and medical requirements.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-8 space-y-3 text-left">
              <div className="text-2xl font-black text-champagne font-serif">03</div>
              <h3 className="text-lg font-bold tracking-tight text-navy-deep uppercase text-xs tracking-widest">
                MATCH
              </h3>
              <p className="text-sm text-charcoal/75 leading-relaxed">
                Find coverage aligned with your exact life stage — whether transitioning to Medicare, self-employed, or protecting multigenerational family assets.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CARRIER LOGOS STRIP
         ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-sand/40 border-b border-stroke-subtle">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-center text-[10px] font-bold text-slate-muted uppercase tracking-widest mb-4">
            REPRESENTING 30+ TOP-RATED CARRIERS ACROSS TEXAS &amp; NATIONWIDE
          </p>
          <CarrierLogosStrip />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS — Horizontal Editorial Timeline (Section 13)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b border-stroke-subtle" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="max-w-2xl mb-16 text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block mb-2">
              THE INSURMATCH PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              A simpler way to find coverage.
            </h2>
            <p className="text-sm text-charcoal/70 mt-2">
              Three straightforward steps from initial discovery to confident enrollment.
            </p>
          </div>

          {/* Timeline Sequence with Connecting Line */}
          <div className="relative">
            {/* Connecting thin line */}
            <div className="hidden md:block absolute top-7 left-12 right-12 h-[1px] bg-stroke-subtle z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
              
              {/* Step 01 */}
              <div className="bg-ivory p-6 rounded-xl border border-stroke-subtle shadow-xs space-y-4 text-left">
                <div className="w-12 h-12 rounded-lg bg-navy-deep text-ivory flex items-center justify-center font-serif text-lg font-bold">
                  01
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                    TELL US ABOUT YOU
                  </h3>
                  <p className="text-sm text-charcoal/75 mt-2 leading-relaxed">
                    Answer a few simple questions regarding your location, household needs, and coverage goals.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="bg-ivory p-6 rounded-xl border border-stroke-subtle shadow-xs space-y-4 text-left">
                <div className="w-12 h-12 rounded-lg bg-sand text-navy-deep flex items-center justify-center font-serif text-lg font-bold border border-stroke-subtle">
                  02
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                    EXPLORE YOUR OPTIONS
                  </h3>
                  <p className="text-sm text-charcoal/75 mt-2 leading-relaxed">
                    Review and compare available policies with verified doctor networks, prescription tiers, and subsidies.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="bg-ivory p-6 rounded-xl border border-stroke-subtle shadow-xs space-y-4 text-left">
                <div className="w-12 h-12 rounded-lg bg-champagne text-navy-deep flex items-center justify-center font-serif text-lg font-bold">
                  03
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-navy-deep">
                    CHOOSE YOUR MATCH
                  </h3>
                  <p className="text-sm text-charcoal/75 mt-2 leading-relaxed">
                    Move forward with confidence, backed by dedicated local Texas advisors to assist with questions and claims.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SERVICES — Three Distinct Editorial Sections (Section 14–17)
         ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-stroke-subtle" id="services">
        
        {/* Service 01: MEDICARE (Text Left, Large Image Right) */}
        <div className="py-20 lg:py-28 max-w-7xl mx-auto px-4 lg:px-8">
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
                Explore Medicare options and understand the coverage available for your needs. We examine Medicare Advantage (Part C), Part D prescription drug formularies, and Medigap supplement plans so you keep your preferred doctors and medications covered.
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
              <div className="rounded-2xl overflow-hidden border border-stroke-subtle bg-sand/30 p-2 shadow-xs">
                <img 
                  src="/images/service-medicare.jpg" 
                  alt="Senior client reviewing Medicare plans with advisor" 
                  className="w-full h-80 sm:h-96 object-cover rounded-xl"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Service 02: ACA (REVERSED: Image Left, Text Right) */}
        <div className="py-20 lg:py-28 bg-sand/30 border-y border-stroke-subtle">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Image Left */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-stroke-subtle bg-ivory p-2 shadow-xs">
                  <img 
                    src="/images/service-aca.jpg" 
                    alt="Individual and family healthcare coverage" 
                    className="w-full h-80 sm:h-96 object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Text Right */}
              <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl text-champagne font-bold">02</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-muted">ACA / HEALTH</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                  Health coverage <br />
                  <span className="font-serif italic font-normal text-navy-midnight">for where life takes you.</span>
                </h2>

                <p className="text-base text-charcoal/75 leading-relaxed">
                  Explore individual and family coverage options and understand what may fit your situation. We help you calculate advance premium tax credits (subsidies) to significantly reduce your monthly healthcare costs.
                </p>

                <div className="pt-2">
                  <Link
                    to="/insurance-services/health-insurance"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-deep hover:text-champagne transition-colors border-b-2 border-navy-deep hover:border-champagne pb-1"
                  >
                    <span>Explore ACA Plans</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Service 03: LIFE & ASSET PROTECTION (Full-Width Deep Navy Section) */}
        <div className="py-24 lg:py-32 bg-navy-deep text-ivory">
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
                  Explore protection options designed around long-term priorities. From term life with living benefits to permanent cash-value policies and fixed indexed annuities, we help build financial stability for generations to come.
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
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-navy-midnight p-2 shadow-2xl">
                  <img 
                    src="/images/service-life.jpg" 
                    alt="Multigenerational family protected by Life Insurance" 
                    className="w-full h-80 sm:h-96 object-cover rounded-xl opacity-90"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SIGNATURE "MATCH" SECTION (Section 18)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 border-b border-stroke-subtle overflow-hidden bg-ivory">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block">
              THE MATCH SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-deep tracking-tight">
              Your needs. Your options. <br />
              <span className="font-serif italic font-normal text-navy-midnight">One clearer match.</span>
            </h2>
          </div>

          {/* Converging Visual Concept Diagram */}
          <div className="p-8 sm:p-12 rounded-2xl border border-stroke-subtle bg-sand/30 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              <div className="p-5 rounded-xl bg-ivory border border-stroke-subtle text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-muted">INPUT 01</span>
                <div className="text-base font-black text-navy-deep mt-1">YOU</div>
                <p className="text-xs text-charcoal/60 mt-1">Age, location &amp; household</p>
              </div>

              <div className="p-5 rounded-xl bg-ivory border border-stroke-subtle text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-muted">INPUT 02</span>
                <div className="text-base font-black text-navy-deep mt-1">YOUR NEEDS</div>
                <p className="text-xs text-charcoal/60 mt-1">Doctors, budget &amp; prescriptions</p>
              </div>

              <div className="p-5 rounded-xl bg-ivory border border-stroke-subtle text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-muted">ENGINE</span>
                <div className="text-base font-black text-navy-deep mt-1">YOUR OPTIONS</div>
                <p className="text-xs text-charcoal/60 mt-1">30+ top carrier comparison</p>
              </div>

              <div className="p-5 rounded-xl bg-navy-deep text-ivory border border-navy-deep text-left shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-champagne">RESULT</span>
                <div className="text-base font-black text-ivory mt-1 flex items-center gap-1.5">
                  <span>MATCH</span>
                  <span className="w-2 h-2 rounded-full bg-champagne" />
                </div>
                <p className="text-xs text-ivory/70 mt-1">INSURMATCH Recommended</p>
              </div>

            </div>

            {/* Connecting Convergence Indicator */}
            <div className="mt-8 pt-6 border-t border-stroke-subtle flex items-center justify-center gap-3 text-xs font-semibold text-charcoal/70">
              <span className="w-12 h-[1px] bg-champagne" />
              <span>Independent underwriting alignment across Texas and multi-state networks</span>
              <span className="w-12 h-[1px] bg-champagne" />
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. HUMAN GUIDANCE SECTION (Section 19)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-sand/30 border-b border-stroke-subtle" id="advisors">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block">
                HUMAN GUIDANCE
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight leading-tight">
                Technology can compare. <br />
                <span className="font-serif italic font-normal text-navy-midnight">People can explain.</span>
              </h2>

              <p className="text-base text-charcoal/75 leading-relaxed">
                Insurance can be complicated. When you need help understanding plan nuances, prescription tiers, or claim procedures, our team of licensed advisors is right here. Real conversations with real people who listen.
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

            {/* Right Leadership Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {leadership.slice(0, 4).map((m) => (
                <div key={m.name} className="p-4 bg-ivory rounded-xl border border-stroke-subtle space-y-3">
                  <div className="h-36 rounded-lg overflow-hidden bg-sand">
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-navy-deep">{m.name}</h4>
                    <p className="text-[11px] text-slate-muted mt-0.5">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. TEXAS / LOCATIONS SECTION (Section 20)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b border-stroke-subtle" id="locations">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-muted block mb-2">
              PHYSICAL PRESENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
              Real people. <br />
              <span className="font-serif italic font-normal text-navy-midnight">Right here in Texas.</span>
            </h2>
            <p className="text-sm text-charcoal/70 mt-2">
              Walk-in offices and direct local telephone support in Katy, Houston, and Garland.
            </p>
          </div>

          {/* Interactive Editorial Location Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Location Tabs / List */}
            <div className="lg:col-span-4 space-y-3">
              {locations.map((loc) => {
                const isSelected = loc.id === selectedLoc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setActiveLocation(loc.id)}
                    className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-navy-deep text-ivory border-navy-deep shadow-sm' 
                        : 'bg-ivory hover:bg-sand/60 border-stroke-subtle text-charcoal'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm tracking-tight">{loc.name}</h4>
                      {loc.isHQ && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected ? 'bg-champagne text-navy-deep' : 'bg-sand text-navy-deep'
                        }`}>
                          HQ
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-ivory/70' : 'text-charcoal/60'}`}>
                      {loc.city}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Location Card Display */}
            <div className="lg:col-span-8 p-8 sm:p-10 rounded-2xl bg-sand/40 border border-stroke-subtle space-y-6 text-left">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-champagne">Selected Office</div>
                <h3 className="text-2xl font-black text-navy-deep mt-1">{selectedLoc.name}</h3>
                <p className="text-sm text-charcoal/80 mt-1">{selectedLoc.address}, {selectedLoc.city}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stroke-subtle text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-muted block mb-1">Direct Telephone</span>
                  <a href={`tel:${selectedLoc.phoneRaw}`} className="text-base font-bold text-navy-deep hover:underline">
                    {selectedLoc.phone}
                  </a>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-muted block mb-1">Hours of Operation</span>
                  <p className="text-charcoal/80">{selectedLoc.hours}</p>
                  <p className="text-champagne font-medium mt-0.5">{selectedLoc.specialHours}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stroke-subtle flex flex-wrap items-center gap-4">
                <a
                  href={selectedLoc.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-lg bg-navy-deep text-ivory text-xs font-bold tracking-wider uppercase hover:bg-navy-midnight transition-colors inline-flex items-center gap-2"
                >
                  <span>Open in Google Maps</span>
                  <span className="material-symbols-outlined text-[15px] text-champagne">directions</span>
                </a>
                <button
                  onClick={onOpenQuote}
                  className="px-6 py-2.5 rounded-lg border border-stroke-subtle hover:border-navy-deep text-charcoal text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Schedule In-Person Consultation
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FINAL DRAMATIC CLOSING CTA (Section 21)
         ───────────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-36 bg-navy-deep text-ivory relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-champagne">
            <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
            <span>START YOUR FREE COMPARISON</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ivory tracking-tight leading-[1.1]">
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
            No broker fees • No spam calls • Direct Texas agency guidance
          </div>

        </div>
      </section>

    </div>
  );
}
