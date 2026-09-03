import Link from 'next/link';
import { ShieldCheck, Zap, Headphones, ArrowRight, Search, MessageCircle, Lock } from 'lucide-react';
import { ProductCatalog } from '@/components/catalog/ProductCatalog';
import { SocialProofWrapper } from '@/components/social-proof/SocialProofWrapper';

function HeroSection() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6285157746677';
  const cleanWa = adminWa.replace(/[^0-9]/g, '');

  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">Marketplace AI Terpercaya • Garansi 100%</span>
        </div>

        {/* Clean Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
          Akses Account & Tools AI Premium <br className="hidden sm:block" />
          Dengan Harga Terbaik & Garansi Penuh
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Dapatkan ChatGPT Plus, Claude AI Pro, Google Gemini Advanced & Midjourney secara resmi. Proses cepat, bayar mudah via QRIS & Bank.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="#products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-current" />
            <span>Pesan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href={`https://wa.me/${cleanWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#11131a] hover:bg-[#181a24] text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/10 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
            <span>Hubungi Admin WA</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, title: 'Garansi Resmi Full', desc: 'Jaminan ganti akun jika bermasalah', color: 'text-indigo-400' },
    { icon: Zap, title: 'Proses Instan', desc: 'Pengiriman akun cepat via WhatsApp & Email', color: 'text-amber-400' },
    { icon: Headphones, title: 'Support 24/7', desc: 'Bantuan ramah via Admin WhatsApp', color: 'text-emerald-400' },
  ];

  return (
    <section className="py-10 border-y border-white/10 bg-[#0d0e14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((b) => (
            <div key={b.title} className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${b.color} shrink-0`}>
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">{b.title}</h3>
                <p className="text-xs text-slate-400">{b.desc}</p>
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
    <footer className="border-t border-white/10 bg-[#090a0f] pt-12 pb-10 text-slate-400 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold text-white tracking-tight">
              NovaAI Store
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Layanan akun & tools AI terpercaya di Indonesia. Garansi penuh dan transaksi aman.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Navigasi</h4>
            <ul className="space-y-2">
              <li><a href="#products" className="hover:text-white transition-colors">Katalog Produk</a></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Lacak Pesanan</Link></li>
              <li><a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold">WhatsApp Admin</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Metode Pembayaran</h4>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {['BCA', 'Bank Mandiri', 'SeaBank', 'QRIS'].map((b) => (
                <span key={b} className="bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded text-[10px] font-semibold">
                  {b}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Transaksi Terenkripsi & Verifikasi Presisi
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} NovaAI Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white">Syarat & Ketentuan</Link>
            <Link href="/privacy" className="hover:text-white">Privasi</Link>
            <Link href="/refund" className="hover:text-white">Garansi & Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '6285157746677';
  const cleanWa = adminWa.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-white">
            NovaAI Store
          </Link>

          <nav className="flex items-center gap-4">
            <a href="#products" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Produk
            </a>
            <Link
              href="/track"
              className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lacak Order</span>
            </Link>
            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg transition-all"
            >
              WA Admin
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        <TrustBadges />

        {/* Catalog */}
        <section id="products" className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">
                Katalog Produk AI Available
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Pilih layanan AI yang Anda butuhkan dengan garansi penuh.
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
