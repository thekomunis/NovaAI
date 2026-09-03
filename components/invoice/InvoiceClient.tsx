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
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { getPaymentInfo } from '@/lib/config';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { getSupabaseBrowser } from '@/lib/supabase/client';

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

  // Fetch order data
  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/invoice?orderId=${orderId}&token=${token}`);
        if (!res.ok) {
          setError('Pesanan tidak ditemukan');
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch {
        setError('Gagal memuat data pesanan');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, token]);

  // Realtime updates
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
        <div className="w-full max-w-md bg-[#0f131f] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-cyan-400/20 border-b-cyan-400 animate-spin-slow" />
          </div>
          <p className="text-white font-bold text-lg">Memuat Detail Invoice...</p>
          <p className="text-xs text-slate-400">Sinkronisasi status pembayaran realtime</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-[#0f131f] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invoice Tidak Ditemukan</h1>
          <p className="text-slate-400 text-sm mb-6">{error || 'Invoice tidak valid atau sudah kedaluwarsa.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-16">
      {/* Header */}
      <header className="bg-[#0f131f]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-500/20">N</span>
            Nova<span className="text-cyan-400">AI</span>
          </Link>
          <Link href="/track" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all">
            <Search className="w-3.5 h-3.5" /> Lacak Pesanan
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Status Banner */}
        <div className={`rounded-2xl p-5 mb-6 border backdrop-blur-md shadow-xl ${
          isPaid
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : isExpired
            ? 'bg-rose-500/10 border-rose-500/30'
            : 'bg-amber-500/10 border-amber-500/30 animate-pulse-glow'
        }`}>
          <div className="flex items-center gap-4">
            {isPaid ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            ) : isExpired ? (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
            )}
            <div>
              <p className={`font-bold text-base ${isPaid ? 'text-emerald-400' : isExpired ? 'text-rose-400' : 'text-amber-400'}`}>
                {isPaid ? 'Pembayaran Berhasil / Diproses' : isExpired ? 'Pesanan Kedaluwarsa' : 'Menunggu Pembayaran Transfer'}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {isPaid
                  ? 'Akun Anda sedang diproses oleh admin. Mohon pantau pesan WhatsApp.'
                  : isExpired
                  ? 'Batas waktu pembayaran telah habis. Silakan buat pesanan baru.'
                  : `Selesaikan pembayaran sebelum ${formatDate(order.expires_at)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-6 mb-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h1 className="text-base font-bold text-white">Rincian Pesanan</h1>
            <span className="text-xs font-mono font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-cyan-400">
              #{order.order_id}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Produk</span>
              <span className="font-semibold text-white">{order.product_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Varian</span>
              <span className="font-semibold text-slate-200 text-right">{order.variant_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nama Pemesan</span>
              <span className="text-slate-200">{order.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Metode Bayar</span>
              <div className="flex items-center gap-2">
                {paymentInfo?.logo && (
                  <div className="w-8 h-5 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                    <Image src={paymentInfo.logo} alt={paymentInfo.label} width={28} height={16} className="object-contain max-h-4" />
                  </div>
                )}
                <span className="font-bold text-white">{order.payment_method}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Waktu Order</span>
              <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Transfer Amount Card */}
        {isPending && (
          <div className="bg-gradient-to-b from-[#141a29] to-[#0f131f] border border-indigo-500/30 rounded-2xl p-6 mb-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              TOTAL KODE UNIK DITRANSFER
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 mb-3 tracking-tight">
              {formatRupiah(order.total_amount)}
            </p>

            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-xl mb-4">
              <span className="text-xs text-amber-300">Kode Unik:</span>
              <span className="text-sm font-mono font-bold text-amber-400">+{order.unique_code}</span>
            </div>

            <p className="text-xs text-amber-300/90 font-medium bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 max-w-md mx-auto">
              ⚠️ Transfer HARUS SESUAI hingga 3 digit terakhir ({order.unique_code}) agar verifikasi otomatis & lebih cepat diproses.
            </p>

            {countdown && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-1">Batas Waktu Pembayaran</p>
                <p className="text-2xl font-mono font-bold text-amber-400 tracking-widest">{countdown}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Account Details */}
        {isPending && paymentInfo && (
          <div className="bg-[#0f131f] border border-white/10 rounded-2xl p-6 mb-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">REKENING TUJUAN PEMBAYARAN</h2>
              {paymentInfo.logo && (
                <div className="w-12 h-7 rounded bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200">
                  <Image src={paymentInfo.logo} alt={paymentInfo.label} width={40} height={20} className="object-contain max-h-5" />
                </div>
              )}
            </div>

            {paymentInfo.method === 'QRIS' ? (
              <div className="text-center space-y-3">
                <div className="relative w-full max-w-[280px] mx-auto aspect-square rounded-2xl overflow-hidden bg-white p-3 shadow-2xl border-4 border-cyan-500/30">
                  <Image
                    src="/qris.jpg"
                    alt="QRIS Payment Code"
                    fill
                    className="object-contain p-2"
                    sizes="280px"
                  />
                </div>
                <p className="text-xs text-slate-400">Scan QRIS menggunakan mobile banking / e-wallet apapun</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#141a29] border border-white/10 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">{paymentInfo.label}</p>
                    <p className="text-xl font-mono font-bold text-white tracking-wider">
                      {paymentInfo.account}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.account!, 'account')}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copied === 'account' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center text-sm px-1">
                  <span className="text-slate-400">Atas Nama Rekening:</span>
                  <span className="font-bold text-white">{paymentInfo.name}</span>
                </div>
              </div>
            )}

            {/* Total Amount Copy Button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Copy Nominal Transfer</span>
              <button
                onClick={() => copyToClipboard(order.total_amount.toString(), 'amount')}
                className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
              >
                {formatRupiah(order.total_amount)}
                {copied === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Call-to-action buttons */}
        <div className="space-y-3">
          <a
            href={buildWhatsAppUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            Konfirmasi Pembayaran via WhatsApp
          </a>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/track"
              className="flex items-center justify-center gap-2 bg-[#0f131f] hover:bg-[#141a29] border border-white/10 text-slate-300 font-semibold py-3 rounded-xl transition-all text-xs"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              Lacak Pesanan
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-[#0f131f] hover:bg-[#141a29] border border-white/10 text-slate-300 font-semibold py-3 rounded-xl transition-all text-xs"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              Kembali ke Toko
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
