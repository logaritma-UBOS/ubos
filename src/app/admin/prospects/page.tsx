'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Users, Search, Filter, Loader2, Plus, Upload, 
  MessageSquare, Copy, Sparkles, X, CheckCircle2, 
  ArrowRight, MessageCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProspectsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Copywriting States
  const [topic, setTopic] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ nama_usaha: '', no_wa: '', kategori: 'Kuliner & F&B' });
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setLeads(data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data prospects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generators & Actions
  const handleGenerateCopy = async () => {
    if (!topic.trim()) {
      toast.error('Masukkan topik atau penawaran terlebih dahulu');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/copilot/copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal generate copywriting');
      
      setGeneratedCopy(data.result);
      toast.success('Copywriting berhasil di-generate!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCopy) return;
    navigator.clipboard.writeText(generatedCopy);
    toast.success('Copywriting disalin ke clipboard!');
  };

  const handleFollowUpWA = (wa: string, namaUsaha: string) => {
    let message = generatedCopy || 'Halo Kak dari {nama_usaha}, ini dari Logaritma! Ada yang bisa kami bantu terkait optimasi bisnisnya?';
    // Replace variable
    message = message.replace(/{nama_usaha}/g, namaUsaha || 'Kakak');
    
    const cleanWa = (wa || '').replace(/\D/g, '').replace(/^0+/, '62');
    if (!cleanWa) {
      toast.error('Nomor WA tidak valid');
      return;
    }
    
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanWa}?text=${encodedMsg}`, '_blank');
    
    // Asumsi: update follow_up status local (atau di Supabase)
    // Untuk kesederhanaan, kita hanya buka link WA.
  };

  // Add Manual
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const { error } = await supabase.from('leads').insert([
        { 
          nama_usaha: newLead.nama_usaha, 
          no_wa: newLead.no_wa, 
          kategori: newLead.kategori,
          status: 'Prospek Manual',
          funnel_destination: 'MEMBER_AREA'
        }
      ]);
      if (error) throw error;
      
      toast.success('Prospek berhasil ditambahkan');
      setIsAddModalOpen(false);
      setNewLead({ nama_usaha: '', no_wa: '', kategori: 'Kuliner & F&B' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Import CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      
      const rows = text.split('\n').map(r => r.split(',').map(c => c.trim())).filter(r => r.length >= 2 && r[0]);
      // Remove header if first row looks like header
      if (rows.length > 0 && rows[0][0].toLowerCase().includes('nama')) {
        rows.shift();
      }
      
      if (rows.length === 0) {
        toast.error('Format CSV kosong atau tidak valid');
        return;
      }
      
      const loadingToast = toast.loading(`Meng-import ${rows.length} prospek...`);
      try {
        const inserts = rows.map(r => ({
          nama_usaha: r[0],
          no_wa: r[1],
          kategori: r[2] || 'Lainnya',
          status: 'Import CSV',
          funnel_destination: 'MEMBER_AREA'
        }));
        
        const { error } = await supabase.from('leads').insert(inserts);
        if (error) throw error;
        
        toast.success(`Berhasil import ${rows.length} prospek!`, { id: loadingToast });
        fetchData();
      } catch (error: any) {
        toast.error(`Gagal import: ${error.message}`, { id: loadingToast });
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filters
  const filteredLeads = leads.filter(l => {
    if (catFilter !== 'All' && !l.kategori?.includes(catFilter)) return false;
    if (statusFilter !== 'All') {
      // Basic mock filtering since we don't have a dedicated followup column
      if (statusFilter === 'Belum Contact' && l.status?.toLowerCase().includes('progres')) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users size={24} className="text-indigo-400" /> Leads Prospecting & CRM
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Kelola prospek, import massal, dan generate follow-up dengan Logaritma AI.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-colors border border-slate-700"
          >
            <Upload size={16} /> Import CSV
          </button>
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Plus size={16} /> Tambah Prospek
          </button>
        </div>
      </div>

      {/* Main Grid: AI Copywriting (Left) and Filters (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Copywriting Generator */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950/20 rounded-2xl border border-indigo-500/20 p-5 md:p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles size={100} className="text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-indigo-400" />
              <h3 className="font-black text-white text-lg">AI Copywriting Generator (DEP Style)</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 block">Topik / Penawaran</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Tawarkan promo free trial UBOS selama 14 hari khusus merchant F&B..."
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors h-20 resize-none"
                />
              </div>
              
              <button 
                onClick={handleGenerateCopy}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Copywriting DEP 🚀
              </button>
              
              {generatedCopy && (
                <div className="mt-4 pt-4 border-t border-indigo-500/20">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Hasil Copywriting:</span>
                    <button onClick={copyToClipboard} className="flex items-center gap-1 hover:text-white transition-colors">
                      <Copy size={12} /> Salin
                    </button>
                  </label>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/20 text-sm text-slate-300 whitespace-pre-wrap font-medium">
                    {generatedCopy}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter size={14} /> Filter Prospek
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Kategori Usaha</label>
                <select 
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Kuliner">Kuliner & F&B</option>
                  <option value="Percetakan">Percetakan</option>
                  <option value="Ritel">Ritel</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Status Follow-Up</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                >
                  <option value="All">Semua Status</option>
                  <option value="Belum Contact">Belum Contact</option>
                  <option value="Progres">Progres</option>
                  <option value="Closing">Closing</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-500/10 rounded-2xl border border-indigo-500/20 p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Prospek</p>
              <p className="text-3xl font-black text-white mt-1">{filteredLeads.length}</p>
            </div>
            <Users size={32} className="text-indigo-500/30" />
          </div>
        </div>
        
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-500" /></div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-black">
                <tr>
                  <th className="px-6 py-4">Nama Usaha / Prospek</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Nomor WhatsApp</th>
                  <th className="px-6 py-4">Status & Waktu</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.slice(0, 50).map((lead, i) => (
                  <tr key={lead.id || i} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{lead.nama_usaha || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
                        {lead.kategori || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs">{lead.no_wa}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                       <p className="font-bold text-slate-300 mb-0.5">{lead.status || 'New Lead'}</p>
                       <p>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('id-ID') : '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleFollowUpWA(lead.no_wa, lead.nama_usaha)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-colors"
                      >
                        <MessageCircle size={14} /> Follow Up WA
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                      Data prospek tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Tambah Prospek Manual</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddManual} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nama Usaha / Toko</label>
                <input required type="text" value={newLead.nama_usaha} onChange={e => setNewLead({...newLead, nama_usaha: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" placeholder="Ayam Geprek..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nomor WhatsApp</label>
                <input required type="text" value={newLead.no_wa} onChange={e => setNewLead({...newLead, no_wa: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" placeholder="08123456789" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Kategori Usaha</label>
                <select value={newLead.kategori} onChange={e => setNewLead({...newLead, kategori: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="Kuliner & F&B">Kuliner & F&B</option>
                  <option value="Percetakan">Percetakan</option>
                  <option value="Ritel">Ritel</option>
                  <option value="Jasa / Lainnya">Jasa / Lainnya</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isAdding}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                  {isAdding ? <Loader2 size={16} className="animate-spin"/> : 'Simpan Prospek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
