'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Users, MessageCircle, Send, Plus, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import AIBanner from '@/components/AIBanner';

export default function CRMPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: merchantData } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
      if (merchantData) {
        setMerchant(merchantData);
        
        // Fetch Customers
        const { data: customersData } = await supabase.from('customers').select('*').eq('merchant_id', merchantData.id);
        setCustomers(customersData || []);
        
        // Fetch Products for Broadcast Template
        const { data: productsData } = await supabase.from('products').select('nama_produk').eq('merchant_id', merchantData.id).limit(3);
        setProducts(productsData || []);
      }
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
    let menuList = "berbagai menu andalan kami";
    if (products.length > 0) {
      menuList = products.map(p => p.nama_produk).join(', ');
    }
    const text = `Halo kak! Sore ini ${merchant?.nama_usaha} ada promo spesial nih untuk menu ${menuList}. Yuk mampir sebelum kehabisan. Balas pesan ini untuk info lebih lanjut ya! 🎉`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-primary shadow-sm px-5 py-4 flex justify-between items-center z-20 relative">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">CRM & Profil</h1>
          <p className="text-white/80 text-xs mt-0.5">WhatsApp Marketing & Kontak</p>
        </div>
        <Link href="/settings" className="p-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-sm">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </Link>
      </header>

      <div className="px-5 pt-4 max-w-6xl mx-auto w-full relative z-20">
        <AIBanner />
      </div>

      <div className="p-5 pt-0 max-w-6xl mx-auto space-y-6 pb-28 md:pb-10 relative z-30 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* WA Broadcast Generator */}
        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-110 duration-500">
            <MessageCircle size={120} className="text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-emerald-200">
              <MessageCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">WA Broadcast Generator</h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-5 max-w-[85%]">
              AI Logaritma siap membuatkan draf pesan promosi otomatis untuk pelanggan setia guna membersihkan sisa stok sore hari ini.
            </p>
            <button 
              onClick={handleWABroadcast}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-95 shadow-sm shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <Send size={16} /> Generate Pesan Promo
            </button>
          </div>
        </div>

        {/* Customers */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-800">Daftar Pelanggan</h2>
            <button 
              onClick={() => setShowAddCustomer(true)}
              className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1 active:scale-95 transition-all"
            >
              <UserPlus size={12} /> Tambah
            </button>
          </div>
          
          {customers.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200 mt-2">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">Belum ada pelanggan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((c) => (
                <div key={c.id} className="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm border border-primary/20">
                      {c.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{c.nama}</h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Kunjungan</span>
                    <span className="font-black text-primary text-sm">{c.total_visits}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 pb-20">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex justify-between items-center mb-5">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <button onClick={() => setShowAddCustomer(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">Tambah Pelanggan Baru</h2>
            <p className="text-sm text-slate-500 mb-6">Simpan kontak pelanggan untuk CRM.</p>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nama Pelanggan</label>
                <input 
                  type="text" 
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                  placeholder="Misal: Budi Santoso"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">No. WhatsApp</label>
                <input 
                  type="tel" 
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                  placeholder="0812..."
                />
              </div>
              
              <button 
                type="submit"
                disabled={savingCustomer}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 mt-4 h-14"
              >
                {savingCustomer ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : 'Simpan Pelanggan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
