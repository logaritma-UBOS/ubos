/**
 * UBOS Core - Logaritma Engine
 *
 * PURE BUSINESS LOGIC - NO REACT, NO DOM, NO NEXT.JS, NO BROWSER APIS
 * Safe to import from: Web (Next.js), Android (React Native/Expo), PC (Tauri)
 *
 * This file contains only deterministic, pure functions that:
 *   - Take plain data as input
 *   - Return computed values
 *   - Have zero side effects
 *   - Do NOT call supabase, localStorage, router, or React hooks
 *
 * The React hook (useAILogaritmaEngine.ts) is the adapter layer that:
 *   - Fetches data from Supabase
 *   - Reads localStorage
 *   - Calls these pure functions
 *   - Manages React state
 */

// --- Types ---

export interface RawTransaction {
  total_gross?: number | string;
  total?: number | string;
  total_harga?: number | string;
  grand_total?: number | string;
  subtotal?: number | string;
  jumlah?: number | string;
  price?: number | string;
  nominal?: number | string;
  harga?: number | string;
  total_net?: number | string;
  created_at?: string;
}

export interface RawProduct {
  stok?: number | string;
  qty?: number | string;
  stock?: number | string;
  quantity?: number | string;
  is_available?: boolean;
  status?: string;
  hpp_dasar?: number | string;
  hpp?: number | string;
  modal?: number | string;
  harga_modal?: number | string;
  harga_beli?: number | string;
  modal_satuan?: number | string;
  capital?: number | string;
  total_belanja?: number | string;
  [key: string]: any;
}

export interface LogaritmaConfig {
  targetProfitMonthly: number;
  budgetBelanjaDaily: number;
}

export interface DailyMetrics {
  dailyOmzet: number;
  dailyProfit: number;
  totalTransactions: number;
}

export interface StockMetrics {
  totalTerpakai: number;
  lowStockItems: RawProduct[];
}

export interface LogaritmaState {
  config: LogaritmaConfig;
  daily: DailyMetrics;
  stock: StockMetrics;
  remainingMorningBudget: number;
  isOverBudget: boolean;
  hasProducts: boolean;
}

export type LogaritmaActionType =
  | 'KEJAR_JUALAN'
  | 'AMANKAN_STOK'
  | 'CEK_KEUANGAN'
  | 'AKTIFKAN_PELANGGAN'
  | 'LIHAT_PERFORMA';

export interface LogaritmaAction {
  type: LogaritmaActionType;
  label: string;
  href: string;
  color: 'red' | 'orange' | 'blue' | 'purple' | 'emerald';
}

// --- Pure Calculation Functions ---

export function extractOmzetFromTransaction(tx: RawTransaction): number {
  return Number(
    tx.total_gross || tx.total || tx.total_harga || tx.grand_total ||
    tx.subtotal || tx.jumlah || tx.price || tx.nominal || tx.harga || 0
  );
}

export function extractNetFromTransaction(tx: RawTransaction): number {
  const omzet = extractOmzetFromTransaction(tx);
  return Number(
    tx.total_net || tx.total || tx.total_harga || tx.grand_total ||
    tx.subtotal || tx.jumlah || omzet
  );
}

export function calculateDailyMetrics(transactions: RawTransaction[]): DailyMetrics {
  let dailyOmzet = 0;
  let dailyProfit = 0;
  const totalTransactions = transactions.length;

  for (const tx of transactions) {
    const omzetNominal = extractOmzetFromTransaction(tx);
    const netNominal = extractNetFromTransaction(tx);
    dailyOmzet += omzetNominal;
    dailyProfit += netNominal * 0.4;
  }

  return { dailyOmzet, dailyProfit, totalTransactions };
}

export function calculateStockMetrics(products: RawProduct[]): StockMetrics {
  const lowStockItems: RawProduct[] = [];
  let totalTerpakai = 0;

  for (const p of products) {
    const stokVal = Number(p.stok ?? p.qty ?? p.stock ?? p.quantity ?? 1);
    const isHabis = p.is_available === false || p.status === 'habis' || stokVal <= 0;

    if (isHabis) {
      lowStockItems.push(p);
    }

    const modal = Number(
      p.hpp_dasar || p.hpp || p.modal || p.harga_modal ||
      p.harga_beli || p.modal_satuan || p.capital || 0
    );
    const subtotal = p.total_belanja ? Number(p.total_belanja) : (modal * stokVal);
    totalTerpakai += subtotal;
  }

  return { totalTerpakai, lowStockItems };
}

export function calculateRemainingBudget(
  budgetBelanjaDaily: number,
  dailyOmzet: number,
  dailyProfit: number
): number {
  const estimatedExpenses = dailyOmzet - dailyProfit;
  return budgetBelanjaDaily - estimatedExpenses;
}

export function buildLogaritmaState(
  config: LogaritmaConfig,
  transactions: RawTransaction[],
  products: RawProduct[]
): LogaritmaState {
  const daily = calculateDailyMetrics(transactions);
  const stock = calculateStockMetrics(products);
  const remainingMorningBudget = calculateRemainingBudget(
    config.budgetBelanjaDaily,
    daily.dailyOmzet,
    daily.dailyProfit
  );

  return {
    config,
    daily,
    stock,
    remainingMorningBudget,
    isOverBudget: remainingMorningBudget < 0,
    hasProducts: products.length > 0,
  };
}

/**
 * Logaritma Decision Engine:
 * DATA -> ANALISIS -> GAP -> PRIORITAS -> TINDAKAN
 *
 * Menentukan action paling relevan berdasarkan kondisi bisnis saat ini.
 */
export function determineLogaritmaAction(
  state: LogaritmaState,
  basePath: string
): LogaritmaAction {
  const { daily, stock, isOverBudget, config } = state;
  const dailyTarget = config.targetProfitMonthly / 30;

  // Prioritas 1: Anggaran meledak
  if (isOverBudget) {
    return { type: 'CEK_KEUANGAN', label: 'Cek Keuangan', href: `${basePath}/finance`, color: 'red' };
  }

  // Prioritas 2: Stok habis
  if (stock.lowStockItems.length > 0) {
    return { type: 'AMANKAN_STOK', label: 'Amankan Stok', href: `${basePath}/inventory`, color: 'orange' };
  }

  // Prioritas 3: Profit jauh di bawah target harian
  if (daily.dailyProfit < dailyTarget * 0.5) {
    return { type: 'KEJAR_JUALAN', label: 'Kejar Jualan', href: `${basePath}/pos`, color: 'blue' };
  }

  // Default: kondisi bisnis baik
  return { type: 'LIHAT_PERFORMA', label: 'Aksi Logaritma', href: basePath, color: 'emerald' };
}

export function parseTargetValue(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  return parseInt(raw.replace(/\D/g, ''), 10) || fallback;
}
