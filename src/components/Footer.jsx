import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-ivory/80 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Top Editorial Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                alt="InsurMatch Logo" 
                className="h-10 w-10 object-contain rounded-lg shadow-xs" 
                src="/images/insurmatch-logo.png" 
              />
              <span className="text-2xl font-black text-ivory tracking-tight">
                INSUR<span className="text-champagne font-normal">MATCH</span>
              </span>
            </div>
            
            <p className="text-sm font-serif italic text-ivory/90 text-lg">
              Connecting consumers with licensed insurance professionals.
            </p>

            <p className="text-xs text-ivory/65 max-w-sm leading-relaxed">
              InsurMatch is an independent lead-generation and matchmaking platform connecting Vietnamese individuals and families across the United States with licensed independent insurance agents.
            </p>

            <div className="pt-2 text-xs space-y-1 text-ivory/70">
              <div>Platform Support: <a href="mailto:support@insurmatch.us" className="text-champagne hover:underline">support@insurmatch.us</a></div>
              <div>Agent Partnerships: <a href="mailto:agents@insurmatch.us" className="hover:underline">agents@insurmatch.us</a></div>
              <div className="text-ivory/50 text-[11px] pt-1">Digital Platform: Connecting consumers across participating US states</div>
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Insurance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-champagne">
                Coverage Needs
              </h4>
              <ul className="space-y-2 text-xs text-ivory/70">
                <li><Link to="/insurance-services/medicare" className="hover:text-ivory transition-colors">Medicare Guidance</Link></li>
                <li><Link to="/insurance-services/medicare" className="hover:text-ivory transition-colors">Medicare Advantage (Part C)</Link></li>
                <li><Link to="/insurance-services/medicare" className="hover:text-ivory transition-colors">Medigap Supplements</Link></li>
                <li><Link to="/insurance-services/health-insurance" className="hover:text-ivory transition-colors">ACA Marketplace (Obamacare)</Link></li>
                <li><Link to="/insurance-services/life-insurance" className="hover:text-ivory transition-colors">Life &amp; Living Benefits</Link></li>
                <li><Link to="/insurance-services/life-insurance" className="hover:text-ivory transition-colors">Fixed Indexed Annuities</Link></li>
                <li><Link to="/insurance-services" className="hover:text-ivory transition-colors">All Coverage Categories</Link></li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-champagne">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-ivory/70">
                <li><Link to="/about" className="hover:text-ivory transition-colors">About InsurMatch</Link></li>
                <li><a href="#how-it-works" className="hover:text-ivory transition-colors">How It Works</a></li>
                <li><Link to="/about#team" className="hover:text-ivory transition-colors">Our Leadership Team</Link></li>
                <li><Link to="/locations" className="hover:text-ivory transition-colors">Regional Partner Hubs</Link></li>
                <li><Link to="/careers" className="hover:text-ivory transition-colors">Agent Partner Network</Link></li>
                <li><Link to="/contact" className="hover:text-ivory transition-colors">Contact Support</Link></li>
                <li><Link to="/login" className="hover:text-champagne transition-colors">Agent &amp; Staff Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-champagne">
                Resources
              </h4>
              <ul className="space-y-2 text-xs text-ivory/70">
                <li><Link to="/get-quote" className="hover:text-ivory transition-colors">Agent Matching Flow</Link></li>
                <li><a href="#blog" className="hover:text-ivory transition-colors">Insurance Guides</a></li>
                <li><Link to="/contact" className="hover:text-ivory transition-colors">Consumer Support</Link></li>
                <li><Link to="/contact" className="hover:text-ivory transition-colors">Frequently Asked Questions</Link></li>
                <li><Link to="/locations" className="hover:text-ivory transition-colors">Regional Coverage</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Regulatory Disclaimers (Preserving CMS Medicare & ACA Compliance) */}
        <div className="py-8 border-b border-white/10 text-[11px] text-ivory/50 leading-relaxed space-y-2">
          <p>
            <strong>Disclaimer:</strong> InsurMatch is a technology and lead-generation platform, not an insurance agency or carrier. InsurMatch does not sell insurance, provide insurance advice, underwrite policies, or collect insurance premiums. All insurance quotes, consultations, and policies are provided solely by independent, properly licensed insurance agents. Not connected with or endorsed by the US government or the federal Medicare program.
          </p>
          <p>
            <strong>General Information:</strong> Information submitted by users is matched with verified independent agents licensed in the user's state. Premium calculations and tax credit estimates are subject to carrier underwriting approval and official marketplace verification.
          </p>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ivory/60">
          <div>
            © {new Date().getFullYear()} INSURMATCH. All rights reserved. Digital Insurance Lead-Generation &amp; Matchmaking Platform.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-champagne transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-champagne transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-champagne transition-colors">Legal &amp; Licensing</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
