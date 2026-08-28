import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  Users,
  BedDouble,
  Mail,
  Printer,
  Phone,
  RefreshCw,
  ShieldCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getReservationByCode, getPaymentStatus } from '../services/api';

/**
 * BookingStatus Page
 *
 * Ödeme gateway'i tarafından yönlendirilen sayfa.
 * Query Params:
 *   - status: "success" | "failed"
 *   - code: rezervasyon kodu (NOURLA-XXXXXX-XXX)
 *   - payId: ödeme ID'si
 *   - error: (opsiyonel) hata mesajı
 */
export default function BookingStatus() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status');        // "success" | "failed"
  const reservationCode = searchParams.get('code');
  const payId = searchParams.get('payId');
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const isSuccess = status === 'success';

  useEffect(() => {
    // Google Tag Manager / GA4 conversion event (additive, safe)
    if (!isLoading && isSuccess && reservationCode) {
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'purchase',
          transaction_id: reservationCode,
          value: undefined, // populated after loadData if res available
          currency: 'EUR',
          items: [{ item_name: 'Nourla Suite Reservation', item_category: 'Hotel' }],
        });
      } catch (_) { /* GTM may not be installed yet — safe to ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSuccess, reservationCode]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationCode, payId]);

  async function loadData() {
    setIsLoading(true);
    setFetchError(null);
    try {
      const promises = [];

      if (reservationCode) {
        promises.push(
          getReservationByCode(reservationCode)
            .then((res) => setReservation(res?.data || null))
            .catch(() => null)
        );
      }

      if (payId) {
        promises.push(
          getPaymentStatus(payId)
            .then((res) => setPaymentData(res?.data || null))
            .catch(() => null)
        );
      }

      await Promise.allSettled(promises);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const res = reservation;
  const nightCount =
    res?.night_count ||
    (res?.check_in && res?.check_out
      ? Math.ceil((new Date(res.check_out) - new Date(res.check_in)) / (1000 * 60 * 60 * 24))
      : null);
  const primaryGuest = res?.guests?.find((g) => g.is_primary) || res?.guests?.[0];
  const guestName = primaryGuest
    ? `${primaryGuest.first_name} ${primaryGuest.last_name}`
    : res?.reservation_code;

  const currSymbol = res?.currency === 'EUR' ? '€' : res?.currency === 'USD' ? '$' : '₺';
  const totalDisplay = res?.total_price
    ? `${currSymbol}${parseFloat(res.total_price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : null;

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 bg-[#FDFBF7]">
      <div className="max-w-3xl mx-auto">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#6F7255]" />
            <p className="text-sm text-[#555555] font-light">Rezervasyon bilgileri yükleniyor...</p>
          </div>
        )}

        {/* Success State */}
        {!isLoading && isSuccess && (
          <div className="animate-fadeIn space-y-6">
            {/* Header Card */}
            <div className="bg-[#FDFBF7] border border-[#6F7255]/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6F7255]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6F7255]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                {/* Success Icon */}
                <div className="w-24 h-24 rounded-full bg-[#6F7255]/10 border-2 border-[#6F7255] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-[#6F7255]" />
                </div>

                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#6F7255] bg-[#6F7255]/10 px-4 py-1.5 rounded-full mb-4 inline-block">
                  Rezervasyon Onaylandı
                </span>

                <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mt-4 mb-3">
                  Hoş Geldiniz, Değerli Misafirimiz
                </h1>
                <p className="text-sm text-[#555555] font-light max-w-md mx-auto leading-relaxed">
                  Ödemeniz güvenli şekilde alındı ve rezervasyonunuz başarıyla oluşturuldu.
                  Onay bilgileriniz e-posta adresinize gönderilmiştir.
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Güvenli Ödeme Alındı
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6F7255] bg-[#6F7255]/10 border border-[#6F7255]/30 px-3 py-1.5 rounded-full font-medium">
                    <BedDouble className="w-3.5 h-3.5" />
                    Oda Tescil Edildi
                  </span>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            {(res || reservationCode) && (
              <div className="bg-[#F7F4EE] border border-[#E7E1D3] rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D3]">
                  <h2 className="font-serif text-xl text-[#2B2B2B]">Rezervasyon Özeti</h2>
                  <span className="font-mono text-xs font-bold text-[#2B2B2B] bg-[#E7E1D3] px-3 py-1.5 rounded-lg">
                    {reservationCode || res?.reservation_code || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Room */}
                  {res?.room_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#6F7255]/10 flex items-center justify-center shrink-0">
                        <BedDouble className="w-4 h-4 text-[#6F7255]" />
                      </div>
                      <div>
                        <span className="text-xs text-[#555555] block font-light">Oda</span>
                        <span className="font-semibold text-[#2B2B2B]">{res.room_name}</span>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  {res?.check_in && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#6F7255]/10 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4 text-[#6F7255]" />
                      </div>
                      <div>
                        <span className="text-xs text-[#555555] block font-light">Giriş → Çıkış</span>
                        <span className="font-semibold text-[#2B2B2B]">
                          {res.check_in} → {res.check_out}
                          {nightCount ? ` (${nightCount} Gece)` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Guests */}
                  {res?.adult_count && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#6F7255]/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#6F7255]" />
                      </div>
                      <div>
                        <span className="text-xs text-[#555555] block font-light">Misafir</span>
                        <span className="font-semibold text-[#2B2B2B]">
                          {guestName || 'Değerli Misafirimiz'} ({res.adult_count} Yetişkin)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {primaryGuest?.email && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#6F7255]/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[#6F7255]" />
                      </div>
                      <div>
                        <span className="text-xs text-[#555555] block font-light">İletişim</span>
                        <span className="font-semibold text-[#2B2B2B] break-all">{primaryGuest.email}</span>
                        {primaryGuest.phone && (
                          <span className="text-xs text-[#555555] block">{primaryGuest.phone}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total price */}
                {totalDisplay && (
                  <div className="pt-4 border-t border-[#E7E1D3] space-y-2">
                    {res?.base_price && Number(res.base_price) > Number(res.total_price) && (
                      <>
                        <div className="flex items-center justify-between text-xs text-[#555555]">
                          <span>Standart Liste Fiyatı:</span>
                          <span className="line-through">{formatCurrency(res.base_price, res.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                          <span>Web Sitesine Özel %5 İndirim:</span>
                          <span>-{formatCurrency(res.discount_amount || (res.base_price - res.total_price), res.currency)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E7E1D3]">
                      <span className="text-sm text-[#2B2B2B] font-medium">Toplam Tahsil Edilen Tutar:</span>
                      <span className="font-serif text-2xl font-bold text-[#6F7255]">{totalDisplay}</span>
                    </div>
                  </div>
                )}

                {/* PMS Sync note */}
                {res?.sync_status === 'SYNC_PENDING' && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Rezervasyonunuz işleniyor. Kısa süre içinde e-posta ile onay bilgileri iletilecektir.</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-full bg-[#E7E1D3] text-[#2B2B2B] text-xs font-semibold uppercase tracking-widest hover:bg-[#D7D1C3] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Yazdır / PDF
              </button>
              <Link
                to="/tr/reservation"
                className="px-8 py-3.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#4F523A] transition-all shadow-lg"
              >
                Yeni Rezervasyon Yap
              </Link>
            </div>

            {/* Cross-sell: Urla Guide */}
            <div className="bg-[#F7F4EE] border border-[#E7E1D3] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#6F7255] uppercase mb-1">URLA REHBERİ</p>
                <h3 className="font-serif text-lg text-[#2B2B2B] mb-1">Konaklamanızdan En Fazlasını Alın</h3>
                <p className="text-xs text-[#555555] font-light">
                  Bağ turları, sahil köyleri ve gastronomi rotaları hakkında Urla rehberimizi inceleyin.
                </p>
              </div>
              <Link
                to="/tr/urla"
                className="shrink-0 px-5 py-2.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4F523A] transition-all"
              >
                Urla'yı Keşfet
              </Link>
            </div>

            {/* Hotel Contact */}
            <div className="text-center py-4 border-t border-[#E7E1D3] space-y-1">
              <p className="text-xs text-[#555555] font-light">Yardıma ihtiyacınız mı var?</p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <a
                  href="tel:+902327775555"
                  className="flex items-center gap-1.5 text-[#6F7255] hover:underline font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  +90 232 777 55 55
                </a>
                <a
                  href="mailto:info@nourla.com.tr"
                  className="flex items-center gap-1.5 text-[#6F7255] hover:underline font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  info@nourla.com.tr
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Failure State */}
        {!isLoading && !isSuccess && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-[#FDFBF7] border border-red-200 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-300 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>

              <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-red-500 bg-red-50 px-4 py-1.5 rounded-full mb-4 inline-block">
                Ödeme Başarısız
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mt-4 mb-3">
                Ödeme İşlemi Tamamlanamadı
              </h1>

              <p className="text-sm text-[#555555] font-light max-w-md mx-auto leading-relaxed">
                Ödeme işlemi sırasında bir sorun oluştu. Ücret hesabınızdan çekilmedi.
                Lütfen kart bilgilerinizi kontrol ederek tekrar deneyiniz.
              </p>

              {/* Error detail (user-friendly) */}
              {errorParam && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 mt-6 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>İşlem kodu: {decodeURIComponent(errorParam).slice(0, 100)}</span>
                </div>
              )}
            </div>

            {/* Retry options */}
            <div className="bg-[#F7F4EE] border border-[#E7E1D3] rounded-3xl p-6 space-y-4">
              <h2 className="font-serif text-lg text-[#2B2B2B]">Ne yapabilirsiniz?</h2>
              <ul className="space-y-2 text-sm text-[#555555]">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  Farklı bir ödeme kartıyla tekrar deneyiniz.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  Kart limitinizi ve internet alışverişi yetkisini kontrol ediniz.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  Sorun devam ederse lütfen oteli arayınız.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 rounded-full bg-[#E7E1D3] text-[#2B2B2B] text-xs font-semibold uppercase tracking-widest hover:bg-[#D7D1C3] transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Tekrar Dene
              </button>
              <Link
                to="/tr/reservation"
                className="px-8 py-3.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#4F523A] transition-all shadow-lg"
              >
                Rezervasyon Sayfasına Git
              </Link>
            </div>

            <div className="text-center text-xs text-[#555555] space-y-1">
              <p>
                Yardım için:{' '}
                <a href="tel:+902327775555" className="text-[#6F7255] hover:underline">
                  +90 232 777 55 55
                </a>{' '}
                veya{' '}
                <a href="mailto:info@nourla.com.tr" className="text-[#6F7255] hover:underline">
                  info@nourla.com.tr
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
