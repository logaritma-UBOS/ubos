'use client';

import React, { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Linkedin, Instagram, Youtube, Twitter, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenEnrollment }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-lg">
                  L
                </div>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Logaritma<span className="text-gradient-blue-emerald">.id</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed font-normal max-w-sm">
              Platform Kasir POS, Anti Dead-Stock, & Margin Guard UMKM terdepan di Indonesia. Membantu pemilik bisnis menghitung HPP asli, mengunci margin keuntungan, dan menghentikan kebocoran modal.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-rose-500 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2.5">
              <li><a href="#programs" className="hover:text-emerald-400 transition-colors">Solusi Paket UMKM</a></li>
              <li><a href="#bento" className="hover:text-emerald-400 transition-colors">Keunggulan UBOS System</a></li>
              <li><a href="#calculator" className="hover:text-emerald-400 transition-colors">Kalkulator HPP & Profit</a></li>
              <li><a href="#alumni" className="hover:text-emerald-400 transition-colors">Kisah Pemilik UMKM</a></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors">Pusat Bantuan FAQ</a></li>
            </ul>
          </div>

          {/* Col 3: Tracks Catalog */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sektor UMKM</h4>
            <ul className="space-y-2.5">
              <li><a href="#programs" className="hover:text-blue-400 transition-colors">Toko Kelontong & Ritel</a></li>
              <li><a href="#programs" className="hover:text-blue-400 transition-colors">FnB, Cafe & Resto</a></li>
              <li><a href="#programs" className="hover:text-blue-400 transition-colors">Percetakan & Digital Print</a></li>
              <li><a href="#programs" className="hover:text-blue-400 transition-colors">Laundry & Service Center</a></li>
              <li><a href="#programs" className="hover:text-blue-400 transition-colors">Grosir Multi-Cabang</a></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Buletin UMKM Logaritma</h4>
            <p className="text-slate-400 text-xs">
              Dapatkan tips kelola HPP dan strategi bebas dead-stock gratis setiap minggu.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Email aktif usahamu..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>{subscribed ? '✓ Subscribed!' : 'Langganan Tips Gratis'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Logaritma.id — Kalkulator Profit & Margin Guard UMKM Indonesia.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Kebijakan Privasi</a>
            <a href="#" className="hover:text-slate-300">Syarat & Ketentuan Service</a>
            <a href="#" className="hover:text-slate-300">Garansi Uji Coba 14 Hari</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
