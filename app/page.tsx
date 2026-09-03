import Link from 'next/link';
import { Sparkles, Zap, Shield, Headphones } from 'lucide-react';
import { ProductCatalog } from '@/components/catalog/ProductCatalog';
import { SocialProofWrapper } from '@/components/social-proof/SocialProofWrapper';

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-nexai-600/5 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-nexai-500/5 blur-3xl" />
        {/* Floating decorative elements */}
        <div className="hidden sm:block absolute top-20 right-[15%] w-3 h-3 rounded-full bg-nexai-500/30 animate-float" />
        <div className="hidden sm:block absolute top-40 left-[10%] w-2 h-2 rounded-full bg-nexai-400/20 animate-float-slow" />
        <div className="hidden sm:block absolute bottom-20 right-[25%] w-2.5 h-2.5 rounded-sm bg-nexai-600/20 animate-float rotate-45" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-nexai-600/10 border border-nexai-500/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5 text-nexai-400" />
          <span className="text-xs font-medium text-nexai-300 tracking-wide">AI Marketplace Terpercaya</span>
        </div>

        {/* Hero heading with 3D perspective */}
        <div className="perspective-container mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Akses Tools{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexai-400 to-nexai-600">
              AI Premium
            </span>
            <br className="hidden sm:block" />{' '}
            dengan Mudah
          </h1>
        </div>

        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Dapatkan akun ChatGPT, Claude AI, dan Google AI Pro dengan harga terbaik. Proses cepat, aman, dan terpercaya.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 bg-nexai-600 hover:bg-nexai-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-nexai-600/20 active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Lihat Produk
          </a>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-surface-lighter hover:bg-surface-border text-text-primary font-medium px-8 py-3.5 rounded-xl transition-all duration-200 border border-surface-border"
          >
            <Headphones className="w-4 h-4" />
            Hubungi Admin
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Shield, label: 'Pembayaran Aman', desc: 'Transfer bank & QRIS' },
    { icon: Zap, label: 'Proses Cepat', desc: 'Pengiriman instan' },
    { icon: Headphones, label: 'Support 24/7', desc: 'Via WhatsApp' },
  ];

  return (
    <section className="py-12 border-y border-surface-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {badges.map((badge, i) => (
            <div
              key={badge.label}
              className="flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-nexai-600/10 border border-nexai-500/15 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-nexai-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{badge.label}</p>
                <p className="text-xs text-text-muted">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-border/50 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} NexAI Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/track" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
              Lacak Pesanan
            </Link>
            <Link href="/terms" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/refund" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
              Refund
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-surface-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
            Nex<span className="text-nexai-500">AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <a href="#products" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Produk
            </a>
            <Link href="/track" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Lacak Pesanan
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-nexai-600/15 hover:bg-nexai-600/25 text-nexai-400 font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        <TrustBadges />

        {/* Products */}
        <section id="products" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                Produk Tersedia
              </h2>
              <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto">
                Pilih tools AI premium sesuai kebutuhan Anda
              </p>
            </div>
            <ProductCatalog />
          </div>
        </section>
      </main>

      <Footer />
      <SocialProofWrapper />
    </>
  );
}
