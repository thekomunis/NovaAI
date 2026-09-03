'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Search, Loader2, CheckCircle2, Clock, Package,
  ShoppingCart, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, BarChart3, Eye, X, MessageCircle, RefreshCw, ShieldAlert
} from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { products } from '@/lib/products';
import { ADMIN_WA_NUMBER } from '@/lib/config';

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
  PENDING: { label: 'Pending Transfer', badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', icon: Clock },
  PAID: { label: 'Paid / Terbayar', badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', icon: CheckCircle2 },
  PROCESSING: { label: 'Sedang Diproses', badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40', icon: Package },
  COMPLETED: { label: 'Selesai', badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40', icon: CheckCircle2 },
  CANCELLED: { label: 'Dibatalkan', badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40', icon: XCircle },
  EXPIRED: { label: 'Expired', badgeClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/40', icon: AlertTriangle },
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
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-16 font-sans">
      {/* Header */}
      <header className="bg-[#1e293b]/90 border-b border-slate-700/60 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white text-base font-black shadow-lg">
              N
            </span>
            <h1 className="text-base font-black text-white tracking-tight">
              Nova<span className="text-cyan-400">AI</span> <span className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-lg ml-1">Admin Panel</span>
            </h1>
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Auto Sync (4s)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#0f172a] rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setTab('orders')}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 inline mr-1.5" />Orders
              </button>
              <button
                onClick={() => setTab('analytics')}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />Analytics
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Analytics */}
        {tab === 'analytics' && analytics && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Hari Ini', value: formatRupiah(analytics.revenue.today), icon: DollarSign, bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                { label: 'Revenue Minggu Ini', value: formatRupiah(analytics.revenue.week), icon: TrendingUp, bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
                { label: 'Revenue Bulan Ini', value: formatRupiah(analytics.revenue.month), icon: BarChart3, bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
                { label: 'Total Revenue', value: formatRupiah(analytics.revenue.total), icon: DollarSign, bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
              ].map(s => (
                <div key={s.label} className={`bg-[#1e293b] border border-slate-700 rounded-2xl p-5 shadow-xl`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl border ${s.bg}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-300 font-bold">{s.label}</span>
                  </div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Revenue 7 Hari Terakhir
              </h3>
              <div className="flex items-end gap-3 h-48 pt-4">
                {analytics.dailyRevenue.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-bold text-cyan-400">{d.revenue > 0 ? formatRupiah(d.revenue).replace('Rp', '').trim() : '-'}</span>
                    <div className="w-full bg-[#0f172a] rounded-t-xl overflow-hidden h-36 relative">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 via-cyan-500 to-emerald-400 rounded-t-xl transition-all duration-500 absolute bottom-0"
                        style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{d.date}</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {([
                  { key: 'total', label: 'Total Order', bg: 'bg-slate-800 border-slate-700 text-white' },
                  { key: 'PENDING', label: 'Pending', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
                  { key: 'PAID', label: 'Paid', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                  { key: 'PROCESSING', label: 'Diproses', bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
                  { key: 'COMPLETED', label: 'Selesai', bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
                  { key: 'EXPIRED', label: 'Expired', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' },
                ] as const).map((s) => (
                  <div key={s.key} className={`border rounded-2xl p-4 shadow-lg ${s.bg}`}>
                    <span className="text-xs font-bold block mb-1 opacity-80">{s.label}</span>
                    <p className="text-2xl font-black">{stats[s.key as keyof DashboardStats]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari order ID, nama, WA..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
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
                  className="bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Produk</option>
                  {products.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                  className="bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
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
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : !data?.orders.length ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-xs font-semibold">Belum ada pesanan ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 bg-[#0f172a] text-slate-400 text-[11px] uppercase font-black tracking-wider">
                        <th className="text-left px-5 py-4">Order ID</th>
                        <th className="text-left px-5 py-4">Customer</th>
                        <th className="text-left px-5 py-4">Produk</th>
                        <th className="text-right px-5 py-4">Total</th>
                        <th className="text-center px-5 py-4">Status</th>
                        <th className="text-center px-5 py-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {data.orders.map((order) => {
                        const statusCfg = STATUS_CONFIG[order.status as OrderStatus];
                        return (
                          <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                              {order.order_id}
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-white font-bold">{order.customer_name}</p>
                              <p className="text-slate-400 font-mono text-[11px]">{order.customer_phone}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-white font-semibold">{order.product_name}</p>
                              <p className="text-slate-400 text-[11px]">{order.variant_name}</p>
                            </td>
                            <td className="px-5 py-4 text-right font-black text-emerald-400 whitespace-nowrap text-sm">
                              {formatRupiah(order.total_amount)}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${statusCfg.badgeClass}`}>
                                <statusCfg.icon className="w-3.5 h-3.5" />
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => { setSelectedOrder(order); setAdminNote(order.admin_note || ''); }}
                                className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-[#0f172a]">
                  <p className="text-xs text-slate-400 font-medium">
                    Halaman {data.page} dari {data.totalPages} ({data.total} order)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
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
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto bg-[#1e293b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h2 className="text-base font-black text-white">Detail Order #{selectedOrder.order_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-4 space-y-2.5 text-xs border border-slate-700">
              {[
                ['Order ID', selectedOrder.order_id],
                ['Nama Customer', selectedOrder.customer_name],
                ['WhatsApp Customer', selectedOrder.customer_phone],
                ['Email Customer', selectedOrder.customer_email],
                ['Produk', selectedOrder.product_name],
                ['Varian', selectedOrder.variant_name],
                ['Total Bayar', formatRupiah(selectedOrder.total_amount)],
                ['Metode Bayar', selectedOrder.payment_method],
                ['Waktu Order', formatDate(selectedOrder.created_at)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-center">
                  <span className="text-slate-400">{l}</span>
                  <span className="font-bold text-white text-right">{v}</span>
                </div>
              ))}
            </div>

            {/* Status Change Buttons */}
            <div>
              <p className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2.5">Ubah Status Pesanan</p>
              <div className="flex flex-wrap gap-2">
                {VALID_TRANSITIONS[selectedOrder.status]?.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedOrder.order_id, s)}
                    disabled={confirming === selectedOrder.order_id}
                    className="text-xs font-extrabold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Note */}
            <div>
              <p className="text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">Catatan Internal Admin</p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Catatan internal / Kredensial akun..."
                rows={2}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* WhatsApp Chat Button ALWAYS to Customer WA */}
            <a
              href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kak ${selectedOrder.customer_name}, ini dari Admin NovaAI Store terkait pesanan ${selectedOrder.product_name} (#${selectedOrder.order_id}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Chat Customer via WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
