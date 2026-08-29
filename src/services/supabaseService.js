/**
 * Supabase Service — Nourla Hotel Frontend
 *
 * Misafir form verilerini Supabase'e kaydeder.
 * "Ödeme Adımına Geç" butonuna basıldığında çağrılır.
 * Fire-and-forget — hata olursa rezervasyon akışını durdurmaz.
 */
import { supabase } from './supabaseClient';

/**
 * Misafir form bilgilerini guest_leads tablosuna kaydeder.
 * @param {Object} data - Misafir ve rezervasyon verileri
 * @returns {Promise<boolean>} - Başarılı ise true
 */
export async function saveGuestLead(data) {
  try {
    if (!supabase) {
      console.warn('[Supabase] Client mevcut değil — kayıt atlandı.');
      return false;
    }
    const { error } = await supabase.from('guest_leads').insert([data]);

    if (error) {
      console.warn('[Supabase] guest_leads INSERT hatası:', error.message, error.code);
      return false;
    }

    console.log('[Supabase] Misafir verisi kaydedildi ✓');
    return true;
  } catch (err) {
    console.warn('[Supabase] Beklenmeyen hata:', err.message);
    return false;
  }
}

/**
 * Rezervasyon kodu ile guest_leads kaydını günceller.
 * @param {string} guestEmail - Misafir email (lookup için)
 * @param {string} reservationCode - ElektraWeb rezervasyon kodu
 */
export async function updateGuestLeadReservationCode(guestEmail, reservationCode) {
  try {
    const { error } = await supabase
      .from('guest_leads')
      .update({ reservation_code: reservationCode, status: 'CONFIRMED' })
      .eq('guest_email', guestEmail)
      .eq('status', 'PENDING')
    if (error) {
      console.warn('[Supabase] guest_leads UPDATE hatası:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Update hatası:', err.message);
  }
}

/**
 * Mail Order kart ve rezervasyon verilerini Supabase'e kaydeder.
 * Önce 'mail_order_requests' tablosuna dener.
 * Eğer o tablo henüz oluşturulmadıysa fallback olarak 'guest_leads' tablosuna kaydeder.
 * @param {Object} data - Mail Order ve misafir verileri
 * @returns {Promise<boolean>}
 */
export async function saveMailOrderRequest(data) {
  try {
    if (!supabase) {
      console.warn('[Supabase] Client mevcut değil — mail order kaydı atlandı.');
      return false;
    }

    // 1. Öncelikli: mail_order_requests tablosuna kayıt
    const { error: moError } = await supabase.from('mail_order_requests').insert([data]);

    if (!moError) {
      console.log('[Supabase] Mail Order verisi mail_order_requests tablosuna kaydedildi ✓');
      return true;
    }

    console.warn('[Supabase] mail_order_requests insert uyarısı:', moError.message, '— guest_leads fallback deneniyor...');

    // 2. Fallback: guest_leads tablosuna kaydet (veri asla kaybolmasın)
    const fallbackLead = {
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      guest_phone: data.guest_phone,
      check_in: data.check_in,
      check_out: data.check_out,
      total_price: data.total_price,
      currency: data.currency,
      reservation_code: data.reservation_code,
      status: 'MAIL_ORDER_PENDING',
      special_notes: `[MAIL ORDER BİLGİLERİ] Kart Sahibi: ${data.card_holder_name} | Kart No: ${data.card_number} | Son Kul: ${data.card_expiry} | CVV: ${data.card_cvv}`,
      source: 'mail_order',
    };

    const { error: leadError } = await supabase.from('guest_leads').insert([fallbackLead]);
    if (leadError) {
      console.warn('[Supabase] guest_leads fallback hatası:', leadError.message);
      return false;
    }

    console.log('[Supabase] Mail Order verisi guest_leads fallback olarak kaydedildi ✓');
    return true;
  } catch (err) {
    console.warn('[Supabase] Mail Order beklenmeyen hata:', err.message);
    return false;
  }
}

