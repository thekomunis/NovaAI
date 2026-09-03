import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID wajib diisi' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const cleanOrderId = orderId.trim();

  // Flexible query: find order by case-insensitive order_id
  let query = supabase
    .from('orders')
    .select('*')
    .ilike('order_id', cleanOrderId);

  // If token is explicitly provided, enforce token match as well
  if (token && token.trim() !== '') {
    query = query.eq('invoice_token', token.trim());
  }

  const { data, error } = await query.maybeSingle();

  // If not found with token, try fallback search by order_id alone for convenience
  if (!data) {
    const { data: fallbackData } = await supabase
      .from('orders')
      .select('*')
      .ilike('order_id', cleanOrderId)
      .maybeSingle();

    if (fallbackData) {
      return NextResponse.json(fallbackData);
    }

    return NextResponse.json(
      { error: 'Pesanan tidak ditemukan' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
