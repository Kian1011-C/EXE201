import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import CarrierLogosStrip from '../components/CarrierLogos';
import { leadership } from '../data/teamData';
import { locations } from '../data/locationsData';

export default function HomePage({ onOpenQuote }) {
  return (
    <div className="w-full bg-surface text-on-surface">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION — Grounded, Established Texas Agency Presence
         ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-surface-container-lowest border-b border-stroke-subtle pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-ice/40 text-primary text-xs font-bold tracking-wide border border-primary/20">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Independent Texas Insurance Agency • Katy • Houston • Garland</span>
              </div>

              {/* Editorial Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-[1.15]">
                Insurance Guidance <br className="hidden sm:inline" />
                <span className="text-primary">You Can Trust.</span>
              </h1>

              {/* Subhead with realistic, human language */}
              <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Helping Texas families, seniors, and business owners navigate Medicare, Health (ACA), and Life insurance. We compare rates across 30+ top-rated carriers to find coverage that fits your budget — with zero broker fees.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuote}
                  className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer text-sm"
                >
                  <span>Talk With an Advisor</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>

                <Link
                  to="/locations"
                  className="px-6 py-3.5 rounded-xl bg-surface-container-lowest border border-stroke-subtle hover:border-primary text-on-surface hover:text-primary font-bold shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">store</span>
                  <span>Visit a Texas Office</span>
                </Link>
              </div>

              {/* Factual Agency Guarantees */}
              <div className="pt-4 border-t border-stroke-subtle grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span><strong>Independent Brokerage</strong> — We work for you</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">translate</span>
                  <span><strong>Bilingual Advisors</strong> — English &amp; Tiếng Việt</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                  <span><strong>Zero Broker Fees</strong> — Free plan comparisons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">pin_drop</span>
                  <span><strong>3 Physical Offices</strong> — Katy, Houston, Garland</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Column — Authentic Advisor Photography & Agency Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-sm overflow-hidden">
                {/* Real-world Photography */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-surface-container">
                  <img 
                    src="/images/advisor-counselor.jpg" 
                    alt="Licensed insurance advisor meeting with clients in Texas" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-surface-container-lowest/95 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-primary border border-stroke-subtle shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Texas Licensed Agency</span>
                  </div>
                </div>

                {/* Grounded Office Card Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-primary">Headquarters</div>
                    <h3 className="text-base font-bold text-on-surface mt-0.5">The Best Rate Insurance • Katy Office</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      633 East Fernhurst Drive, Suite 1502, Katy, TX 77450
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-stroke-subtle flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-on-surface-variant font-medium">Direct Telephone</div>
                      <a href="tel:8336336868" className="text-sm font-bold text-primary hover:underline">
                        (833) 633-6868
                      </a>
                    </div>
                    <div className="text-right text-[11px] text-on-surface-variant">
                      <div>Mon–Fri: 9am – 6pm</div>
                      <div className="text-emerald-700 font-semibold">24/7 Phone Support</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={onOpenQuote}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors text-center cursor-pointer"
                    >
                      Request Rate Comparison
                    </button>
                    <a
                      href="https://maps.google.com/?cid=15721998512988683818"
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 rounded-xl border border-stroke-subtle hover:border-primary text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Map</span>
                      <span className="material-symbols-outlined text-[15px]">directions</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FACTUAL CREDENTIALS BAR (Replaces Fake 10k/50k Counters)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-trust-navy-deep text-white py-8 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-3 border-l-2 border-cyan-ice/40 pl-4">
              <div className="text-xl lg:text-2xl font-black text-cyan-ice">3 Offices</div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-0.5">Physical Texas Branches</div>
              <p className="text-[11px] text-white/70 mt-1">Walk-in locations in Katy (HQ), Houston, and Garland</p>
            </div>

            <div className="p-3 border-l-2 border-cyan-ice/40 pl-4">
              <div className="text-xl lg:text-2xl font-black text-cyan-ice">30+ Carriers</div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-0.5">Independent Brokerage</div>
              <p className="text-[11px] text-white/70 mt-1">We compare BlueCross, UnitedHealthcare, Aetna, Humana &amp; more</p>
            </div>

            <div className="p-3 border-l-2 border-cyan-ice/40 pl-4">
              <div className="text-xl lg:text-2xl font-black text-cyan-ice">Bilingual</div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-0.5">English &amp; Tiếng Việt</div>
              <p className="text-[11px] text-white/70 mt-1">Dedicated advisors serving multicultural Texas communities</p>
            </div>

            <div className="p-3 border-l-2 border-cyan-ice/40 pl-4">
              <div className="text-xl lg:text-2xl font-black text-cyan-ice">$0 Broker Fee</div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mt-0.5">100% Free Consultation</div>
              <p className="text-[11px] text-white/70 mt-1">Direct enrollment guidance at no additional cost to you</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CARRIER PARTNERSHIPS MARQUEE
         ───────────────────────────────────────────────────────────── */}
      <section className="py-6 bg-surface-container-low border-b border-stroke-subtle">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
            Top Insurance Carriers We Represent &amp; Compare in Texas
          </p>
          <CarrierLogosStrip />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. EDITORIAL SERVICES — Asymmetrical, Human & Practical
         ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 lg:px-8" id="services">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 text-left">
          <span className="text-primary text-xs font-bold tracking-wider uppercase block mb-1.5">
            Core Coverage Areas
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
            Insurance Guidance Tailored to Your Stage of Life.
          </h2>
          <p className="text-on-surface-variant text-sm sm:text-base mt-2 leading-relaxed">
            Unlike captive agents who sell only one company’s policies, our independent advisors evaluate dozens of underwriting guidelines to match your specific medical needs and budget.
          </p>
        </div>

        {/* Asymmetric Editorial Layout: Lead Feature + Companion Grid */}
        <div className="space-y-8">
          
          {/* Featured Lead Block: Medicare Guidance (Wide 2-Column Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="bg-surface-container-lowest rounded-2xl border-2 border-primary/40 shadow-xs hover:border-primary transition-colors overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 h-64 lg:h-auto relative bg-surface-container">
                <img 
                  src="/images/service-medicare.jpg" 
                  alt="Medicare specialist assisting senior client" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary text-on-primary text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  Featured Service
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider">Age 65+ &amp; Disability Coverage</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-on-surface">
                    Medicare Guidance: Clear Answers Before You Enroll
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Deciding between Medicare Advantage (Part C), Medicare Supplements (Medigap), and Part D Prescription Drug plans can be overwhelming. We verify your existing doctors, preferred hospital networks, and medications before recommending any plan.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[17px]">check_circle</span>
                      <span>Doctor &amp; Hospital In-Network Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[17px]">check_circle</span>
                      <span>Prescription Drug (Part D) Tier Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[17px]">check_circle</span>
                      <span>Dental, Vision &amp; Hearing Benefits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[17px]">check_circle</span>
                      <span>Annual Enrollment Review (Oct–Dec)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to="/insurance-services/medicare"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Explore Medicare Options</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <button
                    onClick={onOpenQuote}
                    className="px-5 py-2.5 rounded-xl border border-stroke-subtle hover:border-primary text-on-surface text-xs font-bold transition-colors cursor-pointer"
                  >
                    Request Free Plan Review
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2 Companion Services: ACA / Health & Life Protection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Service 2: ACA Marketplace */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-xs hover:border-primary/50 transition-colors p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-44 rounded-xl overflow-hidden bg-surface-container relative">
                  <img 
                    src="/images/service-aca.jpg" 
                    alt="Doctor checking health of family" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-surface-container-lowest/90 px-2.5 py-1 rounded text-xs font-bold text-primary">
                    Individuals &amp; Families
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                    Affordable Care Act (ACA / Obamacare)
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                    Qualified health plans designed for individuals, self-employed workers, and families. We calculate government tax credits (subsidies) to reduce your monthly premium, sometimes to as low as $0/month.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    <span>Maximized Advance Premium Tax Credits (APTC)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    <span>Preventive Care &amp; Essential Health Benefits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    <span>Special Enrollment Period (SEP) Guidance</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-stroke-subtle">
                <Link
                  to="/insurance-services/health-insurance"
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View ACA Plans &amp; Subsidies</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>

            {/* Service 3: Life & Asset Protection */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle shadow-xs hover:border-primary/50 transition-colors p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-44 rounded-xl overflow-hidden bg-surface-container relative">
                  <img 
                    src="/images/service-life.jpg" 
                    alt="Multigenerational family protected by Life Insurance" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-surface-container-lowest/90 px-2.5 py-1 rounded text-xs font-bold text-primary">
                    Financial Legacy
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                    Life Insurance &amp; Living Benefits
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                    Protecting your family's future, safeguarding your home mortgage, and structuring tax-advantaged retirement vehicles. We customize term life, whole life, IUL, and fixed indexed annuities.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    <span>Term Life with Living Benefits (Critical/Chronic illness)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    <span>Mortgage Protection &amp; Final Expense Policies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    <span>Fixed Indexed Annuities for Protected Growth</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-stroke-subtle">
                <Link
                  to="/insurance-services/life-insurance"
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Compare Life Insurance Options</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. MEET OUR TEAM — Humanizing the Agency Leadership
         ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-surface-container-lowest border-y border-stroke-subtle" id="team">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
            <div className="max-w-2xl">
              <span className="text-primary text-xs font-bold tracking-wider uppercase block mb-1.5">
                Local Leadership &amp; Founders
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                Meet the People Behind Your Coverage.
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base mt-2">
                Real advisors with deep roots in Texas financial planning and community advocacy. No call centers — just dedicated professionals you can meet in person.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link
                to="/about#team"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Read Full Leadership Story</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member) => (
              <div 
                key={member.name}
                className="bg-surface rounded-2xl border border-stroke-subtle overflow-hidden shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 bg-surface-container overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div>
                      <h3 className="text-base font-bold text-on-surface leading-snug">{member.name}</h3>
                      <div className="text-xs font-semibold text-primary mt-0.5">{member.role}</div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="border-t border-stroke-subtle pt-3 text-[11px] text-on-surface-variant">
                    <span className="font-semibold text-on-surface">Focus: </span>
                    {member.specialty}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LOCAL TEXAS PRESENCE — Real Walk-in Offices
         ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 lg:px-8" id="locations">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary text-xs font-bold tracking-wider uppercase block mb-1.5">
            Physical Branches
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
            Local Guidance. Real Texas Offices.
          </h2>
          <p className="text-on-surface-variant text-sm sm:text-base mt-2">
            Insurance decisions are personal. Drop by one of our walk-in locations across Texas, or schedule an in-person appointment with a local specialist.
          </p>
        </div>

        {/* 3 Physical Office Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-6 shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stroke-subtle pb-3">
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{loc.name}</h3>
                    {loc.isHQ && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-cyan-ice/40 px-2 py-0.5 rounded">
                        Headquarters
                      </span>
                    )}
                  </div>
                  <span className="w-8 h-8 rounded-full bg-cyan-ice/40 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">store</span>
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-on-surface-variant">
                  <div>
                    <p className="font-semibold text-on-surface">{loc.address}</p>
                    <p>{loc.city}</p>
                  </div>

                  <div className="pt-1">
                    <a href={`tel:${loc.phoneRaw}`} className="text-primary font-bold hover:underline flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>Phone: {loc.phone}</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-stroke-subtle space-y-0.5 text-[11px]">
                    <p className="font-semibold text-on-surface">Office Hours:</p>
                    <p>{loc.hours}</p>
                    <p className="text-primary font-medium">{loc.specialHours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stroke-subtle">
                <a
                  href={loc.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center py-2.5 rounded-xl bg-surface-container-low hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Conversational "Prefer to talk?" Callout Box */}
        <div className="bg-surface-container-lowest rounded-2xl border border-primary/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-left">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Direct Assistance</div>
            <h3 className="text-lg sm:text-xl font-bold text-on-surface">
              Prefer to talk? Give our Texas team a call.
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
              Our licensed advisors are ready to answer your questions by phone. Toll-Free: <a href="tel:8336336868" className="font-bold text-primary hover:underline">(833) 633-6868</a> (Mon–Fri: 9:00 AM – 6:00 PM CT).
            </p>
          </div>
          <button
            onClick={onOpenQuote}
            className="shrink-0 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Speak With An Advisor
          </button>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. EDUCATIONAL GUIDES & COMMUNITY
         ───────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-surface-container-low border-t border-stroke-subtle" id="blog">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-6 sm:p-8">
            <div className="space-y-2 max-w-2xl text-left">
              <span className="text-primary text-xs font-bold uppercase tracking-wider">Educational Insurance Guide</span>
              <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                Life Insurance Awareness: How Much Coverage Does a Family Really Need?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Learn the straightforward formula for calculating income replacement, mortgage payoff, and college funding needs before choosing between term and permanent coverage.
              </p>
              <div className="text-[11px] text-on-surface-variant pt-1">
                Published by The Best Rate Advisory Team • 4 min read
              </div>
            </div>
            <button
              onClick={onOpenQuote}
              className="shrink-0 px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Request Free Policy Review
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
