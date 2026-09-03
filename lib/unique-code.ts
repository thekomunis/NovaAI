import { getSupabaseAdmin } from './supabase/admin';

/**
 * Generate a unique payment code (1-999) that doesn't collide 
 * with other PENDING orders for the same base price and payment method.
 */
export async function generateUniqueCode(
  basePrice: number,
  paymentMethod: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  
  // Get existing unique codes for PENDING orders with same price + method
  const { data: existing } = await supabase
    .from('orders')
    .select('unique_code')
    .eq('status', 'PENDING')
    .eq('price', basePrice)
    .eq('payment_method', paymentMethod);

  const usedCodes = new Set((existing || []).map((o) => o.unique_code));
  
  // Try up to 50 times to find a non-colliding code
  for (let i = 0; i < 50; i++) {
    const code = Math.floor(Math.random() * 999) + 1;
    if (!usedCodes.has(code)) {
      return code;
    }
  }

  // Fallback: find first available code
  for (let code = 1; code <= 999; code++) {
    if (!usedCodes.has(code)) {
      return code;
    }
  }

  // Very unlikely: all 999 codes used
  return Math.floor(Math.random() * 999) + 1;
}
