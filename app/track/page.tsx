import type { Metadata } from 'next';
import { OrderTracker } from '@/components/order/OrderTracker';

export const metadata: Metadata = {
  title: 'Lacak Pesanan',
  description: 'Cek status pesanan NexAI Store Anda secara real-time.',
};

export default function TrackPage() {
  return <OrderTracker />;
}
