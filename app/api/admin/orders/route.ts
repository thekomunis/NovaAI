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

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const product = searchParams.get('product');
  const payment = searchParams.get('payment');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }
  if (product && product !== 'ALL') {
    query = query.eq('product_slug', product);
  }
  if (payment && payment !== 'ALL') {
    query = query.eq('payment_method', payment);
  }
  if (search) {
    query = query.or(
      `order_id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,customer_email.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }

  // Also get stats
  const { data: stats } = await supabase
    .from('orders')
    .select('status');

  const statusCounts = {
    total: stats?.length || 0,
    PENDING: 0,
    PAID: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    EXPIRED: 0,
  };

  stats?.forEach((order) => {
    const s = order.status as keyof typeof statusCounts;
    if (s in statusCounts && s !== 'total') {
      statusCounts[s]++;
    }
  });

  return NextResponse.json({
    orders: data || [],
    total: count || 0,
    stats: statusCounts,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
