import React from 'react';
import { X, Bot, AlertTriangle, Send } from 'lucide-react';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    merchant_name: string;
    whatsapp: string;
    category: string;
    priority: string;
    issue_description: string;
    ai_suggested_solution: string;
    created_at: string;
  } | null;
  onForwardToWa: (ticket: any) => void;
}

export default function TicketDetailModal({ isOpen, onClose, ticket, onForwardToWa }: TicketDetailModalProps) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-white">Detail Kendala & Solusi AI</h2>
            <p className="text-slate-400 text-sm mt-1">Tiket ID: {ticket.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          
          {/* Merchant Info */}
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Informasi Merchant</p>
                <p className="text-white font-bold">{ticket.merchant_name}</p>
                <p className="text-blue-400 font-mono text-sm">{ticket.whatsapp}</p>
              </div>
              <div className="text-right">
                <span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 uppercase block mb-2">{ticket.category}</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase inline-flex items-center gap-1.5 border
                  ${ticket.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                    ticket.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                >
                  <AlertTriangle size={12} /> {ticket.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Deskripsi Keluhan</p>
            <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800/50 text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
              {ticket.issue_description || 'Tidak ada deskripsi keluhan yang diberikan.'}
            </div>
          </div>

          {/* AI Suggestion */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Bot size={14} />
              </div>
              <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">Rekomendasi Solusi AI Logaritma</p>
            </div>
            <div className="bg-purple-950/20 rounded-2xl p-5 border border-purple-500/20 text-purple-100 whitespace-pre-wrap text-sm leading-relaxed">
              {ticket.ai_suggested_solution || 'Sistem AI sedang memproses solusi... (Coba muat ulang sesaat lagi)'}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
          <button 
            onClick={() => {
              onForwardToWa(ticket);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-emerald-950 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Send size={18} />
            Kirim Solusi Ini ke WA
          </button>
        </div>
      </div>
    </div>
  );
}
