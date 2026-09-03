import type { Order } from './types';
import { formatRupiah } from './utils';
import { ADMIN_WA_NUMBER } from './config';

export function buildWhatsAppUrl(order: Order): string {
  const cleanWa = ADMIN_WA_NUMBER;

  const message = `Halo min, mau konfirmasi pembayaran pesanan nih! 🙏

Detail Pesanan:
• Order ID: *${order.order_id}*
• Produk: *${order.product_name}* (${order.variant_name})
• Total Transfer: *${formatRupiah(order.total_amount)}*
• Pembayaran Via: *${order.payment_method}*

Data Pemesan:
• Nama: ${order.customer_name}
• No. WA: ${order.customer_phone}

Bukti transfer sudah saya siapin. Mohon diproses ya min, terima kasih! 🔥`;

  return `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`;
}
