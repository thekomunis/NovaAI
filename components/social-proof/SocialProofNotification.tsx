'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { SocialProofEvent } from '@/lib/types';
import { relativeTime } from '@/lib/utils';

export function SocialProofNotification() {
  const [event, setEvent] = useState<SocialProofEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setEvent(null);
    }, 300);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel('social-proof')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_proof_events',
        },
        (payload) => {
          const newEvent = payload.new as SocialProofEvent;
          setEvent(newEvent);
          setVisible(true);
          setExiting(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible || exiting) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, exiting, dismiss]);

  if (!visible || !event) return null;

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 ${
        exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-surface-light border border-surface-border rounded-xl p-4 shadow-xl shadow-black/20">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-nexai-600/15 flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5 text-nexai-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-nexai-400 mb-0.5">Pesanan Baru</p>
            <p className="text-sm text-text-primary truncate">
              {event.masked_name} baru saja memesan{' '}
              <span className="font-medium">{event.product_name}</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">{relativeTime(event.created_at)}</p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 p-1 rounded-md hover:bg-surface-lighter transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
