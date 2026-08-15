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
          
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Langganan Lebih Hemat dengan Autodebit
            </h2>
            <div className="text-white">
              <span className="text-7xl font-black">Diskon Hingga</span>
              <div className="text-[140px] font-black leading-none drop-shadow-xl mt-[-20px]">
                35<span className="text-6xl align-top">%*</span>
              </div>
            </div>
          </div>

          <div className="pt-12 text-emerald-50 text-sm opacity-80">
            *) Syarat dan Ketentuan Berlaku
          </div>
        </div>
      </div>

      {/* Right Form Container (Full width on mobile, half on PC) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        
        {/* Mobile Header Logo (Only shows when left banner is hidden) */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <img src="/logaritma-logo.png" alt="Logaritma Logo" className="h-8 object-contain" />
          </Link>
        </div>

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
