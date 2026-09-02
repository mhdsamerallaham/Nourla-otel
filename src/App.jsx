import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// ── Code Splitting: Lazy-loaded route components for ultra-fast initial page load ──
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Rooms = lazy(() => import('./pages/Rooms'));
const RoomDetail = lazy(() => import('./pages/RoomDetail'));
const UrlaGuide = lazy(() => import('./pages/UrlaGuide'));
const Sustainability = lazy(() => import('./pages/Sustainability'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Reservation = lazy(() => import('./pages/Reservation'));
const BookingStatus = lazy(() => import('./pages/BookingStatus'));
const TestScrollVideo = lazy(() => import('./pages/TestScrollVideo'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const KVKK = lazy(() => import('./pages/KVKK'));
const DistanceSalesAgreement = lazy(() => import('./pages/DistanceSalesAgreement'));

import StickyPhoneCTA from './components/ui/StickyPhoneCTA';
import StructuredData, { HOTEL_SCHEMA } from './components/ui/StructuredData';
import PageErrorBoundary from './components/ui/PageErrorBoundary';

// Sleek lightweight loading fallback for subpage transitions
function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#6F7255]/20 border-t-[#6F7255] animate-spin" />
        <span className="text-[11px] font-semibold tracking-widest text-[#6F7255] uppercase">
          Yükleniyor...
        </span>
      </div>
    </div>
  );
}

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
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Root redirects to /tr */}
              <Route path="/" element={<Navigate to="/tr" replace />} />

              {/* Payment gateway callback landing — no lang prefix required */}
              <Route path="/booking-status" element={<PageErrorBoundary><BookingStatus /></PageErrorBoundary>} />

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
          </Suspense>
        </main>
        <Footer />
        {/* Mobile-first sticky phone CTA — renders only on mobile (lg:hidden) */}
        <StickyPhoneCTA />
      </div>
    </BrowserRouter>
  );
}
