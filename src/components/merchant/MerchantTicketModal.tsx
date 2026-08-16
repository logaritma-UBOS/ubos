import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MerchantTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
  whatsapp: string;
}

export default function MerchantTicketModal({ isOpen, onClose, merchantName, whatsapp }: MerchantTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Koneksi Printer/Hardware',
    issue_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine priority automatically based on category
      let priority = 'MEDIUM';
      if (formData.category === 'Akses Akun/Billing' || formData.category === 'Bug Sistem') {
        priority = 'HIGH';
      }

      // We'll let the AI assistant process the ticket later from the admin panel, 
      // or we could generate a basic placeholder here.
      const aiSolution = `AI Logaritma sedang memproses solusi untuk keluhan ini... (Status: Menunggu Antrean)`;

      const { error } = await supabase.from('support_tickets').insert([{
        merchant_name: merchantName || 'Merchant Tanpa Nama',
        whatsapp: whatsapp || '-',
        subject: formData.category, // Required field
        category: formData.category,
        priority: priority,
        issue_description: formData.issue_description,
        ai_suggested_solution: aiSolution,
        status: 'OPEN'
      }]);

      if (error) throw error;
      
      toast.success('Keluhan berhasil dikirim. Tim kami akan segera merespons!');
      onClose();
      // reset
      setFormData({
        category: 'Koneksi Printer/Hardware',
        issue_description: ''
      });
    } catch (error: any) {
      toast.error('Gagal mengirim keluhan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <MessageSquare size={20} className="text-[#4F75FF]" />
              Pusat Bantuan UBOS
            </h2>
            <p className="text-slate-500 text-sm mt-1">Sampaikan kendala Anda kepada tim kami.</p>
          </div>
          <button 
            onClick={!loading ? onClose : undefined}
            disabled={loading}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori Masalah</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4F75FF] transition-colors appearance-none font-medium"
            >
              <option value="Koneksi Printer/Hardware">Kendala Printer / Perangkat Keras</option>
              <option value="Perhitungan HPP/Target">Tanya Seputar HPP & Laporan</option>
              <option value="Akses Akun/Billing">Masalah Login / Pembayaran Langganan</option>
              <option value="Bug Sistem">Aplikasi Error / Bug Sistem</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Lengkap Kendala</label>
            <textarea 
              required
              rows={5}
              value={formData.issue_description}
              onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
              placeholder="Ceritakan detail kendala yang sedang Kakak alami saat ini..."
              className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4F75FF] transition-colors resize-none font-medium"
            />
          </div>

          {/* Footer inside form to trigger submit */}
          <div className="mt-2 flex flex-col gap-3 pt-5">
            <button 
              type="submit"
              disabled={loading || !formData.issue_description.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-[#4F75FF] hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Kirim Bantuan ke CS Logaritma
            </button>
            <p className="text-[11px] text-center text-slate-500 font-medium px-4">
              AI & Tim Operasional kami akan merespons dalam &lt; 5 menit via WhatsApp tokomu.
            </p>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
