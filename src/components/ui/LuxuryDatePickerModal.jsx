import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, AlertCircle, Loader2 } from 'lucide-react';

// Direct fetch — bypass any service-layer cache, always get fresh data
// signal: AbortSignal — modal kapanınca veya ay değişince devam eden istekleri iptal eder
async function fetchPricesRaw({ fromdate, todate, adult = 2, currency, language = 'TR', signal }) {
  const query = new URLSearchParams({ fromdate, todate, adult: String(adult), currency, language });
  const res = await fetch(`/api/booking/price?${query}`, {
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    signal,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data && data.success && Array.isArray(data.offers)) ? data.offers : [];
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function LuxuryDatePickerModal({
  isOpen,
  onClose,
  checkIn,
  checkOut,
  onSelectDates,
  currency = 'TRY',
  tcmbRates = { TRY: 1, USD: 47.96, EUR: 52.81 },
  initialTarget = 'checkIn',
}) {
  const [activeTarget, setActiveTarget] = useState(initialTarget); // 'checkIn' or 'checkOut'
  const [tempCheckIn, setTempCheckIn] = useState(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState(checkOut);

  // Calendar month view state
  const [viewDate, setViewDate] = useState(() => {
    const base = checkIn ? new Date(checkIn) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [monthData, setMonthData] = useState({});
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTarget(initialTarget);
      setTempCheckIn(checkIn);
      setTempCheckOut(checkOut);
      const base = checkIn ? new Date(checkIn) : new Date();
      setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
    }
  }, [isOpen, initialTarget, checkIn, checkOut]);

  // Client-side in-memory cache for months: { '2026-8-TRY': dayMap }
  const monthCacheRef = useRef({});

  // AbortController ref — ay değişince veya modal kapanınca eski fetch'i iptal et
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const cacheKey = `${year}-${month}-${currency}`;

      // 1. Önbellekte varsa ANINDA (0ms) göster
      if (monthCacheRef.current[cacheKey]) {
        setMonthData(monthCacheRef.current[cacheKey]);
        setIsLoadingMonth(false);
        return;
      }

      // 2. Önbellekte yoksa ElektraWeb'den sorgula
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      fetchMonthPrices(controller.signal);
    } else {
      // Modal kapandı: devam eden fetch'i iptal et
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, viewDate, currency]);

  const fetchMonthPrices = async (signal) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cacheKey = `${year}-${month}-${currency}`;

    setIsLoadingMonth(true);
    setMonthData({}); // ← Yeni ay için yükleme durumunu başlat
    const todayStr = new Date().toISOString().split('T')[0];

    const lastDayNum = new Date(year, month + 1, 0).getDate();
    let fromStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    if (fromStr < todayStr) {
      fromStr = todayStr;
    }
    const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;

    if (fromStr >= toStr) {
      setMonthData({});
      setIsLoadingMonth(false);
      return;
    }

    try {
      const dayMap = {};

      const populateDayMapFromOffers = (offerList, sliceStartStr) => {
        if (!Array.isArray(offerList) || offerList.length === 0) return;
        const sliceStartDate = new Date(sliceStartStr + 'T00:00:00Z');

        offerList.forEach((rawOffer) => {
          const priceArr = rawOffer.priceArr || rawOffer['price-arr'] || rawOffer.rawOffer?.['price-arr'] || [];
          const availArr = rawOffer.availabilityArr || rawOffer['availability-arr'] || rawOffer.rawOffer?.['availability-arr'] || [];

          const rateRules = rawOffer.rawOffer?.['rate-rules'] || rawOffer.rateRules;
          const isStopped = rateRules && (rateRules['stop-sell'] || rateRules['stop-sell-closed-to-arrival']);

          if (priceArr.length > 0) {
            priceArr.forEach((priceVal, idx) => {
              const currDate = new Date(sliceStartDate.getTime() + idx * 86400000);
              const dateKey = currDate.toISOString().split('T')[0];

              if (!dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) return;

              let avail = 0;
              if (!isStopped) {
                if (Array.isArray(availArr) && availArr[idx] !== undefined) {
                  avail = availArr[idx];
                } else if (rawOffer.availableRooms !== undefined) {
                  avail = rawOffer.availableRooms;
                } else if (rawOffer.rawOffer?.['room-to-sell'] !== undefined) {
                  avail = rawOffer.rawOffer['room-to-sell'];
                } else if (priceVal > 0) {
                  avail = 1;
                }
              }

              if (!dayMap[dateKey]) {
                dayMap[dateKey] = { available: false, minPrice: Infinity, availableRooms: 0 };
              }

              if (avail > 0 && priceVal > 0) {
                dayMap[dateKey].available = true;
                dayMap[dateKey].availableRooms = Math.max(dayMap[dateKey].availableRooms, avail);
                if (priceVal < dayMap[dateKey].minPrice) {
                  dayMap[dateKey].minPrice = Math.round(priceVal);
                }
              }
            });
          } else if (!isStopped && (rawOffer.pricePerNight || rawOffer.totalPrice)) {
            const avail = rawOffer.availableRooms || 1;
            const nightP = Math.round(rawOffer.pricePerNight || rawOffer.totalPrice);
            const startDay = parseInt(sliceStartStr.split('-')[2], 10);
            for (let d = startDay; d <= lastDayNum; d++) {
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              if (!dayMap[dateKey]) {
                dayMap[dateKey] = { available: false, minPrice: Infinity, availableRooms: 0 };
              }
              if (avail > 0 && nightP > 0) {
                dayMap[dateKey].available = true;
                dayMap[dateKey].availableRooms = Math.max(dayMap[dateKey].availableRooms, avail);
                if (nightP < dayMap[dateKey].minPrice) {
                  dayMap[dateKey].minPrice = nightP;
                }
              }
            }
          }
        });
      };

      // ── 1. İlk sorgu: ayın başından sonuna tam ay sorgusu ──────────────────────
      let fullOffers = await fetchPricesRaw({ fromdate: fromStr, todate: toStr, adult: 2, currency, language: 'TR', signal });

      if (fullOffers.length > 0) {
        populateDayMapFromOffers(fullOffers, fromStr);
      } else {
        // ── 2. Tam ay sorgusu 0 döndüyse (ayın başında kapalı/bloke günler var): ────
        //    Ayı 5 günlük paralel dilimlere bölerek tüm müsait günleri tespit et
        const startDayNum = parseInt(fromStr.split('-')[2], 10);
        const slices = [];
        for (let d = startDayNum; d < lastDayNum; d += 5) {
          const sEnd = Math.min(d + 5, lastDayNum);
          const sFrom = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const sTo = `${year}-${String(month + 1).padStart(2, '0')}-${String(sEnd).padStart(2, '0')}`;
          slices.push([sFrom, sTo]);
        }

        const sliceResults = await Promise.all(
          slices.map(async ([sFrom, sTo]) => {
            try {
              const offers = await fetchPricesRaw({ fromdate: sFrom, todate: sTo, adult: 2, currency, language: 'TR', signal });
              return { sFrom, offers };
            } catch {
              return { sFrom, offers: [] };
            }
          })
        );

        sliceResults.forEach(({ sFrom, offers }) => {
          if (offers && offers.length > 0) {
            populateDayMapFromOffers(offers, sFrom);
          }
        });
      }

      // ── 3. Ayın son günü price-arr'ın dışında kalabilir — önceki günden kopyala ─
      const lastMonthDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
      if (!dayMap[lastMonthDateKey]?.available) {
        const prevDayNum = lastDayNum - 1;
        const prevMonthDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
        if (dayMap[prevMonthDateKey]?.available) {
          dayMap[lastMonthDateKey] = { ...dayMap[prevMonthDateKey] };
        }
      }

      setMonthData(dayMap);
      monthCacheRef.current[cacheKey] = dayMap;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[MONTH CALENDAR] Fiyat verisi alınamadı:', err.message);
      setMonthData({});
    } finally {
      setIsLoadingMonth(false);
    }
  };

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Days matrix for current month view
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDayClick = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (dateStr < todayStr) return; // Disallow past dates

    const dayInfo = monthData[dateStr];
    const isAvailable = Boolean(dayInfo && dayInfo.available && dayInfo.minPrice !== Infinity);
    if (!isAvailable) return; // Disallow picking unavailable dates!

    if (activeTarget === 'checkIn') {
      setTempCheckIn(dateStr);
      // Auto-set checkOut to checkIn + 1 day
      const nextDay = new Date(year, month, dayNum + 1);
      const nextStr = nextDay.toISOString().split('T')[0];
      setTempCheckOut(nextStr);
      // Switch target to checkOut selection
      setActiveTarget('checkOut');
    } else {
      // Picking checkOut
      if (dateStr <= tempCheckIn) {
        // Reset checkIn & set checkOut to +1
        setTempCheckIn(dateStr);
        const nextDay = new Date(year, month, dayNum + 1);
        setTempCheckOut(nextDay.toISOString().split('T')[0]);
        setActiveTarget('checkOut');
      } else {
        setTempCheckOut(dateStr);
      }
    }
  };

  const handleConfirm = () => {
    onSelectDates(tempCheckIn, tempCheckOut);
    onClose();
  };

  const currSymbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FDFBF7] border border-[#E7E1D3] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="bg-[#6F7255] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80 block">
              NOURLA BOUTIQUE HOTEL
            </span>
            <h3 className="font-serif text-xl font-semibold">Tarih & Fiyat Takvimi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TARGET SELECTOR BAR (GİRİŞ - ÇIKIŞ) */}
        <div className="bg-[#F7F4EE] p-3 border-b border-[#E7E1D3] grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTarget('checkIn')}
            className={`p-3 rounded-2xl transition-all text-left border ${
              activeTarget === 'checkIn'
                ? 'bg-[#6F7255] text-white border-[#6F7255] shadow-sm'
                : 'bg-white text-[#2B2B2B] border-[#E7E1D3] hover:border-[#6F7255]'
            }`}
          >
            <span className="text-[10px] opacity-80 uppercase block">GİRİŞ TARİHİ</span>
            <span className="font-serif text-base">{tempCheckIn || 'Tarih Seçin'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTarget('checkOut')}
            className={`p-3 rounded-2xl transition-all text-left border ${
              activeTarget === 'checkOut'
                ? 'bg-[#6F7255] text-white border-[#6F7255] shadow-sm'
                : 'bg-white text-[#2B2B2B] border-[#E7E1D3] hover:border-[#6F7255]'
            }`}
          >
            <span className="text-[10px] opacity-80 uppercase block">ÇIKIŞ TARİHİ</span>
            <span className="font-serif text-base">{tempCheckOut || 'Tarih Seçin'}</span>
          </button>
        </div>

        {/* CALENDAR MONTH HEADER & NAV */}
        <div className="p-4 flex items-center justify-between border-b border-[#E7E1D3]/50">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-[#E7E1D3]/50 text-[#6F7255] cursor-pointer transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <span className="font-serif text-lg font-semibold text-[#2B2B2B]">
              {MONTH_NAMES[month]} {year}
            </span>
            {isLoadingMonth ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6F7255]/10 text-[#6F7255] text-[10px] font-semibold animate-pulse border border-[#6F7255]/20 mt-0.5">
                <Loader2 className="w-3 h-3 animate-spin text-[#6F7255]" />
                <span>ElektraWeb Canlı Fiyatlar Hazırlanıyor...</span>
              </div>
            ) : (
              <span className="text-[10px] text-[#888888] block mt-0.5">
                Giriş ve çıkış tarihinizi seçiniz
              </span>
            )}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-[#E7E1D3]/50 text-[#6F7255] cursor-pointer transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CALENDAR GRID BODY */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* WEEKDAYS HEADER */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#6F7255] mb-2 uppercase">
            {WEEKDAYS.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset padding */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isPast = dateStr < todayStr;
              const isCheckIn = dateStr === tempCheckIn;
              const isCheckOut = dateStr === tempCheckOut;
              const isInRange = tempCheckIn && tempCheckOut && dateStr > tempCheckIn && dateStr < tempCheckOut;

              // Shimmer skeleton when loading new month
              if (isLoadingMonth && !isPast) {
                return (
                  <div
                    key={`skeleton-${dateStr}`}
                    className="h-16 p-2 rounded-xl bg-[#F7F4EE] border border-[#E7E1D3]/70 flex flex-col items-center justify-between animate-pulse"
                  >
                    <span className="text-xs font-semibold text-[#888888]">{dayNum}</span>
                    <div className="w-9 h-3 bg-[#6F7255]/20 rounded-md" />
                  </div>
                );
              }

              const dayInfo = monthData[dateStr];
              const isAvailable = Boolean(dayInfo && dayInfo.available && dayInfo.minPrice !== Infinity);
              const minPrice = isAvailable ? dayInfo.minPrice : null;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(dayNum)}
                  disabled={isPast || (!isPast && !isAvailable)}
                  className={`h-16 p-1 rounded-xl flex flex-col items-center justify-between text-xs transition-all relative border ${
                    isPast
                      ? 'bg-stone-100/60 border-transparent text-stone-300 opacity-40 cursor-not-allowed'
                      : isCheckIn || isCheckOut
                      ? 'bg-[#6F7255] text-white border-[#6F7255] shadow-md z-10'
                      : isInRange
                      ? 'bg-[#6F7255]/15 text-[#2B2B2B] border-[#6F7255]/30'
                      : !isAvailable
                      ? 'bg-rose-50/60 border-rose-200 text-rose-500 cursor-not-allowed opacity-75'
                      : 'bg-white border-[#E7E1D3] hover:border-[#6F7255] text-[#2B2B2B]'
                  }`}
                >
                  <span className={`font-semibold ${!isPast && !isAvailable ? 'line-through text-rose-600 font-bold' : ''}`}>
                    {dayNum}
                  </span>

                  {!isPast && (
                    <div className="text-center w-full">
                      {isAvailable ? (
                        <span className={`text-[9px] font-bold block leading-tight ${isCheckIn || isCheckOut ? 'text-white' : 'text-emerald-700'}`}>
                          {currSymbol}{minPrice.toLocaleString('tr-TR')}
                        </span>
                      ) : (
                        <span className="text-[8px] font-semibold text-rose-600 block leading-tight">
                          Müsaitlik Yok
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#F7F4EE] border-t border-[#E7E1D3] flex items-center justify-between">
          <div className="text-xs text-[#555555]">
            <span className="font-semibold text-[#2B2B2B]">Seçilen: </span>
            {tempCheckIn} — {tempCheckOut}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4F523A] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Tarihleri Onayla
          </button>
        </div>
      </div>
    </div>
  );
}
