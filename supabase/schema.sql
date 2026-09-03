-- ============================================
-- NovaAI Store - Database Schema
-- ============================================

-- Order counter sequence (atomic)
CREATE SEQUENCE IF NOT EXISTS order_counter_seq START 1 INCREMENT 1;

-- Function to get next order counter (atomic)
CREATE OR REPLACE FUNCTION get_next_order_counter()
RETURNS INTEGER AS $$
BEGIN
  RETURN nextval('order_counter_seq');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  invoice_token TEXT NOT NULL UNIQUE,

  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,

  variant_id TEXT NOT NULL,
  variant_name TEXT NOT NULL,

  price INTEGER NOT NULL CHECK (price > 0),
  unique_code INTEGER NOT NULL CHECK (unique_code BETWEEN 1 AND 999),
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),

  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  payment_method TEXT NOT NULL CHECK (payment_method IN ('BCA', 'MANDIRI', 'SEABANK', 'QRIS')),

  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  fulfillment_status TEXT NOT NULL DEFAULT 'UNFULFILLED' CHECK (fulfillment_status IN ('UNFULFILLED', 'FULFILLED', 'PARTIALLY_FULFILLED')),

  admin_note TEXT,

  paid_at TIMESTAMPTZ,
  paid_by TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  idempotency_key TEXT
);

-- Create unique index on idempotency_key (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders (order_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Social Proof - Public notification table
-- Only contains masked/safe data for realtime
-- ============================================
CREATE TABLE IF NOT EXISTS social_proof_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  masked_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-cleanup old social proof events (keep last 50)
CREATE OR REPLACE FUNCTION cleanup_social_proof()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM social_proof_events
  WHERE id NOT IN (
    SELECT id FROM social_proof_events ORDER BY created_at DESC LIMIT 50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_old_social_proof
AFTER INSERT ON social_proof_events
FOR EACH ROW
EXECUTE FUNCTION cleanup_social_proof();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_events ENABLE ROW LEVEL SECURITY;

-- Orders: No public read access. All access through service role.
-- Invoice access is controlled server-side with order_id + invoice_token

-- Social proof events: Public read-only (safe/masked data only)
CREATE POLICY "Public can read social proof events"
ON social_proof_events
FOR SELECT
TO anon
USING (true);

-- Social proof events: Only service role can insert
CREATE POLICY "Service role can insert social proof events"
ON social_proof_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Orders: Only service role can do anything
CREATE POLICY "Service role full access to orders"
ON orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- Realtime
-- ============================================
-- Enable realtime for social_proof_events (public safe data)
ALTER PUBLICATION supabase_realtime ADD TABLE social_proof_events;

-- Enable realtime for orders (RLS will protect data, only service role sees)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
