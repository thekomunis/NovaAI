'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

export function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Password salah');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Koneksi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-light border border-surface-border rounded-xl p-6 space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
          Password Admin
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Masukkan password"
            className="w-full bg-surface border border-surface-border rounded-xl pl-10 pr-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-nexai-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/10 p-3 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-nexai-600 hover:bg-nexai-500 disabled:bg-surface-lighter disabled:text-text-muted text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Masuk...
          </>
        ) : (
          'Masuk'
        )}
      </button>
    </form>
  );
}
