import { createClient } from '@supabase/supabase-js';

const supabaseUrl = window._env_.REACT_APP_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = window._env_.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing!');
  console.error('Make sure env.js is loaded and has REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
