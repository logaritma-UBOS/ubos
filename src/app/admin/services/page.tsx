'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Printer, Megaphone, ShoppingBag, Code2,
  Plus, ExternalLink, Clock, Loader2, RefreshCw,
  Package, X, CheckCircle2, AlertTriangle, DollarSign,
  TrendingUp, ChevronRight, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const META_ADS_PACKAGES = [
  { name: 'Paket 7 Hari', price: 150000, duration: 7, description: 'Boost awareness awal, cocok untuk launching produk baru', tag: 'STARTER' },
  { name: 'Paket 14 Hari', price: 250000, duration: 14, description: 'Optimal untuk promosi menu baru & event spesial', tag: 'POPULAR' },
  { name: 'Paket 30 Hari', price: 450000, duration: 30, description: 'Full campaign bulanan, ROI maksimal & jangkauan luas', tag: 'BEST VALUE' },
];

const SHOPEE_ITEMS = [
  { name: 'Mini Printer Thermal 58mm', link: 'https://shopee.co.id', commission: '5-8%', price: 'Rp 185.000', category: 'Hardware' },
  { name: 'Kertas Thermal Roll 57x40mm (10 pcs)', link: 'https://shopee.co.id', commission: '3-5%', price: 'Rp 45.000', category: 'Supplies' },
  { name: 'Handphone Kasir Android 6" (Rekomen)', link: 'https://shopee.co.id', commission: '2-4%', price: 'Rp 850.000', category: 'Hardware' },
  { name: 'Stand / Holder HP untuk Kasir', link: 'https://shopee.co.id', commission: '4-6%', price: 'Rp 55.000', category: 'Accessories' },
  { name: 'Cash Drawer Laci Kasir', link: 'https://shopee.co.id', commission: '4-7%', price: 'Rp 280.000', category: 'Hardware' },
];

const statusColor = (status: string) => {
  if (status === 'Selesai' || status === 'Done' || status === 'Closed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (status === 'Proses' || status === 'On Progress') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (status === 'Proposal' || status === 'Pending') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
};

const tabBorderActive: Record<string, string> = {
  cetak: 'border-blue-500 text-white',
  ads: 'border-purple-500 text-white',
  shopee: 'border-amber-500 text-white',
  custom: 'border-emerald-500 text-white',
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'cetak' | 'ads' | 'shopee' | 'custom'>('cetak');
  const [loading, setLoading] = useState(false);

  // Cetak orders from DB or fallback to local state
  const [cetakOrders, setCetakOrders] = useState<any[]>([
    { id: 'c1', merchant: 'Warung Sarapan Pak Budi', type: 'Stiker A5 (100 pcs)', status: 'Proses', date: '2026-08-05', price: 75000 },
    { id: 'c2', merchant: 'Kopi Kangen', type: 'Foto Produk (5 foto)', status: 'Selesai', date: '2026-08-04', price: 150000 },
    { id: 'c3', merchant: 'Nasi Bebek Madura', type: 'Spanduk 3x1m', status: 'Pending', date: '2026-08-06', price: 120000 },
  ]);
  const [customProjects, setCustomProjects] = useState<any[]>([
    { id: 'p1', client: 'PT. Maju Bersama', project: 'Custom Sistem Kasir Multi-Outlet', status: 'On Progress', value: 5000000, deadline: '2026-09-01' },
    { id: 'p2', client: 'Franchise Bakso Nusantara', project: 'Integrasi Laporan Keuangan', status: 'Proposal', value: 3500000, deadline: '2026-10-15' },
  ]);

  // Modal state
  const [isCetakModalOpen, setIsCetakModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [cetakForm, setCetakForm] = useState({ merchant: '', type: '', price: '', date: new Date().toISOString().split('T')[0], status: 'Pending' });
  const [customForm, setCustomForm] = useState({ client: '', project: '', value: '', deadline: '', status: 'Proposal' });

  const cetakRevenue = cetakOrders.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.price), 0);
  const customRevenue = customProjects.reduce((s, p) => s + Number(p.value), 0);
  const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  const tabs = [
    { id: 'cetak', label: 'Cetak & Branding', icon: Printer, color: 'blue' },
    { id: 'ads', label: 'Meta Ads Manager', icon: Megaphone, color: 'purple' },
    { id: 'shopee', label: 'Shopee Affiliate', icon: ShoppingBag, color: 'amber' },
    { id: 'custom', label: 'Custom Project', icon: Code2, color: 'emerald' },
  ];

  const addCetakOrder = () => {
    if (!cetakForm.merchant || !cetakForm.type || !cetakForm.price) return;
    setCetakOrders(prev => [...prev, { id: Date.now().toString(), ...cetakForm, price: parseFloat(cetakForm.price) }]);
    setCetakForm({ merchant: '', type: '', price: '', date: new Date().toISOString().split('T')[0], status: 'Pending' });
    setIsCetakModalOpen(false);
    toast.success('Order cetak ditambahkan!');
  };

  const addCustomProject = () => {
    if (!customForm.client || !customForm.project || !customForm.value) return;
    setCustomProjects(prev => [...prev, { id: Date.now().toString(), ...customForm, value: parseFloat(customForm.value) }]);
    setCustomForm({ client: '', project: '', value: '', deadline: '', status: 'Proposal' });
    setIsCustomModalOpen(false);
    toast.success('Custom project ditambahkan!');
  };

  const updateCetakStatus = (id: string, status: string) => {
    setCetakOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const updateProjectStatus = (id: string, status: string) => {
    setCustomProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Ecosystem Services Hub</h2>
        <p className="text-sm text-slate-400 font-medium">Kelola semua layanan tambahan ekosistem Logaritma</p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cetak & Branding', value: fmt(cetakRevenue), icon: Printer, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', sub: `${cetakOrders.filter(o=>o.status==='Selesai').length} selesai` },
          { label: 'Meta Ads (Active)', value: 'Rp 0', icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', sub: '0 campaign aktif' },
          { label: 'Shopee Komisi (Est.)', value: 'Rp 0', icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', sub: `${SHOPEE_ITEMS.length} produk terdaftar` },
          { label: 'Custom Project', value: fmt(customRevenue), icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', sub: `${customProjects.length} project` },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${s.bg}`}>
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{s.label}</p>
            <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === tab.id
                ? `${tabBorderActive[tab.id]} bg-slate-900`
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

        {/* CETAK */}
        {activeTab === 'cetak' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Printer size={20} className="text-blue-400" /> Log Pesanan Cetak & Branding
              </h3>
              <button
                onClick={() => setIsCetakModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} /> Tambah Order
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-800">
                  {['Merchant', 'Jenis', 'Harga', 'Tanggal', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="p-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-800/50">
                  {cetakOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-200">{o.merchant}</td>
                      <td className="p-3 text-slate-400 text-xs">{o.type}</td>
                      <td className="p-3 font-bold text-emerald-400">{fmt(o.price)}</td>
                      <td className="p-3 text-slate-400 text-xs">{o.date}</td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={e => updateCetakStatus(o.id, e.target.value)}
                          className={`text-xs font-black px-2 py-1 rounded-full border bg-transparent cursor-pointer ${statusColor(o.status)}`}
                        >
                          {['Pending', 'Proses', 'Selesai'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                        <button onClick={() => setCetakOrders(prev => prev.filter(x => x.id !== o.id))}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cetakOrders.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada order cetak</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* META ADS */}
        {activeTab === 'ads' && (
          <div className="p-6">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Megaphone size={20} className="text-purple-400" /> Meta Ads Manager Hub
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {META_ADS_PACKAGES.map((pkg, i) => (
                <div key={i} className="relative p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-purple-500/40 transition-all group">
                  {pkg.tag === 'POPULAR' && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-black bg-purple-600 text-white px-2.5 py-1 rounded-full">POPULAR</span>
                    </div>
                  )}
                  {pkg.tag === 'BEST VALUE' && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-full">BEST VALUE</span>
                    </div>
                  )}
                  <h4 className="font-black text-white text-lg mb-1">{pkg.name}</h4>
                  <p className="text-2xl font-black text-purple-400 mb-2">Rp {pkg.price.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{pkg.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} /> {pkg.duration} hari campaign aktif
                  </div>
                  <button className="mt-4 w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-xl border border-purple-500/20 transition-colors">
                    Buat Campaign Baru
                  </button>
                </div>
              ))}
            </div>
            <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <p className="text-sm font-black text-purple-300 mb-2">📋 Alur Kerja Meta Ads:</p>
              <div className="flex flex-wrap gap-2 text-xs text-purple-200/70">
                {['1. Merchant request paket', '2. Admin buat campaign di Meta Ads Manager', '3. Kirim link laporan ke merchant via Fonnte WA', '4. Catat revenue di Finance tab'].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={11} className="text-purple-400 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHOPEE */}
        {activeTab === 'shopee' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag size={20} className="text-amber-400" /> Shopee Affiliate Hardware Catalog
              </h3>
              <div className="text-right">
                <p className="text-xs text-slate-500">Est. Komisi / Transaksi</p>
                <p className="text-sm font-black text-amber-400">Rp 5.000 – Rp 50.000</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {SHOPEE_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-amber-500/30 transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/30 transition-colors">
                    <Package size={24} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{item.price}</span>
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Komisi: <span className="text-amber-400 font-bold">{item.commission}</span></p>
                  </div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/20 transition-colors shrink-0">
                    <ExternalLink size={12} /> Link
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-sm font-bold text-amber-300">
                💡 Pasang link referral Shopee Affiliate di Member Area UBOS untuk auto-tracking komisi setiap transaksi hardware dari merchant.
              </p>
            </div>
          </div>
        )}

        {/* CUSTOM PROJECT */}
        {activeTab === 'custom' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Code2 size={20} className="text-emerald-400" /> Custom Enterprise Project Pipeline
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} /> Tambah Project
              </button>
            </div>

            {/* Pipeline stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Proposal', count: customProjects.filter(p=>p.status==='Proposal').length, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: 'On Progress', count: customProjects.filter(p=>p.status==='On Progress').length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { label: 'Selesai', count: customProjects.filter(p=>p.status==='Done'||p.status==='Closed').length, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-xl border text-center ${s.color}`}>
                  <p className="text-2xl font-black">{s.count}</p>
                  <p className="text-xs font-bold opacity-80 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {customProjects.map(p => (
                <div key={p.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white truncate">{p.project}</p>
                      <p className="text-sm text-slate-400 mt-1">{p.client}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-400">{fmt(p.value)}</p>
                      </div>
                      <select
                        value={p.status}
                        onChange={e => updateProjectStatus(p.id, e.target.value)}
                        className={`text-xs font-black px-2 py-1 rounded-full border bg-transparent cursor-pointer ${statusColor(p.status)}`}
                      >
                        {['Proposal', 'On Progress', 'Done', 'Closed'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                      </select>
                      <button onClick={() => setCustomProjects(prev => prev.filter(x => x.id !== p.id))}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {p.deadline && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <Clock size={12} /> Deadline: {p.deadline}
                    </div>
                  )}
                </div>
              ))}
              {customProjects.length === 0 && (
                <div className="text-center py-12">
                  <Code2 size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">Belum ada custom project</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Cetak Modal */}
      {isCetakModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-white text-lg">Tambah Order Cetak</h3>
              <button onClick={() => setIsCetakModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nama Merchant', key: 'merchant', placeholder: 'Warung Pak Budi', type: 'text' },
                { label: 'Jenis Produk Cetak', key: 'type', placeholder: 'Stiker A5 (100 pcs)', type: 'text' },
                { label: 'Harga (Rp)', key: 'price', placeholder: '75000', type: 'number' },
                { label: 'Tanggal', key: 'date', placeholder: '', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-400 uppercase">{f.label}</label>
                  <input
                    type={f.type}
                    value={(cetakForm as any)[f.key]}
                    onChange={e => setCetakForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsCetakModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors">Batal</button>
                <button onClick={addCetakOrder} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Project Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-white text-lg">Tambah Custom Project</h3>
              <button onClick={() => setIsCustomModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nama Client', key: 'client', placeholder: 'PT. ABC Indonesia', type: 'text' },
                { label: 'Nama Project', key: 'project', placeholder: 'Custom POS System', type: 'text' },
                { label: 'Nilai Project (Rp)', key: 'value', placeholder: '5000000', type: 'number' },
                { label: 'Deadline', key: 'deadline', placeholder: '', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-400 uppercase">{f.label}</label>
                  <input
                    type={f.type}
                    value={(customForm as any)[f.key]}
                    onChange={e => setCustomForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsCustomModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors">Batal</button>
                <button onClick={addCustomProject} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
