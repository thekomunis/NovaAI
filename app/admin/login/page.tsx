import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Nex<span className="text-nexai-500">AI</span> Admin
          </h1>
          <p className="text-sm text-text-secondary">Masuk ke dashboard admin</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
