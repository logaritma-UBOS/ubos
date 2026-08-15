'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles, User, Mail, Phone, Store, ShieldCheck, Gift } from 'lucide-react';

export default function EnrollmentModal({ initialTrack, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    email: '',
    phone: '',
    sector: initialTrack || 'Solusi Toko Kelontong & Minimarket',
    branchCount: '1 Cabang',
    needsSetupHelp: 'Ya, Butuh Panduan Setup HPP'
  });
  const [submitted, setSubmitted] = useState(false);

  const sectorOptions = [
    'Solusi Toko Kelontong & Minimarket',
    'Solusi FnB, Cafe & Restoran',
    'Solusi Percetakan & Digital Printing',
    'Solusi Laundry & Jasa Service',
    'Solusi Grosir & Multi-Cabang Enterprise',
    'Konsultasi Audit Margin HPP Gratis'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Trigger celebratory confetti
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log('Confetti triggered');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 p-7 text-white space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Uji Coba Gratis 14 Hari
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Aktivasi Logaritma.id UBOS AI</h2>
              <p className="text-xs text-blue-100">
                Kunci margin keuntungan usahamu dan dapatkan pendampingan setup HPP gratis.
              </p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              
              {/* Select Sector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Solusi Kategori Usaha
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {sectorOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pemilik Usaha</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pak Haji Slamet"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Toko / Bisnis</label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Toko Kelontong Berkah"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Aktif</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="tokoberkah@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="08123456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Cabang Usaha</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['1 Toko', '2 - 5 Cabang', '> 5 Cabang (Enterprise)'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setFormData({ ...formData, branchCount: option })}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        formData.branchCount === option
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tanpa Perlu Kartu Kredit. Tim Specialist Logaritma.id akan menghubungi Anda via WhatsApp dalam 15 menit.</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-gradient-primary w-full text-xs font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl"
              >
                <span>Mulai Uji Coba Gratis 14 Hari Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Celebration Screen */
          <div className="p-8 sm:p-10 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Aktivasi Berhasil Terkirim! 🎉</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Terima kasih, <strong className="text-slate-900">{formData.name}</strong> ({formData.storeName}). Akun Uji Coba 14 Hari Logaritma.id Anda siap untuk sektor:
              </p>
              <div className="inline-block bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200 mt-2">
                {formData.sector}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
              <div className="font-bold text-slate-800 mb-1">Langkah Selanjutnya:</div>
              <div>1. Cek WhatsApp di nomor <span className="font-semibold text-slate-900">{formData.phone}</span>.</div>
              <div>2. Dapatkan Link Login Dashboard POS Logaritma.id.</div>
              <div>3. Tim Specialist kami akan membantu import data barang pertama Anda secara gratis.</div>
            </div>

            <button
              onClick={onClose}
              className="w-full text-xs font-bold py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
