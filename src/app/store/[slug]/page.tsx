'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShoppingBag, Minus, Plus, Search, MapPin, Phone, MessageCircle, Store, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart & Checkout
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Order Form
  const [customerName, setCustomerName] = useState('');
  const [customerWA, setCustomerWA] = useState('');
  const [orderType, setOrderType] = useState('Takeaway');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        // Fetch all merchants to find by slug (in a real scenario, slug should be a unique column)
        const { data: merchantsData, error: merchantErr } = await supabase
          .from('merchants')
          .select('*');
          
        if (merchantErr) throw merchantErr;
        
        // Match slug manually since we don't have a slug column guaranteed
        const matchedMerchant = merchantsData?.find(m => {
          const expectedSlug = (m.nama_usaha || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return expectedSlug === slug;
        });

        if (!matchedMerchant) {
          setLoading(false);
          return;
        }

        // Check if online store is enabled (fallback to true if column doesn't exist)
        if (matchedMerchant.online_store_enabled === false) {
          toast.error('Toko online sedang tidak aktif.');
          setMerchant({ ...matchedMerchant, disabled: true });
          setLoading(false);
          return;
        }

        setMerchant(matchedMerchant);

        // Fetch products for this merchant
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', matchedMerchant.id)
          .eq('is_available', true);
          
        setProducts(productsData || []);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStore();
  }, [slug]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.kategori).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || p.kategori === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const updateCart = (product: any, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(item => item.id !== product.id);
        return prev.map(item => item.id === product.id ? { ...item, qty: newQty } : item);
      } else if (delta > 0) {
        return [...prev, { id: product.id, name: product.nama_produk, price: product.harga_jual, hpp: product.hpp_dasar || 0, qty: 1, photo: product.photo_url }];
      }
      return prev;
    });
  };

  const getQty = (productId: string) => {
    return cart.find(item => item.id === productId)?.qty || 0;
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (!customerName || !customerWA) {
      toast.error('Mohon lengkapi Nama dan No WhatsApp');
      return;
    }
    if (orderType === 'Delivery' && !customerAddress) {
      toast.error('Mohon isi alamat pengiriman untuk tipe Delivery');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Insert Transaction
      const { data: trxData, error: trxError } = await supabase.from('transactions').insert([{
        merchant_id: merchant.id,
        channel: 'Online Store',
        total_gross: cartTotal,
        komisi_platform: 0,
        total_net: cartTotal,
        payment_method: 'PENDING_ONLINE',
        customer_wa: customerWA,
        status: 'Pending'
      }]).select().single();
      
      if (trxError) throw trxError;
      
      // 2. Insert Items
      const itemsToInsert = cart.map(item => ({
        transaction_id: trxData.id,
        product_id: item.id,
        qty: item.qty,
        harga_satuan: item.price,
        hpp_satuan: item.hpp
      }));
      
      const { error: itemsError } = await supabase.from('transaction_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Redirect to WhatsApp
      const waNumber = merchant.store_wa_number || merchant.whatsapp;
      const cleanWA = waNumber ? waNumber.replace(/\D/g, '') : '';
      
      let message = `Halo ${merchant.nama_usaha},\nSaya ingin memesan:\n\n`;
      cart.forEach(item => {
        message += `- ${item.qty}x ${item.name} (${formatIDR(item.price * item.qty)})\n`;
      });
      message += `\n*Total: ${formatIDR(cartTotal)}*\n`;
      message += `\n*Data Pemesan:*\nNama: ${customerName}\nWA: ${customerWA}\nTipe Order: ${orderType}\n`;
      
      if (orderType === 'Delivery') {
        message += `Alamat: ${customerAddress}\n`;
      }
      if (orderNotes) {
        message += `Catatan: ${orderNotes}\n`;
      }
      message += `\nID Order: #${trxData.id.split('-')[0].toUpperCase()}\nTerima kasih!`;
      
      setCart([]);
      setShowCheckout(false);

      if (cleanWA) {
        window.open(`https://wa.me/${cleanWA}?text=${encodeURIComponent(message)}`, '_blank');
        toast.success('Berhasil diarahkan ke WhatsApp untuk penyelesaian order!');
      } else {
        toast.success('Pesanan berhasil dibuat! Merchant tidak memiliki no WA aktif.');
      }

    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  if (!merchant || merchant.disabled) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <Store size={48} className="text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Toko Tidak Ditemukan</h1>
        <p className="text-slate-500">Maaf, toko yang Anda cari tidak tersedia atau sedang tidak aktif.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl shadow-inner overflow-hidden">
              {merchant.logo_url ? <img src={merchant.logo_url} className="w-full h-full object-cover" alt="Logo" /> : merchant.nama_usaha.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">{merchant.nama_usaha}</h1>
              <p className="text-xs text-slate-500 font-medium">{merchant.kategori_usaha || 'Toko Online'}</p>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        {categories.length > 1 && (
          <div className="max-w-3xl mx-auto px-4 pb-4 overflow-x-auto hide-scrollbar flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Product Grid */}
      <main className="max-w-3xl mx-auto p-4">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Store size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Belum ada produk yang dijual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {filteredProducts.map(product => {
              const qty = getQty(product.id);
              return (
                <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col h-full relative group">
                  <div className="aspect-[4/3] w-full bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-50 relative">
                    {product.photo_url ? (
                      <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight mb-2">{product.nama_produk}</h3>
                    <div>
                      <p className="text-primary font-black text-sm mb-3">{formatIDR(product.harga_jual)}</p>
                      {qty === 0 ? (
                        <button 
                          onClick={() => updateCart(product, 1)}
                          className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          Tambah
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-1">
                          <button onClick={() => updateCart(product, -1)} className="w-8 h-8 flex items-center justify-center text-primary bg-white rounded-lg hover:bg-primary hover:text-white transition-colors shadow-sm">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-sm text-primary w-8 text-center">{qty}</span>
                          <button onClick={() => updateCart(product, 1)} className="w-8 h-8 flex items-center justify-center text-primary bg-white rounded-lg hover:bg-primary hover:text-white transition-colors shadow-sm">
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCheckout && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 animate-in slide-in-from-bottom-5">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setShowCheckout(true)}
              className="w-full bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-between font-bold hover:bg-primary-dark transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {cart.reduce((sum, i) => sum + i.qty, 0)} item
                </div>
                <span>Lanjut Checkout</span>
              </div>
              <span className="text-lg">{formatIDR(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Checkout Bottom Sheet */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowCheckout(false)} />
          <div className="bg-white w-full max-w-3xl mx-auto rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full duration-300 shadow-2xl relative z-10">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" /> Pesanan Anda
              </h2>
              <button onClick={() => setShowCheckout(false)} className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200">
                Tutup
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl divide-y divide-slate-200/60 shadow-sm">
                {cart.map(item => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <span className="font-bold text-sm text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">{item.qty}x</span>
                       <span className="font-bold text-sm text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-black text-sm text-slate-800">{formatIDR(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="pt-3 mt-1 flex justify-between items-center text-primary">
                  <span className="font-bold">Total Pembayaran</span>
                  <span className="font-black text-lg">{formatIDR(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <MapPin size={16} className="text-primary" /> Detail Pengiriman
                </h3>
                
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  {['Takeaway', 'Dine-in', 'Delivery'].map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${orderType === type ? 'bg-white shadow-sm text-primary border border-slate-200' : 'text-slate-500'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nama Lengkap *</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Misal: Budi" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nomor WhatsApp *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+62</span>
                    <input type="tel" value={customerWA} onChange={e => setCustomerWA(e.target.value.replace(/\D/g, ''))} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="81234567890" />
                  </div>
                </div>

                {orderType === 'Delivery' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Alamat Pengiriman *</label>
                    <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24" placeholder="Detail alamat lengkap..." />
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Catatan Tambahan (Opsional)</label>
                  <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Misal: Jangan pedas" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-70 disabled:scale-100 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    Kirim Pesanan via WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
