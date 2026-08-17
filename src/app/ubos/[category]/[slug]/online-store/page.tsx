'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Store, Link as LinkIcon, QrCode, ExternalLink, Save, Copy, AlertCircle, Settings, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', hover: 'hover:bg-blue-600' },
};

export default function OnlineStoreSettings({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const resolvedParams = use(params);
  const { slug, category } = resolvedParams;
  
  const theme = themeColorMap[category?.toLowerCase()] || themeColorMap.default;

  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isStoreEnabled, setIsStoreEnabled] = useState(true);
  const [storeWaNumber, setStoreWaNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New Profile Fields
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [slogan, setSlogan] = useState('');
  const [deskripsiToko, setDeskripsiToko] = useState('');
  const [address, setAddress] = useState('');
  const [gmapsLink, setGmapsLink] = useState('');

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
          setBannerUrl(data.banner_url || '');
          setSlogan(data.slogan || '');
          setDeskripsiToko(data.deskripsi_toko || '');
          setAddress(data.address || data.alamat || '');
          setGmapsLink(data.gmaps_link || data.address_link || '');
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
      let finalBannerUrl = bannerUrl;
      
      // Upload new banner to Cloudinary
      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          finalBannerUrl = data.secure_url;
          setBannerUrl(data.secure_url);
        }
      }

      const { error } = await supabase
        .from('merchants')
        .update({
          online_store_enabled: isStoreEnabled,
          store_wa_number: storeWaNumber,
          banner_url: finalBannerUrl,
          slogan: slogan,
          deskripsi_toko: deskripsiToko,
          address: address,
          gmaps_link: gmapsLink
        })
        .eq('id', merchant.id);
        
      if (error) throw error;
      
      toast.success('Pengaturan Toko Online berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('column')) {
        toast.error('Gagal: Kolom database belum ditambahkan. Pastikan Anda telah menjalankan skrip migrasi add_storefront_columns.sql');
      } else {
        toast.error('Gagal menyimpan pengaturan.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-${theme.bg.split('-')[1]}-500`}></div>
      </div>
    );
  }

  // Use absolute URL for the storefront
  const storeUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/store/${slug}` 
    : `https://logaritma.id/store/${slug}`;
    
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(storeUrl)}&margin=10`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 md:pb-10">
      <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
            Toko Online
            <HeaderAiTrigger />
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Katalog Etalase & Pengaturan Order</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/ubos/${category}/${slug}`}
            className="hidden md:flex p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shadow-sm items-center gap-2 font-bold text-sm"
          >
             Kembali
          </Link>
          <a 
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`h-11 px-5 ${theme.bg} ${theme.hover} text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95`}
          >
            <ExternalLink size={18} />
            <span className="font-bold text-sm hidden md:inline">Kunjungi Web</span>
          </a>
        </div>
      </header>
      
      <div className="p-5 pt-0 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <LinkIcon size={20} className={theme.text} /> Tautan Toko Publik
              </h2>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 w-full overflow-hidden">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">URL Publik Anda</p>
                  <p className="text-slate-800 font-medium text-sm break-all sm:truncate">{storeUrl}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(storeUrl);
                      toast.success('Link toko berhasil disalin!');
                    }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors hover:border-${theme.bg.split('-')[1]}-300 hover:${theme.text}`}
                  >
                    <Copy size={16} /> Salin Link
                  </button>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Halo! Yuk lihat katalog lengkap ${merchant?.nama_usaha} dan pesan langsung di sini: ${storeUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 ${theme.bg} ${theme.hover} text-white rounded-xl text-sm font-bold transition-colors shadow-sm`}
                  >
                    Share WA
                  </a>
                </div>
              </div>
              
              <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 text-slate-700 items-start">
                <AlertCircle size={18} className="shrink-0 text-slate-400 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  Bagikan link ini di bio Instagram, TikTok, atau Google Maps Anda. Pelanggan bisa melihat menu dan memesan tanpa perlu mengunduh aplikasi tambahan.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ImageIcon size={20} className={theme.text} /> Profil Etalase
              </h2>
              
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-3">Banner / Cover Toko</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-full sm:w-64 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative flex items-center justify-center shrink-0">
                    {bannerFile ? (
                      <img src={URL.createObjectURL(bannerFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : bannerUrl ? (
                      <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300 w-10 h-10" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                        Ubah Gambar
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={e => e.target.files && e.target.files[0] && setBannerFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors text-center inline-block">
                      Pilih File
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={e => e.target.files && e.target.files[0] && setBannerFile(e.target.files[0])}
                      />
                    </label>
                    <p className="text-xs text-slate-500 font-medium">Rasio lebar (misal 1200x400). Maks 2MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Slogan / Tagline</label>
                <input 
                  type="text" 
                  value={slogan}
                  onChange={e => setSlogan(e.target.value)}
                  className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all font-medium`} 
                  placeholder="Misal: Cita rasa autentik sejak 1990" 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Deskripsi Toko</label>
                <textarea 
                  value={deskripsiToko}
                  onChange={e => setDeskripsiToko(e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all resize-none h-32 font-medium`} 
                  placeholder="Ceritakan tentang toko Anda, jam operasional, atau pengumuman penting..." 
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Alamat Lengkap (Ditampilkan Publik)</label>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all resize-none h-24 font-medium`} 
                  placeholder="Jalan Sudirman No. 123..." 
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Tautan Titik Google Maps</label>
                <input 
                  type="text" 
                  value={gmapsLink}
                  onChange={e => setGmapsLink(e.target.value)}
                  className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all font-medium`} 
                  placeholder="https://maps.app.goo.gl/..." 
                />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings size={20} className={theme.text} /> Penerimaan Order
              </h2>
              
              <div className="flex items-center justify-between p-5 border border-slate-200 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">Publikasi Toko Online</p>
                  <p className="text-sm text-slate-500 font-medium">Buka etalase agar pengunjung dapat melihat dan memesan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isStoreEnabled}
                    onChange={(e) => setIsStoreEnabled(e.target.checked)} 
                  />
                  <div className={`w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${theme.bg.split('-')[1]}-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${theme.bg}`}></div>
                </label>
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Nomor WhatsApp Kasir / Admin</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+62</span>
                  <input 
                    type="tel" 
                    value={storeWaNumber}
                    onChange={e => setStoreWaNumber(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all font-medium`} 
                    placeholder="81234567890" 
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Pesanan masuk dari publik akan di-forward langsung ke nomor WhatsApp ini dalam format teks siap proses.
                </p>
              </div>
              
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-70 shadow-sm w-full sm:w-auto"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : <Save size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </div>
            
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 text-center sticky top-24">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center justify-center gap-2">
                <QrCode size={20} className={theme.text} /> QR Code Meja
              </h2>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center mb-5 mx-auto w-56 h-56 shadow-inner">
                {/* Using external API for quick QR generation without heavy libs */}
                <img src={qrCodeUrl} alt="Store QR Code" className="w-full h-full object-contain mix-blend-multiply" crossOrigin="anonymous" />
              </div>
              
              <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                Unduh dan cetak QR Code ini. Tempelkan di meja makan atau kasir agar pelanggan bisa langsung <strong>scan dan pesan mandiri</strong>.
              </p>
              
              <a 
                href={qrCodeUrl}
                download="QRCode_Toko.png"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold rounded-xl text-sm transition-colors active:scale-95"
              >
                Unduh QR Code (PNG)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
