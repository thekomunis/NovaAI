'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Search, Loader2, CheckCircle2, Clock, Package,
  ShoppingCart, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, BarChart3, Eye, X, MessageCircle, RefreshCw
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

const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: 'Pending Transfer', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', icon: Clock },
  PAID: { label: 'Paid / Terbayar', badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 },
  PROCESSING: { label: 'Diproses', badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', icon: Package },
  COMPLETED: { label: 'Selesai', badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', icon: CheckCircle2 },
  CANCELLED: { label: 'Batal', badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', icon: XCircle },
  EXPIRED: { label: 'Expired', badgeClass: 'bg-slate-500/10 text-slate-400 border border-slate-500/20', icon: AlertTriangle },
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const router = useRouter();

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
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
    } catch { /* silent */ } finally {
      if (!isSilent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, [page, statusFilter, productFilter, paymentFilter, search, router]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setAnalytics(await res.json());
    } catch { /* silent */ }
  }, []);

  // Initial fetch & Auto-sync polling every 4 seconds for instant new order detection!
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (tab === 'analytics') fetchAnalytics();
  }, [tab, fetchAnalytics]);

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
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pb-16 font-sans">
      {/* Header */}
      <header className="bg-[#11131a] border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white tracking-tight">
              NovaAI <span className="text-xs font-normal text-slate-400">Admin</span>
            </h1>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto Sync (4s)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#181a24] rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setTab('orders')}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  tab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 inline mr-1" />Orders
              </button>
              <button
                onClick={() => setTab('analytics')}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  tab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1" />Analytics
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Analytics */}
        {tab === 'analytics' && analytics && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Revenue Hari Ini', value: formatRupiah(analytics.revenue.today), icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Revenue Minggu Ini', value: formatRupiah(analytics.revenue.week), icon: TrendingUp, color: 'text-indigo-400' },
                { label: 'Revenue Bulan Ini', value: formatRupiah(analytics.revenue.month), icon: BarChart3, color: 'text-cyan-400' },
                { label: 'Total Revenue', value: formatRupiah(analytics.revenue.total), icon: DollarSign, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#11131a] border border-white/10 rounded-xl p-4">
                  <span className="text-xs text-slate-400 block mb-1">{s.label}</span>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#11131a] border border-white/10 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Omset 7 Hari Terakhir</h3>
              <div className="flex items-end gap-2 h-40 pt-2">
                {analytics.dailyRevenue.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">{d.revenue > 0 ? formatRupiah(d.revenue).replace('Rp', '').trim() : '-'}</span>
                    <div className="w-full bg-[#181a24] rounded-t-md overflow-hidden h-32 relative">
                      <div
                        className="w-full bg-indigo-600 rounded-t-md transition-all duration-500 absolute bottom-0"
                        style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {tab === 'orders' && (
          <>
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
                {([
                  { key: 'total', label: 'Total Order', color: 'text-white' },
                  { key: 'PENDING', label: 'Pending', color: 'text-amber-400' },
                  { key: 'PAID', label: 'Paid', color: 'text-emerald-400' },
                  { key: 'PROCESSING', label: 'Diproses', color: 'text-indigo-400' },
                  { key: 'COMPLETED', label: 'Selesai', color: 'text-cyan-400' },
                  { key: 'EXPIRED', label: 'Expired', color: 'text-slate-500' },
                ] as const).map((s) => (
                  <div key={s.key} className="bg-[#11131a] border border-white/10 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 block mb-0.5">{s.label}</span>
                    <p className={`text-xl font-bold ${s.color}`}>{stats[s.key as keyof DashboardStats]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari order ID, nama, WA..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-[#11131a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-[#11131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <select
                  value={productFilter}
                  onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
                  className="bg-[#11131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Produk</option>
                  {products.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                  className="bg-[#11131a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Pembayaran</option>
                  <option value="BCA">BCA</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="SEABANK">SeaBank</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#11131a] border border-white/10 rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : !data?.orders.length ? (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-xs">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#171a24] text-slate-400 text-[11px] uppercase font-semibold">
                        <th className="text-left px-4 py-3">Order ID</th>
                        <th className="text-left px-4 py-3">Customer</th>
                        <th className="text-left px-4 py-3">Produk</th>
                        <th className="text-right px-4 py-3">Total</th>
                        <th className="text-center px-4 py-3">Status</th>
                        <th className="text-center px-4 py-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.orders.map((order) => {
                        const statusCfg = STATUS_CONFIG[order.status as OrderStatus];
                        return (
                          <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-indigo-400 whitespace-nowrap">
                              {order.order_id}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white font-semibold">{order.customer_name}</p>
                              <p className="text-slate-400 text-[10px]">{order.customer_phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white font-medium">{order.product_name}</p>
                              <p className="text-slate-400 text-[10px]">{order.variant_name}</p>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                              {formatRupiah(order.total_amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusCfg.badgeClass}`}>
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => { setSelectedOrder(order); setAdminNote(order.admin_note || ''); }}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 inline mr-1" />Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                  <p className="text-[11px] text-slate-400">
                    Halaman {data.page} dari {data.totalPages} ({data.total} order)
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1 rounded-lg bg-white/5 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="p-1 rounded-lg bg-white/5 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-[#11131a] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">Detail Order #{selectedOrder.order_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                ['Order ID', selectedOrder.order_id],
                ['Nama Customer', selectedOrder.customer_name],
                ['WhatsApp', selectedOrder.customer_phone],
                ['Email', selectedOrder.customer_email],
                ['Produk', selectedOrder.product_name],
                ['Varian', selectedOrder.variant_name],
                ['Total Bayar', formatRupiah(selectedOrder.total_amount)],
                ['Metode Bayar', selectedOrder.payment_method],
                ['Waktu Order', formatDate(selectedOrder.created_at)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-400">{l}</span>
                  <span className="font-semibold text-slate-200">{v}</span>
                </div>
              ))}
            </div>

            {/* Status Change Buttons */}
            <div>
              <p className="text-[11px] font-bold text-slate-300 uppercase mb-2">Ubah Status</p>
              <div className="flex flex-wrap gap-1.5">
                {VALID_TRANSITIONS[selectedOrder.status]?.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedOrder.order_id, s)}
                    disabled={confirming === selectedOrder.order_id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Note */}
            <div>
              <p className="text-[11px] font-bold text-slate-300 uppercase mb-1">Catatan Admin</p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Catatan internal..."
                rows={2}
                className="w-full bg-[#181a24] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <a
              href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kak ${selectedOrder.customer_name}, ini dari Admin NovaAI Store terkait pesanan ${selectedOrder.product_name} (#${selectedOrder.order_id}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs"
            >
              <MessageCircle className="w-4 h-4" /> Chat Customer WA
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
