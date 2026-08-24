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
  totalTerpakai: number;
  
  // Computed
  remainingMorningBudget: number;
  isOverBudget: boolean;
  lowStockItems: any[];
  peakHoursTrend: any;
  hasProducts: boolean;
  products: any[];
  
  // Loading
  isLoading: boolean;
}

export function useAILogaritmaEngine(merchantId?: string) {
  const [state, setState] = useState<AIState>({
    targetProfitMonthly: 5000000,
    budgetBelanjaDaily: 300000,
    dailyOmzet: 0,
    dailyProfit: 0,
    totalTransactions: 0,
    totalTerpakai: 0,
    remainingMorningBudget: 300000,
    isOverBudget: false,
    lowStockItems: [],
    peakHoursTrend: null,
    hasProducts: true,
    products: [],
    isLoading: true,
  });

  const refreshData = async () => {
    try {
      let activeMerchantId = merchantId;
      
      if (!activeMerchantId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!merchant) return;
        activeMerchantId = merchant.id;
      }

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

      // Parallelize queries
      const [transactionsRes, productsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('merchant_id', activeMerchantId)
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString()),
        supabase
          .from('products')
          .select('*')
          .eq('merchant_id', activeMerchantId)
      ]);

      const transactions = transactionsRes.data;
      const products = productsRes.data;

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

      const lowStock: any[] = [];
      let totalTerpakai = 0;
      if (products) {
        products.forEach(p => {
          const stokVal = Number(p.stok ?? p.qty ?? p.stock ?? p.quantity ?? 1);
          const isHabis = p.is_available === false || p.status === 'habis' || stokVal <= 0;
          
          if (isHabis) {
            lowStock.push(p);
          }
          
          // Calculate totalTerpakai
          const modal = Number(
            p.hpp_dasar || p.hpp || p.modal || p.harga_modal || 
            p.harga_beli || p.modal_satuan || p.capital || 0
          );
          const subtotal = p.total_belanja ? Number(p.total_belanja) : (modal * stokVal);
          totalTerpakai += subtotal;
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
        totalTerpakai,
        remainingMorningBudget: remainingBudget,
        isOverBudget: remainingBudget < 0,
        lowStockItems: lowStock,
        peakHoursTrend: null,
        hasProducts: !!(products && products.length > 0),
        products: products || [],
        isLoading: false
      });

    } catch (error) {
      console.error('AI Engine Error:', error);
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  useEffect(() => {
    refreshData();
    
    // Only subscribe if we have a merchant ID, else we wait for it
    if (!merchantId) return;

    const channelName = `ai-engine-${merchantId}-${Math.random().toString(36).substring(7)}`;
    const filter = `merchant_id=eq.${merchantId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchantId]);

  return { aiState: state, refreshData };
}