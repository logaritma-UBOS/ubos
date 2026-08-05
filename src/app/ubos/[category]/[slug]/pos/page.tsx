'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ShoppingCart, Store, Plus, Minus, CreditCard, ExternalLink, CheckCircle, Smartphone, Banknote, QrCode, Search } from 'lucide-react';
import { toast } from 'sonner';
import CurrencyInput from '@/components/CurrencyInput';
import { useAILogaritmaEngine } from '@/hooks/useAILogaritmaEngine';

type Channel = 'DINE_IN' | 'GOFOOD' | 'GRABFOOD' | 'SHOPEEFOOD';
type PaymentMethod = 'TUNAI' | 'QRIS';

const CHANNEL_COMMISSIONS: Record<Channel, number> = {
  DINE_IN: 0,
  SHOPEEFOOD: 0.50, // 50%
  GRABFOOD: 0.45,   // 45%
  GOFOOD: 0.35,     // 35%
};

export default function POSPage() {
  const router = useRouter();
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [channel, setChannel] = useState<Channel>('DINE_IN');
  const [cart, setCart] = useState<Record<string, number | string>>({});
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  
  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerWA, setCustomerWA] = useState<string>('');
  
  const { aiState } = useAILogaritmaEngine();
  
  // Success States
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTrxId, setLastTrxId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (merchantData) {
          setMerchant(merchantData);
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .eq('merchant_id', merchantData.id);
          
          setProducts(productsData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const calculateAdjustedPrice = (hpp: number) => {
    const targetMargin = merchant ? (merchant.target_margin_standar / 100) : 0.4;
    const commission = CHANNEL_COMMISSIONS[channel];
    const targetProfit = hpp * targetMargin;
    const price = (hpp + targetProfit) / (1 - commission);
    return Math.ceil(price / 100) * 100; // Round to nearest 100
  };

  const updateCart = (productId: string, delta: number) => {
    setCart(prev => {
      const current = Number(prev[productId]) || 0;
      const newQty = current + delta;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const setCartQty = (productId: string, val: string) => {
    setCart(prev => {
      if (val === '') return { ...prev, [productId]: '' };
      const qty = parseInt(val);
      if (isNaN(qty) || qty < 0) return prev;
      return { ...prev, [productId]: qty };
    });
  };

  const handleBlurQty = (productId: string) => {
    setCart(prev => {
      const qty = Number(prev[productId]) || 0;
      if (qty <= 0) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: qty };
    });
  };

  const cartTotal = useMemo(() => {
    let total = 0;
    let qty = 0;
    Object.entries(cart).forEach(([id, q]) => {
      const numQ = Number(q) || 0;
      if (numQ > 0) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          total += calculateAdjustedPrice(prod.hpp_dasar) * numQ;
          qty += numQ;
        }
      }
    });
    return { total, qty };
  }, [cart, channel, products, merchant]);

  const cashVal = parseInt(cashReceived.replace(/\D/g, '')) || 0;
  const change = cashVal - cartTotal.total;
  const isCashValid = paymentMethod === 'TUNAI' ? cashVal >= cartTotal.total : true;

  const handleCheckout = async () => {
    if (!isCashValid) return;
    setCheckingOut(true);
    try {
      // 1. Insert Transaction
      const komisi = cartTotal.total * CHANNEL_COMMISSIONS[channel];
      const net = cartTotal.total - komisi;
      
      const { data: trxData, error: trxError } = await supabase.from('transactions').insert([{
        merchant_id: merchant.id,
        channel: channel,
        total_gross: cartTotal.total,
        komisi_platform: komisi,
        total_net: net,
        payment_method: paymentMethod,
        customer_wa: customerWA || null
      }]).select().single();
      
      if (trxError) throw trxError;
      
      // 2. Insert Items
      const itemsToInsert = Object.entries(cart).map(([id, q]) => {
        const qty = Number(q) || 0;
        const prod = products.find(p => p.id === id);
        return {
          transaction_id: trxData.id,
          product_id: id,
          qty: qty,
          harga_satuan: calculateAdjustedPrice(prod.hpp_dasar),
          hpp_satuan: prod.hpp_dasar
        };
      }).filter(item => item.qty > 0);
      
      const { error: itemsError } = await supabase.from('transaction_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      
      // 3. Update Wallet Auto-Split
      const totalHPP = itemsToInsert.reduce((sum, item) => sum + (item.hpp_satuan * item.qty), 0);
      const profit = net - totalHPP;
      const kasOperasional = profit * 0.2; // 20% alokasi
      const profitBersih = profit * 0.8; // 80% profit owner
      
      const { data: wallet } = await supabase.from('wallets').select('*').eq('merchant_id', merchant.id).maybeSingle();
      if (wallet) {
         const { error: walletErr } = await supabase.from('wallets').update({
           kas_bahan_baku: (wallet.kas_bahan_baku || 0) + totalHPP,
           kas_operasional: (wallet.kas_operasional || 0) + kasOperasional,
           profit_bersih: (wallet.profit_bersih || 0) + profitBersih
         }).eq('id', wallet.id);
         if (walletErr) console.error("Error updating wallet:", walletErr);
      } else {
         const { error: walletInsertErr } = await supabase.from('wallets').insert([{
           merchant_id: merchant.id,
           kas_bahan_baku: totalHPP,
           kas_operasional: kasOperasional,
           profit_bersih: profitBersih
         }]);
         if (walletInsertErr) console.error("Error inserting wallet:", walletInsertErr);
      }
      
      // 4. CRM Sync (Customer Record)
      if (customerWA && customerName) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('phone', customerWA)
          .maybeSingle();

        if (existingCustomer) {
          await supabase.from('customers').update({
            total_visits: (existingCustomer.total_visits || 0) + 1,
            total_spent: (existingCustomer.total_spent || 0) + cartTotal.total,
            nama: customerName // Update name in case it changed
          }).eq('id', existingCustomer.id);
        } else {
          await supabase.from('customers').insert([{
            merchant_id: merchant.id,
            nama: customerName,
            phone: customerWA,
            total_visits: 1,
            total_spent: cartTotal.total
          }]);
        }
      }
      
      // Reset & Show Success
      setLastTrxId(trxData.id);
      setShowCheckout(false);
      setShowSuccess(true);
      
    } catch (err: any) {
      console.error('POS Checkout Error:', err);
      const msg = err?.message || err?.msg || JSON.stringify(err);
      toast.error('Gagal memproses transaksi', {
        description: msg || 'Periksa koneksi internet atau hubungi admin.',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleReset = () => {
    setCart({});
    setPaymentMethod('TUNAI');
    setCashReceived('');
    setCustomerName('');
    setCustomerWA('');
    setShowSuccess(false);
    // Refresh the router cache so background components like Dashboard fetch fresh data
    router.refresh();
  };
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || p.kategori === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const sendReceiptWA = () => {
    const text = `Terima kasih telah berbelanja di ${merchant?.nama_usaha}!\n\nTotal Pembelanjaan: ${formatIDR(cartTotal.total)}\nMetode Pembayaran: ${paymentMethod}\n\nSemoga harimu menyenangkan!`;
    const waUrl = `https://wa.me/${customerWA.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const renderCheckoutUI = (isDesktop: boolean) => (
    <>
      <div className="flex justify-between items-center p-6 pb-4 bg-white z-10 border-b border-slate-100 shrink-0">
        <h2 className="text-xl font-bold text-slate-900">Pembayaran</h2>
        {!isDesktop && (
          <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600 font-bold px-3 py-1 bg-slate-100 rounded-lg text-sm">Batal</button>
        )}
      </div>
      
      <div className="p-6 space-y-5 flex-1 overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
          <span className="text-primary font-bold">Total Tagihan</span>
          <span className="text-2xl font-black text-primary">{formatIDR(cartTotal.total)}</span>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPaymentMethod('TUNAI')}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${paymentMethod === 'TUNAI' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}`}
            >
              Tunai
            </button>
            <button 
              onClick={() => setPaymentMethod('QRIS')}
              className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${paymentMethod === 'QRIS' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}`}
            >
              QRIS / TF
            </button>
          </div>
        </div>

        {paymentMethod === 'TUNAI' && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Uang Diterima</label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <button type="button" onClick={() => setCashReceived(new Intl.NumberFormat('id-ID').format(cartTotal.total))} className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-lg text-xs font-bold transition-colors">Uang Pas</button>
                <button type="button" onClick={() => setCashReceived(new Intl.NumberFormat('id-ID').format(10000))} className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-lg text-xs font-bold transition-colors">10k</button>
                <button type="button" onClick={() => setCashReceived(new Intl.NumberFormat('id-ID').format(20000))} className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-lg text-xs font-bold transition-colors">20k</button>
                <button type="button" onClick={() => setCashReceived(new Intl.NumberFormat('id-ID').format(50000))} className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-lg text-xs font-bold transition-colors">50k</button>
                <button type="button" onClick={() => setCashReceived(new Intl.NumberFormat('id-ID').format(100000))} className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-lg text-xs font-bold transition-colors">100k</button>
              </div>

              <div className="relative">
                <CurrencyInput
                  value={cashReceived}
                  onChange={setCashReceived}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <span className="text-slate-500 font-bold text-sm">Kembalian</span>
              <span className={`text-lg font-black ${change < 0 ? 'text-danger' : 'text-emerald-600'}`}>
                {change < 0 ? '-' : ''}{formatIDR(Math.abs(change))}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Data Pelanggan (Opsional)</label>
          <input 
            type="text" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
            placeholder="Nama Pelanggan"
          />
          <input 
            type="tel" 
            value={customerWA}
            onChange={(e) => setCustomerWA(e.target.value.replace(/\D/g, ''))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
            placeholder="No WhatsApp (0812...)"
          />
        </div>
      </div>

      <div className={`p-6 pt-3 bg-white border-t border-slate-50 shrink-0 ${!isDesktop ? 'pb-[calc(1.5rem+env(safe-area-inset-bottom))]' : ''}`}>
        <button 
          onClick={handleCheckout}
          disabled={checkingOut || !isCashValid || cartTotal.qty === 0}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-primary/30"
        >
          {checkingOut ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><CheckCircle size={20} /> Selesaikan</>
          )}
        </button>
      </div>
    </>
  );


  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-0 z-40 h-[80px] bg-primary shadow-md max-w-md md:max-w-none mx-auto md:mx-0 left-0 md:left-64 right-0 px-5 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Smart POS</h1>
          <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
            Margin Guard Aktif <span className="text-emerald-300 drop-shadow-sm">({CHANNEL_COMMISSIONS[channel]*100}% Komisi Ter-cover)</span>
          </p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-full pb-[100px] md:pb-0 animate-in fade-in duration-500 relative pt-24">
        <div className="flex-1 md:h-[calc(100vh-80px)] md:overflow-y-auto">
        <div className="p-5 space-y-5 pt-2">

          {/* Channel Selector */}
          <div className="bg-surface rounded-2xl p-1.5 shadow-sm border border-slate-100 flex space-x-1 overflow-x-auto hide-scrollbar snap-x">
            {(Object.keys(CHANNEL_COMMISSIONS) as Channel[]).map(c => {
              const isSelected = channel === c;
              return (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`snap-start whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {c.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          {/* Search Bar & Category Chips */}
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu atau minuman..."
                className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
            
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
              {['Semua', 'Makanan', 'Minuman', 'Snack', 'Lainnya'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div>
            {filteredProducts.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center mt-4">
                <Store size={28} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">Produk tidak ditemukan</p>
                <p className="text-slate-400 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau kategori Anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 mt-4">
                {filteredProducts.map(product => {
                  const price = calculateAdjustedPrice(product.hpp_dasar);
                  const rawQty = cart[product.id];
                  const qty = Number(rawQty) || 0;
                  const isAvailable = product.is_available ?? true;
                  
                  return (
                    <div key={product.id} className={`bg-surface rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden group max-w-xs mx-auto w-full ${!isAvailable ? 'grayscale opacity-60' : ''}`}>
                      {!isAvailable && (
                        <div className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                          Habis
                        </div>
                      )}
                      <div className="aspect-square w-full bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                        {product.photo_url ? (
                          <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover" />
                        ) : (
                          <Store size={32} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-tight">{product.nama_produk}</h3>
                        <p className="text-primary font-black text-sm mt-1.5">{formatIDR(price)}</p>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        {qty > 0 || rawQty === '' ? (
                          <div className={`flex items-center justify-between w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden ${!isAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
                            <button onClick={() => updateCart(product.id, -1)} className="p-2 text-slate-500 active:bg-slate-200 transition-colors"><Minus size={16} /></button>
                            <input 
                              type="number"
                              value={rawQty ?? ''}
                              onChange={(e) => setCartQty(product.id, e.target.value)}
                              onBlur={() => handleBlurQty(product.id)}
                              className="font-bold text-sm w-12 text-center bg-transparent focus:outline-none focus:bg-white py-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button onClick={() => updateCart(product.id, 1)} className="p-2 text-primary active:bg-slate-200 transition-colors"><Plus size={16} /></button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => isAvailable && updateCart(product.id, 1)}
                            disabled={!isAvailable}
                            className={`w-full py-2 rounded-lg font-bold text-xs transition-colors ${isAvailable ? 'bg-primary/10 hover:bg-primary/20 text-primary active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                          >
                            {isAvailable ? 'Tambah' : 'Habis'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (Desktop Only) */}
      <div className="hidden md:flex md:w-[400px] lg:w-[450px] border-l border-slate-200 bg-white h-[calc(100vh-80px)] flex-col sticky top-20">
        {renderCheckoutUI(true)}
      </div>
    </div>

      {/* Sticky Cart Bar */}
      {cartTotal.qty > 0 && !showSuccess && (
        <div className="md:hidden fixed bottom-[88px] left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-8 fade-in duration-300 max-w-md mx-auto">
          <button onClick={() => setShowCheckout(true)} className="w-full bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between active:scale-[0.98] transition-transform border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl relative">
                <ShoppingCart size={20} className="text-white" />
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                  {cartTotal.qty}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Pesanan</p>
                <p className="font-black text-base">{formatIDR(cartTotal.total)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-primary/20">
              Bayar <ExternalLink size={16} />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Modal for Mobile */}
      {showCheckout && (
        <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="max-w-md w-full mx-auto bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
            {renderCheckoutUI(false)}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Transaksi Berhasil!</h3>
              <p className="text-sm text-slate-500 text-center mb-6">Pendapatan telah dipisah ke Kas Bahan Baku dan Profit Bersih.</p>
              
              <div className="w-full space-y-3">
                {customerWA && (
                  <button onClick={sendReceiptWA} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                    <Smartphone size={18} /> Kirim Struk via WA
                  </button>
                )}
                <button onClick={handleReset} className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                  Transaksi Baru
                </button>
                <button onClick={() => router.push(`/ubos/${params.category}/${params.slug}`)} className="w-full py-3.5 border border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-50 transition-all active:scale-95">
                  Kembali ke Dashboard Utama
                </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
