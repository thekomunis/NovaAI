import type { Order } from './types';
import { formatRupiah } from './utils';

export function buildWhatsAppUrl(order: Order): string {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WA || '';
  if (!adminWa) return '#';

  const message = `Halo Admin NovaAI Store,

Saya sudah melakukan pemesanan:

🆔 Order ID: ${order.order_id}
📦 Produk: ${order.product_name}
📋 Varian: ${order.variant_name}
💰 Harga: ${formatRupiah(order.price)}
🔢 Kode Unik: ${order.unique_code}
💳 Total Transfer: ${formatRupiah(order.total_amount)}
🏦 Metode Pembayaran: ${order.payment_method}

👤 Nama: ${order.customer_name}
📱 WhatsApp: ${order.customer_phone}
📧 Email: ${order.customer_email}

Mohon konfirmasi pembayaran saya. Terima kasih!`;

  return `https://wa.me/${adminWa}?text=${encodeURIComponent(message)}`;
}
