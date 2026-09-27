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
            
            {/* Column 1: CRM Capabilities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-champagne">
                CRM Capabilities
              </h4>
              <ul className="space-y-2 text-xs text-ivory/70">
                <li><a href="/#features" className="hover:text-ivory transition-colors">Customer &amp; Contact Management</a></li>
                <li><a href="/#features" className="hover:text-ivory transition-colors">ACA &amp; Medicare Pipelines</a></li>
                <li><a href="/#features" className="hover:text-ivory transition-colors">Renewal &amp; Task Reminders</a></li>
                <li><a href="/#features" className="hover:text-ivory transition-colors">Post-Sale Follow-up Automation</a></li>
                <li><a href="/#features" className="hover:text-ivory transition-colors">Carrier Statement Visibility</a></li>
                <li><a href="/#workflow" className="hover:text-ivory transition-colors">Daily Agent Workflow</a></li>
              </ul>
            </div>

            {/* Column 2: Pricing & Plans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-champagne">
                SaaS Packages
              </h4>
              <ul className="space-y-2 text-xs text-ivory/70">
                <li><Link to="/pricing" className="hover:text-ivory transition-colors">Starter ($39 / mo)</Link></li>
                <li><Link to="/pricing" className="hover:text-ivory transition-colors">Professional ($79 / mo)</Link></li>
                <li><Link to="/pricing" className="hover:text-ivory transition-colors">Agency ($199 / mo)</Link></li>
                <li><Link to="/pricing" className="hover:text-ivory transition-colors">Annual Discount (Save 15%)</Link></li>
                <li><Link to="/pricing" className="hover:text-ivory transition-colors">14-Day Free Trial</Link></li>
                <li><Link to="/login" className="hover:text-champagne transition-colors font-semibold">Agent &amp; Staff Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-champagne">
                Company &amp; Support
              </h4>
              <ul className="space-y-2 text-xs text-ivory/70">
                <li><Link to="/about" className="hover:text-ivory transition-colors">About InsurMatch</Link></li>
                <li><a href="/#how-it-works" className="hover:text-ivory transition-colors">How It Works</a></li>
                <li><Link to="/contact" className="hover:text-ivory transition-colors">Contact Support</Link></li>
                <li><a href="mailto:support@insurmatch.us" className="hover:text-ivory transition-colors">support@insurmatch.us</a></li>
                <li><Link to="/privacy" className="hover:text-ivory transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-ivory transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Regulatory Disclaimers (Strict B2B SaaS Boundary per Coms.pdf Page 13) */}
        <div className="py-8 border-b border-white/10 text-[11px] text-ivory/50 leading-relaxed space-y-2">
          <p>
            <strong>B2B Software Provider Notice:</strong> InsurMatch is a technology service provider delivering a cloud-based Customer Relationship Management (CRM) platform for licensed independent insurance agents and agencies. InsurMatch does not sell, bind, quote, or underwrite insurance products, provide insurance advice, collect or hold insurance premiums, or receive carrier commissions.
          </p>
          <p>
            <strong>License &amp; Ownership:</strong> Licensed agents remain solely responsible for their own licensing, insurance recommendations, and client service disclosures. All customer data and policyholder relationships remain the exclusive property of the subscribing agent or agency.
          </p>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ivory/60">
          <div>
            © {new Date().getFullYear()} INSURMATCH. All rights reserved. B2B SaaS CRM for Independent Insurance Agents.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-champagne transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-champagne transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-champagne transition-colors">Compliance &amp; Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
