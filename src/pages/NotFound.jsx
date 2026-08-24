import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, Calendar, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4 py-24 text-center">
      {/* Decorative number */}
      <div className="relative mb-8 select-none">
        <span
          className="font-serif text-[160px] sm:text-[220px] font-normal text-[#E7E1D3] leading-none tracking-tighter"
          aria-hidden="true"
        >
          404
        </span>
        {/* Olive overlay icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-7xl" role="img" aria-label="Zeytin">🫒</span>
        </div>
      </div>

      {/* Label */}
      <span className="text-[11px] font-semibold tracking-[0.3em] text-[#6F7255] uppercase mb-4 block">
        Sayfa Bulunamadı
      </span>

      <h1 className="font-serif text-2xl sm:text-4xl text-[#2B2B2B] leading-tight mb-4 max-w-lg">
        Bu sayfa artık Nourla'da konaklamamıyor
      </h1>

      <p className="text-sm text-[#555555] font-light leading-relaxed max-w-md mb-8">
        Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        Sizi doğru yere götürelim.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          to={`/${currentLang}`}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-95"
          aria-label="Ana sayfaya dön"
        >
          <Home className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        <Link
          to={`/${currentLang}/reservation`}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F7F4EE] hover:bg-[#E7E1D3] text-[#2B2B2B] border border-[#E7E1D3] text-xs font-semibold uppercase tracking-widest transition-all active:scale-95"
          aria-label="Rezervasyon yap"
        >
          <Calendar className="w-4 h-4" />
          Rezervasyon Yap
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg w-full">
        {[
          { label: 'Odalarımız', to: `/${currentLang}/rooms` },
          { label: 'Hakkımızda', to: `/${currentLang}/about` },
          { label: 'İletişim', to: `/${currentLang}/contact` },
          { label: 'Galeri', to: `/${currentLang}/gallery` },
          { label: 'Urla Rehberi', to: `/${currentLang}/urla` },
          { label: 'Sürdürülebilirlik', to: `/${currentLang}/sustainability` },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-center justify-between px-4 py-3 rounded-xl bg-[#F7F4EE] border border-[#E7E1D3] text-xs text-[#2B2B2B] font-medium hover:border-[#6F7255] hover:text-[#6F7255] transition-all"
          >
            {link.label}
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
