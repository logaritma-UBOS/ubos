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

      // 1. Get Targets from LocalStorage (or DB later)
      const savedProfit = localStorage.getItem('targetProfit');
      const savedBudget = localStorage.getItem('budgetBelanja');
      const targetProfit = savedProfit ? parseInt(savedProfit.replace(/\\D/g, ''), 10) : 5000000;
      const budget = savedBudget ? parseInt(savedBudget.replace(/\\D/g, ''), 10) : 300000;

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
          dailyOmzet += (tx.total_amount || 0);
          dailyProfit += (tx.net_profit || 0);
        });
      }

      // 3. Fetch Low Stock Items
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchant.id);

      const lowStock: any[] = [];
      if (products) {
        products.forEach(p => {
          // Asumsi stok kritis jika <= 5
          if (p.stok !== null && p.stok <= 5) {
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
    
    // Set up realtime listener for transactions to keep AI updated live
    // Use a unique channel name per hook instance to prevent collision when multiple components use this hook
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
