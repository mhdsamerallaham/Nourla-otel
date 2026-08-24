import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles, Camera, Image as ImageIcon } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import { GALLERY_ITEMS } from '../data/gallery';

export default function Gallery() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'tr';
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems = GALLERY_ITEMS.filter(
    (item) => activeFilter === 'all' || item.category === activeFilter
  );

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      setLightboxIndex(filteredItems.length - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (lightboxIndex < filteredItems.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      setLightboxIndex(0);
    }
  };

  return (
    <div className="pt-20 sm:pt-28 pb-14 sm:pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. LUXURY EXHIBITION HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden mb-16 border border-[#E7E1D3] shadow-xl">
          <div className="relative h-[180px] sm:h-[280px] lg:h-[340px] w-full">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (6).jpeg"
              alt="Nourla Gallery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/90 via-[#2B2B2B]/60 to-transparent flex items-center p-8 sm:p-14">
              <div className="max-w-xl text-white space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block text-[#E7E1D3]">
                  NOURLA GÖRSEL KOLEKSİYONU
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
                  Işık, Zeytin & Akdeniz Mimarisi
                </h1>
                <p className="text-xs sm:text-sm text-[#E7E1D3]/90 font-light leading-relaxed">
                  Urla'nın kadim zeytin vadisindeki huzuru, 10 bespoke süitimizin rafine detaylarını ve gurme gastronomi deneyimlerimizi keşfedin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CATEGORY FILTER PILLS WITH COUNT BADGES */}
        <div className="flex items-center gap-2.5 mb-10 sm:mb-14 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-[#6F7255] text-white shadow-md scale-105'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            Tüm Koleksiyon
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#E7E1D3] text-[#6F7255]'}`}>
              {GALLERY_ITEMS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('rooms')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'rooms'
                ? 'bg-[#6F7255] text-white shadow-md scale-105'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            Süitler & Mimari
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === 'rooms' ? 'bg-white/20 text-white' : 'bg-[#E7E1D3] text-[#6F7255]'}`}>
              {GALLERY_ITEMS.filter(i => i.category === 'rooms').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('hotel')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'hotel'
                ? 'bg-[#6F7255] text-white shadow-md scale-105'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            Otel Yaşamı & Avlu
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === 'hotel' ? 'bg-white/20 text-white' : 'bg-[#E7E1D3] text-[#6F7255]'}`}>
              {GALLERY_ITEMS.filter(i => i.category === 'hotel').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('nature')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'nature'
                ? 'bg-[#6F7255] text-white shadow-md scale-105'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            Urla Doğa & Bağlar
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === 'nature' ? 'bg-white/20 text-white' : 'bg-[#E7E1D3] text-[#6F7255]'}`}>
              {GALLERY_ITEMS.filter(i => i.category === 'nature').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('food')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'food'
                ? 'bg-[#6F7255] text-white shadow-md scale-105'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            Gastronomi & Şarap
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === 'food' ? 'bg-white/20 text-white' : 'bg-[#E7E1D3] text-[#6F7255]'}`}>
              {GALLERY_ITEMS.filter(i => i.category === 'food').length}
            </span>
          </button>
        </div>

        {/* 3. EDITORIAL MASONRY GRID */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {filteredItems.map((item, idx) => {
            const title = item.title[currentLang] || item.title.tr;
            const subtitle = item.subtitle[currentLang] || item.subtitle.tr;

            return (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer border border-[#E7E1D3] bg-[#F7F4EE] shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-full overflow-hidden ${item.aspect}`}>
                  <img
                    src={item.image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Dark Ambient Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/90 via-[#2B2B2B]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[9px] font-semibold tracking-[0.2em] uppercase bg-white/80 backdrop-blur-md text-[#6F7255] px-2.5 py-1 rounded-full border border-white/40 shadow-xs">
                    {item.category}
                  </span>
                </div>

                {/* Expand Icon */}
                <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="font-serif text-xl sm:text-2xl text-white font-normal leading-snug mb-1">
                    {title}
                  </h4>
                  <p className="text-xs text-[#E7E1D3]/80 font-light line-clamp-2">
                    {subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. BESPOKE FULLSCREEN LIGHTBOX MODAL */}
        {activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Lightbox Content Card */}
            <div
              className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={activeLightboxItem.image}
                  alt={activeLightboxItem.title[currentLang] || activeLightboxItem.title.tr}
                  className="max-h-[70vh] w-auto object-contain mx-auto rounded-2xl"
                />
              </div>

              <div className="space-y-1 text-white max-w-xl">
                <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] bg-white/90 px-3 py-0.5 rounded-full uppercase inline-block mb-1">
                  {activeLightboxItem.category}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
                  {activeLightboxItem.title[currentLang] || activeLightboxItem.title.tr}
                </h3>
                <p className="text-xs text-[#E7E1D3]/80 font-light">
                  {activeLightboxItem.subtitle[currentLang] || activeLightboxItem.subtitle.tr}
                </p>
                <div className="text-[11px] text-white/50 pt-2 font-mono">
                  {lightboxIndex + 1} / {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
