import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kebijakan Refund',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-light border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
            Nex<span className="text-nexai-500">AI</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Kebijakan Refund</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-text-secondary">
          <p>NexAI Store berkomitmen untuk memberikan layanan terbaik. Berikut adalah kebijakan refund kami:</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Refund Disetujui</h2>
          <p>Refund akan diproses jika akun yang dikirimkan tidak sesuai dengan deskripsi produk, akun tidak dapat diakses sejak awal pengiriman, atau terjadi kesalahan dari pihak kami.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Refund Tidak Berlaku</h2>
          <p>Refund tidak berlaku untuk produk bertanda &quot;No Garansi&quot;, jika pelanggan melanggar ketentuan penggunaan akun, atau jika akun bermasalah akibat tindakan pelanggan.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">Proses Refund</h2>
          <p>Ajukan refund melalui WhatsApp dengan menyertakan Order ID. Refund akan diproses dalam 1-3 hari kerja setelah disetujui.</p>
        </div>
      </main>
    </div>
  );
}
