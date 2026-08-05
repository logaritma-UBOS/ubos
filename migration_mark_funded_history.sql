-- ══════════════════════════════════════════════════════════════════════
-- MIGRATION UPDATE: Tandai item yang sudah dibayar investor kemarin
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard
-- ══════════════════════════════════════════════════════════════════════

-- Pastikan tabel sudah ada (dari migration sebelumnya)
-- Jika belum, jalankan migration_investor_capital.sql dulu!

-- Update status funded untuk WhatsApp Gateway API (Rp 100.000)
UPDATE public.funding_items
SET
  is_funded  = true,
  funded_by  = 'Investor (Manual Entry)',
  funded_at  = now()
WHERE title = 'WhatsApp Gateway API'
  AND is_funded = false;

-- Update status funded untuk OpenAI / Gemini API Tokens (Rp 200.000)
UPDATE public.funding_items
SET
  is_funded  = true,
  funded_by  = 'Investor (Manual Entry)',
  funded_at  = now()
WHERE title = 'OpenAI / Gemini API Tokens'
  AND is_funded = false;

-- Insert ke capital_transactions sebagai catatan permanen
INSERT INTO public.capital_transactions (tipe, kategori, nominal, deskripsi, nama, created_at)
VALUES
  ('INFLOW', 'Modal Investor', 100000,  'Pendanaan Investor: WhatsApp Gateway API',    'Investor (Manual Entry)', now()),
  ('INFLOW', 'Modal Investor', 200000,  'Pendanaan Investor: OpenAI / Gemini API Tokens', 'Investor (Manual Entry)', now())
ON CONFLICT DO NOTHING;

-- Verifikasi hasil
SELECT title, is_funded, funded_by, funded_at FROM public.funding_items ORDER BY title;
SELECT tipe, kategori, nominal, deskripsi FROM public.capital_transactions ORDER BY created_at DESC;
