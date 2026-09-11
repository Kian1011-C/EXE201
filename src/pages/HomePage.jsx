import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CarrierLogosStrip from '../components/CarrierLogos';

export default function HomePage({ onOpenQuote }) {
  const [planType, setPlanType] = useState('medicare');
  const [zipcode, setZipcode] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');

  const handleQuickQuote = (e) => {
    e.preventDefault();
    onOpenQuote();
  };

  return (
    <div className="w-full bg-background text-on-background">
      
      {/* Hero Section with Quote Form & Visual Accent (Exact Stitch AI Layout) */}
      <section className="relative bg-gradient-to-b from-surface to-surface-container-low overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stroke-subtle">
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-ice/40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-ice text-primary text-xs font-bold tracking-wide shadow-xs">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>SAVE THE MOST WITH THE BEST RATE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-on-surface tracking-tight leading-[1.15]">
                Safeguarding Your <br className="hidden sm:inline" />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-container to-secondary">
                  Future With Insurance
                </span>
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Navigate healthcare, Medicare, and tailored life policies with licensed independent Texas specialists. Guaranteed quick response, clear answers, and zero confusion.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuote}
                  className="px-6 py-3.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer text-sm"
                >
                  <span>Get A Quote</span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </button>

                <Link
                  to="/contact"
                  className="px-6 py-3.5 rounded-lg bg-surface-container-lowest border border-stroke-subtle hover:border-primary text-on-surface hover:text-primary font-bold shadow-xs transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <span>Contact Us</span>
                  <span className="material-symbols-outlined text-[18px]">headset_mic</span>
                </Link>
              </div>

              {/* Trust Badge Row */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-on-surface-variant text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-success-emerald text-[20px]">check_circle</span>
                  <span>Licensed in 50 States</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-success-emerald text-[20px]">check_circle</span>
                  <span>Response in 3-5 Days Guaranteed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-success-emerald text-[20px]">check_circle</span>
                  <span>No Fee For Consultation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Quote Widget */}
            <div className="lg:col-span-5 relative" id="quote-calculator">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-stroke-subtle shadow-xl relative z-10">
                <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Fast Rate Comparison</h2>
                    <p className="text-xs text-on-surface-variant">Check your eligibility &amp; savings in 2 minutes</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-ice flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">calculate</span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleQuickQuote}>
                  {/* Insurance Category Choice */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">
                      Select Insurance Program
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPlanType('medicare')}
                        className={`rounded-lg p-2.5 text-center transition-all flex flex-col items-center cursor-pointer border ${
                          planType === 'medicare'
                            ? 'border-primary bg-cyan-ice/30 text-primary font-bold'
                            : 'border-stroke-subtle hover:border-primary/50 bg-surface text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">medical_services</span>
                        <span className="text-xs mt-1">Medicare</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanType('aca')}
                        className={`rounded-lg p-2.5 text-center transition-all flex flex-col items-center cursor-pointer border ${
                          planType === 'aca'
                            ? 'border-primary bg-cyan-ice/30 text-primary font-bold'
                            : 'border-stroke-subtle hover:border-primary/50 bg-surface text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                        <span className="text-xs mt-1">ACA / Health</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanType('life')}
                        className={`rounded-lg p-2.5 text-center transition-all flex flex-col items-center cursor-pointer border ${
                          planType === 'life'
                            ? 'border-primary bg-cyan-ice/30 text-primary font-bold'
                            : 'border-stroke-subtle hover:border-primary/50 bg-surface text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">family_restroom</span>
                        <span className="text-xs mt-1">Life Plans</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Row: ZIP & Age */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="zipcode">
                        ZIP Code
                      </label>
                      <div className="relative">
                        <input
                          id="zipcode"
                          type="text"
                          maxLength={5}
                          placeholder="77450"
                          value={zipcode}
                          onChange={(e) => setZipcode(e.target.value)}
                          className="w-full h-11 px-3 pl-9 rounded-lg border border-stroke-subtle bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          required
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-3 text-[18px] text-outline">
                          location_on
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="age">
                        Applicant Age
                      </label>
                      <div className="relative">
                        <input
                          id="age"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="65"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full h-11 px-3 pl-9 rounded-lg border border-stroke-subtle bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          required
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-3 text-[18px] text-outline">
                          cake
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact phone */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1" htmlFor="phone">
                      Phone Number for Verification
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        type="tel"
                        placeholder="(833) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-3 pl-9 rounded-lg border border-stroke-subtle bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-3 text-[18px] text-outline">
                        phone
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Free Quote Now</span>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </button>

                  <p className="text-[11px] leading-relaxed text-center text-outline">
                    By clicking, you agree to receive information from licensed insurance agent representatives. No spam guaranteed.
                  </p>
                </form>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-cyan-ice/30 rounded-2xl -z-0 hidden sm:block"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Key Metrics / Trust Bar */}
      <section className="bg-trust-navy-deep text-on-primary py-8 border-y border-cyan-ice/15">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-3">
              <div className="text-3xl lg:text-4xl font-extrabold text-cyan-ice">10k+</div>
              <div className="text-xs uppercase tracking-wider text-surface-variant font-medium mt-1">Satisfied Clients</div>
            </div>
            <div className="p-3">
              <div className="text-3xl lg:text-4xl font-extrabold text-cyan-ice">50k+</div>
              <div className="text-xs uppercase tracking-wider text-surface-variant font-medium mt-1">Case Support</div>
            </div>
            <div className="p-3">
              <div className="text-3xl lg:text-4xl font-extrabold text-cyan-ice">120+</div>
              <div className="text-xs uppercase tracking-wider text-surface-variant font-medium mt-1">Certified Agents</div>
            </div>
            <div className="p-3">
              <div className="text-3xl lg:text-4xl font-extrabold text-cyan-ice">50</div>
              <div className="text-xs uppercase tracking-wider text-surface-variant font-medium mt-1">States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrier Logos Strip (Representing 30+ top carriers) */}
      <CarrierLogosStrip />

      {/* Core Insurance Offerings Section */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 lg:px-8" id="services">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <span className="text-primary text-xs font-bold tracking-wider uppercase mb-2 block">
              Our Specialized Services
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
              The Best Rate Insurance specializes in Medicare, Affordable Care Act, and Life Insurance.
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/insurance-services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary text-primary hover:bg-cyan-ice/20 text-sm font-bold transition-colors"
            >
              <span>View All Coverage Types</span>
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </Link>
          </div>
        </div>

        {/* Bento-style 3 Main Offerings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: ACA / Health */}
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
            <div className="h-52 overflow-hidden relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuLSUUDEUNEjbyseGqXNTquyyWapfgtDSBDx3Yq6NN-P5vHk2hfYjR1LCxMLQfG7ZuZY7eJJP4XcJW3D9QquqYEKvQUZoMOykqi56LpLmU0fPpQ1DuVshsuhBuACDrKQmAaM5HECRk87x3iu2m82J20fQoPKERocP1uNZKdk8kjaOD1QfznpSzGTEnrXMTMA_oAXy9s1KZXldR6HPZKxJv5dHSaMO4MIHOnkwEm03lJ_Xj8p_9DdiHcw" 
                alt="Affordable Care Act healthcare consultation" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                <span>ACA / Marketplace</span>
              </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Affordable Care Act (ACA)</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Individual &amp; family healthcare coverage with comprehensive preventive care, prescription medication access, and maximum subsidy eligibility support.
                </p>
                <ul className="space-y-2 mb-6 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Individual &amp; Family Health Plans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Premium Tax Credit Assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Individual Disability &amp; LTC Options</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/insurance-services/health-insurance"
                className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low group-hover:bg-primary group-hover:text-on-primary text-primary text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore ACA Plans</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Medicare Solutions (Featured) */}
          <div className="bg-surface-container-lowest rounded-2xl border-2 border-primary overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 relative">
            <div className="absolute top-3 right-3 z-10 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
              Top Rated Guidance
            </div>
            
            <div className="h-52 overflow-hidden relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXHCEsM6zEK2530ug5ygFemqK8-NQ0Y_uvCZTi3-LaJCL0lvmieRNHp3zrko0gWEcXAWdwFtkrdanm3As2vewtb2YlUvV2GEoyHXDpbIBPPRvkTr8_nbukJVuz9fDBqF5z1MAa7ZeuMRtQwULEXtceSqKKxTqIWhZOYDIEst0qUG1j8NVs6-37S42YV9SXEB0U3awtxMTivaoaNL72hZUe1GHOgddzLQ72gezJ7iOvAU5XaGpqduoe7A" 
                alt="Medicare guidance specialist with senior client" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">elderly</span>
                <span>Senior Healthcare</span>
              </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Medicare Guidance</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Personalized plan matching to ensure your doctors, dental, vision, and medications are fully covered with lowest out-of-pocket expenses.
                </p>
                <ul className="space-y-2 mb-6 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Medicare Part C (Advantage Plans)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Medicare Part D (Prescription Drug)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Medigap Supplemental Insurance</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/insurance-services/medicare"
                className="w-full py-2.5 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Compare Medicare Options</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Life Insurance */}
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
            <div className="h-52 overflow-hidden relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpl8qkyPH0ksmjgwUP3_3OwRp6z9CGZzXssJEpRZa0CkxFG_Eg6hyREt_q7p3YqioFTnBetZhO6SETIIYOBYTD3Xe4LczeU8-KAIKFESYMHNyYWYn4_DSFHN7rHKb-qmrfXdyDLIWTKfAJyjcODmQokQn1VrWWHPnsUeQWK_EddGV67CWU30GGQBqgEpnxiZbH1bharFFPKSOHpQSAyBPcvCl9SoQ2Cuyd4JqcJ6oZzFSjunZeE-yijQ" 
                alt="Multigenerational family protected by Life Insurance" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>Family Protection</span>
              </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Life &amp; Asset Protection</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Safeguard what matters most with life policies and annuity vehicles tailored for every life milestone, mortgage, and final expense need.
                </p>
                <ul className="space-y-2 mb-6 text-xs text-on-surface">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Individual Term &amp; Whole Life</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Mortgage Protection Insurance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    <span>Final Expense &amp; Fixed Annuities</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/insurance-services/life-insurance"
                className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low group-hover:bg-primary group-hover:text-on-primary text-primary text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Life Policies</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 'Insuring Katy and All of Texas' Value Proposition Section */}
      <section className="bg-gradient-to-r from-trust-navy-deep via-primary to-secondary py-16 lg:py-24 text-on-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Visual / Agent Feature Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-ice/20 shadow-2xl">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuUJ98d-JXQtfLTvftgRXFx8Vnim_ynHNGKbdO9uRl-yaXthWayWOyFVmZHs3lCen70AE92Ku0jAIiGMmOzVmuYEpS5_zRbJr08xcQoWHcaboRmQFt_na9Eb8mudKqORniVRun0g2krKCcRd68rwpeLcNmAWkCMjMnsPXyXnHgX3uzk_kWaoNF1XvDO7zU195ZidHIThI8mCEJxY33zVfKOw8E67AfQLDP4VAF1GkYBQVdo2ZrADC5dQ" 
                  alt="Insurance counselor greeting client in Houston office" 
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-trust-navy-deep/90 via-trust-navy-deep/60 to-transparent p-6">
                  <div className="text-cyan-ice text-xs font-bold uppercase tracking-wider mb-1">
                    Guaranteed Service Standard
                  </div>
                  <div className="text-surface-container-lowest text-lg font-bold">
                    Guaranteed Response Within 3–5 Business Days
                  </div>
                </div>
              </div>
            </div>

            {/* Value Copy & Quick Direct Action Cards */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-md bg-cyan-ice/20 text-cyan-ice text-xs font-bold uppercase tracking-wider border border-cyan-ice/30">
                Insuring Katy and All of Texas
              </span>

              <h2 className="text-3xl lg:text-4xl font-extrabold text-surface-container-lowest leading-tight font-serif">
                When You Need a Plan That Will Keep You and Your Family Secure.
              </h2>

              <p className="text-base text-cyan-ice/90 leading-relaxed">
                Our agents have years of experience helping clients with a variety of different needs and budgets find affordable health insurance with coverage they can depend on.
              </p>

              <p className="text-sm text-surface-variant leading-relaxed">
                Here at <strong className="text-white font-bold">The Best Rate Insurance</strong>, we pride ourselves on using modern technology and resources to provide our clients with a faster turnaround time than our competitors can.
              </p>

              {/* 3 Responsive Action Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4" id="contact-hub">
                <a 
                  className="p-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-all duration-200 text-center flex flex-col items-center group" 
                  href="tel:8336336868"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-ice text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">call</span>
                  </div>
                  <div className="text-base font-bold text-white">Call Us</div>
                  <div className="text-sm text-cyan-ice font-bold mt-1">(833) 633-6868</div>
                  <span className="text-[11px] text-surface-variant mt-0.5">24/7 Phone Support</span>
                </a>

                <a 
                  className="p-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-all duration-200 text-center flex flex-col items-center group" 
                  href="mailto:info@thebestrateins.com"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-ice text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">mail</span>
                  </div>
                  <div className="text-base font-bold text-white">Email Us</div>
                  <div className="text-sm text-cyan-ice font-bold mt-1">Prompt Response</div>
                  <span className="text-[11px] text-surface-variant mt-0.5">Direct Agent Inbox</span>
                </a>

                <Link 
                  className="p-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-all duration-200 text-center flex flex-col items-center group" 
                  to="/locations"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-ice text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">pin_drop</span>
                  </div>
                  <div className="text-base font-bold text-white">Visit Us</div>
                  <div className="text-sm text-cyan-ice font-bold mt-1">3 Texas Hubs</div>
                  <span className="text-[11px] text-surface-variant mt-0.5">Katy, Houston, Garland</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Join Our Agency & Big Family Section */}
      <section className="py-16 lg:py-24 bg-surface max-w-7xl mx-auto px-4 lg:px-8" id="careers">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">
            Join Our Agency
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-on-surface font-serif">
            How Can You Join Our Big Family?
          </h2>
          <p className="text-base text-on-surface-variant mt-4 leading-relaxed">
            At The Best Rate Insurance, we’re more than just an agency — we’re a family. Through our Insurance Agent Bootcamp and ongoing community events, we’re shaping the next generation of insurance professionals. Whether you’re brand new or experienced, we actively recruit and support agents across all levels.
          </p>
        </div>

        {/* Agency Culture Banner Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-12 border border-stroke-subtle">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQQHsBNmWxrJQgeEb4TY33em8HAQ1ElOxRaMY-6RZijHXZe6uVGqYnp_sSdC16v6WLmikR7yuMZdZ8V-cXAMT_jdvzjQ3F9bWJOAR7KMKA1eWuHVNa_rvQTmiBjPqTZO_ARfMRfB9rzA80TwzmN_7p28X4oW3B1iL6zDeDQiknw4LixvyRsBTpZ2HccEytJBFYn0R89DUOhtmRs-jo8nXttsk81YzyK-HVeqd2-YLOcKy7yB_HPzP74A" 
            alt="The Best Rate Insurance large agency family retreat and team members" 
            className="w-full h-80 sm:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-trust-navy-deep/80 via-transparent to-transparent flex items-end p-6 sm:p-10">
            <div className="text-white max-w-xl">
              <h3 className="text-xl sm:text-2xl font-bold font-serif">Ready to build a legacy?</h3>
              <p className="text-xs sm:text-sm text-surface-variant mt-1">
                Receive hands-on support, high-intent lead generation tools, and direct guidance from top leaders in the industry.
              </p>
            </div>
          </div>
        </div>

        {/* 3 CTA Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-stroke-subtle hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-ice text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[26px]">badge</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-serif">Join Our Agency</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                We’re always looking for motivated individuals to join our fast-growing nationwide sales team.
              </p>
            </div>
            <Link 
              to="/careers"
              className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold text-center transition-colors block"
            >
              Apply Now
            </Link>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-stroke-subtle hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-ice text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[26px]">person_search</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-serif">Find An Agent</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Connect with an accredited bilingual representative specializing in your exact county and state.
              </p>
            </div>
            <Link 
              to="/about#team"
              className="w-full py-3 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold text-center transition-colors block"
            >
              Find An Agent
            </Link>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-stroke-subtle hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-ice text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[26px]">support_agent</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-serif">Contact Us Today</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Let one of our licensed independent experts customize a compliant solution that's right for you.
              </p>
            </div>
            <button 
              onClick={onOpenQuote}
              className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold text-center transition-colors cursor-pointer"
            >
              Get In Touch
            </button>
          </div>

        </div>
      </section>

      {/* Recent Blog Insight Section */}
      <section className="py-16 bg-surface-container-low border-t border-stroke-subtle" id="blog">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5 h-64 lg:h-full min-h-[300px] relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAftT5G-6Mpt_6-RX_Jqodh0nTKjbswNn3BLIAViB8McPvXy4K0WR_kwBkLdsveTHtvY1XKNuPbU73zemtuOpg9MKchhzgL_BJ7pcWMFrahmIzhHqXZONxzwQN9ZmzcZDoGv9MCOLMDci6vDzhHM7qGLHBZsYjxi2DuYEHFgQlE9E80lIJrkglQfIybay3DOoCxZwxlrS7z7Qj5dYwPTVkro_sf7zwlcu27NNn_I4Pu2KDNs8hRt-3iuQ" 
                alt="Family calculating coverage security together" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-cyan-ice text-primary text-xs font-bold uppercase">
                  Insurance Blog
                </span>
                <span className="text-xs text-outline font-medium">September 7, 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-serif">
                Life Insurance Awareness Month: How Much Coverage Do You Really Need?
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Calculating your family's safety net doesn't have to be guesswork. From calculating mortgage debt and college funds to final expenses, learn how our advisors calculate optimal coverage limits without overpaying premiums.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-container cursor-pointer"
                >
                  <span>Request Free Policy Calculation</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Texas Offices & Nationwide Reach */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 lg:px-8" id="locations">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">
            Our Physical Branches
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-serif">
            Texas Headquartered, Proudly Serving All 50 States
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2">
            Drop by our local offices or consult virtually from any state.
          </p>
        </div>

        {/* 3 Physical Office Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Katy Office */}
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-4">
                <h3 className="text-base font-bold text-on-surface font-serif">Katy Office (HQ)</h3>
                <span className="w-8 h-8 rounded-full bg-cyan-ice text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </span>
              </div>
              <div className="space-y-3 text-xs text-on-surface-variant">
                <p className="font-semibold text-on-surface">The Best Rate Insurance</p>
                <p>633 East Fernhurst Drive<br />Suite 1502<br />Katy, Texas 77450</p>
                <div className="pt-2">
                  <a className="text-primary font-bold hover:underline flex items-center gap-1.5" href="tel:8336336868">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Phone: (833) 633-6868</span>
                  </a>
                </div>
                <div className="border-t border-stroke-subtle pt-3 text-[11px] text-on-surface-variant space-y-0.5">
                  <p className="font-semibold text-on-surface">Office Hours:</p>
                  <p>Mon-Fri: 9:00am - 6:00pm</p>
                  <p>Sat-Sun: Closed</p>
                  <p className="text-primary font-semibold mt-1">Available by Phone: 24/7</p>
                  <p className="text-secondary font-medium">Open Weekends: October–December</p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-stroke-subtle">
              <a 
                href="https://maps.google.com/?cid=15721998512988683818" 
                target="_blank" 
                rel="noreferrer"
                className="w-full block text-center py-2 rounded-lg bg-surface-container-low hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors"
              >
                View On Google Maps →
              </a>
            </div>
          </div>

          {/* Houston Office */}
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-4">
                <h3 className="text-base font-bold text-on-surface font-serif">Houston Office</h3>
                <span className="w-8 h-8 rounded-full bg-cyan-ice text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </span>
              </div>
              <div className="space-y-3 text-xs text-on-surface-variant">
                <p className="font-semibold text-on-surface">The Best Rate Insurance</p>
                <p>8001 S Kirkwood Rd<br />Houston, Texas 77072</p>
                <div className="pt-2">
                  <a className="text-primary font-bold hover:underline flex items-center gap-1.5" href="tel:8336336868">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Phone: (833) 633-6868</span>
                  </a>
                </div>
                <div className="border-t border-stroke-subtle pt-3 text-[11px] text-on-surface-variant space-y-0.5">
                  <p className="font-semibold text-on-surface">Office Hours:</p>
                  <p>Mon-Fri: 9:00am - 5:00pm</p>
                  <p>Sat-Sun: Closed</p>
                  <p className="text-primary font-semibold mt-1">Available by Phone: 24/7</p>
                  <p className="text-secondary font-medium">Open Weekends: October–December</p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-stroke-subtle">
              <a 
                href="https://maps.google.com/?q=8001%20S%20Kirkwood%20Rd%20Houston%20TX%2077072" 
                target="_blank" 
                rel="noreferrer"
                className="w-full block text-center py-2 rounded-lg bg-surface-container-low hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors"
              >
                View On Google Maps →
              </a>
            </div>
          </div>

          {/* Garland Office */}
          <div className="bg-surface-container-lowest rounded-2xl border border-stroke-subtle p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-4">
                <h3 className="text-base font-bold text-on-surface font-serif">Garland Office</h3>
                <span className="w-8 h-8 rounded-full bg-cyan-ice text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </span>
              </div>
              <div className="space-y-3 text-xs text-on-surface-variant">
                <p className="font-semibold text-on-surface">The Best Rate Insurance</p>
                <p>2408 W Walnut St<br />Garland, Texas 75042</p>
                <div className="pt-2">
                  <a className="text-primary font-bold hover:underline flex items-center gap-1.5" href="tel:5642346868">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Phone: (564) 234-6868</span>
                  </a>
                </div>
                <div className="border-t border-stroke-subtle pt-3 text-[11px] text-on-surface-variant space-y-0.5">
                  <p className="font-semibold text-on-surface">Office Hours:</p>
                  <p>Mon-Fri: 9:00am - 5:00pm</p>
                  <p>Sat-Sun: Closed</p>
                  <p className="text-primary font-semibold mt-1">Available by Phone: 24/7</p>
                  <p className="text-secondary font-medium">Open Weekends: October–December</p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-stroke-subtle">
              <a 
                href="https://maps.google.com/?q=2408%20W%20Walnut%20St%20Garland%20TX%2075042" 
                target="_blank" 
                rel="noreferrer"
                className="w-full block text-center py-2 rounded-lg bg-surface-container-low hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors"
              >
                View On Google Maps →
              </a>
            </div>
          </div>

        </div>

        {/* Regional Coverage Callout Box */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary font-serif">
              Proudly Serving All of Texas &amp; 50 States
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              The Best Rate Insurance provides Medicare, Affordable Care Act, and Life Insurance to all of Texas, including Katy, Sugar Land, Richmond, and Cypress, plus nationwide network coverage.
            </p>
          </div>
          <button 
            onClick={onOpenQuote}
            className="shrink-0 px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow cursor-pointer"
          >
            Speak With An Agent
          </button>
        </div>
      </section>

    </div>
  );
}
