export type TargetPeriod = 'MONTHLY' | 'DAILY' | 'WEEKLY' | 'YEARLY';
export type TargetType = 'REVENUE' | 'LEADS' | 'TRANSACTION' | 'FOLLOWERS' | 'OTHER';

export interface TargetData {
  type: TargetType;
  value: number;
  currentValue: number;
  unit: string;
  period: TargetPeriod;
  mainProblem: string;
}

export interface MappingResult {
  gapValue: number;
  gapText: string;
  factors: string[];
  priority: {
    title: string;
    description: string;
    toolKey: string;
  };
  actionPlan: {
    title: string;
    description: string;
  }[];
}

export function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Miliar`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Juta`;
  if (value >= 1000) return `Rp ${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ribu`;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}M`;
  if (value >= 1000) return `${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}K`;
  return value.toLocaleString('id-ID');
}

export function runLogaritmaEngine(target: TargetData, profesi: string, businessType: string): MappingResult {
  const gapValue = Math.max(0, target.value - target.currentValue);
  const isRev = target.type === 'REVENUE';
  const valStr = isRev ? formatCurrency(gapValue) : `${formatNumber(gapValue)}`;
  const periodStr = target.period === 'MONTHLY' ? '/bulan' : target.period === 'DAILY' ? '/hari' : target.period === 'YEARLY' ? '/tahun' : '/minggu';
  
  const gapText = `Gap sebesar ${valStr}${periodStr}`;

  // Analyze factors based on TargetType and mainProblem
  let factors = ['Kapasitas Operasional', 'Konsistensi', 'Sistem Manajemen'];
  let priority = {
    title: 'Digitalisasi Operasional',
    description: 'Beralih ke sistem digital untuk mengontrol seluruh pergerakan bisnis.',
    toolKey: 'ubos'
  };
  let actionPlan = [
    { title: 'Identifikasi Bottleneck', description: 'Cari tahu di mana operasional terhambat.' },
    { title: 'Gunakan Sistem Sentral', description: 'Gunakan UBOS untuk mengelola pesanan.' }
  ];

  if (target.mainProblem === 'HPP terlalu tinggi' || target.mainProblem === 'Profit kecil') {
    factors = ['HPP & Margin Produk', 'Biaya Operasional', 'Volume Transaksi'];
    priority = {
      title: 'Audit HPP Produk',
      description: 'Sebelum mengejar transaksi tambahan, pastikan setiap produk yang Anda jual menghasilkan margin yang sehat.',
      toolKey: 'hpp_ai'
    };
    actionPlan = [
      { title: 'Audit HPP produk', description: 'Hitung ulang modal dasar setiap produk.' },
      { title: 'Identifikasi produk prioritas', description: 'Cari produk dengan margin terbaik.' },
      { title: 'Tentukan target transaksi', description: 'Fokus jual produk margin tinggi.' },
      { title: 'Optimasi penjualan', description: 'Kurangi biaya siluman.' },
      { title: 'Monitor realisasi', description: 'Pantau profit harian.' }
    ];
  } else if (target.mainProblem === 'Penjualan kurang' || target.mainProblem === 'Tidak tahu masalahnya') {
    factors = ['Jumlah Transaksi', 'Konversi Leads', 'Traffic Kunjungan'];
    priority = {
      title: 'Tingkatkan Volume Transaksi',
      description: 'Perluas jangkauan ke pelanggan baru melalui channel online dan percepat proses checkout.',
      toolKey: 'ubos'
    };
    actionPlan = [
      { title: 'Evaluasi Channel Promosi', description: 'Fokus pada channel yang paling banyak mendatangkan leads.' },
      { title: 'Perbaiki Konversi', description: 'Berikan penawaran menarik untuk pembelian pertama.' },
      { title: 'Gunakan POS Cepat', description: 'Pastikan proses pembayaran tidak antre.' },
      { title: 'Monitor Pertumbuhan', description: 'Pantau grafik penjualan harian.' }
    ];
  } else if (target.mainProblem === 'Pelanggan tidak repeat') {
    factors = ['Repeat Order', 'Kualitas Layanan', 'Database Pelanggan'];
    priority = {
      title: 'Kelola Database Pelanggan',
      description: 'Simpan data pelanggan dan berikan promo khusus untuk menarik mereka kembali.',
      toolKey: 'ubos'
    };
    actionPlan = [
      { title: 'Kumpulkan Data', description: 'Minta nomor WA setiap pembeli.' },
      { title: 'Segmentasi Pelanggan', description: 'Pisahkan pelanggan loyal dan pasif.' },
      { title: 'Broadcast Promo', description: 'Kirim penawaran eksklusif secara berkala.' },
      { title: 'Evaluasi Layanan', description: 'Minta feedback langsung dari pelanggan.' }
    ];
  } else if (target.mainProblem === 'Operasional tidak efisien') {
    factors = ['Sistem Manajemen', 'Kinerja Karyawan', 'Laporan Keuangan'];
    priority = {
      title: 'Sentralisasi Sistem Bisnis',
      description: 'Gunakan satu sistem terpadu untuk mencegah kebocoran dana dan memantau stok secara real-time.',
      toolKey: 'ubos'
    };
    actionPlan = [
      { title: 'Gunakan Aplikasi Kasir', description: 'Catat semua transaksi secara digital.' },
      { title: 'Audit Stok Berjangka', description: 'Pastikan fisik barang sesuai dengan sistem.' },
      { title: 'Evaluasi Laporan Bulanan', description: 'Gunakan data untuk mengambil keputusan.' }
    ];
  }

  // Override for specific professions
  if (profesi.includes('Coway')) {
    factors = ['Leads Masuk', 'Tingkat Konversi (Follow-up)', 'Closing Rate'];
    priority = {
      title: 'Optimasi Manajemen Leads',
      description: 'Jangan biarkan calon pelanggan mendingin. Segera follow-up leads yang masuk secara sistematis.',
      toolKey: 'coway'
    };
  }

  return {
    gapValue,
    gapText,
    factors,
    priority,
    actionPlan
  };
}
