const fs = require('fs');
let code = fs.readFileSync('src/app/founder/FounderClient.tsx', 'utf8');

const oldCheckout = `<div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Paket Founder Pass</p>
              <p className="text-xs text-slate-500">Akses Lifetime + Semua Fitur</p>
            </div>
            <p className="font-black text-xl text-slate-900">Rp 399.000</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>Akses Semua Modul Tanpa Batas</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>Marketing Engine & Rekomendasi AI</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              <span>Free Update Seumur Hidup</span>
            </li>
          </ul>

          <button 
            onClick={handleCheckout} 
            disabled={payLoading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {payLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
          </button>`;

const newCheckout = `          <div className="space-y-4 mb-6">
            <button onClick={() => {}} className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-colors flex justify-between items-center group">
              <div>
                <p className="font-bold text-slate-800">Pro (Bulanan)</p>
                <p className="text-xs text-slate-500">Akses Unlimited & Modul Dasar</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-900">Rp 49.000</p>
                <p className="text-[10px] text-slate-400">/ bulan</p>
              </div>
              <div className="hidden group-hover:block absolute right-4"><button onClick={(e) => { e.stopPropagation(); handleCheckout(49000, "Paket PRO Bulanan", "Akses 1 Bulan"); }} className="bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg">Pilih</button></div>
            </button>

            <button onClick={() => {}} className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-colors flex justify-between items-center group">
              <div>
                <p className="font-bold text-slate-800">Pro (Tahunan)</p>
                <p className="text-xs text-slate-500">Hemat Rp 239.000</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-900">Rp 349.000</p>
                <p className="text-[10px] text-slate-400">/ tahun</p>
              </div>
              <div className="hidden group-hover:block absolute right-4"><button onClick={(e) => { e.stopPropagation(); handleCheckout(349000, "Paket PRO Tahunan", "Akses 1 Tahun"); }} className="bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg">Pilih</button></div>
            </button>

            <button onClick={() => {}} className="w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 transition-colors flex justify-between items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">TERLARIS</div>
              <div>
                <p className="font-bold text-emerald-900">Lifetime Founder Pass</p>
                <p className="text-xs text-emerald-700">Akses Seumur Hidup + Marketing</p>
              </div>
              <div className="text-right mr-16 sm:mr-20">
                <p className="font-black text-lg text-emerald-900">Rp 399.000</p>
                <p className="text-[10px] text-emerald-600 line-through">Rp 1.500.000</p>
              </div>
              <div className="absolute right-4"><button onClick={(e) => { e.stopPropagation(); handleCheckout(399000, "Paket Lifetime Founder Pass", "Akses Seumur Hidup"); }} className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md shadow-emerald-200" disabled={payLoading}>{payLoading ? "..." : "Pilih"}</button></div>
            </button>
          </div>
`;

code = code.replace(oldCheckout, newCheckout);
code = code.replace(/const handleCheckout = async \(\) => \{/, 'const handleCheckout = async (amount: number, planName: string, planDesc: string) => {');
code = code.replace(/body: JSON\.stringify\(\{ amount: 399000, planName: "Paket Founder Pass UBOS", planDesc: "Akses seumur hidup \(Lifetime\) ke seluruh modul UBOS" \}\)/, 'body: JSON.stringify({ amount, planName, planDesc })');

fs.writeFileSync('src/app/founder/FounderClient.tsx', code);
