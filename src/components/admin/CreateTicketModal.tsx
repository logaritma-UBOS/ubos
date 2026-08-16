import React, { useState } from 'react';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    merchant_name: '',
    whatsapp: '',
    category: 'Koneksi Printer/Hardware',
    priority: 'MEDIUM',
    issue_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic AI Solution generation placeholder (In real app, trigger edge function)
      const aiPrompt = `Menjawab keluhan: ${formData.issue_description}. Kategori: ${formData.category}.`;
      let aiSolution = "1. Harap pastikan printer menyala.\n2. Buka pengaturan bluetooth dan unpair perangkat lama.\n3. Restart aplikasi UBOS dan coba sambungkan kembali.";
      
      if (formData.category === 'Perhitungan HPP/Target') {
        aiSolution = "1. Pastikan Anda telah memasukkan Harga Beli Bahan dengan benar di menu HPP.\n2. Cek apakah ada biaya operasional (listrik/gaji) yang terlewat.\n3. Gunakan kalkulator backward mapping UBOS untuk menembus target baru.";
      } else if (formData.category === 'Akses Akun/Billing') {
        aiSolution = "1. Klik 'Lupa Password' di halaman login jika tidak bisa masuk.\n2. Masa aktif langganan Anda dapat dicek di menu Billing.\n3. Untuk perpanjangan, gunakan e-Wallet (QRIS) agar otomatis aktif 24/7.";
      }

      const { error } = await supabase.from('support_tickets').insert([{
        merchant_name: formData.merchant_name,
        whatsapp: formData.whatsapp,
        subject: formData.category, // Required field
        category: formData.category,
        priority: formData.priority,
        issue_description: formData.issue_description,
        ai_suggested_solution: aiSolution,
        status: 'OPEN'
      }]);

      if (error) throw error;
      
      toast.success('Tiket support berhasil dibuat!');
      onSuccess();
      onClose();
      // reset
      setFormData({
        merchant_name: '',
        whatsapp: '',
        category: 'Koneksi Printer/Hardware',
        priority: 'MEDIUM',
        issue_description: ''
      });
    } catch (error: any) {
      toast.error('Gagal membuat tiket: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      ></div>
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Plus size={20} className="text-blue-500" />
              Buat Tiket Manual
            </h2>
            <p className="text-slate-400 text-sm mt-1">Catat komplain dari telepon atau channel lain.</p>
          </div>
          <button 
            onClick={!loading ? onClose : undefined}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Merchant / Penanya</label>
            <input 
              required
              type="text" 
              value={formData.merchant_name}
              onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
              placeholder="Cth: Kedai Kopi Senja"
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. WhatsApp</label>
            <input 
              required
              type="text" 
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              placeholder="Cth: 081234567890"
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="Koneksi Printer/Hardware">Hardware / Printer</option>
                <option value="Perhitungan HPP/Target">Perhitungan HPP</option>
                <option value="Akses Akun/Billing">Akses / Billing</option>
                <option value="Bug Sistem">Bug Sistem</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioritas</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none font-bold"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Keluhan</label>
            <textarea 
              required
              rows={4}
              value={formData.issue_description}
              onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
              placeholder="Ceritakan detail keluhan..."
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Footer inside form to trigger submit */}
          <div className="mt-2 flex gap-3 justify-end border-t border-slate-800 pt-5">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold text-blue-950 bg-blue-500 hover:bg-blue-400 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Buat Tiket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
