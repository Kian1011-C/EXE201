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
function PublicLayout({ children }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar onOpenQuote={() => setIsQuoteOpen(true)} />

      <main className="flex-grow pb-16 sm:pb-0">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { onOpenQuote: () => setIsQuoteOpen(true) })
            : child
        )}
      </main>

      <Footer />

      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
      <MobileBottomBar onOpenQuote={() => setIsQuoteOpen(true)} />
      <CookieBanner />
    </div>
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
            path="/dashboard/admin"
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
            path="/dashboard/agent"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          {/* Generic /dashboard → redirect to role-specific */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />

          {/* ── Public Pages ─────────────────────────────── */}
          <Route
            path="/*"
            element={
              <PublicLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/about-us" element={<AboutPage />} />
                  <Route path="/insurance-services" element={<ServicesPage />} />
                  <Route path="/insurance-services/medicare" element={<MedicarePage />} />
                  <Route path="/insurance-services/health-insurance" element={<HealthPage />} />
                  <Route path="/insurance-services/life-insurance" element={<LifePage />} />
                  <Route path="/insurance-services/group-benefits" element={<ServicesPage />} />
                  <Route path="/locations" element={<LocationsPage />} />
                  <Route path="/locations/:officeId" element={<LocationsPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/secure-contact-form" element={<ContactPage />} />
                  <Route path="/get-quote" element={<QuotePage />} />
                  <Route path="/secure-quote-request" element={<QuotePage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </PublicLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
