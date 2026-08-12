import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Wine, UtensilsCrossed, Sparkles, Calendar } from 'lucide-react';

import ScrollAnimation from '../components/ui/ScrollAnimation';
import PageLoader from '../components/ui/PageLoader';
import SectionHeader from '../components/ui/SectionHeader';
import RoomCard from '../components/ui/RoomCard';
import { ROOMS_DATA } from '../data/rooms';
import { useFrameLoader } from '../hooks/useFrameLoader';

export default function Home() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  const { loadedRatio, isInitialLoaded } = useFrameLoader({ totalFrames: 300 });

  const featuredRooms = ROOMS_DATA.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* 0. LUXURY STORY PAGE PRELOADER */}
      <PageLoader
        progress={loadedRatio}
        isReady={isInitialLoaded && loadedRatio >= 0.25}
      />

      {/* 1. APPLE-STYLE SCROLL CANVAS HERO ANIMATION */}
      <ScrollAnimation
        totalFrames={300}
        scrollMultiplier={5}
        debugMode={false}
        overlayText={true}
      />

      {/* 2. LUXURY INTRO SECTION */}
      <section className="py-24 md:py-32 bg-[#FDFBF7] relative z-10 border-t border-[#E7E1D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
                {t('intro.tag')}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#2B2B2B] leading-tight">
                {t('intro.title')}
              </h2>
              <p className="text-sm md:text-base text-[#555555] font-light leading-relaxed">
                {t('intro.p1')}
              </p>
              <p className="text-sm md:text-base text-[#555555] font-light leading-relaxed">
                {t('intro.p2')}
              </p>
              <div className="pt-4">
                <Link
                  to={`/${currentLang}/about`}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F7255] border-b border-[#6F7255] pb-1 hover:text-[#4F523A] transition-colors"
                >
                  {t('nav.about')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <img
                src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (5).jpeg"
                alt="Historical Stone Manor Architecture"
                className="w-full h-auto rounded-lg shadow-2xl object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ROOMS SECTION */}
      <section className="py-24 bg-[#F7F4EE] border-y border-[#E7E1D3] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag={t('featured_rooms.tag')}
            title={t('featured_rooms.title')}
            subtitle={t('featured_rooms.subtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to={`/${currentLang}/rooms`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md"
            >
              {t('featured_rooms.view_all')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE SECTION */}
      <section className="py-24 md:py-32 bg-[#FDFBF7] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag={t('experience.tag')}
            title={t('experience.title')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="p-8 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-6">
                <Wine className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B] mb-3">{t('experience.wine_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">{t('experience.wine_desc')}</p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B] mb-3">{t('experience.gastro_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">{t('experience.gastro_desc')}</p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B] mb-3">{t('experience.spa_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">{t('experience.spa_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="relative py-20 bg-[#6F7255] text-white text-center overflow-hidden z-10">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl sm:text-5xl mb-6 leading-tight">
            Urla'daki Sakin Sığınağınız Sizi Bekliyor
          </h2>
          <p className="text-xs sm:text-sm text-[#E7E1D3] max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Sadece 10 özel süit ile Nourla Boutique Hotel'de unutulmaz bir Akdeniz tatili rezerve edin.
          </p>
          <Link
            to={`/${currentLang}/reservation`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E7E1D3] hover:bg-white text-[#2B2B2B] text-xs font-semibold uppercase tracking-widest transition-all shadow-xl"
          >
            <Calendar className="w-4 h-4" />
            {t('nav.reserve')}
          </Link>
        </div>
      </section>
    </div>
  );
}
