import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-trust-navy-deep border-t border-cyan-ice/15 text-surface-variant">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        
        {/* Top Grid of Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand / Identity Col */}
          <div className="lg:col-span-2 space-y-4 pr-4">
            <div className="flex items-center gap-3">
              <img 
                alt="InsurMatch - The Best Rate Insurance" 
                className="h-10 w-10 object-contain rounded-xl shadow-xs" 
                src="/images/insurmatch-logo.png" 
              />
              <div className="flex flex-col">
                <span className="text-xl font-black text-surface-container-lowest leading-tight">
                  Insur<span className="text-cyan-ice">Match</span>
                </span>
                <span className="text-[11px] font-semibold text-surface-variant uppercase tracking-wider">
                  The Best Rate Insurance Agency
                </span>
              </div>
            </div>

            <p className="text-body-sm font-body-sm text-surface-variant leading-relaxed">
              An independent insurance agency founded in Texas, dedicated to helping individuals, families, and businesses find transparent, dependable health, Medicare, and life coverage without broker fees.
            </p>

            <div className="space-y-1 text-body-sm font-body-sm">
              <div className="text-cyan-ice font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>Toll-Free: (833) 633-6868</span>
              </div>
              <div className="text-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>info@thebestrateins.com</span>
              </div>
              <div className="text-surface-variant text-xs pt-1">
                Bilingual Advisors Available: English &amp; Tiếng Việt
              </div>
            </div>
          </div>

          {/* Insurance Products */}
          <div>
            <h3 className="text-surface-container-lowest font-bold mb-4 text-xs uppercase tracking-wider">
              Coverage Options
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/medicare">Medicare Advantage (Part C)</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/medicare">Medicare Part D (Rx)</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/medicare">Medigap Supplements</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/health-insurance">ACA Health Plans (Obamacare)</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/life-insurance">Term &amp; Whole Life Insurance</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/life-insurance">Fixed Annuities &amp; LTC</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services">All Insurance Services</Link></li>
            </ul>
          </div>

          {/* Physical Texas Offices */}
          <div>
            <h3 className="text-surface-container-lowest font-bold mb-4 text-xs uppercase tracking-wider">
              Texas Offices
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-white">Katy Headquarters</p>
                <p className="text-surface-variant">633 E Fernhurst Dr, Suite 1502</p>
                <p className="text-surface-variant">Katy, TX 77450</p>
                <a href="tel:8336336868" className="text-cyan-ice hover:underline">(833) 633-6868</a>
              </div>
              <div className="pt-1 border-t border-white/5">
                <p className="font-semibold text-white">Houston Office</p>
                <p className="text-surface-variant">8001 S Kirkwood Rd</p>
                <p className="text-surface-variant">Houston, TX 77072</p>
              </div>
              <div className="pt-1 border-t border-white/5">
                <p className="font-semibold text-white">Garland (DFW) Office</p>
                <p className="text-surface-variant">2408 W Walnut St</p>
                <p className="text-surface-variant">Garland, TX 75042</p>
                <a href="tel:5642346868" className="text-cyan-ice hover:underline">(564) 234-6868</a>
              </div>
            </div>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-surface-container-lowest font-bold mb-4 text-xs uppercase tracking-wider">
              Company &amp; Service
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/about">About Our Agency</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/about#team">Meet Our Team</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/locations">All Office Locations</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/careers">Careers &amp; Bootcamp</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">Contact Customer Care</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/get-quote">Request Free Quote</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/login">Staff / Agent Login</Link></li>
            </ul>
          </div>

        </div>

        {/* Compliance & CMS Medicare Disclaimer Block */}
        <div className="py-6 border-b border-white/10 space-y-3">
          <div className="text-[11px] leading-relaxed text-surface-variant/80 space-y-2">
            <p>
              <strong>Medicare Disclaimer:</strong> We do not offer every plan available in your area. Currently, we represent multiple Medicare organizations which offer products in Texas and other licensed jurisdictions. Please contact Medicare.gov, 1-800-MEDICARE (1-800-633-4227, TTY users call 1-877-486-2048) 24 hours a day/7 days a week, or your local State Health Insurance Assistance Program (SHIP) to obtain information on all of your options.
            </p>
            <p>
              <strong>Affordable Care Act (ACA) Notice:</strong> The Best Rate Insurance assists individuals and families in applying for Qualified Health Plans through HealthCare.gov and direct state marketplaces. Eligibility for advance premium tax credits (APTC) is determined by household income and family size guidelines set by the federal government.
            </p>
          </div>
        </div>

        {/* Bottom Bar Links & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-surface-variant">
          <div>
            © {new Date().getFullYear()} The Best Rate Insurance Agency (InsurMatch). All rights reserved. Licensed Independent Brokerage.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/privacy">Privacy Policy</Link>
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/terms">Terms of Service</Link>
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">HIPAA &amp; Security</Link>
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/locations">Office Map</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
