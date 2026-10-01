import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams } from 'react-router-dom';
import BookingWidget from '../components/ui/BookingWidget';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Reservation() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('room') || '';

  // ── SEO & Open Graph Meta Tags (<60 chars title, <155 chars desc) ──
  usePageMeta({
    title: currentLang === 'tr'
      ? 'Oda Rezervasyonu | Nourla Boutique Hotel Urla'
      : currentLang === 'de'
      ? 'Online-Reservierung | Nourla Boutique Hotel'
      : currentLang === 'ru'
      ? 'Бронирование | Nourla Boutique Hotel Urla'
      : 'Online Reservation | Nourla Boutique Hotel Urla',
    description: currentLang === 'tr'
      ? 'Nourla Boutique Hotel için en uygun fiyat garantisiyle online rezervasyon yapın. 10 özel süit, anında onay ve esnek iptal imkanı.'
      : 'Book directly at Nourla Boutique Hotel with best price guarantee. Instant confirmation and flexible cancellation for 10 bespoke luxury suites.',
    canonical: `/${currentLang}/reservation`,
    lang: currentLang,
  });

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-[#6F7255]"></span>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
              {t('nav.reserve')}
            </span>
            <span className="h-[1px] w-6 bg-[#6F7255]"></span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2B2B2B] leading-tight font-normal">
            {t('reservation.title')}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#555555] max-w-xl mx-auto font-light leading-relaxed">
            {t('reservation.subtitle')}
          </p>
        </header>

        <BookingWidget preselectedRoomId={roomIdFromUrl} />
      </div>
    </div>
  );
}
