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
import BackgroundMusic from './components/ui/BackgroundMusic';

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
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="rooms/:roomId" element={<RoomDetail />} />
                    <Route path="urla" element={<UrlaGuide />} />
                    <Route path="urla/:topicSlug" element={<UrlaGuide />} />
                    <Route path="sustainability" element={<Sustainability />} />
                    <Route path="sustainability/:sectionSlug" element={<Sustainability />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="reservation" element={<Reservation />} />
                    <Route path="booking-status" element={<BookingStatus />} />
                    <Route path="test-scroll-video" element={<TestScrollVideo />} />
                    <Route path="*" element={<Navigate to="/tr" replace />} />
                  </Routes>
                </LanguageSyncWrapper>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/tr" replace />} />
          </Routes>
        </main>
        <Footer />
        <BackgroundMusic />
      </div>
    </BrowserRouter>
  );
}
