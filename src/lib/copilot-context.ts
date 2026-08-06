import { supabase } from '@/lib/supabase/client';

export async function getMerchantRealtimeContext(merchantId: string) {
  try {
    // 1. Fetch Merchant Profile & Target Profit
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (merchantError || !merchant) {
      throw new Error('Merchant not found');
    }

    const merchantName = merchant.nama_usaha || merchant.owner_name || 'Toko';
    const category = merchant.kategori_usaha || 'F&B';
    const targetMonthlyProfit = 10000000; // Hardcoded default, in reality from DB if exists
    
    // Attempt to get target profit from localStorage if this is client-side? No, this is server-side.
    // Let's check if there's a target profit column in merchants table. We'll default to 10000000.
    const targetDailyProfit = Math.round(targetMonthlyProfit / 30);
    // Asumsi margin 40% (0.4) untuk tarik mundur target omzet
    const targetDailyRevenue = Math.round(targetDailyProfit / 0.4);

    // 2. Fetch Today's Sales & Transactions from POS
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todayTrx } = await supabase
      .from('transactions')
      .select('total_net, transaction_items(product_id, quantity)')
      .eq('merchant_id', merchantId)
      .gte('created_at', `${todayStr}T00:00:00Z`);

    let currentRevenueToday = 0;
    const itemSales: Record<string, number> = {};

    if (todayTrx && todayTrx.length > 0) {
      currentRevenueToday = todayTrx.reduce((sum, t) => sum + (t.total_net || 0), 0);
      
      // Calculate top selling and slow moving items
      todayTrx.forEach((trx: any) => {
        if (trx.transaction_items) {
          trx.transaction_items.forEach((item: any) => {
            itemSales[item.product_id] = (itemSales[item.product_id] || 0) + item.quantity;
          });
        }
      });
    }

    const achievementPercentage = Math.round((currentRevenueToday / targetDailyRevenue) * 100);

    // 3. Fetch Stock & HPP Alert Items
    const { data: products } = await supabase
      .from('products')
      .select('id, nama_produk, stok, hpp_dasar, harga_jual, is_available')
      .eq('merchant_id', merchantId);

    const topSellingItems: string[] = [];
    const slowMovingItems: string[] = [];
    const hppAlerts: string[] = [];
    const stockAlerts: string[] = [];

    if (products && products.length > 0) {
      // Find top/slow moving items by joining with itemSales
      const salesWithNames = Object.keys(itemSales).map(id => {
        const p = products.find(prod => prod.id === id);
        return { name: p?.nama_produk || 'Unknown', qty: itemSales[id] };
      }).sort((a, b) => b.qty - a.qty);

      if (salesWithNames.length > 0) {
        topSellingItems.push(...salesWithNames.slice(0, 3).map(s => `${s.name} (${s.qty} porsi)`));
        if (salesWithNames.length > 3) {
          slowMovingItems.push(...salesWithNames.slice(-3).map(s => `${s.name} (${s.qty} porsi)`));
        }
      }

      // Check HPP Alerts (margin < 35%)
      products.forEach(p => {
        if (p.hpp_dasar > 0 && p.harga_jual > 0) {
          const margin = (p.harga_jual - p.hpp_dasar) / p.harga_jual;
          if (margin < 0.35) {
            hppAlerts.push(`${p.nama_produk} (Margin hanya ${Math.round(margin * 100)}%)`);
          }
        }
        // If stok <= 5 (assuming we have stock tracking)
        if (p.stok !== null && p.stok <= 5) {
          stockAlerts.push(`${p.nama_produk} (Sisa ${p.stok})`);
        } else if (!p.is_available) {
          stockAlerts.push(`${p.nama_produk} (Habis)`);
        }
      });
    }

    return {
      merchantName,
      category,
      targetDailyProfit,
      targetDailyRevenue,
      currentRevenueToday,
      achievementPercentage,
      topSellingItems,
      slowMovingItems,
      hppAlerts,
      stockAlerts
    };
  } catch (error: any) {
    console.error('Error fetching context:', error);
    return null;
  }
}
