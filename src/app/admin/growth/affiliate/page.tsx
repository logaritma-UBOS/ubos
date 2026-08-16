'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Share2, Users, DollarSign, Link as LinkIcon, Copy, ArrowRight, HelpCircle, RefreshCw, MessageCircle, X, Wallet, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import WhatsappDispatcherModal from '@/components/admin/WhatsappDispatcherModal';

interface ReferredMerchant {
  id: string;
  nama_usaha: string;
  kategori_usaha: string;
  status: string;
  created_at: string;
  is_paid: boolean;
}

interface MerchantAffiliate {
  id: string;
  nama_usaha: string;
  whatsapp: string;
  slug: string | null;
  affiliate_clicks: number;
  status: string;
  subscription_status: string;
  created_at: string;
  
  // Kalkulasi Affiliate
  referral_id: string;
  total_daftar: number;
  total_paid: number;
  total_komisi: number;
  payout_terbayar: number;
  
  // Detail Rujukan
  referred_list: ReferredMerchant[];
}

export default function AffiliatePage() {
  const [affiliates, setAffiliates] = useState<MerchantAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Metrics
  const [totalMitra, setTotalMitra] = useState(0);
  const [totalConversion, setTotalConversion] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);

  // Modal Detail State
  const [selectedAffiliate, setSelectedAffiliate] = useState<MerchantAffiliate | null>(null);

  // Whatsapp Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [selectedWaTarget, setSelectedWaTarget] = useState({ name: '', phone: '', status: '', id: '', category: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch seluruh merchant sebagai mitra afiliasi (Auto-Sync)
      const { data: mData, error: mError } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (mError) throw mError;

      const merchantsData = mData || [];
      let totalConv = 0;
      let totalPayout = 0;

      const validMerchants = merchantsData || [];

      const unifiedData = validMerchants.map(async m => {
        // Referral ID prioritas: slug -> id
        const refId = m.slug || m.id;
        
        // Cari merchant lain yang referred_by-nya sama dengan refId merchant ini
        const referredMerchantsRaw = validMerchants.filter(other => other.referred_by === refId);
        
        const daftarCount = referredMerchantsRaw.length;
        const paidCount = referredMerchantsRaw.filter(ref => 
          ref.subscription_status === 'active' || ref.status === 'Premium'
        ).length;
        
        const komisi = paidCount * 19600; // Komisi 40% dari Rp49.000

        totalConv += paidCount;
        totalPayout += komisi;

        // Map referred merchants untuk ditampilkan di Modal
        const referred_list: ReferredMerchant[] = referredMerchantsRaw.map(ref => ({
          id: ref.id,
          nama_usaha: ref.nama_usaha || 'Unknown',
          kategori_usaha: ref.kategori_usaha || 'General',
          status: ref.status || 'Trial',
          created_at: ref.created_at,
          is_paid: ref.subscription_status === 'active' || ref.status === 'Premium'
        })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Fetch completed payouts for this merchant/affiliate
        const { data: payouts } = await supabase
          .from('payout_requests')
          .select('amount')
          .eq('merchant_id', m.id)
          .eq('status', 'PROCESSED');
        
        const payout_terbayar = payouts?.reduce((sum, req) => sum + Number(req.amount), 0) || 0;

        return {
          id: m.id,
          nama_usaha: m.nama_usaha || 'Unknown Store',
          whatsapp: m.whatsapp || '-',
          slug: m.slug,
          affiliate_clicks: m.affiliate_clicks || 0,
          status: m.status || 'Trial',
          subscription_status: m.subscription_status || 'inactive',
          created_at: m.created_at,
          
          referral_id: refId,
          total_daftar: daftarCount,
          total_paid: paidCount,
          total_komisi: komisi,
          payout_terbayar: payout_terbayar,
          referred_list
        };
      });

      const resolvedData = await Promise.all(unifiedData);

      setAffiliates(resolvedData);
      setTotalMitra(resolvedData.length);
      setTotalConversion(totalConv);
      setPendingPayout(totalPayout);

    } catch (error: any) {
      toast.error('Gagal memuat data afiliasi: ' + error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success('Data Afiliasi Real-Time berhasil diperbarui!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`https://logaritma.id?ref=${code}`);
    toast.success('Link Referral disalin ke clipboard!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center border border-pink-500/30">
              <Share2 size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Auto-Affiliate System</h1>
          </div>
          <p className="text-slate-400 text-sm">Setiap merchant adalah mitra. Kelola link referral dan payout komisi (40% / Rp19.600 per paid user).</p>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group tooltip tooltip-bottom" data-tip="Total seluruh merchant yang terdaftar dan otomatis menjadi afiliator">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1.5">
              Mitra Aktif <HelpCircle size={12} />
            </p>
            <p className="text-3xl font-black text-white">{loading ? '...' : totalMitra}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-blue-400 border border-slate-800">
            <Users size={16} />
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group tooltip tooltip-bottom" data-tip="Jumlah akumulasi seluruh user yang upgrade ke paket Premium via afiliasi">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1.5">
              Konversi Paid <HelpCircle size={12} />
            </p>
            <p className="text-3xl font-black text-white">{loading ? '...' : totalConversion} <span className="text-sm font-medium text-slate-500">Users</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 border border-slate-800">
            <ArrowRight size={16} />
          </div>
        </div>
        
        <div className="bg-slate-900 border border-pink-500/30 p-5 rounded-2xl flex justify-between items-center tooltip tooltip-bottom" data-tip="Komisi riil yang telah dihasilkan namun belum ditransfer ke merchant afiliator">
          <div>
            <p className="text-xs text-pink-400/70 font-bold uppercase mb-1 flex items-center gap-1.5">
              Pending Payout (40%) <HelpCircle size={12} />
            </p>
            <p className="text-3xl font-black text-pink-400">{loading ? '...' : formatCurrency(pendingPayout)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
            <DollarSign size={16} />
          </div>
        </div>
      </div>

      {/* TABEL MITRA AFILIASI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-300">Daftar Auto-Mitra Afiliasi (Merchants)</h3>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> 
            {isRefreshing ? 'Memuat Data...' : 'Refresh Data Realtime'}
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-slate-400 relative">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-slate-800 cursor-help" title="Nama Toko atau Merchant yang otomatis menjadi Afiliator UBOS">Nama Afiliator</th>
                <th className="px-6 py-4 border-b border-slate-800 cursor-help" title="URL referral resmi. Gunakan tombol 'Copy' untuk menyalin.">Link Unik</th>
                <th className="px-6 py-4 border-b border-slate-800 text-center cursor-help" title="Jumlah klik pengunjung ke landing page via link toko ini.">Klik <HelpCircle size={10} className="inline ml-1" /></th>
                <th className="px-6 py-4 border-b border-slate-800 text-center cursor-help" title="Jumlah merchant baru yang mendaftar (Trial) dari referral toko ini.">Daftar <HelpCircle size={10} className="inline ml-1" /></th>
                <th className="px-6 py-4 border-b border-slate-800 text-center cursor-help" title="Jumlah merchant referral yang berhasil upgrade ke paket berbayar (Premium).">Paid <HelpCircle size={10} className="inline ml-1" /></th>
                <th className="px-6 py-4 border-b border-slate-800 text-right cursor-help" title="Total hak bagi hasil merchant (Jumlah Paid × Rp19.600).">Komisi (Rp) <HelpCircle size={10} className="inline ml-1" /></th>
                <th className="px-6 py-4 border-b border-slate-800 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500 animate-pulse">Mensinkronisasi merchant dari Supabase...</td></tr>
              ) : affiliates.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Belum ada merchant yang mendaftar di sistem.</td></tr>
              ) : (
                affiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{aff.nama_usaha}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{aff.whatsapp}</div>
                      <span className={`inline-block text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded-sm ${aff.status === 'Premium' || aff.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {aff.status === 'Premium' || aff.subscription_status === 'active' ? 'Premium Mitra' : 'Trial Mitra'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800 w-fit max-w-[200px]">
                        <LinkIcon size={12} className="text-slate-500 shrink-0" />
                        <span className="font-mono text-xs text-blue-400 truncate">?ref={aff.referral_id}</span>
                        <button 
                          onClick={() => handleCopyLink(aff.referral_id)}
                          className="ml-2 p-1 text-slate-500 hover:text-white transition-colors tooltip shrink-0"
                          title="Copy Full URL"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono">{aff.affiliate_clicks}</td>
                    <td className="px-6 py-4 text-center font-mono text-amber-400">{aff.total_daftar}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-emerald-400">{aff.total_paid}</td>
                    <td className="px-6 py-4 text-right font-bold text-pink-400">
                      {formatCurrency(aff.total_komisi)}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedWaTarget({
                            name: aff.nama_usaha,
                            phone: aff.whatsapp,
                            status: aff.status === 'Premium' || aff.subscription_status === 'active' ? 'Premium Mitra' : 'Trial Mitra',
                            id: aff.id,
                            category: 'Bisnis' // fallback
                          });
                          setWaModalOpen(true);
                        }}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 tooltip"
                        title="Chat via Fonnte"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button 
                        onClick={() => setSelectedAffiliate(aff)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL DETAIL AFILIASI */}
      {selectedAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedAffiliate(null)}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-black text-white">Detail Performa Afiliasi</h2>
                <p className="text-sm text-slate-400">Rincian performa dan log konversi referral.</p>
              </div>
              <button 
                onClick={() => setSelectedAffiliate(null)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Bagian 1: PROFIL & KONTROL */}
              <div className="flex flex-col md:flex-row gap-6 p-5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAffiliate.nama_usaha}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 font-mono">{selectedAffiliate.whatsapp}</span>
                      <a 
                        href={`https://wa.me/${selectedAffiliate.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" rel="noreferrer"
                        className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle size={10} /> Chat
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Link Referral Unik</p>
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 w-fit">
                      <LinkIcon size={12} className="text-slate-400" />
                      <span className="font-mono text-xs text-blue-400 truncate max-w-[200px] sm:max-w-xs">https://logaritma.id?ref={selectedAffiliate.referral_id}</span>
                      <button 
                        onClick={() => handleCopyLink(selectedAffiliate.referral_id)}
                        className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-md transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Kemitraan</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg w-fit">
                    <CheckCircle2 size={14} /> Aktif Berhak Komisi 40%
                  </div>
                </div>
              </div>

              {/* Bagian 2: RINGKASAN SALDO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Saldo Terkumpul</p>
                  <p className="text-lg font-black text-white">{formatCurrency(selectedAffiliate.total_komisi)}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Komisi Dicairkan</p>
                  <p className="text-lg font-black text-slate-400">{formatCurrency(selectedAffiliate.payout_terbayar)}</p>
                </div>
                <div className="bg-slate-900 border border-pink-500/30 p-4 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-pink-400/80 mb-1 flex items-center gap-1.5"><Wallet size={12}/> Sisa Saldo Siap Tarik</p>
                  <p className="text-lg font-black text-pink-400">{formatCurrency(selectedAffiliate.total_komisi - selectedAffiliate.payout_terbayar)}</p>
                </div>
              </div>

              {/* Bagian 3: TABEL DAFTAR MERCHANT RUJUKAN */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  Daftar Merchant Rujukan (Referral Breakdown)
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-md">{selectedAffiliate.total_daftar}</span>
                </h3>
                
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-800">Nama Toko Rujukan</th>
                        <th className="px-4 py-3 border-b border-slate-800">Tanggal Daftar</th>
                        <th className="px-4 py-3 border-b border-slate-800 text-center">Status</th>
                        <th className="px-4 py-3 border-b border-slate-800 text-right">Nilai Komisi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {selectedAffiliate.referred_list.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500 italic">Belum ada merchant yang mendaftar melalui link referral toko ini.</td></tr>
                      ) : (
                        selectedAffiliate.referred_list.map(ref => (
                          <tr key={ref.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-300">{ref.nama_usaha}</p>
                              <p className="text-[10px] text-slate-500">{ref.kategori_usaha}</p>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {new Date(ref.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${ref.is_paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                {ref.is_paid ? 'Paid' : 'Trial'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-pink-400">
                              {ref.is_paid ? formatCurrency(19600) : 'Rp 0'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <WhatsappDispatcherModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        targetName={selectedWaTarget.name}
        targetPhone={selectedWaTarget.phone}
        merchantStatus={selectedWaTarget.status}
        merchantId={selectedWaTarget.id}
        kategoriUsaha={selectedWaTarget.category}
      />
    </div>
  );
}
