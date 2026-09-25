import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Auth
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuoteModal from './components/QuoteModal';
import MobileBottomBar from './components/MobileBottomBar';
import CookieBanner from './components/CookieBanner';

// Public Pages
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

// Auth Pages
import LoginPage from './pages/LoginPage';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import AgentDashboard from './pages/dashboard/AgentDashboard';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout wrapper for public pages (with Navbar/Footer)
function PublicLayout({ onOpenQuote, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar onOpenQuote={onOpenQuote} />
      <main className="flex-grow pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomBar onOpenQuote={onOpenQuote} />
      <CookieBanner />
    </div>
  );
}

function PublicRoutes() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const handleOpenQuote = () => setIsQuoteOpen(true);
  const handleCloseQuote = () => setIsQuoteOpen(false);

  return (
    <>
      <PublicLayout onOpenQuote={handleOpenQuote}>
        <Routes>
          <Route path="/" element={<HomePage onOpenQuote={handleOpenQuote} />} />
          <Route path="/about" element={<AboutPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/about-us" element={<AboutPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/insurance-services" element={<ServicesPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/insurance-services/medicare" element={<MedicarePage onOpenQuote={handleOpenQuote} />} />
          <Route path="/insurance-services/health-insurance" element={<HealthPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/insurance-services/life-insurance" element={<LifePage onOpenQuote={handleOpenQuote} />} />
          <Route path="/insurance-services/group-benefits" element={<ServicesPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/locations" element={<LocationsPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/locations/:officeId" element={<LocationsPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/careers" element={<CareersPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/contact" element={<ContactPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/secure-contact-form" element={<ContactPage onOpenQuote={handleOpenQuote} />} />
          <Route path="/get-quote" element={<QuotePage onOpenQuote={handleOpenQuote} />} />
          <Route path="/secure-quote-request" element={<QuotePage onOpenQuote={handleOpenQuote} />} />
          <Route path="/privacy" element={<HomePage onOpenQuote={handleOpenQuote} />} />
          <Route path="/terms" element={<HomePage onOpenQuote={handleOpenQuote} />} />
          <Route path="*" element={<HomePage onOpenQuote={handleOpenQuote} />} />
        </Routes>
      </PublicLayout>
      <QuoteModal isOpen={isQuoteOpen} onClose={handleCloseQuote} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* ── Auth ─────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ── Dashboards (protected) ───────────────────── */}
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/*"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agent/*"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          {/* Generic /dashboard → redirect to role-specific */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />

          {/* ── Public Pages ─────────────────────────────── */}
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
