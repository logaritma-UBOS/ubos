-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: admin_goals
CREATE TABLE IF NOT EXISTS admin_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    target_mrr NUMERIC NOT NULL DEFAULT 50000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: system_logs
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'up', 'down', 'error'
    error_rate NUMERIC,
    latency INTEGER, -- in ms
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ai_prompts
CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_role TEXT NOT NULL, -- 'tech_lead', 'growth_marketer', 'ops_manager', 'finance_officer'
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ecosystem_products
CREATE TABLE IF NOT EXISTS ecosystem_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'DIGITAL_SERVICE', 'HARDWARE_AFFILIATE'
    price NUMERIC NOT NULL,
    affiliate_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: merchants (Ensure existing table has the required columns)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    nama_usaha TEXT NOT NULL,
    whatsapp TEXT,
    kategori_usaha TEXT NOT NULL,
    status TEXT DEFAULT 'Trial',
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_status TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns just in case the table already existed but was missing them
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Trial';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    source TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns just in case the table already existed but was missing them
ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New';

-- Table: affiliates
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    referral_code TEXT UNIQUE NOT NULL,
    total_earnings NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: affiliate_referrals
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES affiliates(id),
    referred_merchant_id UUID REFERENCES merchants(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'paid'
    commission_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: crm_broadcast_logs
CREATE TABLE IF NOT EXISTS crm_broadcast_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_name TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    message_template TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled', -- 'sent', 'scheduled', 'failed'
    sent_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: support_tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    subject TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    plan_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns just in case the table already existed but was missing them
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Table: payout_requests
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES affiliates(id),
    amount NUMERIC NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADD NEW COLUMNS FOR PAYOUT REQUESTS
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES merchants(id);
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS merchant_name TEXT;
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS proof_image_url TEXT;
ALTER TABLE payout_requests ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Table: financial_transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_category TEXT NOT NULL,
    source_name TEXT NOT NULL,
    gross_amount NUMERIC NOT NULL,
    affiliate_cut NUMERIC DEFAULT 0,
    net_profit NUMERIC NOT NULL,
    status TEXT DEFAULT 'SETTLED',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS for financial_transactions
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for financial_transactions" ON financial_transactions;
CREATE POLICY "Enable all for financial_transactions" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);

-- Setup RLS (Open for now as requested)
ALTER TABLE admin_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for admin_goals" ON admin_goals;
CREATE POLICY "Enable all for admin_goals" ON admin_goals FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for system_logs" ON system_logs;
CREATE POLICY "Enable all for system_logs" ON system_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for ai_prompts" ON ai_prompts;
CREATE POLICY "Enable all for ai_prompts" ON ai_prompts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ecosystem_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for ecosystem_products" ON ecosystem_products;
CREATE POLICY "Enable all for ecosystem_products" ON ecosystem_products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for merchants" ON merchants;
CREATE POLICY "Enable all for merchants" ON merchants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for leads" ON leads;
CREATE POLICY "Enable all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for affiliates" ON affiliates;
CREATE POLICY "Enable all for affiliates" ON affiliates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for affiliate_referrals" ON affiliate_referrals;
CREATE POLICY "Enable all for affiliate_referrals" ON affiliate_referrals FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE crm_broadcast_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for crm_broadcast_logs" ON crm_broadcast_logs;
CREATE POLICY "Enable all for crm_broadcast_logs" ON crm_broadcast_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for support_tickets" ON support_tickets;
CREATE POLICY "Enable all for support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for subscriptions" ON subscriptions;
CREATE POLICY "Enable all for subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for payout_requests" ON payout_requests;
CREATE POLICY "Enable all for payout_requests" ON payout_requests FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- SEED DATA
-- -----------------------------------------------------------------------------

-- Clear existing data if needed (Optional, usually we don't for seed, but doing it to ensure clean slate for testing)
TRUNCATE admin_goals, system_logs, ai_prompts, ecosystem_products, leads CASCADE;

-- Seed Admin Goals
INSERT INTO admin_goals (month, year, target_mrr) VALUES (8, 2026, 50000000);

-- Seed System Logs
INSERT INTO system_logs (service_name, status, error_rate, latency) VALUES
('UBOS Core API', 'up', 0.1, 45),
('WA Gateway', 'up', 0.0, 120),
('Payment Gateway', 'up', 0.5, 200);

-- Seed AI Prompts
INSERT INTO ai_prompts (agent_role, name, system_prompt) VALUES
('tech_lead', 'AI Tech Lead', 'You are an AI Tech Lead responsible for system uptime and error resolution.'),
('growth_marketer', 'AI Growth Marketer', 'You are an AI Growth Marketer responsible for optimizing funnels and affiliate sales.'),
('ops_manager', 'AI Ops Manager', 'You are an AI Ops Manager responsible for merchant satisfaction and CRM.'),
('finance_officer', 'AI Finance Officer', 'You are an AI Finance Officer responsible for MRR and cash flow tracking.');

-- Seed Ecosystem Products
INSERT INTO ecosystem_products (name, type, price, affiliate_url) VALUES
('Printer Thermal Bluetooth 58mm', 'HARDWARE_AFFILIATE', 150000, 'https://shopee.co.id/printer-58mm'),
('Barcode Scanner Wireless', 'HARDWARE_AFFILIATE', 250000, 'https://shopee.co.id/scanner-wireless'),
('Laci Kasir Cash Drawer', 'HARDWARE_AFFILIATE', 350000, 'https://shopee.co.id/cash-drawer'),
('Jasa Setup Meta Ads', 'DIGITAL_SERVICE', 500000, NULL),
('Jasa Foto Produk (10 Item)', 'DIGITAL_SERVICE', 300000, NULL);

-- Seed Merchants (Only if empty to avoid duplicating existing merchants)
INSERT INTO merchants (nama_usaha, whatsapp, kategori_usaha, status, trial_expires_at, subscription_status, last_active_at) 
SELECT 'Kedai Kopi Senja', '081234567890', 'F&B', 'Premium', NOW() + INTERVAL '30 days', 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE nama_usaha = 'Kedai Kopi Senja');

INSERT INTO merchants (nama_usaha, whatsapp, kategori_usaha, status, trial_expires_at, subscription_status, last_active_at) 
SELECT 'Warteg Bahari', '081234567891', 'F&B', 'Trial', NOW() + INTERVAL '5 days', 'inactive', NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE nama_usaha = 'Warteg Bahari');

INSERT INTO merchants (nama_usaha, whatsapp, kategori_usaha, status, trial_expires_at, subscription_status, last_active_at) 
SELECT 'Percetakan Maju Jaya', '081234567892', 'Percetakan', 'Premium', NOW() + INTERVAL '15 days', 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE nama_usaha = 'Percetakan Maju Jaya');

INSERT INTO merchants (nama_usaha, whatsapp, kategori_usaha, status, trial_expires_at, subscription_status, last_active_at) 
SELECT 'Laundry Bersih', '081234567893', 'Jasa', 'Trial', NOW() + INTERVAL '2 days', 'inactive', NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE nama_usaha = 'Laundry Bersih');

INSERT INTO merchants (nama_usaha, whatsapp, kategori_usaha, status, trial_expires_at, subscription_status, last_active_at) 
SELECT 'Toko Kelontong Makmur', '081234567894', 'Ritel', 'Premium', NOW() + INTERVAL '45 days', 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM merchants WHERE nama_usaha = 'Toko Kelontong Makmur');

-- Seed Leads
INSERT INTO leads (name, whatsapp, source, status) VALUES
('Budi', '08111222333', 'Facebook Ads', 'New'),
('Siti', '08111222334', 'Instagram', 'Contacted'),
('Agus', '08111222335', 'Google Search', 'Converted'),
('Rina', '08111222336', 'Referral', 'Lost');

-- Seed Subscriptions
INSERT INTO subscriptions (merchant_id, plan_name, amount, status) 
SELECT id, 'Pro Plan', 49000, 'active' FROM merchants WHERE status = 'Premium' 
AND NOT EXISTS (SELECT 1 FROM subscriptions WHERE subscriptions.merchant_id = merchants.id);

-- -----------------------------------------------------------------------------
-- UPDATES FOR UBOS MODULES (Added later for modal config)
-- -----------------------------------------------------------------------------
ALTER TABLE ubos_modules ADD COLUMN IF NOT EXISTS access_tier TEXT DEFAULT 'All Users';
ALTER TABLE ubos_modules ADD COLUMN IF NOT EXISTS maintenance_reason TEXT;

-- -----------------------------------------------------------------------------
-- UPDATES FOR AI COPILOT & SYSTEM HEALTH
-- -----------------------------------------------------------------------------
ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS model_name TEXT DEFAULT 'Gemini 1.5 Flash';
ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS temperature NUMERIC DEFAULT 0.7;

ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'System Ping';
ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS message TEXT DEFAULT 'Service check completed normally.';

-- -----------------------------------------------------------------------------
-- UPDATES FOR FONNTE WHATSAPP GATEWAY
-- -----------------------------------------------------------------------------
ALTER TABLE crm_broadcast_logs ADD COLUMN IF NOT EXISTS merchant_id UUID;
ALTER TABLE crm_broadcast_logs ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE crm_broadcast_logs ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE crm_broadcast_logs ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;


ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_category TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS traffic_source TEXT;


-- -----------------------------------------------------------------------------
-- VISITOR INTELLIGENCE LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    traffic_source TEXT,
    device_info TEXT,
    browser TEXT,
    ref_code TEXT,
    landing_path TEXT,
    status TEXT DEFAULT 'VISITOR_BOUNCE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- RLS FOR VISITOR LOGS
-- -----------------------------------------------------------------------------
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert to visitor_logs" ON visitor_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all select to visitor_logs" ON visitor_logs FOR SELECT TO anon, authenticated USING (true);


-- -----------------------------------------------------------------------------
-- PAGE TRAFFIC LOGS (NEW)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_traffic_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    traffic_source TEXT,
    device_info TEXT,
    browser TEXT,
    ref_code TEXT,
    landing_path TEXT,
    status TEXT DEFAULT 'VISITOR_BOUNCE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE page_traffic_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON page_traffic_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all select" ON page_traffic_logs FOR SELECT TO anon, authenticated USING (true);


-- -----------------------------------------------------------------------------
-- UPDATES FOR SUPPORT TICKETS (NEW STRUCTURE)
-- -----------------------------------------------------------------------------
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS merchant_name TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS issue_description TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ai_suggested_solution TEXT;


-- -----------------------------------------------------------------------------
-- NEW FOUNDER ROOM TABLES & SEED DATA
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS founder_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    initial_capital NUMERIC DEFAULT 0,
    royalty_percentage NUMERIC DEFAULT 0,
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capital_injections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixed_monthly_opex (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    billing_cycle TEXT DEFAULT 'MONTHLY',
    status TEXT DEFAULT 'UNPAID',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founder_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL,
    note_text TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial founder shares
INSERT INTO founder_shares (name, role, initial_capital, royalty_percentage)
VALUES 
('Baim', 'Inisiator / CEO', 2100000, 50),
('Tony Herman', 'Inisiator / Teknisi', 700000, 30),
('Reza', 'Penasehat', 0, 20)
ON CONFLICT DO NOTHING;


ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by TEXT;
