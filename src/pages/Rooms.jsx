import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import RoomCard from '../components/ui/RoomCard';
import { ROOMS_DATA } from '../data/rooms';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Rooms() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';
  const [priceFilter, setPriceFilter] = useState('all');

  // ── SEO & Open Graph Meta Tags (<60 chars title, <155 chars desc) ──
  usePageMeta({
    title: currentLang === 'tr'
      ? 'Lüks Odalar ve Süitler | Nourla Boutique Hotel'
      : currentLang === 'de'
      ? 'Luxus-Zimmer & Suiten | Nourla Boutique Hotel'
      : currentLang === 'ru'
      ? 'Номера и Люксы | Nourla Boutique Hotel'
      : 'Luxury Rooms & Suites | Nourla Boutique Hotel',
    description: currentLang === 'tr'
      ? 'Nourla Boutique Hotel\'in Urla zeytin bahçeleri manzaralı 10 özel lüks süitini keşfedin. Geniş balkonlar, jakuzi ve Ege huzuru.'
      : currentLang === 'de'
      ? 'Entdecken Sie 10 luxuriöse Suiten im Nourla Boutique Hotel in Urla. Private Balkone, Steinarchitektur und Olivenhaine.'
      : currentLang === 'ru'
      ? 'Откройте для себя 10 роскошных люксов в Nourla Boutique Hotel в Урле. Балконы, каменные интерьеры и эгейский покой.'
      : 'Discover 10 bespoke luxury suites at Nourla Boutique Hotel in Urla, Izmir. Private balconies, handcrafted stone interiors & serene gardens.',
    canonical: `/${currentLang}/rooms`,
    lang: currentLang,
  });

  const filteredRooms = ROOMS_DATA.filter((room) => {
    if (priceFilter === 'under-450') return room.price <= 450;
    if (priceFilter === '450-600') return room.price > 450 && room.price <= 600;
    if (priceFilter === 'above-600') return room.price > 600;
    return true;
  });

  return (
    <div className="pt-20 sm:pt-28 pb-14 sm:pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Semantic H1 Header */}
        <header className="mb-8 sm:mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-[#6F7255]"></span>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
              {t('nav.rooms')}
            </span>
            <span className="h-[1px] w-6 bg-[#6F7255]"></span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#2B2B2B] leading-tight tracking-tight font-normal">
            {currentLang === 'tr'
              ? 'Nourla Boutique Hotel Süitleri ve Konaklama Seçenekleri'
              : 'Nourla Boutique Hotel Luxury Suites & Accommodations'}
          </h1>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-[#555555] max-w-2xl mx-auto font-light leading-relaxed">
            {t('featured_rooms.subtitle')}
          </p>
        </header>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 sm:mb-12 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          <button
            onClick={() => setPriceFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              priceFilter === 'all'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_all')}
          </button>

          <button
            onClick={() => setPriceFilter('under-450')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              priceFilter === 'under-450'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_budget')}
          </button>

          <button
            onClick={() => setPriceFilter('450-600')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              priceFilter === '450-600'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_mid')}
          </button>

          <button
            onClick={() => setPriceFilter('above-600')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              priceFilter === 'above-600'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_luxury')}
          </button>
        </div>

        {/* 10 Rooms Grid */}
        <section aria-label="Süit Listesi" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </section>

        {/* GEO: High-Density Structured Room Specifications Table for AI Citation */}
        <section className="bg-white rounded-3xl border border-[#E7E1D3] p-6 sm:p-10 shadow-xs mb-10">
          <div className="mb-6">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block mb-1">
              {currentLang === 'tr' ? 'Detaylı Karşılaştırma' : 'Detailed Comparison'}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#2B2B2B]">
              {currentLang === 'tr'
                ? 'Nourla Boutique Hotel Süit Özellikleri ve Fiyat Tablosu'
                : 'Nourla Boutique Hotel Suite Specifications & Rates'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F4EE] border-b border-[#E7E1D3] font-serif font-semibold text-[#2B2B2B]">
                <tr>
                  <th scope="col" className="p-3 sm:p-4 text-[#6F7255]">{currentLang === 'tr' ? 'Süit Adı' : 'Suite Name'}</th>
                  <th scope="col" className="p-3 sm:p-4">{currentLang === 'tr' ? 'Büyüklük' : 'Size'}</th>
                  <th scope="col" className="p-3 sm:p-4">{currentLang === 'tr' ? 'Kapasite' : 'Capacity'}</th>
                  <th scope="col" className="p-3 sm:p-4">{currentLang === 'tr' ? 'Manzara & Özellik' : 'View & Feature'}</th>
                  <th scope="col" className="p-3 sm:p-4">{currentLang === 'tr' ? 'Gecelik Başlangıç' : 'Rate / Night'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D3]/70 font-light text-[#444444]">
                {ROOMS_DATA.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF8F5]">
                    <td className="p-3 sm:p-4 font-medium text-[#2B2B2B]">
                      <Link to={`/${currentLang}/rooms/${r.id}`} className="hover:text-[#6F7255] underline decoration-[#6F7255]/40">
                        {r.name[currentLang] || r.name.tr}
                      </Link>
                    </td>
                    <td className="p-3 sm:p-4">{r.size}</td>
                    <td className="p-3 sm:p-4">{r.capacity}</td>
                    <td className="p-3 sm:p-4">{r.view[currentLang] || r.view.tr}</td>
                    <td className="p-3 sm:p-4 font-semibold text-[#6F7255]">€{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
