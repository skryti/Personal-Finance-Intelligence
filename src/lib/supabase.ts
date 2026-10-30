import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wtxzblfkcoutulauizuj.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_0m3aEfAKZUHocJQ6uVgApQ_-QjwS4HM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
