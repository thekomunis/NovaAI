import type { Product } from './types';

export const products: Product[] = [
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    image: '/products/chatgpt.jpg',
    description: 'Akses ChatGPT Plus untuk produktivitas dan kreativitas tanpa batas.',
    variants: [
      {
        id: 'chatgpt-semi-1bln',
        name: 'Semi Private 1 Bulan',
        price: 50000,
        active: true,
      },
    ],
  },
  {
    name: 'Google AI Pro (Anti Gravity)',
    slug: 'antigravity',
    image: '/products/antigravity.jpg',
    description: 'Google AI Pro dengan performa tinggi untuk kebutuhan profesional.',
    variants: [
      {
        id: 'antigravity-12bln',
        name: '12 Bulan',
        price: 85000,
        active: true,
      },
      {
        id: 'antigravity-18bln',
        name: '18 Bulan',
        price: 110000,
        active: true,
      },
    ],
  },
  {
    name: 'Claude AI',
    slug: 'claude',
    image: '/products/claude.jpg',
    description: 'Claude AI untuk analisis mendalam dan pemrosesan bahasa alami terbaik.',
    variants: [
      {
        id: 'claude-20x-max-1bln',
        name: 'Claude 20x Max Private 1 Bulan - No Garansi',
        price: 200000,
        active: true,
      },
      {
        id: 'claude-pro-team-1bln',
        name: 'Claude AI Pro Team 1 Bulan - Full Garansi',
        price: 450000,
        active: true,
      },
      {
        id: 'claude-api-100-1bln',
        name: 'Claude API Key $100 Balance 1 Bulan - Full Garansi',
        price: 80000,
        active: true,
      },
      {
        id: 'claude-api-500-1bln',
        name: 'Claude API Key $500 Balance 1 Bulan - Full Garansi',
        price: 250000,
        active: true,
      },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getVariantById(product: Product, variantId: string) {
  return product.variants.find((v) => v.id === variantId);
}
