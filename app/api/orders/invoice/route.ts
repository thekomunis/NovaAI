import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  if (!orderId || !token) {
    return NextResponse.json(
      { error: 'Pesanan tidak ditemukan' },
      { status: 404 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .eq('invoice_token', token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Pesanan tidak ditemukan' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
