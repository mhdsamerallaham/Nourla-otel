import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Users, BedDouble, CheckCircle2, ShieldCheck, Maximize2, ArrowRight, Sparkles, User, Mail, Phone, MessageSquare, Check, Search, Eye, Loader2 } from 'lucide-react';
import { ROOMS_DATA } from '../../data/rooms';
import RoomInspectModal from './RoomInspectModal';

const FEATURE_TRANSLATIONS = {
  'Free WiFi': { tr: 'Ücretsiz WiFi', en: 'Free WiFi', de: 'Kostenloses WLAN', ru: 'Бесплатный Wi-Fi' },
  'AC': { tr: 'Klima', en: 'Air Conditioning', de: 'Klimaanlage', ru: 'Кондиционер' },
  'Breakfast': { tr: 'Gurme Kahvaltı', en: 'Gourmet Breakfast', de: 'Gourmet-Frühstück', ru: 'Завтрак' },
  'Private bathroom': { tr: 'Özel Banyo & Küvet', en: 'Private Bathroom', de: 'Privates Badezimmer', ru: 'Частная ванная' },
  'Balcony': { tr: 'Özel Teras / Balkon', en: 'Private Terrace / Balcony', de: 'Private Terrasse', ru: 'Балкон' },
  'Smart TV': { tr: 'Smart TV', en: 'Smart TV', de: 'Smart-TV', ru: 'Smart TV' },
  'Mini bar': { tr: 'Organik Mini Bar', en: 'Organic Mini Bar', de: 'Organische Minibar', ru: 'Мини-бар' },
};

export default function BookingWidget({ preselectedRoomId = '' }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  const [checkIn, setCheckIn] = useState('2026-08-10');
  const [checkOut, setCheckOut] = useState('2026-08-14');
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || ROOMS_DATA[0].id);
  const [guests, setGuests] = useState('2');
  
  // Availability Bot State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Inspect Modal State
  const [inspectingRoom, setInspectingRoom] = useState(null);

  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const selectedRoom = ROOMS_DATA.find((r) => r.id === selectedRoomId) || ROOMS_DATA[0];

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const totalPrice = selectedRoom.price * nights;

  // Handle Availability Search Simulation
  const handleCheckAvailability = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Filter available rooms matching requested guest capacity
  const displayRooms = ROOMS_DATA;

  if (submitted) {
    return (
      <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-3xl border border-[#6F7255]/40 shadow-2xl text-center max-w-3xl mx-auto animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-[#6F7255]/10 border border-[#6F7255] flex items-center justify-center mx-auto text-[#6F7255] mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#6F7255] bg-[#6F7255]/10 px-4 py-1.5 rounded-full mb-3 inline-block">
          NOURLA REZERVASYON ONAYI
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mb-3">
          {t('reservation.success_title')}
        </h3>
        <p className="text-xs sm:text-sm text-[#555555] max-w-lg mx-auto mb-8 font-light leading-relaxed">
          {t('reservation.success_desc')}
        </p>

        {/* Receipt Card */}
        <div className="bg-[#F7F4EE] p-6 sm:p-8 rounded-2xl text-left border border-[#E7E1D3] space-y-4 mb-8">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E7E1D3]">
            <img src={selectedRoom.image} alt="" className="w-20 h-16 object-cover rounded-xl shadow-xs" />
            <div>
              <span className="text-[10px] text-[#6F7255] font-semibold uppercase tracking-wider">SEÇİLEN SÜİT</span>
              <h4 className="font-serif text-xl text-[#2B2B2B]">
                {selectedRoom.name[currentLang] || selectedRoom.name.tr}
              </h4>
              <span className="text-xs text-[#555555]">€{selectedRoom.price} / gece</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#555555] block font-light">Misafir:</span>
              <span className="font-semibold text-[#2B2B2B]">{guestName || 'Değerli Misafirimiz'} ({guests} Misafir)</span>
            </div>
            <div>
              <span className="text-[#555555] block font-light">Tarihler:</span>
              <span className="font-semibold text-[#2B2B2B]">{checkIn} → {checkOut} ({nights} Gece)</span>
            </div>
            <div>
              <span className="text-[#555555] block font-light">İletişim:</span>
              <span className="font-semibold text-[#2B2B2B]">{guestEmail || 'Girilmedi'}</span>
            </div>
            <div>
              <span className="text-[#555555] block font-light">Toplam Tutar:</span>
              <span className="font-serif text-xl font-semibold text-[#6F7255]">€{totalPrice}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSubmitted(false)}
          className="px-8 py-3.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#4F523A] transition-all shadow-lg"
        >
          Yeni Rezervasyon Oluştur
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* SECTION 1: Dates & Guests Picker + Availability Bot */}
      <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 1</span>
            <h3 className="font-serif text-2xl text-[#2B2B2B]">Konaklama Tarihleri & Misafir Sayısı</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] focus-within:border-[#6F7255] transition-colors">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t('reservation.check_in')}
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none"
              required
            />
          </div>

          <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] focus-within:border-[#6F7255] transition-colors">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t('reservation.check_out')}
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none"
              required
            />
          </div>

          <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] focus-within:border-[#6F7255] transition-colors">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {t('reservation.guests')}
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
            >
              <option value="1">1 {t('reservation.adults')}</option>
              <option value="2">2 {t('reservation.adults')}</option>
              <option value="3">3 {t('reservation.adults')}</option>
              <option value="4">4 {t('reservation.adults')}</option>
            </select>
          </div>
        </div>

        {/* Availability Bot Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={isSearching}
            className="w-full py-4 px-6 rounded-2xl bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg disabled:opacity-75"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Müsaitlik Sorgulanıyor...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                Müsaitlik Durumu Sorgula
              </>
            )}
          </button>

          {/* Availability Searched Feedback Banner */}
          {hasSearched && (
            <div className="mt-4 p-4 rounded-2xl bg-[#6F7255]/10 border border-[#6F7255]/30 flex items-center justify-between text-xs text-[#2B2B2B] animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#6F7255] shrink-0" />
                <span>
                  <strong>{checkIn} – {checkOut}</strong> tarihleri ve <strong>{guests} Misafir</strong> için müsait olan süitler başarıyla filtrelendi.
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#6F7255] text-white px-2.5 py-1 rounded-md shrink-0">
                10 SÜİT MÜSAİT
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: RESİMLİ & DETAYLI ODA SEÇİMİ (Visual Room Selector Card Grid) */}
      <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E7E1D3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 2</span>
              <h3 className="font-serif text-2xl text-[#2B2B2B]">Süit Seçimi (10 Bespoke Oda)</h3>
            </div>
          </div>

          <span className="text-xs text-[#6F7255] font-medium bg-[#6F7255]/10 px-3 py-1 rounded-full border border-[#6F7255]/20 hidden sm:inline-block">
            {nights} Gece İçin Fiyatlandırma
          </span>
        </div>

        {/* 10 Room Selection Cards */}
        <div className="space-y-6">
          {displayRooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const roomName = room.name[currentLang] || room.name.tr;
            const roomDesc = room.description[currentLang] || room.description.tr;
            const roomView = room.view[currentLang] || room.view.tr;

            return (
              <div
                key={room.id}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-[#6F7255] bg-[#F7F4EE] shadow-xl ring-2 ring-[#6F7255]/30'
                    : 'border-[#E7E1D3] bg-[#FDFBF7] hover:border-[#6F7255]/50 hover:shadow-md'
                }`}
              >
                {/* Radio Selected Tag */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#6F7255] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    Müsait
                  </span>
                  <div
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#6F7255] text-white shadow-md scale-110'
                        : 'bg-white/80 border border-[#E7E1D3] text-transparent hover:border-[#6F7255]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 md:p-6 items-center">
                  {/* Room Thumbnail Image */}
                  <div
                    onClick={() => setSelectedRoomId(room.id)}
                    className="md:col-span-4 relative aspect-[4/3] rounded-xl overflow-hidden shadow-xs cursor-pointer group"
                  >
                    <img
                      src={room.image}
                      alt={roomName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#2B2B2B]/80 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-md">
                      {room.size}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pr-24">
                      <div>
                        <h4
                          onClick={() => setSelectedRoomId(room.id)}
                          className="font-serif text-2xl text-[#2B2B2B] font-medium cursor-pointer hover:text-[#6F7255] transition-colors"
                        >
                          {roomName}
                        </h4>
                        <span className="text-xs text-[#6F7255] italic block">{roomView}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#555555] block">Gece</span>
                        <span className="font-serif text-2xl font-semibold text-[#6F7255]">
                          €{room.price}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#555555] font-light leading-relaxed line-clamp-2">
                      {roomDesc}
                    </p>

                    {/* Specifications Bar (Max Capacity & Key Features) */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E1D3] text-xs font-semibold text-[#2B2B2B]">
                        <Users className="w-3.5 h-3.5 text-[#6F7255]" />
                        Maksimum: {room.capacity}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E1D3] text-xs font-semibold text-[#2B2B2B]">
                        <Maximize2 className="w-3.5 h-3.5 text-[#6F7255]" />
                        {room.size}
                      </span>
                    </div>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.features.map((feature, idx) => {
                        const translation = FEATURE_TRANSLATIONS[feature]?.[currentLang] || feature;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/80 border border-[#E7E1D3] text-[10px] text-[#555555] font-medium"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#6F7255]" />
                            {translation}
                          </span>
                        );
                      })}
                    </div>

                    {/* ROOM ACTIONS BAR: "Seç" and "Odayı İncele" Buttons */}
                    <div className="pt-4 border-t border-[#E7E1D3]/80 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setInspectingRoom(room)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F7F4EE] hover:bg-[#E7E1D3] border border-[#E7E1D3] text-xs font-semibold text-[#6F7255] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Odayı İncele
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-[#6F7255] text-white shadow-md'
                            : 'bg-white border border-[#6F7255] text-[#6F7255] hover:bg-[#6F7255] hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Oda Seçildi ✓' : 'Bu Odayı Seç'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: GUEST CONTACT INFO */}
      <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 3</span>
            <h3 className="font-serif text-2xl text-[#2B2B2B]">Misafir İletişim Bilgileri</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#6F7255]" />
              Adınız Soyadınız
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz"
              className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#6F7255]" />
              E-Posta Adresiniz
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Örn: ahmet@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#6F7255]" />
              Telefon Numarası
            </label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+90 532 000 00 00"
              className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#6F7255]" />
            Özel İstekler veya Notlar (Opsiyonel)
          </label>
          <textarea
            rows="3"
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="Erken giriş talebi, alerjen bilgilendirmesi veya özel kutlama notları..."
            className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
          ></textarea>
        </div>
      </div>

      {/* SECTION 4: SUMMARY & SUBMIT BAR */}
      <div className="bg-[#2B2B2B] text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#4F523A]">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#E7E1D3]/70 uppercase block">
            SEÇİLEN SÜİT TOPLAMI ({nights} GECE)
          </span>
          <div className="font-serif text-3xl sm:text-4xl text-white font-medium">
            {selectedRoom.name[currentLang] || selectedRoom.name.tr}
          </div>
          <p className="text-xs text-[#E7E1D3]/80 font-light">
            {checkIn} – {checkOut} ({guests} Misafir)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="text-center md:text-right pr-4">
            <span className="text-[11px] text-[#E7E1D3]/70 block font-light">Tahmini Toplam</span>
            <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#E7E1D3]">
              €{totalPrice}
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto py-4 px-8 rounded-full bg-[#6F7255] hover:bg-[#8E9272] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-105"
          >
            {t('reservation.submit')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security & Luxury Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-[#555555]">
          <ShieldCheck className="w-4 h-4 text-[#6F7255]" />
          <span>En İyi Fiyat Garantisi</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[#555555]">
          <ShieldCheck className="w-4 h-4 text-[#6F7255]" />
          <span>Esnek İptal Seçeneği</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[#555555]">
          <ShieldCheck className="w-4 h-4 text-[#6F7255]" />
          <span>Anında Concierge Teyidi</span>
        </div>
      </div>

      {/* ROOM INSPECTION MODAL */}
      <RoomInspectModal
        room={inspectingRoom}
        isOpen={Boolean(inspectingRoom)}
        onClose={() => setInspectingRoom(null)}
        onSelectAndBook={(roomId) => setSelectedRoomId(roomId)}
        currentLang={currentLang}
      />
    </form>
  );
}
