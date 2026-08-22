'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ClipboardList, Search, Calendar, FileText, Download, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: m } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
        if (!m) return;

        // 1. Ambil data master produk untuk referensi nama
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', m.id);

        // 2. Ambil data transaksi
        const { data: txs, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('merchant_id', m.id)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) {
          console.error('Supabase Error:', error.message);
        }

        if (txs && txs.length > 0) {
          const txIds = txs.map(t => t.id);

          // 3. Ambil item transaksi
          const { data: items } = await supabase
            .from('transaction_items')
            .select('*')
            .in('transaction_id', txIds);

          // 4. Petakan nama produk secara langsung berdasarkan product_id dari master produk
          const prodMap = new Map((prods || []).map(p => [p.id, p.nama_produk || p.name]));

          const txWithItems = txs.map(tx => {
            const matchedItems = (items || []).filter(item => item.transaction_id === tx.id).map(item => ({
              ...item,
              resolved_name: item.nama_produk || prodMap.get(item.product_id) || 'Produk'
            }));

            return {
              ...tx,
              items: matchedItems
            };
          });

          setTransactions(txWithItems);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const filteredTransactions = transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    const receipt = (tx.receipt_number || tx.id || '').toLowerCase();
    const customerName = (tx.nama_pelanggan || tx.customer_name || 'guest').toLowerCase();
    
    const matchesItems = tx.items?.some((item: any) => {
      const pName = (item.resolved_name || '').toLowerCase();
      return pName.includes(query);
    });

    const matchesSearch = receipt.includes(query) || customerName.includes(query) || matchesItems;

    let matchesDate = true;
    if (selectedDate && tx.created_at) {
      const txDate = new Date(tx.created_at).toISOString().split('T')[0];
      matchesDate = txDate === selectedDate;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-10">
      
      {/* Modal Filter Tanggal */}
      {showDateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Filter Berdasarkan Tanggal</h3>
              <button onClick={() => setShowDateModal(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Pilih Tanggal</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 font-medium"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => { setSelectedDate(''); setShowDateModal(false); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowDateModal(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardList size={24} className="text-[#4F75FF]" />
            Riwayat Transaksi
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Semua riwayat penjualan Anda beserta rincian produk</p>
        </div>
        <button 
          onClick={() => toast.success('Fitur Export Data siap digunakan')}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID transaksi, nama produk, pelanggan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4F75FF]"
            />
          </div>
          <button 
            onClick={() => setShowDateModal(true)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDate ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <Calendar size={16} />
            {selectedDate ? `Tanggal: ${selectedDate}` : 'Filter Tanggal'}
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-[#4F75FF]/30 border-t-[#4F75FF] rounded-full animate-spin mx-auto mb-2"></div>
            Memuat data...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            Belum ada transaksi yang ditemukan.
          </div>
        ) : (
          <>
            {/* TAMPILAN MOBILE */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const nominalTotal = Number(tx.total_gross || tx.total || 0);
                const productNames = tx.items?.map((item: any) => `${item.resolved_name} (${item.qty}x)`).join(', ') || 'Produk Penjualan';

                return (
                  <div key={tx.id} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {tx.receipt_number || tx.id?.substring(0,8).toUpperCase()}
                      </span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Lunas
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-semibold bg-slate-50 p-2 rounded-xl border border-slate-100">
                      🛒 {productNames}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{tx.created_at ? `${new Date(tx.created_at).toLocaleDateString('id-ID')} • ${new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : '-'}</span>
                      <span className="font-medium text-slate-600">{tx.channel || 'Dine In'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-slate-600">Pelanggan: <strong className="text-slate-900">{tx.customer_name || tx.nama_pelanggan || 'Guest'}</strong></span>
                      <span className="font-black text-slate-900 text-sm">{formatIDR(nominalTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TAMPILAN DESKTOP */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaksi</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rincian Produk</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => {
                    const nominalTotal = Number(tx.total_gross || tx.total || 0);

                    return (
                      <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-slate-900 text-sm">
                            {tx.receipt_number || tx.id?.substring(0,8).toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{tx.channel || 'Dine In'}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-xs font-bold text-slate-800 space-y-1">
                            {tx.items && tx.items.length > 0 ? (
                              tx.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  <span>{item.resolved_name} <strong className="text-blue-600">({item.qty}x)</strong></span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-400 italic font-normal">Produk Penjualan</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm text-slate-700">{tx.created_at ? new Date(tx.created_at).toLocaleDateString('id-ID') : '-'}</div>
                          <div className="text-xs text-slate-500">{tx.created_at ? new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm font-medium text-slate-700">{tx.customer_name || tx.nama_pelanggan || 'Guest'}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Lunas</span>
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="font-black text-slate-900">{formatIDR(nominalTotal)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}