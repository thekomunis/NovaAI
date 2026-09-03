'use client';

import dynamic from 'next/dynamic';

const SocialProofNotification = dynamic(
  () => import('@/components/social-proof/SocialProofNotification').then(m => ({ default: m.SocialProofNotification })),
  { ssr: false }
);

export function SocialProofWrapper() {
  return <SocialProofNotification />;
}
