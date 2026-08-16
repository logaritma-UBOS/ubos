'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Filter, MessageSquare, AlertTriangle, CheckCircle, Clock, Zap, Bot, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import TicketDetailModal from '@/components/admin/TicketDetailModal';
import CreateTicketModal from '@/components/admin/CreateTicketModal';
import WhatsappDispatcherModal from '@/components/admin/WhatsappDispatcherModal';

interface SupportTicket {
  id: string;
  merchant_name: string;
  whatsapp: string;
  category: string;
  priority: string;
  status: string;
  issue_description: string;
  ai_suggested_solution: string;
  created_at: string;
}

export default function OpsTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('ALL');
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [selectedWaTarget, setSelectedWaTarget] = useState({ name: '', phone: '', status: '', id: '', category: '', ai_solution: '' });

  useEffect(() => {
    fetchTickets();
    
    // Set up polling for real-time feel (every 10 seconds)
    const interval = setInterval(() => {
      fetchTickets(false); // background refresh
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      if (showLoading) toast.error('Gagal memuat tiket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Status tiket diperbarui!');
      fetchTickets(false);
    } catch (error: any) {
      toast.error('Gagal memperbarui status: ' + error.message);
    }
  };

  const handleForwardToWa = (ticket: SupportTicket) => {
    setSelectedWaTarget({
      name: ticket.merchant_name,
      phone: ticket.whatsapp,
      status: 'Support Ticket',
      id: ticket.id,
      category: ticket.category,
      ai_solution: ticket.ai_suggested_solution
    });
    setWaModalOpen(true);
  };

  // Derived Metrics
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  // Filtered List
  const filteredTickets = tickets.filter(t => {
    if (filterStage === 'ALL') return true;
    if (filterStage === 'OPEN' && t.status === 'OPEN') return true;
    if (filterStage === 'IN_PROGRESS' && t.status === 'IN_PROGRESS') return true;
    if (filterStage === 'RESOLVED' && (t.status === 'RESOLVED' || t.status === 'CLOSED')) return true;
    return false;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header & Main Actions */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Ticket size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Support Tickets (Real-Time)</h1>
          </div>
          <p className="text-slate-400 text-sm">Monitor keluhan merchant dengan bantuan resolusi otomatis dari AI.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-blue-950 font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> Buat Tiket Manual
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            <AlertTriangle size={16} className="text-red-400" /> Tiket Terbuka (Open)
          </div>
          <p className="text-3xl font-black text-white">{openCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            <Clock size={16} className="text-amber-400" /> Sedang Diproses
          </div>
          <p className="text-3xl font-black text-white">{inProgressCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            <CheckCircle size={16} className="text-emerald-400" /> Selesai (Resolved)
          </div>
          <p className="text-3xl font-black text-white">{resolvedCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            <Zap size={16} className="text-purple-400" /> Rata-rata Respon AI
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-white">&lt; 1</p>
            <span className="text-slate-400 font-bold mb-1">Menit</span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStage('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2
            ${filterStage === 'ALL' ? 'bg-slate-800 text-white border-slate-600 shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
        >
          Semua Tiket ({tickets.length})
        </button>
        <button
          onClick={() => setFilterStage('OPEN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2
            ${filterStage === 'OPEN' ? 'bg-slate-800 text-white border-slate-600 shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
        >
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          Perlu Respon ({openCount})
        </button>
        <button
          onClick={() => setFilterStage('IN_PROGRESS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2
            ${filterStage === 'IN_PROGRESS' ? 'bg-slate-800 text-white border-slate-600 shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
        >
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          Sedang Ditangani ({inProgressCount})
        </button>
        <button
          onClick={() => setFilterStage('RESOLVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2
            ${filterStage === 'RESOLVED' ? 'bg-slate-800 text-white border-slate-600 shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          Selesai ({resolvedCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-300 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4 tracking-wider">Waktu & ID</th>
                <th className="px-6 py-4 tracking-wider">Merchant / Toko</th>
                <th className="px-6 py-4 tracking-wider">Kategori Kendala</th>
                <th className="px-6 py-4 tracking-wider">Prioritas</th>
                <th className="px-6 py-4 tracking-wider">Status</th>
                <th className="px-6 py-4 text-right tracking-wider rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">Memuat live data dari Supabase...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tidak ada tiket di status ini.</td></tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300 font-bold">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-slate-500 font-mono text-[10px]">#{t.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-bold">{t.merchant_name}</span>
                        <span className="text-blue-400 font-mono text-xs">{t.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-800">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border
                        ${t.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          t.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          t.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={t.status}
                        onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                        className={`bg-slate-950 border text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none appearance-none cursor-pointer
                          ${t.status === 'OPEN' ? 'border-red-500/50 text-red-400' : 
                            t.status === 'IN_PROGRESS' ? 'border-amber-500/50 text-amber-400' : 
                            'border-emerald-500/50 text-emerald-400'}`}
                      >
                        <option value="OPEN">🔴 OPEN</option>
                        <option value="IN_PROGRESS">🟡 IN PROGRESS</option>
                        <option value="RESOLVED">🟢 RESOLVED</option>
                        <option value="CLOSED">⚪ CLOSED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedTicket(t);
                          setDetailModalOpen(true);
                        }}
                        className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors border border-purple-500/20 tooltip flex items-center gap-2"
                        title="Lihat Detail & Solusi AI"
                      >
                        <Bot size={14} /> <span className="text-[10px] font-bold uppercase hidden md:inline">Solusi AI</span>
                      </button>
                      <button 
                        onClick={() => handleForwardToWa(t)}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 tooltip"
                        title="Kirim via WhatsApp"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTicketModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSuccess={() => fetchTickets()} 
      />

      <TicketDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        ticket={selectedTicket}
        onForwardToWa={handleForwardToWa}
      />

      <WhatsappDispatcherModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        targetName={selectedWaTarget.name}
        targetPhone={selectedWaTarget.phone}
        merchantStatus={selectedWaTarget.status}
        merchantId={selectedWaTarget.id}
        kategoriUsaha={selectedWaTarget.category}
        customMessageTemplate={selectedWaTarget.ai_solution}
      />
    </div>
  );
}
