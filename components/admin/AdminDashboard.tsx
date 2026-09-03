'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Search, Loader2, CheckCircle, Clock, Package,
  ShoppingCart, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, BarChart3, Eye, X,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { products } from '@/lib/products';

interface DashboardStats {
  total: number; PENDING: number; PAID: number; PROCESSING: number;
  COMPLETED: number; CANCELLED: number; EXPIRED: number;
}

interface OrdersResponse {
  orders: Order[]; total: number; stats: DashboardStats;
  page: number; totalPages: number;
}

interface AnalyticsData {
  revenue: { total: number; today: number; week: number; month: number };
  orders: { total: number; today: number; week: number; paid: number; conversionRate: string };
  productStats: { name: string; count: number; revenue: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: 'Pending', color: 'text-warning', icon: Clock },
  PAID: { label: 'Paid', color: 'text-success', icon: CheckCircle },
  PROCESSING: { label: 'Processing', color: 'text-nexai-400', icon: Package },
  COMPLETED: { label: 'Completed', color: 'text-success', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-danger', icon: XCircle },
  EXPIRED: { label: 'Expired', color: 'text-text-muted', icon: AlertTriangle },
};

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED', 'EXPIRED'],
  PAID: ['PROCESSING', 'COMPLETED', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], CANCELLED: [], EXPIRED: [],
};

type Tab = 'orders' | 'analytics';

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('orders');
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(productFilter !== 'ALL' && { product: productFilter }),
        ...(paymentFilter !== 'ALL' && { payment: paymentFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      setData(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [page, statusFilter, productFilter, paymentFilter, search, router]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setAnalytics(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (tab === 'analytics') fetchAnalytics(); }, [tab, fetchAnalytics]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!confirm(`Ubah status pesanan ${orderId} ke ${newStatus}?`)) return;
    setConfirming(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote: adminNote || undefined }),
      });
      if (res.ok) { fetchOrders(); setSelectedOrder(null); setAdminNote(''); }
      else { const err = await res.json(); alert(err.error || 'Gagal'); }
    } catch { alert('Koneksi gagal'); }
    finally { setConfirming(null); }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login'); router.refresh();
  };

  const stats = data?.stats;
  const maxRevenue = analytics ? Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1) : 1;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-light border-b border-surface-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">
            Nova<span className="text-nexai-500">AI</span>{' '}
            <span className="text-text-secondary font-normal text-sm">Admin</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-surface rounded-lg p-0.5 border border-surface-border">
              <button onClick={() => setTab('orders')} className={`text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer ${tab === 'orders' ? 'bg-nexai-600 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                <ShoppingCart className="w-3.5 h-3.5 inline mr-1" />Orders
              </button>
              <button onClick={() => setTab('analytics')} className={`text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer ${tab === 'analytics' ? 'bg-nexai-600 text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                <BarChart3 className="w-3.5 h-3.5 inline mr-1" />Analytics
              </button>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Analytics Tab */}
        {tab === 'analytics' && analytics && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Revenue Hari Ini', value: formatRupiah(analytics.revenue.today), icon: DollarSign, color: 'text-success' },
                { label: 'Revenue Minggu Ini', value: formatRupiah(analytics.revenue.week), icon: TrendingUp, color: 'text-nexai-400' },
                { label: 'Revenue Bulan Ini', value: formatRupiah(analytics.revenue.month), icon: BarChart3, color: 'text-nexai-300' },
                { label: 'Total Revenue', value: formatRupiah(analytics.revenue.total), icon: DollarSign, color: 'text-warning' },
              ].map(s => (
                <div key={s.label} className="bg-surface-light border border-surface-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-text-muted">{s.label}</span></div>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-light border border-surface-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text-primary">{analytics.orders.today}</p>
                <p className="text-xs text-text-muted">Pesanan Hari Ini</p>
              </div>
              <div className="bg-surface-light border border-surface-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-text-primary">{analytics.orders.paid}</p>
                <p className="text-xs text-text-muted">Total Terbayar</p>
              </div>
              <div className="bg-surface-light border border-surface-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-nexai-400">{analytics.orders.conversionRate}%</p>
                <p className="text-xs text-text-muted">Conversion Rate</p>
              </div>
            </div>
            {/* Revenue Chart */}
            <div className="bg-surface-light border border-surface-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Revenue 7 Hari Terakhir</h3>
              <div className="flex items-end gap-2 h-40">
                {analytics.dailyRevenue.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-muted">{d.revenue > 0 ? formatRupiah(d.revenue).replace('Rp', '').trim() : '-'}</span>
                    <div className="w-full bg-surface-lighter rounded-t-md overflow-hidden" style={{ height: '120px' }}>
                      <div className="w-full bg-nexai-600/80 rounded-t-md transition-all duration-700 mt-auto" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, marginTop: `${100 - (d.revenue / maxRevenue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Product Stats */}
            <div className="bg-surface-light border border-surface-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Produk Terlaris</h3>
              <div className="space-y-3">
                {analytics.productStats.map(p => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div><p className="text-sm text-text-primary font-medium">{p.name}</p><p className="text-xs text-text-muted">{p.count} pesanan</p></div>
                    <p className="text-sm font-medium text-nexai-400">{formatRupiah(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'analytics' && !analytics && (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-nexai-500 animate-spin" /></div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (<>
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {([
                { key: 'total', label: 'Total', icon: ShoppingCart, color: 'text-text-primary' },
                { key: 'PENDING', label: 'Pending', icon: Clock, color: 'text-warning' },
                { key: 'PAID', label: 'Paid', icon: CheckCircle, color: 'text-success' },
                { key: 'PROCESSING', label: 'Processing', icon: Package, color: 'text-nexai-400' },
                { key: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'text-green-400' },
                { key: 'EXPIRED', label: 'Expired', icon: AlertTriangle, color: 'text-text-muted' },
              ] as const).map((s) => (
                <div key={s.key} className="bg-surface-light border border-surface-border rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-text-muted">{s.label}</span></div>
                  <p className={`text-xl font-bold ${s.color}`}>{stats[s.key as keyof DashboardStats]}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Cari order ID, nama, email..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-surface-light border border-surface-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-surface-light border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-nexai-500 cursor-pointer">
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending</option><option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select value={productFilter} onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
              className="bg-surface-light border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-nexai-500 cursor-pointer">
              <option value="ALL">Semua Produk</option>
              {products.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
            </select>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="bg-surface-light border border-surface-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-nexai-500 cursor-pointer">
              <option value="ALL">Semua Pembayaran</option>
              <option value="BCA">BCA</option><option value="MANDIRI">Mandiri</option>
              <option value="SEABANK">SeaBank</option><option value="QRIS">QRIS</option>
            </select>
          </div>

          <div className="bg-surface-light border border-surface-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-nexai-500 animate-spin" /></div>
            ) : !data?.orders.length ? (
              <div className="text-center py-16"><p className="text-text-muted text-sm">Tidak ada pesanan ditemukan</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border text-text-muted text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Order ID</th>
                      <th className="text-left px-4 py-3 font-medium">Customer</th>
                      <th className="text-left px-4 py-3 font-medium">Produk</th>
                      <th className="text-right px-4 py-3 font-medium">Total</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Created</th>
                      <th className="text-center px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order) => {
                      const statusCfg = STATUS_CONFIG[order.status as OrderStatus];
                      return (
                        <tr key={order.id} className="border-b border-surface-border/50 hover:bg-surface/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-nexai-400 whitespace-nowrap">{order.order_id}</td>
                          <td className="px-4 py-3"><p className="text-text-primary text-sm">{order.customer_name}</p><p className="text-text-muted text-xs">{order.customer_phone}</p></td>
                          <td className="px-4 py-3 text-text-primary whitespace-nowrap">{order.product_name}</td>
                          <td className="px-4 py-3 text-right font-medium text-text-primary whitespace-nowrap">{formatRupiah(order.total_amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusCfg.color}`}>
                              <statusCfg.icon className="w-3 h-3" />{statusCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap hidden md:table-cell">{formatDate(order.created_at)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => { setSelectedOrder(order); setAdminNote(order.admin_note || ''); }}
                              className="text-xs bg-surface-lighter hover:bg-surface-border text-text-secondary px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                              <Eye className="w-3 h-3 inline mr-1" />Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
                <p className="text-xs text-text-muted">Halaman {data.page} dari {data.totalPages} ({data.total} pesanan)</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="p-1.5 rounded-lg bg-surface-lighter hover:bg-surface-border disabled:opacity-30 transition-colors cursor-pointer" aria-label="Sebelumnya">
                    <ChevronLeft className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
                    className="p-1.5 rounded-lg bg-surface-lighter hover:bg-surface-border disabled:opacity-30 transition-colors cursor-pointer" aria-label="Selanjutnya">
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>)}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface-light border border-surface-border rounded-2xl animate-fade-in-up">
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-surface-border bg-surface-light/95 backdrop-blur-sm rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-text-primary">Detail Pesanan</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-surface-lighter transition-colors cursor-pointer"><X className="w-5 h-5 text-text-secondary" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2.5 text-sm">
                {[
                  ['Order ID', selectedOrder.order_id],
                  ['Customer', selectedOrder.customer_name],
                  ['Phone', selectedOrder.customer_phone],
                  ['Email', selectedOrder.customer_email],
                  ['Produk', selectedOrder.product_name],
                  ['Varian', selectedOrder.variant_name],
                  ['Harga', formatRupiah(selectedOrder.price)],
                  ['Kode Unik', String(selectedOrder.unique_code)],
                  ['Total', formatRupiah(selectedOrder.total_amount)],
                  ['Payment', selectedOrder.payment_method],
                  ['Dibuat', formatDate(selectedOrder.created_at)],
                  ['Expired', formatDate(selectedOrder.expires_at)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-text-muted">{label}</span>
                    <span className="text-text-primary text-right max-w-[60%] break-all">{val}</span>
                  </div>
                ))}
                {selectedOrder.paid_at && (
                  <div className="flex justify-between"><span className="text-text-muted">Dibayar</span><span className="text-success">{formatDate(selectedOrder.paid_at)}</span></div>
                )}
              </div>

              {/* Status Badge */}
              <div className="bg-surface rounded-xl p-4 border border-surface-border">
                <p className="text-xs text-text-muted mb-2">Status Saat Ini</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${STATUS_CONFIG[selectedOrder.status as OrderStatus].color}`}>
                  {(() => { const Icon = STATUS_CONFIG[selectedOrder.status as OrderStatus].icon; return <Icon className="w-4 h-4" />; })()}
                  {STATUS_CONFIG[selectedOrder.status as OrderStatus].label}
                </span>
              </div>

              {/* Status Actions */}
              {VALID_TRANSITIONS[selectedOrder.status]?.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted mb-2">Ubah Status</p>
                  <div className="flex flex-wrap gap-2">
                    {VALID_TRANSITIONS[selectedOrder.status].map((s) => (
                      <button key={s} onClick={() => handleStatusChange(selectedOrder.order_id, s)}
                        disabled={confirming === selectedOrder.order_id}
                        className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                          s === 'PAID' || s === 'COMPLETED' ? 'bg-success/15 hover:bg-success/25 text-success' :
                          s === 'PROCESSING' ? 'bg-nexai-600/15 hover:bg-nexai-600/25 text-nexai-400' :
                          'bg-danger/15 hover:bg-danger/25 text-danger'
                        }`}>
                        {confirming === selectedOrder.order_id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <p className="text-xs text-text-muted mb-2">Catatan Admin</p>
                <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Tambahkan catatan internal..." rows={2}
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors resize-none" />
              </div>

              {/* WhatsApp */}
              <a href={`https://wa.me/${selectedOrder.customer_phone}?text=${encodeURIComponent(`Halo ${selectedOrder.customer_name}, ini dari NovaAI Store terkait pesanan ${selectedOrder.order_id}.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition-colors text-sm">
                WhatsApp Customer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
