import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isRemoteStorageConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isRemoteStorageConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
