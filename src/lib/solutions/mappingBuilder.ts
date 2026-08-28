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

  let factors: string[] = [];
  let priority = { title: '', description: '', toolKey: '' };
  let actionPlan: { title: string; description: string; }[] = [];

  const lowerProfesi = profesi.toLowerCase();

  // 1. UMKM
  if (lowerProfesi.includes('umkm') || lowerProfesi.includes('retail') || lowerProfesi.includes('jasa')) {
    if (target.mainProblem === 'HPP terlalu tinggi' || target.mainProblem === 'Profit kecil') {
      factors = ['HPP & Margin Produk', 'Biaya Operasional', 'Volume Transaksi'];
      priority = {
        title: 'Audit HPP Produk',
        description: 'Pastikan produk yang Anda jual menghasilkan margin sehat agar operasional bisnis bisa bertumbuh.',
        toolKey: 'hpp_ai'
      };
      actionPlan = [
        { title: 'Audit HPP produk', description: 'Hitung ulang modal dasar setiap produk.' },
        { title: 'Identifikasi prioritas', description: 'Cari produk dengan margin terbaik.' },
        { title: 'Gunakan Sistem POS', description: 'Gunakan UBOS untuk mencatat penjualan agar profit riil terpantau otomatis.' },
        { title: 'Evaluasi berkala', description: 'Kurangi biaya siluman pada operasional harian.' }
      ];
    } else if (target.mainProblem === 'Pelanggan tidak repeat') {
      factors = ['Repeat Order', 'Kualitas Layanan', 'Database Pelanggan'];
      priority = {
        title: 'Kelola Database Pelanggan',
        description: 'Simpan data pelanggan dengan rapi dan berikan promo khusus untuk menarik mereka kembali.',
        toolKey: 'ubos'
      };
      actionPlan = [
        { title: 'Kumpulkan Data', description: 'Minta nomor WA setiap pelanggan.' },
        { title: 'Sentralisasi Data CRM', description: 'Masukkan database ke dalam UBOS CRM.' },
        { title: 'Segmentasi', description: 'Pisahkan pelanggan loyal dan pasif.' },
        { title: 'Broadcast Promo', description: 'Kirim penawaran eksklusif secara berkala.' }
      ];
    } else {
      factors = ['Volume Transaksi', 'Kapasitas Operasional', 'Sistem Manajemen'];
      priority = {
        title: 'Digitalisasi Operasional',
        description: 'Beralih ke sistem digital untuk mempercepat transaksi dan mengontrol pergerakan bisnis.',
        toolKey: 'ubos'
      };
      actionPlan = [
        { title: 'Identifikasi Bottleneck', description: 'Cari tahu proses yang memakan waktu lama.' },
        { title: 'Evaluasi Channel Promosi', description: 'Perkuat channel yang mendatangkan pembeli.' },
        { title: 'Gunakan Sistem Sentral', description: 'Gunakan UBOS untuk mengelola kasir, inventaris, dan laporan keuangan.' },
        { title: 'Monitor Pertumbuhan', description: 'Pantau grafik penjualan harian.' }
      ];
    }
  } 
  // 2. MARKETING / AGEN COWAY
  else if (lowerProfesi.includes('coway') || lowerProfesi.includes('marketing')) {
    factors = ['Leads Masuk', 'Tingkat Konversi (Follow-up)', 'Closing Rate'];
    priority = {
      title: 'Optimasi Manajemen Leads',
      description: 'Jangan biarkan calon pelanggan mendingin. Segera follow-up leads yang masuk secara sistematis.',
      toolKey: 'coway'
    };
    actionPlan = [
      { title: 'Pemetaan Channel', description: 'Petakan darimana leads terbanyak masuk.' },
      { title: 'Kumpulkan Database', description: 'Catat setiap prospek ke dalam sistem secara terstruktur.' },
      { title: 'Follow-up Rutin', description: 'Lakukan follow-up terjadwal agar konversi meningkat.' },
      { title: 'Gunakan Tools', description: 'Gunakan solusi Coway untuk mengelola proses penjualan.' }
    ];
  } 
  // 3. KONTEN KREATOR
  else if (lowerProfesi.includes('kreator') || lowerProfesi.includes('creator') || lowerProfesi.includes('influencer') || lowerProfesi.includes('kol')) {
    factors = ['Monetisasi Audiens', 'Engagement Rate', 'Personal Branding'];
    priority = {
      title: 'Monetisasi Lewat Affiliate',
      description: 'Ubah audiens dan traffic Anda menjadi passive income yang konsisten dengan merekomendasikan solusi digital.',
      toolKey: 'affiliate'
    };
    actionPlan = [
      { title: 'Audit Niche', description: 'Identifikasi kebutuhan utama audiens Anda.' },
      { title: 'Bergabung di Program Affiliate', description: 'Daftar sebagai mitra affiliate Logaritma.' },
      { title: 'Buat Konten Edukasi', description: 'Buat konten yang membahas masalah audiens dan solusi tools-nya.' },
      { title: 'Sematkan Link', description: 'Gunakan link referral di bio atau deskripsi video Anda.' }
    ];
  } 
  // 4 & 5. KARYAWAN & FREELANCER
  else if (lowerProfesi.includes('karyawan') || lowerProfesi.includes('freelance') || lowerProfesi.includes('agen')) {
    factors = ['Manajemen Waktu', 'Sumber Penghasilan Tambahan', 'Network'];
    priority = {
      title: 'Bangun Passive Income',
      description: 'Manfaatkan jaringan dan waktu luang Anda untuk merekomendasikan sistem B2B kepada kenalan atau klien.',
      toolKey: 'affiliate'
    };
    actionPlan = [
      { title: 'Petakan Network', description: 'Tulis daftar rekan/klien yang memiliki masalah bisnis atau butuh sistem.' },
      { title: 'Daftar Mitra', description: 'Bergabung ke program partnership/affiliate B2B.' },
      { title: 'Kenalkan Solusi', description: 'Rekomendasikan sistem terpadu (seperti UBOS) kepada mereka.' },
      { title: 'Dapatkan Komisi', description: 'Nikmati komisi rutin dari biaya berlangganan mereka.' }
    ];
  } 
  // 6. PROFESIONAL
  else {
    factors = ['Efisiensi Waktu', 'Skalabilitas', 'Sistem Kustom'];
    priority = {
      title: 'Analisis Kebutuhan Lanjutan',
      description: 'Anda memiliki model kerja yang unik. Diperlukan analisis kebutuhan mendalam sebelum menentukan sistem eksekusi yang tepat.',
      toolKey: 'no_solution'
    };
    actionPlan = [
      { title: 'Audit Proses Kerja', description: 'Catat alur kerja harian yang repetitif.' },
      { title: 'Identifikasi Tools', description: 'Petakan aplikasi/software yang saat ini digunakan.' },
      { title: 'Konsultasi Digitalisasi', description: 'Diskusikan kebutuhan spesifik Anda dengan konsultan kami.' }
    ];
  }

  return {
    gapValue,
    gapText,
    factors,
    priority,
    actionPlan
  };
}
