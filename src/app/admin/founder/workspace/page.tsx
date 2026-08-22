'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Users, Plus, StickyNote, Send, Phone, UserCircle2, Trash2, Upload, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import WhatsappDispatcherModal from '@/components/admin/WhatsappDispatcherModal';

interface FounderNote {
  id: string;
  author_name: string;
  note_text: string;
  priority: string;
  created_at: string;
}

const FOUNDERS = ['Baim', 'Tony Herman', 'Reza'];

export default function FounderWorkspacePage() {
  const [activeFounder, setActiveFounder] = useState('Baim');
  const [notes, setNotes] = useState<FounderNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // New Note State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNotePriority, setNewNotePriority] = useState('NORMAL');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Lead State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waTarget, setWaTarget] = useState({ name: '', phone: '' });

  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    fetchNotes();
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeadsList(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat riwayat leads: ' + error.message);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const { data, error } = await supabase
        .from('founder_notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat catatan: ' + error.message);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return toast.error('Catatan tidak boleh kosong');

    setIsSubmittingNote(true);
    try {
      const { error } = await supabase.from('founder_notes').insert([{
        author_name: activeFounder,
        note_text: newNoteText,
        priority: newNotePriority
      }]);
      
      if (error) throw error;
      
      toast.success('Catatan berhasil ditambahkan');
      setNewNoteText('');
      fetchNotes();
    } catch (error: any) {
      toast.error('Gagal menambah catatan: ' + error.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Hapus catatan ini?')) return;
    try {
      const { error } = await supabase.from('founder_notes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Catatan dihapus');
      fetchNotes();
    } catch (error: any) {
      toast.error('Gagal menghapus catatan: ' + error.message);
    }
  };

  // Fungsi Hapus Lead / Prospek
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus data prospek ini?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Data prospek berhasil dihapus');
      fetchLeads();
    } catch (error: any) {
      toast.error('Gagal menghapus prospek: ' + error.message);
    }
  };

  const handleInputLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return toast.error('Nama & WA wajib diisi');
    
    setIsSubmittingLead(true);
    try {
      const { data, error } = await supabase.from('leads').insert([{
        name: leadName,
        whatsapp: leadPhone,
        source: 'Manual Input',
        status: 'New',
        created_by: activeFounder
      }]).select().single();
      
      if (error) throw error;
      
      toast.success('Lead berhasil disimpan!');
      setLeadName('');
      setLeadPhone('');
      fetchLeads();
      
      setWaTarget({ name: leadName, phone: leadPhone });
      setWaModalOpen(true);
      
    } catch (error: any) {
      toast.error('Gagal menyimpan lead: ' + error.message);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmittingLead(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const rows = text.split('\n').filter(row => row.trim().length > 0);
        
        let startIndex = 0;
        if (rows[0].toLowerCase().includes('nama') || rows[0].toLowerCase().includes('whatsapp')) {
          startIndex = 1;
        }

        const bulkData = [];
        for (let i = startIndex; i < rows.length; i++) {
          const cols = rows[i].split(',');
          if (cols.length >= 2) {
            const nama_usaha = cols[0].trim();
            const whatsapp = cols[1].trim();
            if (nama_usaha && whatsapp) {
              bulkData.push({
                name: nama_usaha,
                whatsapp: whatsapp,
                source: 'CSV Bulk',
                status: 'New',
                created_by: activeFounder
              });
            }
          }
        }

        if (bulkData.length === 0) {
          toast.error('Tidak ada data valid di CSV (Format: Nama,WhatsApp)');
          return;
        }

        const { error } = await supabase.from('leads').insert(bulkData);
        if (error) throw error;

        toast.success(`${bulkData.length} leads berhasil diimport!`);
        fetchLeads();
        
      } catch (error: any) {
        toast.error('Gagal mengimport CSV: ' + error.message);
      } finally {
        setIsSubmittingLead(false);
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      toast.error('Gagal membaca file');
      setIsSubmittingLead(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Role Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Users size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Co-Founders Workspace</h1>
          </div>
          <p className="text-slate-400 text-sm">Kolaborasi tim eksekutif, input prospek manual, dan catatan strategis.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 font-bold uppercase px-2">Login Sebagai:</span>
          {FOUNDERS.map(founder => (
            <button
              key={founder}
              onClick={() => setActiveFounder(founder)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeFounder === founder 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {founder}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" /> Input Lead Manual
            </h2>
            <form onSubmit={handleInputLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nama Prospek / Usaha</label>
                <input 
                  type="text" 
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:outline-none"
                  placeholder="Misal: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none"
                    placeholder="08123456..."
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingLead}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingLead ? 'Menyimpan...' : <><Send size={18} /> Simpan & Chat WA</>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Atau Import CSV (Nama, WA)</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  disabled={isSubmittingLead}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="w-full bg-slate-950 border border-dashed border-slate-700 text-slate-400 rounded-xl px-4 py-4 text-center text-sm font-bold flex flex-col items-center gap-2 hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                  <Upload size={20} />
                  Pilih File CSV / Excel (CSV)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Notes Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <StickyNote size={18} className="text-amber-400" /> Papan Catatan Internal
            </h2>
            
            <form onSubmit={handleAddNote} className="flex gap-3 mb-6">
              <input 
                type="text" 
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder={`Tulis ide atau catatan sebagai ${activeFounder}...`}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <select 
                value={newNotePriority}
                onChange={e => setNewNotePriority(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
              </select>
              <button 
                type="submit"
                disabled={isSubmittingNote}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                Tambah
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingNotes ? (
                <div className="col-span-full text-center py-8 text-slate-500">Memuat catatan...</div>
              ) : notes.length === 0 ? (
                <div className="col-span-full text-center py-8 text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800/50">Belum ada catatan.</div>
              ) : (
                notes.map(note => (
                  <div 
                    key={note.id} 
                    className={`relative p-5 rounded-2xl border ${
                      note.priority === 'HIGH' 
                        ? 'bg-rose-500/10 border-rose-500/20' 
                        : 'bg-amber-500/10 border-amber-500/20'
                    }`}
                  >
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className={`text-sm mb-4 pr-6 ${note.priority === 'HIGH' ? 'text-rose-200' : 'text-amber-200'}`}>
                      {note.note_text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <UserCircle2 size={12} /> {note.author_name}
                      </div>
                      <span className="text-slate-500">
                        {new Date(note.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Riwayat Input Prospek & Performa Tim */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mt-6">
        <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <Activity size={18} className="text-blue-400" /> Riwayat Input Prospek & Performa Tim
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold">Tanggal & Jam</th>
                <th className="px-4 py-3 font-bold">Diinput Oleh</th>
                <th className="px-4 py-3 font-bold">Nama Prospek / Usaha</th>
                <th className="px-4 py-3 font-bold">WhatsApp</th>
                <th className="px-4 py-3 font-bold">Status Hasil</th>
                <th className="px-4 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingLeads ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : leadsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 bg-slate-950/30 rounded-xl">Belum ada prospek yang diinput. Gunakan form di atas untuk menambah prospek baru.</td>
                </tr>
              ) : (
                leadsList.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        lead.created_by === 'Baim' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        lead.created_by === 'Tony Herman' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        lead.created_by === 'Reza' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {lead.created_by || 'System'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{lead.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{lead.whatsapp}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${
                        lead.status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        lead.status === 'Trial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        lead.status === 'Premium' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {lead.status === 'New' ? '🔵 BARU DIINPUT' :
                         lead.status === 'Trial' ? '🟡 TRIAL AKTIF' :
                         lead.status === 'Premium' ? '🟢 PAID PREMIUM' :
                         '🔴 LOST / EXPIRED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setWaTarget({ name: lead.name, phone: lead.whatsapp });
                            setWaModalOpen(true);
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg transition-colors inline-flex items-center"
                          title="Chat WA via Fonnte"
                        >
                          <Send size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg transition-colors inline-flex items-center"
                          title="Hapus Prospek"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WhatsappDispatcherModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        targetName={waTarget.name}
        targetPhone={waTarget.phone}
        merchantStatus="Lead"
      />
    </div>
  );
}