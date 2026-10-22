import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://rogbuungxrwalpnkuptt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_hqOsBeMVrrI8itPh-V2SgQ_BIbTGhlB';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
