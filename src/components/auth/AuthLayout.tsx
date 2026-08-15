import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      
      {/* Left Promotional Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 relative overflow-hidden flex-col items-center justify-center p-12 text-center">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 -left-20 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-10 -right-20 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-8">
          <img src="/logaritma-logo.png" alt="Logaritma" className="h-10 mx-auto brightness-0 invert" />
          
          <div className="space-y-4 pt-2 text-left px-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
              Satu Sistem Untuk Semua Kebutuhan
            </h2>
            <p className="text-emerald-50 text-base sm:text-lg font-medium opacity-90 pb-1">
              Tingkatkan efisiensi dan skala usaha Anda dengan fitur operasional terpadu dari UBOS by Logaritma.
            </p>
            
            <div className="space-y-3">
              {[
                'Manajemen Stok & Inventori Real-time',
                'Pencatatan Keuangan & Laporan Otomatis',
                'Aplikasi Kasir (POS) Terintegrasi',
                'Etalase Toko Online & CRM'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 text-white">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center border border-emerald-300/30">
                    <svg className="w-4 h-4 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg drop-shadow-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Container (Full width on mobile, half on PC) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        


        {/* The White Card containing the Form */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10">
          
          {/* UBOS Logo Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img src="/logo-ubos-wide.png" alt="UBOS Logo" className="w-56 sm:w-64 h-auto object-contain mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          </div>

          {/* Render the specific auth form here */}
          {children}

        </div>
      </div>
    </div>
  );
}
