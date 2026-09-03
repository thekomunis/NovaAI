'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, CheckCircle2, AlertCircle, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import type { Product, PaymentMethod } from '@/lib/types';
import type { OrderCreateResponse } from '@/lib/types';
import { formatRupiah, normalizePhone, isValidPhone } from '@/lib/utils';
import { paymentMethods } from '@/lib/config';

interface OrderModalProps {
  product: Product | null;
  onClose: () => void;
}

type ModalStep = 'form' | 'submitting' | 'success' | 'error';

export function OrderModal({ product, onClose }: OrderModalProps) {
  const [selectedVariant, setSelectedVariant] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [step, setStep] = useState<ModalStep>('form');
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderCreateResponse | null>(null);
  const idempotencyKeyRef = useRef('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate idempotency key on mount
  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, []);

  // Set default variant when product changes
  useEffect(() => {
    if (product) {
      const activeVariants = product.variants.filter(v => v.active);
      if (activeVariants.length === 1) {
        setSelectedVariant(activeVariants[0].id);
      } else {
        setSelectedVariant('');
      }
    }
  }, [product]);

  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  const selectedVariantData = product?.variants.find(v => v.id === selectedVariant);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedVariant || !paymentMethod) return;

    if (!customerName.trim() || customerName.trim().length < 2) {
      setError('Nama minimal 2 karakter');
      return;
    }
    if (!isValidPhone(customerPhone)) {
      setError('Nomor WhatsApp tidak valid (gunakan format 08xx atau 628xx)');
      return;
    }
    if (!customerEmail.includes('@')) {
      setError('Email tidak valid');
      return;
    }

    setStep('submitting');
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: product.slug,
          variantId: selectedVariant,
          customerName: customerName.trim(),
          customerPhone: normalizePhone(customerPhone),
          customerEmail: customerEmail.trim(),
          paymentMethod,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal membuat pesanan');
        setStep('error');
        return;
      }

      setResult(data);
      setStep('success');
    } catch {
      setError('Koneksi gagal. Silakan coba lagi.');
      setStep('error');
    }
  }, [product, selectedVariant, paymentMethod, customerName, customerPhone, customerEmail]);

  if (!product) return null;

  const activeVariants = product.variants.filter(v => v.active);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Form pemesanan"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[#0f131f] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-indigo-500/10 animate-fade-in-up"
      >
        {/* Decorative Top Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 rounded-t-3xl" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0f131f]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {step === 'success' ? 'Pesanan Berhasil!' : `Pesan ${product.name}`}
              </h2>
              <p className="text-xs text-slate-400">Proses instan & garansi resmi 100%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* Success State */}
          {step === 'success' && result && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Pesanan Siap Dibayar</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Silakan selesaikan pembayaran untuk memproses akun Anda.
                </p>
              </div>

              <div className="bg-[#171d2e] border border-white/10 rounded-2xl p-4 text-left space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-cyan-400">{result.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pembayaran:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(result.totalAmount)}</span>
                </div>
              </div>

              <a
                href={`/invoice/${result.orderId}?token=${result.invoiceToken}`}
                className="block w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-center"
              >
                Buka Tagihan & Pembayaran →
              </a>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-rose-400 text-sm font-medium">{error}</p>
              <button
                onClick={() => {
                  setStep('form');
                  idempotencyKeyRef.current = crypto.randomUUID();
                }}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Loading State with Shimmer */}
          {step === 'submitting' && (
            <div className="text-center py-12 space-y-4">
              <div className="relative w-14 h-14 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-cyan-400/20 border-b-cyan-400 animate-spin-slow" />
              </div>
              <p className="text-slate-300 font-medium">Memproses Pesanan Anda...</p>
              <p className="text-xs text-slate-500">Menyiapkan rincian tagihan & kode unik</p>
            </div>
          )}

          {/* Main Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Variant Selector Cards */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  1. Pilih Paket / Varian
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {activeVariants.map((v) => {
                    const isSelected = selectedVariant === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-[#141a29] border-white/5 hover:border-white/15 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {v.name}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-cyan-400' : 'text-indigo-400'}`}>
                          {formatRupiah(v.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Information Inputs */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  2. Informasi Pemesan
                </label>

                <div>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Nama Lengkap"
                    className="w-full bg-[#141a29] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="Nomor WhatsApp (cth: 085157746677)"
                    className="w-full bg-[#141a29] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    placeholder="Alamat Email (untuk pengiriman akses)"
                    className="w-full bg-[#141a29] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Payment Method Options with Bank Logos */}
              <div className="pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  3. Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {paymentMethods.map((pm) => {
                    const isSelected = paymentMethod === pm.method;
                    return (
                      <button
                        key={pm.method}
                        type="button"
                        onClick={() => setPaymentMethod(pm.method)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-[#141a29] border-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* Logo Container with White Badge */}
                        <div className="w-12 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                          {pm.logo ? (
                            <Image
                              src={pm.logo}
                              alt={pm.label}
                              width={40}
                              height={24}
                              className="object-contain max-h-6 w-auto"
                            />
                          ) : (
                            <CreditCard className="w-5 h-5 text-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {pm.method}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {pm.method === 'QRIS' ? 'Instant QR' : 'Transfer Bank'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Summary Card */}
              {selectedVariantData && (
                <div className="bg-[#141a29] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Estimasi</span>
                    <span className="text-xs text-amber-400 font-medium">+ Kode unik acak</span>
                  </div>
                  <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    {formatRupiah(selectedVariantData.price)}
                  </span>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!selectedVariant || !paymentMethod || !customerName || !customerPhone || !customerEmail}
                className="w-full bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Lanjutkan Pembayaran
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
