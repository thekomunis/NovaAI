import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  const tokenHash = cookieStore.get('admin_token_hash')?.value;
  
  if (!session || !tokenHash) return false;

  const crypto = await import('crypto');
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_PASSWORD || '';
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(session)
    .digest('hex');
  
  return expectedHash === tokenHash;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    const supabase = getSupabaseAdmin();

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Tidak dapat mengkonfirmasi pesanan dengan status ${order.status}` },
        { status: 400 }
      );
    }

    // Update to PAID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'PAID',
        paid_at: new Date().toISOString(),
        paid_by: 'admin',
      })
      .eq('order_id', orderId)
      .eq('status', 'PENDING'); // Double-check to prevent race condition

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Gagal mengkonfirmasi pembayaran' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
