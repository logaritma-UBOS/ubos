'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  ArrowLeft, Save, LogOut, Store, UploadCloud, Smartphone, Clock, 
  CheckCircle2, Headset, Trash2, AlertTriangle, ArrowRight, User, 
  MapPin, Settings as SettingsIcon, CreditCard, Box, Menu, Star, MonitorSmartphone, Mail, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [targetProfit, setTargetProfit] = useState('');
  
  // Layout State
  const [activeTab, setActiveTab] = useState('akun'); // 'akun' | 'bisnis'
  const [isEditing, setIsEditing] = useState(false);
  
  // Merchant State - General
  const [merchantId, setMerchantId] = useState('');
  const [namaUsaha, setNamaUsaha] = useState('');
  const [kategoriUsaha, setKategoriUsaha] = useState('F&B');
  const [operatingHours, setOperatingHours] = useState('');
  const [brandColor, setBrandColor] = useState('#10B981');
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldLogoUrl, setOldLogoUrl] = useState<string | null>(null);
  
  // Majoo-style States
  const [phone, setPhone] = useState(''); // phone1 (akun)
  const [phone2, setPhone2] = useState(''); // phone2 (akun)
  const [phone3, setPhone3] = useState(''); // phone3 (akun)
  const [ktpNumber, setKtpNumber] = useState('');
  const [npwpNumber, setNpwpNumber] = useState('');
  
  const [bizEmail, setBizEmail] = useState('');
  const [bizPhone1, setBizPhone1] = useState('');
  const [bizPhone2, setBizPhone2] = useState('');
  const [bizPhone3, setBizPhone3] = useState('');

  // Modals & Onboarding
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/auth/login');
        
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
          setPhone2(merchantData.phone_2 || '');
          setPhone3(merchantData.phone_3 || '');
          setKtpNumber(merchantData.ktp_number || '');
          setNpwpNumber(merchantData.npwp_number || '');
          setBizEmail(merchantData.business_email || user.email || '');
          setBizPhone1(merchantData.phone || '');
          setBizPhone2(merchantData.phone_2 || '');
          setBizPhone3(merchantData.phone_3 || '');

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
        
        const step = localStorage.getItem('onboarding_step');
        if (step === 'step3_settings') {
          setIsOnboarding(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
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

      // First try to update all fields including the new ones
      const payloadAll = {
        nama_usaha: namaUsaha,
        kategori_usaha: kategoriUsaha,
        operating_hours: operatingHours,
        phone: phone, // phone1
        phone_2: phone2,
        phone_3: phone3,
        ktp_number: ktpNumber,
        npwp_number: npwpNumber,
        business_email: bizEmail,
        logo_url: logo_url,
        brand_color: brandColor
      };

      const payloadBasic = {
        nama_usaha: namaUsaha,
        kategori_usaha: kategoriUsaha,
        operating_hours: operatingHours,
        phone: phone,
        logo_url: logo_url,
        brand_color: brandColor
      };

      // Attempt full update
      let error = null;
      try {
        const res = await supabase.from('merchants').update(payloadAll).eq('id', merchantId);
        error = res.error;
      } catch(e) {
        // Just in case
      }

      // If error (likely column does not exist), fallback to basic
      if (error && error.code === 'PGRST204') {
        const { error: basicError } = await supabase.from('merchants').update(payloadBasic).eq('id', merchantId);
        if (basicError) throw basicError;
      } else if (error) {
        throw error;
      }
      
      setIsEditing(false);

      if (isOnboarding) {
        setShowOnboardingSuccess(true);
      } else {
        toast.success('Profil berhasil diperbarui!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      if (!merchantId) throw new Error('ID Merchant tidak ditemukan');

      // 1. Transactions & Items
      const { data: trxList } = await supabase.from('transactions').select('id').eq('merchant_id', merchantId);
      if (trxList && trxList.length > 0) {
        const trxIds = trxList.map(t => t.id);
        await supabase.from('transaction_items').delete().in('transaction_id', trxIds);
      }
      await supabase.from('transactions').delete().eq('merchant_id', merchantId);

      // 2. Products & Recipes
      const { data: prodList } = await supabase.from('products').select('id').eq('merchant_id', merchantId);
      if (prodList && prodList.length > 0) {
         const prodIds = prodList.map(p => p.id);
         await supabase.from('recipes').delete().in('product_id', prodIds);
      }
      await supabase.from('products').delete().eq('merchant_id', merchantId);

      toast.success('Berhasil! Seluruh data penjualan dan menu Anda telah direset kembali seperti semula.', { icon: '✨' });
      setShowResetModal(false);
    } catch (err: any) {
      toast.error('Gagal mereset data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const openTime = operatingHours?.split('-')[0]?.trim() || '08:00';
  const closeTime = operatingHours?.split('-')[1]?.trim() || '22:00';

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-[100dvh] bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 relative z-50 animate-in slide-in-from-right-full duration-300">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <img src="/logo-ubos.png" alt="UBOS" className="h-6 object-contain" />
          <h1 className="font-black text-lg text-slate-800 tracking-tight ml-2 border-l border-slate-200 pl-4">Pengaturan</h1>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] w-full mx-auto">
        
        {/* Sidebar Nav (Majoo Style) */}
        <aside className="w-full md:w-64 shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <div className="mb-6 mt-2">
              <div className="flex items-center gap-2 px-3 mb-2 text-slate-800">
                <User size={18} />
                <span className="font-bold text-sm">Akun Profile</span>
              </div>
              <div className="space-y-1 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md transition-transform duration-300" 
                     style={{ transform: `translateY(${activeTab === 'akun' ? '0' : '40px'})`, height: '40px' }}></div>
                <button 
                  onClick={() => { setActiveTab('akun'); setIsEditing(false); }}
                  className={`w-full text-left pl-6 pr-4 py-2.5 text-sm font-bold transition-colors ${activeTab === 'akun' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Informasi Akun
                </button>
                <button 
                  onClick={() => { setActiveTab('bisnis'); setIsEditing(false); }}
                  className={`w-full text-left pl-6 pr-4 py-2.5 text-sm font-bold transition-colors ${activeTab === 'bisnis' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Informasi Bisnis
                </button>
                <button className="w-full text-left pl-6 pr-4 py-2.5 text-sm font-bold text-slate-400 cursor-not-allowed flex items-center justify-between hover:bg-slate-50">
                  Informasi Rekening <Lock size={12} />
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-2 px-3 py-2.5 text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-bold transition-colors">
                <LogOut size={18} /> Keluar dari Akun
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 bg-slate-50/50">
          <form id="settingsForm" onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
            
            {/* Header Area */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {activeTab === 'akun' ? 'Informasi Akun' : 'Informasi Bisnis'}
                </h2>
                <Star size={18} className="text-slate-400" />
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 border font-bold text-sm rounded-lg transition-colors ${isEditing ? 'border-rose-500 text-rose-600 hover:bg-rose-50' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}
              >
                {isEditing ? 'Batalkan Ubah Data' : 'Buka Akses Ubah Data'}
              </button>
            </div>

            <div className="p-6 md:p-8">
              
              {/* === TAB INFORMASI AKUN === */}
              {activeTab === 'akun' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  
                  {/* Section 1: Profil Akun */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Informasi Akun Profil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          Email <span className="text-rose-500">*</span> 
                          {userEmail && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </label>
                        <input 
                          type="email" 
                          value={userEmail} 
                          disabled // Email is tied to auth, usually not editable here
                          className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed font-medium" 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          Telepon ke-1 <span className="text-rose-500">*</span>
                          {phone && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </label>
                        <input 
                          type="tel" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                          placeholder="0812..." 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Telepon ke-2</label>
                        <input 
                          type="tel" 
                          value={phone2} 
                          onChange={e => setPhone2(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Telepon ke-3</label>
                        <input 
                          type="tel" 
                          value={phone3} 
                          onChange={e => setPhone3(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full"></div>

                  {/* Section 2: Data Diri */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Informasi Data Diri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          Nomor KTP <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          value={ktpNumber} 
                          onChange={e => setKtpNumber(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                          Nomor NPWP
                        </label>
                        <input 
                          type="text" 
                          value={npwpNumber} 
                          onChange={e => setNpwpNumber(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      {/* We intentionally skip "Unggah KTP" and "Unggah NPWP" as per user request */}

                    </div>
                  </div>
                </div>
              )}

              {/* === TAB INFORMASI BISNIS === */}
              {activeTab === 'bisnis' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  
                  {/* Section 1: Kontak Bisnis */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Informasi Kontak Bisnis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          Nama Bisnis <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          value={namaUsaha} 
                          onChange={e => setNamaUsaha(e.target.value)} 
                          disabled={!isEditing}
                          required
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          Email <span className="text-rose-500">*</span>
                          {bizEmail && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </label>
                        <input 
                          type="email" 
                          value={bizEmail} 
                          onChange={e => setBizEmail(e.target.value)} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                          Telepon ke-1 <span className="text-rose-500">*</span>
                          {bizPhone1 && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </label>
                        <input 
                          type="tel" 
                          value={bizPhone1} 
                          onChange={e => setBizPhone1(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Telepon ke-2</label>
                        <input 
                          type="tel" 
                          value={bizPhone2} 
                          onChange={e => setBizPhone2(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Telepon ke-3</label>
                        <input 
                          type="tel" 
                          value={bizPhone3} 
                          onChange={e => setBizPhone3(e.target.value.replace(/\D/g, ''))} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full"></div>

                  {/* Section 2: Alamat */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Informasi Alamat</h3>
                    <div className="max-w-2xl">
                      <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                        Lokasi di Map <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative h-48 bg-slate-200 rounded-xl overflow-hidden border border-slate-200 mb-3 group">
                        <img 
                          src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/191:100/w_1280,c_limit/GoogleMapTA.jpg" 
                          alt="Map Placeholder" 
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MapPin size={32} className="text-white mb-2" />
                          <p className="text-white font-bold">Tandai lokasi dalam peta</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" disabled={!isEditing} className="px-5 py-2 bg-slate-100 border border-slate-200 text-emerald-600 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors disabled:opacity-50">
                          Ubah Lokasi
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full"></div>

                  {/* Section 3: Pengaturan Tampilan Toko (Old fields merged here) */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Pengaturan Brand & Outlet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Logo Upload */}
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Logo Outlet</label>
                        <div className="flex items-start">
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange} 
                              disabled={!isEditing}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                            />
                            <div className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${imagePreview ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-300 bg-slate-50'}`}>
                              {imagePreview ? (
                                <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <UploadCloud size={20} className="text-slate-400 mb-1" />
                                  <span className="text-[10px] font-bold text-slate-400">Upload</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Brand Color Picker */}
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Warna Utama Brand</label>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                            <input 
                              type="color" 
                              value={brandColor} 
                              onChange={e => setBrandColor(e.target.value)} 
                              disabled={!isEditing}
                              className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </div>
                          <div className="flex-1 flex flex-wrap gap-2 pb-1">
                            {[
                              { label: 'Emerald', color: '#10B981' },
                              { label: 'Blue', color: '#3B82F6' },
                              { label: 'Orange', color: '#F97316' },
                              { label: 'Red', color: '#EF4444' },
                            ].map(preset => (
                              <button
                                key={preset.color}
                                type="button"
                                disabled={!isEditing}
                                onClick={() => setBrandColor(preset.color)}
                                className={`w-8 h-8 shrink-0 rounded-full border-2 transition-all disabled:cursor-not-allowed ${brandColor.toUpperCase() === preset.color.toUpperCase() ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.label}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">Kategori Usaha</label>
                        <input 
                          type="text" 
                          value={kategoriUsaha} 
                          onChange={e => setKategoriUsaha(e.target.value)} 
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                          Jam Operasional <span className="text-emerald-500 text-[10px] ml-1 bg-emerald-50 px-1 rounded">(Info Copilot)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={openTime} 
                            onChange={e => setOperatingHours(`${e.target.value} - ${closeTime}`)} 
                            disabled={!isEditing}
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                          />
                          <span className="text-slate-400 font-bold">-</span>
                          <input 
                            type="time" 
                            value={closeTime} 
                            onChange={e => setOperatingHours(`${openTime} - ${e.target.value}`)} 
                            disabled={!isEditing}
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all ${isEditing ? 'bg-white border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'}`} 
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>
            
            {/* Footer Action Bar */}
            <div className={`p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end transition-all ${isEditing ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden border-t-0'}`}>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving || !isEditing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-8 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                >
                  {saving ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Save size={18} /> Simpan Data</>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Reset Zone - Only show at the bottom */}
          <div className="mt-8 pt-8 border-t border-slate-200 max-w-4xl">
             <button type="button" onClick={() => setShowResetModal(true)} className="flex items-center gap-2 px-4 py-2 text-rose-500 font-bold bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors text-sm">
                <Trash2 size={16} /> Reset Data Penjualan & Menu
             </button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Yakin Ingin Keluar?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Anda harus login kembali untuk mengakses data usaha Anda.</p>
            <div className="w-full space-y-3">
              <button onClick={handleLogout} className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all active:scale-95">
                Ya, Keluar
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Reset Data Penjualan?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Tindakan ini akan menghapus permanen seluruh <strong>Daftar Menu</strong> dan <strong>Riwayat Transaksi</strong> di toko Anda. Anda akan mulai kembali dari 0.</p>
            <div className="w-full space-y-3">
              <button onClick={handleResetData} disabled={isResetting} className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center">
                {isResetting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Ya, Hapus Semuanya'}
              </button>
              <button onClick={() => setShowResetModal(false)} disabled={isResetting} className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
