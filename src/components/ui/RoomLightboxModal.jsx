import React, { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Maximize2, Users, ArrowRight, BedDouble } from 'lucide-react';

export default function RoomLightboxModal({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
  room = null,
}) {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const thumbnailsRef = useRef(null);

  const totalImages = images.length;
  const currentImage = images[currentIndex] || images[0];

  const handlePrev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (totalImages <= 1) return;
      const nextIdx = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      onIndexChange(nextIdx);
    },
    [currentIndex, totalImages, onIndexChange]
  );

  const handleNext = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (totalImages <= 1) return;
      const nextIdx = currentIndex === totalImages - 1 ? 0 : currentIndex + 1;
      onIndexChange(nextIdx);
    },
    [currentIndex, totalImages, onIndexChange]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!isOpen || !thumbnailsRef.current) return;
    const activeThumb = thumbnailsRef.current.children[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex, isOpen]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || !currentImage) return null;

  const roomName = room?.name ? (room.name[currentLang] || room.name.tr) : '';
  const roomView = room?.view ? (room.view[currentLang] || room.view.tr) : '';

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${roomName} Fotoğraf Galerisi`}
    >
      {/* Top Bar: Room Info & Controls */}
      <div
        className="flex items-center justify-between gap-4 text-white z-50 max-w-7xl w-full mx-auto pb-2 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#6F7255]/30 border border-[#6F7255]/50 flex items-center justify-center text-[#6F7255] shrink-0">
            <BedDouble className="w-4 h-4 text-[#A8AB8D]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-base sm:text-xl font-medium text-white truncate">
              {roomName || t('nav.rooms')}
            </h2>
            {roomView && (
              <p className="text-[11px] text-[#A8AB8D] truncate font-light">
                {roomView}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Photo Counter Badge */}
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono tracking-wider text-white/90">
            {currentIndex + 1} / {totalImages}
          </span>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Center: Main Image Viewport & Big Navigation Arrows */}
      <div
        className="relative flex-1 flex items-center justify-center my-2 sm:my-4 overflow-hidden w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button */}
        {totalImages > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Önceki Görsel"
            className="absolute left-1 sm:left-4 z-40 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-90 group cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Main Image Container */}
        <div className="relative max-h-[62vh] sm:max-h-[68vh] md:max-h-[72vh] max-w-full flex items-center justify-center">
          <img
            key={currentImage}
            src={currentImage}
            alt={`${roomName} - ${currentIndex + 1}`}
            className="max-h-[62vh] sm:max-h-[68vh] md:max-h-[72vh] max-w-full w-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl transition-opacity duration-300 animate-fadeIn"
            decoding="async"
          />
        </div>

        {/* Next Button */}
        {totalImages > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Sonraki Görsel"
            className="absolute right-1 sm:right-4 z-40 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-90 group cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Bottom Section: Thumbnails & Quick Actions */}
      <div
        className="max-w-6xl w-full mx-auto space-y-3 z-50 pt-2 border-t border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thumbnails Row */}
        {totalImages > 1 && (
          <div
            ref={thumbnailsRef}
            className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto py-1 px-2 scrollbar-none max-w-full"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onIndexChange(idx)}
                aria-label={`Fotoğraf ${idx + 1}`}
                className={`relative w-14 h-10 sm:w-18 sm:h-12 md:w-20 md:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-[#6F7255] ring-2 ring-[#6F7255]/50 scale-105 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}

        {/* Footer Meta & Booking CTAs */}
        {room && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-white text-xs pt-1">
            <div className="flex items-center gap-4 text-white/80">
              {room.size && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-[#A8AB8D]" /> {room.size}
                </span>
              )}
              {room.capacity && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#A8AB8D]" /> {room.capacity}
                </span>
              )}
              {room.price && (
                <span className="text-[#A8AB8D] font-semibold text-sm">
                  €{room.price} <span className="text-[10px] text-white/60 font-normal">/ {t('featured_rooms.per_night')}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <Link
                to={`/${currentLang}/rooms/${room.id}`}
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors text-xs flex items-center gap-1"
              >
                {t('featured_rooms.details')}
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to={`/${currentLang}/reservation?room=${room.id}`}
                onClick={onClose}
                className="px-4 py-1.5 rounded-full bg-[#6F7255] hover:bg-[#5C5E45] text-white font-semibold transition-all text-xs shadow-md active:scale-95"
              >
                {t('featured_rooms.book')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
