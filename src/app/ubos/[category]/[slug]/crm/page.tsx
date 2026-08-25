'use client';

import UBOSLoading from '@/components/UBOSLoading';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Users, MessageCircle, Send, Plus, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const HeaderAiTrigger = dynamic(() => import('@/components/ubos/HeaderAiTrigger'), { ssr: false });
import { useMerchant } from '@/contexts/MerchantContext';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', hover: 'hover:bg-blue-600' },
};

export default function CRMPage() {
  const { merchant } = useMerchant();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  
  const theme = themeColorMap[(params.category as string)?.toLowerCase()] || themeColorMap.default;
  
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  useEffect(() => {
    fetchData();
  }, [merchant]);

  const fetchData = async () => {
    try {
      if (!merchant) return;
      
      const [customersRes, productsRes] = await Promise.all([
        supabase.from('customers').select('*').eq('merchant_id', merchant.id).order('total_visits', { ascending: false }),
        supabase.from('products').select('nama_produk').eq('merchant_id', merchant.id).limit(3)
      ]);
      
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;
    
    setSavingCustomer(true);
    try {
      const { error } = await supabase.from('customers').insert([{
        merchant_id: merchant.id,
        nama: newCustomerName,
        phone: newCustomerPhone
      }]);
      if (error) throw error;
      
      await fetchData();
      setShowAddCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      toast.success('Pelanggan berhasil ditambahkan!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menambah pelanggan. Mungkin nomor WA sudah terdaftar.');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleWABroadcast = () => {
    let menuList = "berbagai penawaran menarik kami";
    if (products.length > 0) {
      menuList = products.map(p => p.nama_produk).join(', ');
    }
    const text = `Halo kak! Sore ini ${merchant?.nama_usaha} ada promo spesial nih untuk ${menuList}. Yuk mampir sebelum kehabisan. Balas pesan ini untuk info lebih lanjut ya! 🎉`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const getLoyaltyBadge = (visits: number) => {
    if (visits >= 10) return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">VIP</span>;
    if (visits >= 3) return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">LOYAL</span>;
    return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">REGULAR</span>;
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);



  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 md:pb-10">
      <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
            CRM & Pelanggan
            <HeaderAiTrigger />
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">WhatsApp Marketing & Database Kontak</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/ubos/${params.category}/${params.slug}`}
            className="hidden md:flex p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shadow-sm items-center gap-2 font-bold text-sm"
          >
             Kembali
          </Link>
          <Link href="/settings" className={`h-11 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="font-bold text-sm hidden md:inline">Pengaturan</span>
          </Link>
        </div>
      </header>

      <div className="p-5 pt-0 max-w-6xl mx-auto pb-28 md:pb-10 relative z-30 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Kiri: AI Broadcast Generator */}
          <div className="w-full lg:w-1/3">
            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-110 duration-500">
                <MessageCircle size={140} className={`text-${theme.bg.split('-')[1]}-500`} />
              </div>
              <div className="relative z-10">
                <div className={`w-12 h-12 ${theme.light} ${theme.text} rounded-xl flex items-center justify-center mb-5 shadow-sm border ${theme.border}`}>
                  <MessageCircle size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">AI Broadcast</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  Hasilkan pesan promosi WhatsApp cerdas yang disesuaikan dengan pola belanja pelanggan untuk meningkatkan repeat order hari ini.
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleWABroadcast}
                    className={`w-full ${theme.bg} ${theme.hover} text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-95 shadow-sm shadow-${theme.bg.split('-')[1]}-500/20 flex items-center justify-center gap-2`}
                  >
                    <Send size={16} /> Buat Pesan Otomatis
                  </button>
                  <button 
                    onClick={() => toast.info('Fitur kustomisasi template segera hadir')}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 px-4 rounded-xl transition-all border border-slate-200 active:scale-95"
                  >
                    Sesuaikan Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Customer Table */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-black text-slate-900">Database Pelanggan</h2>
                <button 
                  onClick={() => setShowAddCustomer(true)}
                  className={`bg-slate-50 text-slate-700 hover:text-${theme.bg.split('-')[1]}-600 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:border-${theme.bg.split('-')[1]}-300 flex items-center gap-1.5 active:scale-95 transition-all`}
                >
                  <UserPlus size={14} /> Tambah Kontak
                </button>
              </div>
              
              {loading ? (<div className="p-10 text-center text-slate-500 font-bold text-sm animate-pulse">Memuat data pelanggan...</div>) : customers.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 mx-auto text-slate-300 border border-slate-100">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-800 font-bold text-base mb-1">Belum Ada Pelanggan</p>
                  <p className="text-sm font-medium text-slate-500">Mulai tambahkan pelanggan secara manual atau melalui Smart POS saat checkout.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama & Kontak</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Loyalitas</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Transaksi</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${theme.light} ${theme.text} rounded-full flex items-center justify-center font-bold text-sm border ${theme.border}`}>
                                {c.nama.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm group-hover:text-slate-900 transition-colors">{c.nama}</h3>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {getLoyaltyBadge(c.total_visits || 0)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-black text-slate-800 block text-sm">{c.total_visits}x</span>
                            <span className="text-[10px] text-slate-500 font-medium">{formatIDR(c.total_spent || 0)}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <a 
                              href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle size={18} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 pb-20">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-5">
              <div className={`w-12 h-12 ${theme.light} ${theme.text} rounded-full flex items-center justify-center border ${theme.border}`}>
                <UserPlus size={20} />
              </div>
              <button onClick={() => setShowAddCustomer(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <h2 className="text-xl font-black text-slate-900 mb-1">Tambah Pelanggan Baru</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Simpan kontak pelanggan untuk CRM otomatis.</p>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nama Pelanggan</label>
                <input 
                  type="text" 
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all font-medium`}
                  placeholder="Misal: Budi Santoso"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">No. WhatsApp</label>
                <input 
                  type="tel" 
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${theme.bg.split('-')[1]}-200 focus:border-${theme.bg.split('-')[1]}-500 transition-all font-medium`}
                  placeholder="0812..."
                />
              </div>
              
              <button 
                type="submit"
                disabled={savingCustomer}
                className={`w-full ${theme.bg} ${theme.hover} text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-4 h-14 flex items-center justify-center shadow-sm`}
              >
                {savingCustomer ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Simpan Pelanggan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
