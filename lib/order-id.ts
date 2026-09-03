import { getSupabaseAdmin } from './supabase/admin';
import crypto from 'crypto';

/**
 * Generate an order ID in format: INV-[SLUG]-[COUNTER]-[RANDOM4]
 * Uses atomic database counter via PostgreSQL RPC.
 * Falls back to timestamp-based counter if RPC not available.
 */
export async function generateOrderId(productSlug: string): Promise<{
  orderId: string;
  invoiceToken: string;
}> {
  const supabase = getSupabaseAdmin();
  const slug = productSlug.toUpperCase();
  const random4 = crypto.randomBytes(2).toString('hex').toUpperCase().slice(0, 4);
  const invoiceToken = crypto.randomBytes(32).toString('hex');

  // Try using the PostgreSQL function for atomic counter
  const { data, error } = await supabase.rpc('get_next_order_counter');
  
  let counter: number;
  if (error || data === null || data === undefined) {
    // Fallback: use timestamp-based approach
    counter = Date.now() % 100000;
  } else {
    counter = data as number;
  }

  const counterStr = String(counter).padStart(3, '0');
  const orderId = `INV-${slug}-${counterStr}-${random4}`;

  return { orderId, invoiceToken };
}
