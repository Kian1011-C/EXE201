import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { locations } from '../data/locationsData';

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}


export default function Footer() {
  return (
    <footer className="bg-[#0b1f33] text-gray-300 pt-16 pb-8 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Top 3 Office Cards */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full">
              Texas Branch Locations
            </span>
            <h3 className="text-2xl font-bold text-white mt-2">Visit Our Texas Offices Or Call Us 24/7</h3>
            <p className="text-sm text-gray-400 mt-1">
              Serving Houston, Katy, Sugar Land, Dallas-Garland, and clients in 15+ states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div 
                key={loc.id}
                className="bg-[#112a45] rounded-2xl p-6 border border-slate-700/60 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {loc.name}
                    </h4>
                    {loc.isHQ && (
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        HQ
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-sm text-gray-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                      <div>
                        <p>{loc.address}</p>
                        <p>{loc.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <a href={`tel:${loc.phoneRaw}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                        {loc.phone}
                      </a>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-gray-400">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p>{loc.hours}</p>
                        <p className="text-amber-300/80 mt-0.5">{loc.specialHours}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <a 
                    href={loc.mapLink}
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    Get Directions <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-gray-400">Walk-ins Welcome</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800 text-sm">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-[#0a2239] rounded-lg p-1 flex items-center justify-center border-2 border-[#d97706] shadow-sm shrink-0">
                <svg viewBox="0 0 44 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L4 8V22C4 34.5 11.5 44 22 47C32.5 44 40 34.5 40 22V8L22 2Z" fill="#0a2239" stroke="#d97706" strokeWidth="2.5" />
                  <path d="M22 7L8 12V22C8 31.5 14 39.5 22 42C30 39.5 36 31.5 36 22V12L22 7Z" fill="#113354" />
                  <path d="M22 13L24.5 19.5H31L26 23.5L28 30L22 26L16 30L18 23.5L13 19.5H19.5L22 13Z" fill="#d97706" />
                  <circle cx="22" cy="35" r="2.5" fill="#f59e0b" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-tight font-serif">THE BEST RATE INSURANCE</div>
                <div className="text-xs text-[#d97706] font-medium tracking-wider">INDEPENDENT INSURANCE AGENCY</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed pr-6">
              Compare multiple insurance quotes from your local independent insurance agent today. 
              The Best Rate Insurance provides Medicare, Affordable Care Act (ACA), and Life Insurance solutions for families and businesses across Texas and beyond.
            </p>

            {/* Social Icons matching original site */}
            <div className="flex items-center gap-2.5 pt-2">
              <a 
                href="https://maps.google.com/?cid=15721998512988683818" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#d97706] text-white flex items-center justify-center transition-colors"
                title="Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
              <a 
                href="https://www.facebook.com/thebestrateinsurance" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/healthinsurancetips/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E4405F] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/the-best-rate-insurance/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#0A66C2] text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.yelp.com/biz/the-best-rate-insurance-houston-4" 
                target="_blank" 
                rel="noreferrer" 
                className="px-2.5 h-8 rounded-lg bg-slate-800 hover:bg-[#FF1A1A] text-white font-bold text-xs flex items-center justify-center transition-colors"
                aria-label="Yelp"
              >
                Yelp
              </a>
            </div>
          </div>

          {/* Insurance Solutions */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide uppercase text-xs text-amber-400">
              Insurance Products
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/insurance-services/medicare" className="hover:text-amber-400 transition-colors">
                  Medicare Part C (Advantage)
                </Link>
              </li>
              <li>
                <Link to="/insurance-services/medicare" className="hover:text-amber-400 transition-colors">
                  Medicare Part D (Rx Drugs)
                </Link>
              </li>
              <li>
                <Link to="/insurance-services/medicare" className="hover:text-amber-400 transition-colors">
                  Medigap (Medicare Supplement)
                </Link>
              </li>
              <li>
                <Link to="/insurance-services/health-insurance" className="hover:text-amber-400 transition-colors">
                  ACA Individual & Family Plans
                </Link>
              </li>
              <li>
                <Link to="/insurance-services/life-insurance" className="hover:text-amber-400 transition-colors">
                  Term & Whole Life (IUL)
                </Link>
              </li>
              <li>
                <Link to="/insurance-services/life-insurance" className="hover:text-amber-400 transition-colors">
                  Final Expense & Fixed Annuities
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide uppercase text-xs text-amber-400">
              Agency & Community
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  About Our Agency
                </Link>
              </li>
              <li>
                <Link to="/about#team" className="hover:text-amber-400 transition-colors">
                  Leadership & Agent Team
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-amber-400 transition-colors">
                  Insurance Agent Bootcamp
                </Link>
              </li>
              <li>
                <Link to="/#reviews" className="hover:text-amber-400 transition-colors">
                  Customer Testimonials
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-amber-400 transition-colors">
                  Our Texas Branches
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Support */}
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide uppercase text-xs text-amber-400">
              Customer Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/get-quote" className="hover:text-amber-400 transition-colors font-medium text-amber-300">
                  Request A Free Quote →
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  File A Claim Guidance
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Policy Change Request
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Online Billing & Payments
                </Link>
              </li>
              <li className="pt-2 text-xs text-gray-400">
                <span className="block font-semibold text-gray-300">Toll-Free Hotline:</span>
                <a href="tel:8336336868" className="text-emerald-400 text-sm font-bold hover:underline">
                  (833) 633-6868
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Medicare Compliance Disclaimer & Legal Notice */}
        <div className="mt-8 pt-6 text-xs text-gray-400 space-y-3 leading-relaxed border-t border-slate-800">
          <p className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-[11px]">
            <strong className="text-gray-200">Official Medicare Disclaimer:</strong> The Best Rate Insurance is an independent insurance agency and is not connected with or endorsed by the U.S. Government or the federal Medicare program. We do not offer every plan available in your area. Currently, we represent multiple organizations which offer various products in your area. Please contact <a href="https://www.medicare.gov" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Medicare.gov</a>, 1-800-MEDICARE, or your local State Health Insurance Assistance Program (SHIP) to get information on all of your options.
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
            <p>© {new Date().getFullYear()} The Best Rate Insurance. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-gray-400">Privacy Statement</Link>
              <span>•</span>
              <Link to="/accessibility" className="hover:text-gray-400">Accessibility Statement</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-gray-400">Sitemap</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
