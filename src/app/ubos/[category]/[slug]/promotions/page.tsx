'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Megaphone, Plus, X, Tag, Percent, Calendar, Clock, CheckCircle, Trash2, Edit3, Gift, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Promo {
  id: string;
  nama_promo: string;
  tipe: 'persen' | 'nominal';
  nilai: number;
  kode_kupon?: string;
  berlaku_hingga?: string;
  min_pembelian?: number;
  aktif: boolean;
  created_at: string;
}

export default function PromotionsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nama_promo: '',
    tipe: 'persen' as 'persen' | 'nominal',
    nilai: '',
    kode_kupon: '',
    berlaku_hingga: '',
    min_pembelian: '',
  });

  const formatIDR = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: m } = await supabase.from('merchants').select('id, nama_usaha').eq('user_id', user.id).single();
      if (!m) return;
      setMerchant(m);

      const { data: promoData } = await supabase
        .from('promotions')
        .select('*')
        .eq('merchant_id', m.id)
        .order('created_at', { ascending: false });
      setPromos(promoData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_promo || !form.nilai) {
      toast.error('Nama promo dan nilai wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        merchant_id: merchant.id,
        nama_promo: form.nama_promo,
        tipe: form.tipe,
        nilai: parseInt(form.nilai) || 0,
        kode_kupon: form.kode_kupon || null,
        berlaku_hingga: form.berlaku_hingga || null,
        min_pembelian: parseInt(form.min_pembelian) || 0,
        aktif: true,
      };
      const { error } = await supabase.from('promotions').insert([payload]);
      if (error) throw error;

      toast.success('Promo berhasil dibuat!');
      setShowModal(false);
      setForm({ nama_promo: '', tipe: 'persen', nilai: '', kode_kupon: '', berlaku_hingga: '', min_pembelian: '' });
      fetchData();
    } catch (err: any) {
      // If table doesn't exist, show a friendly message
      if (err?.code === '42P01') {
        toast.error('Tabel promosi belum tersedia. Hubungi admin untuk mengaktifkan fitur ini.');
      } else {
        toast.error('Gagal menyimpan promo. Coba lagi.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo: Promo) => {
    try {
      await supabase.from('promotions').update({ aktif: !promo.aktif }).eq('id', promo.id);
      setPromos(promos.map(p => p.id === promo.id ? { ...p, aktif: !p.aktif } : p));
      toast.success(promo.aktif ? 'Promo dinonaktifkan' : 'Promo diaktifkan!');
    } catch {
      toast.error('Gagal mengubah status promo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus promo ini?')) return;
    try {
      await supabase.from('promotions').delete().eq('id', id);
      setPromos(promos.filter(p => p.id !== id));
      toast.success('Promo dihapus');
    } catch {
      toast.error('Gagal menghapus promo');
    }
  };

  const isExpired = (date?: string) => date ? new Date(date) < new Date() : false;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone size={24} className="text-[#4F75FF]" />
            Promosi & Diskon
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Buat dan kelola kupon serta diskon untuk pelanggan Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#4F75FF] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Buat Promo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Promo', value: promos.length, icon: Tag, color: 'bg-blue-50 text-[#4F75FF]' },
          { label: 'Promo Aktif', value: promos.filter(p => p.aktif && !isExpired(p.berlaku_hingga)).length, icon: Zap, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Sudah Berakhir', value: promos.filter(p => isExpired(p.berlaku_hingga)).length, icon: Clock, color: 'bg-rose-50 text-rose-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-[#4F75FF]" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">Belum ada promo</h3>
          <p className="text-slate-500 text-sm mb-5">Buat promo pertama Anda untuk menarik lebih banyak pelanggan!</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#4F75FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Buat Promo Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const expired = isExpired(promo.berlaku_hingga);
            return (
              <div key={promo.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${expired ? 'border-slate-100 opacity-60' : 'border-slate-100'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${promo.aktif && !expired ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  {promo.tipe === 'persen' ? <Percent size={22} className={promo.aktif && !expired ? 'text-[#4F75FF]' : 'text-slate-400'} /> : <Tag size={22} className={promo.aktif && !expired ? 'text-[#4F75FF]' : 'text-slate-400'} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{promo.nama_promo}</h3>
                    {promo.aktif && !expired && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">AKTIF</span>}
                    {expired && <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">BERAKHIR</span>}
                    {!promo.aktif && !expired && <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">NONAKTIF</span>}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Diskon {promo.tipe === 'persen' ? `${promo.nilai}%` : formatIDR(promo.nilai)}
                    {promo.kode_kupon && <span className="ml-2 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{promo.kode_kupon}</span>}
                    {promo.berlaku_hingga && <span className="ml-2">· Hingga {new Date(promo.berlaku_hingga).toLocaleDateString('id-ID')}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(promo)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${promo.aktif && !expired ? 'bg-[#4F75FF]' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${promo.aktif && !expired ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Promo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
                <Megaphone size={20} className="text-[#4F75FF]" />
                Buat Promo Baru
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Promo *</label>
                <input type="text" value={form.nama_promo} onChange={e => setForm({ ...form, nama_promo: e.target.value })}
                  placeholder="Contoh: Diskon Akhir Bulan" required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#4F75FF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Diskon *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['persen', 'nominal'] as const).map(tipe => (
                    <button key={tipe} type="button" onClick={() => setForm({ ...form, tipe })}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-colors border ${form.tipe === tipe ? 'bg-[#4F75FF] text-white border-[#4F75FF]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {tipe === 'persen' ? '% Persentase' : 'Rp Nominal'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nilai Diskon * {form.tipe === 'persen' ? '(%)' : '(Rp)'}</label>
                <input type="number" value={form.nilai} onChange={e => setForm({ ...form, nilai: e.target.value })}
                  placeholder={form.tipe === 'persen' ? 'Contoh: 20' : 'Contoh: 10000'} required min="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#4F75FF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kode Kupon <span className="text-slate-400 font-normal">(opsional)</span></label>
                <input type="text" value={form.kode_kupon} onChange={e => setForm({ ...form, kode_kupon: e.target.value.toUpperCase() })}
                  placeholder="Contoh: UBOS10"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-[#4F75FF] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Berlaku Hingga <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input type="date" value={form.berlaku_hingga} onChange={e => setForm({ ...form, berlaku_hingga: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#4F75FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Min. Pembelian (Rp) <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input type="number" value={form.min_pembelian} onChange={e => setForm({ ...form, min_pembelian: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#4F75FF] transition-colors"
                  />
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-[#4F75FF] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><CheckCircle size={18} />Simpan Promo</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
