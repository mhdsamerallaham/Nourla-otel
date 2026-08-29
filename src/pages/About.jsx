import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Wind, Leaf, Utensils } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export default function About() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  usePageMeta({
    title: currentLang === 'tr'
      ? 'Hakkımızda | Nourla Boutique Hotel — Urla İzmir\'in Lavüks Butik Oteli'
      : currentLang === 'de'
      ? 'Über Uns | Nourla Boutique Hotel Urla İzmir'
      : currentLang === 'ru'
      ? 'О нас | Nourla Boutique Hotel Урла Измир'
      : 'About Us | Nourla Boutique Hotel — Luxury in Urla Izmir',
    description: currentLang === 'tr'
      ? 'Nourla Boutique Hotel, Urla\'nın tarihi taş mimarisi ve antik zeytin bahçeleri arasında restore edilmiş bir hanımdır. Hikayemizi, felsefemizi ve Ege\'nin ruhunu keşfedin.'
      : 'Nourla Boutique Hotel was born in Urla\'s ancient olive groves. Discover our philosophy of restorative luxury, farm-to-table gastronomy and Aegean heritage.',
    canonical: `/${currentLang}/about`,
    lang: currentLang,
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* ─── HERO BANNER ─── */}
      <section className="relative h-[55vh] sm:h-[70vh] overflow-hidden">
        <img
          src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48.jpeg"
          alt="Nourla Boutique Hotel — Urla İzmir'de restore edilmiş tarihi taş konak dış cephesi, Akdeniz mimarisi"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#FDFBF7]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] text-[#E7E1D3]/80 uppercase mb-4">
            {t('about.hero_tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight drop-shadow-lg max-w-3xl">
            {t('about.hero_title')}
          </h1>
        </div>
      </section>

      {/* ─── BÖLÜM 1: KİM BİZ ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[#6F7255]" />
              <span className="text-[10px] font-semibold tracking-[0.3em] text-[#6F7255] uppercase">{t('about.who_tag')}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2B2B2B] leading-snug">
              {t('about.who_title')}
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#555555] font-light leading-[1.9]">
              <p>{t('about.who_p1')}</p>
              <p className="text-[#6F7255] font-medium italic font-serif text-base sm:text-lg">
                {t('about.who_quote')}
              </p>
              <p>{t('about.who_p2')}</p>
              <p>{t('about.who_p3')}</p>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.47 (5).jpeg"
              alt="NoUrla — Taş Mimari"
              className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-28 sm:w-36 h-28 sm:h-36 rounded-2xl overflow-hidden border-4 border-[#FDFBF7] shadow-xl">
              <img
                src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (2).jpeg"
                alt="Detay"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FULL-WIDTH QUOTE ─── */}
      <section className="bg-[#2B2B2B] py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Wind className="w-8 h-8 text-[#6F7255] mx-auto mb-6 opacity-70" />
          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-relaxed">
            {t('about.blockquote')}
          </blockquote>
          <p className="mt-6 text-sm text-[#E7E1D3]/70 font-light max-w-2xl mx-auto leading-relaxed">
            {t('about.blockquote_sub')}
          </p>
        </div>
      </section>

      {/* ─── BÖLÜM 2: MUTFAK ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative">
            <img
              src="/nourla/lobi/WhatsApp Image 2026-07-23 at 18.43.57 (3).jpeg"
              alt="NoUrla — Mutfak"
              className="w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute top-4 right-4 bg-[#6F7255]/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase shadow">
              {t('about.kitchen_badge')}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-7">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[#6F7255]" />
              <span className="text-[10px] font-semibold tracking-[0.3em] text-[#6F7255] uppercase">{t('about.kitchen_tag')}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2B2B2B] leading-snug">
              {t('about.kitchen_title')}
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#555555] font-light leading-[1.9]">
              <p>{t('about.kitchen_p1')}</p>
              <p>{t('about.kitchen_p2')}</p>
              <p className="text-[#6F7255] font-medium italic font-serif text-base sm:text-lg">
                {t('about.kitchen_quote')}
              </p>
              <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
                {t('about.kitchen_sub')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BÖLÜM 3: 3'lü DEĞER BLOK ─── */}
      <section className="bg-[#F7F4EE] border-y border-[#E7E1D3] py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">

            <div className="text-center space-y-3 p-6 sm:p-8 rounded-2xl bg-[#FDFBF7] border border-[#E7E1D3]">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 flex items-center justify-center mx-auto">
                <Leaf className="w-5 h-5 text-[#6F7255]" />
              </div>
              <h3 className="font-serif text-lg text-[#2B2B2B]">{t('about.value1_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                {t('about.value1_desc')}
              </p>
            </div>

            <div className="text-center space-y-3 p-6 sm:p-8 rounded-2xl bg-[#FDFBF7] border border-[#E7E1D3]">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 flex items-center justify-center mx-auto">
                <Wind className="w-5 h-5 text-[#6F7255]" />
              </div>
              <h3 className="font-serif text-lg text-[#2B2B2B]">{t('about.value2_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                {t('about.value2_desc')}
              </p>
            </div>

            <div className="text-center space-y-3 p-6 sm:p-8 rounded-2xl bg-[#FDFBF7] border border-[#E7E1D3]">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 flex items-center justify-center mx-auto">
                <Utensils className="w-5 h-5 text-[#6F7255]" />
              </div>
              <h3 className="font-serif text-lg text-[#2B2B2B]">{t('about.value3_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                {t('about.value3_desc')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── BÖLÜM 4: DENEYIM + FOTOĞRAF GRİD ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-5 sm:space-y-7">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[#6F7255]" />
              <span className="text-[10px] font-semibold tracking-[0.3em] text-[#6F7255] uppercase">{t('about.exp_tag')}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2B2B2B] leading-snug">
              {t('about.exp_title')}
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#555555] font-light leading-[1.9]">
              <p>{t('about.exp_p1')}</p>
              <p>{t('about.exp_p2')}</p>
              <p className="text-[#6F7255] font-medium italic font-serif text-base sm:text-lg">
                {t('about.exp_quote')}
              </p>
            </div>
          </div>

          {/* 2x2 Fotoğraf Grid */}
          <div className="grid grid-cols-2 gap-3">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (1).jpeg"
              alt="NoUrla detay 1"
              className="rounded-xl aspect-square object-cover shadow-md"
            />
            <img
              src="/nourla/lobi/WhatsApp Image 2026-07-23 at 18.43.57 (1).jpeg"
              alt="NoUrla detay 2"
              className="rounded-xl aspect-square object-cover shadow-md mt-6"
            />
            <img
              src="/nourla/lobi/WhatsApp Image 2026-07-23 at 18.43.57 (4).jpeg"
              alt="NoUrla detay 3"
              className="rounded-xl aspect-square object-cover shadow-md -mt-6"
            />
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (3).jpeg"
              alt="NoUrla detay 4"
              className="rounded-xl aspect-square object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      {/* ─── SON KAPANIŞ QUOTE ─── */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <img
          src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (5).jpeg"
          alt="NoUrla arka plan"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/80 to-[#2B2B2B]/90" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-6">
          <p className="text-[#E7E1D3]/70 text-xs font-semibold tracking-[0.3em] uppercase">{t('about.closing_tag')}</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-relaxed whitespace-pre-line">
            {t('about.closing_h2')}
          </h2>
          <div className="pt-4">
            <p className="font-serif text-xl sm:text-2xl text-[#6F7255] italic">
              {t('about.closing_quote')}
            </p>
          </div>
          <div className="pt-6">
            <Link
              to={`/${currentLang}/reservation`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              {t('about.reserve_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
