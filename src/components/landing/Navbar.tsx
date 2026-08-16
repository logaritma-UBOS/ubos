'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, ChevronRight, Calculator, Store } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  onOpenEnrollment: (track?: string) => void;
  onOpenCalculator?: () => void;
}

export default function Navbar({ onOpenEnrollment, onOpenCalculator }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Solusi UMKM', href: '#programs' },
    { name: 'Keunggulan UBOS', href: '#bento' },
    { name: 'Kalkulator HPP', href: '#calculator' },
    { name: 'Kisah UMKM', href: '#alumni' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-xl shadow-slate-950/20 py-3 text-white' 
        : 'bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 py-4 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <img src="/logaritma-logo.png" alt="Logaritma Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Logaritma<span className="text-gradient-blue-emerald">.id</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  UBOS AI v4.2
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Profit & Margin Guard UMKM</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-emerald-400 hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/auth/login"
              className="text-xs font-semibold px-4 py-2.5 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Masuk
            </Link>
            <button 
              onClick={() => onOpenCalculator?.()}
              className="text-xs font-semibold px-4 py-2.5 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl bg-slate-900/90 hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hitung HPP</span>
            </button>
            <button 
              onClick={() => window.location.href = '/auth/daftar'}
              className="btn-gradient-primary text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"
            >
              <span>Coba Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 backdrop-blur-2xl border-b border-slate-800 px-4 pt-4 pb-6 mt-3 space-y-4 animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 px-3 py-2.5 rounded-xl hover:bg-slate-900 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
            <a
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-semibold py-3 text-slate-300 border border-slate-800 rounded-xl bg-slate-900/50 hover:bg-slate-800/80"
            >
              Masuk ke Akun Saya
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCalculator?.();
              }}
              className="w-full text-center text-xs font-semibold py-3 text-slate-200 border border-slate-800 rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              Hitung HPP Bisnis Saya
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.href = '/auth/daftar';
              }}
              className="w-full btn-gradient-primary text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <span>Coba Gratis 7 Hari</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
