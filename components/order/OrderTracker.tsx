'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';
import { ADMIN_WA_NUMBER } from '@/lib/config';
import { Loader3D } from '@/components/ui/Loader3D';

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="bg-[#0f1422]/90 border-b border-white/10 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-white">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-500/20">
              N
            </span>
            <span>Nova<span className="text-cyan-400">AI</span></span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Realtime Tracker
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Lacak Status <span className="text-cyan-400">Pesanan</span>
          </h1>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Masukkan Order ID & nomor WhatsApp Anda yang terdaftar
          </p>
        </div>

        {/* 3D Glass Form Card */}
        <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Order ID Pesanan
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID (contoh: INV-CHATGPT-002-CA51)"
                required
                className="w-full bg-[#171e31] border border-white/10 rounded-2xl px-4 py-3.5 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Nomor WhatsApp"
                required
                className="w-full bg-[#171e31] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !orderId.trim() || !phone.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white font-black py-4 rounded-2xl text-xs transition-all cursor-pointer shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Cari Pesanan</span>
            </button>
          </form>
        </div>

        {/* 3D Loading State */}
        {loading && (
          <div className="py-10">
            <Loader3D size="lg" text="Mencari Pesanan..." />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-6 text-rose-300 text-xs font-bold text-center animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 inline mr-2" />
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-in space-y-6">
            {!isFailed ? (
              <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-xs font-black text-slate-300 mb-6 uppercase tracking-wider">
                  Progres Status Pesanan
                </h2>
                <div className="relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-white/10" />
                  <div
                    className="absolute left-[18px] top-0 w-0.5 bg-cyan-400 transition-all duration-700"
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
                                  ? 'bg-cyan-500 ring-4 ring-cyan-500/20 text-white'
                                  : 'bg-indigo-600 text-white'
                                : 'bg-[#171e31] border border-white/10 text-slate-500'
                            }`}
                          >
                            <step.icon className="w-4 h-4" />
                          </div>
                          <div className="pt-1.5">
                            <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                              {step.label}
                            </p>
                            {isCurrent && step.key === 'PENDING' && (
                              <p className="text-[11px] text-amber-400 mt-0.5">
                                Batas: {formatDate(result.expires_at)}
                              </p>
                            )}
                            {isCurrent && step.key === 'PAID' && result.paid_at && (
                              <p className="text-[11px] text-emerald-400 mt-0.5">
                                Dibayar: {formatDate(result.paid_at)}
                              </p>
                            )}
                            {isCurrent && step.key === 'COMPLETED' && (
                              <p className="text-[11px] text-emerald-400 mt-0.5">
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
              <div className={`rounded-3xl p-5 border ${isCancelled ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'}`}>
                <div className="flex items-center gap-3">
                  {isCancelled ? <XCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                  <div>
                    <p className="font-bold text-xs">{isCancelled ? 'Pesanan Dibatalkan' : 'Pesanan Kedaluwarsa'}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Silakan pesan ulang di halaman utama.</p>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(`Halo Admin, saya mau cek pesanan #${result.order_id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs transition-all shadow-xl shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Chat Admin WA ({ADMIN_WA_NUMBER})
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
