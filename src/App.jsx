import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import UrlaGuide from './pages/UrlaGuide';
import Sustainability from './pages/Sustainability';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Reservation from './pages/Reservation';
import BookingStatus from './pages/BookingStatus';
import TestScrollVideo from './pages/TestScrollVideo';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import KVKK from './pages/KVKK';
import DistanceSalesAgreement from './pages/DistanceSalesAgreement';

import StickyPhoneCTA from './components/ui/StickyPhoneCTA';
import StructuredData, { HOTEL_SCHEMA } from './components/ui/StructuredData';
import PageErrorBoundary from './components/ui/PageErrorBoundary';

// Synchronize i18n language with URL path parameter
function LanguageSyncWrapper({ children }) {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ['tr', 'en', 'de', 'ru'].includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang, i18n]);

  return children;
}

// Auto scroll to top on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Global LodgingBusiness JSON-LD schema — present on every page */}
      <StructuredData id="jsonld-hotel-global" schema={HOTEL_SCHEMA} />
      <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#2B2B2B]">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Root redirects to /tr */}
            <Route path="/" element={<Navigate to="/tr" replace />} />

            {/* Payment gateway callback landing — no lang prefix required */}
            <Route path="/booking-status" element={<BookingStatus />} />

            {/* Multi-language routes */}
            <Route
              path="/:lang/*"
              element={
                <LanguageSyncWrapper>
                  <Routes>
                    <Route index element={<PageErrorBoundary><Home /></PageErrorBoundary>} />
                    <Route path="about" element={<PageErrorBoundary><About /></PageErrorBoundary>} />
                    <Route path="rooms" element={<PageErrorBoundary><Rooms /></PageErrorBoundary>} />
                    <Route path="rooms/:roomId" element={<PageErrorBoundary><RoomDetail /></PageErrorBoundary>} />
                    <Route path="urla" element={<PageErrorBoundary><UrlaGuide /></PageErrorBoundary>} />
                    <Route path="urla/:topicSlug" element={<PageErrorBoundary><UrlaGuide /></PageErrorBoundary>} />
                    <Route path="sustainability" element={<PageErrorBoundary><Sustainability /></PageErrorBoundary>} />
                    <Route path="sustainability/:sectionSlug" element={<PageErrorBoundary><Sustainability /></PageErrorBoundary>} />
                    <Route path="gallery" element={<PageErrorBoundary><Gallery /></PageErrorBoundary>} />
                    <Route path="contact" element={<PageErrorBoundary><Contact /></PageErrorBoundary>} />
                    <Route path="reservation" element={<PageErrorBoundary><Reservation /></PageErrorBoundary>} />
                    <Route path="booking-status" element={<PageErrorBoundary><BookingStatus /></PageErrorBoundary>} />
                    <Route path="test-scroll-video" element={<PageErrorBoundary><TestScrollVideo /></PageErrorBoundary>} />
                    <Route path="privacy-policy" element={<PageErrorBoundary><PrivacyPolicy /></PageErrorBoundary>} />
                    <Route path="kvkk" element={<PageErrorBoundary><KVKK /></PageErrorBoundary>} />
                    <Route path="kvkk-aydinlatma-metni" element={<PageErrorBoundary><KVKK /></PageErrorBoundary>} />
                    <Route path="mesafeli-satis-sozlesmesi" element={<PageErrorBoundary><DistanceSalesAgreement /></PageErrorBoundary>} />
                    <Route path="distance-sales-agreement" element={<PageErrorBoundary><DistanceSalesAgreement /></PageErrorBoundary>} />
                    {/* 404 — branded not-found page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </LanguageSyncWrapper>
              }
            />

            {/* Fallback — also shows branded 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        {/* Mobile-first sticky phone CTA — renders only on mobile (lg:hidden) */}
        <StickyPhoneCTA />
      </div>
    </BrowserRouter>
  );
}
