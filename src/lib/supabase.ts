import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type AuthError = {
  message: string;
};

export type User = SupabaseUser & {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};
