'use client';

import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Wallet, Handshake, Copy, MessageCircle, Megaphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import HeaderAiTrigger from '@/components/ubos/HeaderAiTrigger';
import { useMerchant } from '@/contexts/MerchantContext';

const themeColorMap: Record<string, { bg: string, text: string, border: string, light: string, hover: string }> = {
  kuliner: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
  percetakan: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
  ritel: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  jasa: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', hover: 'hover:bg-sky-600' },
  default: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', hover: 'hover:bg-blue-600' },
};

export default function AffiliatePage() {
  const router = useRouter();
  const params = useParams();
  const theme = themeColorMap[(params.category as string)?.toLowerCase()] || themeColorMap.default;
  const { merchant } = useMerchant();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ bank_name: 'BCA', account_number: '', account_name: '', amount: '' });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getRefLink = () => {
    if (!merchant) return 'https://logaritma.id';
    const slugBasis = merchant.slug || (merchant.nama_usaha ? generateSlug(merchant.nama_usaha) : merchant.id || merchant.no_wa);
    return `https://logaritma.id?ref=${slugBasis}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getRefLink());
    toast.success('Link Referral disalin!');
  };

  const safeOpenUrl = (url?: string) => {
    if (!url || typeof window === 'undefined') return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open URL', error);
    }
  };

  const handleShareWA = () => {
    const text = `Halo kawan bisnis! Saya pakai Logaritma UBOS buat rapihin laporan & kunci profit usaha. Coba gratis 7 hari pake link rekomendasi saya ini ya: ${getRefLink()}`;
    safeOpenUrl(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleSubmitPayout = async (e: FormEvent) => {
    e.preventDefault();
    if (!merchant?.id) {
      toast.error('Gagal memproses. Sesi merchant tidak valid.');
      return;
    }
    const { amount, bank_name, account_number, account_name } = payoutForm;
    if (Number(amount) < 50000) {
      toast.error('Minimum penarikan saldo adalah Rp 50.000');
      return;
    }

    setIsSubmittingPayout(true);
    const loadingToast = toast.loading('Memproses pengajuan tarik saldo...');
    try {
      const res = await fetch('/api/affiliate/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchant.id,
          bank_name,
          account_number,
          account_name,
          amount: Number(amount)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pencairan');
      }
      
      toast.success('Pengajuan berhasil! Dana sedang diproses.', { id: loadingToast });
      setShowPayoutModal(false);
      setPayoutForm({ bank_name: 'BCA', account_number: '', account_name: '', amount: '' });
    } catch (err: any) {
      toast.error('Gagal mengajukan penarikan: ' + err.message, { id: loadingToast });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-10 bg-slate-50 min-h-screen">
      {/* Header Bersih */}
      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-10 w-full mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center flex-wrap gap-3">
            <Handshake className={theme.text} size={28} />
            Program Afiliasi
            <HeaderAiTrigger />
          </h1>
          <p className="text-slate-500 mt-1">Hasilkan komisi berulang dengan membagikan Logaritma ke rekan pengusaha Anda.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-20 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Klik Link</p>
            <p className="text-2xl font-black text-slate-900">{merchant?.affiliate_clicks || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Leads Mendaftar</p>
            <p className="text-2xl font-black text-slate-900">{merchant?.affiliate_leads || 0}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Premium Aktif</p>
            <p className="text-2xl font-black text-slate-900">{merchant?.affiliate_converted || 0}</p>
          </div>
          <div className={`${theme.bg} rounded-2xl p-5 shadow-sm text-white relative overflow-hidden transform hover:-translate-y-1 transition-transform`}>
            <Wallet size={64} className="absolute -right-4 -bottom-4 opacity-10" />
            <p className="text-xs text-white/80 font-bold uppercase mb-1 relative z-10">Saldo Komisi</p>
            <p className="text-2xl font-black relative z-10">Rp {(merchant?.commission_balance || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className={`${theme.light} border-b ${theme.border} p-6 flex items-center justify-between relative overflow-hidden`}>
            <div className="relative z-10">
              <div className={`text-[10px] font-black uppercase tracking-wider ${theme.text} mb-1 flex items-center gap-2`}><Handshake size={14}/> Affiliate Dashboard</div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">Sebarkan & Dapatkan 40%</h3>
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Link Referral Unik Anda</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 overflow-x-auto whitespace-nowrap">
                  {getRefLink()}
                </div>
                <button onClick={handleCopyLink} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0">
                  <Copy size={16} /> Salin Link
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button onClick={handleShareWA} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <MessageCircle size={18} /> Share ke WhatsApp
              </button>
              <button onClick={() => setShowPayoutModal(true)} className="w-full btn-gradient-primary font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2">
                <Wallet size={18} /> Tarik Saldo Komisi
              </button>
            </div>
          </div>
        </div>

        {/* Marketing Kit */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2"><Megaphone size={20} className={theme.text} /> Marketing Kit Siap Pakai</h3>
          <p className="text-sm text-slate-500 mb-6">Tinggal *copy-paste* teks di bawah ini ke Story WhatsApp, Grup, atau Caption Instagram.</p>

          <div className="space-y-4">
            {[
              { title: 'Teks WA Santai (Teman/Kenalan)', text: `Halo kawan bisnis! 👋\n\nSaya lagi pakai Logaritma UBOS nih buat rapihin laporan & kunci profit usaha. Beneran praktis banget buat pantau HPP & penjualan tiap hari.\n\nKebetulan ada free trial 7 hari, cobain deh pake link rekomendasi saya ini:\n${getRefLink()}\n\nSemoga bisnis makin lancar ya! 🚀` },
              { title: 'Caption Instagram / Facebook', text: `Capek ngurusin stok berantakan & duit bocor gak ketahuan? 😫\n\nSama, dulu saya juga gitu. Sampai akhirnya pakai Logaritma UBOS! Sistem kasir sekaligus pencatat HPP yang super detail & gampang banget dipakainya.\n\nBuat temen-temen pengusaha yang mau rapihin sistem, yuk cobain gratis 7 hari klik link di bawah ini 👇\n\n${getRefLink()}\n\n#LogaritmaUBOS #SistemKasir #SolusiBisnis #UMKMNaikKelas` },
              { title: 'Teks Ajakan Grup Pengusaha', text: `Izin share buat teman-teman di grup 🙏\n\nBuat yang lagi pusing cari sistem kasir yang bisa misahin komisi Gofood/Grabfood otomatis dan ngitung HPP detail, saya highly recommend pakai *Logaritma UBOS*.\n\nSistemnya dirancang khusus buat cegah kebocoran profit. Mumpung lagi ada free trial 7 hari, bisa langsung daftar lewat link ini ya:\n${getRefLink()}` }
            ].map((kit, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-800">{kit.title}</span>
                  <button onClick={() => { navigator.clipboard.writeText(kit.text); toast.success('Teks disalin!'); }} className="text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    Salin Teks
                  </button>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{kit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Tarik Saldo Komisi</h2>
              <p className="text-sm text-slate-500 mt-1">Saldo saat ini: Rp {(merchant?.commission_balance || 0).toLocaleString('id-ID')}</p>
            </div>
            <form onSubmit={handleSubmitPayout} className="p-6 space-y-4 bg-slate-50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Jumlah Penarikan (Rp)</label>
                <input required type="number" min="50000" max={merchant?.commission_balance || 0} value={payoutForm.amount} onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-colors" placeholder="Min. 50000" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Bank Tujuan</label>
                <select value={payoutForm.bank_name} onChange={e => setPayoutForm({...payoutForm, bank_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-colors">
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">BSI</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="DANA">DANA</option>
                  <option value="ShopeePay">ShopeePay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nomor Rekening / E-Wallet</label>
                <input required type="text" value={payoutForm.account_number} onChange={e => setPayoutForm({...payoutForm, account_number: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-colors" placeholder="08123456xxx atau 12345678" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Pemilik Rekening</label>
                <input required type="text" value={payoutForm.account_name} onChange={e => setPayoutForm({...payoutForm, account_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-colors" placeholder="Ahmad Syafiq" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPayoutModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmittingPayout} className="flex-1 btn-gradient-primary font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                  {isSubmittingPayout ? <Loader2 size={18} className="animate-spin" /> : 'Tarik Dana'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
