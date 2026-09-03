# NexAI Store

AI Tools & Account Marketplace built with Next.js 16, TypeScript, Tailwind CSS 4, and Supabase.

## Features

### Storefront
- Premium dark-theme homepage with 3D product cards and animations
- Product catalog (ChatGPT, Google AI Pro, Claude AI) with multiple variants
- Full order flow: variant selection → customer form → payment method → invoice
- Real-time social proof notifications (Supabase Realtime)
- Live countdown timer on invoice page
- QRIS / Bank transfer payment info with copy-to-clipboard
- WhatsApp integration for payment confirmation
- Order tracking page (`/track`) — customers can check status with Order ID + phone

### Admin Dashboard (`/admin`)
- Password-protected with HTTP-only cookie sessions
- **Orders tab**: search, filter by status/product/payment, pagination
- **Order detail modal**: view full order info, change status (PENDING → PAID → PROCESSING → COMPLETED), admin notes, WhatsApp customer directly
- **Analytics tab**: revenue today/week/month/total, 7-day revenue chart, product breakdown, conversion rate
- Status transition guards (prevents invalid state changes)

### Backend / API
- Order creation with Zod validation, rate limiting, idempotency
- Unique payment code generation (collision-free)
- Atomic order ID counter via PostgreSQL sequence
- Auto-expire cron endpoint (`/api/admin/orders/expire`)
- Row Level Security (RLS) on all tables
- Supabase Realtime for live invoice updates and social proof

### Pages
- `/` — Homepage with hero, trust badges, product catalog
- `/track` — Customer order tracking
- `/invoice/[orderId]` — Invoice with payment info and countdown
- `/admin` — Admin dashboard (orders + analytics)
- `/admin/login` — Admin login
- `/terms` — Terms & conditions
- `/privacy` — Privacy policy
- `/refund` — Refund policy

## Setup

1. Clone the repository
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in credentials
4. Run `supabase/schema.sql` in Supabase SQL Editor
5. `npm run dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key
NEXT_PUBLIC_ADMIN_WA=628xxx      # Admin WhatsApp number
ADMIN_PASSWORD=                  # Admin dashboard password
ADMIN_SECRET_KEY=                # Secret for session signing
NEXT_PUBLIC_SITE_URL=            # Site URL (for production)
CRON_SECRET=                     # Optional: for Vercel Cron auth
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain
5. Deploy — Vercel Cron will auto-expire orders every 15 minutes

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Realtime)
- **Validation**: Zod 4
- **Icons**: Lucide React
