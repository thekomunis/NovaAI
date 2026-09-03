'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, AlertCircle, Sparkles, CreditCard, ShieldCheck, User, Phone, Mail, ArrowRight } from 'lucide-react';
import type { Product, PaymentMethod } from '@/lib/types';
import type { OrderCreateResponse } from '@/lib/types';
import { formatRupiah, normalizePhone, isValidPhone } from '@/lib/utils';
import { paymentMethods } from '@/lib/config';
import { Loader3D } from '@/components/ui/Loader3D';

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

  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, []);

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
      if (res.ok) {
        setResult(data);
        setStep('success');
      } else {
        setError(data.error || 'Gagal membuat pesanan');
        setStep('error');
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      setStep('error');
    }
  }, [product, selectedVariant, paymentMethod, customerName, customerPhone, customerEmail]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dynamic 3D Glass Backdrop */}
      <div
        className="fixed inset-0 bg-[#07090e]/85 backdrop-blur-xl transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Floating 3D Form Card Container */}
      <div className="relative w-full max-w-xl my-8 bg-[#111625]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.3)] text-left animate-fade-in-up z-10 overflow-hidden">
        {/* Ambient Top Glow Blob */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10 mb-6 relative">
          <div className="flex items-center gap-3.5">
            {product.icon ? (
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 p-1.5 shadow-xl shrink-0">
                <Image src={product.icon} alt={product.name} width={48} height={48} className="object-contain w-full h-full" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-xl">
                {product.name[0]}
              </div>
            )}

            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Form Pemesanan {product.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Garansi Resmi 100% & Instant Process</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Submitting State with 3D Orbit Loader */}
        {step === 'submitting' && (
          <div className="py-16 text-center space-y-4">
            <Loader3D size="lg" text="Memproses Pesanan Anda..." />
            <p className="text-xs text-slate-400">Harap tunggu sebentar, sistem sedang membuat invoice resmi...</p>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && result && (
          <div className="py-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white mb-1">Pesanan Berhasil Dibuat!</h3>
              <p className="text-xs text-slate-300">Order ID Anda: <strong className="text-cyan-400 font-mono text-sm">#{result.orderId}</strong></p>
            </div>

            <div className="bg-[#171e31] border border-white/10 rounded-2xl p-5 text-left text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Total Transfer:</span><span className="font-extrabold text-emerald-400 text-sm">{formatRupiah(result.totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Metode Bayar:</span><span className="font-bold text-white">{result.paymentMethod || paymentMethod}</span></div>
            </div>

            <button
              onClick={() => { window.location.href = `/invoice/${result.orderId}?token=${result.invoiceToken}`; }}
              className="w-full bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Lihat Tagihan Pembayaran & WA Admin
            </button>
          </div>
        )}

        {/* Form View */}
        {(step === 'form' || step === 'error') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Select Variant */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                1. Pilih Paket Varian
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {product.variants.filter(v => v.active).map((variant) => {
                  const isSelected = selectedVariant === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 border-cyan-400 shadow-lg shadow-indigo-500/20'
                          : 'bg-[#171e31] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{variant.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Garansi Full • Akses Resmi</p>
                      </div>
                      <span className="text-base font-black text-cyan-400">{formatRupiah(variant.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer Inputs */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                2. Data Pemesan (Untuk Pengiriman Akun)
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    className="w-full bg-[#171e31] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-[#171e31] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Alamat Email Aktif"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#171e31] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method Cards */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                3. Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {paymentMethods.map((pm) => {
                  const isSelected = paymentMethod === pm.method;
                  return (
                    <div
                      key={pm.method}
                      onClick={() => setPaymentMethod(pm.method)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/30 border-cyan-400 shadow-md shadow-indigo-500/20'
                          : 'bg-[#171e31] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {pm.logo && (
                        <div className="w-9 h-6 bg-white rounded-lg p-0.5 flex items-center justify-center shrink-0 border border-zinc-200">
                          <Image src={pm.logo} alt={pm.label} width={30} height={14} className="object-contain max-h-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-extrabold text-white">{pm.method}</p>
                        <p className="text-[10px] text-slate-400">Verifikasi Otomatis</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedVariant || !paymentMethod}
              className="w-full bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Bayar {selectedVariantData ? formatRupiah(selectedVariantData.price) : ''}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
