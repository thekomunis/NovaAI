'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Search, Loader2, CheckCircle2, Clock, Package,
  ShoppingCart, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, BarChart3, Eye, X, MessageCircle, Sparkles, Filter
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

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: 'Pending Transfer', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Clock },
  PAID: { label: 'Paid / Terbayar', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 },
  PROCESSING: { label: 'Sedang Diproses', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: Package },
  COMPLETED: { label: 'Selesai', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: CheckCircle2 },
  CANCELLED: { label: 'Dibatalkan', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: XCircle },
  EXPIRED: { label: 'Kedaluwarsa', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', icon: AlertTriangle },
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-16">
      {/* Executive Header */}
      <header className="bg-[#0f131f]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
              N
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              Nova<span className="text-cyan-400">AI</span> <span className="text-xs font-normal text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md ml-1">Admin Panel</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#141a29] rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setTab('orders')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 inline mr-1.5" />Orders
              </button>
              <button
                onClick={() => setTab('analytics')}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />Analytics
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Analytics Tab */}
        {tab === 'analytics' && analytics && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Hari Ini', value: formatRupiah(analytics.revenue.today), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Revenue Minggu Ini', value: formatRupiah(analytics.revenue.week), icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { label: 'Revenue Bulan Ini', value: formatRupiah(analytics.revenue.month), icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Total Revenue', value: formatRupiah(analytics.revenue.total), icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              ].map(s => (
                <div key={s.label} className={`bg-[#0f131f] border border-white/10 rounded-2xl p-5 shadow-xl`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                  </div>
                  <p className={`text-xl sm:text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-5 text-center shadow-xl">
                <p className="text-3xl font-black text-white">{analytics.orders.today}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Pesanan Hari Ini</p>
              </div>
              <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-5 text-center shadow-xl">
                <p className="text-3xl font-black text-emerald-400">{analytics.orders.paid}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Total Pesanan Sukses</p>
              </div>
              <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-5 text-center shadow-xl">
                <p className="text-3xl font-black text-cyan-400">{analytics.orders.conversionRate}%</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Conversion Rate</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Revenue 7 Hari Terakhir
              </h3>
              <div className="flex items-end gap-3 h-48 pt-4">
                {analytics.dailyRevenue.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-400">{d.revenue > 0 ? formatRupiah(d.revenue).replace('Rp', '').trim() : '-'}</span>
                    <div className="w-full bg-[#141a29] rounded-t-xl overflow-hidden h-36 relative">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-cyan-500 rounded-t-xl transition-all duration-700 absolute bottom-0"
                        style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Stats */}
            <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Performa Produk AI</h3>
              <div className="space-y-3">
                {analytics.productStats.map(p => (
                  <div key={p.name} className="flex items-center justify-between bg-[#141a29] border border-white/5 rounded-xl p-4">
                    <div>
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.count} pesanan terverifikasi</p>
                    </div>
                    <p className="text-base font-extrabold text-cyan-400">{formatRupiah(p.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'analytics' && !analytics && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <>
            {/* Quick Status Stats Badges */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {([
                  { key: 'total', label: 'Total Order', icon: ShoppingCart, color: 'text-white' },
                  { key: 'PENDING', label: 'Pending', icon: Clock, color: 'text-amber-400' },
                  { key: 'PAID', label: 'Paid', icon: CheckCircle2, color: 'text-emerald-400' },
                  { key: 'PROCESSING', label: 'Processing', icon: Package, color: 'text-indigo-400' },
                  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-cyan-400' },
                  { key: 'EXPIRED', label: 'Expired', icon: AlertTriangle, color: 'text-slate-500' },
                ] as const).map((s) => (
                  <div key={s.key} className="bg-[#0f131f] border border-white/10 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                    </div>
                    <p className={`text-2xl font-extrabold ${s.color}`}>{stats[s.key as keyof DashboardStats]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari order ID, nama, WA..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-[#0f131f] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-[#0f131f] border border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                  className="bg-[#0f131f] border border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Produk</option>
                  {products.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                  className="bg-[#0f131f] border border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Pembayaran</option>
                  <option value="BCA">BCA</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="SEABANK">SeaBank</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#0f131f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-400">Memuat data pesanan...</p>
                </div>
              ) : !data?.orders.length ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-sm">Tidak ada pesanan ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#141a29]/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="text-left px-5 py-4">Order ID</th>
                        <th className="text-left px-5 py-4">Customer</th>
                        <th className="text-left px-5 py-4">Produk</th>
                        <th className="text-right px-5 py-4">Total</th>
                        <th className="text-center px-5 py-4">Status</th>
                        <th className="text-left px-5 py-4 hidden md:table-cell">Waktu</th>
                        <th className="text-center px-5 py-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.orders.map((order) => {
                        const statusCfg = STATUS_CONFIG[order.status as OrderStatus];
                        return (
                          <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4 font-mono text-xs font-bold text-cyan-400 whitespace-nowrap">
                              {order.order_id}
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-white font-bold text-xs">{order.customer_name}</p>
                              <p className="text-slate-400 text-[11px] font-mono">{order.customer_phone}</p>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="text-white font-semibold text-xs">{order.product_name}</p>
                              <p className="text-slate-400 text-[11px]">{order.variant_name}</p>
                            </td>
                            <td className="px-5 py-4 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                              {formatRupiah(order.total_amount)}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                <statusCfg.icon className="w-3.5 h-3.5" />
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap hidden md:table-cell">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => { setSelectedOrder(order); setAdminNote(order.admin_note || ''); }}
                                className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 font-semibold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 inline mr-1" /> Detail
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#141a29]/30">
                  <p className="text-xs text-slate-400">
                    Halaman {data.page} dari {data.totalPages} ({data.total} total order)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto bg-[#0f131f] border border-white/10 rounded-3xl shadow-2xl animate-fade-in-up">
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#0f131f]/95 backdrop-blur-md rounded-t-3xl z-10">
              <h2 className="text-base font-bold text-white">Detail & Aksi Order #{selectedOrder.order_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-[#141a29] border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
                {[
                  ['Order ID', selectedOrder.order_id],
                  ['Nama Customer', selectedOrder.customer_name],
                  ['WhatsApp', selectedOrder.customer_phone],
                  ['Email', selectedOrder.customer_email],
                  ['Produk', selectedOrder.product_name],
                  ['Varian', selectedOrder.variant_name],
                  ['Harga Produk', formatRupiah(selectedOrder.price)],
                  ['Kode Unik', `+${selectedOrder.unique_code}`],
                  ['Total Pembayaran', formatRupiah(selectedOrder.total_amount)],
                  ['Metode Pembayaran', selectedOrder.payment_method],
                  ['Waktu Dibuat', formatDate(selectedOrder.created_at)],
                  ['Batas Expired', formatDate(selectedOrder.expires_at)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-200 text-right max-w-[60%] break-all">{val}</span>
                  </div>
                ))}
              </div>

              {/* Status Section */}
              <div className="bg-[#141a29] rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-slate-400 mb-2 font-medium">Status Pesanan Saat Ini:</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full border ${STATUS_CONFIG[selectedOrder.status as OrderStatus].bg} ${STATUS_CONFIG[selectedOrder.status as OrderStatus].text} ${STATUS_CONFIG[selectedOrder.status as OrderStatus].border}`}>
                  {(() => { const Icon = STATUS_CONFIG[selectedOrder.status as OrderStatus].icon; return <Icon className="w-4 h-4" />; })()}
                  {STATUS_CONFIG[selectedOrder.status as OrderStatus].label}
                </span>
              </div>

              {/* Status Action Buttons */}
              {VALID_TRANSITIONS[selectedOrder.status]?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Ubah Status Order</p>
                  <div className="flex flex-wrap gap-2">
                    {VALID_TRANSITIONS[selectedOrder.status].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedOrder.order_id, s)}
                        disabled={confirming === selectedOrder.order_id}
                        className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                          s === 'PAID' || s === 'COMPLETED' ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30' :
                          s === 'PROCESSING' ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30' :
                          'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {confirming === selectedOrder.order_id ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : null}
                        Set {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Note Input */}
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Catatan Internal Admin</p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Isi kredensial akun / catatan khusus..."
                  rows={2}
                  className="w-full bg-[#141a29] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Chat WhatsApp Button */}
              <a
                href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kak ${selectedOrder.customer_name}, ini dari Admin NovaAI Store terkait pesanan ${selectedOrder.product_name} (#${selectedOrder.order_id}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Chat Customer via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
