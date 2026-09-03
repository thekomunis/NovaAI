export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type FulfillmentStatus = 'UNFULFILLED' | 'FULFILLED' | 'PARTIALLY_FULFILLED';
export type PaymentMethod = 'BCA' | 'MANDIRI' | 'SEABANK' | 'QRIS';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface Product {
  name: string;
  slug: string;
  image: string;
  description: string;
  variants: ProductVariant[];
}

export interface Order {
  id: string;
  order_id: string;
  invoice_token: string;
  product_slug: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  price: number;
  unique_code: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  admin_note: string | null;
  paid_at: string | null;
  paid_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  label: string;
  account?: string;
  name?: string;
  image?: string;
  logo?: string;
}

export interface SocialProofEvent {
  masked_name: string;
  product_name: string;
  variant_name: string;
  created_at: string;
}

export interface OrderCreateRequest {
  productSlug: string;
  variantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface OrderCreateResponse {
  orderId: string;
  invoiceToken: string;
  totalAmount: number;
  uniqueCode: number;
  expiresAt: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
