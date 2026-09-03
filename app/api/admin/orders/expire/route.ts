import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// This can be called by a cron job (e.g., Vercel Cron) or manually
// Protected by a secret token to prevent unauthorized access
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET_KEY;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Find all PENDING orders that have expired
  const { data: expired, error: fetchError } = await supabase
    .from('orders')
    .select('order_id')
    .eq('status', 'PENDING')
    .lt('expires_at', new Date().toISOString());

  if (fetchError) {
    console.error('Expire fetch error:', fetchError);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ message: 'No expired orders', count: 0 });
  }

  // Update all expired orders
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'EXPIRED' })
    .eq('status', 'PENDING')
    .lt('expires_at', new Date().toISOString());

  if (updateError) {
    console.error('Expire update error:', updateError);
    return NextResponse.json({ error: 'Gagal mengupdate' }, { status: 500 });
  }

  console.log(`Expired ${expired.length} orders`);
  return NextResponse.json({
    message: `Expired ${expired.length} orders`,
    count: expired.length,
    orderIds: expired.map((o) => o.order_id),
  });
}
