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
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('[Supabase] guest_leads UPDATE hatası:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Update hatası:', err.message);
  }
}
