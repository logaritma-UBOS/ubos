const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* MOBILE BOTTOM BUTTON \(Hidden on Desktop\) \*\/\}\s*<div className="lg:hidden fixed bottom-0 left-0 right-0 pb-\[76px\] bg-white border-t border-gray-100 z-30\s*shadow-lg">\s*<div className="p-4">\s*<Button onClick=\{handleCheckout\} disabled=\{isProcessing \|\| !isCashValid\} variant="primary"\s*className="w-full py-4 text-lg rounded-xl shadow-lg">\s*\{isProcessing \? "Memproses\.\.\." : "Konfirmasi Pembayaran"\}\s*<\/Button>\s*<\/div>\s*<\/div>/g;

const replacement = `{/* MOBILE BOTTOM BUTTON (Hidden on Desktop) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 pb-[76px] bg-white border-t border-gray-100 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
            <div className="p-4 flex flex-col gap-2">
              <Button onClick={handleCheckout} disabled={isProcessing || !isCashValid} variant="primary" className="w-full py-3.5 text-lg rounded-xl shadow-lg shadow-emerald-600/20">
                {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
              </Button>
              <Button 
                onClick={() => {
                  setDraftNameInput(selectedCustomerId ? localCustomers.find((c: any) => c.id === selectedCustomerId)?.name || "" : "");
                  setDraftPhoneInput(selectedCustomerId ? localCustomers.find((c: any) => c.id === selectedCustomerId)?.phone || "" : "");
                  setIsDraftSaved(false);
                  setSavedDraftData(null);
                  setShowDraftModal(true);
                }} 
                disabled={isProcessing} 
                variant="outline" 
                className="w-full py-3.5 text-base rounded-xl flex items-center justify-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Simpan Pesanan (Hold)</span>
              </Button>
            </div>
          </div>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(file, code);
    console.log('Successfully added Simpan Pesanan button to mobile bottom bar in PAYMENT step!');
} else {
    console.log('Target block STILL not found!');
}
