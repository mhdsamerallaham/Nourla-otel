import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  Wifi,
  Wind,
  Coffee,
  Bath,
  Sun,
  Tv,
  Wine,
  Maximize2,
  Users,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
} from 'lucide-react';

import { ROOMS_DATA } from '../data/rooms';
import BookingWidget from '../components/ui/BookingWidget';
import Breadcrumb from '../components/ui/Breadcrumb';
import StructuredData, { buildRoomSchema } from '../components/ui/StructuredData';
import { usePageMeta } from '../hooks/usePageMeta';
import RoomLightboxModal from '../components/ui/RoomLightboxModal';

const AMENITY_ICONS = {
  'Free WiFi': Wifi,
  'AC': Wind,
  'Breakfast': Coffee,
  'Private bathroom': Bath,
  'Balcony': Sun,
  'Smart TV': Tv,
  'Mini bar': Wine,
};

export default function RoomDetail() {
  const { i18n, t } = useTranslation();
  const { roomId, lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  const room = ROOMS_DATA.find((r) => r.id === roomId || r.slug === roomId) || ROOMS_DATA[0];

  const allImages = [room.image, ...(room.gallery || [])].filter(
    (img, idx, arr) => img && arr.indexOf(img) === idx
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [room]);

  const currentImage = allImages[activeImageIndex] || room.image;
  const totalImages = allImages.length;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const roomName = room.name[currentLang] || room.name.tr;
  const roomDesc = room.description[currentLang] || room.description.tr;
  const roomView = room.view[currentLang] || room.view.tr;

  // ── SEO meta tags ─────────────────────────────────────
  usePageMeta({
    title: `${roomName} | Nourla Boutique Hotel Urla İzmir`,
    description: `${roomDesc?.slice(0, 150)}...`,
    canonical: `/${currentLang}/rooms/${room.id}`,
    lang: currentLang,
  });

  // ── HotelRoom JSON-LD schema
  const roomSchema = buildRoomSchema({
    name: roomName,
    description: roomDesc,
    id: room.id,
    image: room.image,
    size: room.size,
    capacity: room.capacity,
    features: room.features,
    price: room.price,
  });

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: `/${currentLang}` },
    { label: t('breadcrumb.rooms'), href: `/${currentLang}/rooms` },
    { label: roomName },
  ];

  return (
    <div className="pt-20 sm:pt-28 pb-14 sm:pb-24 min-h-screen bg-[#FDFBF7]">
      {/* HotelRoom JSON-LD schema */}
      <StructuredData id="jsonld-room" schema={roomSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Back Link */}
        <Link
          to={`/${currentLang}/rooms`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F7255] hover:text-[#4F523A] mb-8 uppercase tracking-wider transition-colors"
          aria-label="Tüm odalara dön"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('featured_rooms.view_all')}
        </Link>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-[#E7E1D3]">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block mb-1">
              {t('room_detail.suite_details_tag')}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#2B2B2B]">{roomName}</h1>
            <p className="text-xs text-[#6F7255] italic mt-1 font-light">{roomView}</p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-[#555555] block">{t('featured_rooms.per_night')}</span>
            <span className="font-serif text-3xl font-semibold text-[#6F7255]">€{room.price}</span>
          </div>
        </div>

        {/* Gallery Showcase & Main View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div className="lg:col-span-8">
            {/* Main Featured Photo with Navigation & Lightbox */}
            <div
              className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl mb-4 bg-stone-100 group cursor-pointer border border-[#E7E1D3]"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                key={currentImage}
                src={currentImage}
                alt={`${roomName} - ${activeImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-fadeIn"
              />

              {/* Top Right Fullscreen Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg cursor-pointer"
                title="Tam Ekran Aç"
                aria-label="Tam Ekran Aç"
              >
                <Expand className="w-4 h-4" />
              </button>

              {/* Photo Counter Badge */}
              <span className="absolute bottom-4 left-4 z-20 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-mono">
                {activeImageIndex + 1} / {totalImages}
              </span>

              {/* Prev Button */}
              {totalImages > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Önceki Fotoğraf"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg cursor-pointer opacity-90 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6 -translate-x-0.5" />
                </button>
              )}

              {/* Next Button */}
              {totalImages > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Sonraki Fotoğraf"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg cursor-pointer opacity-90 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6 translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {totalImages > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`overflow-hidden rounded-xl border-2 transition-all cursor-pointer aspect-[4/3] ${
                      activeImageIndex === idx
                        ? 'border-[#6F7255] ring-2 ring-[#6F7255]/40 opacity-100 scale-95'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#6F7255]/50'
                    }`}
                    aria-label={`${roomName} görsel ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${roomName} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Booking Widget Sidebar */}
          <div className="lg:col-span-4">
            <BookingWidget preselectedRoomId={room.id} />
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

        {/* Room Specs & Full Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-[#E7E1D3]">
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h3 className="font-serif text-2xl text-[#2B2B2B] mb-4 font-normal">{t('room_detail.about_title')}</h3>
              <p className="text-sm text-[#555555] font-light leading-relaxed">{roomDesc}</p>
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3]">
              <div>
                <span className="text-[11px] text-[#555555] block">{t('room_detail.size_label')}</span>
                <span className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-1.5 mt-0.5">
                  <Maximize2 className="w-4 h-4 text-[#6F7255]" /> {room.size}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#555555] block">{t('room_detail.capacity_label')}</span>
                <span className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-[#6F7255]" /> {room.capacity}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#555555] block">{t('room_detail.view_label')}</span>
                <span className="text-xs font-medium text-[#6F7255] mt-1 block">{roomView}</span>
              </div>
            </div>

            {/* Complete Amenities Grid */}
            <div>
              <h3 className="font-serif text-2xl text-[#2B2B2B] mb-6 font-normal">{t('room_detail.amenities_title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.features.map((feature, idx) => {
                  const Icon = AMENITY_ICONS[feature] || CheckCircle2;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E7E1D3]">
                      <div className="w-8 h-8 rounded-full bg-[#6F7255]/10 flex items-center justify-center text-[#6F7255]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-[#2B2B2B]">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
