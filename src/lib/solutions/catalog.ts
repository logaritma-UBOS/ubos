/**
 * Solution Catalog — Master data untuk semua solusi Logaritma
 *
 * Flow: Profile → Goal → Problem/Gap → Recommended Solution → Offer → CTA → Conversion
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillingType =
  | 'subscription'   // Recurring bulanan/tahunan (UBOS monthly)
  | 'annual'         // Tahunan penuh
  | 'one-time'       // Bayar sekali (UBOS lifetime, Landing Page)
  | 'service'        // Layanan berbasis retainer/project (Meta Ads, Konsultasi)
  | 'commission'     // Persentase dari referral (Affiliate)
  | 'partner'        // Partnership/tidak ada tarif ke end-user (Coway)
  | 'free';          // Gratis penuh

export type RevenueType =
  | 'direct'         // Pendapatan langsung dari user
  | 'subscription'   // Recurring revenue
  | 'referral'       // Komisi dari platform lain
  | 'partner'        // Revenue share / partnership deal
  | 'commission';    // Komisi affiliate

export type SolutionType =
  | 'platform'
  | 'ads'
  | 'web'
  | 'program'
  | 'consultation'
  | 'health-tool';

// ─── Offer — child entity di bawah Solution ───────────────────────────────────
// Setiap Solution bisa punya 1 atau banyak Offer.
// Engine bekerja di level Solution; UI merender pilihan dari offers[].

export interface Offer {
  /** Unique ID — format: '{solutionId}-{variant}', e.g. 'ubos-monthly' */
  id: string;

  /** Label paket untuk display — 'Bulanan', 'Lifetime', 'Starter', dll */
  label: string;

  /** Deskripsi singkat perbedaan paket ini dibanding lainnya */
  description?: string;

  /** Label harga untuk ditampilkan ke user */
  price: string;

  /** Nilai numerik harga — untuk kalkulasi MRR, sorting, revenue tracking */
  priceAmount: number;

  /** Mata uang */
  currency: 'IDR' | 'USD';

  /** Model penagihan */
  billingType: BillingType;

  /** Klasifikasi revenue stream untuk Owner Dashboard */
  revenueType: RevenueType;

  /** Persentase komisi (0–100) — khusus billingType commission */
  commissionRate?: number;

  /** URL tujuan — bisa berbeda per paket (/?plan=monthly, /?plan=lifetime) */
  destinationUrl: string;

  /** Teks tombol CTA utama */
  cta: string;

  /** Teks tombol CTA sekunder / soft CTA */
  ctaSecondary?: string;

  /**
   * Tandai sebagai paket rekomendasi / "best value".
   * UI bisa menampilkan badge khusus untuk offer ini.
   */
  highlighted?: boolean;

  active: boolean;
}

// ─── Solution — parent entity ─────────────────────────────────────────────────

export interface Solution {
  id: string;
  name: string;
  type: SolutionType;
  tagline: string;
  description: string;

  /** Profil pengguna yang cocok */
  targetProfile: string[];

  /** Tujuan utama yang cocok — keyword goals */
  targetGoal: string[];

  /** Problem/gap yang diselesaikan oleh solusi ini */
  problems: string[];

  /** Keyword pemicu dalam teks bebas (tujuan/target/cara) */
  triggerKeywords: string[];

  /** Profil yang TIDAK cocok dengan solusi ini */
  excludeProfile?: string[];

  /**
   * Daftar offer/paket harga.
   * Satu solution bisa punya 1 atau banyak offer.
   * Engine.ts tidak membaca offers — hanya UI yang merender offers[].
   */
  offers: Offer[];

  /**
   * @deprecated Gunakan `offers[].price` untuk pricing yang akurat.
   * Field ini dipertahankan sementara agar UI Backward Mapping
   * yang belum dimigrasi tidak rusak. Isinya mengacu ke harga mulai / primary offer.
   */
  price: string;

  /**
   * @deprecated Gunakan `offers[].destinationUrl`.
   * Dipertahankan untuk backward compat UI. Mengacu ke offer utama/highlighted.
   */
  destinationUrl: string;

  /**
   * @deprecated Gunakan `offers[].cta`.
   * Dipertahankan untuk backward compat UI. Mengacu ke offer utama/highlighted.
   */
  cta: string;

  /** Warna aksen kartu solusi (Tailwind token) */
  color: string;

  /** ISO date string — solusi aktif mulai kapan */
  startDate?: string;

  /** ISO date string — solusi aktif sampai kapan */
  endDate?: string;

  active: boolean;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Kembalikan offer yang highlighted, atau offer pertama yang aktif.
 * Digunakan untuk backward compat dan tampilan kartu default.
 */
export function getPrimaryOffer(solution: Solution): Offer | undefined {
  return (
    solution.offers.find(o => o.active && o.highlighted) ??
    solution.offers.find(o => o.active)
  );
}

// ─── Master Catalog ──────────────────────────────────────────────────────────

export const SOLUTION_CATALOG: Solution[] = [

  // ── 1. UBOS ─────────────────────────────────────────────────────────────────
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
      'bisnis', 'toko', 'usaha', 'omset', 'omzet',
      'stok', 'inventory', 'pos', 'kasir', 'keuangan', 'laporan',
      'pelanggan', 'klien', 'retail', 'umkm', 'f&b', 'warung',
    ],
    excludeProfile: ['CREATOR', 'PELAJAR', 'KARYAWAN'],

    offers: [
      {
        id: 'ubos-monthly',
        label: 'Bulanan',
        description: 'Akses penuh semua fitur, bayar bulanan tanpa komitmen jangka panjang.',
        price: 'Rp 49.000/bln',
        priceAmount: 49000,
        currency: 'IDR',
        billingType: 'subscription',
        revenueType: 'subscription',
        destinationUrl: 'https://ubos.logaritma.id',
        cta: 'Mulai Bulanan',
        ctaSecondary: 'Lihat fitur',
        highlighted: false,
        active: true,
      },
      {
        id: 'ubos-lifetime',
        label: 'Lifetime',
        description: 'Bayar sekali, akses selamanya. Hemat dibanding 6 bulan berlangganan.',
        price: 'Rp 249.000 sekali bayar',
        priceAmount: 249000,
        currency: 'IDR',
        billingType: 'one-time',
        revenueType: 'direct',
        destinationUrl: 'https://ubos.logaritma.id',
        cta: 'Beli Lifetime',
        ctaSecondary: 'Bandingkan paket',
        highlighted: true,   // ← Paket rekomendasi / "best value"
        active: true,
      },
    ],

    // Backward compat — mengacu ke offer lifetime (highlighted)
    price: 'Rp 49.000/bln atau Rp 249.000 lifetime',
    destinationUrl: 'https://ubos.logaritma.id',
    cta: 'Mulai dengan UBOS',
    color: 'blue',
    active: true,
  },

  // ── 2. COWAY ─────────────────────────────────────────────────────────────────
  {
    id: 'coway',
    name: 'Coway Health Planner Tools',
    type: 'health-tool',
    tagline: 'Sistem khusus untuk Agen & Health Planner Coway',
    description:
      'Platform digital untuk Health Planner Coway memetakan prospek, memantau funnel penjualan, dan melipatgandakan closing rate.',
    targetProfile: ['JASA', 'RETAIL/UMKM'],
    targetGoal: [
      'jadi agen',
      'tingkatkan penjualan',
      'kelola prospek',
      'closing lebih banyak',
      'tambah penghasilan sebagai agen',
    ],
    problems: [
      'Sulit melacak prospek yang sudah dihubungi',
      'Tidak ada sistem follow-up yang terstruktur',
      'Closing rate rendah karena tidak ada data performa',
    ],
    triggerKeywords: [
      'coway', 'agen coway', 'health planner',
      'produk coway', 'filter coway',
      'agen kesehatan', 'sales kesehatan', 'agen air',
    ],
    excludeProfile: ['CREATOR', 'PELAJAR', 'KARYAWAN', 'F&B'],

    offers: [
      {
        id: 'coway-partner',
        label: 'Partner',
        description: 'Akses sistem Coway Logaritma khusus untuk Health Planner terdaftar.',
        price: 'Partner Logaritma',
        priceAmount: 0,
        currency: 'IDR',
        billingType: 'partner',
        revenueType: 'partner',
        destinationUrl: 'https://coway.logaritma.id',
        cta: 'Masuk ke Sistem Coway',
        highlighted: true,
        active: true,
      },
    ],

    price: 'Partner Logaritma',
    destinationUrl: 'https://coway.logaritma.id',
    cta: 'Masuk ke Sistem Coway',
    color: 'sky',
    active: true,
  },

  // ── 3. Meta Ads ──────────────────────────────────────────────────────────────
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
      'generate leads',
    ],
    problems: [
      'Tidak ada pelanggan baru yang masuk secara konsisten',
      'Mengandalkan pelanggan lama saja tidak cukup',
      'Tidak tahu cara beriklan yang efisien dan tidak boros',
      'Sudah coba iklan sendiri tapi hasilnya tidak optimal',
    ],
    triggerKeywords: [
      'iklan', 'ads', 'facebook', 'instagram', 'meta',
      'promosi berbayar', 'beriklan', 'jangkauan',
      'leads', 'pelanggan baru', 'digital marketing',
    ],

    offers: [
      {
        id: 'meta-ads-service',
        label: 'Layanan Ads',
        description: 'Pengelolaan iklan Meta bulanan oleh tim Logaritma.',
        price: 'Mulai Rp 1.500.000/bln',
        priceAmount: 1500000,
        currency: 'IDR',
        billingType: 'service',
        revenueType: 'direct',
        destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Meta%20Ads%20Logaritma',
        cta: 'Konsultasi Meta Ads',
        ctaSecondary: 'Lihat contoh hasil',
        highlighted: true,
        active: true,
      },
    ],

    price: 'Mulai Rp 1.500.000/bln',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Meta%20Ads%20Logaritma',
    cta: 'Konsultasi Meta Ads',
    color: 'indigo',
    active: true,
  },

  // ── 4. Landing Page ───────────────────────────────────────────────────────────
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
      'jualan online lebih serius',
      'tingkatkan konversi',
      'tampil profesional di internet',
    ],
    problems: [
      'Tidak punya tempat online yang bisa menjelaskan produk/jasa secara lengkap',
      'Link bio tidak cukup untuk meyakinkan calon pelanggan',
      'Pembeli masih ragu karena tidak ada halaman yang meyakinkan',
    ],
    triggerKeywords: [
      'website', 'landing page', 'web', 'online shop', 'toko online',
      'jualan online', 'halaman produk', 'konversi',
    ],

    offers: [
      {
        id: 'landing-page-basic',
        label: 'One-Time',
        description: 'Landing page profesional, bayar sekali, milik selamanya.',
        price: 'Mulai Rp 500.000',
        priceAmount: 500000,
        currency: 'IDR',
        billingType: 'one-time',
        revenueType: 'direct',
        destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Landing%20Page%20Logaritma',
        cta: 'Pesan Landing Page',
        ctaSecondary: 'Lihat contoh landing page',
        highlighted: true,
        active: true,
      },
    ],

    price: 'Mulai Rp 500.000',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Landing%20Page%20Logaritma',
    cta: 'Pesan Landing Page',
    color: 'violet',
    active: true,
  },

  // ── 5. Affiliate ──────────────────────────────────────────────────────────────
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
      'rekomendasikan produk kepada orang lain',
      'monetisasi audiens',
    ],
    problems: [
      'Butuh penghasilan tambahan tanpa modal besar',
      'Punya audiens atau jaringan tapi belum tahu cara monetisasinya',
      'Ingin bisnis sampingan yang tidak butuh stok barang',
    ],
    triggerKeywords: [
      'affiliate', 'komisi', 'passive income', 'penghasilan tambahan',
      'referral', 'sampingan', 'tanpa modal', 'monetisasi audiens',
    ],
    excludeProfile: ['RETAIL/UMKM', 'F&B', 'PELAJAR'],

    offers: [
      {
        id: 'affiliate-standard',
        label: 'Mitra Affiliate',
        description: 'Dapatkan komisi 10–20% dari setiap referral yang berhasil.',
        price: 'Komisi 10–20%',
        priceAmount: 0,
        currency: 'IDR',
        billingType: 'commission',
        revenueType: 'commission',
        commissionRate: 15,
        destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20ingin%20bergabung%20sebagai%20Affiliate%20Logaritma',
        cta: 'Daftar Affiliate',
        ctaSecondary: 'Pelajari program affiliate',
        highlighted: true,
        active: true,
      },
    ],

    price: 'Komisi 10–20%',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20ingin%20bergabung%20sebagai%20Affiliate%20Logaritma',
    cta: 'Daftar Affiliate',
    color: 'emerald',
    active: true,
  },

  // ── 6. Konsultasi ─────────────────────────────────────────────────────────────
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

    offers: [
      {
        id: 'konsultasi-sesi',
        label: 'Per Sesi',
        description: 'Sesi 1-on-1 via WhatsApp/Zoom, 60 menit, langsung actionable.',
        price: 'Mulai Rp 250.000/sesi',
        priceAmount: 250000,
        currency: 'IDR',
        billingType: 'service',
        revenueType: 'direct',
        destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20ingin%20Konsultasi%20Bisnis%20dengan%20Logaritma',
        cta: 'Jadwalkan Konsultasi',
        ctaSecondary: 'Pelajari proses konsultasi',
        highlighted: true,
        active: true,
      },
    ],

    price: 'Mulai Rp 250.000/sesi',
    destinationUrl: 'https://wa.me/6285157621855?text=Halo%2C%20saya%20ingin%20Konsultasi%20Bisnis%20dengan%20Logaritma',
    cta: 'Jadwalkan Konsultasi',
    color: 'amber',
    active: true,
  },
];
