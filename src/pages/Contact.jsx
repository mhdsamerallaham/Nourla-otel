import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Send, CheckCircle2, Compass, MessageCircle, Clock, Car, Wine, Sparkles, ChevronDown, ShieldCheck, Star } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import MediaPlaceholder from '../components/ui/MediaPlaceholder';
import Breadcrumb from '../components/ui/Breadcrumb';
import StructuredData, { buildFaqSchema } from '../components/ui/StructuredData';
import { usePageMeta } from '../hooks/usePageMeta';

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
    a: { tr: 'Giriş saatimiz 15:00, çıkış saatimiz ise 12:00\'dir. Erken giriş ve geç çıkış talepleri müsaitlik doğrultusunda ücretsiz olarak değerlendirilir.', en: 'Check-in is at 15:00 and Check-out is at 12:00. Early check-in & late check-out are subject to availability.', de: 'Check-in ist um 15:00 Uhr, Check-out um 12:00 Uhr.', ru: 'Заезд с 15:00, выезд до 12:00.' }
  },
  {
    q: { tr: 'Otelinizde elektrikli araç (EV) şarj istasyonu bulunuyor mu?', en: 'Is there an Electric Vehicle (EV) charging station on-site?', de: 'Gibt es eine Ladestation für Elektrofahrzeuge?', ru: 'Есть ли зарядка для электромобилей?' },
    a: { tr: 'Evet, otel bünyemizde tüm elektrikli ve hibrid araç modellerine uygun 22kW hızlı AC şarj ünitelerimiz misafirlerimize özel ücretsiz hizmet vermektedir.', en: 'Yes, we feature complimentary 22kW fast AC charging stations for all EV models.', de: 'Ja, kostenlose 22-kW-Schnellladestationen stehen für alle EV-Modelle zur Verfügung.', ru: 'Да, на территории отеля есть бесплатная зарядная станция 22 кВт.' }
  },
  {
    q: { tr: 'Evcil hayvan kabul ediyor musunuz?', en: 'Are pets allowed at the hotel?', de: 'Sind Haustiere erlaubt?', ru: 'Разрешено ли проживание с животными?' },
    a: { tr: 'Zeytin bahçesi ve müstakil verandası olan belirli zeytin süitlerimizde sevimli dostlarımızı ağırlamaktan mutluluk duyuyoruz. Lütfen rezervasyon aşamasında bilgi veriniz.', en: 'We welcome pets in select ground-floor Olive Suites featuring private gardens.', de: 'Haustiere sind in ausgewählten Erdgeschoss-Suiten willkommen.', ru: 'Мы принимаем питомцев в некоторых люксах с садом.' }
  },
  {
    q: { tr: 'İptal ve iade politikanız nedir?', en: 'What is your cancellation and refund policy?', de: 'Wie lautet Ihre Stornierungsrichtlinie?', ru: 'Какова ваша политика отмены и возврата?' },
    a: { tr: 'Girişten 7 gün öncesine kadar yapılan iptallerde tam iade yapılmaktadır. 7 günden az sürede yapılan iptallerde 1 gece konaklama ücreti iade edilmez. Özel etkinlik rezervasyonlarında farklı koşullar geçerli olabilir.', en: 'Free cancellation up to 7 days before check-in. Cancellations within 7 days are subject to a 1-night retention fee. Different policies may apply to special event bookings.', de: 'Kostenlose Stornierung bis 7 Tage vor dem Check-in. Bei Stornierungen innerhalb von 7 Tagen wird eine Nacht einbehalten.', ru: 'Бесплатная отмена за 7 дней до заезда. При отмене менее чем за 7 дней взимается плата за 1 ночь.' }
  },
  {
    q: { tr: 'Kahvaltı fiyata dahil mi?', en: 'Is breakfast included in the room rate?', de: 'Ist das Frühstück im Zimmerpreis enthalten?', ru: 'Включен ли завтрак в стоимость номера?' },
    a: { tr: 'Evet, tüm süit fiyatlarımıza zengin organik ve çiftlikten toplanan Ege kahvaltısı dahildir. Kahvaltı her sabah 08:00-10:30 saatleri arasında sunulmaktadır.', en: 'Yes, all suite rates include our rich organic farm-to-table Aegean breakfast, served daily between 08:00-10:30.', de: 'Ja, alle Zimmerpreise beinhalten unser reichhaltiges Bio-Frühstück, täglich von 08:00-10:30 Uhr.', ru: 'Да, все тарифы включают органический завтрак, подаваемый ежедневно с 08:00 до 10:30.' }
  },
  {
    q: { tr: 'Nourla sürdürülebilirlik konusunda ne gibi uygulamalar yapıyor?', en: 'What sustainability practices does Nourla follow?', de: 'Welche Nachhaltigkeitspraktiken verfolgt Nourla?', ru: 'Какие меры устойчивого развития применяет Nourla?' },
    a: { tr: 'Nourla; %100 yenilenebilir enerji, güneş panelleri, geri dönüşüm sistemleri, sıfır plastik politikası ve yerel çiftçilerden tedarik zinciri ile sürdürülebilir bir lüks anlayışını benimsemektedir. Detaylar için Sürdürülebilirlik sayfamızı ziyaret edin.', en: 'Nourla operates on 100% renewable energy, solar panels, zero-plastic policy, and a fully local supply chain. Visit our Sustainability page for full details.', de: 'Nourla setzt auf 100% erneuerbare Energie, Solarpanele, plastikfreie Politik und lokale Lieferketten.', ru: 'Nourla работает на 100% возобновляемой энергии, использует солнечные панели, политику нулевого пластика и местные цепочки поставок.' }
  },
];

import { sanitizeText, isValidEmail, isValidPhone, sanitizePhone, isValidName } from '../utils/sanitize';

export default function Contact() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'tr';

  // ── SEO meta tags
  usePageMeta({
    title: currentLang === 'tr'
      ? 'İletişim & Rezervasyon | Nourla Boutique Hotel Urla'
      : 'Contact & Booking | Nourla Boutique Hotel Urla',
    description: currentLang === 'tr'
      ? 'Nourla Boutique Hotel concierge ekibi ile iletişime geçin. VIP havalimanı transferi, özel etkinlik ve rezervasyon için 7/24 hizmetinizdeyiz. +90 232 754 00 00'
      : 'Contact Nourla Boutique Hotel concierge team. Available 24/7 for VIP airport transfers, private events and reservations in Urla, Izmir.',
    canonical: `/${currentLang}/contact`,
    lang: currentLang,
  });

  // ── FAQ JSON-LD schema (English — best for AI crawlers)
  const faqSchema = buildFaqSchema(
    FAQS.map((f) => ({ q: f.q.en || f.q.tr, a: f.a.en || f.a.tr }))
  );

  const [selectedTopic, setSelectedTopic] = useState('stay');
  const [preferredChannel, setPreferredChannel] = useState('email');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = sanitizeText(formName);
    const cleanEmail = sanitizeText(formEmail);
    const cleanPhone = sanitizePhone(formPhone);
    const cleanMessage = sanitizeText(formMessage);

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanMessage) {
      setFormError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    if (!isValidName(cleanName)) {
      setFormError('Lütfen ad ve soyadınızı geçerli bir formatta giriniz.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setFormError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setFormError('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    setSubmitted(true);
  };

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: `/${currentLang}` },
    { label: t('contact.title') },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FDFBF7]">
      {/* FAQ JSON-LD schema */}
      <StructuredData id="jsonld-faq" schema={faqSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="relative rounded-3xl overflow-hidden mb-16 border border-[#E7E1D3] shadow-xl">
          <div className="relative h-[320px] sm:h-[380px] w-full">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.47 (6).jpeg"
              alt="Nourla Boutique Hotel concierge ve iletişim — Urla İzmir'de lüks butik otel girişi"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/90 via-[#2B2B2B]/60 to-transparent flex items-center p-8 sm:p-14">
              <div className="max-w-xl text-white space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block text-[#E7E1D3]">
                  {t('contact.hero_tag')}
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
                  {t('contact.hero_title')}
                </h1>
                <p className="text-xs sm:text-sm text-[#E7E1D3]/90 font-light leading-relaxed">
                  {t('contact.hero_desc')}
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
              <h3 className="font-serif text-xl text-[#2B2B2B]">{t('contact.concierge_card_title')}</h3>
              <p className="text-xs text-[#555555] font-light leading-relaxed">
                {t('contact.concierge_card_desc')}
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
              {t('contact.whatsapp_btn')}
            </a>
          </div>

          <div className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255]/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B]">{t('contact.email_card_title')}</h3>
              <p className="text-xs text-[#555555] font-light leading-relaxed">
                {t('contact.email_card_desc')}
              </p>
              <div className="text-xs font-semibold text-[#2B2B2B] pt-2">
                info@nourla.com.tr
              </div>
            </div>
            <a
              href="mailto:info@nourla.com.tr"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#E7E1D3] text-xs font-semibold text-[#6F7255] hover:bg-[#6F7255] hover:text-white transition-all shadow-xs"
            >
              <Mail className="w-4 h-4" />
              {t('contact.email_btn')}
            </a>
          </div>

          <div className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255]/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2B2B2B]">{t('contact.direction_card_title')}</h3>
              <p className="text-xs text-[#555555] font-light leading-relaxed">
                {t('contact.direction_card_desc')}
              </p>
              <div className="text-xs font-semibold text-[#2B2B2B] pt-2">
                GPS: 38.3182° N, 26.7641° E
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/5G7yaqk8hH6MBCN4A"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#6F7255] text-white text-xs font-semibold hover:bg-[#4F523A] transition-all shadow-md active:scale-95"
              aria-label="Google Maps'te Nourla Boutique Hotel işletme profilini aç"
            >
              <MapPin className="w-4 h-4" />
              {t('contact.maps_btn')}
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
                    {t('contact.form_tag')}
                  </span>
                  <h3 className="font-serif text-3xl text-[#2B2B2B]">{t('contact.form_title')}</h3>
                  <p className="text-xs text-[#555555] font-light mt-1">
                    {t('contact.form_subtitle')}
                  </p>
                </div>

                {/* Topic Selector Pills */}
                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-2">{t('contact.topic_label')}</label>
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

                {/* Error Banner */}
                {formError && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fadeIn">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">{t('contact.form_name')}</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t('contact.form_name')}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">{t('contact.form_phone')}</label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+90 532 000 00 00"
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">{t('contact.form_email')}</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={t('contact.form_email')}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                    required
                  />
                </div>

                {/* Preferred Channel */}
                <div>
                  <label className="block text-xs font-semibold text-[#2B2B2B] mb-1.5">{t('contact.channel_label')}</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-[#555555] cursor-pointer">
                      <input
                        type="radio"
                        name="channel"
                        checked={preferredChannel === 'email'}
                        onChange={() => setPreferredChannel('email')}
                        className="accent-[#6F7255]"
                      />
                      {t('contact.channel_email')}
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#555555] cursor-pointer">
                      <input
                        type="radio"
                        name="channel"
                        checked={preferredChannel === 'whatsapp'}
                        onChange={() => setPreferredChannel('whatsapp')}
                        className="accent-[#6F7255]"
                      />
                      {t('contact.channel_whatsapp')}
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">{t('contact.message_label')}</label>
                  <textarea
                    rows="4"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder={t('contact.message_placeholder')}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  {t('contact.submit_btn')}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-4 border border-[#6F7255]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-3xl text-[#2B2B2B] mb-2">{t('contact.success_title')}</h3>
                <p className="text-xs text-[#555555] max-w-md mx-auto mb-6">
                  {t('contact.success_desc')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  {t('contact.new_message_btn')}
                </button>
              </div>
            )}
          </div>

          {/* Google Maps Embed — verified NOURLA business profile */}
          <div className="lg:col-span-5 flex flex-col gap-5">

            {/* Map iframe with floating info overlay */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E7E1D3] shadow-xl w-full h-[380px] bg-[#E7E1D3]/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3129.30049311109!2d26.767377189439305!3d38.34202650670514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bb9495965a9da5%3A0xd221ea1757778d49!2sNOURLA!5e0!3m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nourla Boutique Hotel konumu — Urla, İzmir Google Haritalar"
                aria-label="Nourla Boutique Hotel Google Haritalar — İskele Mahallesi, Urla, İzmir"
              />

              {/* Floating info card — bottom left */}
              <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#E7E1D3] p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#6F7255] uppercase truncate">NOURLA BOUTIQUE HOTEL</p>
                    <p className="text-xs text-[#2B2B2B] font-medium truncate">İskele Mah. 2222/5 Sk. No:4/1, Urla</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#555555]">· {t('contact.google_business')}</span>
                    </div>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/5G7yaqk8hH6MBCN4A"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Google Maps'te Nourla işletme profilini aç"
                    className="pointer-events-auto shrink-0 flex items-center gap-1.5 bg-[#6F7255] hover:bg-[#4F523A] text-white text-[10px] font-bold px-3 py-2 rounded-xl transition-all active:scale-95 shadow-md"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {t('contact.directions_btn')}
                  </a>
                </div>
              </div>
            </div>

            {/* Distance Matrix Card */}
            <div className="bg-[#F7F4EE] p-5 sm:p-6 rounded-3xl border border-[#E7E1D3]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-lg sm:text-xl text-[#2B2B2B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6F7255]" />
                  {t('contact.distance_title')}
                </h4>
                <a
                  href="https://maps.app.goo.gl/5G7yaqk8hH6MBCN4A"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#6F7255] hover:text-[#4F523A] transition-colors uppercase tracking-wider"
                  aria-label="Google Maps'te görüntüle"
                >
                  <MapPin className="w-3 h-3" />
                  {t('contact.map_link')}
                </a>
              </div>
              <div className="space-y-0 text-xs text-[#555555]">
                {[
                  {
                    label: currentLang === 'de' ? 'ADB Flughafen' : currentLang === 'ru' ? 'Аэропорт ADB' : currentLang === 'en' ? 'ADB Airport' : 'ADB Havalimanı',
                    value: currentLang === 'de' ? '38 km · 40 Min.' : currentLang === 'ru' ? '38 км · 40 мин.' : '38 km · 40 min'
                  },
                  {
                    label: currentLang === 'de' ? 'Urla Zentrum' : currentLang === 'ru' ? 'Центр Урлы' : currentLang === 'en' ? 'Urla Center' : 'Urla Merkez',
                    value: currentLang === 'de' ? '4 km · 8 Min.' : currentLang === 'ru' ? '4 км · 8 мин.' : '4 km · 8 min'
                  },
                  {
                    label: 'Çeşme',
                    value: currentLang === 'de' ? '35 km · 30 Min.' : currentLang === 'ru' ? '35 км · 30 мин.' : '35 km · 30 min'
                  },
                  {
                    label: currentLang === 'de' ? 'Demircili Strand' : currentLang === 'ru' ? 'Пляж Демирджили' : currentLang === 'en' ? 'Demircili Beach' : 'Demircili Plajı',
                    value: currentLang === 'de' ? '12 km · 15 Min.' : currentLang === 'ru' ? '12 км · 15 мин.' : '12 km · 15 min'
                  },
                  {
                    label: 'EV Charge (22kW)',
                    value: currentLang === 'tr' ? 'Otelde • Ücretsiz' : currentLang === 'de' ? 'Im Hotel • Kostenlos' : currentLang === 'ru' ? 'В отеле • Бесплатно' : 'On-site • Free',
                    green: true
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#E7E1D3] last:border-0">
                    <span>{row.label}</span>
                    <span className={`font-semibold ${row.green ? 'text-[#6F7255]' : 'text-[#2B2B2B]'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ Accordion) */}
        <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-3xl border border-[#E7E1D3] shadow-lg max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block mb-1">
              {t('contact.faq_tag')}
            </span>
            <h2 className="font-serif text-3xl text-[#2B2B2B]">{t('contact.faq_title')}</h2>
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
