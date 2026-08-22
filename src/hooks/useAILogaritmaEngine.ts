import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface AIState {
  // Config
  targetProfitMonthly: number;
  budgetBelanjaDaily: number;
  
  // Real-time Metrics
  dailyOmzet: number;
  dailyProfit: number;
  totalTransactions: number;
  
  // Computed
  remainingMorningBudget: number;
  isOverBudget: boolean;
  lowStockItems: any[];
  peakHoursTrend: any;
  
  // Loading
  isLoading: boolean;
}

export function useAILogaritmaEngine() {
  const [state, setState] = useState<AIState>({
    targetProfitMonthly: 5000000,
    budgetBelanjaDaily: 300000,
    dailyOmzet: 0,
    dailyProfit: 0,
    totalTransactions: 0,
    remainingMorningBudget: 300000,
    isOverBudget: false,
    lowStockItems: [],
    peakHoursTrend: null,
    isLoading: true,
  });

  const refreshData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!merchant) return;

      // 1. Get Targets from LocalStorage
      const savedProfit = localStorage.getItem('targetProfit');
      const savedBudget = localStorage.getItem('budgetBelanja');
      const targetProfit = savedProfit ? parseInt(savedProfit.replace(/\D/g, ''), 10) : 5000000;
      const budget = savedBudget ? parseInt(savedBudget.replace(/\D/g, ''), 10) : 300000;

      // 2. Calculate Daily Metrics from POS transactions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      let dailyOmzet = 0;
      let dailyProfit = 0;
      let totalTx = 0;

      if (transactions) {
        totalTx = transactions.length;
        transactions.forEach(tx => {
          const omzetNominal = Number(
            tx.total_gross || tx.total || tx.total_harga || tx.grand_total || 
            tx.subtotal || tx.jumlah || tx.price || tx.nominal || tx.harga || 0
          );
          
          const netNominal = Number(
            tx.total_net || tx.total || tx.total_harga || tx.grand_total || 
            tx.subtotal || tx.jumlah || omzetNominal
          );

          dailyOmzet += omzetNominal;
          const profit = netNominal * 0.4;
          dailyProfit += profit;
        });
      }

      // 3. Fetch Low Stock / Stok Habis Items (Sinkron dengan Inventori)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchant.id);

      const lowStock: any[] = [];
      if (products) {
        products.forEach(p => {
          const stokVal = Number(p.stok ?? p.qty ?? p.stock ?? p.quantity ?? 1);
          // Menandai item sebagai kritis jika dinonaktifkan (is_available false) atau stok habis
          const isHabis = p.is_available === false || p.status === 'habis' || stokVal <= 0;
          
          if (isHabis) {
            lowStock.push(p);
          }
        });
      }

      // 4. Hitung Sisa Budget
      const estimatedExpenses = dailyOmzet - dailyProfit;
      const remainingBudget = budget - estimatedExpenses;

      setState({
        targetProfitMonthly: targetProfit,
        budgetBelanjaDaily: budget,
        dailyOmzet,
        dailyProfit,
        totalTransactions: totalTx,
        remainingMorningBudget: remainingBudget,
        isOverBudget: remainingBudget < 0,
        lowStockItems: lowStock,
        peakHoursTrend: null,
        isLoading: false
      });

    } catch (error) {
      console.error('AI Engine Error:', error);
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  useEffect(() => {
    refreshData();
    
    const channelName = `ai-engine-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { aiState: state, refreshData };
}