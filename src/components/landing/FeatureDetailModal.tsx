'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle, ShoppingBag, Bot, LineChart, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureDetailModalProps {
  feature: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function FeatureDetailModal({ feature, isOpen, onClose }: FeatureDetailModalProps) {
  const router = useRouter();

  if (!feature) return null;

  // Generate Dynamic Bullet Points based on ID
  const getBulletPoints = (id: number) => {
    switch(id) {
      case 1:
        return [
          'Simulasi HPP resep otomatis dengan bahan baku yang akurat.',
          'Proteksi margin dari diskon yang membuat Anda boncos.',
          'Kunci margin minimal untuk setiap produk yang dijual di kasir.'
        ];
      case 2:
        return [
          'Sistem AI otomatis mendeteksi barang slow-moving / stok mati.',
          'Rekomendasi promo bundling pintar sebelum modal mengendap.',
          'Notifikasi real-time jika ada tren penurunan penjualan drastis.'
        ];
      case 3:
        return [
          'Visual kasir POS super cepat dengan respon 0.1 detik.',
          'Integrasi mulus dengan printer thermal bluetooth & scan barcode.',
          'Menerima pembayaran QRIS instant langsung terkonfirmasi di sistem.'
        ];
      case 4:
        return [
          'Analisis pintar jam ramai toko dan rekomendasi jam buka optimal.',
          'Rekomendasi prioritas restock bahan baku sebelum kehabisan.',
          'Review target harian/bulanan dengan strategi adaptif otomatis.'
        ];
      case 5:
        return [
          'Audit profit bersih secara instan tanpa rekap Excel manual.',
          'Pisahkan pendapatan kotor dan laba bersih secara otomatis.',
          'Unduh laporan laba rugi siap pakai untuk bahan evaluasi bisnis.'
        ];
      case 6:
        return [
          'Pantau performa 10+ toko atau warung dari satu dashboard.',
          'Sistem kontrol stok pusat dan transfer inventori antar cabang.',
          'Hak akses kasir dan admin yang dapat diatur secara ketat.'
        ];
      default:
        return [
          'Tingkatkan efisiensi operasional dengan sistem terintegrasi.',
          'Mudah digunakan tanpa perlu keahlian teknis khusus.',
          'Laporan dan insight bisnis 24/7 di ujung jari Anda.'
        ];
    }
  };

  const Icon = feature.icon || ShieldCheck;
  const bullets = getBulletPoints(feature.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          
          <div className="fixed inset-0 pointer-events-none z-[101] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} text-white flex items-center justify-center shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">{feature.badge}</span>
                    <h2 className="text-lg font-extrabold text-slate-800 leading-tight line-clamp-1">{feature.title}</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto hide-scrollbar flex flex-col gap-6 flex-1 min-h-0 bg-white">
                
                {/* Visual / Mockup Container */}
                <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${feature.accent} p-1 shrink-0 shadow-inner relative overflow-hidden flex items-center justify-center group`}>
                   {/* Abstract Dashboard UI Elements */}
                   <div className="absolute inset-0 bg-black/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                   
                   <div className="w-[85%] h-[80%] bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 flex flex-col overflow-hidden relative z-10 group-hover:scale-105 transition-transform duration-500">
                     {/* MacOS-style Window Header */}
                     <div className="h-5 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-3 gap-1.5 shrink-0">
                       <div className="w-2 h-2 rounded-full bg-rose-400" />
                       <div className="w-2 h-2 rounded-full bg-amber-400" />
                       <div className="w-2 h-2 rounded-full bg-emerald-400" />
                     </div>
                     
                     {/* Dashboard Content */}
                     <div className="p-4 flex-1 flex flex-col gap-3">
                       <div className="w-1/3 h-2.5 bg-slate-700 rounded-full" />
                       
                       <div className="w-full h-16 bg-slate-800/80 rounded-lg border border-slate-700/50 flex items-center gap-3 p-3">
                         <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md shadow-inner" />
                         <div className="flex-1 flex flex-col gap-2">
                           <div className="w-1/2 h-2 bg-slate-600 rounded-full" />
                           <div className="w-1/3 h-2 bg-slate-700 rounded-full" />
                         </div>
                       </div>
                       
                       <div className="flex gap-3">
                         <div className="flex-1 h-20 bg-slate-800/80 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
                            <div className="w-1/2 h-1.5 bg-slate-600 rounded-full" />
                            <div className="w-3/4 h-4 bg-emerald-500/80 rounded-sm mt-auto" />
                         </div>
                         <div className="flex-1 h-20 bg-slate-800/80 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
                            <div className="w-1/2 h-1.5 bg-slate-600 rounded-full" />
                            <div className="w-full h-4 bg-blue-500/80 rounded-sm mt-auto" />
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Bullet Points */}
                <div className="space-y-4 shrink-0">
                  <h3 className="text-sm font-extrabold text-slate-800">Keuntungan Nyata:</h3>
                  <div className="space-y-3">
                    {bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="bg-slate-50 p-5 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => router.push('/register')}
                  className="w-full px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Coba Fitur Ini Sekarang (Gratis 7 Hari)</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
