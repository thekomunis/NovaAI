import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Zap, ArrowRight, Search, MessageCircle, Lock, Star, CheckCircle2 } from 'lucide-react';
import { ProductCatalog } from '@/components/catalog/ProductCatalog';
import { SocialProofWrapper } from '@/components/social-proof/SocialProofWrapper';

function HeroSection() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6285157746677';
  const cleanWa = adminWa.replace(/[^0-9]/g, '');

  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-36 bg-[#05070c]">
      {/* Figma Cyberpunk Multi-Color Gradient Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-600/25 via-cyan-500/20 to-pink-500/15 blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-10 w-[420px] h-[420px] rounded-full bg-cyan-500/20 blur-[120px] animate-pulse-glow [animation-delay:2s]" />
        <div className="absolute bottom-10 left-10 w-[380px] h-[380px] rounded-full bg-purple-600/20 blur-[110px] animate-pulse-glow [animation-delay:4s]" />

        {/* Floating 3D Geometric Cube Accent */}
        <div className="hidden lg:block absolute top-28 right-[12%] w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 opacity-30 blur-[1px] animate-float rotate-12 shadow-2xl" />
        <div className="hidden lg:block absolute bottom-32 left-[10%] w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-600 opacity-25 blur-[1px] animate-float [animation-delay:2s] -rotate-12 shadow-2xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6">
        {/* SVGator-inspired Radar Pulse Badge */}
        <div className="inline-flex items-center gap-3 bg-[#0e121e]/90 border border-white/15 backdrop-blur-2xl rounded-full px-5 py-2 mb-8 shadow-2xl shadow-indigo-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-xs font-black text-slate-200 tracking-wider uppercase">
            Sistem Verifikasi Otomatis 24/7
          </span>
          <span className="text-white/20">|</span>
          <span className="text-xs text-cyan-400 font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Garansi Resmi 100%
          </span>
        </div>

        {/* Dribbble 3D Large Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] mb-6">
          Akses Tools{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 drop-shadow-lg">
            AI Premium
          </span>
          <br className="hidden sm:block" /> Terpercaya & Garansi Penuh
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Beli ChatGPT Plus, Claude AI Pro, Google Gemini Advanced & Midjourney secara resmi. Proses kilat 1-5 menit, bayar aman via QRIS & Bank.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#products"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-base px-8 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-indigo-500/40 hover:shadow-cyan-500/60 hover:scale-105 active:scale-95"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-current" />
            <span>Beli Akun Sekarang</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </a>

          <a
            href={`https://wa.me/${cleanWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#0e121e] hover:bg-[#141a2a] text-slate-200 hover:text-white font-extrabold text-base px-7 py-4 rounded-2xl transition-all border border-white/15 hover:border-white/30 shadow-xl"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400 fill-current" />
            <span>Chat Admin WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: '/icons/shield-3d.svg', title: 'Garansi Resmi Full 100%', desc: 'Jaminan penggantian akun instan jika ada kendala selama masa langganan', color: 'border-indigo-500/30' },
    { icon: '/icons/rocket-3d.svg', title: 'Proses Kilat 1-5 Menit', desc: 'Sistem otomatis memverifikasi dan mengirimkan akun ke WhatsApp Anda', color: 'border-cyan-500/30' },
    { icon: '/icons/headset-3d.svg', title: 'Support Admin Fast Response', desc: 'Bantuan ramah via WhatsApp siap melayani kendala Anda kapan saja', color: 'border-emerald-500/30' },
  ];

  return (
    <section className="py-16 border-y border-white/10 bg-[#07090e]/90 backdrop-blur-2xl relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((b) => (
            <div
              key={b.title}
              className={`p-6 rounded-3xl bg-[#0e121e]/80 border ${b.color} hover:border-cyan-400/50 shadow-2xl flex items-start gap-5 transition-all duration-300 hover:-translate-y-2 group`}
            >
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-2 shadow-xl group-hover:scale-110 transition-transform">
                <Image src={b.icon} alt={b.title} width={64} height={64} className="object-contain w-full h-full" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">{b.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
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
    <footer className="border-t border-white/10 bg-[#05070c] pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-black text-white tracking-tight">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-xl shadow-indigo-500/30">
                N
              </span>
              Nova<span className="text-cyan-400">AI</span> Store
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Penyedia akun & tools AI premium terpercaya di Indonesia. Dapatkan akses ke ChatGPT Plus, Claude AI, Gemini Advanced, dan Midjourney dengan garansi 100%.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Otomatis Normal
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> SSL Encrypted 256-bit
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#products" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-indigo-400" /> Katalog AI
                </a>
              </li>
              <li>
                <Link href="/track" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-indigo-400" /> Lacak Pesanan
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-400 font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Admin
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-cyan-400 transition-colors text-slate-500">
                  Admin Dashboard Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Payments & Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Metode Pembayaran</h4>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { name: 'BCA', logo: '/payments/bca.svg' },
                { name: 'Mandiri', logo: '/payments/mandiri.svg' },
                { name: 'SeaBank', logo: '/payments/seabank.svg' },
                { name: 'QRIS', logo: '/payments/qris.svg' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
                  <div className="w-8 h-4 bg-white p-0.5 rounded flex items-center justify-center shrink-0">
                    <Image src={p.logo} alt={p.name} width={28} height={12} className="object-contain max-h-3" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 text-xs">
              <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
              <Link href="/refund" className="hover:text-white transition-colors">Garansi & Refund</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#05070c]/90 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-white group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              N
            </span>
            <span>Nova<span className="text-cyan-400">AI</span></span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5">
            <a href="#products" className="text-xs sm:text-sm font-extrabold text-slate-300 hover:text-white transition-colors hidden sm:block">
              Katalog AI
            </a>
            <Link
              href="/track"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lacak Order</span>
            </Link>
            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-black bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
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
        <section id="products" className="py-24 relative bg-[#07090e]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Pilihan AI Terpopuler
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-3 tracking-tight">
                Pilih Tools AI Favorit Anda
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
                Garansi 100%, akses instan 1-5 menit, dan pilihan varian paling lengkap di Indonesia
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
