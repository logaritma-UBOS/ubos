-- 1. Tabel Profil Merchant / Pemilik Usaha
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_usaha VARCHAR(255) NOT NULL,
  kategori_usaha VARCHAR(100) DEFAULT 'F&B',
  target_profit_bulanan DECIMAL(12,2) DEFAULT 0,
  target_margin_standar DECIMAL(5,2) DEFAULT 40.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Master Produk
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  nama_produk VARCHAR(255) NOT NULL,
  hpp_dasar DECIMAL(12,2) NOT NULL DEFAULT 0,
  harga_jual DECIMAL(12,2) NOT NULL DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Resep (Gramatur / Bahan Baku)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  nama_bahan VARCHAR(255) NOT NULL,
  gramatur_dibutuhkan DECIMAL(10,2) NOT NULL,
  satuan VARCHAR(50) NOT NULL, -- contoh: gram, ml, pcs
  harga_per_satuan DECIMAL(10,2) NOT NULL
);

-- 4. Tabel Stok & Log Waste
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  stok_tersisa INT DEFAULT 0,
  waste_count INT DEFAULT 0,
  catatan TEXT, -- alasan waste (misal: basi, tumpah, freebie)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Transaksi POS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL, -- DINE_IN, GOFOOD, GRABFOOD, SHOPEEFOOD
  total_gross DECIMAL(12,2) NOT NULL,
  komisi_platform DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Detail Item Transaksi
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  qty INT NOT NULL,
  harga_satuan DECIMAL(12,2) NOT NULL,
  hpp_satuan DECIMAL(12,2) NOT NULL
);

-- 7. Tabel Auto-Split Wallet
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  kas_bahan_baku DECIMAL(12,2) DEFAULT 0,
  kas_operasional DECIMAL(12,2) DEFAULT 0,
  profit_bersih DECIMAL(12,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create policy for merchants
CREATE POLICY "Merchants can only access their own data" ON merchants
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for other tables based on merchant_id
CREATE POLICY "Users can only access their merchant's products" ON products
  FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can only access their merchant's recipes" ON recipes
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can only access their merchant's inventory" ON inventory_logs
  FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can only access their merchant's transactions" ON transactions
  FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can only access their merchant's transaction items" ON transaction_items
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can only access their merchant's wallets" ON wallets
  FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );
