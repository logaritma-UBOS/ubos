const fs = require('fs');
const path = require('path');

const posPath = path.join(__dirname, 'src', 'app', 'pos', 'page.tsx');
let content = fs.readFileSync(posPath, 'utf8');

const cartUI = `  const renderCheckoutUI = (isDesktop: boolean) => (
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
              className={\`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all \${paymentMethod === 'TUNAI' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}\`}
            >
              Tunai
            </button>
            <button 
              onClick={() => setPaymentMethod('QRIS')}
              className={\`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all \${paymentMethod === 'QRIS' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500'}\`}
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rp</span>
                <input 
                  type="text" 
                  value={cashReceived}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\\D/g, '');
                    setCashReceived(new Intl.NumberFormat('id-ID').format(Number(val)));
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <span className="text-slate-500 font-bold text-sm">Kembalian</span>
              <span className={\`text-lg font-black \${change < 0 ? 'text-danger' : 'text-emerald-600'}\`}>
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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
            placeholder="Nama Pelanggan"
          />
          <input 
            type="tel" 
            value={customerWA}
            onChange={(e) => setCustomerWA(e.target.value.replace(/\\D/g, ''))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
            placeholder="No WhatsApp (0812...)"
          />
        </div>
      </div>

      <div className={\`p-6 pt-3 bg-white border-t border-slate-50 shrink-0 \${!isDesktop ? 'pb-[calc(1.5rem+env(safe-area-inset-bottom))]' : ''}\`}>
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

`;

// Insert renderCheckoutUI
content = content.replace('  if (loading) {', cartUI + '\n  if (loading) {');

// Remove original checkout modal from return
const checkoutModalRegex = /\{\/\* Checkout Modal \*\/\}(.|\n)*?\{\/\* Success Modal \*\/\}/g;
content = content.replace(checkoutModalRegex, '{/* Checkout Modal for Mobile */}\n      {showCheckout && (\n        <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end">\n          <div className="max-w-md w-full mx-auto bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">\n            {renderCheckoutUI(false)}\n          </div>\n        </div>\n      )}\n\n      {/* Success Modal */}');

// Update main layout for desktop dual column
const mainLayoutRegex = /<div className="flex flex-col min-h-full pb-\[100px\] animate-in fade-in duration-500 relative pt-20">/g;
content = content.replace(mainLayoutRegex, '<div className="flex flex-col md:flex-row min-h-full pb-[100px] md:pb-0 animate-in fade-in duration-500 relative pt-20">\n        <div className="flex-1 md:h-[calc(100vh-80px)] md:overflow-y-auto">');

// Update floating cart button to hide on desktop
const stickyCartRegex = /<div className="fixed bottom-\[88px\] left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-8 fade-in duration-300 max-w-md mx-auto">/g;
content = content.replace(stickyCartRegex, '<div className="md:hidden fixed bottom-[88px] left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-8 fade-in duration-300 max-w-md mx-auto">');

// We also need to add the right column for desktop inside the main container
const rightColumnHTML = `\n        </div>\n\n        {/* Right Column (Desktop Only) */}\n        <div className="hidden md:flex md:w-[400px] lg:w-[450px] border-l border-slate-200 bg-white h-[calc(100vh-80px)] flex-col sticky top-20">\n          {renderCheckoutUI(true)}\n        </div>\n`;

// Where does the product grid container end? 
// It ends right before " {/* Sticky Cart Bar */}"
content = content.replace('      {/* Sticky Cart Bar */}', rightColumnHTML + '\n      {/* Sticky Cart Bar */}');

fs.writeFileSync(posPath, content);
console.log('Done');
