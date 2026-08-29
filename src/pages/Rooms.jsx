import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/ui/SectionHeader';
import RoomCard from '../components/ui/RoomCard';
import { ROOMS_DATA } from '../data/rooms';

export default function Rooms() {
  const { t } = useTranslation();
  const [priceFilter, setPriceFilter] = useState('all');

  const filteredRooms = ROOMS_DATA.filter((room) => {
    if (priceFilter === 'under-450') return room.price <= 450;
    if (priceFilter === '450-600') return room.price > 450 && room.price <= 600;
    if (priceFilter === 'above-600') return room.price > 600;
    return true;
  });

  return (
    <div className="pt-20 sm:pt-28 pb-14 sm:pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('nav.rooms')}
          title={t('featured_rooms.title')}
          subtitle={t('featured_rooms.subtitle')}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 sm:mb-12 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          <button
            onClick={() => setPriceFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === 'all'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_all')}
          </button>

          <button
            onClick={() => setPriceFilter('under-450')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === 'under-450'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_budget')}
          </button>

          <button
            onClick={() => setPriceFilter('450-600')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === '450-600'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_mid')}
          </button>

          <button
            onClick={() => setPriceFilter('above-600')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === 'above-600'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            {t('rooms_page.filter_luxury')}
          </button>
        </div>

        {/* 10 Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </div>
  );
}
