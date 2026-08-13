'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShoppingBag, Minus, Plus, Search, MapPin, ExternalLink, AlertCircle, MessageCircle, Store } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('Terbaru'); // 'Terbaru', 'Termurah', 'Termahal'

  // Info Modal
  const [showInfoToko, setShowInfoToko] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const { data: merchantsData, error: merchantErr } = await supabase
          .from('merchants')
          .select('*');
          
        if (merchantErr) throw merchantErr;
        
        const matchedMerchant = merchantsData?.find(m => {
          const expectedSlug = (m.nama_usaha || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return expectedSlug === slug;
        });

        if (!matchedMerchant) {
          setLoading(false);
          return;
        }

        if (matchedMerchant.online_store_enabled === false) {
          toast.error('Toko online sedang tidak aktif.');
          setMerchant({ ...matchedMerchant, disabled: true });
          setLoading(false);
          return;
        }

        setMerchant(matchedMerchant);

        // set default order type based on category
        const cat = (matchedMerchant.kategori_usaha || matchedMerchant.kategori || '').toLowerCase();
        if (cat.includes('jasa') || cat.includes('laundry')) {
          setOrderType('Drop di Toko');
        } else if (cat.includes('percetakan') || cat.includes('ritel') || cat.includes('toko') || cat.includes('grosir')) {
          setOrderType('Ambil di Toko');
        } else {
          setOrderType('Takeaway');
        }

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

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (sortBy === 'Termurah') {
      result = result.sort((a, b) => a.harga_jual - b.harga_jual);
    } else if (sortBy === 'Termahal') {
      result = result.sort((a, b) => b.harga_jual - a.harga_jual);
    } else {
      // Terbaru (assuming newer ID or created_at, but we'll just use natural order or reverse)
      result = result.reverse();
    }
    
    return result;
  }, [products, searchQuery, sortBy]);

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
    const reqAddress = ['Delivery', 'Antar Jemput', 'Kirim Kurir'].includes(orderType);
    if (reqAddress && !customerAddress) {
      toast.error(`Mohon isi alamat pengiriman untuk tipe ${orderType}`);
      return;
    }

    setIsSubmitting(true);
    try {
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
      
      const itemsToInsert = cart.map(item => ({
        transaction_id: trxData.id,
        product_id: item.id,
        qty: item.qty,
        harga_satuan: item.price,
        hpp_satuan: item.hpp
      }));
      
      const { error: itemsError } = await supabase.from('transaction_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      const waNumber = merchant.store_wa_number || merchant.whatsapp;
      const cleanWA = waNumber ? waNumber.replace(/\D/g, '') : '';
      
      let message = `Halo ${merchant.nama_usaha},\nSaya ingin memesan:\n\n`;
      cart.forEach(item => {
        message += `- ${item.qty}x ${item.name} (${formatIDR(item.price * item.qty)})\n`;
      });
      message += `\n*Total: ${formatIDR(cartTotal)}*\n`;
      message += `\n*Data Pemesan:*\nNama: ${customerName}\nWA: ${customerWA}\nTipe Order: ${orderType}\n`;
      
      if (['Delivery', 'Antar Jemput', 'Kirim Kurir'].includes(orderType)) {
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
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Toko Tidak Ditemukan</h1>
        <p className="text-slate-500">Maaf, toko yang Anda cari tidak tersedia atau sedang tidak aktif.</p>
      </div>
    );
  }

  const waLink = `https://wa.me/${merchant.store_wa_number || merchant.whatsapp?.replace(/\D/g, '') || ''}`;

  const categoryRaw = merchant?.kategori_usaha || merchant?.kategori || '';
  const categoryStr = categoryRaw.toLowerCase();
  let deliveryOptions = ['Takeaway', 'Dine-in', 'Delivery'];
  if (categoryStr.includes('jasa') || categoryStr.includes('laundry')) {
    deliveryOptions = ['Drop di Toko', 'Antar Jemput'];
  } else if (categoryStr.includes('percetakan') || categoryStr.includes('ritel') || categoryStr.includes('toko') || categoryStr.includes('grosir')) {
    deliveryOptions = ['Ambil di Toko', 'Kirim Kurir'];
  } else if (!categoryStr.includes('kuliner') && !categoryStr.includes('f&b') && !categoryStr.includes('warung')) {
    deliveryOptions = ['Ambil Sendiri', 'Kirim Kurir'];
  }
  
  const requiresAddress = ['Delivery', 'Antar Jemput', 'Kirim Kurir'].includes(orderType);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      
      {/* Header / Navbar */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
              {merchant.logo_url ? <img src={merchant.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <ShoppingBag size={16}/>}
            </div>
            <span className="font-bold text-slate-800 hidden sm:block text-sm">{merchant.nama_usaha}</span>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Cari barang di ${merchant.nama_usaha}`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Right: Cart Icon */}
          <div className="shrink-0 flex items-center gap-2">
             <button onClick={() => cart.length > 0 && setShowCheckout(true)} className="relative p-2 text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
              <ShoppingBag size={24} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((sum, i) => sum + i.qty, 0)}
                </span>
              )}
            </button>
            {/* Optional contact button for mobile */}
            <a href={waLink} target="_blank" className="hidden sm:flex text-slate-600 text-sm font-bold items-center gap-1 hover:text-primary ml-4">
               {merchant.store_wa_number || merchant.whatsapp}
            </a>
          </div>
        </div>
      </header>

      {/* Cover & Profile Section */}
      <div className="max-w-5xl mx-auto bg-white mb-6 shadow-sm sm:rounded-b-2xl border-x border-b border-slate-200">
        
        {/* Banner */}
        <div className="w-full h-32 md:h-56 bg-slate-200 overflow-hidden relative">
          {merchant.banner_url ? (
            <img src={merchant.banner_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-100" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-6 md:px-8 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          
          {/* Avatar & Details */}
          <div className="flex flex-col md:flex-row gap-4 md:items-end -mt-12 md:-mt-16 z-10 relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1.5 shadow-md shrink-0 border border-slate-100">
              <div className="w-full h-full rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-bold text-3xl">
                {merchant.logo_url ? <img src={merchant.logo_url} className="w-full h-full object-cover" alt="Logo" /> : merchant.nama_usaha.charAt(0)}
              </div>
            </div>
            
            <div className="md:mb-3 flex flex-col">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{merchant.nama_usaha}</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">{merchant.slogan || 'Belanja mudah, aman, dan terpercaya.'}</p>
              <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs md:text-sm">
                <MapPin size={14} className="shrink-0" />
                {merchant.gmaps_link ? (
                  <a href={merchant.gmaps_link} target="_blank" rel="noopener noreferrer" className="truncate max-w-[250px] md:max-w-md hover:text-primary transition-colors">
                    {merchant.address || merchant.alamat || 'Lokasi belum diatur'}
                  </a>
                ) : (
                  <span className="truncate max-w-[250px] md:max-w-md">{merchant.address || merchant.alamat || 'Lokasi belum diatur'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:mb-3 shrink-0">
            <a 
              href={waLink}
              target="_blank"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary font-bold rounded-lg text-sm hover:bg-primary hover:text-white transition-all"
            >
              Chat Penjual
            </a>
            <button 
              onClick={() => setShowInfoToko(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition-all"
            >
              Info Toko <AlertCircle size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <main className="max-w-5xl mx-auto px-4 md:px-0">
        
        <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 text-lg">Semua Produk</h2>
          
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-50"
          >
            <option value="Terbaru">Terbaru</option>
            <option value="Termurah">Termurah</option>
            <option value="Termahal">Termahal</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <ShoppingBag size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Belum ada produk yang dijual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map(product => {
              const qty = getQty(product.id);
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                  <div className="aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden relative border-b border-slate-100">
                    {product.photo_url ? (
                      <img src={product.photo_url} alt={product.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ShoppingBag size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{product.nama_produk}</h3>
                      <p className="text-blue-600 font-black text-[15px] mt-1">{formatIDR(product.harga_jual)}</p>
                    </div>
                    
                    {qty === 0 ? (
                      <button 
                        onClick={() => updateCart(product, 1)}
                        className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between border border-slate-200 rounded-lg p-1">
                        <button onClick={() => updateCart(product, -1)} className="w-7 h-7 flex items-center justify-center text-slate-600 bg-slate-50 rounded hover:bg-slate-200 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-slate-800 w-8 text-center">{qty}</span>
                        <button onClick={() => updateCart(product, 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 bg-slate-50 rounded hover:bg-slate-200 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
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
          <div className="max-w-5xl mx-auto">
            <button 
              onClick={() => setShowCheckout(true)}
              className="w-full bg-[#407BFF] text-white p-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-between font-bold hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                  {cart.reduce((sum, i) => sum + i.qty, 0)} item
                </div>
                <span>Lanjut Checkout</span>
              </div>
              <span className="text-lg">{formatIDR(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowCheckout(false)} />
          
          <div className="bg-white w-full md:w-[450px] h-full overflow-hidden flex flex-col animate-in slide-in-from-right-full duration-300 shadow-2xl relative z-10 md:rounded-l-3xl">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <ShoppingBag size={20} className="text-slate-700" /> Pesanan Anda
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
                <div className="pt-3 mt-1 flex justify-between items-center text-blue-600">
                  <span className="font-bold">Total Pembayaran</span>
                  <span className="font-black text-lg">{formatIDR(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-600" /> Detail Pengiriman
                </h3>
                
                <div className={`grid ${deliveryOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200`}>
                  {deliveryOptions.map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${orderType === type ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nama Lengkap *</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Misal: Budi" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nomor WhatsApp *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+62</span>
                    <input type="tel" value={customerWA} onChange={e => setCustomerWA(e.target.value.replace(/\D/g, ''))} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="81234567890" />
                  </div>
                </div>

                {requiresAddress && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Alamat Pengiriman *</label>
                    <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-24" placeholder="Detail alamat lengkap..." />
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Catatan Tambahan (Opsional)</label>
                  <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Misal: Jangan pedas" />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white p-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-70 disabled:scale-100 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    Kirim Pesanan (WhatsApp)
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Info Toko Modal */}
      {showInfoToko && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowInfoToko(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Store size={20} className="text-primary" />
                Informasi Toko
              </h3>
              <button onClick={() => setShowInfoToko(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-3xl mb-3 overflow-hidden">
                  {merchant.logo_url ? <img src={merchant.logo_url} className="w-full h-full object-cover" alt="Logo" /> : merchant.nama_usaha.charAt(0)}
                </div>
                <h4 className="font-black text-xl text-slate-900">{merchant.nama_usaha}</h4>
                <p className="text-sm text-slate-500 mt-1 font-medium">{merchant.slogan || 'Belanja mudah, aman, dan terpercaya.'}</p>
              </div>

              {merchant.deskripsi_toko && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Toko</h5>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{merchant.deskripsi_toko}</p>
                </div>
              )}

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi</h5>
                <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl">
                  <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-slate-700">{merchant.address || merchant.alamat || 'Lokasi belum diatur'}</p>
                    {merchant.gmaps_link && (
                      <a href={merchant.gmaps_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline w-fit">
                        Buka di Google Maps <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
