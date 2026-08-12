import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Calendar, ChevronRight, Sparkle } from 'lucide-react';

export default function MobileNav({ isOpen, onClose, navItems, currentLang }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Prevent background scrolling on mobile when drawer menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] lg:hidden flex justify-end">
      {/* Fullscreen Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Mobile Drawer Container (100dvh guarantees full height on iOS Safari) */}
      <div className="relative z-10 w-[88%] sm:w-[380px] h-screen h-[100dvh] bg-[#FDFBF7] border-l border-[#E7E1D3] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft">
        
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-[#E7E1D3]">
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-normal tracking-tight text-[#2B2B2B]">
                NOURLA
              </span>
              <span className="text-[9px] tracking-[0.25em] font-semibold text-[#6F7255] uppercase">
                Boutique Hotel — Urla
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-[#2B2B2B] hover:bg-[#F7F4EE] hover:text-[#6F7255] transition-colors border border-[#E7E1D3]/50"
              aria-label="Menüyü Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with Generous Touch Padding */}
          <nav className="py-6 flex flex-col space-y-2">
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path || (item.path.endsWith('/urla') && location.pathname.includes('/urla'));
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center justify-between py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isActive
                      ? 'bg-[#6F7255] text-white shadow-md'
                      : 'text-[#2B2B2B]/90 hover:bg-[#F7F4EE] hover:text-[#6F7255]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {isActive && <Sparkle className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />}
                    {item.label}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-white translate-x-1' : 'text-[#6F7255]/40 group-hover:translate-x-1'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer CTA */}
        <div className="pt-6 border-t border-[#E7E1D3] space-y-4">
          <Link
            to={`/${currentLang}/reservation`}
            onClick={onClose}
            className="w-full py-4 px-6 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            {t('nav.reserve')}
          </Link>

          <p className="text-[10px] text-center text-[#555555] font-light">
            Nourla Boutique Hotel © 2026 — Urla, İzmir
          </p>
        </div>
      </div>
    </div>
  );
}
