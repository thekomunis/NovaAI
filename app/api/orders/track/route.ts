import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const phone = searchParams.get('phone');

  if (!orderId || !phone) {
    return NextResponse.json(
      { error: 'Order ID dan nomor WhatsApp wajib diisi' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Normalize phone for lookup
  let normalizedPhone = phone.replace(/[\s\-().]+/g, '');
  if (normalizedPhone.startsWith('+62')) {
    normalizedPhone = '62' + normalizedPhone.slice(3);
  } else if (normalizedPhone.startsWith('08')) {
    normalizedPhone = '62' + normalizedPhone.slice(1);
  } else if (normalizedPhone.startsWith('8') && normalizedPhone.length >= 9) {
    normalizedPhone = '62' + normalizedPhone;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(
      'order_id, product_name, variant_name, total_amount, status, fulfillment_status, payment_method, created_at, expires_at, paid_at'
    )
    .eq('order_id', orderId)
    .eq('customer_phone', normalizedPhone)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Pesanan tidak ditemukan. Pastikan Order ID dan nomor WhatsApp sesuai.' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
