import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuoteModal from './components/QuoteModal';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import MedicarePage from './pages/MedicarePage';
import HealthPage from './pages/HealthPage';
import LifePage from './pages/LifePage';
import LocationsPage from './pages/LocationsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import QuotePage from './pages/QuotePage';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans selection:bg-amber-500 selection:text-slate-950">
        <Navbar onOpenQuote={() => setIsQuoteOpen(true)} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/about" element={<AboutPage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/about-us" element={<AboutPage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            
            {/* Services Routes */}
            <Route path="/insurance-services" element={<ServicesPage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/insurance-services/medicare" element={<MedicarePage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/insurance-services/health-insurance" element={<HealthPage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/insurance-services/life-insurance" element={<LifePage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/insurance-services/group-benefits" element={<ServicesPage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            
            {/* Locations */}
            <Route path="/locations" element={<LocationsPage onOpenQuote={() => setIsQuoteOpen(true)} />} />
            <Route path="/locations/:officeId" element={<LocationsPage onOpenQuote={() => setIsQuoteOpen(true)} />} />

            {/* Careers / Bootcamp */}
            <Route path="/careers" element={<CareersPage />} />

            {/* Contact & Quote */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/secure-contact-form" element={<ContactPage />} />
            <Route path="/get-quote" element={<QuotePage />} />
            <Route path="/secure-quote-request" element={<QuotePage />} />

            {/* Fallback */}
            <Route path="*" element={<HomePage onOpenQuote={() => setIsQuoteOpen(true)} />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Quote Request Modal */}
        <QuoteModal 
          isOpen={isQuoteOpen} 
          onClose={() => setIsQuoteOpen(false)} 
        />
      </div>
    </BrowserRouter>
  );
}
