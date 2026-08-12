import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Wifi, Wind, Coffee, Bath, Sun, Tv, Wine, ArrowRight, Maximize2, Users } from 'lucide-react';
import MediaPlaceholder from './MediaPlaceholder';

const FEATURE_ICONS = {
  'Free WiFi': Wifi,
  'AC': Wind,
  'Breakfast': Coffee,
  'Private bathroom': Bath,
  'Balcony': Sun,
  'Smart TV': Tv,
  'Mini bar': Wine,
};

export default function RoomCard({ room }) {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  const roomName = room.name[currentLang] || room.name.tr;
  const roomDesc = room.description[currentLang] || room.description.tr;
  const roomView = room.view[currentLang] || room.view.tr;

  return (
    <div className="group bg-[#FDFBF7] rounded-2xl border border-[#E7E1D3] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#6F7255]/40 transition-all duration-500 flex flex-col h-full">
      {/* Media Image / Placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <MediaPlaceholder
          type="image"
          imageUrl={room.image}
          title={roomName}
          aspectRatio="w-full h-full"
        />
        <div className="absolute top-4 left-4 z-20 bg-[#6F7255] text-[#FDFBF7] px-3.5 py-1 rounded-full text-xs font-medium shadow-md">
          €{room.price} <span className="text-[10px] opacity-80">/ {t('featured_rooms.per_night')}</span>
        </div>
      </div>

      {/* Details Content */}
      <div className="p-6 md:p-8 flex flex-col flex-grow justify-between bg-[#FDFBF7]">
        <div>
          <div className="flex items-center justify-between text-xs text-[#6F7255] mb-2 font-medium tracking-wider">
            <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" /> {room.size}</span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {room.capacity}</span>
          </div>

          <h3 className="font-serif text-2xl text-[#2B2B2B] group-hover:text-[#6F7255] transition-colors mb-2">
            {roomName}
          </h3>

          <p className="text-xs text-[#6F7255] italic mb-3 font-light">
            {roomView}
          </p>

          <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-6 font-light">
            {roomDesc}
          </p>

          {/* Room Features Badges */}
          <div className="mb-6">
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
  );
}
