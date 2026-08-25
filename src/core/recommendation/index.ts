export type DataConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BusinessProfile {
  kategoriUsaha: string;
  statusLangganan: string;
  jumlahProduk: number;
  jumlahPelanggan: number;
  umurAkunHari: number;
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
  totalTransaksiHistori: number;
}

export type RecommendationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BusinessRecommendation {
  id: string;
  priority: RecommendationPriority;
  kategori: 'PENJUALAN' | 'STOK' | 'KEUANGAN' | 'PELANGGAN' | 'PRODUK' | 'STRATEGI' | 'OPERASIONAL';
  judul: string;
  deskripsi: string;
  tindakan: string;
  href: string;
  icon: string;
  confidence: DataConfidence;
}

const PROFIT_GAP_THRESHOLD_CRITICAL = 0.3;
const PROFIT_GAP_THRESHOLD_HIGH = 0.6;

export function evaluateDataConfidence(profile: BusinessProfile, metrics: BusinessMetrics): DataConfidence {
  // Hanya gunakan totalTransaksiHistori aktual
  if (metrics.totalTransaksiHistori < 10 || profile.umurAkunHari < 3) return 'LOW';
  if (metrics.totalTransaksiHistori < 50 || profile.umurAkunHari < 7) return 'MEDIUM';
  return 'HIGH';
}

export function analyzeSalesGap(dailyProfit: number, targetProfitHarian: number): { severity: RecommendationPriority; percentAchieved: number; gap: number } {
  const percentAchieved = targetProfitHarian > 0 ? (dailyProfit / targetProfitHarian) * 100 : 100;
  const gap = Math.max(0, targetProfitHarian - dailyProfit);

  let severity: RecommendationPriority = 'LOW';
  if (percentAchieved < PROFIT_GAP_THRESHOLD_CRITICAL * 100) severity = 'CRITICAL';
  else if (percentAchieved < PROFIT_GAP_THRESHOLD_HIGH * 100) severity = 'HIGH';
  else if (percentAchieved < 80) severity = 'MEDIUM';

  return { severity, percentAchieved, gap };
}

export function generateRecommendations(
  profile: BusinessProfile,
  metrics: BusinessMetrics,
  basePath: string
): BusinessRecommendation[] {
  const recommendations: BusinessRecommendation[] = [];
  const confidence = evaluateDataConfidence(profile, metrics);
  const salesGap = analyzeSalesGap(metrics.dailyProfit, metrics.targetProfitHarian);
  const isFnB = profile.kategoriUsaha.toLowerCase().includes('f&b') || profile.kategoriUsaha.toLowerCase().includes('kuliner');
  const isJasa = profile.kategoriUsaha.toLowerCase().includes('jasa');
  
  // 1. GAP: Over Budget -> Cause: Pengeluaran tinggi -> Action: Cek Keuangan / Kurangi Kulakan -> Feature: /finance
  if (metrics.isOverBudget) {
    recommendations.push({
      id: 'over_budget',
      priority: 'CRITICAL',
      kategori: 'KEUANGAN',
      judul: 'Kontrol Anggaran Harian',
      deskripsi: isFnB 
        ? 'Pengeluaran belanja bahan baku melebihi modal harian. Kurangi kulakan atau naikkan harga jual.'
        : 'Pengeluaran operasional melebihi anggaran. Cek arus kas sekarang.',
      tindakan: 'Buka Keuangan',
      href: '/finance',
      icon: 'AlertTriangle',
      confidence
    });
  }

  // 2. GAP: Stok Habis -> Cause: Lupa restok -> Action: Kelola Inventaris -> Feature: /inventory
  if (metrics.stokHabisCount > 0 && !isJasa) {
    recommendations.push({
      id: 'low_stock',
      priority: metrics.stokHabisCount >= 3 ? 'CRITICAL' : 'HIGH',
      kategori: 'STOK',
      judul: metrics.stokHabisCount + ' Produk/Bahan Habis',
      deskripsi: isFnB 
        ? 'Bahan baku utama habis dapat menghentikan pesanan. Segera restok.' 
        : 'Produk kosong akan mengecewakan pelanggan. Segera kulakan.',
      tindakan: 'Kelola Inventaris',
      href: '/inventory',
      icon: 'Package',
      confidence
    });
  }

  // 3. GAP: Profit Rendah
  if (salesGap.severity === 'CRITICAL' || salesGap.severity === 'HIGH') {
    // Cause Analysis
    
    // Cause A: Omzet ada tapi Profit rendah -> Margin terlalu tipis / HPP salah
    if (metrics.dailyOmzet > 0 && (metrics.dailyProfit / metrics.dailyOmzet) < 0.1) {
      recommendations.push({
        id: 'low_margin',
        priority: salesGap.severity,
        kategori: 'KEUANGAN',
        judul: 'Margin Profit Terlalu Tipis',
        deskripsi: 'Omzet tercapai tapi profit kecil. Cek kembali perhitungan Harga Pokok (HPP) Anda.',
        tindakan: 'Cek Performa Produk',
        href: '/performa-produk', // Backward map to pricing/performance
        icon: 'TrendingDown',
        confidence
      });
    } 
    // Cause B: Transaksi harian sangat rendah -> Promosi / Marketing
    else if (metrics.totalTransaksiHari < 5) {
      if (confidence === 'LOW') {
        recommendations.push({
          id: 'sales_gap_low',
          priority: 'HIGH',
          kategori: 'PENJUALAN',
          judul: 'Mulai Transaksi Pertama',
          deskripsi: 'Catat transaksi sebanyak mungkin agar Logaritma bisa menganalisa pola penjualan Anda.',
          tindakan: 'Buka Kasir',
          href: '/pos',
          icon: 'ShoppingCart',
          confidence
        });
      } else {
        recommendations.push({
          id: 'low_traffic',
          priority: salesGap.severity,
          kategori: 'PENJUALAN',
          judul: 'Transaksi Sepi Hari Ini',
          deskripsi: 'Pelanggan sepi. Coba jalankan promo kilat ke database pelanggan Anda.',
          tindakan: 'Broadcast Promo',
          href: '/crm',
          icon: 'MessageCircle',
          confidence
        });
      }
    } 
    // Cause C: Pelanggan loyal kurang -> CRM
    else if (profile.jumlahPelanggan < 20) {
      recommendations.push({
        id: 'low_retention',
        priority: 'HIGH',
        kategori: 'PELANGGAN',
        judul: 'Kumpulkan Data Pelanggan',
        deskripsi: 'Transaksi cukup, namun sedikit yang terekam sebagai pelanggan tetap. Tawarkan membership.',
        tindakan: 'Kelola Pelanggan',
        href: '/crm',
        icon: 'Users',
        confidence
      });
    }
    // Default cause: Just need to sell more
    else {
      recommendations.push({
        id: 'push_sales',
        priority: 'MEDIUM',
        kategori: 'PENJUALAN',
        judul: 'Kejar Target Harian',
        deskripsi: 'Masih kurang sedikit untuk mencapai target profit harian. Maksimalkan kasir!',
        tindakan: 'Buka Kasir',
        href: '/pos',
        icon: 'Zap',
        confidence
      });
    }
  }

  // 4. GAP: Katalog kosong
  if (profile.jumlahProduk === 0) {
    recommendations.push({
      id: 'no_products',
      priority: 'HIGH',
      kategori: 'PRODUK',
      judul: isJasa ? 'Belum Ada Layanan/Jasa' : 'Belum Ada Katalog Produk',
      deskripsi: isJasa 
        ? 'Tambahkan daftar layanan Anda agar bisa dipilih saat kasir.' 
        : 'Katalog kosong. Tambahkan produk atau bahan baku pertama Anda.',
      tindakan: isJasa ? 'Tambah Layanan' : 'Tambah Produk',
      href: '/inventory/new',
      icon: 'Plus',
      confidence
    });
  }

  const priorityOrder: Record<RecommendationPriority, number> = {
    CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
  };

  return recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

export function getPrimaryAction(recommendations: BusinessRecommendation[]): BusinessRecommendation | null {
  return recommendations.length > 0 ? recommendations[0] : null;
}
