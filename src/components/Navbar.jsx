import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, ChevronDown, Menu, X, Shield, 
  HeartPulse, ShieldCheck, Umbrella, Users, Briefcase, 
  Layers, Clock, Check, FileText, Landmark
} from 'lucide-react';

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-11 h-11 bg-[#0f2942] rounded-lg p-1.5 flex items-center justify-center border-2 border-amber-500 shadow-sm shrink-0">
        <svg viewBox="0 0 40 46" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2L4 7.5V20.5C4 31.8 10.8 41.5 20 44C29.2 41.5 36 31.8 36 20.5V7.5L20 2Z" fill="#0f2942" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M20 7L8 11.2V20.5C8 29.5 13.2 37.4 20 39.5C26.8 37.4 32 29.5 32 20.5V11.2L20 7Z" fill="#14395e" />
          <polygon points="20,12 22.4,18 28.5,18.5 23.8,22.5 25.3,28.5 20,25 14.7,28.5 16.2,22.5 11.5,18.5 17.6,18" fill="#f59e0b" />
        </svg>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl md:text-2xl font-black text-[#0f2942] tracking-tight">THE BEST RATE</span>
          <span className="text-[10px] font-extrabold text-amber-700 tracking-widest uppercase border border-amber-500/40 px-1 rounded">INSURANCE</span>
        </div>
        <p className="text-[11px] text-gray-600 font-semibold tracking-wide">
          Independent Agency • Katy &amp; Texas
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm transition-all duration-300">
      {/* Top Notification Bar */}
      <div className="bg-[#0f2942] text-white text-xs border-b border-[#1b3d60] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
            <a href="tel:8336336868" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">(833) 633-6868</span> (Toll-Free 24/7)
            </a>
            <span className="hidden sm:inline text-gray-500">|</span>
            <a href="mailto:info@thebestrateinsurance.com" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>info@thebestrateinsurance.com</span>
            </a>
            <span className="hidden lg:inline text-gray-500">|</span>
            <span className="hidden lg:flex items-center gap-1.5 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Weekends (Oct–Dec Medicare Enrollment)</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/locations" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Offices: Katy • Houston • Garland</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-600">
              <span className="bg-emerald-600/90 text-[10px] font-bold px-2 py-0.5 rounded text-white tracking-wide uppercase">
                Bilingual: EN / VI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-3.5'} px-4 md:px-8 border-b border-gray-100 bg-white/95 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 font-medium text-sm text-gray-700">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/' ? 'text-[#0f2942] font-bold bg-gray-100/80' : 'hover:text-[#0f2942] hover:bg-gray-50'}`}
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('about')} onMouseLeave={() => setActiveDropdown(null)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#0f2942] hover:bg-gray-50 transition-colors">
                <span>About</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              {activeDropdown === 'about' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link to="/about" className="block px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-[#0f2942]">
                    <div className="font-semibold text-sm">About Us</div>
                    <div className="text-xs text-gray-500">Our story & independent agency model</div>
                  </Link>
                  <Link to="/about#team" className="block px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-[#0f2942]">
                    <div className="font-semibold text-sm">Leadership & Agents</div>
                    <div className="text-xs text-gray-500">Meet our experienced leadership team</div>
                  </Link>
                  <Link to="/#reviews" className="block px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-[#0f2942]">
                    <div className="font-semibold text-sm">Customer Reviews</div>
                    <div className="text-xs text-gray-500">Google & Yelp 5-star testimonials</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Insurance Services Mega Dropdown */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('services')} onMouseLeave={() => setActiveDropdown(null)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#0f2942] hover:bg-gray-50 transition-colors">
                <span>Insurance Services</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              {activeDropdown === 'services' && (
                <div className="absolute top-full -left-20 w-[520px] bg-white rounded-xl shadow-xl border border-gray-100 p-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link to="/insurance-services/medicare" className="p-3 rounded-lg hover:bg-blue-50 transition-colors flex gap-3 items-start group/item">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#0f2942] border border-slate-200">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 group-hover/item:text-[#0f2942]">Medicare Solutions</div>
                      <div className="text-xs text-gray-500 mt-0.5">Part C Advantage, Part D, Medigap supplements</div>
                    </div>
                  </Link>

                  <Link to="/insurance-services/health-insurance" className="p-3 rounded-lg hover:bg-blue-50 transition-colors flex gap-3 items-start group/item">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#0f2942] border border-slate-200">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 group-hover/item:text-[#0f2942]">Health Insurance (ACA)</div>
                      <div className="text-xs text-gray-500 mt-0.5">Obamacare marketplace & family healthcare</div>
                    </div>
                  </Link>

                  <Link to="/insurance-services/life-insurance" className="p-3 rounded-lg hover:bg-blue-50 transition-colors flex gap-3 items-start group/item">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#0f2942] border border-slate-200">
                      <Umbrella className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 group-hover/item:text-[#0f2942]">Life & Wealth Protection</div>
                      <div className="text-xs text-gray-500 mt-0.5">Term Life, IUL, Final Expense, Annuities</div>
                    </div>
                  </Link>

                  <Link to="/insurance-services" className="p-3 rounded-lg hover:bg-blue-50 transition-colors flex gap-3 items-start group/item">
                    <div className="p-2 rounded-lg bg-slate-100 text-[#0f2942] border border-slate-200">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 group-hover/item:text-[#0f2942]">View All Products</div>
                      <div className="text-xs text-gray-500 mt-0.5">Disability, Long-Term Care, Group Benefits</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* I Am... Personalized Guidance */}
            <div className="relative group" onMouseEnter={() => setActiveDropdown('iam')} onMouseLeave={() => setActiveDropdown(null)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#0f2942] hover:bg-gray-50 transition-colors">
                <span>I Am...</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              {activeDropdown === 'iam' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link to="/insurance-services/health-insurance#individual" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">
                    <div className="font-semibold text-sm">Single Adult</div>
                    <div className="text-xs text-gray-500">Affordable ACA & Starter Term Life</div>
                  </Link>
                  <Link to="/insurance-services/health-insurance#family" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">
                    <div className="font-semibold text-sm">Married with Children</div>
                    <div className="text-xs text-gray-500">Family health & mortgage protection</div>
                  </Link>
                  <Link to="/insurance-services/medicare" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">
                    <div className="font-semibold text-sm">Senior (65+) / Empty Nester</div>
                    <div className="text-xs text-gray-500">Medicare & Lifetime Annuities</div>
                  </Link>
                  <Link to="/careers" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">
                    <div className="font-semibold text-sm">New or Licensed Agent</div>
                    <div className="text-xs text-gray-500">Join our Bootcamp & Agency</div>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/careers" className="px-3 py-2 rounded-lg hover:text-[#0f2942] hover:bg-gray-50 transition-colors">
              Careers & Bootcamp
            </Link>

            <Link to="/locations" className="px-3 py-2 rounded-lg hover:text-[#0f2942] hover:bg-gray-50 transition-colors">
              Locations
            </Link>

            <Link to="/contact" className="px-3 py-2 rounded-lg hover:text-[#0f2942] hover:bg-gray-50 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href="tel:8336336868"
              className="flex items-center gap-1.5 text-[#0f2942] font-semibold text-sm py-2 px-3 rounded-lg border border-gray-200 hover:border-[#0f2942] transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>(833) 633-6868</span>
            </a>

            <button
              onClick={onOpenQuote}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-lg shadow-md shadow-amber-500/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Get A Free Quote</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onOpenQuote}
              className="bg-amber-500 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg"
            >
              Get Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 px-4 py-6 max-h-[85vh] overflow-y-auto space-y-4">
          <div className="space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-lg font-semibold text-gray-800 hover:bg-gray-50">
              Trang Chủ (Home)
            </Link>
            
            <div className="border-t border-gray-100 pt-3">
              <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Bảo Hiểm (Insurance Products)</div>
              <Link to="/insurance-services/medicare" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium text-sm">
                <ShieldCheck className="w-4 h-4 text-[#0f2942]" />
                <span>Medicare (Part C, D, Medigap)</span>
              </Link>
              <Link to="/insurance-services/health-insurance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium text-sm">
                <HeartPulse className="w-4 h-4 text-[#0f2942]" />
                <span>Health Insurance (ACA / Obamacare)</span>
              </Link>
              <Link to="/insurance-services/life-insurance" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 font-medium text-sm">
                <Umbrella className="w-4 h-4 text-[#0f2942]" />
                <span>Life Insurance &amp; Fixed Annuities</span>
              </Link>
              <Link to="/insurance-services" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 font-semibold text-xs">
                <Layers className="w-4 h-4" />
                <span>Xem Tất Cả Dịch Vụ Bảo Hiểm →</span>
              </Link>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Thông Tin (Company)</div>
              <Link to="/about" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Về Chúng Tôi (About Us)
              </Link>
              <Link to="/careers" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Tuyển Dụng &amp; Insurance Bootcamp
              </Link>
              <Link to="/locations" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Văn Phòng (Katy, Houston, Garland)
              </Link>
              <Link to="/contact" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                Liên Hệ &amp; Hỗ Trợ (Contact)
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <a
              href="tel:8336336868"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl text-center"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Gọi Ngay: (833) 633-6868</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-xl text-center"
            >
              Yêu Cầu Báo Giá Miễn Phí
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
