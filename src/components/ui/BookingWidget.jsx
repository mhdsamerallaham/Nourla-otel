import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Users,
  BedDouble,
  CheckCircle2,
  ShieldCheck,
  Maximize2,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  Phone,
  MessageSquare,
  Check,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
  XCircle,
  CreditCard,
  Lock,
  FileText,
  Building,
  CheckSquare,
  Square,
  Printer,
} from 'lucide-react';
import { ROOMS_DATA } from '../../data/rooms';
import RoomInspectModal from './RoomInspectModal';
import { getPrices, createReservation, createPaymentSession, process3DSecureVerification } from '../../services/api';

const FEATURE_TRANSLATIONS = {
  'Free WiFi': { tr: 'Ücretsiz WiFi', en: 'Free WiFi', de: 'Kostenloses WLAN', ru: 'Бесплатный Wi-Fi' },
  'AC': { tr: 'Klima', en: 'Air Conditioning', de: 'Klimaanlage', ru: 'Кондиционер' },
  'Breakfast': { tr: 'Gurme Kahvaltı', en: 'Gourmet Breakfast', de: 'Gourmet-Frühstück', ru: 'Завтрак' },
  'Private bathroom': { tr: 'Özel Banyo & Küvet', en: 'Private Bathroom', de: 'Privates Badezimmer', ru: 'Частная ванная' },
  'Balcony': { tr: 'Özel Teras / Balkon', en: 'Private Terrasse', ru: 'Балкон' },
  'Smart TV': { tr: 'Smart TV', en: 'Smart TV', de: 'Smart-TV', ru: 'Smart TV' },
  'Mini bar': { tr: 'Organik Mini Bar', en: 'Organic Mini Bar', de: 'Organische Minibar', ru: 'Мини-бар' },
};

export default function BookingWidget({ preselectedRoomId = '' }) {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  // Step state (1: Dates, 2: Room, 3: Guest, 4: Payment, 5: Confirmation)
  const [currentStep, setCurrentStep] = useState(1);

  // Search parameters
  const [checkIn, setCheckIn] = useState('2026-10-10');
  const [checkOut, setCheckOut] = useState('2026-10-12');
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || ROOMS_DATA[0].id);
  const [guests, setGuests] = useState('2');
  const [currency, setCurrency] = useState('TRY');

  // Availability & Pricing State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveOffers, setLiveOffers] = useState({});
  const [apiError, setApiError] = useState(null);

  // Inspect Modal
  const [inspectingRoom, setInspectingRoom] = useState(null);

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Payment Details
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('28');
  const [cvv, setCvv] = useState('');
  const [testScenario, setTestScenario] = useState('SUCCESS'); // SUCCESS, 3DS, FAIL

  // Legal Checkboxes
  const [acceptedKvkk, setAcceptedKvkk] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [simulated3DHtml, setSimulated3DHtml] = useState('');

  const selectedRoom = ROOMS_DATA.find((r) => r.id === selectedRoomId) || ROOMS_DATA[0];

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  useEffect(() => {
    fetchLivePrices();
  }, [checkIn, checkOut, guests, currency]);

  const fetchLivePrices = async () => {
    setIsSearching(true);
    setApiError(null);

    try {
      const priceRes = await getPrices({
        fromdate: checkIn,
        todate: checkOut,
        adult: parseInt(guests, 10),
        currency: currency,
        language: currentLang,
      });

      setHasSearched(true);

      if (priceRes && priceRes.success && Array.isArray(priceRes.offers)) {
        const offersMap = {};
        priceRes.offers.forEach((rawOffer) => {
          const roomTypeId = rawOffer.roomTypeId || rawOffer['room-type-id'];
          const days = rawOffer.daysCount || rawOffer['days-count'] || nights || 1;
          const totPrice = rawOffer.totalPrice || rawOffer.price || 0;
          const nightP = rawOffer.pricePerNight || rawOffer['price-arr']?.[0] || (totPrice ? totPrice / days : 0);
          const avail = rawOffer.availableRooms ?? rawOffer['room-to-sell'] ?? 0;
          const boardName = rawOffer.boardName || rawOffer['board-type'] || 'RO';
          const rateName = rawOffer.rateName || rawOffer['rate-type'] || '';
          const boardTypeId = rawOffer.boardTypeId || rawOffer['board-type-id'] || 893;
          const rateTypeId = rawOffer.rateTypeId || rawOffer['rate-type-id'] || 792;
          const rateCodeId = rawOffer.rateCodeId || rawOffer['rate-code-id'] || 6844;
          const priceAgencyId = rawOffer.priceAgencyId || rawOffer['price-agency-id'] || 44573;
          const curr = rawOffer.currency || currency;

          const offer = {
            roomTypeId,
            totalPrice: totPrice,
            pricePerNight: nightP,
            availableRooms: avail,
            boardName,
            boardTypeId,
            rateName,
            rateTypeId,
            rateCodeId,
            priceAgencyId,
            currency: curr,
          };

          if (roomTypeId) {
            if (!offersMap[roomTypeId] || offer.totalPrice < offersMap[roomTypeId].totalPrice) {
              offersMap[roomTypeId] = offer;
            }
          }
        });
        setLiveOffers(offersMap);
      } else {
        setLiveOffers({});
      }
    } catch (err) {
      console.warn('[RESERVATION WIDGET] Price fetch fallback:', err.message);
      setApiError(err.message);
      setLiveOffers({});
    } finally {
      setIsSearching(false);
    }
  };

  const selectedLiveOffer = liveOffers[selectedRoom.elektraRoomTypeId] || liveOffers[String(selectedRoom.elektraRoomTypeId)];
  const isSelectedRoomAvailable = Boolean(selectedLiveOffer && selectedLiveOffer.totalPrice > 0);
  const roomPricePerNight = isSelectedRoomAvailable ? Math.round(selectedLiveOffer.pricePerNight) : selectedRoom.price;
  const currSymbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺');
  
  // Price breakdown
  const subtotalPrice = isSelectedRoomAvailable ? Math.round(selectedLiveOffer.totalPrice) : Math.round(roomPricePerNight * nights);
  const taxAmount = Math.round(subtotalPrice * 0.10); // 10% VAT
  const finalTotalPrice = subtotalPrice + taxAmount;

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = v.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Step 3 -> 4: Create Pending Reservation in Backend DB Snapshot
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setApiError('Lütfen misafir ad, e-posta ve telefon alanlarını doldurunuz.');
      return;
    }

    setIsProcessing(true);
    setApiError(null);

    try {
      const pendingRes = await createReservation({
        roomTypeId: selectedRoom.elektraRoomTypeId,
        checkIn,
        checkOut,
        adultCount: parseInt(guests, 10),
        guestName,
        guestEmail,
        guestPhone,
        specialNotes,
        currency,
      });

      if (pendingRes && pendingRes.success) {
        setCreatedReservation(pendingRes);
        setCurrentStep(4);
      } else {
        throw new Error(pendingRes?.error?.message || 'Rezervasyon kaydı oluşturulamadı.');
      }
    } catch (err) {
      setApiError(err.message || 'Rezervasyon oluşturulurken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 4: Execute Payment
  const handleExecutePayment = async (e) => {
    e.preventDefault();
    if (!acceptedKvkk || !acceptedTerms) {
      setApiError('Lütfen KVKK Aydınlatma Metnini ve Mesafeli Satış Sözleşmesini onaylayınız.');
      return;
    }
    if (!createdReservation?.reservationId) {
      setApiError('Geçerli rezervasyon bulunamadı. Lütfen adımları baştan takip edin.');
      return;
    }

    setIsProcessing(true);
    setApiError(null);

    // Apply test scenario modifiers to card details
    let finalCardHolder = cardHolderName || guestName || 'DEĞERLİ MİSAFİR';
    let finalCardNumber = cardNumber.replace(/\s+/g, '');
    if (testScenario === 'FAIL') {
      finalCardHolder += ' FAIL';
    } else if (testScenario === '3DS') {
      finalCardHolder += ' 3DS';
    }

    try {
      const payRes = await createPaymentSession({
        reservationId: createdReservation.reservationId,
        card: {
          cardHolderName: finalCardHolder,
          cardNumber: finalCardNumber || '4242424242424242',
          expMonth,
          expYear,
          cvv: cvv || '123',
        },
      });

      if (payRes && payRes.success && payRes.data) {
        const payData = payRes.data;
        if (payData.requires3D) {
          setSimulated3DHtml(payData.htmlForm || '');
          setShow3DSModal(true);
        } else if (payData.status === 'SUCCESS') {
          setPaymentResult(payData);
          setCurrentStep(5);
        } else {
          throw new Error(payData.errorMessage || 'Ödeme işlemi onaylanmadı.');
        }
      } else {
        throw new Error(payRes?.error?.message || 'Ödeme işlemi sırasında hata oluştu.');
      }
    } catch (err) {
      setApiError(err.message || 'Ödeme işlemi başarısız oldu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle 3D Secure Simulation Approval
  const handleApprove3DSecure = async () => {
    setIsProcessing(true);
    setShow3DSModal(false);

    try {
      const verifyRes = await process3DSecureVerification({
        mock3d: 'true',
        status: 'SUCCESS',
        mdStatus: '1',
        transactionId: `MOCK-TX-${Date.now()}`,
      });

      if (verifyRes && verifyRes.success) {
        setPaymentResult(verifyRes.data || { status: 'SUCCESS' });
        setCurrentStep(5);
      } else {
        throw new Error(verifyRes?.error?.message || '3D Secure doğrulaması başarısız oldu.');
      }
    } catch (err) {
      setApiError(err.message || '3D Secure onayında hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayRooms = ROOMS_DATA.filter((r) => r.maxAdults >= parseInt(guests, 10));

  // STEP 5: CONFIRMATION VIEW
  if (currentStep === 5) {
    const resCode = createdReservation?.reservationCode || 'NOURLA-884920';
    return (
      <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-3xl border border-[#6F7255]/40 shadow-2xl text-center max-w-3xl mx-auto animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-[#6F7255]/10 border border-[#6F7255] flex items-center justify-center mx-auto text-[#6F7255] mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#6F7255] bg-[#6F7255]/10 px-4 py-1.5 rounded-full mb-3 inline-block">
          NOURLA BOUTIQUE HOTEL REZERVASYON ONAYI
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mb-3">
          Ödemeniz ve Rezervasyonunuz Onaylandı
        </h3>
        <p className="text-xs sm:text-sm text-[#555555] max-w-lg mx-auto mb-8 font-light leading-relaxed">
          Güvenli ödemeniz başarıyla alınmış, odanız adınıza tescil edilmiştir. İlgili konaklama belgesi e-posta adresinize gönderilmiştir.
        </p>

        {/* Receipt Card */}
        <div className="bg-[#F7F4EE] p-6 sm:p-8 rounded-2xl text-left border border-[#E7E1D3] space-y-4 mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D3]">
            <div className="flex items-center gap-4">
              <img src={selectedRoom.image} alt="" className="w-20 h-16 object-cover rounded-xl shadow-xs" />
              <div>
                <span className="text-[10px] text-[#6F7255] font-semibold uppercase tracking-wider block">SEÇİLEN SÜİT</span>
                <h4 className="font-serif text-xl text-[#2B2B2B]">
                  {selectedRoom.name[currentLang] || selectedRoom.name.tr}
                </h4>
                <span className="text-xs text-[#555555]">
                  {currSymbol}{roomPricePerNight.toLocaleString('tr-TR')} / gece
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#6F7255] font-semibold uppercase block">REZERVASYON KODU</span>
              <span className="font-mono text-sm font-bold text-[#2B2B2B] bg-[#E7E1D3] px-3 py-1 rounded-lg inline-block mt-1">
                {resCode}
              </span>
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
              <span className="font-semibold text-[#2B2B2B]">{guestEmail || 'Girilmedi'} ({guestPhone})</span>
            </div>
            <div>
              <span className="text-[#555555] block font-light">Ödeme Durumu:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                <Check className="w-3 h-3" /> GÜVENLİ ÖDEME ALINDI
              </span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-[#E7E1D3] flex items-center justify-between">
              <span className="text-[#555555] font-light">Toplam Ödenen Tutar (KDV Dahil):</span>
              <span className="font-serif text-2xl font-semibold text-[#6F7255]">
                {currSymbol}{finalTotalPrice.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-full bg-[#E7E1D3] text-[#2B2B2B] text-xs font-semibold uppercase tracking-widest hover:bg-[#D7D1C3] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Yazdır / PDF
          </button>
          <button
            onClick={() => {
              setCurrentStep(1);
              setCreatedReservation(null);
              setPaymentResult(null);
            }}
            className="px-8 py-3.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#4F523A] transition-all shadow-lg cursor-pointer"
          >
            Yeni Rezervasyon Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* STEP PROGRESS BAR */}
      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E7E1D3] flex flex-wrap items-center justify-between gap-2 shadow-xs text-xs">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStep === 1 ? 'bg-[#6F7255] text-white font-semibold' : 'text-[#555555]'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
          <span>Tarih & Müsaitlik</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#E7E1D3] hidden sm:block" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStep === 2 ? 'bg-[#6F7255] text-white font-semibold' : 'text-[#555555]'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
          <span>Oda Seçimi</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#E7E1D3] hidden sm:block" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStep === 3 ? 'bg-[#6F7255] text-white font-semibold' : 'text-[#555555]'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
          <span>Misafir Bilgileri</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#E7E1D3] hidden sm:block" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStep === 4 ? 'bg-[#6F7255] text-white font-semibold' : 'text-[#555555]'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
          <span>Güvenli Ödeme</span>
        </div>
      </div>

      {/* ERROR BANNER */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-800 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button onClick={() => setApiError(null)} className="text-amber-800 font-bold hover:underline">Tamam</button>
        </div>
      )}

      {/* STEP 1: DATES & GUESTS PICKER */}
      {currentStep === 1 && (
        <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 1</span>
                <h3 className="font-serif text-2xl text-[#2B2B2B]">Konaklama Tarihleri & Misafir Sayısı</h3>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-semibold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En İyi Fiyat Garantisi
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3]">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Giriş Tarihi
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3]">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Çıkış Tarihi
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3]">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Misafir Sayısı
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
              >
                <option value="1">1 Yetişkin</option>
                <option value="2">2 Yetişkin</option>
                <option value="3">3 Yetişkin</option>
              </select>
            </div>

            <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3]">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center gap-1.5">
                Para Birimi
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
              >
                <option value="TRY">TRY (₺)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E7E1D3]">
            <button
              type="button"
              onClick={fetchLivePrices}
              disabled={isSearching}
              className="py-3.5 px-6 rounded-2xl bg-[#E7E1D3] hover:bg-[#D7D1C3] text-[#2B2B2B] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-[#6F7255]" /> : <RefreshCw className="w-4 h-4 text-[#6F7255]" />}
              Fiyatları Güncelle
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3.5 px-8 rounded-2xl bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              Oda Seçimine İlerle <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ROOM SELECTION */}
      {currentStep === 2 && (
        <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 2</span>
                <h3 className="font-serif text-2xl text-[#2B2B2B]">Süit Oda Seçimi ({displayRooms.length} Kategori)</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#6F7255] font-medium underline cursor-pointer"
            >
              Tarihleri Değiştir
            </button>
          </div>

          <div className="space-y-6">
            {displayRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const roomName = room.name[currentLang] || room.name.tr;
              const roomDesc = room.description[currentLang] || room.description.tr;
              const offer = liveOffers[room.elektraRoomTypeId] || liveOffers[String(room.elektraRoomTypeId)];
              const isRoomAvailable = Boolean(offer && offer.totalPrice > 0);
              const nightPrice = isRoomAvailable ? Math.round(offer.pricePerNight) : room.price;

              return (
                <div
                  key={room.id}
                  className={`rounded-2xl border-2 p-5 md:p-6 transition-all ${
                    isSelected ? 'border-[#6F7255] bg-[#F7F4EE] shadow-md' : 'border-[#E7E1D3] bg-[#FDFBF7]'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 aspect-[4/3] rounded-xl overflow-hidden shadow-xs relative">
                      <img src={room.image} alt={roomName} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                        {room.size}
                      </span>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-xl text-[#2B2B2B]">{roomName}</h4>
                          <span className="text-xs text-[#6F7255] italic block">{room.view[currentLang] || room.view.tr}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-serif text-2xl font-semibold text-[#6F7255]">
                            {currSymbol}{nightPrice.toLocaleString('tr-TR')}
                          </span>
                          <span className="text-[10px] text-[#555555] block">gece / KDV Hariç</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#555555] line-clamp-2">{roomDesc}</p>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setInspectingRoom(room)}
                          className="inline-flex items-center gap-1 text-xs text-[#6F7255] font-semibold hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detaylı İncele
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setCurrentStep(3);
                          }}
                          className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected ? 'bg-[#6F7255] text-white shadow-md' : 'bg-white border border-[#6F7255] text-[#6F7255] hover:bg-[#6F7255] hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Bu Odayla Devam Et ✓' : 'Bu Odayı Seç'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: GUEST CONTACT INFO */}
      {currentStep === 3 && (
        <form onSubmit={handleProceedToPayment} className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 3</span>
                <h3 className="font-serif text-2xl text-[#2B2B2B]">Misafir İletişim Bilgileri</h3>
              </div>
            </div>
            <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-[#6F7255] underline cursor-pointer">
              Oda Değiştir
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Ad Soyad (Birincil Misafir)</label>
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
              <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">E-Posta Adresi</label>
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
              <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Telefon Numarası</label>
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
            <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Özel İstekler veya Notlar (Opsiyonel)</label>
            <textarea
              rows="3"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Erken giriş talebi, alerjen uyarısı veya özel notlar..."
              className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E7E1D3]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3.5 px-6 rounded-2xl bg-[#E7E1D3] text-[#2B2B2B] text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Geri
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="py-3.5 px-8 rounded-2xl bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-[#4F523A] transition-all cursor-pointer shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Rezervasyon Kaydediliyor...
                </>
              ) : (
                <>
                  Ödeme Adımına Geç <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: PAYMENT FORM & LEGAL APPROVALS */}
      {currentStep === 4 && (
        <form onSubmit={handleExecutePayment} className="bg-[#FDFBF7] p-6 sm:p-8 rounded-3xl border border-[#E7E1D3] shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 4</span>
                <h3 className="font-serif text-2xl text-[#2B2B2B]">Güvenli Ödeme Altyapısı (256-Bit SSL)</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ziraat Sanal POS Uyumlu
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Card Inputs */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#6F7255]" /> Kart Üzerindeki İsim
                </label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="AHMET YILMAZ"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#6F7255]" /> Kart Numarası
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs font-mono text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Ay</label>
                  <select
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B]"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">Yıl</label>
                  <select
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs text-[#2B2B2B]"
                  >
                    {['26', '27', '28', '29', '30', '31', '32'].map((y) => (
                      <option key={y} value={y}>20{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2B] mb-1.5">CVV</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E1D3] bg-[#F7F4EE] text-xs font-mono text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none"
                    required
                  />
                </div>
              </div>


              {/* Developer Test Scenario Switcher — only visible in development */}
              {import.meta.env.DEV && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                  <span className="font-semibold text-amber-900 block">
                    🛠 Geliştirici — Ödeme Senaryosu Seçimi:
                  </span>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-900">
                      <input
                        type="radio"
                        name="scenario"
                        value="SUCCESS"
                        checked={testScenario === 'SUCCESS'}
                        onChange={() => setTestScenario('SUCCESS')}
                      />
                      <span>Başarılı Ödeme (Direct Success)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-900">
                      <input
                        type="radio"
                        name="scenario"
                        value="3DS"
                        checked={testScenario === '3DS'}
                        onChange={() => setTestScenario('3DS')}
                      />
                      <span>3D Secure Doğrulaması</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-900">
                      <input
                        type="radio"
                        name="scenario"
                        value="FAIL"
                        checked={testScenario === 'FAIL'}
                        onChange={() => setTestScenario('FAIL')}
                      />
                      <span>Başarısız Ödeme (Bakiye Yetersiz)</span>
                    </label>
                  </div>
                </div>
              )}


              {/* Legal Checkboxes */}
              <div className="space-y-2 pt-2 text-xs text-[#555555]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedKvkk}
                    onChange={(e) => setAcceptedKvkk(e.target.checked)}
                    className="mt-0.5 rounded text-[#6F7255]"
                  />
                  <span>
                    <strong>KVKK Aydınlatma Metnini</strong> ve kişisel verilerimin işlenmesine ilişkin hususları okudum, kabul ediyorum.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#6F7255]"
                  />
                  <span>
                    <strong>Mesafeli Satış Sözleşmesi</strong> ve İptal/İade Koşullarını kabul ediyorum.
                  </span>
                </label>
              </div>
            </div>

            {/* Summary & Price Breakdown Panel */}
            <div className="lg:col-span-5 bg-[#2B2B2B] text-white p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#E7E1D3]/70 uppercase block">
                  ÖDEME ÖZETİ
                </span>
                <h4 className="font-serif text-2xl text-white">
                  {selectedRoom.name[currentLang] || selectedRoom.name.tr}
                </h4>
                <p className="text-xs text-[#E7E1D3]/80">
                  {checkIn} – {checkOut} ({nights} Gece, {guests} Misafir)
                </p>

                <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-[#E7E1D3]/80">
                    <span>Oda Konaklama Tutarı:</span>
                    <span>{currSymbol}{subtotalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-[#E7E1D3]/80">
                    <span>Vergiler (%10 KDV):</span>
                    <span>{currSymbol}{taxAmount.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-white font-serif text-xl pt-2 border-t border-white/10 font-bold">
                    <span>TOPLAM TUTAR:</span>
                    <span className="text-[#E7E1D3]">{currSymbol}{finalTotalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-full bg-[#6F7255] hover:bg-[#8E9272] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Ödeme İşleniyor...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Güvenli Ödemeyi Tamamla ({currSymbol}{finalTotalPrice.toLocaleString('tr-TR')})
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-full text-center text-xs text-[#E7E1D3]/70 hover:underline cursor-pointer"
                >
                  Bilgileri Düzenle
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 3D SECURE SIMULATION MODAL */}
      {show3DSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-6 border border-[#6F7255] shadow-2xl animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-[#6F7255] uppercase block">GÜVENLİ ÖDEME DOĞRULAMASI</span>
                <h3 className="font-serif text-2xl text-[#2B2B2B] mt-1">SMS Onay Kodu Girişi</h3>
              </div>

            <p className="text-xs text-[#555555]">
              Banka tarafından telefonunuza gönderilen tek kullanımlık 3D Secure onay şifresini onaylayınız.
            </p>

            <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#E7E1D3] text-left text-xs space-y-1">
              <div><span className="text-[#555555]">İşlem Tutarı:</span> <strong>{currSymbol}{finalTotalPrice.toLocaleString('tr-TR')}</strong></div>
              <div><span className="text-[#555555]">İşyeri Adı:</span> <strong>Nourla Boutique Hotel</strong></div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShow3DSModal(false)}
                className="w-1/2 py-3 rounded-xl border border-[#E7E1D3] text-xs font-semibold text-[#555555]"
              >
                İptal Et
              </button>
              <button
                type="button"
                onClick={handleApprove3DSecure}
                className="w-1/2 py-3 rounded-xl bg-[#6F7255] text-white text-xs font-semibold shadow-md hover:bg-[#4F523A]"
              >
                3D Şifresini Onayla ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROOM INSPECT MODAL */}
      <RoomInspectModal
        room={inspectingRoom}
        isOpen={Boolean(inspectingRoom)}
        onClose={() => setInspectingRoom(null)}
        onSelectAndBook={(roomId) => {
          setSelectedRoomId(roomId);
          setCurrentStep(3);
        }}
        currentLang={currentLang}
      />
    </div>
  );
}
