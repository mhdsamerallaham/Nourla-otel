import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Send, CheckCircle2, Compass, MessageCircle, Clock, Car, Wine, Sparkles, ChevronDown, ShieldCheck } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import MediaPlaceholder from '../components/ui/MediaPlaceholder';

const CONTACT_TOPICS = [
  { id: 'stay', label: { tr: 'Konaklama & Rezervasyon', en: 'Stay & Booking', de: 'Aufenthalt & Buchung', ru: 'Проживание' } },
  { id: 'transfer', label: { tr: 'VIP Havalimanı Transferi', en: 'VIP Airport Transfer', de: 'VIP-Flughafentransfer', ru: 'VIP-Трансфер' } },
  { id: 'event', label: { tr: 'Özel Davet & Etkinlik', en: 'Private Events', de: 'Private Veranstaltungen', ru: 'Частные Мероприятия' } },
  { id: 'wine', label: { tr: 'Bağ & Gastronomi Turu', en: 'Wine & Gastronomy Tour', de: 'Wein- & Gastronomietour', ru: 'Винный Тур' } },
];

const FAQS = [
  {
    q: { tr: 'İzmir Adnan Menderes Havalimanı (ADB) transferi sunuyor musunuz?', en: 'Do you offer Izmir Adnan Menderes Airport (ADB) transfer?', de: 'Bieten Sie einen Flughafentransfer an?', ru: 'Предоставляется ли трансфер из аэропорта Измира?' },
    a: { tr: 'Evet, Nourla özel VIP Mercedes Maybach ve V-Class araçlarımız ile havalimanından doğrudan otelimize 40 dakikalık konforlu transfer hizmeti sunmaktayız.', en: 'Yes, we provide 40-minute VIP chauffeur service from ADB airport directly to Nourla Boutique Hotel.', de: 'Ja, wir bieten einen 40-minütigen VIP-Chauffeurservice vom Flughafen ADB an.', ru: 'Да, мы предоставляем 40-минутный трансфер на VIP-автомобилях.' }
  },
  {
    q: { tr: 'Giriş (Check-in) ve Çıkış (Check-out) saatleri nelerdir?', en: 'What are the Check-in and Check-out times?', de: 'Wie sind die Check-in- und Check-out-Zeiten?', ru: 'Каково время заезда и выезда?' },
    a: { tr: 'Giriş saatimiz 15:00, çıkış saatimiz ise 12:00’dir. Erken giriş ve geç çıkış talepleri müsaitlik doğrultusunda ücretsiz olarak değerlendirilir.', en: 'Check-in is at 15:00 and Check-out is at 12:00. Early check-in & late check-out are subject to availability.', de: 'Check-in ist um 15:00 Uhr, Check-out um 12:00 Uhr.', ru: 'Заезд с 15:00, выезд до 12:00.' }
  },
  {
    q: { tr: 'Otelinizde elektrikli araç (EV) şarj istasyonu bulunuyor mu?', en: 'Is there an Electric Vehicle (EV) charging station on-site?', de: 'Gibt es eine Ladestation für Elektrofahrzeuge?', ru: 'Есть ли зарядка для электромобилей?' },
    a: { tr: 'Evet, otel bünyemizde tüm elektrikli ve hibrid araç modellerine uygun 22kW hızlı AC şarj ünitelerimiz misafirlerimize özel ücretsiz hizmet vermektedir.', en: 'Yes, we feature complimentary 22kW fast AC charging stations for all EV models.', de: 'Ja, kostenlose 22-kW-Schnellladestationen stehen für alle EV-Modelle zur Verfügung.', ru: 'Да, на территории отеля есть бесплатная зарядная станция 22 кВт.' }
  },
  {
    q: { tr: 'Evcil hayvan kabul ediyor musunuz?', en: 'Are pets allowed at the hotel?', de: 'Sind Haustiere erlaubt?', ru: 'Разрешено ли проживание с животными?' },
    a: { tr: 'Zeytin bahçesi ve müstakil verandası olan belirli zeytin süitlerimizde sevimli dostlarımızı ağırlamaktan mutluluk duyuyoruz. Lütfen rezervasyon aşamasında bilgi veriniz.', en: 'We welcome pets in select ground-floor Olive Suites featuring private gardens.', de: 'Haustiere sind in ausgewählten Erdgeschoss-Suiten willkommen.', ru: 'Мы принимаем питомцев в некоторых люксах с садом.' }
  }
];

export default function Contact() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'tr';

  const [selectedTopic, setSelectedTopic] = useState('stay');
  const [preferredChannel, setPreferredChannel] = useState('email');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. LUXURY HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden mb-16 border border-[#E7E1D3] shadow-xl">
          <div className="relative h-[320px] sm:h-[380px] w-full">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.47 (6).jpeg"
              alt="Urla Sanctuary"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/90 via-[#2B2B2B]/60 to-transparent flex items-center p-8 sm:p-14">
              <div className="max-w-xl text-white space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block text-[#E7E1D3]">
                  NOURLA CONCIERGE & DANIŞMA
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
                  Urla'daki Sığınağınız İle Bağlantıya Geçin
                </h1>
                <p className="text-xs sm:text-sm text-[#E7E1D3]/90 font-light leading-relaxed">
                  Özel konaklama talepleriniz, VIP havalimanı transferiniz veya gurme şarap tadım rotalarınız için 7/24 hizmetinizdeyiz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DIRECT CONCIERGE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255]/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B]">Rezervasyon & Concierge</h3>
              <p className="text-xs text-[#555555] font-light leading-relaxed">
                Konaklama teklifleri, oda tercihleri ve özel karşılama paketleri.
              </p>
              <div className="text-xs font-semibold text-[#2B2B2B] pt-2">
                +90 232 754 00 00 / +90 532 000 00 00
              </div>
            </div>
            <a
              href="https://wa.me/905320000000"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#E7E1D3] text-xs font-semibold text-[#6F7255] hover:bg-[#6F7255] hover:text-white transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp İle Hızlı İletişim
            </a>
          </div>

          <div className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255]/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B]">E-Posta & Yazılı İletişim</h3>
              <p className="text-xs text-[#555555] font-light leading-relaxed">
                Özel davetler, kurumsal rezervasyonlar ve detaylı broşür talepleri.
              </p>
              <div className="text-xs font-semibold text-[#2B2B2B] pt-2">
                stay@nourlahotel.com / info@nourlahotel.com
              </div>
            </div>
            <a
              href="mailto:stay@nourlahotel.com"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#E7E1D3] text-xs font-semibold text-[#6F7255] hover:bg-[#6F7255] hover:text-white transition-all shadow-xs"
            >
              <Mail className="w-4 h-4" />
              Doğrudan E-Posta Gönder
            </a>
          </div>

          <div className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255]/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B]">Havalimanı & Yol Tarifi</h3>
              <p className="text-xs text-[#555555] font-light leading-relaxed">
                ADB Havalimanı'na 40 dk (38 km) mesafede, İskele Urla mevkiinde.
              </p>
              <div className="text-xs font-semibold text-[#2B2B2B] pt-2">
                GPS: 38.3182° N, 26.7641° E
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=İskele+Mah.+2222/5+Sk.+No:+4/1+Urla+İzmir"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#E7E1D3] text-xs font-semibold text-[#6F7255] hover:bg-[#6F7255] hover:text-white transition-all shadow-xs"
            >
              <Compass className="w-4 h-4" />
              Google Maps Yol Tarifi Al
            </a>
          </div>
        </div>

        {/* 3. BESPOKE INQUIRY FORM & STYLED MAP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* High-End Form */}
          <div className="lg:col-span-7 bg-[#FDFBF7] p-8 sm:p-10 rounded-3xl border border-[#E7E1D3] shadow-xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block mb-1">
                    ÖZEL MESAJ & TALEP FORMU
                  </span>
                  <h3 className="font-serif text-3xl text-[#2B2B2B]">Size Nasıl Yardımcı Olabiliriz?</h3>
                  <p className="text-xs text-[#555555] font-light mt-1">
                    Talebinizi iletin, concierge ekibimiz maksimum 2 saat içerisinde sizinle iletişime geçsin.
                  </p>
                </div>

                {/* Topic Selector Pills */}
                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-2">Konu Başlığı Seçiniz:</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_TOPICS.map((topic) => {
                      const isSelected = selectedTopic === topic.id;
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => setSelectedTopic(topic.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#6F7255] text-white shadow-xs'
                              : 'bg-[#F7F4EE] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255]'
                          }`}
                        >
                          {topic.label[currentLang] || topic.label.tr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Adınız Soyadınız</label>
                    <input
                      type="text"
                      placeholder="Örn: Selin Karaca"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Telefon Numarası</label>
                    <input
                      type="tel"
                      placeholder="+90 532 000 00 00"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">E-Posta Adresiniz</label>
                  <input
                    type="email"
                    placeholder="Örn: selin@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                    required
                  />
                </div>

                {/* Preferred Channel */}
                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">Tercih Ettiğiniz Dönüş Kanalı:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-[#555555] cursor-pointer">
                      <input
                        type="radio"
                        name="channel"
                        checked={preferredChannel === 'email'}
                        onChange={() => setPreferredChannel('email')}
                        className="accent-[#6F7255]"
                      />
                      E-Posta ile
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#555555] cursor-pointer">
                      <input
                        type="radio"
                        name="channel"
                        checked={preferredChannel === 'whatsapp'}
                        onChange={() => setPreferredChannel('whatsapp')}
                        className="accent-[#6F7255]"
                      />
                      WhatsApp / Telefon ile
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Mesajınız & Detaylar</label>
                  <textarea
                    rows="4"
                    placeholder="Tarih tercihiniz, özel kutlama talepleriniz veya sormak istedikleriniz..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Talep Gönder
                </button>
              </form>
            ) : (
              <div className="text-center py-12 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-4 border border-[#6F7255]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-3xl text-[#2B2B2B] mb-2">Talebiniz Alındı</h3>
                <p className="text-xs text-[#555555] max-w-md mx-auto mb-6">
                  Nourla Concierge ekibimiz talebinizi inceleyip seçtiğiniz iletişim kanalından sizinle en kısa sürede bağlantı kuracaktır.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            )}
          </div>

          {/* Interactive Map & Location Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Styled Map Container */}
            <div className="relative h-[340px] rounded-3xl overflow-hidden border border-[#E7E1D3] shadow-lg bg-[#2B2B2B] p-6 text-white flex flex-col justify-between">
              <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 max-w-xs">
                <span className="text-[10px] font-semibold text-[#E7E1D3] uppercase tracking-widest block">HARİTA KONUMU</span>
                <span className="font-serif text-lg text-white font-medium block mt-0.5">Nourla Boutique Hotel</span>
                <span className="text-[11px] text-[#E7E1D3]/80 block">İskele Mah. 2222/5 Sk. No: 4/1 Urla / İzmir</span>
              </div>

              {/* Vector Compass Marker Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-56 h-56 border-2 border-dashed border-[#E7E1D3] rounded-full flex items-center justify-center">
                  <Compass className="w-20 h-20 text-[#E7E1D3]" />
                </div>
              </div>

              <div className="relative z-10 bg-[#6F7255]/90 backdrop-blur-md text-white p-4 rounded-2xl text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Urla Merkez → 4 km | Çeşme → 35 km
                </div>
                <div className="text-white/80">Sakin zeytin vadisinin ortasında, doğayla baş başa konum.</div>
              </div>
            </div>

            {/* Distance Matrix Card */}
            <div className="bg-[#F7F4EE] p-6 rounded-3xl border border-[#E7E1D3] space-y-3">
              <h4 className="font-serif text-xl text-[#2B2B2B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6F7255]" />
                Mesafe & Ulaşım Bilgileri
              </h4>
              <div className="space-y-2 text-xs text-[#555555]">
                <div className="flex justify-between py-1.5 border-b border-[#E7E1D3]">
                  <span>İzmir Adnan Menderes Havalimanı (ADB)</span>
                  <span className="font-semibold text-[#2B2B2B]">38 km (40 dk)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E7E1D3]">
                  <span>Urla Sanat Sokağı & Bağ Yolu</span>
                  <span className="font-semibold text-[#2B2B2B]">5 km (8 dk)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E7E1D3]">
                  <span>Demircili & Altınköy Plajları</span>
                  <span className="font-semibold text-[#2B2B2B]">12 km (15 dk)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Elektrikli Araç (EV) Şarj İstasyonu</span>
                  <span className="font-semibold text-[#6F7255]">Otelde Ücretsiz (22kW)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ Accordion) */}
        <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-3xl border border-[#E7E1D3] shadow-lg max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block mb-1">
              S I K Ç A  S O R U L A N L A R
            </span>
            <h2 className="font-serif text-3xl text-[#2B2B2B]">Merak Edilen Detaylar</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E7E1D3] bg-[#F7F4EE] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-lg text-[#2B2B2B] hover:text-[#6F7255] transition-colors"
                  >
                    <span>{faq.q[currentLang] || faq.q.tr}</span>
                    <ChevronDown className={`w-5 h-5 text-[#6F7255] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#555555] font-light leading-relaxed border-t border-[#E7E1D3]/60 pt-3 animate-fadeIn">
                      {faq.a[currentLang] || faq.a.tr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
