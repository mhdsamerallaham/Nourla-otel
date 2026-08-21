import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getPrices } from '../../services/api';

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

  useEffect(() => {
    if (isOpen) {
      fetchMonthPrices();
    }
  }, [isOpen, viewDate, currency]);

  const fetchMonthPrices = async () => {
    setIsLoadingMonth(true);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
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
      let priceRes = await getPrices({
        fromdate: fromStr,
        todate: toStr,
        adult: 2,
        currency,
        language: 'TR',
      });

      let offers = (priceRes && priceRes.success && Array.isArray(priceRes.offers)) ? priceRes.offers : [];
      let queryStartDateStr = fromStr;

      // If full month query starting on sold-out/closed early days returns 0 offers, query second half of month
      if (offers.length === 0) {
        const midDay = 16;
        if (midDay < lastDayNum) {
          const midFromStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(midDay).padStart(2, '0')}`;
          if (midFromStr >= todayStr) {
            const subRes = await getPrices({
              fromdate: midFromStr,
              todate: toStr,
              adult: 2,
              currency,
              language: 'TR',
            });
            if (subRes && subRes.success && Array.isArray(subRes.offers) && subRes.offers.length > 0) {
              offers = subRes.offers;
              queryStartDateStr = midFromStr;
            }
          }
        }
      }

      const dayMap = {};
      const startDate = new Date(queryStartDateStr + 'T00:00:00Z');

      if (offers.length > 0) {
        offers.forEach((rawOffer) => {
          const priceArr = rawOffer.priceArr || rawOffer['price-arr'] || rawOffer.rawOffer?.['price-arr'] || [];
          const availArr = rawOffer.availabilityArr || rawOffer['availability-arr'] || rawOffer.rawOffer?.['availability-arr'] || [];

          if (priceArr.length > 0) {
            priceArr.forEach((priceVal, idx) => {
              const currDate = new Date(startDate.getTime() + idx * 86400000);
              const dateKey = currDate.toISOString().split('T')[0];

              let avail = 0;
              if (Array.isArray(availArr) && availArr[idx] !== undefined && availArr[idx] > 0) {
                avail = availArr[idx];
              } else if (rawOffer.availableRooms !== undefined && rawOffer.availableRooms > 0) {
                avail = rawOffer.availableRooms;
              } else if (rawOffer.rawOffer?.['room-to-sell'] !== undefined && rawOffer.rawOffer['room-to-sell'] > 0) {
                avail = rawOffer.rawOffer['room-to-sell'];
              } else if (priceVal > 0) {
                avail = 1; // Positive ElektraWeb price indicates availability
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
          } else if (rawOffer.pricePerNight || rawOffer.totalPrice) {
            const avail = rawOffer.availableRooms || 1;
            const nightP = Math.round(rawOffer.pricePerNight || rawOffer.totalPrice);
            for (let d = 1; d <= lastDayNum; d++) {
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
      }

      setMonthData(dayMap);
    } catch (err) {
      console.warn('[MONTH CALENDAR] ElektraWeb month price fetch:', err.message);
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
            {isLoadingMonth && (
              <span className="text-[10px] text-[#6F7255] flex items-center justify-center gap-1 mt-0.5">
                <Loader2 className="w-3 h-3 animate-spin" /> ElektraWeb kurları güncelleniyor...
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
