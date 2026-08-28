import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Compass, MessageCircle } from 'lucide-react';

export default function Footer() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <footer className="bg-[#2B2B2B] text-[#E7E1D3] pt-10 sm:pt-16 pb-6 sm:pb-10 border-t border-[#4F523A]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-10 sm:pb-14 border-b border-[#E7E1D3]/15">
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
            <ul className="space-y-3.5 text-xs text-[#E7E1D3]/80 font-light">
              <li>
                <a
                  href="https://maps.app.goo.gl/5G7yaqk8hH6MBCN4A"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-2.5 hover:text-[#6F7255] transition-colors group"
                  aria-label="Google Maps'te Nourla Boutique Hotel adresini aç"
                >
                  <MapPin className="w-4 h-4 text-[#6F7255] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">İskele Mahallesi 2222/5 Sokak No: 4/1</span>,{' '}
                    <span itemProp="addressLocality">Urla</span> /{' '}
                    <span itemProp="addressRegion">İzmir</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+902327540000"
                  className="flex items-center gap-2.5 hover:text-[#6F7255] transition-colors group"
                  aria-label="Nourla Boutique Hotel'i doğrudan ara"
                  itemProp="telephone"
                >
                  <Phone className="w-4 h-4 text-[#6F7255] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+90 232 754 00 00</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@nourla.com.tr"
                  className="flex items-center gap-2.5 hover:text-[#6F7255] transition-colors group"
                  aria-label="Nourla Boutique Hotel'e e-posta gönder"
                  itemProp="email"
                >
                  <Mail className="w-4 h-4 text-[#6F7255] shrink-0 group-hover:scale-110 transition-transform" />
                  <span>info@nourla.com.tr</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E7E1D3]/50 font-light gap-4">
          <p>© {new Date().getFullYear()} Nourla Boutique Hotel. {t('footer.rights')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={`/${currentLang}/privacy-policy`}
              className="hover:text-[#6F7255] transition-colors"
              aria-label="Gizlilik Politikası"
            >
              Gizlilik Politikası
            </Link>
            <span className="text-[#E7E1D3]/20">•</span>
            <Link
              to={`/${currentLang}/kvkk`}
              className="hover:text-[#6F7255] transition-colors"
              aria-label="KVKK Aydınlatma Metni"
            >
              KVKK Aydınlatma Metni
            </Link>
            <span className="text-[#E7E1D3]/20">•</span>
            <Link
              to={`/${currentLang}/mesafeli-satis-sozlesmesi`}
              className="hover:text-[#6F7255] transition-colors"
              aria-label="Mesafeli Satış Sözleşmesi"
            >
              Mesafeli Satış Sözleşmesi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
