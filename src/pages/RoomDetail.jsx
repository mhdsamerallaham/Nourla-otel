import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Wifi, Wind, Coffee, Bath, Sun, Tv, Wine, Maximize2, Users, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

import { ROOMS_DATA } from '../data/rooms';
import MediaPlaceholder from '../components/ui/MediaPlaceholder';
import BookingWidget from '../components/ui/BookingWidget';
import Breadcrumb from '../components/ui/Breadcrumb';
import StructuredData, { buildRoomSchema } from '../components/ui/StructuredData';
import { usePageMeta } from '../hooks/usePageMeta';

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
  const [selectedImage, setSelectedImage] = useState(room.image);

  useEffect(() => {
    if (room) {
      setSelectedImage(room.image);
    }
  }, [room]);

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
    { label: 'Ana Sayfa', href: `/${currentLang}` },
    { label: 'Odalar', href: `/${currentLang}/rooms` },
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
              SÜİT DETAYLARI
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#2B2B2B]">{roomName}</h1>
            <p className="text-xs text-[#6F7255] italic mt-1 font-light">{roomView}</p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-[#555555] block">{t('featured_rooms.per_night')}</span>
            <span className="font-serif text-3xl font-semibold text-[#6F7255]">€{room.price}</span>
          </div>
        </div>

        {/* Gallery Placeholder & Main View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div className="lg:col-span-8">
            {/* Main Featured Photo */}
            <MediaPlaceholder
              type="image"
              imageUrl={selectedImage}
              title={roomName}
              aspectRatio="aspect-[16/10]"
              className="shadow-xl mb-4 rounded-2xl overflow-hidden"
            />

            {/* Gallery Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {room.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img ? 'border-[#6F7255] opacity-100 scale-[0.98]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`${roomName} görsel ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${roomName} — Nourla Boutique Hotel Urla ${idx + 1}. süit görünümü`}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Booking Widget Sidebar */}
          <div className="lg:col-span-4">
            <BookingWidget preselectedRoomId={room.id} />
          </div>
        </div>

        {/* Room Specs & Full Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-[#E7E1D3]">
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h3 className="font-serif text-2xl text-[#2B2B2B] mb-4 font-normal">Süit Hakkında</h3>
              <p className="text-sm text-[#555555] font-light leading-relaxed">{roomDesc}</p>
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3]">
              <div>
                <span className="text-[11px] text-[#555555] block">Oda Büyüklüğü</span>
                <span className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-1.5 mt-0.5">
                  <Maximize2 className="w-4 h-4 text-[#6F7255]" /> {room.size}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#555555] block">Kapasite</span>
                <span className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-[#6F7255]" /> {room.capacity}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#555555] block">Manzara</span>
                <span className="text-xs font-medium text-[#6F7255] mt-1 block">{roomView}</span>
              </div>
            </div>

            {/* Complete Amenities Grid */}
            <div>
              <h3 className="font-serif text-2xl text-[#2B2B2B] mb-6 font-normal">Oda Özellikleri & İmkanları</h3>
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
