import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | null = null;

export function getSupabaseBrowser(): SupabaseClient<Database> | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient<Database>(url, key);
  return client;
}
