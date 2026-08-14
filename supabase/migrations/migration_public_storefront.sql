
-- Allow public (anonymous) read access to merchants so storefronts can be viewed
CREATE POLICY Enable public read access for merchants ON merchants
  FOR SELECT USING (true);

-- Allow public (anonymous) read access to products so storefront products can be viewed
CREATE POLICY Enable public read access for products ON products
  FOR SELECT USING (true);

-- Allow public (anonymous) insert access to transactions so customers can checkout
CREATE POLICY Enable public insert access for transactions ON transactions
  FOR INSERT WITH CHECK (true);

-- Allow public (anonymous) insert access to transaction_items so customers can checkout
CREATE POLICY Enable public insert access for transaction_items ON transaction_items
  FOR INSERT WITH CHECK (true);
