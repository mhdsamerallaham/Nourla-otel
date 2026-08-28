/**
 * Supabase Browser Client — Nourla Hotel Frontend
 *
 * Vite projesi için createClient kullanılır.
 * VITE_ prefix ile env değişkenleri okunur.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Env var'lar yoksa (production'da tanımsız) crash etme — null döndür
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('[Supabase] Env değişkenleri eksik — Supabase devre dışı. Vercel Dashboard\'da VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.');
}

export { supabase };
export default supabase;
