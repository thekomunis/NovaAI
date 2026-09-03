import type { PaymentInfo } from './types';

export const SITE_NAME = 'NovaAI Store';
export const SITE_DESCRIPTION = 'Marketplace premium untuk akun dan tools AI terpercaya. ChatGPT, Claude AI, Google AI Pro dengan harga terbaik.';

// Enforce target admin WhatsApp number unconditionally
export const ADMIN_WA_NUMBER = '6285157746677';

export const paymentMethods: PaymentInfo[] = [
  {
    method: 'BCA',
    label: 'Bank BCA',
    account: '4141224284',
    name: 'STEVEN LIE',
    logo: '/payments/bca.svg',
  },
  {
    method: 'MANDIRI',
    label: 'Bank Mandiri',
    account: '1200013671826',
    name: 'STEVEN LIE',
    logo: '/payments/mandiri.svg',
  },
  {
    method: 'SEABANK',
    label: 'SeaBank',
    account: '901152172987',
    name: 'STEVEN LIE',
    logo: '/payments/seabank.svg',
  },
  {
    method: 'QRIS',
    label: 'QRIS (Semua E-Wallet & M-Banking)',
    image: '/qris.jpg',
    logo: '/payments/qris.svg',
  },
];

export function getPaymentInfo(method: string): PaymentInfo | undefined {
  return paymentMethods.find((p) => p.method === method);
}

export function getAdminWhatsApp(): string {
  return ADMIN_WA_NUMBER;
}

export const ORDER_EXPIRATION_HOURS = 1;
