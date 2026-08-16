'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Copy, Eye, EyeOff, ShoppingBag, Laptop } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  type: string; // 'DIGITAL_SERVICE' | 'HARDWARE_AFFILIATE'
  price: number;
  affiliate_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'HARDWARE' | 'DIGITAL'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'HARDWARE_AFFILIATE',
    price: 0,
    affiliate_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ecosystem_products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat katalog: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        type: product.type,
        price: product.price,
        affiliate_url: product.affiliate_url || '',
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: 'HARDWARE_AFFILIATE',
        price: 0,
        affiliate_url: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Nama produk wajib diisi');

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        price: formData.price,
        affiliate_url: formData.affiliate_url || null,
        is_active: formData.is_active
      };

      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('ecosystem_products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Produk berhasil diperbarui');
      } else {
        // Insert
        const { error } = await supabase
          .from('ecosystem_products')
          .insert([payload]);
        if (error) throw error;
        toast.success('Produk baru berhasil ditambahkan');
      }

      await fetchProducts();
      handleCloseModal();
    } catch (error: any) {
      toast.error('Gagal menyimpan produk: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleCopyLink = (url: string | null) => {
    if (!url) return toast.error('Tidak ada link untuk disalin');
    navigator.clipboard.writeText(url);
    toast.success('Link tersalin ke clipboard!');
  };

  // Filter products by tab
  const filteredProducts = products.filter(p => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'HARDWARE') return p.type === 'HARDWARE_AFFILIATE';
    if (activeTab === 'DIGITAL') return p.type === 'DIGITAL_SERVICE';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/30">
              <Store size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Ecosystem Store</h1>
          </div>
          <p className="text-slate-400 text-sm">Katalog Toko Pusat untuk suplai operasional (Hardware & Jasa).</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20"
        >
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {/* TAB FILTERS */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${activeTab === 'ALL' ? 'text-white border-orange-500 bg-slate-800/50' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Semua Produk
        </button>
        <button 
          onClick={() => setActiveTab('HARDWARE')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'HARDWARE' ? 'text-white border-orange-500 bg-slate-800/50' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          <ShoppingBag size={14} /> Hardware (Shopee)
        </button>
        <button 
          onClick={() => setActiveTab('DIGITAL')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'DIGITAL' ? 'text-white border-orange-500 bg-slate-800/50' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          <Laptop size={14} /> Jasa Digital
        </button>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"></div>)
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
            Belum ada produk di kategori ini.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className={`bg-slate-900 border p-5 rounded-2xl transition-all ${p.is_active ? 'border-slate-800 hover:border-orange-500/30' : 'border-slate-800/50 opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${p.type === 'HARDWARE_AFFILIATE' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                  {p.type.replace('_', ' ')}
                </span>
                {p.is_active ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md"><Eye size={12}/> Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-800 px-2 py-0.5 rounded-md"><EyeOff size={12}/> Hidden</span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-200 mb-2 leading-tight">{p.name}</h3>
              <p className="text-xl font-black text-white font-mono mb-4">{formatCurrency(p.price)}</p>
              
              <div className="flex gap-2 pt-4 border-t border-slate-800/50">
                <button 
                  onClick={() => handleCopyLink(p.affiliate_url)}
                  disabled={!p.affiliate_url}
                  className="flex-1 flex justify-center items-center gap-2 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-800"
                >
                  <Copy size={14} /> Copy Link
                </button>
                <button 
                  onClick={() => handleOpenModal(p)}
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH / EDIT PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h2 className="text-lg font-black text-white">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Item</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500/50"
                  placeholder="e.g. Printer Bluetooth"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500/50 appearance-none"
                >
                  <option value="HARDWARE_AFFILIATE">Hardware Kasir (Shopee Affiliate)</option>
                  <option value="DIGITAL_SERVICE">Layanan Jasa Digital</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Taksiran / Fee (Rp)</label>
                <input 
                  type="number" 
                  required min="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500/50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL Affiliate / Payment Link</label>
                <input 
                  type="url" 
                  value={formData.affiliate_url}
                  onChange={e => setFormData({...formData, affiliate_url: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500/50"
                  placeholder="https://shope.ee/..."
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-bold text-white">Status Tampil</p>
                  <p className="text-xs text-slate-500">Tampilkan ke halaman merchant.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
