'use client';

import React, { useState } from 'react';
import { Star, Briefcase, Award, TrendingUp, CheckCircle2, Linkedin, Sparkles, Quote, Store } from 'lucide-react';

export default function StudentSuccess({ onOpenEnrollment }) {
  const [filter, setFilter] = useState('all');

  const testimonials = [
    {
      id: 1,
      name: 'Pak Haji Slamet',
      category: 'retail',
      oldRole: 'Toko Kelontong Berkah (Sering Boncos Dead-Stock)',
      newRole: 'Toko Ritel Rapi & Bebas Dead-Stock',
      salaryJump: 'Margin Profit +22% Terkunci',
      track: 'Solusi Toko Kelontong & Minimarket',
      avatar: '/images/testimonials/pak-slamet.jpg',
      quote: 'Dulu sering bingung omset ramai tapi pas belanja barang modalnya tekor. Ternyata banyak stok mengendap expired di pojok gudang. Sekarang Logaritma AI kasih warning H-30 barang laku lambat. Sangat membantu!',
      linkedinVerified: true,
      company: 'Toko Kelontong'
    },
    {
      id: 2,
      name: 'Ibu Ratna Pertiwi',
      category: 'fnb',
      oldRole: 'Dapur Bunda FnB (HPP Tebak-tebakan)',
      newRole: 'Kuliner Standar Resto Enterprise',
      salaryJump: 'Profit Bersih Rp 18.500.000 / bln',
      track: 'Solusi FnB & Resto Kuliner',
      avatar: '/images/testimonials/ibu-ratna.jpg',
      quote: 'Dulu biaya kemasan, minyak goreng, dan bumbu halus tidak saya hitung presisi. Setelah pakai kalkulator HPP resep Logaritma.id, harga jual porsi saya jadi tepat dan profit bersih dingin langsung kelihatan di rekening.',
      linkedinVerified: true,
      company: 'FnB & Catering'
    },
    {
      id: 3,
      name: 'Dimas Setiawan',
      category: 'printing',
      oldRole: 'Owner Modern Print 24h',
      newRole: 'Percetakan Digital Multi-Mesin',
      salaryJump: 'Penyelamatan Modal Rp 12M / bln',
      track: 'Solusi Percetakan & Digital Print',
      avatar: '/images/testimonials/dimas-setiawan.jpg',
      quote: 'Kalkulator HPP cetak Logaritma.id luar biasa presisi. Menghitung biaya kertas per meter, tinta, finishing, dan kertas terbuang otomatis. Nota DP pelanggan dan cetak SPK dapur langsung rapi.',
      linkedinVerified: true,
      company: 'Digital Printing'
    },
    {
      id: 4,
      name: 'Siska Febriani',
      category: 'laundry',
      oldRole: 'Fresh Laundry Express',
      newRole: 'Laundry 3 Cabang Terintegrasi',
      salaryJump: '+180% Peningkatan Transaksi',
      track: 'Solusi Laundry & Service Center',
      avatar: '/images/testimonials/siska-febriani.jpg',
      quote: 'Pelanggan saya senang banget karena nota otomatis masuk ke WhatsApp saat cucian selesai dipacking. Stok parfum dan deterjen terpantau akurat, bebas kecurangan kasir.',
      linkedinVerified: true,
      company: 'Laundry Service'
    }
  ];

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === filter);

  return (
    <section id="alumni" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-emerald-600" /> Testimonial & Kisah Pemilik UMKM
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cerita Nyata Pemilik Usaha Yang <br />
            <span className="text-gradient-blue-emerald">Bebas Dari Kebocoran Profit</span>
          </h2>
          <p className="text-slate-600 text-base">
            Simak bagaimana sistem Logaritma.id mengubah bisnis tradisional menjadi terukur dan menguntungkan.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Semua UMKM' },
            { id: 'retail', label: 'Toko Kelontong & Ritel' },
            { id: 'fnb', label: 'FnB & Culinary' },
            { id: 'printing', label: 'Percetakan Digital' },
            { id: 'laundry', label: 'Laundry & Service' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                filter === f.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 rounded-2xl p-7 border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 hover:scale-[1.01]"
            >
              <div className="space-y-4">
                
                {/* Header User info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="rounded-full w-12 h-12 md:w-14 md:h-14 object-cover border-2 border-emerald-500/20 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-slate-900 text-base">{item.name}</h4>
                        <span title="Verified Merchant Profile">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-700">{item.track}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    {item.company}
                  </span>
                </div>

                {/* Before / After Jump Banner */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Sebelum: <strong className="text-slate-700">{item.oldRole}</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1.5">
                    <span>Sesudah: <span className="text-blue-600">{item.newRole}</span></span>
                    <span className="text-emerald-600 font-extrabold">{item.salaryJump}</span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                  "{item.quote}"
                </p>

              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Active Merchant
                </span>
                <button
                  onClick={() => window.location.href = '/auth/daftar'}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Daftar Sekarang →
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
