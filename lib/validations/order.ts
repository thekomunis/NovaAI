import { z } from 'zod/v4';

export const orderSchema = z.object({
  productSlug: z.string().min(1, 'Produk wajib dipilih'),
  variantId: z.string().min(1, 'Varian wajib dipilih'),
  customerName: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  customerPhone: z.string().min(8, 'Nomor WhatsApp tidak valid').max(20, 'Nomor WhatsApp terlalu panjang'),
  customerEmail: z.email('Email tidak valid'),
  paymentMethod: z.enum(['BCA', 'MANDIRI', 'SEABANK', 'QRIS']),
  idempotencyKey: z.string().min(1, 'Idempotency key wajib'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
