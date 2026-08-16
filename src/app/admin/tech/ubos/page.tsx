'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertCircle, Wrench, Search, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UbosModule {
  id: string;
  name: string;
  category: string;
  status: string;
  version: string;
  description: string;
  access_tier?: string;
  maintenance_reason?: string;
}

export default function TechUbosPage() {
  const [modules, setModules] = useState<UbosModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<UbosModule | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    status: 'active',
    version: '',
    description: '',
    access_tier: 'All Users (Trial & Paid)',
    maintenance_reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('ubos_modules')
        .select('*')
        .order('category');
      
      if (error) {
        if (error.code === '42P01') {
          console.warn('Table ubos_modules does not exist yet.');
          setModules([]);
        } else {
          throw error;
        }
      } else {
        setModules(data || []);
      }
    } catch (error: any) {
      toast.error('Gagal memuat UBOS Modules: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfig = (mod: UbosModule) => {
    setSelectedModule(mod);
    setFormData({
      status: mod.status,
      version: mod.version,
      description: mod.description || '',
      access_tier: mod.access_tier || 'All Users (Trial & Paid)',
      maintenance_reason: mod.maintenance_reason || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseConfig = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    
    setIsSubmitting(true);
    try {
      const updatePayload = {
        status: formData.status,
        version: formData.version,
        description: formData.description,
        access_tier: formData.access_tier,
        maintenance_reason: formData.status === 'maintenance' ? formData.maintenance_reason : null
      };

      const { error } = await supabase
        .from('ubos_modules')
        .update(updatePayload)
        .eq('id', selectedModule.id);

      if (error) throw error;

      // Update local state without full refresh
      setModules(modules.map(m => m.id === selectedModule.id ? { ...m, ...updatePayload } : m));
      
      toast.success('Konfigurasi modul berhasil diperbarui');
      handleCloseConfig();
    } catch (error: any) {
      toast.error('Gagal menyimpan konfigurasi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={12}/> };
      case 'maintenance': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Wrench size={12}/> };
      case 'coming soon':
      case 'beta': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <AlertCircle size={12}/> };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <CheckCircle2 size={12}/> };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Settings size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">UBOS Modules</h1>
          </div>
          <p className="text-slate-400 text-sm">Manajemen modul dan fitur untuk kategori Kuliner/F&B, Percetakan, dll.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari modul..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-emerald-500/50 text-sm w-64" 
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20">
            <Plus size={18} /> New Module
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"></div>)
        ) : filteredModules.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
            Belum ada modul terdaftar. Jalankan script SQL untuk mengisi data.
          </div>
        ) : (
          filteredModules.map((mod) => {
            const style = getStatusStyle(mod.status);
            return (
              <div key={mod.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    {mod.category}
                  </span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${style.color} ${style.bg} ${style.border}`}>
                    {style.icon} {mod.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">{mod.name}</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">{mod.description}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                  <span className="text-xs text-slate-500 font-mono">v{mod.version}</span>
                  <button 
                    onClick={() => handleOpenConfig(mod)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"
                  >
                    Konfigurasi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POP-UP MODAL KONFIGURASI */}
      {isModalOpen && selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseConfig}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-lg font-black text-white">Konfigurasi Modul</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedModule.name}</p>
              </div>
              <button onClick={handleCloseConfig} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Modul</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="coming soon">Coming Soon</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Versi Rilis</label>
                  <input 
                    type="text" 
                    value={formData.version}
                    onChange={e => setFormData({...formData, version: e.target.value})}
                    placeholder="e.g. v1.2.0"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hak Akses / Tier</label>
                <select 
                  value={formData.access_tier} 
                  onChange={e => setFormData({...formData, access_tier: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="All Users (Trial & Paid)">All Users (Trial & Paid)</option>
                  <option value="Premium Only (Rp49rb)">Premium Only (Rp49rb)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Singkat</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              {formData.status === 'maintenance' && (
                <div className="space-y-1.5 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4">
                  <label className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Notifikasi Kill Switch (Maintenance Reason)
                  </label>
                  <input 
                    type="text" 
                    value={formData.maintenance_reason}
                    onChange={e => setFormData({...formData, maintenance_reason: e.target.value})}
                    placeholder="Contoh: Fitur sedang dalam pemeliharaan berkala..."
                    className="w-full bg-slate-950 border border-amber-500/30 text-amber-100 text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-amber-500/70"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={handleCloseConfig}
                  className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Batal / Tutup
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
