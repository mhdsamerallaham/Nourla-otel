import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  Wifi,
  Wind,
  Coffee,
  Bath,
  Sun,
  Tv,
  Wine,
  ArrowRight,
  Maximize2,
  Users,
  ChevronLeft,
  ChevronRight,
  Expand,
} from 'lucide-react';
import RoomLightboxModal from './RoomLightboxModal';

const FEATURE_ICONS = {
  'Free WiFi': Wifi,
  'AC': Wind,
  'Breakfast': Coffee,
  'Private bathroom': Bath,
  'Balcony': Sun,
  'Smart TV': Tv,
  'Mini bar': Wine,
};

export default function RoomCard({ room, compact = false }) {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  const roomName = room.name[currentLang] || room.name.tr;
  const roomDesc = room.description[currentLang] || room.description.tr;
  const roomView = room.view[currentLang] || room.view.tr;

  // Extract all unique images
  const allImages = [room.image, ...(room.gallery || [])].filter(
    (img, idx, arr) => img && arr.indexOf(img) === idx
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const totalImages = allImages.length;
  const currentImgSrc = allImages[activeImageIndex] || room.image;

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleOpenLightbox = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsLightboxOpen(true);
  };

  // Touch swipe support for card images
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipe = 40;

    if (diff > minSwipe) {
      handleNext(e);
    } else if (diff < -minSwipe) {
      handlePrev(e);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // COMPACT — horizontal card for mobile home page swipe carousel
  if (compact) {
    return (
      <>
        <div className="group bg-[#FDFBF7] rounded-2xl border border-[#E7E1D3] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#6F7255]/40 transition-all duration-300 flex flex-row h-[130px]">
          {/* Image — fixed square on left with slider & lightbox trigger */}
          <div
            className="relative w-[125px] shrink-0 overflow-hidden cursor-pointer bg-stone-100"
            onClick={handleOpenLightbox}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImgSrc}
              alt={roomName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Price Badge */}
            <div className="absolute top-2 left-2 bg-[#6F7255] text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow z-10">
              €{room.price}
            </div>

            {/* Mini Zoom Button */}
            <div className="absolute top-2 right-2 bg-black/40 text-white p-1 rounded-full text-[9px] backdrop-blur-xs z-10">
              <Expand className="w-2.5 h-2.5" />
            </div>

            {/* Mini Navigation Arrows */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Önceki Fotoğraf"
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Sonraki Fotoğraf"
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>

          {/* Content — right side */}
          <div className="flex flex-col justify-between p-3 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-[#6F7255] font-medium mb-1">
                <span className="flex items-center gap-0.5">
                  <Maximize2 className="w-2.5 h-2.5" /> {room.size}
                </span>
                <span className="flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5" /> {room.capacity}
                </span>
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#2B2B2B] leading-tight mb-1 truncate">
                {roomName}
              </h3>
              <p className="text-[10px] text-[#555555] line-clamp-2 leading-relaxed font-light">
                {roomView}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E7E1D3]">
              <Link
                to={`/${currentLang}/rooms/${room.id}`}
                className="text-[10px] font-semibold text-[#6F7255] flex items-center gap-1 shrink-0"
              >
                {t('featured_rooms.details')}
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to={`/${currentLang}/reservation?room=${room.id}`}
                className="px-3 py-1.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-[10px] font-semibold transition-all shadow-sm active:scale-95"
              >
                {t('featured_rooms.book')}
              </Link>
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox Modal */}
        <RoomLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={allImages}
          currentIndex={activeImageIndex}
          onIndexChange={setActiveImageIndex}
          room={room}
        />
      </>
    );
  }

  // FULL — original vertical card for tablet/desktop and the Rooms page
  return (
    <>
      <div className="group bg-[#FDFBF7] rounded-2xl border border-[#E7E1D3] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#6F7255]/40 transition-all duration-500 flex flex-col h-full">
        {/* Media Image / Interactive Slider */}
        <div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-[#F7F4EE] select-none"
          onClick={handleOpenLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Image */}
          <img
            key={currentImgSrc}
            src={currentImgSrc}
            alt={roomName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-fadeIn"
          />

          {/* Subtle gradient overlay for better icon contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25 pointer-events-none" />

          {/* Price Badge */}
          <div className="absolute top-3.5 left-3.5 z-20 bg-[#6F7255]/95 backdrop-blur-xs text-[#FDFBF7] px-3 py-1 rounded-full text-xs font-medium shadow-md">
            €{room.price} <span className="text-[10px] opacity-85">/ {t('featured_rooms.per_night')}</span>
          </div>

          {/* Fullscreen Zoom Trigger Button */}
          <button
            type="button"
            onClick={handleOpenLightbox}
            title="Tam Ekran Görüntüle"
            aria-label="Tam Ekran Görüntüle"
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>

          {/* Left Arrow Navigation Button */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Önceki Görsel"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-90 opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 -translate-x-0.5" />
            </button>
          )}

          {/* Right Arrow Navigation Button */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Sonraki Görsel"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-90 opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 translate-x-0.5" />
            </button>
          )}

          {/* Bottom Pagination Dots & Counter */}
          {totalImages > 1 && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white shadow-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.slice(0, Math.min(totalImages, 7)).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  aria-label={`Fotoğraf ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeImageIndex
                      ? 'w-4 bg-[#A8AB8D]'
                      : 'w-1.5 bg-white/50 hover:bg-white/90'
                  }`}
                />
              ))}
              {totalImages > 7 && (
                <span className="text-[9px] font-mono pl-1 text-white/80">
                  +{totalImages - 7}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow justify-between bg-[#FDFBF7]">
          <div>
            <div className="flex items-center justify-between text-xs text-[#6F7255] mb-2 font-medium tracking-wider">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" /> {room.size}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {room.capacity}
              </span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-[#2B2B2B] group-hover:text-[#6F7255] transition-colors mb-2">
              {roomName}
            </h3>

            <p className="text-xs text-[#6F7255] italic mb-3 font-light">
              {roomView}
            </p>

            <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-4 sm:mb-6 font-light">
              {roomDesc}
            </p>

            {/* Room Features Badges */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-1.5">
                {room.features.map((feature, idx) => {
                  const IconComponent = FEATURE_ICONS[feature] || Wifi;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F7F4EE] border border-[#E7E1D3] text-[11px] text-[#2B2B2B]/80 font-medium"
                      title={feature}
                    >
                      <IconComponent className="w-3 h-3 text-[#6F7255]" />
                      {feature}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 border-t border-[#E7E1D3] flex items-center justify-between gap-3">
            <Link
              to={`/${currentLang}/rooms/${room.id}`}
              className="text-xs font-semibold text-[#6F7255] hover:text-[#4F523A] flex items-center gap-1.5 transition-colors group/link"
            >
              {t('featured_rooms.details')}
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={`/${currentLang}/reservation?room=${room.id}`}
              className="px-4 py-2 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-medium transition-all shadow-xs hover:shadow-md"
            >
              {t('featured_rooms.book')}
            </Link>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <RoomLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        currentIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        room={room}
      />
    </>
  );
}
