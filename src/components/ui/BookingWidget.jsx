import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  Coffee,
  Tag,
  CheckSquare,
  Square,
  Printer,
} from 'lucide-react';
import { ROOMS_DATA } from '../../data/rooms';
import LuxuryDatePickerModal from './LuxuryDatePickerModal';
import {
  getPrices,
  createReservation,
  createPaymentSession,
  process3DSecureVerification,
  getTcmbRates,
  getHotelDefinitions,
} from '../../services/api';

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
  const [searchParams] = useSearchParams();
  const currentLang = lang || i18n.language || 'tr';

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getAfterTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  // Search parameters from URL if coming from Hero Quick Search
  const paramCheckIn = searchParams.get('checkIn');
  const paramCheckOut = searchParams.get('checkOut');
  const paramGuests = searchParams.get('guests');
  const paramCurrency = searchParams.get('currency');
  const paramRoom = searchParams.get('room');
  const paramStep = searchParams.get('step');

  // Step state (1: Dates, 2: Room, 3: Guest, 4: Payment, 5: Confirmation)
  const [currentStep, setCurrentStep] = useState(
    paramStep === '2' || paramCheckIn ? 2 : 1
  );

  // Custom Luxury Date Picker Modal State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState('checkIn');

  useEffect(() => {
    if (isDatePickerOpen) {
      document.body.setAttribute('data-datepicker-open', 'true');
    } else {
      document.body.removeAttribute('data-datepicker-open');
    }
    window.dispatchEvent(new CustomEvent('nourla:datepicker-state', { detail: { open: isDatePickerOpen } }));
  }, [isDatePickerOpen]);

  const openDatePicker = (target = 'checkIn') => {
    setDatePickerTarget(target);
    setIsDatePickerOpen(true);
  };

  // Search parameters state
  const [checkIn, setCheckIn] = useState(paramCheckIn || getTomorrowStr());
  const [checkOut, setCheckOut] = useState(paramCheckOut || getAfterTomorrowStr());
  const [selectedRoomId, setSelectedRoomId] = useState(paramRoom || preselectedRoomId || ROOMS_DATA[0].id);
  const [guests, setGuests] = useState(paramGuests || '2');
  const [currency, setCurrency] = useState(paramCurrency || 'TRY');
  const [promoCode, setPromoCode] = useState('ONLINE');

  // TCMB & ElektraWeb Live Data State
  const [tcmbRates, setTcmbRates] = useState({ TRY: 1, USD: 47.96, EUR: 52.81 });
  const [elektraDefinitions, setElektraDefinitions] = useState({});

  // Availability & Pricing State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveOffers, setLiveOffers] = useState({});
  const [apiError, setApiError] = useState(null);

  // Selected Board Type per room (default 'BB' = Kahvaltı Dahil)
  const [selectedBoardChoice, setSelectedBoardChoice] = useState({});
  // Inline photo gallery active index per room
  const [activePhotoMap, setActivePhotoMap] = useState({});

  // Multi-Room Cart State: { [cartKey]: { cartKey, room, boardChoice, quantity, offer } }
  const [roomCart, setRoomCart] = useState({});

  const addToCart = (room, boardChoice) => {
    const cartKey = `${room.id}_${boardChoice}`;
    const roomOffersGroup = liveOffers[room.elektraRoomTypeId] || liveOffers[String(room.elektraRoomTypeId)];
    const offer = (boardChoice === 'RO' ? roomOffersGroup?.offers?.RO : roomOffersGroup?.offers?.BB) || roomOffersGroup?.bestOffer;
    if (!offer) return;
    const maxAvail = offer.availableRooms || 1;

    setRoomCart((prev) => {
      const existing = prev[cartKey];
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty >= maxAvail) return prev;
      return {
        ...prev,
        [cartKey]: {
          cartKey,
          room,
          boardChoice,
          quantity: currentQty + 1,
          offer,
        },
      };
    });
  };

  const removeFromCart = (cartKey) => {
    setRoomCart((prev) => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const copy = { ...prev };
        delete copy[cartKey];
        return copy;
      }
      return {
        ...prev,
        [cartKey]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  };

  const cartItems = Object.values(roomCart);
  const totalSelectedRoomsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  const primaryCartItem = cartItems[0];
  const selectedRoom = primaryCartItem?.room || ROOMS_DATA.find((r) => r.id === selectedRoomId) || ROOMS_DATA[0];

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  useEffect(() => {
    fetchTcmbRates();
    fetchElektraDefinitions();
  }, []);

  useEffect(() => {
    fetchLivePrices();
  }, [checkIn, checkOut, guests, currency]);

  const fetchTcmbRates = async () => {
    try {
      const res = await getTcmbRates();
      if (res && res.rates) {
        setTcmbRates(res.rates);
      }
    } catch (err) {
      console.warn('[TCMB RATES FETCH] Fallback to default rates:', err.message);
    }
  };

  const fetchElektraDefinitions = async () => {
    try {
      const defRes = await getHotelDefinitions(currentLang);
      if (defRes && defRes.roomTypes) {
        const map = {};
        defRes.roomTypes.forEach((rt) => {
          if (rt.id) map[rt.id] = rt;
        });
        setElektraDefinitions(map);
      }
    } catch (err) {
      console.warn('[ELEKTRA DEFINITIONS FETCH]:', err.message);
    }
  };

  const handleCheckInChange = (newDate) => {
    const today = getTodayStr();
    const validCheckIn = newDate < today ? today : newDate;
    setCheckIn(validCheckIn);

    const cin = new Date(validCheckIn);
    const cout = new Date(checkOut);
    if (cout <= cin) {
      const nextDay = new Date(cin);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (newDate) => {
    const cin = new Date(checkIn);
    const cout = new Date(newDate);
    if (cout <= cin) {
      const nextDay = new Date(cin);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    } else {
      setCheckOut(newDate);
    }
  };

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
          let avail = 0;
          if (rawOffer.availableRooms !== undefined) {
            avail = rawOffer.availableRooms;
          } else if (rawOffer['room-to-sell'] !== undefined) {
            avail = rawOffer['room-to-sell'];
          } else if (Array.isArray(rawOffer['availability-arr']) && rawOffer['availability-arr'].length > 0) {
            avail = Math.min(...rawOffer['availability-arr']);
          }

          // PMS Stop Sell check
          const rateRules = rawOffer['rate-rules'] || rawOffer.rateRules;
          if (rateRules && (rateRules['stop-sell'] || rateRules['stop-sell-closed-to-arrival'])) {
            avail = 0;
          }

          const boardName = rawOffer.boardName || rawOffer['board-type'] || 'BB';
          const rateName = rawOffer.rateName || rawOffer['rate-type'] || '';
          const boardTypeId = rawOffer.boardTypeId || rawOffer['board-type-id'] || 893;
          const rateTypeId = rawOffer.rateTypeId || rawOffer['rate-type-id'] || 792;
          const rateCodeId = rawOffer.rateCodeId || rawOffer['rate-code-id'] || 6844;
          const priceAgencyId = rawOffer.priceAgencyId || rawOffer['price-agency-id'] || 44573;
          const curr = rawOffer.currency || currency;

          const includesBreakfast = rawOffer.includesBreakfast !== undefined
            ? rawOffer.includesBreakfast
            : (!String(boardName).toUpperCase().includes('RO'));

          const boardTitle = rawOffer.boardTitle || (includesBreakfast ? {
            tr: 'Zengin Organik Ege Kahvaltısı Dahil',
            en: 'Rich Organic Aegean Breakfast Included',
            de: 'Inklusive Organisches Bio-Frühstück',
            ru: 'Органический эгейский завтрак включен',
          } : {
            tr: 'Sadece Oda (Kahvaltısız)',
            en: 'Room Only (No Breakfast)',
            de: 'Nur Übernachtung (Ohne Frühstück)',
            ru: 'Только проживание (Без завтрака)',
          });

          const rawOriginalPrice = rawOffer.originalPrice || rawOffer['original-price'] || rawOffer['list-price'] || rawOffer['rack-rate'];
          const rawDiscountPercent = rawOffer.discountPercent || rawOffer['discount-percent'] || 0;

          // Check if October campaign or promo code ONLINE is active
          const isOctoberPromo = checkIn >= '2026-10-01' && checkIn <= '2026-10-31';
          const isPromoActive = Boolean((promoCode && promoCode.toUpperCase() === 'ONLINE') || isOctoberPromo);

          let originalPrice = rawOriginalPrice ? Number(rawOriginalPrice) : null;
          let originalPricePerNight = originalPrice ? Math.round((originalPrice / days) * 100) / 100 : null;
          let discountPercent = rawDiscountPercent > 0 ? rawDiscountPercent : 0;

          if (isPromoActive && (!discountPercent || discountPercent === 0)) {
            discountPercent = 5;
            originalPricePerNight = Math.round((nightP / 0.95) * 100) / 100;
            originalPrice = Math.round((totPrice / 0.95) * 100) / 100;
          }

          const offer = {
            roomTypeId,
            totalPrice: totPrice,
            pricePerNight: nightP,
            originalPrice,
            originalPricePerNight,
            discountPercent,
            hasDiscount: Boolean(discountPercent > 0 || (originalPricePerNight && originalPricePerNight > nightP)),
            availableRooms: avail,
            boardName,
            boardCode: rawOffer.boardCode || (includesBreakfast ? 'BB' : 'RO'),
            includesBreakfast,
            boardTitle,
            boardTypeId,
            rateName,
            rateTypeId,
            rateCodeId,
            priceAgencyId,
            currency: curr,
          };

          if (roomTypeId) {
            if (!offersMap[roomTypeId]) {
              offersMap[roomTypeId] = { offers: {}, bestOffer: null };
            }
            const bKey = includesBreakfast ? 'BB' : 'RO';
            if (!offersMap[roomTypeId].offers[bKey] || (avail > 0 && totPrice < offersMap[roomTypeId].offers[bKey].totalPrice)) {
              offersMap[roomTypeId].offers[bKey] = offer;
            }
            if (!offersMap[roomTypeId].bestOffer || (avail > 0 && totPrice < offersMap[roomTypeId].bestOffer.totalPrice)) {
              offersMap[roomTypeId].bestOffer = offer;
            }
          }
        });

        // Ensure every available room has both BB and RO board choices (derive if PMS returns 1 option)
        Object.keys(offersMap).forEach((rTypeId) => {
          const group = offersMap[rTypeId];
          if (group.offers.BB && !group.offers.RO) {
            const bb = group.offers.BB;
            const roTot = Math.round(bb.totalPrice * 0.88 * 100) / 100;
            const roNight = Math.round(bb.pricePerNight * 0.88 * 100) / 100;
            const roOrigNight = bb.originalPricePerNight ? Math.round(bb.originalPricePerNight * 0.88 * 100) / 100 : null;
            group.offers.RO = {
              ...bb,
              boardCode: 'RO',
              boardName: 'RO',
              includesBreakfast: false,
              totalPrice: roTot,
              pricePerNight: roNight,
              originalPricePerNight: roOrigNight,
              boardTitle: {
                tr: 'Sadece Oda (Kahvaltısız)',
                en: 'Room Only (No Breakfast)',
                de: 'Nur Übernachtung (Ohne Frühstück)',
                ru: 'Только проживание (Без завтрака)',
              },
            };
          } else if (group.offers.RO && !group.offers.BB) {
            const ro = group.offers.RO;
            const bbTot = Math.round(ro.totalPrice * 1.14 * 100) / 100;
            const bbNight = Math.round(ro.pricePerNight * 1.14 * 100) / 100;
            const bbOrigNight = ro.originalPricePerNight ? Math.round(ro.originalPricePerNight * 1.14 * 100) / 100 : null;
            group.offers.BB = {
              ...ro,
              boardCode: 'BB',
              boardName: 'BB',
              includesBreakfast: true,
              totalPrice: bbTot,
              pricePerNight: bbNight,
              originalPricePerNight: bbOrigNight,
              boardTitle: {
                tr: 'Zengin Organik Ege Kahvaltısı Dahil',
                en: 'Rich Organic Aegean Breakfast Included',
                de: 'Inklusive Organisches Bio-Frühstück',
                ru: 'Органический эгейский завтрак включен',
              },
            };
          }
        });

        setLiveOffers(offersMap);
      } else {
        setLiveOffers({});
      }
    } catch (err) {
      console.warn('[RESERVATION WIDGET] Price fetch fallback:', err.message);
      setLiveOffers({});
    } finally {
      setIsSearching(false);
    }
  };

  const currSymbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺');
  
  // Price breakdown for multi-room cart (strictly zero if cart empty)
  const isSelectedRoomLiveAvailable = totalSelectedRoomsCount > 0;
  const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.offer ? Math.round(item.offer.totalPrice * item.quantity) : 0), 0);
  const taxAmount = Math.round(subtotalPrice * 0.10); // 10% VAT
  const finalTotalPrice = subtotalPrice + taxAmount;
  const roomPricePerNight = totalSelectedRoomsCount > 0 ? Math.round(subtotalPrice / (nights || 1)) : 0;

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

    if (totalSelectedRoomsCount === 0 || cartItems.length === 0) {
      setApiError('Lütfen devam etmek için en az bir oda seçiniz.');
      return;
    }

    setIsProcessing(true);
    setApiError(null);

    try {
      const roomSummaryNotes = cartItems
        .map(
          (item) =>
            `${item.quantity}x ${item.room.name.tr} (${item.boardChoice === 'BB' ? 'Kahvaltılı' : 'Kahvaltısız'})`
        )
        .join(', ');

      const fullNotes = `${specialNotes ? specialNotes + ' | ' : ''}Kiralanan Odalar: ${roomSummaryNotes}`;

      const pendingRes = await createReservation({
        roomTypeId: selectedRoom.elektraRoomTypeId,
        checkIn,
        checkOut,
        adultCount: parseInt(guests, 10),
        guestName,
        guestEmail,
        guestPhone,
        specialNotes: fullNotes,
        currency,
        totalPrice: finalTotalPrice,
      });

      if (pendingRes && pendingRes.success) {
        setCreatedReservation(pendingRes);
        setCurrentStep(4);
      } else {
        throw new Error(pendingRes?.error?.message || 'Rezervasyon kaydı oluşturulamadı.');
      }
    } catch (err) {
      console.error('[PROCEED PAYMENT ERROR]', err.message);
      setApiError(err.message || 'Rezervasyon oluşturulurken bir hata meydana geldi.');
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
          <div className="pb-4 border-b border-[#E7E1D3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#6F7255] font-semibold uppercase tracking-wider block">
                SEÇİLEN ODALAR VE PANSİYON DÖKÜMÜ ({totalSelectedRoomsCount || 1} ODA)
              </span>
              <span className="font-mono text-sm font-bold text-[#2B2B2B] bg-[#E7E1D3] px-3 py-1 rounded-lg">
                {resCode}
              </span>
            </div>

            <div className="space-y-2">
              {(cartItems.length > 0 ? cartItems : [{ room: selectedRoom, boardChoice: 'BB', quantity: 1, offer: { totalPrice: finalTotalPrice, pricePerNight: roomPricePerNight } }]).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E1D3] text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.room.image} alt="" className="w-14 h-11 object-cover rounded-lg shadow-2xs shrink-0" />
                    <div>
                      <h5 className="font-serif font-bold text-[#2B2B2B]">{item.quantity}x {item.room.name[currentLang] || item.room.name.tr}</h5>
                      <span className="text-[10px] text-[#6F7255]">
                        Paket: {item.boardChoice === 'BB' ? 'Organik Kahvaltı Dahil' : 'Sadece Oda (Kahvaltısız)'}
                      </span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-[#6F7255]">
                    {currSymbol}{(Math.round(item.offer?.totalPrice || 0) * item.quantity).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))}
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
            {/* GİRİŞ TARİHİ KUTUSU - HER YERİNE TIKLANABİLİR */}
            <div
              onClick={() => openDatePicker('checkIn')}
              className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255] cursor-pointer transition-all flex flex-col justify-between group shadow-2xs hover:shadow-md"
            >
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6F7255]" /> Giriş Tarihi
                </span>
                <span className="text-[10px] text-[#6F7255] bg-white px-2 py-0.5 rounded-full border border-[#E7E1D3] font-semibold group-hover:bg-[#6F7255] group-hover:text-white transition-all">
                  Seç / Değiştir
                </span>
              </label>
              <div className="flex items-center justify-between pt-1">
                <span className="font-serif text-lg font-semibold text-[#2B2B2B] group-hover:text-[#6F7255] transition-colors">
                  {checkIn ? checkIn.split('-').reverse().join('.') : 'Tarih Seçin'}
                </span>
              </div>
            </div>

            {/* ÇIKIŞ TARİHİ KUTUSU - HER YERİNE TIKLANABİLİR */}
            <div
              onClick={() => openDatePicker('checkOut')}
              className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] hover:border-[#6F7255] cursor-pointer transition-all flex flex-col justify-between group shadow-2xs hover:shadow-md"
            >
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6F7255] mb-1.5 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6F7255]" /> Çıkış Tarihi
                </span>
                <span className="text-[10px] text-[#6F7255] bg-white px-2 py-0.5 rounded-full border border-[#E7E1D3] font-semibold group-hover:bg-[#6F7255] group-hover:text-white transition-all">
                  Seç / Değiştir
                </span>
              </label>
              <div className="flex items-center justify-between pt-1">
                <span className="font-serif text-lg font-semibold text-[#2B2B2B] group-hover:text-[#6F7255] transition-colors">
                  {checkOut ? checkOut.split('-').reverse().join('.') : 'Tarih Seçin'}
                </span>
              </div>
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
                <Building className="w-3.5 h-3.5" /> Para Birimi
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#2B2B2B] focus:outline-none cursor-pointer"
              >
                <option value="TRY">₺ TRY (Türk Lirası)</option>
                <option value="EUR">€ EUR (Euro - TCMB)</option>
                <option value="USD">$ USD (Dolar - TCMB)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6F7255] pt-1">
            <span className="italic flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              TCMB Canlı Kur: 1 USD = {tcmbRates.USD} ₺ | 1 EUR = {tcmbRates.EUR} ₺
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            disabled={isSearching}
            className="w-full py-4 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#4F523A] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> ElektraWeb Canlı Müsaitlik Sorgulanıyor...
              </>
            ) : (
              <>
                Müsait Odaları Gör <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2: ROOM SELECTION */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E7E1D3] flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase block">ADIM 2</span>
              <h3 className="font-serif text-xl text-[#2B2B2B]">Oda Seçimi</h3>
              <p className="text-xs text-[#555555]">
                {checkIn} — {checkOut} ({nights} Gece, {guests} Yetişkin)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#6F7255] font-medium underline cursor-pointer"
            >
              Tarihleri Değiştir
            </button>
          </div>

          {/* PROMO / KUPON KODU ÇUBUĞU */}
          <div className="bg-[#F7F4EE] p-3 sm:p-4 rounded-2xl border border-[#E7E1D3] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6F7255] uppercase tracking-wider block">PROMOSYON KODU & KAMPANYA İNDİRİMİ</span>
                <span className="text-[11px] text-[#555555]">
                  {promoCode.toUpperCase() === 'ONLINE' || (checkIn >= '2026-10-01' && checkIn <= '2026-10-31')
                    ? '✓ %5 ERKEN REZERVASYON İNDİRİMİ CANLI ODALARA UYGULANDI'
                    : 'Özel kupon kodunuzu girerek uygulayabilirsiniz.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Kupon Kodu"
                className="px-3 py-2 rounded-xl bg-white border border-[#E7E1D3] text-xs font-mono font-bold text-[#2B2B2B] focus:border-[#6F7255] focus:outline-none uppercase w-full sm:w-32"
              />
              <button
                type="button"
                onClick={fetchLivePrices}
                className="px-4 py-2 rounded-xl bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-xs"
              >
                Uygula
              </button>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {displayRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const roomName = room.name[currentLang] || room.name.tr;
              const roomDesc = room.description[currentLang] || room.description.tr;

              const roomOffersGroup = liveOffers[room.elektraRoomTypeId] || liveOffers[String(room.elektraRoomTypeId)];
              const bbOffer = roomOffersGroup?.offers?.BB;
              const roOffer = roomOffersGroup?.offers?.RO;
              const bestOffer = roomOffersGroup?.bestOffer;

              const currentBoardChoice = selectedBoardChoice[room.id] || 'BB';
              const activeOffer = (currentBoardChoice === 'RO' ? roOffer : bbOffer) || bestOffer;

              const isRoomAvailable = Boolean(hasSearched && activeOffer && activeOffer.totalPrice > 0 && activeOffer.availableRooms > 0);
              
              // ElektraWeb PMS Definitions Mapping
              const pmsDef = elektraDefinitions[room.elektraRoomTypeId] || elektraDefinitions[String(room.elektraRoomTypeId)];
              const roomSize = pmsDef?.area ? `${pmsDef.area} m²` : room.size;
              const roomCapacity = pmsDef?.maxAdults ? `${pmsDef.maxAdults} Misafir` : room.capacity;

              // Extract PMS live features dynamically
              const pmsFeatures = [];
              if (pmsDef) {
                if (pmsDef.hasWifi) pmsFeatures.push('Yüksek Hızlı Wi-Fi');
                if (pmsDef.hasSafe) pmsFeatures.push('Emanet Kasası');
                if (pmsDef.hasPrivateBath) pmsFeatures.push('Özel Mermer Banyo');
                if (pmsDef.hasBalcony) pmsFeatures.push('Özel Veranda / Balkon');
                if (pmsDef.hasHairdryer) pmsFeatures.push('Saç Kurutma Makinesi');
              }
              const displayedFeatures = Array.from(new Set([...pmsFeatures, ...(room.features || [])]));

              const activePhoto = activePhotoMap[room.id] || room.image;

              return (
                <div
                  key={room.id}
                  className={`rounded-2xl sm:rounded-3xl border transition-all p-4 sm:p-7 space-y-4 sm:space-y-6 ${
                    !isRoomAvailable
                      ? 'border-stone-200 bg-stone-50/60 opacity-70'
                      : isSelected
                      ? 'border-[#6F7255] bg-[#FDFBF7] shadow-lg ring-1 ring-[#6F7255]/30'
                      : 'border-[#E7E1D3] bg-[#FDFBF7] hover:border-[#6F7255]/50 shadow-xs'
                  }`}
                >
                  {/* Upper Section: Photo Gallery & Specification */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
                    
                    {/* Photo Gallery Column */}
                    <div className="md:col-span-5 space-y-2">
                      <div className="aspect-[16/10] md:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs relative border border-[#E7E1D3]">
                        <img src={activePhoto} alt={roomName} className={`w-full h-full object-cover ${!isRoomAvailable ? 'grayscale' : ''}`} />
                        <span className="absolute bottom-2 left-2 bg-[#2B2B2B]/85 text-white text-[10px] font-medium tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                          {roomSize}
                        </span>
                      </div>

                      {/* Photo Thumbnails */}
                      {room.gallery && room.gallery.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                          <button
                            type="button"
                            onClick={() => setActivePhotoMap((prev) => ({ ...prev, [room.id]: room.image }))}
                            className={`w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                              activePhoto === room.image ? 'border-[#6F7255] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={room.image} alt="" className="w-full h-full object-cover" />
                          </button>
                          {room.gallery.map((img, gIdx) => (
                            <button
                              key={gIdx}
                              type="button"
                              onClick={() => setActivePhotoMap((prev) => ({ ...prev, [room.id]: img }))}
                              className={`w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                activePhoto === img ? 'border-[#6F7255] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Room Details Column */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-[#E7E1D3]/80">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif text-xl sm:text-2xl text-[#2B2B2B]">{roomName}</h4>
                            {isRoomAvailable ? (
                              <span className="text-[10px] font-semibold text-[#6F7255] bg-[#6F7255]/10 px-2.5 py-0.5 rounded-full border border-[#6F7255]/20 uppercase tracking-wider">
                                Müsait ({activeOffer.availableRooms} Oda)
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200 uppercase tracking-wider">
                                Dolu / Kapalı
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#6F7255] italic block mt-0.5 font-serif">{room.view[currentLang] || room.view.tr}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#555555]">
                          <span className="flex items-center gap-1 font-light bg-[#F7F4EE] px-2.5 py-1 rounded-full border border-[#E7E1D3] text-[11px]">
                            <Maximize2 className="w-3 h-3 text-[#6F7255]" /> {roomSize}
                          </span>
                          <span className="flex items-center gap-1 font-light bg-[#F7F4EE] px-2.5 py-1 rounded-full border border-[#E7E1D3] text-[11px]">
                            <Users className="w-3 h-3 text-[#6F7255]" /> {roomCapacity}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#555555] font-light leading-relaxed line-clamp-3 sm:line-clamp-none">{roomDesc}</p>

                      {/* Full Features & Amenities Badges (Scrollable on mobile) */}
                      <div className="pt-1">
                        <span className="text-[10px] font-semibold tracking-[0.15em] text-[#6F7255] uppercase block mb-1.5">
                          ELEKTRAWEB CANLI ODA ÖZELLİKLERİ
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap scrollbar-none">
                          {displayedFeatures.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-[#F7F4EE] border border-[#E7E1D3] text-[11px] text-[#2B2B2B] font-light"
                            >
                              <Sparkles className="w-3 h-3 text-[#6F7255]" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lower Section: Elegant Segmented Board Selection */}
                  {isRoomAvailable ? (
                    <div className="pt-3 sm:pt-4 border-t border-[#E7E1D3] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold tracking-[0.15em] text-[#6F7255] uppercase block">
                          PAKET VE KAHVALTI TERCİHİ
                        </span>
                        <div className="flex items-center gap-2">
                          {activeOffer?.discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              🔥 %{activeOffer.discountPercent} İndirimli
                            </span>
                          )}
                          <span className="text-[10px] text-[#555555] font-light">
                            ElektraWeb Canlı Fiyat
                          </span>
                        </div>
                      </div>

                      {/* Single-line Compact Segmented Switch Pill Bar */}
                      <div className="bg-[#F7F4EE] p-1 rounded-xl border border-[#E7E1D3] grid grid-cols-2 gap-1 shadow-2xs">
                        
                        {/* Left Segment: Kahvaltı Dahil (BB) */}
                        {bbOffer && (
                          <button
                            type="button"
                            onClick={() => setSelectedBoardChoice((prev) => ({ ...prev, [room.id]: 'BB' }))}
                            className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-between gap-1 cursor-pointer ${
                              currentBoardChoice === 'BB'
                                ? 'bg-white text-[#2B2B2B] shadow-xs border border-[#6F7255]/40 font-semibold ring-1 ring-[#6F7255]/20'
                                : 'text-[#555555] hover:text-[#2B2B2B] hover:bg-white/60 font-light'
                            }`}
                          >
                            <span className="text-[11px] truncate flex items-center gap-1">
                              <Coffee className="w-3.5 h-3.5 text-[#6F7255] shrink-0" />
                              Kahvaltılı
                            </span>
                            <div className="text-right shrink-0 leading-none">
                              {bbOffer.originalPricePerNight && bbOffer.originalPricePerNight > bbOffer.pricePerNight && (
                                <span className="text-[9px] text-stone-400 line-through block font-normal leading-none mb-0.5">
                                  {currSymbol}{Math.round(bbOffer.originalPricePerNight).toLocaleString('tr-TR')}
                                </span>
                              )}
                              <span className="font-serif text-xs font-bold text-[#6F7255]">
                                {currSymbol}{Math.round(bbOffer.pricePerNight).toLocaleString('tr-TR')}
                              </span>
                            </div>
                          </button>
                        )}

                        {/* Right Segment: Kahvaltısız (RO) */}
                        {roOffer && (
                          <button
                            type="button"
                            onClick={() => setSelectedBoardChoice((prev) => ({ ...prev, [room.id]: 'RO' }))}
                            className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-between gap-1 cursor-pointer ${
                              currentBoardChoice === 'RO'
                                ? 'bg-white text-[#2B2B2B] shadow-xs border border-[#6F7255]/40 font-semibold ring-1 ring-[#6F7255]/20'
                                : 'text-[#555555] hover:text-[#2B2B2B] hover:bg-white/60 font-light'
                            }`}
                          >
                            <span className="text-[11px] truncate flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-[#6F7255] shrink-0" />
                              Kahvaltısız
                            </span>
                            <div className="text-right shrink-0 leading-none">
                              {roOffer.originalPricePerNight && roOffer.originalPricePerNight > roOffer.pricePerNight && (
                                <span className="text-[9px] text-stone-400 line-through block font-normal leading-none mb-0.5">
                                  {currSymbol}{Math.round(roOffer.originalPricePerNight).toLocaleString('tr-TR')}
                                </span>
                              )}
                              <span className="font-serif text-xs font-bold text-[#6F7255]">
                                {currSymbol}{Math.round(roOffer.pricePerNight).toLocaleString('tr-TR')}
                              </span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Package Description Line */}
                      <p className="text-[11px] text-[#555555] font-light italic px-1">
                        {currentBoardChoice === 'BB'
                          ? '✓ Bahçeden toplanan organik taze ürünler ile hazırlanan Ege serpme kahvaltısı dahildir.'
                          : '✓ Kahvaltısız oda konaklama paketidir.'}
                      </p>

                      {/* Multi-Room Cart Stepper & Action Controls */}
                      {(() => {
                        const cartKey = `${room.id}_${currentBoardChoice}`;
                        const itemInCart = roomCart[cartKey];

                        return itemInCart ? (
                          <div className="flex items-center justify-between gap-3 bg-[#F7F4EE] p-2 rounded-full border border-[#6F7255]/40 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => removeFromCart(cartKey)}
                              className="w-9 h-9 rounded-full bg-white text-[#2B2B2B] border border-[#E7E1D3] hover:bg-stone-100 flex items-center justify-center font-bold text-sm shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                              -
                            </button>
                            <div className="text-center">
                              <span className="text-xs font-bold text-[#2B2B2B] block">
                                {itemInCart.quantity} Adet {currentBoardChoice === 'BB' ? 'Kahvaltılı' : 'Kahvaltısız'} Oda Seçildi
                              </span>
                              <span className="text-[10px] text-[#6F7255]">
                                Gecelik {currSymbol}{(Math.round(activeOffer.pricePerNight) * itemInCart.quantity).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => addToCart(room, currentBoardChoice)}
                              disabled={itemInCart.quantity >= activeOffer.availableRooms}
                              className="w-9 h-9 rounded-full bg-[#6F7255] text-white hover:bg-[#4F523A] disabled:opacity-40 flex items-center justify-center font-bold text-sm shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(room, currentBoardChoice)}
                            className="w-full py-3.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                          >
                            Odayı Sepete Ekle ({currSymbol}{Math.round(activeOffer.pricePerNight).toLocaleString('tr-TR')}/gece) +
                          </button>
                        );
                      })()}

                    </div>
                  ) : (
                    <div className="pt-3 border-t border-[#E7E1D3] flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-light italic">
                        Seçilen tarihlerde ElektraWeb sisteminde dolu veya kapalıdır.
                      </span>
                      <button
                        type="button"
                        disabled
                        className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                      >
                        Müsaitlik Yok
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FLOATING LUXURY CART SUMMARY BAR */}
          {totalSelectedRoomsCount > 0 && (
            <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto animate-fadeIn">
              <div className="bg-[#2B2B2B] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-[#6F7255] flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6F7255] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    {totalSelectedRoomsCount}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#E7E1D3] uppercase tracking-wider block">
                      SEÇİLEN ODALAR SEPETİ ({totalSelectedRoomsCount} ODA)
                    </span>
                    <p className="text-[11px] text-stone-300 font-light truncate max-w-xs sm:max-w-md">
                      {cartItems.map((item) => `${item.quantity}x ${item.room.name.tr} (${item.boardChoice === 'BB' ? 'Kahvaltılı' : 'Kahvaltısız'})`).join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-[#E7E1D3]/80 uppercase block">Toplam Tutar</span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#E7E1D3]">
                      {currSymbol}{finalTotalPrice.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 rounded-full bg-[#6F7255] hover:bg-[#8E9272] text-white text-xs font-semibold uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    Devam Et <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  ÖDEME ÖZETİ ({totalSelectedRoomsCount || 1} ODA)
                </span>
                <div className="space-y-1.5 border-b border-white/10 pb-2">
                  {(cartItems.length > 0 ? cartItems : [{ room: selectedRoom, boardChoice: 'BB', quantity: 1, offer: { totalPrice: subtotalPrice } }]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-serif text-[#E7E1D3]">
                        {item.quantity}x {item.room.name[currentLang] || item.room.name.tr} ({item.boardChoice === 'BB' ? 'Kahvaltılı' : 'Kahvaltısız'})
                      </span>
                      <span className="font-serif font-bold text-white">
                        {currSymbol}{(Math.round(item.offer?.totalPrice || 0) * item.quantity).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#E7E1D3]/80">
                  {checkIn} – {checkOut} ({nights} Gece, {guests} Misafir)
                </p>

                <div className="pt-3 space-y-2 text-xs">
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



      {/* LUXURY DATE PICKER MODAL */}
      <LuxuryDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        checkIn={checkIn}
        checkOut={checkOut}
        onSelectDates={(newCin, newCout) => {
          setCheckIn(newCin);
          setCheckOut(newCout);
        }}
        currency={currency}
        tcmbRates={tcmbRates}
        initialTarget={datePickerTarget}
      />
    </div>
  );
}
