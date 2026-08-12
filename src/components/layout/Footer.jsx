import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Compass } from 'lucide-react';

export default function Footer() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <footer className="bg-[#2B2B2B] text-[#E7E1D3] pt-16 pb-10 border-t border-[#4F523A]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-[#E7E1D3]/15">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="font-serif text-2xl font-normal tracking-wide text-white">NOURLA</span>
            </div>
            <p className="text-xs text-[#E7E1D3]/70 leading-relaxed mb-6 font-light">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-3 text-[#E7E1D3]">
              <a href="#instagram" className="w-8 h-8 rounded-full border border-[#E7E1D3]/30 flex items-center justify-center hover:bg-[#6F7255] hover:border-[#6F7255] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#facebook" className="w-8 h-8 rounded-full border border-[#E7E1D3]/30 flex items-center justify-center hover:bg-[#6F7255] hover:border-[#6F7255] transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">{t('footer.quick_links')}</h4>
            <ul className="space-y-2.5 text-xs text-[#E7E1D3]/80 font-light">
              <li><Link to={`/${currentLang}`} className="hover:text-[#6F7255] transition-colors">{t('nav.home')}</Link></li>
              <li><Link to={`/${currentLang}/about`} className="hover:text-[#6F7255] transition-colors">{t('nav.about')}</Link></li>
              <li><Link to={`/${currentLang}/rooms`} className="hover:text-[#6F7255] transition-colors">{t('nav.rooms')}</Link></li>
              <li><Link to={`/${currentLang}/urla`} className="hover:text-[#6F7255] transition-colors">{t('nav.urla')}</Link></li>
              <li><Link to={`/${currentLang}/sustainability`} className="hover:text-[#6F7255] transition-colors">{t('nav.sustainability')}</Link></li>
              <li><Link to={`/${currentLang}/gallery`} className="hover:text-[#6F7255] transition-colors">{t('nav.gallery')}</Link></li>
            </ul>
          </div>

          {/* Urla Subpages Navigation */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">{t('urla_section.title')}</h4>
            <ul className="space-y-2 text-xs text-[#E7E1D3]/70 font-light">
              <li><Link to={`/${currentLang}/urla/urla-tarihi`} className="hover:text-[#6F7255] transition-colors">{t('urla_section.history')}</Link></li>
              <li><Link to={`/${currentLang}/urla/yakin-plajlar`} className="hover:text-[#6F7255] transition-colors">{t('urla_section.beaches')}</Link></li>
              <li><Link to={`/${currentLang}/urla/kulturel-ziyaretler`} className="hover:text-[#6F7255] transition-colors">{t('urla_section.culture')}</Link></li>
              <li><Link to={`/${currentLang}/urla/bagcilik`} className="hover:text-[#6F7255] transition-colors">{t('urla_section.wine')}</Link></li>
              <li><Link to={`/${currentLang}/urla/gastronomi`} className="hover:text-[#6F7255] transition-colors">{t('urla_section.gastronomy')}</Link></li>
              <li><Link to={`/${currentLang}/urla/bisiklet-rotalari`} className="hover:text-[#6F7255] transition-colors">{t('urla_section.cycling')}</Link></li>
            </ul>
          </div>

          {/* Contact Direct Info */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">{t('contact.title')}</h4>
            <ul className="space-y-3 text-xs text-[#E7E1D3]/80 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#6F7255] shrink-0 mt-0.5" />
                <span>{t('contact.address_val')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#6F7255] shrink-0" />
                <span>+90 232 754 00 00</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#6F7255] shrink-0" />
                <span>stay@nourlahotel.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E7E1D3]/50 font-light gap-4">
          <p>© {new Date().getFullYear()} Nourla Boutique Hotel. {t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#6F7255]" />
            {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
