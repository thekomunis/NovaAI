import type { PaymentMethod } from './types';

export const PAYMENT_METHODS: PaymentMethod[] = ['BCA', 'MANDIRI', 'SEABANK', 'QRIS'];

export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return PAYMENT_METHODS.includes(method as PaymentMethod);
}
