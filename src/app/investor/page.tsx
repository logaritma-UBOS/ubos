'use client';

import React, { useState, useMemo } from 'react';
import { Target, Server, MessageCircle, BrainCircuit, TrendingUp, Wallet, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const FUNDING_ITEMS = [
  {
    id: 'hosting',
    title: 'Hosting & Database (Vercel, Supabase)',
    description: 'Infrastruktur cloud berkecepatan tinggi untuk menopang beban trafik merchant.',
    price: 350000,
    icon: Server,
    color: 'blue'
  },
  {
    id: 'wa_gateway',
    title: 'WhatsApp Gateway API',
    description: 'Paket starter untuk notifikasi otomatis dan follow-up CRM via Fonnte.',
    price: 100000,
    icon: MessageCircle,
    color: 'emerald'
  },
  {
    id: 'ai_token',
    title: 'OpenAI / Gemini API Tokens',
    description: 'Kapasitas token untuk AI Copilot dan Revenue Intelligence engine.',
    price: 200000,
    icon: BrainCircuit,
    color: 'purple'
  },
  {
    id: 'gtm_ads',
    title: 'Pemasaran Awal (GTM / Meta Ads)',
    description: 'Alokasi iklan lokal tertarget untuk mengakuisisi 100+ merchant pertama (F&B / Kuliner).',
    price: 1000000,
    icon: TrendingUp,
    color: 'amber'
  },
  {
    id: 'cash_reserve',
    title: 'Cadangan Kas Operasional',
    description: 'Dana tak terduga untuk maintain server atau biaya operasional lain.',
    price: 300000,
    icon: Wallet,
    color: 'slate'
  }
];

export default function InvestorPortal() {
  const [selectedItems, setSelectedItems] = useState<string[]>(FUNDING_ITEMS.map(i => i.id));
  const [isLoading, setIsLoading] = useState(false);
  const [investorName, setInvestorName] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');

  const targetAmount = 1950000;
  
  const currentTotal = useMemo(() => {
    return FUNDING_ITEMS.filter(item => selectedItems.includes(item.id)).reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedItems]);

  const progressPercentage = (currentTotal / targetAmount) * 100;

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const selectAll = () => {
    setSelectedItems(FUNDING_ITEMS.map(i => i.id));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Pilih minimal satu item untuk didanai.');
      return;
    }

    if (!investorName || !investorEmail) {
      toast.error('Mohon lengkapi Nama dan Email Anda untuk akses dasbor.');
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedItemNames = FUNDING_ITEMS.filter(item => selectedItems.includes(item.id)).map(i => i.title);
      
      const response = await fetch('/api/mayar/investor-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: investorName,
          email: investorEmail,
          phone: investorPhone || '080000000000',
          amount: currentTotal,
          fundedItems: selectedItemNames
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Gagal membuat link pembayaran.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan sistem.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Series A Micro-Funding
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Project Funding & Investor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Transparency</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Jadilah bagian dari revolusi CRM dan Revenue Intelligence Logaritma UBOS. Danai infrastruktur kami dan pantau aliran kas secara transparan melalui akses Dasbor Investor eksklusif.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Funding Items */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Progress Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Target Pendanaan Tahap I</p>
                  <p className="text-3xl font-black text-white">Rp {targetAmount.toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Terpilih</p>
                  <p className="text-2xl font-black text-blue-400">Rp {currentTotal.toLocaleString('id-ID')}</p>
                </div>
              </div>
              
              <div className="w-full bg-slate-950 rounded-full h-3 mb-2 border border-slate-800 overflow-hidden relative z-10">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 font-medium text-right relative z-10">{progressPercentage.toFixed(0)}% dari target</p>
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2"><Target size={20} className="text-blue-500"/> Pilih Item Pendanaan</h2>
              <button onClick={selectAll} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Pilih Semua</button>
            </div>

            <div className="space-y-4">
              {FUNDING_ITEMS.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const Icon = item.icon;
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-slate-800/80 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{item.title}</h3>
                          <p className={`font-black transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-slate-500 pr-8">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Checkbox absolute pos */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-700'}`}>
                        {isSelected && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>

          {/* Right Column: Checkout Form */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 sticky top-8 shadow-xl">
              <h2 className="text-xl font-black text-white mb-2">Checkout Investasi</h2>
              <p className="text-sm font-medium text-slate-400 mb-6">Dana yang masuk akan dicatat secara otomatis ke dasbor Accounting.</p>
              
              <form onSubmit={handleCheckout} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap / Instansi</label>
                  <input 
                    type="text" 
                    required
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email (Untuk Akses Dasbor)</label>
                  <input 
                    type="email" 
                    required
                    value={investorEmail}
                    onChange={(e) => setInvestorEmail(e.target.value)}
                    placeholder="john@example.com" 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No. WhatsApp (Opsional)</label>
                  <input 
                    type="tel" 
                    value={investorPhone}
                    onChange={(e) => setInvestorPhone(e.target.value)}
                    placeholder="081234567890" 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                  />
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 font-bold">Total Pendanaan:</span>
                    <span className="text-2xl font-black text-white">Rp {currentTotal.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading || currentTotal === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <><Loader2 size={20} className="animate-spin" /> Memproses...</>
                    ) : (
                      <>
                        {currentTotal === targetAmount ? 'Danai Seluruh Project' : `Danai Item Terpilih`}
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest">
                    Secured by Mayar Payment Gateway
                  </p>
                </div>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
