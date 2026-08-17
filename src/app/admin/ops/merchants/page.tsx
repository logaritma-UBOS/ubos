'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, Clock, Crown, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import WhatsappDispatcherModal from '@/components/admin/WhatsappDispatcherModal';

interface Merchant {
  id: string;
  nama_usaha: string;
  whatsapp: string;
  kategori_usaha: string;
  status: string;
  subscription_status: string;
  trial_expires_at: string;
  created_at: string;
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Whatsapp Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [selectedWaTarget, setSelectedWaTarget] = useState({ name: '', phone: '', status: '', id: '', category: '' });

  // Manage Modal State
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMerchants(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat merchants: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string, days: number | 'lifetime') => {
    if (!selectedMerchant) return;
    try {
      const now = new Date();
      let expiresAt = new Date();
      if (days === 'lifetime') {
        expiresAt = new Date('2099-12-31T23:59:59Z');
      } else {
        expiresAt.setDate(now.getDate() + days);
      }
      
      const payload = {
        status: status,
        subscription_status: status === 'Trial' ? 'inactive' : 'active',
        trial_expires_at: expiresAt.toISOString()
      };
      
      const { error } = await supabase.from('merchants').update(payload).eq('id', selectedMerchant.id);
      if (error) throw error;
      
      toast.success(`Status ${selectedMerchant.nama_usaha} berhasil diperbarui!`);
      setManageModalOpen(false);
      fetchMerchants();
    } catch(err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedMerchant) return;
    if (!confirm(`PERINGATAN BAHAYA!\n\nApakah Anda yakin ingin menghapus permanen merchant "${selectedMerchant.nama_usaha}"?\nSemua data transaksi, inventaris, dan pengaturan mereka akan terhapus dan TIDAK DAPAT DIPULIHKAN.`)) return;
    
    try {
      const merchantId = selectedMerchant.id;
      
      // 1. Ambil semua ID produk dan transaksi milik merchant ini
      const { data: prodList } = await supabase.from('products').select('id').eq('merchant_id', merchantId);
      const { data: trxList } = await supabase.from('transactions').select('id').eq('merchant_id', merchantId);
      
      // 2. Hapus data yang bergantung pada produk (misal: resep)
      if (prodList && prodList.length > 0) {
        const prodIds = prodList.map(p => p.id);
        await supabase.from('recipes').delete().in('product_id', prodIds);
      }
      
      // 3. Hapus data yang bergantung pada transaksi (misal: rincian barang transaksi)
      if (trxList && trxList.length > 0) {
        const trxIds = trxList.map(t => t.id);
        await supabase.from('transaction_items').delete().in('transaction_id', trxIds);
      }
      
      // 4. Hapus data utama merchant di berbagai tabel lainnya
      await Promise.all([
        supabase.from('transactions').delete().eq('merchant_id', merchantId),
        supabase.from('products').delete().eq('merchant_id', merchantId),
        supabase.from('customers').delete().eq('merchant_id', merchantId),
        supabase.from('wallets').delete().eq('merchant_id', merchantId),
        supabase.from('cash_transactions').delete().eq('merchant_id', merchantId),
        supabase.from('crm_broadcast_logs').delete().eq('merchant_id', merchantId),
        supabase.from('subscriptions').delete().eq('merchant_id', merchantId)
      ]);

      // 5. Terakhir, hapus entitas merchant itu sendiri
      const { error } = await supabase.from('merchants').delete().eq('id', merchantId);
      if (error) throw error;
      
      toast.success('Akun dan seluruh datanya berhasil dihapus permanen');
      setManageModalOpen(false);
      fetchMerchants();
    } catch(err: any) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Users size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Merchants Center</h1>
          </div>
          <p className="text-slate-400 text-sm">Monitor seluruh tenant UMKM yang menggunakan ekosistem UBOS.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Cari merchant..." className="bg-slate-950 border border-slate-800 text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-amber-500/50 text-sm w-64" />
          </div>
          <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-300 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nama Usaha</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4 text-center">Trial Expire</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">Memuat data dari database...</td></tr>
              ) : merchants.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Belum ada merchant.</td></tr>
              ) : (
                merchants.map((merchant) => {
                  const isPremium = merchant.status === 'Premium' || merchant.subscription_status === 'active' || merchant.status === 'PREMIUM_PAID';
                  const expiryDate = merchant.trial_expires_at 
                    ? new Date(merchant.trial_expires_at) 
                    : new Date(new Date(merchant.created_at || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000);
                  
                  const now = new Date();
                  const timeDiff = expiryDate.getTime() - now.getTime();
                  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  const isExpired = daysRemaining < 0;
                  const isLifetime = expiryDate.getFullYear() > 2050; // Check if it's set to 2099

                  return (
                    <tr key={merchant.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 uppercase">
                          {merchant.nama_usaha.charAt(0)}
                        </div>
                        <span className="truncate">{merchant.nama_usaha}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-950 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-800">
                          {merchant.kategori_usaha}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-400">{merchant.whatsapp}</td>
                      <td className="px-6 py-4">
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                            <Crown size={12} /> Premium
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            <Clock size={12} /> {isExpired ? 'Expired' : 'Trial'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-xs">
                        {isLifetime && isPremium ? (
                          <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border border-emerald-500/20">Lifetime / Active</span>
                        ) : isExpired ? (
                          <span className="text-red-500 font-bold bg-red-500/10 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border border-red-500/20">Kadaluwarsa (Expired)</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-slate-300 font-semibold">{expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className={`${isPremium ? 'text-emerald-500' : 'text-amber-500'} font-bold text-[10px] mt-0.5`}>(Sisa {daysRemaining} Hari)</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedMerchant(merchant);
                            setManageModalOpen(true);
                          }}
                          className={`p-2 rounded-lg transition-colors border tooltip ${isPremium ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20'}`}
                          title="Kelola Langganan & Akun"
                        >
                          <Crown size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedWaTarget({
                              name: merchant.nama_usaha,
                              phone: merchant.whatsapp,
                              status: isPremium ? 'Premium Active' : (isExpired ? 'Trial Expired' : 'Trial Active'),
                              id: merchant.id,
                              category: merchant.kategori_usaha
                            });
                            setWaModalOpen(true);
                          }}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 tooltip"
                          title="Chat via Fonnte"
                        >
                          <MessageCircle size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WhatsappDispatcherModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        targetName={selectedWaTarget.name}
        targetPhone={selectedWaTarget.phone}
        merchantStatus={selectedWaTarget.status}
        merchantId={selectedWaTarget.id}
        kategoriUsaha={selectedWaTarget.category}
      />

      {/* Account Management Modal */}
      {manageModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setManageModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-black text-white">Kelola Akun</h2>
              <button onClick={() => setManageModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Target Merchant</p>
                <h3 className="font-bold text-white text-lg">{selectedMerchant.nama_usaha}</h3>
              </div>

              <div className="space-y-2 pt-2">
                <button onClick={() => handleUpdateStatus('PREMIUM_PAID', 7)} className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors">
                  <span className="font-bold text-sm">👑 Premium 7 Hari</span>
                  <span className="text-xs opacity-70">Quick Upgrade</span>
                </button>
                <button onClick={() => handleUpdateStatus('PREMIUM_PAID', 30)} className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors">
                  <span className="font-bold text-sm">👑 Premium 30 Hari</span>
                  <span className="text-xs opacity-70">Standar</span>
                </button>
                <button onClick={() => handleUpdateStatus('PREMIUM_PAID', 'lifetime')} className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors">
                  <span className="font-bold text-sm">👑 Premium Lifetime</span>
                  <span className="text-xs opacity-70">VIP</span>
                </button>
              </div>

              <hr className="border-slate-800" />

              <div className="space-y-2">
                <button onClick={() => handleUpdateStatus('Trial', 7)} className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors">
                  <span className="font-bold text-sm">⏪ Kembali ke Trial</span>
                  <span className="text-xs opacity-70">Beri 7 Hari</span>
                </button>
                <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors mt-4">
                  <span className="font-bold text-sm">🗑️ Hapus Akun</span>
                  <span className="text-xs opacity-70">Permanen!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
