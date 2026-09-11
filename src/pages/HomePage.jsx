import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, CheckCircle2, ArrowRight, Phone, HeartPulse, ShieldCheck, 
  BadgeDollarSign, Star, Users, Award, Clock, MapPin, Zap, ChevronRight,
  HelpCircle, Building2, UserCheck
} from 'lucide-react';
import { services, targetProfiles, reviews } from '../data/servicesData';
import { locations } from '../data/locationsData';

export default function HomePage({ onOpenQuote }) {
  const [quickZip, setQuickZip] = useState('');
  const [quickType, setQuickType] = useState('health');

  const handleQuickQuoteSubmit = (e) => {
    e.preventDefault();
    onOpenQuote();
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a1e33] via-[#0f2d4d] to-[#143d68] text-white overflow-hidden py-16 lg:py-24">
        {/* Decorative background grid & glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Your Trusted Independent Agency in Texas</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                When You Need a Plan That Keeps You & Your Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Secure.</span>
              </h1>

              <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl">
                Compare multiple insurance quotes from your local independent insurance agent today. 
                The Best Rate Insurance provides <strong>Medicare</strong>, <strong>Affordable Care Act (ACA)</strong>, and <strong>Life Insurance</strong> for all of Texas and 15+ states.
              </p>

              {/* Key Value Proposition Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Guaranteed turnaround within 24-48h</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bilingual support (English & Vietnamese)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top carriers: Humana, Aetna, BCBS & more</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Free Consultation • No Broker Fees</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={onOpenQuote}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-4 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer text-base"
                >
                  <span>Compare Free Quotes</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="tel:8336336868"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-xl border border-white/20 transition-colors flex items-center gap-2 text-base"
                >
                  <Phone className="w-5 h-5 text-amber-400" />
                  <span>(833) 633-6868</span>
                </a>
              </div>
            </div>

            {/* Right Column: Quick Quote Floating Card */}
            <div className="lg:col-span-5">
              <div className="bg-white text-gray-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 relative">
                <div className="absolute -top-3.5 right-6 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Fast Online Quote
                </div>

                <h3 className="text-xl font-bold text-[#0f2942] mb-1">Find Your Best Rate</h3>
                <p className="text-xs text-gray-500 mb-5">
                  See how much you could save with independent rate comparison.
                </p>

                <form onSubmit={handleQuickQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      I am looking for:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'health', label: 'Health (ACA)' },
                        { id: 'medicare', label: 'Medicare' },
                        { id: 'life', label: 'Life' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setQuickType(item.id)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            quickType === item.id
                              ? 'bg-[#0f2942] text-white border-[#0f2942]'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Texas Zip Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 77450 (Katy) or 77072 (Houston)"
                      maxLength={5}
                      value={quickZip}
                      onChange={(e) => setQuickZip(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Rates & Options</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    Need instant help? Call our local advisors:
                  </p>
                  <a href="tel:8336336868" className="text-[#0f2942] font-black text-sm hover:underline mt-0.5 inline-block">
                    📞 (833) 633-6868 (Toll Free 24/7)
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modern Technology & Fast Turnaround Feature Strip */}
      <section className="bg-slate-900 text-white py-6 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Modern Quoting Technology</div>
              <div className="text-gray-400 text-xs">Real-time multi-carrier rates</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Guaranteed Fast Response</div>
              <div className="text-gray-400 text-xs">Response within 24 to 48 hours</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Licensed Independent Agency</div>
              <div className="text-gray-400 text-xs">Unbiased objective plan reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Insurance Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0f2942] font-bold text-xs uppercase tracking-widest bg-blue-100/70 text-blue-900 px-3.5 py-1.5 rounded-full">
              Tailored Coverage
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Insurance Solutions For Every Chapter of Life
            </h2>
            <p className="text-gray-600 text-base mt-3">
              Whether you are turning 65, buying your first family home, or seeking comprehensive healthcare subsidies, we make insurance straightforward and budget-friendly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div 
                key={svc.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={svc.bannerImg} 
                    alt={svc.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {svc.highlight}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {svc.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {svc.shortDesc}
                  </p>

                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Key Plans:</div>
                    {svc.subtypes.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{sub.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={svc.slug}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-[#0f2942] font-bold text-sm hover:bg-[#0f2942] hover:text-white transition-all group-hover:bg-[#0f2942] group-hover:text-white"
                    >
                      <span>Explore {svc.title.split(' ')[0]} Plans</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose An Independent Agent Section */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                The Independent Difference
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0f2942] tracking-tight leading-tight">
                Why Shop With An Independent Agent Instead of One Company?
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                When you buy a car, you wouldn’t purchase the first one you see without checking options. What if the automobile industry only made one type of car? You wouldn’t have a choice!
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                The same is true for insurance. With an independent insurance agent, <strong>you have choices</strong>. We work to satisfy your needs, not an insurance company's quotas. We assess your unique risks, scan dozens of underwriting guidelines, and deliver an objective analysis of the marketplace.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">We Work For You, Not The Carrier</h4>
                    <p className="text-xs text-gray-500 mt-0.5">We represent your best financial interest and handle claims support when you need it most.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Access to Multiple Top Carriers</h4>
                    <p className="text-xs text-gray-500 mt-0.5">UnitedHealthcare, Aetna, Humana, BCBS, Mutual of Omaha, Ameritas and more.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80" 
                  alt="Team meeting with client" 
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10">
                  <div className="text-amber-400 font-bold text-sm">"More Than An Agency — We Are A Family."</div>
                  <div className="text-xs text-gray-300 mt-1">Our offices in Katy, Houston, and Garland are open for walk-ins and consultation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Agent Bootcamp & Career Section */}
      <section className="py-20 bg-gradient-to-br from-[#0c233c] to-[#153a61] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Career Opportunities
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                How Can You Join Our Big Family?
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                At The Best Rate Insurance, we’re shaping the next generation of insurance professionals through our proprietary <strong>Insurance Agent Bootcamp</strong> and community events.
              </p>
              <p className="text-gray-300 text-base leading-relaxed">
                Whether you are brand new to financial services or an experienced producer looking for higher contracts, cutting-edge lead tech, and hands-on executive coaching from top leaders, you belong here.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Hands-On Mentorship
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">Direct daily coaching from industry veterans and top agency leaders.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Top Commission Contracts
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">Direct carrier appointments, vested renewals, and transparent payout ladders.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/careers"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  <span>Apply For Agent Bootcamp</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about#team"
                  className="text-white hover:text-amber-400 font-semibold text-sm px-4 py-3"
                >
                  Meet Our Leadership →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/15 space-y-5">
                <h3 className="text-xl font-bold text-white">Join Our Fast-Growing Team</h3>
                <p className="text-xs text-gray-300">
                  We actively recruit licensed & non-licensed candidates passionate about protecting families and building long-term financial freedom.
                </p>

                <div className="space-y-3 text-xs text-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</div>
                    <span>No prior insurance experience required (we sponsor pre-licensing training).</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</div>
                    <span>Access to automated lead distribution and CRM software.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
                    <span>Weekly masterclasses in Vietnamese and English.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/careers"
                    className="w-full block text-center bg-white text-[#0f2942] hover:bg-gray-100 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    View Open Career Positions
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Reviews & Testimonials Section */}
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-100/70 px-3 py-1 rounded-full">
              Client Satisfaction
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 tracking-tight">
              Trusted By Families Across Texas
            </h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm font-bold text-gray-700 ml-2">5.0 / 5.0 Rating on Google & Yelp</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {rev.source}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">{rev.author}</span>
                  <span className="text-gray-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Texas Branches Map & Locations Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#0f2942] font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              In-Person Service
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0f2942] mt-2">
              Visit Us At Any of Our 3 Texas Offices
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Stop by for a cup of coffee and a face-to-face policy consultation with our licensed team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map((loc) => (
              <div key={loc.id} className="bg-gray-50 rounded-3xl p-6 border border-gray-200/80 hover:border-[#0f2942] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#0f2942]">{loc.name}</h3>
                  {loc.isHQ && (
                    <span className="bg-[#0f2942] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      HQ
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-gray-600 mb-6">
                  <p className="font-medium text-gray-800">{loc.address}, {loc.city}</p>
                  <p className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    {loc.phone}
                  </p>
                  <p className="text-gray-500">{loc.hours}</p>
                </div>

                <a 
                  href={loc.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center py-2.5 rounded-xl border border-gray-300 hover:bg-[#0f2942] hover:text-white font-semibold text-xs transition-colors"
                >
                  View on Google Maps →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-amber-500 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-950">
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Ready to Protect What Matters Most?
            </h3>
            <p className="text-sm font-medium text-slate-900 mt-1">
              Let one of our licensed independent experts customize the right plan for you today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenQuote}
              className="bg-[#0f2942] hover:bg-[#163a5e] text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer text-sm"
            >
              Get Free Quote
            </button>
            <a
              href="tel:8336336868"
              className="bg-white/90 hover:bg-white text-slate-900 font-bold px-5 py-3.5 rounded-xl transition-colors text-sm"
            >
              (833) 633-6868
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
