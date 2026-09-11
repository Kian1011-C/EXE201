import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, ChevronDown, Menu, X, Shield, 
  ShieldCheck, HeartPulse, Umbrella, Building2, Users,
  Clock, ArrowRight
} from 'lucide-react';

// Authentic Social Icons (clean SVGs matching original BrightFire template)
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function YelpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
      <path d="M12.271 16.718l1.302 5.513c.094.398-.242.769-.644.711l-3.235-.468c-.363-.053-.557-.456-.376-.777l2.124-3.766a.576.576 0 0 1 .829-.213zm-2.146-2.308L4.693 16.63c-.39.141-.774-.188-.737-.601l.298-3.256c.033-.365.41-.591.73-.438l4.025 1.93a.576.576 0 0 1 .116.145zm1.537-2.02l2.64-5.01c.191-.362.684-.393.918-.057l1.884 2.707c.211.303.076.719-.261.802l-4.28 1.053a.577.577 0 0 1-.901-.495zm-2.093-.207l-4.48-1.758c-.382-.15-.494-.64-.217-.941l2.228-2.428c.25-.272.69-.251.912.043l2.25 2.981a.577.577 0 0 1-.693.097v.006zm4.551 2.378l4.475 1.77c.382.151.493.642.215.942l-2.231 2.423c-.25.272-.69.251-.911-.044l-2.24-2.986a.577.577 0 0 1 .692-2.105z" />
    </svg>
  );
}

// Authentic Agency Logo matching BrightFire aesthetic
function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Traditional Shield Crest with Navy & Gold Seal */}
      <div className="relative w-12 h-12 bg-[#0a2239] rounded-lg p-1 flex items-center justify-center border-2 border-[#d97706] shadow-sm shrink-0">
        <svg viewBox="0 0 44 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Base */}
          <path d="M22 2L4 8V22C4 34.5 11.5 44 22 47C32.5 44 40 34.5 40 22V8L22 2Z" fill="#0a2239" stroke="#d97706" strokeWidth="2.5" />
          {/* Inner Shield */}
          <path d="M22 7L8 12V22C8 31.5 14 39.5 22 42C30 39.5 36 31.5 36 22V12L22 7Z" fill="#113354" />
          {/* Eagle Silhouette / Star Emblem */}
          <path d="M22 13L24.5 19.5H31L26 23.5L28 30L22 26L16 30L18 23.5L13 19.5H19.5L22 13Z" fill="#d97706" />
          <circle cx="22" cy="35" r="2.5" fill="#f59e0b" />
          <circle cx="15" cy="33" r="1.8" fill="#f59e0b" />
          <circle cx="29" cy="33" r="1.8" fill="#f59e0b" />
        </svg>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="text-xl md:text-2xl font-black text-[#0a2239] tracking-tight font-serif">
            THE BEST RATE
          </span>
          <span className="text-[10px] font-extrabold text-[#d97706] tracking-widest uppercase border border-[#d97706]/40 px-1.5 py-0.5 rounded bg-amber-50/50">
            INSURANCE
          </span>
        </div>
        <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-1">
          Independent Insurance Agency • Katy &amp; Texas
        </p>
      </div>
    </div>
  );
}

export default function Navbar({ onOpenQuote }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-xs transition-all duration-300">
      {/* Top Utility Bar (Real BrightFire Style) */}
      <div className="bg-[#0a2239] text-white text-xs py-2 px-4 border-b border-[#14324f]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          
          {/* Left: Contact Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-200">
            <a href="tel:8336336868" className="flex items-center gap-1.5 hover:text-[#d97706] transition-colors font-medium">
              <Phone className="w-3.5 h-3.5 text-[#d97706]" />
              <span>(833) 633-6868</span>
              <span className="text-[10px] text-gray-400 font-normal">(Toll-Free 24/7)</span>
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="mailto:info@thebestrateinsurance.com" className="flex items-center gap-1.5 hover:text-[#d97706] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#d97706]" />
              <span>info@thebestrateinsurance.com</span>
            </a>
            <span className="hidden lg:inline text-gray-600">|</span>
            <span className="hidden lg:flex items-center gap-1.5 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Guaranteed Response: 3-5 Business Days</span>
            </span>
          </div>

          {/* Right: Social Links & Office Locations */}
          <div className="flex items-center gap-4 text-xs">
            {/* Social Icons matching original site */}
            <div className="flex items-center gap-2.5 pr-3 border-r border-gray-700 text-gray-300">
              <a 
                href="https://maps.google.com/?cid=15721998512988683818" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#d97706] transition-colors"
                title="Google Maps"
              >
                <MapPin className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://www.facebook.com/thebestrateinsurance" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#1877F2] transition-colors"
                title="Facebook"
              >
                <FacebookIcon />
              </a>
              <a 
                href="https://www.yelp.com/biz/the-best-rate-insurance-houston-4" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#FF1A1A] transition-colors"
                title="Yelp"
              >
                <YelpIcon />
              </a>
              <a 
                href="https://www.instagram.com/healthinsurancetips/" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#E4405F] transition-colors"
                title="Instagram"
              >
                <InstagramIcon />
              </a>
              <a 
                href="https://www.linkedin.com/company/the-best-rate-insurance/" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#0A66C2] transition-colors"
                title="LinkedIn"
              >
                <LinkedinIcon />
              </a>
            </div>

            {/* Bilingual Tag */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>English &amp; Tiếng Việt</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-3.5'} px-4 md:px-8 border-b border-gray-200 bg-white`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="group focus:outline-none">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation Links (Clean, Traditional Corporate Styling) */}
          <nav className="hidden xl:flex items-center gap-1 font-medium text-sm text-[#0a2239]">
            
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md transition-colors ${location.pathname === '/' ? 'text-[#0a2239] font-bold bg-gray-100' : 'hover:text-[#d97706] hover:bg-gray-50'}`}
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setActiveDropdown('about')} 
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#d97706] hover:bg-gray-50 transition-colors cursor-pointer">
                <span>About</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform" />
              </button>
              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link to="/about" className="block px-4 py-2 hover:bg-gray-50 text-gray-800 hover:text-[#0a2239]">
                    <div className="font-semibold text-sm">About Us</div>
                    <div className="text-xs text-gray-500">Agency mission &amp; independent model</div>
                  </Link>
                  <Link to="/about#team" className="block px-4 py-2 hover:bg-gray-50 text-gray-800 hover:text-[#0a2239]">
                    <div className="font-semibold text-sm">Meet Our Team</div>
                    <div className="text-xs text-gray-500">Experienced leadership &amp; licensed agents</div>
                  </Link>
                  <Link to="/#reviews" className="block px-4 py-2 hover:bg-gray-50 text-gray-800 hover:text-[#0a2239]">
                    <div className="font-semibold text-sm">Customer Reviews</div>
                    <div className="text-xs text-gray-500">Google &amp; Yelp 5-star ratings</div>
                  </Link>
                  <Link to="/#carriers" className="block px-4 py-2 hover:bg-gray-50 text-gray-800 hover:text-[#0a2239]">
                    <div className="font-semibold text-sm">Insurance Companies</div>
                    <div className="text-xs text-gray-500">30+ top carrier partnerships</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Insurance Services Mega Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setActiveDropdown('services')} 
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#d97706] hover:bg-gray-50 transition-colors cursor-pointer">
                <span>Insurance Services</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform" />
              </button>
              {activeDropdown === 'services' && (
                <div className="absolute top-full -left-12 w-[540px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 grid grid-cols-2 gap-3 z-50">
                  
                  {/* Life Insurance */}
                  <Link to="/insurance-services/life-insurance" className="p-3 rounded-lg hover:bg-amber-50/50 border border-transparent hover:border-amber-200 transition-colors flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-[#0a2239] flex items-center justify-center shrink-0">
                      <Umbrella className="w-5 h-5 text-[#d97706]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Life Insurance</div>
                      <div className="text-xs text-gray-500">Term, Whole Life (IUL), Final Expense, Annuities</div>
                    </div>
                  </Link>

                  {/* Health Insurance */}
                  <Link to="/insurance-services/health-insurance" className="p-3 rounded-lg hover:bg-blue-50/50 border border-transparent hover:border-blue-200 transition-colors flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0a2239] flex items-center justify-center shrink-0">
                      <HeartPulse className="w-5 h-5 text-[#005A9C]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Health Insurance (ACA)</div>
                      <div className="text-xs text-gray-500">Individual &amp; Family Plans, Disability, LTC</div>
                    </div>
                  </Link>

                  {/* Medicare */}
                  <Link to="/insurance-services/medicare" className="p-3 rounded-lg hover:bg-emerald-50/50 border border-transparent hover:border-emerald-200 transition-colors flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#0a2239] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Medicare Solutions</div>
                      <div className="text-xs text-gray-500">Part C Advantage, Part D Rx, Medigap Supps</div>
                    </div>
                  </Link>

                  {/* Group Benefits */}
                  <Link to="/insurance-services/group-benefits" className="p-3 rounded-lg hover:bg-slate-50/50 border border-transparent hover:border-slate-200 transition-colors flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#0a2239] flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Group Benefits</div>
                      <div className="text-xs text-gray-500">Small business health, group life &amp; dental</div>
                    </div>
                  </Link>

                  <div className="col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <Link to="/insurance-services" className="text-[#0a2239] font-bold hover:underline">
                      View All Insurance Services →
                    </Link>
                    <span className="text-gray-400">Over 30+ top rated A-rated carriers</span>
                  </div>
                </div>
              )}
            </div>

            {/* I Am... Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setActiveDropdown('iam')} 
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:text-[#d97706] hover:bg-gray-50 transition-colors cursor-pointer">
                <span>I Am...</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform" />
              </button>
              {activeDropdown === 'iam' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Individuals &amp; Families</div>
                  <Link to="/insurance-services/health-insurance" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm">
                    Single Adults
                  </Link>
                  <Link to="/insurance-services/health-insurance" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm">
                    Married Couples with Children
                  </Link>
                  <Link to="/insurance-services/medicare" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm">
                    Empty Nesters &amp; Seniors (65+)
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1 px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Agents &amp; Agencies</div>
                  <Link to="/careers" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm">
                    New &amp; Experienced Agents
                  </Link>
                </div>
              )}
            </div>

            {/* Careers */}
            <Link 
              to="/careers" 
              className="px-3 py-2 rounded-md hover:text-[#d97706] hover:bg-gray-50 transition-colors"
            >
              Careers
            </Link>

            {/* Locations */}
            <Link 
              to="/locations" 
              className="px-3 py-2 rounded-md hover:text-[#d97706] hover:bg-gray-50 transition-colors"
            >
              Locations
            </Link>

            {/* Contact */}
            <Link 
              to="/contact" 
              className="px-3 py-2 rounded-md hover:text-[#d97706] hover:bg-gray-50 transition-colors"
            >
              Contact
            </Link>

          </nav>

          {/* Right Action Callouts */}
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href="tel:8336336868"
              className="flex items-center gap-2 text-[#0a2239] font-bold text-sm py-2 px-3 rounded-lg border border-gray-300 hover:border-[#0a2239] hover:bg-gray-50 transition-all"
            >
              <Phone className="w-4 h-4 text-[#d97706]" />
              <span>(833) 633-6868</span>
            </a>

            <button
              onClick={onOpenQuote}
              className="bg-[#d97706] hover:bg-[#b46304] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Get A Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onOpenQuote}
              className="bg-[#d97706] text-white text-xs font-bold px-3 py-2 rounded-lg"
            >
              Get A Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 px-4 py-6 max-h-[85vh] overflow-y-auto space-y-4">
          <div className="space-y-1">
            <Link to="/" className="block px-3 py-2.5 rounded-lg font-bold text-[#0a2239] hover:bg-gray-50">
              Home
            </Link>
            
            <div className="border-t border-gray-100 pt-3">
              <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Insurance Services</div>
              <Link to="/insurance-services/life-insurance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
                <Umbrella className="w-4 h-4 text-[#d97706]" />
                <span>Life Insurance (Term, IUL, Annuities)</span>
              </Link>
              <Link to="/insurance-services/health-insurance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
                <HeartPulse className="w-4 h-4 text-[#005A9C]" />
                <span>Health Insurance (ACA / Individual &amp; Family)</span>
              </Link>
              <Link to="/insurance-services/medicare" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Medicare (Part C, Part D, Medigap)</span>
              </Link>
              <Link to="/insurance-services/group-benefits" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Group Benefits &amp; Small Business</span>
              </Link>
              <Link to="/insurance-services" className="block px-3 py-1.5 text-xs text-[#0a2239] font-bold hover:underline">
                View All Insurance Services →
              </Link>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Agency &amp; Team</div>
              <Link to="/about" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                About Us
              </Link>
              <Link to="/about#team" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Meet Our Leadership &amp; Agents
              </Link>
              <Link to="/careers" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Careers &amp; Insurance Bootcamp
              </Link>
              <Link to="/locations" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Texas Offices (Katy, Houston, Garland)
              </Link>
              <Link to="/contact" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Contact Us Today
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <a
              href="tel:8336336868"
              className="w-full flex items-center justify-center gap-2 bg-[#0a2239] text-white font-bold py-3 rounded-lg text-center"
            >
              <Phone className="w-4 h-4 text-[#d97706]" />
              <span>Call Toll-Free: (833) 633-6868</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full bg-[#d97706] hover:bg-[#b46304] text-white font-bold py-3 rounded-lg text-center cursor-pointer"
            >
              Request A Free Quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
