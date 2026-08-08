-- Menambahkan kolom tracking affiliate ke tabel merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS affiliate_clicks INT DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS affiliate_leads INT DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS affiliate_converted INT DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS commission_balance DECIMAL(12,2) DEFAULT 0;

-- Tabel Payout Requests
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS untuk payout_requests
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can read their own payout requests" ON payout_requests
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );

CREATE POLICY "Merchants can insert their own payout requests" ON payout_requests
  FOR INSERT WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );

-- Update leads table for Affiliate System
ALTER TABLE leads ADD COLUMN IF NOT EXISTS password_session TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referred_by TEXT;

