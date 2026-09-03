'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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

  // Trap focus inside modal
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

    // Client-side validation
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-surface-light border border-surface-border rounded-t-2xl sm:rounded-2xl animate-fade-in-up"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-surface-border bg-surface-light/95 backdrop-blur-sm rounded-t-2xl">
          <h2 className="text-lg font-semibold text-text-primary">
            {step === 'success' ? 'Pesanan Berhasil' : `Pesan ${product.name}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-lighter transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {/* Success State */}
          {step === 'success' && result && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-2">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary mb-1">Pesanan Dibuat!</p>
                <p className="text-sm text-text-secondary">
                  Segera lakukan pembayaran sebelum pesanan kedaluwarsa.
                </p>
              </div>
              <div className="bg-surface rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Order ID</span>
                  <span className="text-text-primary text-sm font-mono">{result.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Total Transfer</span>
                  <span className="text-nexai-400 font-bold">{formatRupiah(result.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary text-sm">Kode Unik</span>
                  <span className="text-warning font-mono">{result.uniqueCode}</span>
                </div>
              </div>
              <a
                href={`/invoice/${result.orderId}?token=${result.invoiceToken}`}
                className="block w-full bg-nexai-600 hover:bg-nexai-500 text-white text-center font-medium py-3 rounded-xl transition-colors"
              >
                Lihat Invoice
              </a>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-2">
                <AlertCircle className="w-8 h-8 text-danger" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary mb-1">Gagal Membuat Pesanan</p>
                <p className="text-sm text-danger">{error}</p>
              </div>
              <button
                onClick={() => {
                  setStep('form');
                  idempotencyKeyRef.current = crypto.randomUUID();
                }}
                className="w-full bg-surface-lighter hover:bg-surface-border text-text-primary font-medium py-3 rounded-xl transition-colors cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Submitting State */}
          {step === 'submitting' && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-nexai-500 animate-spin mx-auto" />
              <p className="text-text-secondary">Memproses pesanan...</p>
            </div>
          )}

          {/* Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Variant */}
              <div>
                <label htmlFor="variant" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Pilih Varian
                </label>
                <select
                  id="variant"
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  required
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-nexai-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Varian --</option>
                  {activeVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {formatRupiah(v.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  placeholder="email@contoh.com"
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.method}
                      type="button"
                      onClick={() => setPaymentMethod(pm.method)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        paymentMethod === pm.method
                          ? 'border-nexai-500 bg-nexai-600/10 text-nexai-400'
                          : 'border-surface-border bg-surface hover:border-surface-lighter text-text-secondary'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              {selectedVariantData && (
                <div className="bg-surface rounded-xl p-4 border border-surface-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Harga</span>
                    <span className="text-lg font-bold text-nexai-400">
                      {formatRupiah(selectedVariantData.price)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">+ kode unik akan ditambahkan saat checkout</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-sm text-danger bg-danger/10 p-3 rounded-xl">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedVariant || !paymentMethod || !customerName || !customerPhone || !customerEmail}
                className="w-full bg-nexai-600 hover:bg-nexai-500 disabled:bg-surface-lighter disabled:text-text-muted disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Buat Pesanan
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
