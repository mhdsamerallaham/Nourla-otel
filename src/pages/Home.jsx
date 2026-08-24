import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Wine, UtensilsCrossed, Sparkles, Calendar, Users, Building, MessageCircle, CheckCircle2 } from 'lucide-react';

import SectionHeader from '../components/ui/SectionHeader';
import RoomCard from '../components/ui/RoomCard';
import LuxuryDatePickerModal from '../components/ui/LuxuryDatePickerModal';
import GuestStories from '../components/ui/GuestStories';
import GuestReviews from '../components/ui/GuestReviews';
import { ROOMS_DATA } from '../data/rooms';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Home() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const currentLang = lang || i18n.language || 'tr';

  // ── SEO / AEO meta tags ─────────────────────────────────
  usePageMeta({
    title: currentLang === 'tr'
      ? 'Urla İzmir Lüks Butik Otel | Zeytin Bahçeleri & Ege Sakinliği'
      : currentLang === 'de'
      ? 'Luxus Boutique Hotel Urla Izmir | Olivenhaine & Ägäische Ruhe'
      : currentLang === 'ru'
      ? 'Бутик-отель Урла Измир | Оливковые рощи и Эгейское спокойствие'
      : 'Luxury Boutique Hotel Urla Izmir | Olive Groves & Aegean Serenity',
    description: currentLang === 'tr'
      ? 'Nourla Boutique Hotel — Urla, İzmir\'de zeytin bahçeleri arasında 10 özel süit. Çiftlikten sofraya kahvaltı, bağ turları ve aromaterapi ile Ege\'nin sakin güzelliğini keşfedin.'
      : 'Nourla Boutique Hotel — 10 bespoke suites in Urla, Izmir, Turkey. Farm-to-table breakfast, vineyard wine tours, and Aegean serenity await.',
    canonical: `/${currentLang}`,
    lang: currentLang,
  });

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getAfterTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrowStr());
  const [checkOut, setCheckOut] = useState(getAfterTomorrowStr());
  const [guests, setGuests] = useState('2');
  const [currency, setCurrency] = useState('TRY');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState('checkIn');

  const openDatePicker = (target = 'checkIn') => {
    setDatePickerTarget(target);
    setIsDatePickerOpen(true);
  };

  const handleSelectDates = (newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleSearchRooms = () => {
    navigate(`/${currentLang}/reservation?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&currency=${currency}&step=2`);
  };

  const featuredRooms = ROOMS_DATA.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* 1. LUXURY HERO PHOTO BANNER */}
      <section className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#2B2B2B]">
        <div className="absolute inset-0 z-0">
          <img
            src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48.jpeg"
            alt="Nourla Boutique Hotel — Urla, İzmir'de tarihi taş konak cephesi ve zeytin bahçesi"
            className="w-full h-full object-cover object-center"
            fetchpriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B] via-[#2B2B2B]/40 to-black/50" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        {/* Hero Title Area */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-32 lg:pt-40 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E7E1D3] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-4 sm:mb-6 shadow-lg">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">{t('hero.badge')}</span>
            <span className="sm:hidden">Nourla — Urla, İzmir</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-normal text-white leading-[1.15] mb-4 sm:mb-6 drop-shadow-md tracking-tight">
            {t('hero.title')}
          </h1>

          <p className="text-xs sm:text-base text-[#F7F4EE]/85 font-light max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed drop-shadow-sm px-2 sm:px-0">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              to={`/${currentLang}/reservation`}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
              aria-label="Nourla Boutique Hotel rezervasyon sayfasına git"
            >
              <Calendar className="w-4 h-4" />
              {t('hero.cta_reserve')}
            </Link>

            <Link
              to={`/${currentLang}/about`}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              aria-label="Nourla Boutique Hotel hakkında daha fazla bilgi"
            >
              {t('hero.cta_discover')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust chips — availability + direct WhatsApp */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Anlık müsaitlik kontrolü
            </span>
            <a
              href="https://wa.me/902327540000"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp ile Nourla concierge ile iletişime geç"
              className="inline-flex items-center gap-1.5 text-[10px] text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              WhatsApp Concierge
            </a>
          </div>
        </div>

        {/* QUICK SEARCH WIDGET */}
        <div className="relative z-20 w-full px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8 max-w-6xl mx-auto">
          <div className="bg-[#FDFBF7]/96 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E7E1D3]/80 shadow-2xl">
            {/* Widget Header */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E7E1D3]/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2B2B2B]">
                  Konaklamanızı Planlayın
                </h3>
              </div>
              <span className="hidden sm:inline text-[10px] font-semibold tracking-[0.15em] uppercase text-[#6F7255] bg-[#6F7255]/10 px-3 py-1 rounded-full">
                Konaklama & Fiyat
              </span>
            </div>

            {/* Widget Inputs — 2-col on mobile, 12-col grid on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3.5">
              {/* Giriş Tarihi */}
              <div
                onClick={() => openDatePicker('checkIn')}
                className="col-span-1 lg:col-span-3 bg-[#F7F4EE] p-3 rounded-xl border border-[#E7E1D3] hover:border-[#6F7255] cursor-pointer transition-all group min-h-[60px] flex flex-col justify-between"
              >
                <label className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6F7255] flex items-center gap-1 cursor-pointer mb-1">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Giriş
                </label>
                <span className="font-serif text-sm sm:text-base font-semibold text-[#2B2B2B] group-hover:text-[#6F7255] transition-colors">
                  {checkIn ? checkIn.split('-').reverse().join('.') : 'Seçin'}
                </span>
              </div>

              {/* Çıkış Tarihi */}
              <div
                onClick={() => openDatePicker('checkOut')}
                className="col-span-1 lg:col-span-3 bg-[#F7F4EE] p-3 rounded-xl border border-[#E7E1D3] hover:border-[#6F7255] cursor-pointer transition-all group min-h-[60px] flex flex-col justify-between"
              >
                <label className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6F7255] flex items-center gap-1 cursor-pointer mb-1">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Çıkış
                </label>
                <span className="font-serif text-sm sm:text-base font-semibold text-[#2B2B2B] group-hover:text-[#6F7255] transition-colors">
                  {checkOut ? checkOut.split('-').reverse().join('.') : 'Seçin'}
                </span>
              </div>

              {/* Misafir */}
              <div className="col-span-1 lg:col-span-2 bg-[#F7F4EE] p-3 rounded-xl border border-[#E7E1D3] min-h-[60px] flex flex-col justify-between">
                <label className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6F7255] flex items-center gap-1 mb-1">
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Misafir
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
                >
                  <option value="1">1 Kişi</option>
                  <option value="2">2 Kişi</option>
                  <option value="3">3 Kişi</option>
                </select>
              </div>

              {/* Para Birimi */}
              <div className="col-span-1 lg:col-span-2 bg-[#F7F4EE] p-3 rounded-xl border border-[#E7E1D3] min-h-[60px] flex flex-col justify-between">
                <label className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#6F7255] flex items-center gap-1 mb-1">
                  <Building className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Para
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
                >
                  <option value="TRY">₺ TRY</option>
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>

              {/* Ara Butonu — tam genişlik mobilde */}
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={handleSearchRooms}
                  className="w-full h-full min-h-[52px] lg:min-h-[60px] rounded-xl bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  Müsait Odalar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
      </section>

      <LuxuryDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        checkIn={checkIn}
        checkOut={checkOut}
        onSelectDates={handleSelectDates}
        currency={currency}
        initialTarget={datePickerTarget}
      />

      {/* 2. LUXURY INTRO SECTION */}
      <section className="py-14 sm:py-20 md:py-28 bg-[#FDFBF7] relative z-10 border-t border-[#E7E1D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Text — always first on mobile */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
                {t('intro.tag')}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#2B2B2B] leading-tight">
                {t('intro.title')}
              </h2>
              <p className="text-sm text-[#555555] font-light leading-relaxed">
                {t('intro.p1')}
              </p>
              <p className="text-sm text-[#555555] font-light leading-relaxed">
                {t('intro.p2')}
              </p>
              <div className="pt-2">
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
                alt="Nourla Boutique Hotel iç avlu — restore edilmiş tarihi taş konak ve Ege mimarisi, Urla İzmir"
                className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xl object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ROOMS SECTION */}
      <section className="py-14 sm:py-20 bg-[#F7F4EE] border-y border-[#E7E1D3] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag={t('featured_rooms.tag')}
            title={t('featured_rooms.title')}
            subtitle={t('featured_rooms.subtitle')}
          />

          {/* MOBILE — compact vertical list */}
          <div className="flex flex-col gap-3 md:hidden">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} compact />
            ))}
          </div>

          {/* TABLET / DESKTOP — 2-col / 3-col grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="mt-8 sm:mt-14 text-center">
            <Link
              to={`/${currentLang}/rooms`}
              className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              {t('featured_rooms.view_all')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE SECTION */}
      <section className="py-14 sm:py-20 md:py-28 bg-[#FDFBF7] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag={t('experience.tag')}
            title={t('experience.title')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Wine className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#2B2B2B] mb-2 sm:mb-3">{t('experience.wine_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">{t('experience.wine_desc')}</p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <UtensilsCrossed className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#2B2B2B] mb-2 sm:mb-3">{t('experience.gastro_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">{t('experience.gastro_desc')}</p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#2B2B2B] mb-2 sm:mb-3">{t('experience.spa_title')}</h3>
              <p className="text-xs text-[#555555] leading-relaxed font-light">{t('experience.spa_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GUEST STORIES / CASE STUDIES */}
      <GuestStories />

      {/* 6. GUEST REVIEWS — social proof + AggregateRating schema */}
      <GuestReviews />

      {/* 7. CTA BANNER */}
      <section className="relative py-14 sm:py-20 bg-[#6F7255] text-white text-center overflow-hidden z-10">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 leading-tight">
            Urla'daki Sakin Sığınağınız Sizi Bekliyor
          </h2>
          <p className="text-xs sm:text-sm text-[#E7E1D3] max-w-lg mx-auto mb-6 sm:mb-8 font-light leading-relaxed">
            Sadece 10 özel süit ile Nourla Boutique Hotel'de unutulmaz bir Akdeniz tatili rezerve edin.
          </p>
          <Link
            to={`/${currentLang}/reservation`}
            className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#E7E1D3] hover:bg-white text-[#2B2B2B] text-xs font-semibold uppercase tracking-widest transition-all shadow-xl active:scale-95"
            aria-label="Nourla Boutique Hotel rezervasyonu için tıkla"
          >
            <Calendar className="w-4 h-4" />
            {t('nav.reserve')}
          </Link>
        </div>
      </section>
    </div>
  );
}
