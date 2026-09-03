import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawOrderId = searchParams.get('orderId');
  const rawPhone = searchParams.get('phone');

  if (!rawOrderId || !rawPhone) {
    return NextResponse.json(
      { error: 'Order ID dan nomor WhatsApp wajib diisi' },
      { status: 400 }
    );
  }

  const orderId = rawOrderId.trim();
  const phone = rawPhone.trim();

  // Normalize phone variations
  let cleanPhone = phone.replace(/[\s\-().]+/g, '');
  let phone62 = cleanPhone;
  let phone08 = cleanPhone;

  if (cleanPhone.startsWith('+62')) {
    phone62 = '62' + cleanPhone.slice(3);
    phone08 = '0' + cleanPhone.slice(3);
  } else if (cleanPhone.startsWith('62')) {
    phone62 = cleanPhone;
    phone08 = '0' + cleanPhone.slice(2);
  } else if (cleanPhone.startsWith('0')) {
    phone08 = cleanPhone;
    phone62 = '62' + cleanPhone.slice(1);
  }

  const supabase = getSupabaseAdmin();

  // Query order by case-insensitive order_id AND any matching phone format
  const { data, error } = await supabase
    .from('orders')
    .select('order_id, product_name, variant_name, total_amount, status, fulfillment_status, payment_method, created_at, expires_at, paid_at')
    .ilike('order_id', orderId)
    .or(`customer_phone.eq.${phone62},customer_phone.eq.${phone08},customer_phone.eq.${phone}`)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Pesanan tidak ditemukan. Pastikan Order ID dan nomor WhatsApp sesuai.' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
