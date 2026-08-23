/**
 * Solution Catalog — Master data untuk semua solusi Logaritma
 * 
 * Profile → Goal → Problem/Gap → Recommended Solution → CTA → Conversion
 */

export type BillingType = 'monthly' | 'annual' | 'one-time' | 'free' | 'commission';

export type SolutionType =
  | 'platform'
  | 'ads'
  | 'web'
  | 'program'
  | 'consultation'
  | 'health-tool';

export interface Solution {
  id: string;
  name: string;
  type: SolutionType;
  tagline: string;
  description: string;

  /** Profil pengguna yang cocok — gunakan array agar bisa multi-match */
  targetProfile: string[];

  /** Tujuan utama yang cocok — keyword goals */
  targetGoal: string[];

  /** Problem/gap yang diselesaikan oleh solusi ini */
  problems: string[];

  /** Keyword pemicu dalam teks bebas (tujuan/target/cara) */
  triggerKeywords: string[];

  /** Profil yang TIDAK cocok */
  excludeProfile?: string[];

  price: string;
  billingType: BillingType;
  destinationUrl: string;
  cta: string;

  /** Warna aksen kartu solusi (Tailwind class) */
  color: string;

  active: boolean;
}

// ─── Master Catalog ──────────────────────────────────────────────────────────

export const SOLUTION_CATALOG: Solution[] = [
  {
    id: 'ubos',
    name: 'UBOS',
    type: 'platform',
    tagline: 'Unified Business Operating System',
    description:
      'Platform manajemen operasional bisnis lengkap: POS, inventory, CRM, keuangan, dan laporan dalam satu sistem terpadu.',
    targetProfile: ['RETAIL/UMKM', 'JASA', 'F&B'],
    targetGoal: [
      'meningkatkan omset',
      'digitalisasi bisnis',
      'manajemen toko',
      'kelola stok',
      'laporan keuangan',
      'tambah pelanggan',
    ],
    problems: [
      'Tidak ada sistem pencatatan keuangan yang rapi',
      'Stok barang sering tidak terkontrol',
      'Tidak tahu produk mana yang paling menguntungkan',
      'Transaksi masih manual / tidak tercatat',
      'Sulit memantau performa bisnis secara keseluruhan',
    ],
    triggerKeywords: [
      'bisnis', 'toko', 'usaha', 'omset', 'omzet', 'jual',
      'stok', 'inventory', 'pos', 'kasir', 'keuangan', 'laporan',
      'pelanggan', 'klien', 'retail', 'umkm', 'f&b', 'warung',
      'jasa', 'freelance',
    ],
    excludeProfile: ['CREATOR', 'PELAJAR', 'KARYAWAN'],
    price: 'Mulai gratis',
    billingType: 'monthly',
    destinationUrl: 'https://ubos.logaritma.id',
    cta: 'Mulai dengan UBOS',
    color: 'blue',
    active: true,
  },

  {
    id: 'coway',
    name: 'Coway Health Planner Tools',
    type: 'health-tool',
    tagline: 'Sistem khusus untuk Agen & Health Planner Coway',
    description:
      'Platform digital untuk Health Planner Coway memetakan prospek, memantau funnel penjualan, dan melipatgandakan closing rate.',
    targetProfile: ['JASA', 'RETAIL/UMKM', 'LAINNYA'],
    targetGoal: [
      'jadi agen coway',
      'tingkatkan penjualan coway',
      'kelola prospek coway',
      'closing lebih banyak',
    ],
    problems: [
      'Sulit melacak prospek yang sudah dihubungi',
      'Tidak ada sistem follow-up yang terstruktur',
      'Closing rate rendah karena tidak ada data performa',
    ],
    triggerKeywords: [
      'coway', 'agen coway', 'health planner', 'water filter',
      'air minum', 'produk coway', 'filter coway',
    ],
    price: 'Hubungi kami',
    billingType: 'free',
    destinationUrl: 'https://coway.logaritma.id',
    cta: 'Masuk ke Sistem Coway',
    color: 'sky',
    active: true,
  },

  {
    id: 'meta-ads',
    name: 'Meta Ads Management',
    type: 'ads',
    tagline: 'Iklan Facebook & Instagram yang menghasilkan',
    description:
      'Layanan pengelolaan iklan Meta (Facebook & Instagram) untuk bisnis yang ingin meningkatkan jangkauan dan penjualan secara cepat dan terukur.',
    targetProfile: ['RETAIL/UMKM', 'JASA', 'F&B', 'CREATOR'],
    targetGoal: [
      'dapat lebih banyak pelanggan',
      'tingkatkan penjualan online',
      'promosi produk',
      'brand awareness',
      'leads',
    ],
    problems: [
      'Tidak ada pelanggan baru yang masuk secara konsisten',
      'Mengandalkan pelanggan lama saja tidak cukup',
      'Tidak tahu cara beriklan yang efisien dan tidak boros',
      'Sudah coba iklan sendiri tapi hasilnya tidak optimal',
    ],
    triggerKeywords: [
      'iklan', 'ads', 'facebook', 'instagram', 'meta', 'promosi',
      'jangkauan', 'leads', 'pelanggan baru', 'online', 'digital marketing',
    ],
    price: 'Mulai Rp 1.5 jt/bln',
    billingType: 'monthly',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Meta%20Ads%20Logaritma',
    cta: 'Konsultasi Meta Ads',
    color: 'indigo',
    active: true,
  },

  {
    id: 'landing-page',
    name: 'Landing Page',
    type: 'web',
    tagline: 'Halaman web yang mengonversi pengunjung jadi pembeli',
    description:
      'Pembuatan landing page profesional untuk produk, jasa, atau event yang dirancang untuk menghasilkan konversi maksimal.',
    targetProfile: ['RETAIL/UMKM', 'JASA', 'F&B', 'CREATOR', 'LAINNYA'],
    targetGoal: [
      'punya website',
      'jualan online',
      'tingkatkan konversi',
      'terlihat profesional',
      'promosi produk',
    ],
    problems: [
      'Tidak punya tempat online yang bisa menjelaskan produk/jasa secara lengkap',
      'Link bio tidak cukup untuk meyakinkan calon pelanggan',
      'Pembeli masih ragu karena tidak ada halaman yang meyakinkan',
    ],
    triggerKeywords: [
      'website', 'landing page', 'web', 'online shop', 'toko online',
      'jualan online', 'link', 'halaman', 'konversi',
    ],
    price: 'Mulai Rp 500 rb',
    billingType: 'one-time',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Landing%20Page%20Logaritma',
    cta: 'Pesan Landing Page',
    color: 'violet',
    active: true,
  },

  {
    id: 'affiliate',
    name: 'Program Affiliate Logaritma',
    type: 'program',
    tagline: 'Hasilkan komisi dengan merekomendasikan solusi Logaritma',
    description:
      'Bergabunglah sebagai mitra affiliate Logaritma dan dapatkan komisi recurring dari setiap pelanggan yang Anda referensikan.',
    targetProfile: ['CREATOR', 'JASA', 'LAINNYA'],
    targetGoal: [
      'penghasilan tambahan',
      'passive income',
      'bisnis sampingan',
      'rekomendasikan produk',
    ],
    problems: [
      'Butuh penghasilan tambahan tanpa modal besar',
      'Punya audiens tapi belum tahu cara monetisasinya',
      'Ingin bisnis sampingan yang tidak butuh stok barang',
    ],
    triggerKeywords: [
      'affiliate', 'komisi', 'passive income', 'penghasilan tambahan',
      'referral', 'sampingan', 'tanpa modal', 'reseller',
    ],
    price: 'Komisi 10-20%',
    billingType: 'commission',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20ingin%20bergabung%20sebagai%20Affiliate%20Logaritma',
    cta: 'Daftar Affiliate',
    color: 'emerald',
    active: true,
  },

  {
    id: 'konsultasi',
    name: 'Konsultasi Bisnis',
    type: 'consultation',
    tagline: 'Sesi 1-on-1 untuk membuat peta jalan bisnis Anda',
    description:
      'Sesi konsultasi langsung dengan tim Logaritma untuk menganalisis kondisi bisnis, mendiagnosis hambatan, dan menyusun strategi yang dapat langsung dieksekusi.',
    targetProfile: ['RETAIL/UMKM', 'JASA', 'F&B', 'CREATOR', 'KARYAWAN', 'LAINNYA'],
    targetGoal: [
      'butuh arahan',
      'bingung mulai dari mana',
      'bisnis stagnan',
      'strategi pertumbuhan',
    ],
    problems: [
      'Sudah berusaha keras tapi hasil tidak berubah',
      'Tidak tahu bottleneck utama bisnis ada di mana',
      'Butuh pandangan luar (second opinion) yang objektif',
      'Punya ide tapi tidak tahu cara eksekusinya',
    ],
    triggerKeywords: [
      'konsultasi', 'bingung', 'macet', 'stagnan', 'stuck',
      'strategi', 'arahan', 'panduan', 'mentoring', 'coaching',
    ],
    price: 'Mulai Rp 250 rb/sesi',
    billingType: 'one-time',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20ingin%20Konsultasi%20Bisnis%20dengan%20Logaritma',
    cta: 'Jadwalkan Konsultasi',
    color: 'amber',
    active: true,
  },
];
