import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  buildLogaritmaState,
  parseTargetValue,
  type RawTransaction,
  type RawProduct,
} from '@/core/logaritma';

// ─── AIState — API public tetap identik agar semua halaman existing tidak perlu diubah ─
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
      let activeMerchant = null;
      
      if (!activeMerchantId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase
          .from('merchants')
          .select('id, kategori_usaha, created_at')
          .eq('user_id', user.id)
          .single();

        if (!merchant) return;
        activeMerchantId = merchant.id;
        activeMerchant = merchant;
      } else {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id, kategori_usaha, created_at')
          .eq('id', activeMerchantId)
          .single();
        activeMerchant = merchant;
      }

      // 1. Get Targets and Action from LocalStorage (browser-only — stays in hook)
      const targetProfit = parseTargetValue(localStorage.getItem('targetProfit'), 5000000);
      const budget = parseTargetValue(localStorage.getItem('budgetBelanja'), 300000);
      let lastActionRecord = undefined;
      try {
        const rawAction = localStorage.getItem('lastActionRecord');
        if (rawAction) lastActionRecord = JSON.parse(rawAction);
      } catch (e) {
        // ignore JSON parse error
      }

      // 2. Fetch raw data from Supabase (IO — stays in hook)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

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

      const transactions: RawTransaction[] = transactionsRes.data || [];
      const products: RawProduct[] = productsRes.data || [];

      const umurAkunHari = activeMerchant?.created_at ? Math.max(1, Math.floor((new Date().getTime() - new Date(activeMerchant.created_at).getTime()) / (1000 * 3600 * 24))) : 30;
      const coreState = buildLogaritmaState(
        { targetProfitMonthly: targetProfit, budgetBelanjaDaily: budget },
        transactions,
        products,
        { kategoriUsaha: activeMerchant?.kategori_usaha || 'Retail', umurAkunHari },
        lastActionRecord
      );

      // 4. Map core state back to AIState (same shape as before — no UI changes needed)
      setState({
        targetProfitMonthly: coreState.config.targetProfitMonthly,
        budgetBelanjaDaily: coreState.config.budgetBelanjaDaily,
        dailyOmzet: coreState.daily.dailyOmzet,
        dailyProfit: coreState.daily.dailyProfit,
        totalTransactions: coreState.daily.totalTransactions,
        totalTerpakai: coreState.stock.totalTerpakai,
        remainingMorningBudget: coreState.remainingMorningBudget,
        isOverBudget: coreState.isOverBudget,
        lowStockItems: coreState.stock.lowStockItems,
        peakHoursTrend: null,
        hasProducts: coreState.hasProducts,
        products,
        isLoading: false,
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