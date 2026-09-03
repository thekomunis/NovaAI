import type { PaymentInfo } from './types';

export const SITE_NAME = 'NexAI Store';
export const SITE_DESCRIPTION = 'Marketplace premium untuk akun dan tools AI terpercaya. ChatGPT, Claude AI, Google AI Pro dengan harga terbaik.';

export const paymentMethods: PaymentInfo[] = [
  {
    method: 'BCA',
    label: 'BCA',
    account: '4141224284',
    name: 'STEVEN LIE',
  },
  {
    method: 'MANDIRI',
    label: 'Mandiri',
    account: '1200013671826',
    name: 'STEVEN LIE',
  },
  {
    method: 'SEABANK',
    label: 'SeaBank',
    account: '901152172987',
    name: 'STEVEN LIE',
  },
  {
    method: 'QRIS',
    label: 'QRIS',
    image: '/qris.jpg',
  },
];

export function getPaymentInfo(method: string): PaymentInfo | undefined {
  return paymentMethods.find((p) => p.method === method);
}

export function getAdminWhatsApp(): string {
  return process.env.NEXT_PUBLIC_ADMIN_WA || '';
}

export const ORDER_EXPIRATION_HOURS = 1;
