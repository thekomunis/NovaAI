import { NextResponse } from 'next/server';
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

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Get all orders for analytics
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, total_amount, payment_method, product_slug, product_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 86400000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidStatuses = ['PAID', 'PROCESSING', 'COMPLETED'];

  // Revenue calculations
  const totalRevenue = orders
    ?.filter((o) => paidStatuses.includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0) || 0;

  const todayRevenue = orders
    ?.filter((o) => paidStatuses.includes(o.status) && new Date(o.created_at) >= today)
    .reduce((sum, o) => sum + o.total_amount, 0) || 0;

  const weekRevenue = orders
    ?.filter((o) => paidStatuses.includes(o.status) && new Date(o.created_at) >= thisWeek)
    .reduce((sum, o) => sum + o.total_amount, 0) || 0;

  const monthRevenue = orders
    ?.filter((o) => paidStatuses.includes(o.status) && new Date(o.created_at) >= thisMonth)
    .reduce((sum, o) => sum + o.total_amount, 0) || 0;

  // Order counts
  const todayOrders = orders?.filter((o) => new Date(o.created_at) >= today).length || 0;
  const weekOrders = orders?.filter((o) => new Date(o.created_at) >= thisWeek).length || 0;

  // Product breakdown
  const productStats: Record<string, { count: number; revenue: number; name: string }> = {};
  orders?.forEach((o) => {
    if (!productStats[o.product_slug]) {
      productStats[o.product_slug] = { count: 0, revenue: 0, name: o.product_name };
    }
    productStats[o.product_slug].count++;
    if (paidStatuses.includes(o.status)) {
      productStats[o.product_slug].revenue += o.total_amount;
    }
  });

  // Payment method breakdown
  const paymentStats: Record<string, number> = {};
  orders?.forEach((o) => {
    paymentStats[o.payment_method] = (paymentStats[o.payment_method] || 0) + 1;
  });

  // Conversion rate
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter((o) => paidStatuses.includes(o.status)).length || 0;
  const conversionRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : '0';

  // Daily revenue for last 7 days
  const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const nextD = new Date(d.getTime() + 86400000);
    const dayOrders = orders?.filter(
      (o) => new Date(o.created_at) >= d && new Date(o.created_at) < nextD
    ) || [];
    const dayRevenue = dayOrders
      .filter((o) => paidStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.total_amount, 0);
    dailyRevenue.push({
      date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      revenue: dayRevenue,
      orders: dayOrders.length,
    });
  }

  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
    },
    orders: {
      total: totalOrders,
      today: todayOrders,
      week: weekOrders,
      paid: paidOrders,
      conversionRate,
    },
    productStats: Object.values(productStats),
    paymentStats,
    dailyRevenue,
  });
}
