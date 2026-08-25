/**
 * UBOS Core - Calculation / HPP Engine
 *
 * PURE BUSINESS LOGIC - NO REACT, NO DOM, NO NEXT.JS, NO BROWSER APIS
 * Safe to import from: Web (Next.js), Android (React Native/Expo), PC (Tauri)
 *
 * Berisi semua kalkulasi POS, HPP, profit, dan financial metrics yang 
 * saat ini tersebar di berbagai page.tsx dan komponen UI.
 */

// --- Types ---

export interface TransactionItem {
  product_id?: string;
  name?: string;
  qty: number;
  price: number;         // Harga jual
  hpp?: number;          // Harga Pokok Penjualan per unit
  discount?: number;     // Diskon per item (nominal)
}

export interface CartSummary {
  subtotal: number;         // Sebelum diskon
  totalDiscount: number;    // Total diskon semua item
  grandTotal: number;       // Setelah diskon
  totalHPP: number;         // Total modal/HPP
  estimatedProfit: number;  // Estimasi profit (grandTotal - totalHPP)
  profitMargin: number;     // Margin dalam persen (0-100)
}

export interface HPPInput {
  hargaBeli: number;           // Modal/harga beli dari supplier
  biayaOperasional?: number;   // Biaya tambahan (ongkir, kemasan, dll)
  targetMargin?: number;       // Target margin dalam persen (0-100)
}

export interface HPPResult {
  hpp: number;                 // HPP per unit
  hargaJualMinimum: number;    // Harga jual minimum (breakeven)
  hargaJualRekomendasi: number;// Harga jual dengan target margin
  marginPerUnit: number;       // Profit per unit jika dijual di harga rekomendasi
}

export interface FinancialSummary {
  totalOmzet: number;
  totalHPP: number;
  grossProfit: number;
  grossMargin: number;     // dalam persen
  netProfit?: number;      // Jika ada data biaya operasional
}

// --- Pure Calculation Functions ---

/**
 * Hitung ringkasan keranjang belanja POS
 */
export function calculateCartSummary(items: TransactionItem[]): CartSummary {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalHPP = 0;

  for (const item of items) {
    const itemSubtotal = item.price * item.qty;
    const itemDiscount = (item.discount || 0) * item.qty;
    const itemHPP = (item.hpp || 0) * item.qty;

    subtotal += itemSubtotal;
    totalDiscount += itemDiscount;
    totalHPP += itemHPP;
  }

  const grandTotal = subtotal - totalDiscount;
  const estimatedProfit = grandTotal - totalHPP;
  const profitMargin = grandTotal > 0 ? (estimatedProfit / grandTotal) * 100 : 0;

  return {
    subtotal,
    totalDiscount,
    grandTotal,
    totalHPP,
    estimatedProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
  };
}

/**
 * Hitung HPP dan harga jual rekomendasi
 */
export function calculateHPP(input: HPPInput): HPPResult {
  const { hargaBeli, biayaOperasional = 0, targetMargin = 30 } = input;
  const hpp = hargaBeli + biayaOperasional;
  const hargaJualMinimum = hpp; // BEP
  const hargaJualRekomendasi = hpp / (1 - targetMargin / 100);
  const marginPerUnit = hargaJualRekomendasi - hpp;

  return {
    hpp: Math.round(hpp),
    hargaJualMinimum: Math.round(hargaJualMinimum),
    hargaJualRekomendasi: Math.round(hargaJualRekomendasi),
    marginPerUnit: Math.round(marginPerUnit),
  };
}

/**
 * Hitung ringkasan keuangan dari sekumpulan transaksi
 */
export function calculateFinancialSummary(transactions: {
  omzet: number;
  hpp: number;
}[]): FinancialSummary {
  let totalOmzet = 0;
  let totalHPP = 0;

  for (const tx of transactions) {
    totalOmzet += tx.omzet;
    totalHPP += tx.hpp;
  }

  const grossProfit = totalOmzet - totalHPP;
  const grossMargin = totalOmzet > 0 ? (grossProfit / totalOmzet) * 100 : 0;

  return {
    totalOmzet,
    totalHPP,
    grossProfit,
    grossMargin: Math.round(grossMargin * 100) / 100,
  };
}

/**
 * Hitung target harian dari target bulanan
 */
export function calculateDailyTarget(monthlyTarget: number, daysInMonth: number = 30): number {
  return Math.round(monthlyTarget / daysInMonth);
}

/**
 * Hitung persentase pencapaian target
 */
export function calculateAchievementPercent(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((actual / target) * 100), 999);
}

/**
 * Hitung gap antara target dan aktual
 */
export function calculateGap(target: number, actual: number): {
  gap: number;
  isAchieved: boolean;
  percentAchieved: number;
} {
  const gap = target - actual;
  const isAchieved = actual >= target;
  const percentAchieved = calculateAchievementPercent(actual, target);
  return { gap: Math.max(0, gap), isAchieved, percentAchieved };
}

/**
 * Format angka ke format Rupiah (tanpa browser/Intl dependency yang kompleks)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

/**
 * Parse string Rupiah menjadi angka
 */
export function parseRupiah(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Estimasi profit sederhana jika HPP tidak tersedia (pakai margin estimasi)
 */
export function estimateProfit(omzet: number, estimatedMargin: number = 0.4): number {
  return omzet * estimatedMargin;
}
