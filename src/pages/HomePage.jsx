import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Check, ArrowRight, Phone, Mail, Clock, MapPin, 
  ChevronRight, Star, Users, Briefcase, Building2, 
  HelpCircle, UserCheck, Award
} from 'lucide-react';
import CarrierLogosStrip from '../components/CarrierLogos';
import { services, reviews } from '../data/servicesData';
import { locations } from '../data/locationsData';

export default function HomePage({ onOpenQuote }) {
  const [quickZip, setQuickZip] = useState('');
  const [quickType, setQuickType] = useState('health');

  const handleQuickQuoteSubmit = (e) => {
    e.preventDefault();
    onOpenQuote();
  };

  return (
    <div className="w-full bg-white text-gray-800">
      
      {/* Hero Section - Authentic BrightFire Insurance Agency Style */}
      <section className="relative bg-[#f8fafc] border-b border-gray-200 overflow-hidden py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Authentic Agency Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#0a2239]/5 border border-[#0a2239]/15 text-[#0a2239] text-xs font-bold tracking-wide uppercase">
                <Shield className="w-4 h-4 text-[#d97706]" />
                <span>Texas Independent Insurance Agency</span>
              </div>

              {/* Exact Original Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0a2239] font-serif leading-[1.2]">
                When You Need a Plan That Will Keep You and Your Family Secure.
              </h1>

              {/* Exact Original Copy */}
              <div className="space-y-3 text-gray-600 text-base md:text-lg leading-relaxed">
                <p>
                  Our agents have years of experience helping clients with a variety of different needs and budgets find affordable health insurance with coverage they can depend on.
                </p>
                <p className="text-sm md:text-base text-gray-700 font-medium">
                  Here at <strong>The Best Rate Insurance</strong>, we pride ourselves on using modern technology and resources to provide our clients with a faster turnaround time than our competitors can. You are guaranteed a response within three to five business days.
                </p>
              </div>

              {/* Key Highlights with Authentic Clean Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold">Guaranteed response in 3-5 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold">Bilingual (English &amp; Tiếng Việt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold">Representing 30+ top rated carriers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold">100% Free Consultation • No Broker Fees</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  onClick={onOpenQuote}
                  className="bg-[#d97706] hover:bg-[#b46304] text-white font-bold px-7 py-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer text-base"
                >
                  <span>Get A Quote</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/contact"
                  className="bg-white hover:bg-gray-50 text-[#0a2239] font-bold px-6 py-3.5 rounded-lg border border-gray-300 transition-colors flex items-center gap-2 text-base shadow-xs"
                >
                  <span>Contact Us</span>
                </Link>

                <a
                  href="tel:8336336868"
                  className="text-[#0a2239] hover:text-[#d97706] font-bold flex items-center gap-2 text-sm px-2 py-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#d97706]" />
                  <span>(833) 633-6868</span>
                </a>
              </div>

            </div>

            {/* Right Column: Authentic Visual & Fast Rate Finder Card */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Professional Consultation Photo with Turnaround Badge */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80" 
                  alt="The Best Rate Insurance agents consulting with Texas clients" 
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2239]/80 via-transparent to-transparent" />
                
                {/* Guarantee Stamp */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d97706]" />
                    <div>
                      <div className="font-bold text-[#0a2239]">Fast Turnaround Guarantee</div>
                      <div className="text-gray-500 text-[11px]">Response within 3 to 5 business days</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Guaranteed
                  </span>
                </div>
              </div>

              {/* Quick Rate Comparison Widget */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-[#0a2239] font-serif">Compare Quotes Online</h3>
                  <span className="text-xs font-semibold text-[#d97706] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Free &amp; Confidential
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Compare rates from over 30 insurance carriers in Texas.
                </p>

                <form onSubmit={handleQuickQuoteSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Insurance Category:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'health', label: 'Health (ACA)' },
                        { id: 'medicare', label: 'Medicare' },
                        { id: 'life', label: 'Life' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setQuickType(item.id)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            quickType === item.id
                              ? 'bg-[#0a2239] text-white border-[#0a2239]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2239] focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#d97706] hover:bg-[#b46304] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>View Rates &amp; Options</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Questions? Call our local office:</span>
                  <a href="tel:8336336868" className="font-bold text-[#0a2239] hover:underline">
                    (833) 633-6868
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Top Insurance Carriers We Represent Strip (Authentic Vector Badges) */}
      <CarrierLogosStrip />

      {/* Core 4 Insurance Services Section (Clean BrightFire Grid) */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[#d97706] font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Coverage Solutions
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a2239] font-serif mt-2 tracking-tight">
              Insurance For You, Your Family &amp; Your Business
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-2">
              Whether you are turning 65, purchasing family healthcare, or protecting small business employees, we evaluate options across the entire marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => (
              <div 
                key={svc.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Real Photo Banner */}
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={svc.bannerImg} 
                      alt={svc.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a2239]/90 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white font-serif leading-snug">
                        {svc.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                      {svc.shortDesc}
                    </p>

                    <div className="space-y-1.5 border-t border-gray-100 pt-3">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Included Coverage:
                      </div>
                      {svc.subtypes.slice(0, 3).map((sub) => (
                        <div key={sub.id} className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span className="truncate">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={svc.slug}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-gray-100 text-[#0a2239] font-bold text-xs hover:bg-[#0a2239] hover:text-white transition-colors"
                  >
                    <span>Explore {svc.title.split(' ')[0]}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/insurance-services"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0a2239] hover:text-[#d97706] hover:underline"
            >
              <span>View All Insurance Services &amp; Specialized Riders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* "How Can You Join Our Big Family?" (Agent Bootcamp & Agency Recruitment) */}
      <section className="py-16 md:py-20 bg-[#0a2239] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[#d97706] font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Agent Opportunities
              </span>

              {/* Exact Original Headline */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-white font-serif tracking-tight">
                How Can You Join Our Big Family?
              </h2>

              {/* Exact Original Text */}
              <p className="text-gray-300 text-base leading-relaxed">
                At The Best Rate Insurance, we’re more than just an agency — we’re a family. Through our <strong>Insurance Agent Bootcamp</strong> and ongoing community events, we’re shaping the next generation of insurance professionals. Whether you’re brand new or experienced, we actively recruit and support agents across all levels.
              </p>

              <p className="text-gray-300 text-base leading-relaxed">
                Ready to build a legacy and receive hands-on support from top leaders in the industry?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-lg">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#d97706] stroke-[3]" />
                    Hands-On Mentorship
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Daily coaching from Anh Que Pham CPA and Phuc Trinh CEO.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-lg">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#d97706] stroke-[3]" />
                    Top Carrier Contracts
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Direct contracts, vested renewals, and automated lead systems.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/careers"
                  className="bg-[#d97706] hover:bg-[#b46304] text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
                >
                  <span>Career Opportunities</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/careers#apply"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-lg border border-white/20 transition-colors text-sm"
                >
                  <span>Apply Now</span>
                </Link>
              </div>

            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80" 
                  alt="The Best Rate Insurance Bootcamp workshop" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2239] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 text-gray-900 p-4 rounded-xl shadow-lg border border-gray-200">
                  <div className="font-bold text-[#0a2239] text-sm">Insurance Agent Bootcamp</div>
                  <div className="text-xs text-gray-600 mt-0.5">Sponsoring licensing prep, CRM tech, and live field training across Texas.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The 3 Signature BrightFire Action Boxes ([Join Our Agency], [Find an Agent], [Contact Us Today]) */}
      <section className="py-14 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Join Our Agency */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-between hover:border-[#0a2239] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#d97706] flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0a2239] font-serif mb-2">Join Our Agency</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  We’re always looking for motivated individuals to join our fast-growing team.
                </p>
              </div>
              <div>
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-1.5 font-bold text-sm text-[#d97706] hover:text-[#b46304] hover:underline"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Box 2: Find an Agent */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-between hover:border-[#0a2239] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#005A9C] flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0a2239] font-serif mb-2">Find an Agent</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  We have an agent or representative for your specific purpose and language.
                </p>
              </div>
              <div>
                <Link
                  to="/about#team"
                  className="inline-flex items-center gap-1.5 font-bold text-sm text-[#005A9C] hover:underline"
                >
                  <span>Find an Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Box 3: Contact Us Today */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-between hover:border-[#0a2239] transition-colors">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0a2239] font-serif mb-2">Contact Us Today</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Let one of our experts customize a solution that’s right for your needs and budget.
                </p>
              </div>
              <div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 font-bold text-sm text-emerald-700 hover:underline"
                >
                  <span>Get In Touch</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Shop With An Independent Agent Section (BrightFire Car Dealer Analogy) */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[#d97706] font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                The Independent Advantage
              </span>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0a2239] font-serif tracking-tight">
                Why Shop With An Independent Agent Instead of One Company?
              </h2>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                When you buy a car, you wouldn’t purchase the first one you see without checking your options. What if the automobile industry decided to make only one type of car, one make and model? You wouldn’t have a choice!
              </p>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                The same is true for insurance. With an independent insurance agent, <strong>you have choices</strong>. Captive agents (like State Farm or Farmers) are bound to sell only one company's products. As independent brokers, we work for <em>you</em>, comparing rates across dozens of A-rated carriers to find your optimal rate.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <div className="text-xs text-gray-700">
                    <strong className="text-gray-900 block font-bold">Unbiased Policy Comparison</strong>
                    We analyze underwriting criteria across Humana, BCBS, Aetna, UHC, and Mutual of Omaha to find your ideal match.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                  <div className="text-xs text-gray-700">
                    <strong className="text-gray-900 block font-bold">Your Advocate During Claims &amp; Renewals</strong>
                    When rate changes occur, we review your file and re-shop the market so you never overpay.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80" 
                  alt="Family enjoying security and peace of mind with The Best Rate Insurance" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2239]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-[#d97706] font-bold text-sm font-serif">"More than an agency — we are a family."</div>
                  <div className="text-xs text-gray-300 mt-0.5">Protecting thousands of Texas families across 3 localized branch offices.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials Section */}
      <section id="reviews" className="py-16 md:py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#d97706] font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Verified Client Satisfaction
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0a2239] font-serif mt-2">
              Trusted By Clients Throughout Texas
            </h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#d97706] text-[#d97706]" />
              ))}
              <span className="text-sm font-bold text-gray-800 ml-2">5.0 / 5.0 on Google &amp; Yelp</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev, idx) => (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#d97706] text-[#d97706]" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {rev.source}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0a2239]">{rev.author}</span>
                  <span className="text-gray-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3 Texas Branch Locations Showcase */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#0a2239] font-bold text-xs uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
              In-Person Service
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0a2239] font-serif mt-2">
              Visit Us At Any of Our 3 Texas Offices
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Stop by for a friendly consultation or call our agents anytime 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div 
                key={loc.id} 
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-[#0a2239] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#0a2239] font-serif">{loc.name}</h3>
                    {loc.isHQ && (
                      <span className="bg-[#0a2239] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        HQ
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                      <span>{loc.address}, {loc.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a href={`tel:${loc.phoneRaw}`} className="font-bold text-[#0a2239] hover:underline">
                        {loc.phone}
                      </a>
                    </div>

                    <div className="flex items-start gap-2 text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>{loc.hours}</span>
                    </div>
                  </div>
                </div>

                <a 
                  href={loc.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center py-2 rounded-lg bg-white border border-gray-300 hover:bg-[#0a2239] hover:text-white font-bold text-xs transition-colors shadow-xs"
                >
                  View on Google Maps →
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-[#0a2239] text-white py-12 px-4 border-t-4 border-[#d97706]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-serif">
              Ready to Protect What Matters Most?
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              Guaranteed response within 3 to 5 business days. Speak with a local licensed Texas agent today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenQuote}
              className="bg-[#d97706] hover:bg-[#b46304] text-white font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer text-sm shadow-sm"
            >
              Get Free Quote
            </button>
            <a
              href="tel:8336336868"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-lg border border-white/20 transition-colors text-sm"
            >
              (833) 633-6868
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
