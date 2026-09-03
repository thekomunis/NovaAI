import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-text-primary mb-6">Syarat & Ketentuan</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-text-secondary">
          <p>Dengan menggunakan layanan NovaAI Store, Anda menyetujui syarat dan ketentuan berikut:</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">1. Layanan</h2>
          <p>NovaAI Store menyediakan layanan penjualan akun dan tools AI premium. Semua produk yang dijual merupakan akun resmi dengan spesifikasi sesuai deskripsi produk.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">2. Pembayaran</h2>
          <p>Pembayaran harus dilakukan sesuai dengan nominal yang tertera pada invoice termasuk kode unik. Pesanan yang tidak dibayar dalam waktu 1 jam akan otomatis kedaluwarsa.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">3. Pengiriman</h2>
          <p>Akun akan dikirimkan melalui WhatsApp setelah pembayaran dikonfirmasi oleh admin. Proses verifikasi pembayaran maksimal 1x24 jam pada hari kerja.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">4. Garansi</h2>
          <p>Garansi berlaku sesuai dengan deskripsi varian produk yang dipilih. Produk bertanda &quot;Full Garansi&quot; mendapat penggantian jika terjadi masalah dari pihak kami. Produk &quot;No Garansi&quot; tidak mendapat penggantian setelah akun diterima.</p>
          <h2 className="text-lg font-semibold text-text-primary mt-6">5. Perubahan Ketentuan</h2>
          <p>NovaAI Store berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan terlebih dahulu.</p>
        </div>
      </main>
    </div>
  );
}
