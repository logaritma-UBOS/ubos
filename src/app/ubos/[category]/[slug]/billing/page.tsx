'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { ShieldCheck, Wallet, Loader2, MessageCircle, Flame, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AIBanner from '@/components/AIBanner';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', hover: 'hover:bg-blue-600' },
};

export default function BillingPage() {
  const router = useRouter();
  const params = useParams();
  const theme = themeColorMap[(params.category as string)?.toLowerCase()] || themeColorMap.default;
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
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
        const merchantStatus = merchantData.status || 'Trial';
        
        if (merchantStatus === 'Premium' && merchantData.expired_at) {
          expiresDate = new Date(merchantData.expired_at);
        } else if (merchantData.trial_expires_at) {
          expiresDate = new Date(merchantData.trial_expires_at);
        } else if (merchantData.created_at) {
          expiresDate = new Date(merchantData.created_at);
          expiresDate.setDate(expiresDate.getDate() + 7);
        }
        
        const now = new Date();
        const diff = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(diff > 0 ? diff : 0);
        setIsExpired(diff <= 0);
      }
      if (isMounted) setLoading(false);
    };
    fetchData();
    return () => { isMounted = false; };
  }, [router]);

  const handlePayWithMayar = async () => {
    setIsCreatingPayment(true);
    try {
      const res = await fetch('/api/mayar/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant?.id || merchant?.no_wa || merchant?.whatsapp || null,
          name: merchant?.nama_usaha || merchant?.owner_name || merchant?.nama_pemilik || 'Member',
          phone: merchant?.whatsapp || merchant?.no_wa || '',
          email: merchant?.email || ''
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-10 bg-slate-50 min-h-screen">
      {/* Header Bersih */}
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 w-full mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className={theme.text} size={28} />
            Langganan & Billing
          </h1>
          <p className="text-slate-500 mt-1">Kelola status lisensi dan masa aktif aplikasi Anda.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <AIBanner />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-20">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-10 text-center">
          
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-200">
            {isExpired ? (
              <ShieldCheck className="w-10 h-10 text-rose-500" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            {isExpired ? 'Masa Aktif Telah Habis' : 'Status Lisensi Aktif'}
          </h2>
          
          {isExpired ? (
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Masa uji coba / berlangganan Anda telah berakhir. Untuk melanjutkan akses ke POS, Stok, dan fitur operasional lainnya, silakan perpanjang lisensi Anda.
            </p>
          ) : (
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Anda masih dalam masa {merchant?.status === 'Premium' ? 'Premium' : 'Trial'}. 
              Tersisa <strong className="text-emerald-600">{trialDaysLeft} hari</strong> lagi sebelum masa aktif berakhir.
            </p>
          )}

          <div className="max-w-md mx-auto border-t border-slate-200 pt-8 mt-4">
            <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 relative mb-6">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-rose-500/20 whitespace-nowrap z-10">
                <Flame className="w-3.5 h-3.5 text-white inline" /> Diskon Khusus UMKM 50%
              </div>
              
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 mb-2">Lisensi Premium</h3>
              <p className="text-slate-400 font-bold line-through mb-0 text-sm">Rp 99.000/bulan</p>
              <div className="flex items-end justify-center gap-1 text-slate-900">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">Rp 49.000</span>
                <span className="font-bold mb-1 text-slate-600">/ bulan</span>
              </div>
              
              <ul className="text-left text-sm text-slate-600 mt-6 space-y-3">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Buka Kunci Semua Modul (POS, Stok, Kas)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Margin Guard AI Unlimited</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Dukungan CS Prioritas</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handlePayWithMayar}
                disabled={isCreatingPayment}
                className="btn-gradient-primary w-full font-black py-4 px-6 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isCreatingPayment ? (
                  <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                ) : (
                  <><Wallet size={20} /> Bayar Otomatis Rp 49.000 (QRIS/Transfer)</>
                )}
              </button>
              
              <a 
                href={`https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20masa%20aktif%20trial%20untuk%20toko%20${encodeURIComponent(merchant?.nama_usaha || merchant?.owner_name || 'saya')}%20sudah%20habis.%20Saya%20ingin%20perpanjang%20Lisensi%20Premium%20UBOS%20paket%20promo%20Rp%2049.000%2Fbulan.%20Bagaimana%20alur%20pembayarannya%3F`}
                target="_blank" rel="noopener noreferrer"
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} className="text-emerald-500" /> Konsultasi / Manual via WA
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
