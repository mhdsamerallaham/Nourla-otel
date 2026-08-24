import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, MessageCircle, X } from 'lucide-react';

/**
 * StickyPhoneCTA — mobile-only fixed bottom bar with phone + WhatsApp CTAs.
 * Hidden on lg+ breakpoints to not interfere with desktop layout.
 * Auto-hides on reservation/booking pages to avoid blocking reservation buttons.
 * Auto-hides for 24h if user closes it.
 */
export default function StickyPhoneCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Detect if user is in booking flow / reservation page
  const isReservationPage = location.pathname.includes('/reservation') || location.pathname.includes('/booking');

  useEffect(() => {
    // Check if user previously dismissed
    const dismissedAt = localStorage.getItem('nourla_sticky_dismissed');
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }
    // Show after a short delay so it doesn't flash immediately
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('nourla_sticky_dismissed', String(Date.now()));
  };

  if (dismissed || !visible || isReservationPage) return null;

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 animate-slideUp"
      role="complementary"
      aria-label="Hızlı iletişim"
    >
      {/* Gradient fade above the bar */}
      <div className="h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      <div className="bg-[#2B2B2B] border-t border-[#6F7255]/40 px-4 py-3 flex items-center gap-3 shadow-2xl">
        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#E7E1D3]/70 font-light leading-tight">
            Nourla Concierge
          </p>
          <p className="text-xs text-white font-semibold truncate">
            7/24 Rezervasyon & Bilgi
          </p>
        </div>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/902327540000"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="WhatsApp ile iletişim"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-semibold transition-all shadow-md shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        {/* Phone CTA */}
        <a
          href="tel:+902327540000"
          aria-label="Nourla Boutique Hotel'i ara"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6F7255] hover:bg-[#4F523A] active:scale-95 text-white text-[11px] font-semibold transition-all shadow-md shrink-0"
        >
          <Phone className="w-4 h-4" />
          Ara
        </a>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Kapat"
          className="p-1.5 rounded-lg text-[#E7E1D3]/50 hover:text-white transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
