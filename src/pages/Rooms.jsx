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
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('nav.rooms')}
          title={t('featured_rooms.title')}
          subtitle={t('featured_rooms.subtitle')}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setPriceFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === 'all'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            Tüm Süitler (10)
          </button>

          <button
            onClick={() => setPriceFilter('under-450')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === 'under-450'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            €380 – €450 / Gece
          </button>

          <button
            onClick={() => setPriceFilter('450-600')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === '450-600'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            €480 – €600 / Gece
          </button>

          <button
            onClick={() => setPriceFilter('above-600')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              priceFilter === 'above-600'
                ? 'bg-[#6F7255] text-white shadow-xs'
                : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
            }`}
          >
            €600+ Master Suites
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
