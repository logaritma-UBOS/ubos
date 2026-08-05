-- ══════════════════════════════════════════════════════════════════════
-- MIGRATION: Investor Funding & Capital Accounting Tables
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard
-- ══════════════════════════════════════════════════════════════════════

-- 1. Tabel funding_items — status pendanaan tiap item investor
CREATE TABLE IF NOT EXISTS public.funding_items (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text        NOT NULL UNIQUE,
  price       integer     NOT NULL DEFAULT 0,
  is_funded   boolean     NOT NULL DEFAULT false,
  funded_by   text,
  funded_at   timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- Seed: isi semua item dari halaman investor
INSERT INTO public.funding_items (title, price) VALUES
  ('Hosting & Database (Vercel, Supabase)',  350000),
  ('WhatsApp Gateway API',                   100000),
  ('OpenAI / Gemini API Tokens',             200000),
  ('Pemasaran Awal (GTM / Meta Ads)',       1000000),
  ('Cadangan Kas Operasional',               300000)
ON CONFLICT (title) DO NOTHING;

-- 2. Tabel capital_transactions — riwayat kas investor (INFLOW/OUTFLOW)
CREATE TABLE IF NOT EXISTS public.capital_transactions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  tipe       text        NOT NULL CHECK (tipe IN ('INFLOW', 'OUTFLOW')),
  kategori   text        NOT NULL DEFAULT 'Modal Investor',
  nominal    numeric     NOT NULL DEFAULT 0,
  deskripsi  text,
  nama       text,
  email      text,
  created_at timestamptz DEFAULT now()
);

-- 3. Row-Level Security (buka read untuk semua, write hanya service_role)
ALTER TABLE public.funding_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funding_items_read_public"
  ON public.funding_items FOR SELECT USING (true);

CREATE POLICY "capital_transactions_read_public"
  ON public.capital_transactions FOR SELECT USING (true);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_capital_transactions_tipe
  ON public.capital_transactions (tipe);

CREATE INDEX IF NOT EXISTS idx_capital_transactions_created
  ON public.capital_transactions (created_at DESC);
