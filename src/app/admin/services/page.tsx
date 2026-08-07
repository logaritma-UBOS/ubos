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
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<'CETAK' | 'META_ADS' | 'SHOPEE' | 'CUSTOM'>('CETAK');
  
  const [formData, setFormData] = useState({
    merchant_name: '',
    service_type: '',
    price: '',
    status: 'Pending'
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ecosystem_orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching orders:", error);
        // Fallback aman jika tabel tidak ada
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Fallback catch:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cetakOrders = orders.filter(o => o.category === 'CETAK');
  const customProjects = orders.filter(o => o.category === 'CUSTOM');
  const metaAds = orders.filter(o => o.category === 'META_ADS');
  const shopeeOrders = orders.filter(o => o.category === 'SHOPEE');

  const cetakRevenue = cetakOrders.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.price), 0);
  const adsRevenue = metaAds.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.price), 0);
  const shopeeRevenue = shopeeOrders.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.price), 0);
  const customRevenue = customProjects.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.price), 0);

  const fmt = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

  const tabs = [
    { id: 'cetak', label: 'Cetak & Branding', icon: Printer, color: 'blue' },
    { id: 'ads', label: 'Meta Ads Manager', icon: Megaphone, color: 'purple' },
    { id: 'shopee', label: 'Shopee Affiliate', icon: ShoppingBag, color: 'amber' },
    { id: 'custom', label: 'Custom Project', icon: Code2, color: 'emerald' },
  ];

  const handleOpenModal = (category: 'CETAK' | 'META_ADS' | 'SHOPEE' | 'CUSTOM') => {
    setFormCategory(category);
    setFormData({ merchant_name: '', service_type: '', price: '', status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleAddOrder = async () => {
    if (!formData.merchant_name || !formData.service_type || !formData.price) {
      toast.error("Harap isi semua kolom wajib!");
      return;
    }

    const payload = {
      merchant_name: formData.merchant_name,
      service_type: formData.service_type,
      category: formCategory,
      price: parseFloat(formData.price),
      status: formData.status
    };

    try {
      const { data, error } = await supabase.from('ecosystem_orders').insert([payload]).select();
      if (error) throw error;
      
      setOrders(prev => [data[0], ...prev]);
      setIsModalOpen(false);
      toast.success('Order berhasil ditambahkan!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Gagal menambahkan order');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    // Optimistic update
    const previous = [...orders];
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    try {
      const { error } = await supabase.from('ecosystem_orders').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Status berhasil diupdate');
    } catch (err: any) {
      setOrders(previous); // Revert on failure
      toast.error('Gagal update status: ' + err.message);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Yakin ingin menghapus order ini?')) return;
    
    const previous = [...orders];
    setOrders(prev => prev.filter(o => o.id !== id));
    
    try {
      const { error } = await supabase.from('ecosystem_orders').delete().eq('id', id);
      if (error) throw error;
      toast.success('Order berhasil dihapus');
    } catch (err: any) {
      setOrders(previous);
      toast.error('Gagal menghapus order: ' + err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Ecosystem Services Hub</h2>
          <p className="text-sm text-slate-400 font-medium">Kelola semua layanan tambahan ekosistem Logaritma</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cetak & Branding', value: fmt(cetakRevenue), icon: Printer, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', sub: `${cetakOrders.length} total pesanan` },
          { label: 'Meta Ads', value: fmt(adsRevenue), icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', sub: `${metaAds.length} total campaign` },
          { label: 'Shopee Komisi', value: fmt(shopeeRevenue), icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', sub: `${shopeeOrders.length} total transaksi` },
          { label: 'Custom Project', value: fmt(customRevenue), icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', sub: `${customProjects.length} total project` },
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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden min-h-[400px]">

        {/* CETAK */}
        {activeTab === 'cetak' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Printer size={20} className="text-blue-400" /> Log Pesanan Cetak & Branding
              </h3>
              <button
                onClick={() => handleOpenModal('CETAK')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} /> Tambah Order
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-800">
                    {['Merchant', 'Jenis Layanan', 'Harga', 'Tanggal', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="p-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {cetakOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-200">{o.merchant_name}</td>
                        <td className="p-3 text-slate-400 text-xs">{o.service_type}</td>
                        <td className="p-3 font-bold text-emerald-400">{fmt(o.price)}</td>
                        <td className="p-3 text-slate-400 text-xs">{formatDate(o.created_at)}</td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`text-xs font-black px-2 py-1 rounded-full border bg-transparent cursor-pointer ${statusColor(o.status)}`}
                          >
                            {['Pending', 'Proses', 'Selesai'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <button onClick={() => deleteOrder(o.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cetakOrders.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada order cetak dari database</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* META ADS */}
        {activeTab === 'ads' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Megaphone size={20} className="text-purple-400" /> Meta Ads Manager Hub
              </h3>
              <button
                onClick={() => handleOpenModal('META_ADS')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} /> Tambah Campaign
              </button>
            </div>
            
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
                </div>
              ))}
            </div>
            
            <h4 className="font-bold text-white mb-3">Database Campaign</h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-800 bg-slate-800/20">
                    {['Merchant', 'Paket Ads', 'Harga', 'Tanggal', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="p-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {metaAds.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-200">{o.merchant_name}</td>
                        <td className="p-3 text-slate-400 text-xs">{o.service_type}</td>
                        <td className="p-3 font-bold text-emerald-400">{fmt(o.price)}</td>
                        <td className="p-3 text-slate-400 text-xs">{formatDate(o.created_at)}</td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`text-xs font-black px-2 py-1 rounded-full border bg-transparent cursor-pointer ${statusColor(o.status)}`}
                          >
                            {['Pending', 'Proses', 'Selesai'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <button onClick={() => deleteOrder(o.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {metaAds.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada campaign dari database</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SHOPEE */}
        {activeTab === 'shopee' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag size={20} className="text-amber-400" /> Shopee Affiliate Hub
              </h3>
              <button
                onClick={() => handleOpenModal('SHOPEE')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} /> Tambah Transaksi
              </button>
            </div>
            
            <h4 className="font-bold text-white mb-3">Database Transaksi Komisi</h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl mb-8">
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-800 bg-slate-800/20">
                    {['Merchant / Client', 'Produk / Transaksi', 'Nilai Komisi', 'Tanggal', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="p-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {shopeeOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-200">{o.merchant_name}</td>
                        <td className="p-3 text-slate-400 text-xs">{o.service_type}</td>
                        <td className="p-3 font-bold text-emerald-400">{fmt(o.price)}</td>
                        <td className="p-3 text-slate-400 text-xs">{formatDate(o.created_at)}</td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`text-xs font-black px-2 py-1 rounded-full border bg-transparent cursor-pointer ${statusColor(o.status)}`}
                          >
                            {['Pending', 'Proses', 'Selesai'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <button onClick={() => deleteOrder(o.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {shopeeOrders.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada komisi tercatat di database</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <h4 className="font-bold text-white mb-3">Referensi Hardware Catalog</h4>
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
                </div>
              ))}
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
                onClick={() => handleOpenModal('CUSTOM')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus size={16} /> Tambah Project
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Pending / Proposal', count: customProjects.filter(p=>p.status==='Pending').length, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: 'Proses', count: customProjects.filter(p=>p.status==='Proses').length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { label: 'Selesai', count: customProjects.filter(p=>p.status==='Selesai').length, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-xl border text-center ${s.color}`}>
                  <p className="text-2xl font-black">{s.count}</p>
                  <p className="text-xs font-bold opacity-80 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
              ) : customProjects.map(p => (
                <div key={p.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white truncate">{p.service_type}</p>
                      <p className="text-sm text-slate-400 mt-1">{p.merchant_name}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <Clock size={12} /> Dibuat: {formatDate(p.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-400">{fmt(p.price)}</p>
                      </div>
                      <select
                        value={p.status}
                        onChange={e => updateOrderStatus(p.id, e.target.value)}
                        className={`text-xs font-black px-2 py-1 rounded-full border bg-transparent cursor-pointer ${statusColor(p.status)}`}
                      >
                        {['Pending', 'Proses', 'Selesai'].map(s => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                      </select>
                      <button onClick={() => deleteOrder(p.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && customProjects.length === 0 && (
                <div className="text-center py-12">
                  <Code2 size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">Belum ada custom project dari database</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Add Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-white text-lg">
                Tambah Data: {
                  formCategory === 'CETAK' ? 'Cetak & Branding' :
                  formCategory === 'META_ADS' ? 'Meta Ads' :
                  formCategory === 'SHOPEE' ? 'Shopee Affiliate' : 'Custom Project'
                }
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Nama Merchant / Client</label>
                <input
                  type="text"
                  value={formData.merchant_name}
                  onChange={e => setFormData(prev => ({ ...prev, merchant_name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm"
                  placeholder="Contoh: PT. ABC atau Warung Budi"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Detail Jenis Layanan</label>
                <input
                  type="text"
                  value={formData.service_type}
                  onChange={e => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm"
                  placeholder="Contoh: Stiker Vinyl A5 100pcs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Harga / Nominal (Rp)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm"
                  placeholder="Contoh: 150000"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Status Awal</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Proses">Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors">Batal</button>
                <button onClick={handleAddOrder} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                  Simpan ke Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
