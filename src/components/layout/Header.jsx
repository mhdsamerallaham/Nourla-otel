import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Menu, Calendar } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import MobileNav from './MobileNav';

export default function Header() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLang = lang || i18n.language || 'tr';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('nav.home'), path: `/${currentLang}` },
    { label: t('nav.about'), path: `/${currentLang}/about` },
    { label: t('nav.rooms'), path: `/${currentLang}/rooms` },
    { label: t('nav.urla'), path: `/${currentLang}/urla` },
    { label: t('nav.sustainability'), path: `/${currentLang}/sustainability` },
    { label: t('nav.gallery'), path: `/${currentLang}/gallery` },
    { label: t('nav.contact'), path: `/${currentLang}/contact` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-header py-3 border-b border-[#E7E1D3]/80 shadow-xs'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          
          {/* Brand Logo */}
          <Link to={`/${currentLang}`} className="flex items-center gap-2 group shrink-0">
            <div className="flex flex-col">
              <span className={`font-serif text-lg sm:text-xl xl:text-2xl font-medium tracking-tight transition-colors group-hover:text-[#6F7255] ${
                scrolled ? 'text-[#2B2B2B]' : 'text-white drop-shadow-md'
              }`}>
                NOURLA
              </span>
              <span className={`text-[8px] xl:text-[9px] tracking-[0.25em] font-semibold uppercase transition-colors ${
                scrolled ? 'text-[#6F7255]' : 'text-[#E7E1D3]'
              }`}>
                Boutique Hotel — Urla
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Responsive Spacing */}
          <nav className="hidden lg:flex items-center gap-2 lg:gap-2.5 xl:gap-5 2xl:gap-7">
            {navItems.map((item, idx) => {
              const isActive =
                location.pathname === item.path ||
                (item.path.endsWith('/urla') && location.pathname.includes('/urla')) ||
                (item.path.endsWith('/sustainability') && location.pathname.includes('/sustainability'));

              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`whitespace-nowrap text-[10px] lg:text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest font-semibold transition-colors relative py-1.5 px-1 ${
                    isActive
                      ? 'text-[#6F7255]'
                      : scrolled
                      ? 'text-[#2B2B2B]/85 hover:text-[#6F7255]'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6F7255] rounded-full animate-fadeIn" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls (Language Switcher & CTA) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
            <LanguageSwitcher />

            <Link
              to={`/${currentLang}/reservation`}
              className="px-3.5 py-2 xl:px-5 xl:py-2.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-[11px] xl:text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 xl:gap-2 transition-all shadow-xs hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              {t('nav.reserve')}
            </Link>
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 rounded-xl transition-all shadow-xs active:scale-95 ${
                scrolled
                  ? 'text-[#2B2B2B] bg-[#F7F4EE]/90 border border-[#E7E1D3] hover:text-[#6F7255]'
                  : 'text-white bg-white/15 border border-white/20 backdrop-blur-sm hover:bg-white/25'
              }`}
              aria-label="Menüyü Aç"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Z-[999] Overlay) */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        currentLang={currentLang}
      />
    </header>
  );
}
