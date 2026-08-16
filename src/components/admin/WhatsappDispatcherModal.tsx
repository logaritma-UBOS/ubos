'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Clock, MessageSquare, AlertCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsappDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetPhone: string;
  merchantStatus: string;
  merchantId?: string;
  kategoriUsaha?: string;
  customMessageTemplate?: string;
}

const TEMPLATES = [
  {
    id: 'welcome',
    label: 'Sambutan Hari 1 (Edukasi)',
    content: (name: string, category: string) => `Halo Kak ${name}! 👋\n\nSelamat datang di UBOS. Kami lihat toko Kakak bergerak di bidang ${category}. Kami punya fitur unggulan untuk bantu Kakak capai target profit bulan ini!\n\nYuk mulai setup kasir digital dan cek kalkulator profit kita. Jika butuh bantuan, balas pesan ini ya!`
  },
  {
    id: 'nurturing',
    label: 'Solusi Hari 3-5 (Nurturing)',
    content: (name: string) => `Halo Kak ${name}, gimana pengalaman pakai UBOS sejauh ini? 😊\n\nBanyak merchant kami yang profitnya naik 30% setelah rutin mencatat pengeluaran harian di aplikasi. Mau kami bantu pandu cara pakainya?`
  },
  {
    id: 'upgrade',
    label: 'Reminder Upgrade (H-1 / Expired)',
    content: (name: string) => `Halo Kak ${name}!\n\nMasa Trial UBOS Kakak akan segera berakhir/sudah kedaluwarsa. Jangan sampai kehilangan akses ke laporan harian dan fitur AI Copilot.\n\nYuk upgrade ke Premium cuma Rp49.000/bulan! Klik link berikut: https://logaritma.id/upgrade`
  },
  {
    id: 'affiliate',
    label: 'Afiliasi (Klaim Komisi 40%)',
    content: (name: string) => `Halo Kak ${name}! Tau nggak, Kakak bisa dapat komisi Rp19.600 untuk SETIAP teman yang Kakak ajak pakai UBOS?\n\nCukup sebarkan link referral Kakak. Cek saldo dan link uniknya di dashboard Affiliate UBOS sekarang!`
  },
  {
    id: 'custom',
    label: 'Pesan Kustom (Ketik Manual)',
    content: () => ``
  }
];

export default function WhatsappDispatcherModal({
  isOpen, onClose, targetName, targetPhone, merchantStatus, merchantId, kategoriUsaha = 'Bisnis', customMessageTemplate
}: WhatsappDispatcherModalProps) {
  
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-select template based on status when modal opens
  useEffect(() => {
    if (isOpen) {
      if (customMessageTemplate) {
        setSelectedTemplate('custom');
        setMessage(customMessageTemplate);
        return;
      }

      let defaultTemp = 'custom';
      const statusLower = merchantStatus.toLowerCase();
      
      if (statusLower.includes('lead') || statusLower.includes('new')) {
        defaultTemp = 'welcome';
      } else if (statusLower.includes('expired') || statusLower.includes('churn')) {
        defaultTemp = 'upgrade';
      } else if (statusLower.includes('trial')) {
        defaultTemp = 'nurturing';
      } else if (statusLower.includes('affiliate') || statusLower.includes('mitra')) {
        defaultTemp = 'affiliate';
      }
      
      setSelectedTemplate(defaultTemp);
      
      const template = TEMPLATES.find(t => t.id === defaultTemp);
      if (template) {
        setMessage(template.content(targetName, kategoriUsaha));
      } else {
        setMessage('');
      }
    }
  }, [isOpen, merchantStatus, targetName, kategoriUsaha, customMessageTemplate]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tempId = e.target.value;
    setSelectedTemplate(tempId);
    
    const template = TEMPLATES.find(t => t.id === tempId);
    if (template) {
      setMessage(template.content(targetName, kategoriUsaha));
    }
  };

  const cleanPhone = (phone: string) => {
    // Basic cleaning, remove non-digits
    return phone.replace(/\D/g, '');
  };

  const handleSend = async () => {
    if (!message.trim()) return toast.error('Pesan tidak boleh kosong!');
    if (!targetPhone || targetPhone === '-') return toast.error('Nomor WhatsApp tidak valid!');

    setIsSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanPhone(targetPhone),
          message,
          merchantId,
          templateType: TEMPLATES.find(t => t.id === selectedTemplate)?.label
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');

      toast.success('Pesan WhatsApp berhasil terkirim via Fonnte!');
      onClose();
    } catch (error: any) {
      toast.error('Gagal mengirim pesan: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Smart CRM Dispatcher</h2>
              <p className="text-xs text-slate-400">Powered by Fonnte Gateway</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Target Info */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 items-start sm:items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Target Penerima</p>
              <h3 className="font-bold text-slate-200">{targetName}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-mono">
                <Phone size={12} /> {targetPhone}
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Status Sistem</p>
              <span className="px-2 py-1 bg-slate-800 text-blue-400 text-[10px] font-bold uppercase rounded-md border border-slate-700">
                {merchantStatus}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Template Cerdas</label>
              <select 
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 appearance-none"
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Pesan WhatsApp</span>
                <span className="text-slate-600 font-normal">{message.length} chars</span>
              </label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 bg-slate-950 border border-slate-800 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 resize-none"
                placeholder="Ketik pesan..."
              ></textarea>
            </div>

            <div className="flex gap-2 items-start p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>Pesan akan dikirim menggunakan nomor API Fonnte yang dikonfigurasi. Pastikan nomor target valid.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center">
          <button 
            type="button" 
            className="w-full sm:w-auto px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            <Clock size={16} /> Jadwalkan
          </button>
          <button 
            type="button" onClick={handleSend} disabled={isSending}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {isSending ? 'Mengirim...' : <><Send size={16} /> Kirim Sekarang (Fonnte)</>}
          </button>
        </div>

      </div>
    </div>
  );
}
