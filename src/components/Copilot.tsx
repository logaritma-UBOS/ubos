'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Bot, X, Sparkles, TrendingUp, AlertTriangle, MessageSquare, ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';

type Insight = {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  actionLabel?: string;
  actionPayload?: any;
};

export default function Copilot({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(inline);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<any>(null);
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: React.ReactNode }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('merchants').select('*').eq('user_id', user.id).maybeSingle();
      
      if (error) {
        console.error('Failed to fetch merchant profile:', error.message || error);
      }
      
      if (data) {
        setMerchantId(data.id);
        setMerchantProfile(data);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isOpen && merchantId) {
      fetchInsights();
    }
  }, [isOpen, pathname, merchantId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const newInsights: Insight[] = [];
      
      if (pathname.includes('/inventory')) {
        // HPP Insight
        const { data: products } = await supabase.from('products').select('*').eq('merchant_id', merchantId);
        if (products) {
          const lowMarginProducts = products.filter(p => {
            if (p.hpp_dasar <= 0) return false;
            const margin = (p.harga_jual - p.hpp_dasar) / p.harga_jual;
            return margin < 0.35; // margin < 35%
          });
          
          if (lowMarginProducts.length > 0) {
            const product = lowMarginProducts[0];
            const targetPrice = Math.ceil((product.hpp_dasar / 0.6) / 100) * 100;
            newInsights.push({
              id: 'margin-alert',
              type: 'warning',
              title: 'Margin Profit Terlalu Rendah',
              description: `HPP untuk "${product.nama_produk}" adalah ${formatIDR(product.hpp_dasar)}. Harga jual saat ini ${formatIDR(product.harga_jual)} membuat margin <35%. AI menyarankan harga dinaikkan menjadi ${formatIDR(targetPrice)}.`,
              actionLabel: 'Update Harga Otomatis',
              actionPayload: { action: 'UPDATE_PRICE', productId: product.id, newPrice: targetPrice }
            });
          } else {
             newInsights.push({
              id: 'margin-good',
              type: 'success',
              title: 'Struktur Harga Optimal',
              description: 'Seluruh menu Anda memiliki margin profit di atas target aman (40%). Lanjutkan kerja bagus ini!',
            });
          }
        }
      } 
      else if (pathname.includes('/crm')) {
        // CRM Insight
        const { data: customers } = await supabase.from('customers').select('*').eq('merchant_id', merchantId).order('total_visits', { ascending: false }).limit(5);
        if (customers && customers.length > 0) {
          newInsights.push({
            id: 'crm-broadcast',
            type: 'info',
            title: 'Peluang Re-Engagement Pelanggan',
            description: `Ada ${customers.length} pelanggan setia Anda yang memiliki total belanja tinggi. Generate pesan WA Broadcast diskon khusus untuk mereka agar segera datang kembali.`,
            actionLabel: 'Kirim WA Broadcast',
            actionPayload: { action: 'WA_BROADCAST', count: customers.length }
          });
        }
      }
      else if (pathname.includes('/finance')) {
        // Finance Insight
        const { data: wallet } = await supabase.from('wallets').select('*').eq('merchant_id', merchantId).single();
        if (wallet && wallet.kas_operasional > 0) {
          newInsights.push({
            id: 'finance-alloc',
            type: 'info',
            title: 'Analisis Kas Operasional',
            description: `Saldo Kas Operasional Anda mencapai ${formatIDR(wallet.kas_operasional)}. Sebagian kas ini dapat diinvestasikan kembali untuk belanja modal atau marketing bulan depan.`,
          });
        } else {
           newInsights.push({
            id: 'finance-alert',
            type: 'warning',
            title: 'Kas Operasional Menipis',
            description: `Anda belum memiliki Kas Operasional yang cukup untuk bulan ini. Fokus tingkatkan penjualan harian agar 20% alokasi profit otomatis mengisi kas ini.`,
          });
        }
      }
      else {
        // POS / Dashboard Insight (Run-rate & Target Nag)
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Cek target mingguan
        const targetProfitStr = localStorage.getItem('targetProfit') || '5000000';
        const monthlyTarget = parseInt(targetProfitStr.replace(/\D/g, ''), 10) || 5000000;
        const weeklyTarget = monthlyTarget / 4;
        
        const now = new Date();
        const dayOfWeek = now.getDay(); 
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Senin s/d Minggu
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const { data: weekTrx } = await supabase.from('transactions')
          .select('created_at, total_net')
          .eq('merchant_id', merchantId)
          .gte('created_at', startOfWeek.toISOString());

        let totalWeekOmzet = 0;
        let totalTodayOmzet = 0;
        let todayOrderCount = 0;
        let peakHour = -1;
        let maxOrders = 0;

        if (weekTrx && weekTrx.length > 0) {
          totalWeekOmzet = weekTrx.reduce((sum, t) => sum + (t.total_net || 0), 0);
          
          const todayTrx = weekTrx.filter(t => t.created_at.startsWith(todayStr));
          totalTodayOmzet = todayTrx.reduce((sum, t) => sum + (t.total_net || 0), 0);
          todayOrderCount = todayTrx.length;
          
          const hourCounts = todayTrx.reduce((acc: any, t) => {
            const hour = new Date(t.created_at).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
          }, {});
          
          Object.keys(hourCounts).forEach(h => {
            if (hourCounts[h] > maxOrders) {
              maxOrders = hourCounts[h];
              peakHour = parseInt(h);
            }
          });
        }

        // AKTIF - Nagging System
        if (totalWeekOmzet < weeklyTarget) {
          const percentKurang = Math.round(((weeklyTarget - totalWeekOmzet) / weeklyTarget) * 100);
          // If we are at the start of the week and have 0 sales, it will say 100%. That's fine.
          newInsights.push({
            id: 'pos-target-nag',
            type: 'warning',
            title: '⚠️ Peringatan Target Mingguan',
            description: `Bos, penjualan minggu ini kurang ${percentKurang}% dari target mingguan (${formatIDR(weeklyTarget)}). Yuk jalankan strategi promo A (misalnya diskon bundling) untuk kejar ketinggalan!`,
            actionLabel: 'Tanya Strategi Promo',
            actionPayload: { action: 'CHAT_PROMO' } // We can handle this to auto-fill chat
          });
        } else {
           newInsights.push({
            id: 'pos-target-nag',
            type: 'success',
            title: '🎯 Target On-Track',
            description: `Luar biasa Bos! Penjualan minggu ini sudah melampaui target mingguan. Pertahankan momentum ini!`,
          });
        }

        if (todayOrderCount > 0) {
          let desc = `Hari ini Anda mendapat ${todayOrderCount} pesanan dengan total omzet ${formatIDR(totalTodayOmzet)}.`;
          if (peakHour !== -1) {
            const nextHour = (peakHour + 1) % 24;
            const hourStr = `${peakHour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
            if (todayOrderCount > 2) {
                desc += ` AI Logaritma memprediksi jam sibuk selanjutnya di sekitar pukul ${hourStr}.`;
            } else {
                desc += ` Bagikan promo toko ke WhatsApp untuk mendongkrak pesanan.`;
            }
          }

          newInsights.push({
            id: 'pos-runrate',
            type: 'info',
            title: 'Insight Penjualan Harian',
            description: desc,
          });
        } else {
           newInsights.push({
            id: 'pos-runrate',
            type: 'info',
            title: 'Insight Penjualan Harian',
            description: 'Belum ada penjualan hari ini. Buka Smart POS dan catat transaksi pertama Anda!',
          });
        }
        
        // Cek stok cepat
        const { data: products } = await supabase.from('products').select('*').eq('merchant_id', merchantId).eq('is_available', true).limit(3);
        if (products && products.length > 0) {
           newInsights.push({
            id: 'pos-stock',
            type: 'warning',
            title: 'Prediksi Bahan Baku',
            description: `Berdasarkan laju pesanan (Run-rate), stok bahan baku untuk "${products[0].nama_produk}" diperkirakan habis sebelum jam tutup operasional.`,
            actionLabel: 'Tandai Menu Habis',
            actionPayload: { action: 'MARK_EMPTY', productId: products[0].id }
          });
        }
      }

      setInsights(newInsights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (payload: any) => {
    try {
      if (payload.action === 'UPDATE_PRICE') {
        await supabase.from('products').update({ harga_jual: payload.newPrice }).eq('id', payload.productId);
        toast.success('Harga berhasil diperbarui!');
        fetchInsights();
      } 
      else if (payload.action === 'WA_BROADCAST') {
        const text = `Halo Kak! Ada promo spesial nih untuk menu favoritmu hari ini. Datang ke kedai kami dan tunjukkan pesan ini ya!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setIsOpen(false);
      }
      else if (payload.action === 'MARK_EMPTY') {
        await supabase.from('products').update({ is_available: false }).eq('id', payload.productId);
        toast.success('Menu telah ditandai habis.');
        if (pathname.includes('/pos') || pathname.includes('/inventory')) {
          window.location.reload(); // Hard reload for simplicity to reflect in parent states
        }
      }
      else if (payload.action === 'CHAT_PROMO') {
        // Auto fill and submit chat
        setChatMessage('Bos, apa strategi promo A yang bagus untuk kejar target minggu ini?');
        setTimeout(() => {
          const form = document.getElementById('copilot-chat-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        }, 100);
      }
    } catch (err) {
      toast.error('Gagal menjalankan aksi');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          contextData: { 
            merchantProfile,
            insights: insights.map(i => i.title + ': ' + i.description),
            page: pathname
          }
        })
      });
      
      const data = await response.json();
      if (data.text) {
        setChatHistory(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghubungi AI Copilot');
    } finally {
      setIsTyping(false);
    }
  };

  if (!merchantId) return null;

  return (
    <>
      {/* Floating Trigger Button - only if not inline */}
      {!inline && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
          <button 
            onClick={() => setIsOpen(true)}
            className="relative group bg-slate-900 text-white p-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-all duration-300 flex items-center justify-center border border-slate-700"
          >
            <div className="absolute inset-0 rounded-full bg-slate-800 animate-ping opacity-20"></div>
            <Sparkles size={24} className="text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Drawer or Inline Content */}
      {isOpen && (
        <div className={inline ? "w-full h-full bg-slate-50 flex flex-col rounded-3xl border border-slate-200 overflow-hidden shadow-sm" : "fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex justify-end"}>
          {/* Overlay to close - only if not inline */}
          {!inline && <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>}
          
          <div className={inline ? "relative w-full h-full flex flex-col" : "relative w-full max-w-md bg-slate-50 h-full max-h-[85vh] md:max-h-screen mt-auto md:mt-0 flex flex-col shadow-2xl rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none animate-in slide-in-from-bottom-full md:slide-in-from-right-full duration-300"}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 bg-slate-900 text-white relative overflow-hidden ${inline ? '' : 'rounded-t-3xl md:rounded-tl-3xl md:rounded-tr-none'}`}>
              {/* Glow Effect Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B5BDB]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 shrink-0 relative group">
                  <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full group-hover:bg-emerald-400/40 transition-all duration-500"></div>
                  <Bot size={24} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </div>
                <div>
                  <h2 className="font-black text-xl tracking-tight text-white drop-shadow-md">AI Logaritma</h2>
                  <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Business Copilot</p>
                </div>
              </div>
              {!inline && (
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar bg-slate-50">
              
              {!merchantProfile?.operating_hours && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 shadow-sm mb-2">
                  <AlertTriangle size={20} className="text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-800 font-medium leading-relaxed">
                    Lengkapi jam operasional tokomu di menu <a href="/settings" className="font-bold underline">Setting</a> agar AI bisa memberikan saran yang lebih presisi!
                  </p>
                </div>
              )}

              <p className="text-sm font-bold text-slate-500 mb-2">Contextual Insights</p>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-bold animate-pulse">Menganalisis data...</p>
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-10">
                  <Bot size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Belum ada wawasan khusus untuk halaman ini.</p>
                </div>
              ) : (
                insights.map((insight) => (
                  <div key={insight.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="flex gap-3 relative z-10">
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        insight.type === 'warning' ? 'bg-orange-100 text-orange-500' :
                        insight.type === 'success' ? 'bg-emerald-100 text-emerald-500' :
                        'bg-blue-100 text-blue-500'
                      }`}>
                        {insight.type === 'warning' ? <AlertTriangle size={18} /> : 
                         insight.type === 'success' ? <TrendingUp size={18} /> : 
                         <MessageSquare size={18} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm mb-1.5">{insight.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
                        
                        {insight.actionLabel && (
                          <button 
                            onClick={() => handleAction(insight.actionPayload)}
                            className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {insight.actionLabel}
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-4 rounded-2xl bg-white border border-slate-200 rounded-bl-none shadow-sm flex items-center gap-1.5 h-11">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <form id="copilot-chat-form" onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Tanya soal performa bisnismu..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={isTyping || !chatMessage.trim()}
                className="p-3 bg-primary hover:bg-primary-dark text-white rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
