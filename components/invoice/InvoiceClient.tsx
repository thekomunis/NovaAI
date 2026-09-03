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
  Loader2,
  ArrowLeft,
  Search,
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
      // Fallback for older browsers
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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-nexai-500 animate-spin mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-primary mb-2">Pesanan Tidak Ditemukan</h1>
          <p className="text-text-secondary text-sm mb-6">{error || 'Invoice tidak valid atau sudah kedaluwarsa.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 text-nexai-400 hover:text-nexai-300 text-sm font-medium">
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
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-light border-b border-surface-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
            Nova<span className="text-nexai-500">AI</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 border ${
          isPaid
            ? 'bg-success/10 border-success/20'
            : isExpired
            ? 'bg-danger/10 border-danger/20'
            : 'bg-warning/10 border-warning/20'
        }`}>
          <div className="flex items-center gap-3">
            {isPaid ? (
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
            ) : isExpired ? (
              <AlertTriangle className="w-6 h-6 text-danger shrink-0" />
            ) : (
              <Clock className="w-6 h-6 text-warning shrink-0 animate-pulse" />
            )}
            <div>
              <p className={`font-semibold text-sm ${isPaid ? 'text-success' : isExpired ? 'text-danger' : 'text-warning'}`}>
                {isPaid ? 'Pembayaran Berhasil' : isExpired ? 'Pesanan Kedaluwarsa' : 'Menunggu Pembayaran'}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {isPaid
                  ? 'Akun sedang diproses. Anda akan dihubungi via WhatsApp.'
                  : isExpired
                  ? 'Pesanan ini sudah tidak aktif.'
                  : `Selesaikan pembayaran sebelum ${formatDate(order.expires_at)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-surface-light border border-surface-border rounded-xl p-5 mb-5">
          <h1 className="text-lg font-semibold text-text-primary mb-4">Detail Pesanan</h1>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Order ID</span>
              <span className="text-text-primary font-mono text-xs">{order.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Produk</span>
              <span className="text-text-primary">{order.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Varian</span>
              <span className="text-text-primary text-right max-w-[60%]">{order.variant_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Nama</span>
              <span className="text-text-primary">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Metode Pembayaran</span>
              <span className="text-text-primary">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Waktu Pesan</span>
              <span className="text-text-primary text-xs">{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        {isPending && (
          <div className="bg-surface-light border border-nexai-500/30 rounded-xl p-5 mb-5 animate-pulse-glow">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">TOTAL TRANSFER</h2>
            <p className="text-3xl sm:text-4xl font-bold text-nexai-400 mb-3 tracking-tight">
              {formatRupiah(order.total_amount)}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-text-secondary">Kode unik:</span>
              <span className="text-sm font-mono font-bold text-warning">{order.unique_code}</span>
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <p className="text-xs text-warning font-medium">
                ⚠️ Transfer sesuai nominal hingga 3 digit terakhir.
              </p>
            </div>
            {countdown && (
              <div className="mt-3 text-center">
                <p className="text-xs text-text-muted mb-1">Batas Waktu Pembayaran</p>
                <p className="text-2xl font-mono font-bold text-warning tracking-widest">{countdown}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Info */}
        {isPending && paymentInfo && (
          <div className="bg-surface-light border border-surface-border rounded-xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-4">INFORMASI PEMBAYARAN</h2>

            {paymentInfo.method === 'QRIS' ? (
              <div className="text-center">
                <div className="relative w-full max-w-[280px] mx-auto aspect-square rounded-xl overflow-hidden bg-white">
                  <Image
                    src="/qris.jpg"
                    alt="QRIS Payment"
                    fill
                    className="object-contain p-2"
                    sizes="280px"
                  />
                </div>
                <p className="text-xs text-text-muted mt-3">Scan QR Code untuk pembayaran</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-surface rounded-lg p-3">
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">{paymentInfo.label}</p>
                    <p className="text-lg font-mono font-semibold text-text-primary tracking-wider">
                      {paymentInfo.account}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentInfo.account!, 'account')}
                    className="shrink-0 p-2 rounded-lg bg-surface-lighter hover:bg-surface-border transition-colors cursor-pointer"
                    aria-label="Salin nomor rekening"
                  >
                    {copied === 'account' ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-secondary" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-text-secondary">
                  a/n <span className="font-medium text-text-primary">{paymentInfo.name}</span>
                </p>
                {copied === 'account' && (
                  <p className="text-xs text-success animate-fade-in-up">✓ Berhasil disalin</p>
                )}
              </div>
            )}

            {/* Copy total amount */}
            <div className="mt-4 pt-4 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Total Transfer</span>
                <button
                  onClick={() => copyToClipboard(order.total_amount.toString(), 'amount')}
                  className="flex items-center gap-2 text-sm text-nexai-400 hover:text-nexai-300 transition-colors cursor-pointer"
                >
                  {formatRupiah(order.total_amount)}
                  {copied === 'amount' ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {copied === 'amount' && (
                <p className="text-xs text-success text-right mt-1 animate-fade-in-up">✓ Berhasil disalin</p>
              )}
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="space-y-3">
          <a
            href={buildWhatsAppUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Konfirmasi via WhatsApp
          </a>
          <Link
            href="/track"
            className="flex items-center justify-center gap-2 w-full bg-surface-lighter hover:bg-surface-border text-text-primary font-medium py-3 rounded-xl transition-colors border border-surface-border"
          >
            <Search className="w-4 h-4" />
            Lacak Pesanan
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full text-text-secondary hover:text-text-primary text-sm py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
