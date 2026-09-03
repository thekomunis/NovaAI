export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) return part[0] + '***';
      return part.slice(0, 2) + '***' + (part.length > 4 ? part.slice(-1) : '');
    })
    .join(' ');
}

export function maskPhone(phone: string): string {
  if (phone.length < 8) return '****';
  return phone.slice(0, 5) + '****' + phone.slice(-4);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.slice(0, 2) + '***';
  return maskedLocal + '@' + domain;
}

export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-().]+/g, '');
  if (cleaned.startsWith('+62')) {
    cleaned = '62' + cleaned.slice(3);
  } else if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8') && cleaned.length >= 9) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^628[0-9]{8,12}$/.test(normalized);
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 10) return 'Beberapa detik yang lalu';
  if (diff < 60) return `${diff} detik yang lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
  return `${Math.floor(diff / 86400)} hari yang lalu`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
