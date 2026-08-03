'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PackagePlus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DummyDataInjector({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);

  const injectData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
      if (!merchant) return;

      // 1. Insert Products
      const products = [
        { merchant_id: merchant.id, nama_produk: 'Es Kopi Susu Aren', hpp_dasar: 8500, harga_jual: 18000, photo_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80' },
        { merchant_id: merchant.id, nama_produk: 'Nasi Goreng Spesial', hpp_dasar: 15000, harga_jual: 35000, photo_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80' },
        { merchant_id: merchant.id, nama_produk: 'Croffle Caramel', hpp_dasar: 9000, harga_jual: 22000, photo_url: 'https://images.unsplash.com/photo-1629087520038-f864f1d7d024?w=500&q=80' },
      ];

      const { data: insertedProducts } = await supabase.from('products').insert(products).select();
      
      if (insertedProducts && insertedProducts.length === 3) {
        // 2. Insert Recipes
        const recipes = [
          // Kopi Susu
          { product_id: insertedProducts[0].id, nama_bahan: 'Espresso', gramatur_dibutuhkan: 30, satuan: 'ml', harga_per_satuan: 100 }, 
          { product_id: insertedProducts[0].id, nama_bahan: 'Susu Fresh Milk', gramatur_dibutuhkan: 150, satuan: 'ml', harga_per_satuan: 20 }, 
          { product_id: insertedProducts[0].id, nama_bahan: 'Gula Aren', gramatur_dibutuhkan: 25, satuan: 'gram', harga_per_satuan: 100 }, 
          // Nasi Goreng
          { product_id: insertedProducts[1].id, nama_bahan: 'Nasi Putih', gramatur_dibutuhkan: 200, satuan: 'gram', harga_per_satuan: 20 }, 
          { product_id: insertedProducts[1].id, nama_bahan: 'Telur Ayam', gramatur_dibutuhkan: 2, satuan: 'pcs', harga_per_satuan: 2500 }, 
          { product_id: insertedProducts[1].id, nama_bahan: 'Bumbu Rahasia', gramatur_dibutuhkan: 50, satuan: 'gram', harga_per_satuan: 120 }, 
          // Croffle
          { product_id: insertedProducts[2].id, nama_bahan: 'Dough Croissant', gramatur_dibutuhkan: 2, satuan: 'pcs', harga_per_satuan: 3500 }, 
          { product_id: insertedProducts[2].id, nama_bahan: 'Saus Caramel', gramatur_dibutuhkan: 20, satuan: 'gram', harga_per_satuan: 100 }, 
        ];
        
        await supabase.from('recipes').insert(recipes);

        // 3. Inject Transaction to trigger auto-split wallet (simulation)
        // Dummy channel GOFOOD, Gross 35000, net 35000 * 0.65 = 22750
        const { data: trxData } = await supabase.from('transactions').insert([{
          merchant_id: merchant.id,
          channel: 'GOFOOD',
          total_gross: 35000,
          komisi_platform: 12250,
          total_net: 22750
        }]).select().single();

        if (trxData) {
           await supabase.from('transaction_items').insert([{
             transaction_id: trxData.id,
             product_id: insertedProducts[1].id,
             qty: 1,
             harga_satuan: 35000,
             hpp_satuan: 15000
           }]);
           
           // Update Wallet Simulation
           // Profit = net (22750) - hpp (15000) = 7750
           const { data: wallet } = await supabase.from('wallets').select('*').eq('merchant_id', merchant.id).single();
           if (wallet) {
              await supabase.from('wallets').update({
                kas_bahan_baku: wallet.kas_bahan_baku + 15000, // HPP goes to raw material
                profit_bersih: wallet.profit_bersih + 7750     // Margin goes to profit
              }).eq('id', wallet.id);
           }
        }
      }

      toast.success('Data dummy berhasil disuntikkan!');
      onComplete();
      
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyuntikkan data dummy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={injectData} 
      disabled={loading}
      className="w-full mt-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-violet-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 border-2 border-white/20"
    >
      {loading ? (
        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <><Sparkles size={18} className="animate-pulse" /> Inject Dummy Data (Menu & Transaksi)</>
      )}
    </button>
  );
}
