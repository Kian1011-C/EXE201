import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-trust-navy-deep border-t border-cyan-ice/15 text-surface-variant">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        
        {/* Top Grid of Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand / Identity Col */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="text-headline-md font-headline-md font-bold text-surface-container-lowest">
              The Best Rate Insurance
            </div>
            <p className="text-body-sm font-body-sm text-surface-variant leading-relaxed">
              Independent insurance brokerage delivering clear health, Medicare, and life coverage solutions for families and individuals nationwide.
            </p>
            <div className="text-body-sm font-body-sm text-cyan-ice font-semibold">
              Toll-Free: (833) 633-6868
            </div>
          </div>

          {/* Insurance Col */}
          <div>
            <h3 className="text-surface-container-lowest font-bold mb-4 text-sm uppercase tracking-wider">
              Insurance
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/life-insurance">Life Insurance</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/health-insurance">Health Insurance (ACA)</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/group-benefits">Group Benefits</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/medicare">Medicare Solutions</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/insurance-services/life-insurance">Fixed Annuities</Link></li>
            </ul>
          </div>

          {/* About Col */}
          <div>
            <h3 className="text-surface-container-lowest font-bold mb-4 text-sm uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/about">About Us</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/about#team">Meet Our Team</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/#reviews">Customer Reviews</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/#carriers">Insurance Companies</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/#blog">Insurance Blog</Link></li>
            </ul>
          </div>

          {/* Policy Service Col */}
          <div>
            <h3 className="text-surface-container-lowest font-bold mb-4 text-sm uppercase tracking-wider">
              Policy Service
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">Customer Support</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">Online Billing &amp; Payments</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">File A Claim</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">Policy Change Request</Link></li>
              <li><Link className="hover:text-cyan-ice transition-colors duration-200" to="/contact">Medicare Notice</Link></li>
            </ul>
          </div>

        </div>

        {/* Compliance Disclaimer Block */}
        <div className="py-6 border-b border-white/10 space-y-3">
          <div className="text-[11px] leading-relaxed text-surface-variant/80">
            <p>
              <strong>Compliance Disclaimer:</strong> The Best Rate Insurance is not connected with or endorsed by the Federal Medicare program. By contacting this number, you will be connected with a licensed insurance agent. We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE (1-800-633-4227), or your local State Health Insurance Program (SHIP) to get information on all of your options.
            </p>
          </div>
        </div>

        {/* Bottom Bar Links & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-surface-variant">
          <div>
            © {new Date().getFullYear()} The Best Rate Insurance. All rights reserved. Licensed Independent Agency.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/privacy">Privacy Policy</Link>
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/terms">Terms of Service</Link>
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/compliance">Compliance Disclaimer</Link>
            <Link className="hover:text-cyan-ice transition-colors duration-200" to="/accessibility">Accessibility</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
