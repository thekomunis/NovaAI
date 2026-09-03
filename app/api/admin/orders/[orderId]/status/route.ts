import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { OrderStatus } from '@/lib/types';

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

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED', 'EXPIRED'],
  PAID: ['PROCESSING', 'COMPLETED', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await request.json();
  const { status, adminNote, fulfillmentStatus } = body as {
    status?: OrderStatus;
    adminNote?: string;
    fulfillmentStatus?: string;
  };

  const supabase = getSupabaseAdmin();

  // Get current order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
  }

  // Validate status transition
  if (status) {
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Tidak bisa ubah status dari ${order.status} ke ${status}` },
        { status: 400 }
      );
    }
  }

  if (!status && adminNote === undefined && !fulfillmentStatus) {
    return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
  }

  // Build typed update
  const updatePayload: {
    status?: string; paid_at?: string; paid_by?: string;
    admin_note?: string; fulfillment_status?: string;
  } = {};

  if (status) {
    updatePayload.status = status;
    if (status === 'PAID') {
      updatePayload.paid_at = new Date().toISOString();
      updatePayload.paid_by = 'admin';
    }
  }
  if (adminNote !== undefined) updatePayload.admin_note = adminNote;
  if (fulfillmentStatus) updatePayload.fulfillment_status = fulfillmentStatus;

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('order_id', orderId);

  if (updateError) {
    console.error('Update error:', updateError);
    return NextResponse.json({ error: 'Gagal mengupdate pesanan' }, { status: 500 });
  }

  return NextResponse.json({ success: true, updates: updatePayload });
}
