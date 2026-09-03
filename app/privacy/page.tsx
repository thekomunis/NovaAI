import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-light border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
            Nova<span className="text-nexai-500">AI</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Kebijakan Privasi</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-text-secondary">
          <p>NovaAI Store menghormati privasi pelanggan. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Data yang Dikumpulkan</h2>
          <p>Kami mengumpulkan nama, nomor WhatsApp, dan email saat Anda melakukan pemesanan. Data ini digunakan untuk memproses pesanan dan berkomunikasi dengan Anda.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Penggunaan Data</h2>
          <p>Data pelanggan hanya digunakan untuk keperluan transaksi dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Keamanan</h2>
          <p>Kami menggunakan langkah-langkah keamanan yang wajar untuk melindungi informasi pelanggan dari akses yang tidak sah.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Kontak</h2>
          <p>Untuk pertanyaan terkait privasi, silakan hubungi kami melalui WhatsApp.</p>
        </div>
      </main>
    </div>
  );
}
