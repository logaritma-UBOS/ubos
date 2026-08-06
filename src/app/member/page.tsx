'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Target, AlertTriangle, ArrowRight, Package, Wallet, CheckCircle2, MonitorPlay, LogOut, Megaphone, Printer, Handshake, MessageCircle, X, Loader2, ShoppingBag, Shirt, Lock, Home, Wrench, Star, BookOpen, HelpCircle, Info, Flame, Copy, FileText, Download, Camera, Users, Video, ShoppingCart, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  discountPrice?: number;
  badge: string;
  thumbnail: string;
  description: string;
  features: string[];
  ctaType: 'whatsapp' | 'checkout' | 'link' | 'modul_fb';
  ctaUrl: string;
}

const modulItems: ProductItem[] = [
  {
    id: 'm1',
    title: 'UBOS F&B',
    category: 'Aplikasi Kasir',
    price: 99000,
    discountPrice: 49000,
    badge: 'READY',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
    description: 'Aplikasi Kasir F&B Anti-Bocor & Pengunci Profit. Khusus dibuat untuk memisahkan uang modal belanja besok dan profit bersih hari ini.',
    features: ['Set Target Profit Otomatis', 'Catat Dine-in/Online', 'Hitung Komisi Ojol Otomatis', 'Manajemen Stok Anti Dead-Stock', 'Asisten AI Logaritma'],
    ctaType: 'modul_fb',
    ctaUrl: '/ubos'
  },
  {
    id: 'm2',
    title: 'UBOS Percetakan & Fotokopi',
    category: 'Kontrol Antrean',
    price: 150000,
    discountPrice: 75000,
    badge: 'VVIP TRIAL',
    thumbnail: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?q=80&w=600&auto=format&fit=crop',
    description: 'Tools Kontrol Antrean & HPP Kertas. Kalkulator HPP bahan, estimasi harga cepat, dan manajemen antrean antinumpuk.',
    features: ['Kalkulator HPP Kertas', 'Estimasi Harga Otomatis', 'Manajemen Slot Antrean', 'Tracking Status Pesanan'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20ingin%20akses%20VVIP%20Trial%20UBOS%20Percetakan'
  },
  {
    id: 'm3',
    title: 'UBOS Toko & Ritel',
    category: 'Manajemen Stok',
    price: 120000,
    discountPrice: 60000,
    badge: 'WAITING LIST',
    thumbnail: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=600&auto=format&fit=crop',
    description: 'Manajemen Stok Anti Dead-Stock. Sistem inventaris anti-stok mati, cetak barcode, dan batas belanja harian.',
    features: ['Cetak Barcode Otomatis', 'Tracking Stok Real-time', 'Alert Stok Menipis', 'Laporan Laba/Rugi Harian'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20masukkan%20saya%20ke%20Waiting%20List%20UBOS%20Ritel'
  },
  {
    id: 'm4',
    title: 'UBOS Laundry & Jasa',
    category: 'Tracking & Nota',
    price: 110000,
    discountPrice: 55000,
    badge: 'WAITING LIST',
    thumbnail: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=600&auto=format&fit=crop',
    description: 'Tracking Slot & Nota Otomatis. Pelacak status cucian, sistem nota WhatsApp otomatis, dan hitung komisi staf.',
    features: ['Nota WhatsApp Otomatis', 'Tracking Status Cucian', 'Hitung Komisi Karyawan', 'Manajemen Slot Mesin'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20masukkan%20saya%20ke%20Waiting%20List%20UBOS%20Laundry'
  }
];

const affiliateItems: ProductItem[] = [
  {
    id: 'a1',
    title: 'Program Pasif Komisi Logaritma',
    category: 'Affiliate',
    price: 0,
    badge: 'HOT',
    thumbnail: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=600&auto=format&fit=crop',
    description: 'Rekomendasikan UBOS ke sesama pemilik usaha. Dapatkan komisi 20% setiap kali teman Anda mengaktifkan modul.',
    features: ['Komisi 20% Per Referral', 'Dashboard Tracking Komisi Real-time', 'Materi Promosi Gratis Lengkap', 'Pencairan Dana Instan'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20tertarik%20join%20Program%20Affiliate'
  }
];

const servicesItems: ProductItem[] = [
  {
    id: 's1',
    title: 'Cetak Stiker & Spanduk Custom',
    category: 'Brand Support',
    price: 150000,
    badge: 'POPULAR',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop',
    description: 'Tingkatkan brand awareness usahamu. Melayani cetak stiker glossy, banner toko, spanduk, hingga packaging custom.',
    features: ['Desain Gratis (S&K Berlaku)', 'Bahan Berkualitas Tinggi', 'Pengerjaan Cepat (2-3 Hari)', 'Bisa Custom Ukuran'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20pesan%20Cetak%20Stiker/Spanduk'
  },
  {
    id: 's2',
    title: 'Jasa Foto Produk / Menu Pro',
    category: 'Creative Service',
    price: 350000,
    badge: 'PREMIUM',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    description: 'Foto menu dan produk yang bikin pelanggan ngiler. Dikerjakan oleh tim fotografer profesional F&B dan ritel.',
    features: ['Pencahayaan Studio Professional', 'Properti Foto Disediakan', '5 Foto High-Res Hasil Edit', 'Lisensi Komersial Penuh'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20tertarik%20dengan%20Jasa%20Foto%20Produk'
  },
  {
    id: 's3',
    title: 'Konsultasi Setup POS On-Site',
    category: 'Tech Support',
    price: 250000,
    badge: 'EXPERT',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
    description: 'Tim kami datang ke lokasimu untuk bantu setup sistem kasir, input menu, alat kasir, dan training karyawan secara langsung.',
    features: ['Kunjungan Langsung (Jabodetabek)', 'Training Karyawan Hingga Bisa', 'Setup Printer & Hardware Kasir', 'Input Menu & HPP Massal'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20request%20Konsultasi%20Setup%20POS%20On-Site'
  }
];

const edukasiItems: ProductItem[] = [
  {
    id: 'e1',
    title: 'E-Book: Mengunci Profit UMKM',
    category: 'E-Book / PDF',
    price: 99000,
    discountPrice: 49000,
    badge: 'BEST SELLER',
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    description: 'Bongkar rahasia mengunci target profit bersih bulanan tanpa ribet memikirkan potongan platform dan kebocoran stok.',
    features: ['Teknik Menentukan HPP', 'Strategi Anti Dead-Stock', 'Cara Pisahkan Uang Pribadi & Bisnis', 'Bonus Template Excel Keuangan'],
    ctaType: 'whatsapp',
    ctaUrl: 'https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20pesan%20E-Book%20Mengunci%20Profit'
  },
  {
    id: 'e2',
    title: 'Panduan Masterclass POS Kasir',
    category: 'Video Tutorial',
    price: 0,
    badge: 'FREE',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
    description: 'Kumpulan video tutorial lengkap cara mahir menggunakan fitur-fitur UBOS Logaritma dalam 30 menit.',
    features: ['Akses Seumur Hidup', 'Materi Lengkap dari Basic ke Pro', 'Tips Trik AI Logaritma'],
    ctaType: 'link',
    ctaUrl: '#'
  }
];

const faqData = {
  kasir: [
    { q: 'Apakah UBOS bisa jalan tanpa internet (Offline)?', a: 'Bisa! Kasir UBOS tetap bisa digunakan saat internet mati. Data transaksi akan otomatis tersinkronisasi ke server saat koneksi internet kembali normal.' },
    { q: 'Bagaimana cara update stok menu yang habis?', a: 'Buka modul F&B > Pilih menu Inventori > Pilih bahan baku/menu > Klik Sesuaikan Stok. Stok akan langsung update secara real-time di kasir.' }
  ],
  margin: [
    { q: 'Bagaimana Margin Guard menghitung HPP otomatis?', a: 'Margin Guard membaca resep yang sudah kamu input. Jika harga bahan baku di pasar naik, sistem otomatis memberikan notifikasi dan menyarankan harga jual baru.' },
    { q: 'Bagaimana cara memisahkan komisi Gofood/Grabfood?', a: 'Gunakan fitur Markup Harga Platform di pengaturan menu. Sistem akan otomatis memisahkan komisi 20% milik aplikator sehingga profit bersihmu tetap utuh.' }
  ],
  akun: [
    { q: 'Ganti HP atau Browser, kenapa disuruh daftar lagi?', a: 'Tenang, data Anda aman. Pastikan memasukkan nomor WhatsApp yang sama. Anda akan diarahkan ke halaman login untuk memasukkan password, bukan mendaftar ulang.' },
    { q: 'Bagaimana cara perpanjang lisensi member?', a: 'Klik tombol "Perpanjang Lisensi" di halaman depan Member Area, lakukan pembayaran, dan akun Anda akan aktif kembali secara instan.' },
    { q: 'Saya lupa password, bagaimana cara resetnya?', a: 'Saat ini reset password bisa dibantu oleh tim CS kami. Silakan klik tombol "Chat CS Admin" di bawah dan informasikan nomor WhatsApp Anda.' }
  ]
};

export default function MemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [waitingCategory, setWaitingCategory] = useState('');
  const [waitingForm, setWaitingForm] = useState({ nama: '', whatsapp: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'modul' | 'affiliate' | 'services' | 'edukasi' | 'bantuan'>('modul');
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [faqActiveTab, setFaqActiveTab] = useState<'kasir' | 'margin' | 'akun'>('kasir');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          let sessionData: any = null;

          try {
            const waSession = localStorage.getItem('wa_member_session');
            if (waSession) {
              sessionData = JSON.parse(waSession);
            }
          } catch (_) {}

          if (!sessionData) {
            try {
              const leadStr = localStorage.getItem('ubos_lead');
              if (leadStr) {
                const leadData = JSON.parse(leadStr);
                sessionData = {
                  nama_usaha: leadData.nama_usaha || '',
                  nama_pemilik: leadData.owner_name || leadData.nama_pemilik || '',
                  no_wa: leadData.whatsapp || '',
                  kategori: leadData.kategori_usaha || 'Kuliner & F&B',
                };
              }
            } catch (_) {}
          }

          if (sessionData && isMounted) {
            setMerchant(sessionData);
            setTrialDaysLeft(7);
            setLoading(false);
            return;
          }

          if (isMounted) {
            setLoading(false);
            router.push('/member/login');
          }
          return;
        }

        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (merchantData && isMounted) {
          setMerchant(merchantData);
          
          let expiresDate = new Date();
          if (merchantData.trial_expires_at) {
            expiresDate = new Date(merchantData.trial_expires_at);
          } else if (merchantData.created_at) {
            expiresDate = new Date(merchantData.created_at);
            expiresDate.setDate(expiresDate.getDate() + 7);
          }
          
          const now = new Date();
          const diff = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(diff > 0 ? diff : 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === 'true') {
        setShowPaywallModal(true);
      }
    }

    return () => { isMounted = false; };
  }, [router]);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer: document.referrer,
            utm_source: urlParams.get('utm_source') || 'member_area',
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            path: '/member',
          })
        });
      } catch (_) { /* silent */ }
    };
    trackVisitor();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handlePayWithMayar = async () => {
    setIsCreatingPayment(true);
    try {
      const res = await fetch('/api/mayar/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant?.id || merchant?.no_wa || merchant?.whatsapp || null,
          name: merchant?.nama_usaha || merchant?.owner_name || merchant?.nama_pemilik,
          phone: merchant?.whatsapp || merchant?.no_wa,
          email: merchant?.email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan saat memproses pembayaran');

      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Gagal mendapatkan link pembayaran');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleWaitingListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('waiting_list').insert([
        {
          nama_usaha: waitingForm.nama,
          whatsapp: waitingForm.whatsapp,
          kategori_usaha: waitingCategory
        }
      ]);
      if (error) throw error;
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModulNavigation = async (category: string) => {
    if (!merchant?.user_id) {
      const phone = (merchant?.no_wa || merchant?.whatsapp || '').replace(/\D/g, '');
      if (phone) {
        try {
          const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(phone)}`);
          const result = await res.json();
          if (result.found) {
            toast.info("Silakan masukkan password untuk mengakses modul.");
            router.push(`/auth?mode=login`);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
      toast.error("Silakan login atau daftar untuk menggunakan modul ini.", {
        description: "Akses terbatas khusus member terdaftar.",
        icon: <Lock className="w-5 h-5 text-amber-500" />
      });
      router.push(`/auth?mode=register&category=${encodeURIComponent(category)}`);
      return;
    }
    
    const slug = (merchant.nama_usaha || 'merchant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  const ProductCard = ({ item }: { item: ProductItem }) => (
    <div 
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow group relative"
      onClick={() => setSelectedProduct(item)}
    >
      <div className="h-40 w-full relative overflow-hidden bg-slate-100">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
          {item.badge}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-bold text-slate-400 mb-1">{item.category}</p>
        <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mb-3">{item.title}</h4>
        
        <div className="mt-auto flex flex-col gap-1">
          {item.price === 0 ? (
            <p className="text-emerald-500 font-black text-lg">GRATIS</p>
          ) : (
            <>
              {item.discountPrice !== undefined && (
                <p className="text-slate-400 text-xs line-through font-medium">{formatPrice(item.price)}</p>
              )}
              <p className="text-primary font-black text-lg">
                {formatPrice(item.discountPrice !== undefined ? item.discountPrice : item.price)}
              </p>
            </>
          )}
        </div>
        <button className="mt-4 w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
          Lihat Detail <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 selection:bg-primary/20 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-4xl mx-auto min-h-screen bg-slate-50 pb-28 shadow-sm border-x border-slate-100 relative">
      
      {/* Portal Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
        <div className="px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/images/logo-logaritma.png" alt="Logaritma Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-slate-800 tracking-tight text-xl leading-none">LOGARITMA.ID</span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wide">Member Area</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-danger transition-colors flex items-center gap-2 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      <main className="px-4 py-4 space-y-4">
        
        {/* Compact Sub-Header */}
        <div className="flex items-center justify-between p-4 bg-blue-600 rounded-2xl text-white shadow-md gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg shrink-0 shadow-inner">
              {trialDaysLeft > 0 ? '🎁' : '🔒'}
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm md:text-base leading-tight truncate max-w-[140px] md:max-w-[200px]">
                Halo, {merchant?.nama_usaha || merchant?.owner_name || 'Member'}!
              </p>
              <button
                onClick={() => setShowPaywallModal(true)}
                className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 transition-colors ${
                  trialDaysLeft > 0
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                }`}
              >
                {trialDaysLeft > 0 ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Aktif – Sisa {trialDaysLeft} Hari</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Lisensi Expired</>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPaywallModal(true)}
            className="shrink-0 text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-2 rounded-xl transition-transform active:scale-95 shadow-md flex items-center gap-1 whitespace-nowrap"
          >
            ⚡ Upgrade Rp 49.000
          </button>
        </div>

        {/* Tabbed Content */}
        <div className="space-y-6 pt-2">

          {activeTab === 'modul' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Katalog Modul UBOS</h2>
                <p className="text-slate-500 text-sm font-medium">Temukan modul yang cocok untuk usahamu.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modulItems.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Program Kemitraan</h2>
                <p className="text-slate-500 text-sm font-medium">Hasilkan komisi berulang dengan referral.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {affiliateItems.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Ecosystem Services</h2>
                <p className="text-slate-500 text-sm font-medium">Layanan pengembang bisnis dari Logaritma.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicesItems.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {activeTab === 'edukasi' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Logaritma Academy</h2>
                <p className="text-slate-500 text-sm font-medium">Tingkatkan skill dan pengetahuan bisnis Anda.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {edukasiItems.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {/* Tab Bantuan stays intact */}
          {activeTab === 'bantuan' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Pusat Bantuan</h2>
                <p className="text-slate-500 text-sm font-medium">Tim support siap membantu kendala Anda.</p>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[9px] font-black uppercase tracking-wider text-blue-200 mb-1">Priority Support</div>
                    <h3 className="text-xl font-black text-white leading-tight">Butuh Bantuan<br/>Teknis?</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-20 -rotate-12">
                    <HelpCircle size={80} className="text-white" />
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-medium mb-5">
                    Tim support Logaritma siap membantu pertanyaan teknis, kendala kasir, dan penyesuaian akun Anda.
                  </p>
                  
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20butuh%20bantuan%20terkait%20akun%20member%20saya..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><MessageCircle size={18} /> Tanya CS via WhatsApp</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </a>

                    <button 
                      onClick={() => setIsCommunityModalOpen(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><Users size={18} className="text-blue-500" /> Gabung Komunitas Owner</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>

                    <button 
                      onClick={() => setIsFAQModalOpen(true)}
                      className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-3"><HelpCircle size={18} className="text-purple-500" /> Baca FAQ & Solusi Kendala</span>
                      <ArrowRight size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] w-full max-w-md md:max-w-4xl border-x border-slate-100">
        <div className="flex items-stretch h-16">
          {([
            { key: 'modul',    icon: Home,      label: 'Modul'    },
            { key: 'affiliate', icon: Star,       label: 'Affiliate' },
            { key: 'services', icon: Wrench,    label: 'Services' },
            { key: 'edukasi',  icon: BookOpen,  label: 'Edukasi'  },
            { key: 'bantuan',  icon: HelpCircle, label: 'Bantuan' },
          ] as { key: typeof activeTab; icon: any; label: string }[]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                activeTab === key
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {activeTab === key && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />}
              <Icon size={20} strokeWidth={activeTab === key ? 2.5 : 2} />
              <span className={`text-[10px] font-${activeTab === key ? 'black' : 'bold'} leading-none`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Product Detail Modal / Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col relative animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 custom-scrollbar">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 z-10 transition-colors">
              <X size={18} />
            </button>
            
            {/* Modal Image Header */}
            <div className="h-48 sm:h-56 w-full relative">
              <img src={selectedProduct.thumbnail} alt={selectedProduct.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md mb-2">
                  {selectedProduct.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{selectedProduct.title}</h3>
                <p className="text-slate-300 text-sm font-bold">{selectedProduct.category}</p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Price Row */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <p className="text-slate-500 font-bold text-sm">Harga Spesial</p>
                <div className="text-right">
                  {selectedProduct.price === 0 ? (
                    <p className="text-2xl font-black text-emerald-500">GRATIS</p>
                  ) : (
                    <>
                      {selectedProduct.discountPrice !== undefined && (
                        <p className="text-slate-400 text-xs line-through font-medium">{formatPrice(selectedProduct.price)}</p>
                      )}
                      <p className="text-2xl font-black text-primary">
                        {formatPrice(selectedProduct.discountPrice !== undefined ? selectedProduct.discountPrice : selectedProduct.price)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Features List */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Apa yang Anda Dapatkan:</h4>
                <ul className="space-y-2.5">
                  {selectedProduct.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                {selectedProduct.ctaType === 'whatsapp' ? (
                  <a href={selectedProduct.ctaUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Hubungi via WhatsApp
                  </a>
                ) : selectedProduct.ctaType === 'modul_fb' ? (
                  trialDaysLeft > 0 ? (
                    <button onClick={() => handleModulNavigation('kuliner')} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <ShoppingBag size={18} /> Buka Modul F&B Sekarang <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button onClick={() => setShowPaywallModal(true)} className="w-full bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2">
                      <Lock size={16} className="text-amber-400" /> Lisensi Expired
                    </button>
                  )
                ) : (
                  <a href={selectedProduct.ctaUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    Checkout / Lihat Selengkapnya <ArrowRight size={18} />
                  </a>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Paywall Renewal Modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col border border-slate-200 relative custom-scrollbar">
            
            <button onClick={() => setShowPaywallModal(false)} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 z-10 transition-colors">
              <X size={18} />
            </button>
            
            <div className="p-6 md:p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-1 rotate-12 shadow-sm border border-amber-200">
                <Lock size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {trialDaysLeft > 0 ? 'Upgrade Premium UBOS' : 'Masa Coba Gratis Anda Telah Berakhir'}
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">Tetap kunci batas belanja harian, pantau profit bersih, dan operasionalkan kasir toko Anda tanpa henti.</p>
              
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mt-4">
                <p className="text-xs font-bold text-blue-700 leading-relaxed">
                  <Info className="w-4 h-4 text-blue-600 inline mr-1 mb-0.5" /> Sisa hari aktif trial/lisensi Anda saat ini tidak akan hangus, melainkan langsung otomatis ditambahkan <span className="text-blue-800 font-black bg-blue-200 px-1 rounded">+30 hari</span> setelah pembayaran selesai.
                </p>
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-red-500/20 whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 text-white inline" /> Diskon Khusus UMKM 50%
                </div>
                
                <p className="text-slate-400 font-bold line-through mt-2 mb-0">Rp 99.000/bulan</p>
                <div className="flex items-end justify-center gap-1 text-primary">
                  <span className="text-3xl font-black">Rp 49.000</span>
                  <span className="font-bold mb-1">/ bulan</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  onClick={handlePayWithMayar}
                  disabled={isCreatingPayment}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 px-6 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                >
                  {isCreatingPayment ? (
                    <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                  ) : (
                    <><Wallet size={20} /> Bayar Otomatis Rp 49.000 (QRIS/e-Wallet/VA)</>
                  )}
                </button>
                
                <a 
                  href={`https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20masa%20aktif%20trial%20untuk%20toko%20${encodeURIComponent(merchant?.nama_usaha || merchant?.owner_name || 'saya')}%20sudah%20habis.%20Saya%20ingin%20perpanjang%20Lisensi%20Premium%20UBOS%20paket%20promo%20Rp%2049.000%2Fbulan.%20Bagaimana%20alur%20pembayarannya%3F`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> Konsultasi / Transfer Manual via WA
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ & Troubleshooting Modal */}
      {isFAQModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 pb-6 border-b border-slate-100 flex-shrink-0 relative">
              <button onClick={() => { setIsFAQModalOpen(false); setFaqSearchTerm(''); }} className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <X size={18} />
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Pusat Solusi Cepat & FAQ UBOS 💡</h3>
                  <p className="text-sm text-slate-500 font-medium">Jawaban praktis seputar operasional kasir, Margin Guard, hingga pengelolaan akun.</p>
                </div>
              </div>
              <div className="mt-6 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari solusi atau kata kunci masalah..." 
                  value={faqSearchTerm}
                  onChange={(e) => setFaqSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
              </div>
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-4 pb-1">
                {[
                  { id: 'kasir', label: 'Kasir & Stok' },
                  { id: 'margin', label: 'Margin Guard & HPP' },
                  { id: 'akun', label: 'Akun & Akses' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setFaqActiveTab(tab.id as any); setExpandedFAQ(null); }}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors ${faqActiveTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
              <div className="space-y-3">
                {faqData[faqActiveTab]
                  .filter(faq => faq.q.toLowerCase().includes(faqSearchTerm.toLowerCase()) || faq.a.toLowerCase().includes(faqSearchTerm.toLowerCase()))
                  .map((faq, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
                      <button 
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4"
                      >
                        <span className="font-bold text-slate-900 text-sm">{faq.q}</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${expandedFAQ === index ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                          {expandedFAQ === index ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>
                      {expandedFAQ === index && (
                        <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-50 mt-2 bg-slate-50/30">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-white flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 font-medium">Masih belum menemukan jawaban?</p>
              <button 
                onClick={() => {
                  window.open('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20butuh%20bantuan%20teknis%20dan%20ingin%20bertanya...', '_blank');
                  setIsFAQModalOpen(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-2"
              >
                <MessageCircle size={18} />
                Chat CS Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Invitation Modal */}
      {isCommunityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsCommunityModalOpen(false)} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 z-10 transition-colors">
              <X size={18} />
            </button>
            <div className="p-6 md:p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Selamat Datang di Circle Profit Owner F&B! 🚀</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6">
                Bergabunglah dengan pemilik usaha kuliner lainnya! Tempat berbagi strategi HPP, bedah kasus kebocoran kasir, hingga kolaborasi sesama owner F&B agar bisnis tumbuh konsisten.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">Forum diskusi strategi HPP & Margin Guard</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">Update fitur eksklusif UBOS Logaritma</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">Akses langsung ke tim developer & mentor</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  window.open('https://chat.whatsapp.com/Jko4cZMWXca3aLhlR94shj', '_blank');
                  setIsCommunityModalOpen(false);
                }}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Gabung Grup WA Sekarang <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
