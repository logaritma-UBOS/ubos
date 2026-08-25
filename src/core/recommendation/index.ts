/**
 * UBOS Core - Recommendation Engine
 *
 * PURE BUSINESS LOGIC - NO REACT, NO DOM, NO NEXT.JS, NO BROWSER APIS
 * Safe to import from: Web (Next.js), Android (React Native/Expo), PC (Tauri)
 *
 * Engine ini menentukan rekomendasi tindakan bisnis berdasarkan:
 * - Profil usaha merchant
 * - Gap antara target dan actual
 * - Kondisi stok dan keuangan
 *
 * Berbeda dengan Logaritma Engine (yang menentukan navigation action),
 * Recommendation Engine menghasilkan saran strategis yang lebih kaya.
 */

// --- Types ---

export interface BusinessProfile {
  kategoriUsaha: string;   // Tipe bisnis: kuliner, ritel, jasa, percetakan, dll
  statusLangganan: string; // Trial, Premium, Expired
  jumlahProduk: number;
  jumlahPelanggan: number;
}

export interface BusinessMetrics {
  dailyOmzet: number;
  dailyProfit: number;
  targetProfitHarian: number;
  totalTransaksiHari: number;
  stokHabisCount: number;
  isOverBudget: boolean;
  totalTerpakai: number;
  budgetBelanjaDaily: number;
}

export type RecommendationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BusinessRecommendation {
  id: string;
  priority: RecommendationPriority;
  kategori: 'PENJUALAN' | 'STOK' | 'KEUANGAN' | 'PELANGGAN' | 'PRODUK' | 'STRATEGI';
  judul: string;
  deskripsi: string;
  tindakan: string;       // Label CTA
  href: string;           // Target route
  icon: string;           // Icon name untuk UI layer (lucide icon name)
}

// --- Scoring Constants ---
const PROFIT_GAP_THRESHOLD_CRITICAL = 0.3;  // < 30% target = CRITICAL
const PROFIT_GAP_THRESHOLD_HIGH = 0.6;      // < 60% target = HIGH

// --- Pure Recommendation Functions ---

/**
 * Analisis gap penjualan vs target
 */
export function analyzeSalesGap(
  dailyProfit: number,
  targetProfitHarian: number
): { severity: RecommendationPriority; percentAchieved: number; gap: number } {
  const percentAchieved = targetProfitHarian > 0
    ? (dailyProfit / targetProfitHarian) * 100
    : 100;
  const gap = Math.max(0, targetProfitHarian - dailyProfit);

  let severity: RecommendationPriority = 'LOW';
  if (percentAchieved < PROFIT_GAP_THRESHOLD_CRITICAL * 100) severity = 'CRITICAL';
  else if (percentAchieved < PROFIT_GAP_THRESHOLD_HIGH * 100) severity = 'HIGH';
  else if (percentAchieved < 80) severity = 'MEDIUM';

  return { severity, percentAchieved, gap };
}

/**
 * Hasilkan rekomendasi berdasarkan kondisi bisnis saat ini
 * Urutan output = urutan prioritas (index 0 = paling kritis)
 */
export function generateRecommendations(
  profile: BusinessProfile,
  metrics: BusinessMetrics,
  basePath: string
): BusinessRecommendation[] {
  const recommendations: BusinessRecommendation[] = [];
  const salesGap = analyzeSalesGap(metrics.dailyProfit, metrics.targetProfitHarian);

  // 1. Anggaran meledak - CRITICAL
  if (metrics.isOverBudget) {
    recommendations.push({
      id: 'over_budget',
      priority: 'CRITICAL',
      kategori: 'KEUANGAN',
      judul: 'Anggaran Hari Ini Melebihi Batas',
      deskripsi: `Pengeluaran sudah melebihi anggaran harian Rp ${metrics.budgetBelanjaDaily.toLocaleString('id-ID')}.`,
      tindakan: 'Cek Keuangan',
      href: `${basePath}/finance`,
      icon: 'AlertTriangle',
    });
  }

  // 2. Stok habis - HIGH/CRITICAL tergantung jumlah
  if (metrics.stokHabisCount > 0) {
    recommendations.push({
      id: 'low_stock',
      priority: metrics.stokHabisCount >= 3 ? 'CRITICAL' : 'HIGH',
      kategori: 'STOK',
      judul: `${metrics.stokHabisCount} Produk Kehabisan Stok`,
      deskripsi: 'Produk habis akan menghentikan penjualan. Segera restok atau nonaktifkan sementara.',
      tindakan: 'Kelola Stok',
      href: `${basePath}/inventory`,
      icon: 'Package',
    });
  }

  // 3. Penjualan jauh dari target
  if (salesGap.severity === 'CRITICAL' || salesGap.severity === 'HIGH') {
    recommendations.push({
      id: 'sales_gap',
      priority: salesGap.severity,
      kategori: 'PENJUALAN',
      judul: `Penjualan Baru ${Math.round(salesGap.percentAchieved)}% dari Target`,
      deskripsi: `Masih kurang sekitar Rp ${Math.round(salesGap.gap).toLocaleString('id-ID')} untuk mencapai target hari ini.`,
      tindakan: 'Buka Kasir',
      href: `${basePath}/pos`,
      icon: 'ShoppingCart',
    });
  }

  // 4. Tidak ada produk terdaftar
  if (profile.jumlahProduk === 0) {
    recommendations.push({
      id: 'no_products',
      priority: 'HIGH',
      kategori: 'PRODUK',
      judul: 'Belum Ada Produk Terdaftar',
      deskripsi: 'Tambahkan produk agar bisa mulai berjualan melalui Kasir POS.',
      tindakan: 'Tambah Produk',
      href: `${basePath}/inventory/new`,
      icon: 'Plus',
    });
  }

  // 5. Tidak ada transaksi hari ini
  if (metrics.totalTransaksiHari === 0 && profile.jumlahProduk > 0) {
    recommendations.push({
      id: 'no_sales_today',
      priority: 'MEDIUM',
      kategori: 'PENJUALAN',
      judul: 'Belum Ada Transaksi Hari Ini',
      deskripsi: 'Mulai hari dengan membuka sesi kasir dan melayani pelanggan pertama.',
      tindakan: 'Mulai Jualan',
      href: `${basePath}/pos`,
      icon: 'Zap',
    });
  }

  // 6. Pelanggan sedikit - sarankan CRM
  if (profile.jumlahPelanggan < 10 && profile.jumlahProduk > 0) {
    recommendations.push({
      id: 'grow_customers',
      priority: 'MEDIUM',
      kategori: 'PELANGGAN',
      judul: 'Bangun Database Pelanggan',
      deskripsi: 'Catat pelanggan setia untuk meningkatkan repeat order dan loyalitas.',
      tindakan: 'Kelola Pelanggan',
      href: `${basePath}/crm`,
      icon: 'Users',
    });
  }

  // Sort: CRITICAL first, then HIGH, MEDIUM, LOW
  const priorityOrder: Record<RecommendationPriority, number> = {
    CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
  };

  return recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Ambil rekomendasi paling kritis (untuk CTA tunggal di navbar/header)
 */
export function getPrimaryAction(
  recommendations: BusinessRecommendation[]
): BusinessRecommendation | null {
  return recommendations.length > 0 ? recommendations[0] : null;
}
