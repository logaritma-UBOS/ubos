'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Users, Plus, StickyNote, Send, Phone, UserCircle2, Trash2, Upload } from 'lucide-react';
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

  useEffect(() => {
    fetchNotes();
  }, []);

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

  const handleInputLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return toast.error('Nama & WA wajib diisi');
    
    setIsSubmittingLead(true);
    try {
      // Create trial merchant as lead
      const { data, error } = await supabase.from('merchants').insert([{
        nama_usaha: leadName,
        whatsapp: leadPhone,
        status: 'Trial',
        kategori_usaha: 'General',
        subscription_status: 'inactive'
      }]).select().single();
      
      if (error) throw error;
      
      toast.success('Lead berhasil disimpan!');
      setLeadName('');
      setLeadPhone('');
      
      // Trigger WA Modal
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

        // Simple CSV parser (assuming format: NamaUsaha,WhatsApp)
        const rows = text.split('\n').filter(row => row.trim().length > 0);
        
        // Skip header if it exists, but let's just assume we check the first column
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
                nama_usaha,
                whatsapp,
                status: 'Trial',
                kategori_usaha: 'General',
                subscription_status: 'inactive'
              });
            }
          }
        }

        if (bulkData.length === 0) {
          toast.error('Tidak ada data valid di CSV (Format: Nama,WhatsApp)');
          return;
        }

        const { error } = await supabase.from('merchants').insert(bulkData);
        if (error) throw error;

        toast.success(`${bulkData.length} leads berhasil diimport!`);
        
      } catch (error: any) {
        toast.error('Gagal mengimport CSV: ' + error.message);
      } finally {
        setIsSubmittingLead(false);
        // Reset file input
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
            
            {/* Add Note Form */}
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

            {/* Notes Grid */}
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
