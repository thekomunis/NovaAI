import type { Metadata } from 'next';
import { InvoiceClient } from '@/components/invoice/InvoiceClient';

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
};

interface InvoicePageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvoicePage({ params, searchParams }: InvoicePageProps) {
  const { orderId } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === 'string' ? sp.token : '';

  return <InvoiceClient orderId={orderId} token={token} />;
}
