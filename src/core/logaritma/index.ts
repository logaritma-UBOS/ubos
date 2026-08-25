import { calculateCartSummary, calculateHPP, calculateFinancialSummary, calculateDailyTarget, calculateAchievementPercent, calculateGap } from '../calculation';
import { generateRecommendations, getPrimaryAction, evaluateDataConfidence, type BusinessProfile, type BusinessRecommendation, type BusinessMetrics } from '../recommendation';
import { evaluateAction, type ActionRecord, type EvaluationResult } from '../evaluation';

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
  recommendations: BusinessRecommendation[];
  primaryAction: BusinessRecommendation | null;
  evaluationResult?: EvaluationResult;
}

export type LogaritmaActionType = 'KEJAR_JUALAN' | 'AMANKAN_STOK' | 'CEK_KEUANGAN' | 'AKTIFKAN_PELANGGAN' | 'LIHAT_PERFORMA';

export interface LogaritmaAction {
  type: LogaritmaActionType;
  label: string;
  href: string;
  color: 'red' | 'orange' | 'blue' | 'purple' | 'emerald';
}

export function extractOmzetFromTransaction(tx: RawTransaction): number {
  return Number(tx.total_gross || tx.total || tx.total_harga || tx.grand_total || tx.subtotal || tx.jumlah || tx.price || tx.nominal || tx.harga || 0);
}

export function extractNetFromTransaction(tx: RawTransaction): number {
  return Number(tx.total_net || tx.total || tx.total_harga || tx.grand_total || tx.subtotal || tx.jumlah || extractOmzetFromTransaction(tx));
}

export function calculateDailyMetrics(transactions: RawTransaction[]): DailyMetrics {
  let dailyOmzet = 0;
  let dailyProfit = 0;
  for (const tx of transactions) {
    const omzet = extractOmzetFromTransaction(tx);
    dailyOmzet += omzet;
    dailyProfit += extractNetFromTransaction(tx) * 0.4;
  }
  return { dailyOmzet, dailyProfit, totalTransactions: transactions.length };
}

export function calculateStockMetrics(products: RawProduct[]): StockMetrics {
  const lowStockItems: RawProduct[] = [];
  let totalTerpakai = 0;
  for (const p of products) {
    const stokVal = Number(p.stok ?? p.qty ?? p.stock ?? p.quantity ?? 1);
    if (p.is_available === false || p.status === 'habis' || stokVal <= 0) {
      lowStockItems.push(p);
    }
    const modal = Number(p.hpp_dasar || p.hpp || p.modal || p.harga_modal || p.harga_beli || p.modal_satuan || p.capital || 0);
    totalTerpakai += p.total_belanja ? Number(p.total_belanja) : (modal * stokVal);
  }
  return { totalTerpakai, lowStockItems };
}

export function calculateRemainingBudget(budget: number, omzet: number, profit: number): number {
  return budget - (omzet - profit);
}

export function buildLogaritmaState(
  config: LogaritmaConfig,
  transactions: RawTransaction[],
  products: RawProduct[],
  profileOverride?: Partial<BusinessProfile>,
  lastActionRecord?: ActionRecord
): LogaritmaState {
  const daily = calculateDailyMetrics(transactions);
  const stock = calculateStockMetrics(products);
  const remainingMorningBudget = calculateRemainingBudget(config.budgetBelanjaDaily, daily.dailyOmzet, daily.dailyProfit);
  
  const targetProfitHarian = calculateDailyTarget(config.targetProfitMonthly);
  
  const metrics: BusinessMetrics = {
    dailyOmzet: daily.dailyOmzet,
    dailyProfit: daily.dailyProfit,
    targetProfitHarian,
    totalTransaksiHari: daily.totalTransactions,
    stokHabisCount: stock.lowStockItems.length,
    isOverBudget: remainingMorningBudget < 0,
    totalTerpakai: stock.totalTerpakai,
    budgetBelanjaDaily: config.budgetBelanjaDaily,
    // Fix Data Confidence: If we don't have historical data, default to daily.totalTransactions (keeps confidence LOW/safe)
    totalTransaksiHistori: profileOverride?.totalTransaksiHistori ?? daily.totalTransactions,
  };
  
  const profile: BusinessProfile = {
    kategoriUsaha: 'Retail',
    statusLangganan: 'Premium',
    jumlahProduk: products.length,
    jumlahPelanggan: profileOverride?.jumlahPelanggan || 0,
    umurAkunHari: profileOverride?.umurAkunHari || 30,
    ...profileOverride,
    totalTransaksiHistori: profileOverride?.totalTransaksiHistori ?? daily.totalTransactions // Make sure it exists if needed later
  } as BusinessProfile;

  const recommendations = generateRecommendations(profile, metrics, '');
  const primaryAction = getPrimaryAction(recommendations);
  
  let evaluationResult: EvaluationResult | undefined = undefined;
  if (lastActionRecord) {
    evaluationResult = evaluateAction(lastActionRecord, metrics);
  }

  return {
    config,
    daily,
    stock,
    remainingMorningBudget,
    isOverBudget: remainingMorningBudget < 0,
    hasProducts: products.length > 0,
    recommendations,
    primaryAction,
    evaluationResult
  };
}

export function determineLogaritmaAction(state: LogaritmaState, basePath: string): LogaritmaAction {
  const { primaryAction } = state;
  
  if (primaryAction) {
    let type: LogaritmaActionType = 'LIHAT_PERFORMA';
    let color: 'red'|'orange'|'blue'|'purple'|'emerald' = 'emerald';
    
    if (primaryAction.priority === 'CRITICAL' && primaryAction.kategori === 'KEUANGAN') {
      type = 'CEK_KEUANGAN'; color = 'red';
    } else if (primaryAction.kategori === 'STOK') {
      type = 'AMANKAN_STOK'; color = 'orange';
    } else if (primaryAction.kategori === 'PENJUALAN') {
      type = 'KEJAR_JUALAN'; color = 'blue';
    } else if (primaryAction.kategori === 'PELANGGAN') {
      type = 'AKTIFKAN_PELANGGAN'; color = 'purple';
    }

    return {
      type,
      label: primaryAction.tindakan,
      href: `${basePath}${primaryAction.href}`,
      color
    };
  }

  return { type: 'LIHAT_PERFORMA', label: 'Aksi Logaritma', href: basePath, color: 'emerald' };
}

export function parseTargetValue(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  return parseInt(raw.replace(/\D/g, ''), 10) || fallback;
}
