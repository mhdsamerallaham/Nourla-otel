import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Wifi, Wind, Coffee, Bath, Sun, Tv, Wine, Maximize2, Users, CheckCircle2, Calendar } from 'lucide-react';

const AMENITY_ICONS = {
  'Free WiFi': Wifi,
  'AC': Wind,
  'Breakfast': Coffee,
  'Private bathroom': Bath,
  'Balcony': Sun,
  'Smart TV': Tv,
  'Mini bar': Wine,
};

export default function RoomInspectModal({ room, isOpen, onClose, onSelectAndBook, currentLang }) {
  if (!isOpen || !room) return null;

  const [activeImage, setActiveImage] = useState(room.image);

  const roomName = room.name[currentLang] || room.name.tr;
  const roomDesc = room.description[currentLang] || room.description.tr;
  const roomView = room.view[currentLang] || room.view.tr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#FDFBF7] rounded-3xl border border-[#E7E1D3] shadow-2xl overflow-hidden z-10 my-8 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E1D3] bg-[#F7F4EE]">
          <div>
            <span className="text-[10px] font-semibold text-[#6F7255] uppercase tracking-widest block">
              NOURLA SÜİT İNCELEME
            </span>
            <h3 className="font-serif text-2xl text-[#2B2B2B]">{roomName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#2B2B2B] hover:bg-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Main Photo Gallery Slider */}
          <div>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-md mb-3">
              <img src={activeImage} alt={roomName} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-[#6F7255] text-white px-3 py-1 rounded-full text-xs font-semibold">
                €{room.price} / gece
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex gap-3">
              {room.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-[#6F7255] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Room Specs & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-serif text-xl text-[#2B2B2B]">Süit Detayları</h4>
              <p className="text-xs text-[#555555] font-light leading-relaxed">{roomDesc}</p>
              <span className="text-xs text-[#6F7255] italic block">{roomView}</span>
            </div>

            <div className="bg-[#F7F4EE] p-5 rounded-2xl border border-[#E7E1D3] space-y-3">
              <h4 className="font-serif text-lg text-[#2B2B2B]">Özellik Özeti</h4>
              
              {/* Board Type Badge */}
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                  🍳 Zengin Organik Ege Kahvaltısı Dahil
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#555555] block">Kapasite:</span>
                  <span className="font-semibold text-[#2B2B2B] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#6F7255]" /> {room.capacity}
                  </span>
                </div>
                <div>
                  <span className="text-[#555555] block">Büyüklük:</span>
                  <span className="font-semibold text-[#2B2B2B] flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#6F7255]" /> {room.size}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Amenities Grid */}
          <div>
            <h4 className="font-serif text-xl text-[#2B2B2B] mb-4">Oda Donanımı ve Konaklama Özellikleri</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Yüksek Hızlı Wi-Fi', icon: Wifi },
                { name: 'VRF İklimlendirme / Klima', icon: Wind },
                { name: 'Zengin Organik Kahvaltı', icon: Coffee },
                { name: 'Özel Mermer Banyo & Küvet', icon: Bath },
                { name: 'Özel Taş Veranda / Balkon', icon: Sun },
                { name: 'Smart TV & Yayınlar', icon: Tv },
                { name: 'Minibar & Organik İkramlar', icon: Wine },
                { name: 'Özel Emanet Kasası', icon: CheckCircle2 },
                { name: 'EV Şarj İstasyonu (22kW)', icon: CheckCircle2 },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F4EE] border border-[#E7E1D3]">
                    <Icon className="w-4 h-4 text-[#6F7255]" />
                    <span className="text-xs font-medium text-[#2B2B2B]">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer / Action */}
        <div className="p-6 border-t border-[#E7E1D3] bg-[#F7F4EE] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#555555] block">Gecelik Fiyat</span>
            <span className="font-serif text-2xl font-semibold text-[#6F7255]">€{room.price}</span>
          </div>

          <button
            onClick={() => {
              onSelectAndBook(room.id);
              onClose();
            }}
            className="px-6 py-3 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
          >
            <Calendar className="w-4 h-4" />
            Bu Odayı Seç ve Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
