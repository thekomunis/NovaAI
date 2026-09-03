'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

interface TrackResult {
  order_id: string;
  product_name: string;
  variant_name: string;
  total_amount: number;
  status: OrderStatus;
  fulfillment_status: string;
  payment_method: string;
  created_at: string;
  expires_at: string;
  paid_at: string | null;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'PENDING', label: 'Menunggu Pembayaran', icon: Clock },
  { key: 'PAID', label: 'Pembayaran Diterima', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Sedang Diproses', icon: Package },
  { key: 'COMPLETED', label: 'Selesai', icon: CheckCircle2 },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  CANCELLED: -1,
  EXPIRED: -1,
};

export function OrderTracker() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState('');

  const handleTrack = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Pesanan tidak ditemukan');
        return;
      }

      setResult(data);
    } catch {
      setError('Koneksi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [orderId, phone]);

  const currentStep = result ? STATUS_INDEX[result.status] : -1;
  const isCancelled = result?.status === 'CANCELLED';
  const isExpired = result?.status === 'EXPIRED';
  const isFailed = isCancelled || isExpired;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-light border-b border-surface-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
            Nex<span className="text-nexai-500">AI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Lacak <span className="text-nexai-400">Pesanan</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Masukkan Order ID dan nomor WhatsApp untuk cek status pesanan
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="space-y-3 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID (contoh: INV-CHATGPT-001-43FF)"
            required
            className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors font-mono"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nomor WhatsApp (08xxxxxxxxxx)"
            required
            className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-3.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !orderId.trim() || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 bg-nexai-600 hover:bg-nexai-500 disabled:bg-surface-lighter disabled:text-text-muted text-white font-medium py-3.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? 'Mencari...' : 'Lacak Pesanan'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-in-up space-y-5">
            {/* Status Progress */}
            {!isFailed ? (
              <div className="bg-surface-light border border-surface-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-secondary mb-5 uppercase tracking-wider">
                  Status Pesanan
                </h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-surface-border" />
                  <div
                    className="absolute left-[18px] top-0 w-0.5 bg-nexai-500 transition-all duration-700"
                    style={{
                      height: currentStep >= 0 ? `${Math.min((currentStep / (STATUS_STEPS.length - 1)) * 100, 100)}%` : '0%',
                    }}
                  />

                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, i) => {
                      const isActive = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step.key} className="relative flex items-start gap-4 pl-0">
                          <div
                            className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                              isActive
                                ? isCurrent
                                  ? 'bg-nexai-600 ring-4 ring-nexai-600/20'
                                  : 'bg-nexai-600'
                                : 'bg-surface-lighter border border-surface-border'
                            }`}
                          >
                            <step.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                          </div>
                          <div className="pt-1.5">
                            <p className={`text-sm font-medium ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                              {step.label}
                            </p>
                            {isCurrent && step.key === 'PENDING' && (
                              <p className="text-xs text-warning mt-0.5">
                                Batas: {formatDate(result.expires_at)}
                              </p>
                            )}
                            {isCurrent && step.key === 'PAID' && result.paid_at && (
                              <p className="text-xs text-success mt-0.5">
                                Dibayar: {formatDate(result.paid_at)}
                              </p>
                            )}
                            {isCurrent && step.key === 'COMPLETED' && (
                              <p className="text-xs text-success mt-0.5">
                                Pesanan telah selesai ✓
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`rounded-xl p-5 border ${isCancelled ? 'bg-danger/10 border-danger/20' : 'bg-warning/10 border-warning/20'}`}>
                <div className="flex items-center gap-3">
                  {isCancelled ? (
                    <XCircle className="w-6 h-6 text-danger shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold text-sm ${isCancelled ? 'text-danger' : 'text-warning'}`}>
                      {isCancelled ? 'Pesanan Dibatalkan' : 'Pesanan Kedaluwarsa'}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {isCancelled
                        ? 'Pesanan ini telah dibatalkan.'
                        : 'Batas waktu pembayaran telah habis.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="bg-surface-light border border-surface-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                Detail Pesanan
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Order ID</span>
                  <span className="text-text-primary font-mono text-xs">{result.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Produk</span>
                  <span className="text-text-primary">{result.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Varian</span>
                  <span className="text-text-primary text-right max-w-[60%]">{result.variant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total</span>
                  <span className="text-nexai-400 font-bold">{formatRupiah(result.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pembayaran</span>
                  <span className="text-text-primary">{result.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tanggal Pesan</span>
                  <span className="text-text-primary text-xs">{formatDate(result.created_at)}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA || ''}?text=${encodeURIComponent(`Halo Admin, saya ingin cek status pesanan ${result.order_id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Hubungi Admin via WhatsApp
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
