'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Save, LogOut, Store, UploadCloud, Smartphone, Clock, CheckCircle2, Headset } from 'lucide-react';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [targetProfit, setTargetProfit] = useState('');
  
  // Merchant State
  const [merchantId, setMerchantId] = useState('');
  const [namaUsaha, setNamaUsaha] = useState('');
  const [kategoriUsaha, setKategoriUsaha] = useState('F&B');
  const [operatingHours, setOperatingHours] = useState('');
  const [phone, setPhone] = useState('');
  const [brandColor, setBrandColor] = useState('#10B981');
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldLogoUrl, setOldLogoUrl] = useState<string | null>(null);
  
  // Custom Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/auth');
        
        setUserEmail(user.email || '');
        
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (merchantData) {
          setMerchantId(merchantData.id);
          setNamaUsaha(merchantData.nama_usaha);
          setKategoriUsaha(merchantData.kategori_usaha);
          setOperatingHours(merchantData.operating_hours || '');
          setPhone(merchantData.phone || '');
          if (merchantData.logo_url) {
            setImagePreview(merchantData.logo_url);
            setOldLogoUrl(merchantData.logo_url);
          }
          if (merchantData.brand_color) {
            setBrandColor(merchantData.brand_color);
          }
          
          const savedTarget = localStorage.getItem('targetProfit');
          if (savedTarget) setTargetProfit(savedTarget);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUsaha) return;
    
    setSaving(true);
    try {
      let logo_url = oldLogoUrl;
      
      // Upload new logo to Cloudinary
      if (imageFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        const formData = new FormData();
        formData.append('file', imageFile);
        if (uploadPreset) formData.append('upload_preset', uploadPreset);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          logo_url = data.secure_url;
        }
      }

      // Update merchant
      const { error } = await supabase
        .from('merchants')
        .update({
          nama_usaha: namaUsaha,
          kategori_usaha: kategoriUsaha,
          operating_hours: operatingHours,
          phone: phone,
          logo_url: logo_url,
          brand_color: brandColor
        })
        .eq('id', merchantId);
        
      if (error) throw error;
      
      localStorage.setItem('targetProfit', targetProfit);
      
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-[100dvh] bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 relative z-50 animate-in slide-in-from-right-full duration-300">
      <header className="fixed top-0 z-40 h-[80px] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-white">Pengaturan Akun</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-28 pt-24">
        <form id="settingsForm" onSubmit={handleSave} className="space-y-6">
          
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Profil Usaha</h2>
            
            {/* Logo Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${imagePreview ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">Tap to Upload</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Brand Color Picker */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Warna Utama Brand</label>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                  <input 
                    type="color" 
                    value={brandColor} 
                    onChange={e => setBrandColor(e.target.value)} 
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {[
                    { label: 'Hijau', color: '#10B981' },
                    { label: 'Biru', color: '#3B82F6' },
                    { label: 'Oranye', color: '#F97316' },
                    { label: 'Merah', color: '#EF4444' },
                    { label: 'Ungu', color: '#8B5CF6' },
                    { label: 'Hitam', color: '#111827' }
                  ].map(preset => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setBrandColor(preset.color)}
                      className={`w-10 h-10 shrink-0 rounded-full border-2 transition-all ${brandColor.toUpperCase() === preset.color.toUpperCase() ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Usaha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Store size={18} /></span>
                <input 
                  type="text" 
                  required 
                  value={namaUsaha} 
                  onChange={e => setNamaUsaha(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">No. WhatsApp Toko</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Smartphone size={18} /></span>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="0812..." 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Kategori Usaha</label>
              <input 
                type="text" 
                value={kategoriUsaha} 
                onChange={e => setKategoriUsaha(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                Jam Operasional <span className="text-primary text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">Wajib untuk AI Copilot</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={18} /></span>
                <input 
                  type="text" 
                  value={operatingHours} 
                  onChange={e => setOperatingHours(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Contoh: 08:00 - 22:00" 
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target Profit Bulanan (Rp)</label>
              <div className="relative">
                <CurrencyInput
                  value={targetProfit}
                  onChange={setTargetProfit}
                  icon="Rp"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black"
                  placeholder="5000000"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Akun Anda</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Email Terdaftar</p>
              <p className="text-sm font-bold text-slate-800">{userEmail}</p>
            </div>
            
            <Link href="/member" className="w-full flex items-center justify-center gap-2 p-4 text-primary font-bold bg-primary/10 rounded-3xl shadow-sm border border-primary/20 hover:bg-primary/20 transition-colors">
              <Store size={20} /> Kembali ke Portal Member
            </Link>
            
            <button type="button" onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-2 p-4 text-danger font-bold bg-white rounded-3xl shadow-sm border border-slate-100 hover:bg-danger/5 transition-colors">
              <LogOut size={20} /> Keluar dari Akun
            </button>
          </section>

          {/* Minimalist UBOS Profile Card */}
          <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <img src="/logo-ubos.png" alt="UBOS" className="w-8 object-contain" />
                <h3 className="text-sm font-black text-slate-800 tracking-tight">UBOS <span className="font-medium text-slate-400 ml-1 text-xs">by Logaritma</span></h3>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600">Mitra Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-center sm:justify-start">
                <p className="text-xs font-medium text-slate-500">Versi: UBOS F&B Suite v1.0</p>
              </div>
              <button 
                type="button"
                onClick={() => toast('Bantuan & Support AI sedang dalam pengembangan.', { icon: '🤖' })}
                className="flex items-center justify-center gap-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
              >
                <Headset size={14} /> Bantuan & Support
              </button>
            </div>
          </section>
        </form>
      </div>

      <div className="fixed bottom-0 z-50 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
        <button type="submit" form="settingsForm" disabled={saving} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-primary/20">
          {saving ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><Save size={20} /> Simpan Perubahan</>
          )}
        </button>
      </div>
      
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Yakin Ingin Keluar?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Anda harus login kembali untuk mengakses data usaha Anda.</p>
            <div className="w-full space-y-3">
              <button onClick={handleLogout} className="w-full py-3.5 bg-danger hover:bg-danger-dark text-white font-bold rounded-xl transition-all active:scale-95">
                Ya, Keluar
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
