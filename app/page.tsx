import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Zap, ShieldCheck, Headphones, ArrowRight, CheckCircle2, Search, MessageCircle, Lock } from 'lucide-react';
import { ProductCatalog } from '@/components/catalog/ProductCatalog';
import { SocialProofWrapper } from '@/components/social-proof/SocialProofWrapper';

function HeroSection() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6285157746677';
  const cleanWa = adminWa.replace(/[^0-9]/g, '');

  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
      {/* Dynamic Glowing Ambient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] animate-blob" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] rounded-full bg-cyan-500/15 blur-[100px] animate-blob [animation-delay:2s]" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-purple-600/15 blur-[90px] animate-blob [animation-delay:4s]" />

        {/* Floating Particles */}
        <div className="hidden sm:block absolute top-24 right-[15%] w-3 h-3 rounded-full bg-cyan-400/40 animate-float" />
        <div className="hidden sm:block absolute top-44 left-[12%] w-2.5 h-2.5 rounded-full bg-indigo-400/40 animate-float-slow" />
        <div className="hidden sm:block absolute bottom-24 right-[28%] w-3 h-3 rounded-lg bg-purple-400/30 animate-float rotate-45" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 animate-fade-in-up shadow-xl shadow-indigo-500/5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-300 tracking-wide">
            Sistem Otomatis Online 24/7
          </span>
          <span className="text-white/20">|</span>
          <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Garansi Resmi
          </span>
        </div>

        {/* 3D Headline */}
        <div className="perspective-1000 mb-6">
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white animate-fade-in-up leading-[1.15]"
            style={{ animationDelay: '100ms' }}
          >
            Akses Premium Tools{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 drop-shadow-sm">
              AI Terpercaya
            </span>
            <br className="hidden sm:block" /> Dengan Harga Terbaik
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          Dapatkan akun ChatGPT Plus, Claude AI Pro, Google Gemini Advanced & Midjourney secara resmi. Proses kilat, pembayaran mudah & full garansi.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <a
            href="#products"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-current" />
            <span>Pesan Akun Sekarang</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href={`https://wa.me/${cleanWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0f131f] hover:bg-[#141a29] text-slate-200 hover:text-white font-semibold text-base px-7 py-4 rounded-2xl transition-all duration-200 border border-white/10 hover:border-white/20 shadow-lg"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400 fill-current" />
            <span>Tanya Admin WA</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, title: 'Garansi Resmi Full', desc: 'Jaminan penggantian akun jika ada kendala selama masa langganan', color: 'text-indigo-400' },
    { icon: Zap, title: 'Proses Kilat 1-5 Menit', desc: 'Pesanan langsung diproses otomatis begitu konfirmasi pembayaran', color: 'text-cyan-400' },
    { icon: Headphones, title: 'Support Admin Fast Response', desc: 'Bantuan ramah via WhatsApp siap melayani kendala Anda kapan saja', color: 'text-emerald-400' },
  ];

  return (
    <section className="py-14 border-y border-white/10 bg-[#07090e]/60 relative z-10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((b, i) => (
            <div
              key={b.title}
              className="glass-card-hover p-6 rounded-2xl flex items-start gap-4 transition-all"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={`shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10 ${b.color}`}>
                <b.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{b.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6285157746677';
  const cleanWa = adminWa.replace(/[^0-9]/g, '');

  return (
    <footer className="border-t border-white/10 bg-[#07090e] pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-black text-white tracking-tight">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-base shadow-lg shadow-indigo-500/20">
                N
              </span>
              Nova<span className="text-cyan-400">AI</span> Store
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Penyedia layanan akun & tools AI premium terdepan di Indonesia. Dapatkan akses ke teknologi AI mutakhir dengan harga terjangkau dan garansi penuh.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Berjalan Normal
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> SSL 256-bit Encrypted
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#products" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-indigo-400" /> Katalog Produk AI
                </a>
              </li>
              <li>
                <Link href="/track" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-indigo-400" /> Lacak Status Pesanan
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Customer Service
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-cyan-400 transition-colors text-slate-500">
                  Admin Dashboard Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Payments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Legal & Pembayaran</h4>
            <ul className="space-y-2 text-xs mb-5">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">Kebijakan Garansi & Refund</Link>
              </li>
            </ul>

            <h5 className="text-[11px] font-bold text-slate-300 mb-2">Metode Pembayaran:</h5>
            <div className="flex items-center gap-2 flex-wrap">
              {['BCA', 'Mandiri', 'SeaBank', 'QRIS'].map((bank) => (
                <span key={bank} className="bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 px-2.5 py-1 rounded-md">
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NovaAI Store. Seluruh hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-rose-500">❤️</span> for Indonesian Creators & Developers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6285157746677';
  const cleanWa = adminWa.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#07090e]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              N
            </span>
            <span>Nova<span className="text-cyan-400">AI</span></span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5">
            <a href="#products" className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
              Katalog
            </a>
            <Link
              href="/track"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lacak Pesanan</span>
            </Link>
            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Admin</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        <TrustBadges />

        {/* Product Catalog */}
        <section id="products" className="py-20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Pilihan AI Terpopuler
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                Pilih Tools AI Favorit Anda
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                Harga transparan, garansi penuh, dan akses instan langsung dipakai
              </p>
            </div>

            <ProductCatalog />
          </div>
        </section>
      </main>

      <Footer />
      <SocialProofWrapper />
    </div>
  );
}
