/**
 * Supabase Browser Client — Nourla Hotel Frontend
 * 
 * Vite projesi için createClient kullanılır.
 * VITE_ prefix ile env değişkenleri okunur.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY eksik!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
