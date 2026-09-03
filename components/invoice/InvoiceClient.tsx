'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getPaymentInfo } from '@/lib/config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { Loader3D } from '@/components/ui/Loader3D';

interface InvoiceClientProps {
  orderId: string;
  token: string;
}

export function InvoiceClient({ orderId, token }: InvoiceClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  const fetchOrder = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/orders/invoice?orderId=${orderId}&token=${token}`);
      if (!res.ok) {
        if (!isSilent) setError('Pesanan tidak ditemukan');
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      if (!isSilent) setError('Gagal memuat data pesanan');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [orderId, token]);

  // Initial fetch & Polling fallback every 3s so admin status updates instantly sync
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Realtime updates via Supabase WS
  useEffect(() => {
    if (!order) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...payload.new } as Order : prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order, orderId]);

  // Countdown timer
  useEffect(() => {
    if (!order || order.status !== 'PENDING') return;
    const tick = () => {
      const diff = new Date(order.expires_at).getTime() - Date.now();
      if (diff <= 0) { setCountdown('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4">
        <Loader3D size="lg" text="Memuat Invoice Realtime..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-[#11131a] border border-white/10 p-8 rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-white mb-1">Invoice Tidak Ditemukan</h1>
          <p className="text-slate-400 text-xs mb-5">{error || 'Invoice tidak valid atau sudah expired.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const paymentInfo = getPaymentInfo(order.payment_method);
  const isPending = order.status === 'PENDING';
  const isPaid = order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'COMPLETED';
  const isExpired = order.status === 'EXPIRED' || order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pb-16 font-sans">
      {/* Navbar */}
      <header className="bg-[#11131a] border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <span>NovaAI Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-5 border ${
          isPaid
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : isExpired
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <div className="flex items-start gap-3">
            {isPaid ? (
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            ) : isExpired ? (
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-6 h-6 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isPaid ? 'Pembayaran Berhasil / Sedang Diproses' : isExpired ? 'Pesanan Kedaluwarsa' : 'Menunggu Transfer Pembayaran'}
              </p>
              <p className="text-xs opacity-90 mt-0.5 text-slate-300">
                {isPaid
                  ? 'Admin sedang memproses akun Anda. Anda akan segera dihubungi via WhatsApp.'
                  : isExpired
                  ? 'Batas waktu pembayaran habis. Silakan buat order baru.'
                  : `Mohon transfer sebelum ${formatDate(order.expires_at)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Order Info Card */}
        <div className="bg-[#11131a] border border-white/10 rounded-xl p-5 mb-5 space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400">Order ID</span>
            <span className="font-mono font-bold text-xs text-indigo-400">#{order.order_id}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Produk</span>
              <span className="font-semibold text-white">{order.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Varian</span>
              <span className="text-slate-200">{order.variant_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nama Pemesan</span>
              <span className="text-slate-200">{order.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Metode Bayar</span>
              <div className="flex items-center gap-1.5">
                {paymentInfo?.logo && (
                  <div className="w-7 h-4 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                    <Image src={paymentInfo.logo} alt={paymentInfo.label} width={24} height={12} className="object-contain max-h-3" />
                  </div>
                )}
                <span className="font-bold text-white">{order.payment_method}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Card */}
        {isPending && (
          <div className="bg-[#11131a] border border-indigo-500/30 rounded-xl p-5 mb-5 text-center">
            <p className="text-xs text-slate-400 font-medium mb-1">TOTAL NOMINAL UNTUK DITRANSFER</p>
            <p className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {formatRupiah(order.total_amount)}
            </p>

            <p className="text-xs text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 max-w-sm mx-auto">
              ⚠️ Wajib transfer presisi hingga 3 digit kode unik (<strong>+{order.unique_code}</strong>) agar otomatis terverifikasi.
            </p>

            {countdown && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-[11px] text-slate-400 mb-0.5">Sisa Waktu Pembayaran</p>
                <p className="text-xl font-mono font-bold text-amber-400 tracking-widest">{countdown}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Target Account */}
        {isPending && paymentInfo && (
          <div className="bg-[#11131a] border border-white/10 rounded-xl p-5 mb-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300 uppercase">Rekening Tujuan</span>
              {paymentInfo.logo && (
                <div className="w-10 h-6 rounded bg-white p-0.5 flex items-center justify-center shrink-0 border border-zinc-200">
                  <Image src={paymentInfo.logo} alt={paymentInfo.label} width={32} height={16} className="object-contain max-h-4" />
                </div>
              )}
            </div>

            {paymentInfo.method === 'QRIS' ? (
              <div className="text-center space-y-2">
                <div className="relative w-full max-w-[240px] mx-auto aspect-square rounded-xl overflow-hidden bg-white p-2 border border-zinc-200">
                  <Image
                    src="/qris.jpg"
                    alt="QRIS Payment Code"
                    fill
                    className="object-contain p-1"
                    sizes="240px"
                  />
                </div>
                <p className="text-xs text-slate-400">Scan QRIS dengan BCA, Mandiri, GoPay, OVO, ShopeePay, dll</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#171a24] rounded-lg p-3 border border-white/5">
                  <div>
                    <p className="text-[10px] text-slate-400">{paymentInfo.label}</p>
                    <p className="text-lg font-mono font-bold text-white tracking-wider">
                      {paymentInfo.account}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.account!, 'account')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copied === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'account' ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 text-right">
                  Atas Nama: <strong className="text-white">{paymentInfo.name}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-2.5">
          <a
            href={buildWhatsAppUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            Konfirmasi Pembayaran ke WA Admin
          </a>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/track"
              className="flex items-center justify-center gap-1.5 bg-[#11131a] hover:bg-[#171a24] border border-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Lacak Pesanan
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 bg-[#11131a] hover:bg-[#171a24] border border-white/10 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
