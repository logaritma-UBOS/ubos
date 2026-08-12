'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Store, Link as LinkIcon, QrCode, Phone, ExternalLink, Save, Copy, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function OnlineStoreSettings({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;

  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isStoreEnabled, setIsStoreEnabled] = useState(true);
  const [storeWaNumber, setStoreWaNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setMerchant(data);
          // If the columns don't exist in Supabase, these will be undefined, so we fallback
          setIsStoreEnabled(data.online_store_enabled !== false);
          setStoreWaNumber(data.store_wa_number || data.whatsapp || '');
        }
      } catch (err) {
        console.error('Error fetching merchant:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMerchant();
  }, []);

  const handleSave = async () => {
    if (!merchant) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          online_store_enabled: isStoreEnabled,
          store_wa_number: storeWaNumber
        })
        .eq('id', merchant.id);
        
      if (error) throw error;
      
      toast.success('Pengaturan Toko Online berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('column "online_store_enabled" of relation "merchants" does not exist')) {
        toast.error('Gagal: Kolom database belum ditambahkan. Silakan hubungi admin untuk menjalankan migrasi.');
      } else {
        toast.error('Gagal menyimpan pengaturan.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  // Use absolute URL for the storefront
  const storeUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/store/${slug}` 
    : `https://logaritma.id/store/${slug}`;
    
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(storeUrl)}&margin=10`;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-32 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="text-primary" size={28} />
          Pengaturan Toko Online
        </h1>
        <p className="text-slate-500 mt-2">
          Kelola halaman toko publik Anda untuk menerima pesanan secara online (Storefront).
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LinkIcon size={20} className="text-slate-400" /> Tautan Toko Anda
            </h2>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">URL Publik</p>
                <p className="text-slate-800 font-medium truncate w-full">{storeUrl}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(storeUrl);
                    toast.success('Link toko berhasil disalin!');
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  <Copy size={16} /> Salin
                </button>
                <a 
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
                >
                  <ExternalLink size={16} /> Buka
                </a>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800">
              <AlertCircle size={20} className="shrink-0 text-blue-600 mt-0.5" />
              <p className="text-sm">
                Bagikan link ini di bio Instagram, TikTok, atau ke pelanggan setia Anda agar mereka bisa langsung memesan tanpa menginstal aplikasi.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Settings size={20} className="text-slate-400" /> Konfigurasi Toko
            </h2>
            
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-800">Status Toko Online</p>
                <p className="text-sm text-slate-500">Tentukan apakah pengunjung publik bisa mengakses toko Anda</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isStoreEnabled}
                  onChange={(e) => setIsStoreEnabled(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Nomor WhatsApp Penerima Order</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+62</span>
                <input 
                  type="tel" 
                  value={storeWaNumber}
                  onChange={e => setStoreWaNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="81234567890" 
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Order dari publik akan dikirim langsung ke nomor ini dalam format teks rapi. Biarkan kosong jika tidak ingin menerima order via WhatsApp langsung.
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <Save size={16} />}
                Simpan Pengaturan
              </button>
            </div>
          </div>
          
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
              <QrCode size={20} className="text-slate-400" /> QR Code Toko
            </h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center mb-4 mx-auto w-48 h-48">
              {/* Using external API for quick QR generation without heavy libs */}
              <img src={qrCodeUrl} alt="Store QR Code" className="w-full h-full object-contain mix-blend-multiply" crossOrigin="anonymous" />
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Unduh dan cetak QR Code ini untuk diletakkan di kasir atau meja Anda. Pelanggan cukup *scan* untuk memesan.
            </p>
            
            <a 
              href={qrCodeUrl}
              download="QRCode_Toko.png"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl text-sm transition-colors"
            >
              Unduh QR Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
