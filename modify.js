const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Chunk 1
code = code.replace(
  "const [showModal, setShowModal] = useState(false);\n  const [loading, setLoading] = useState(false);",
  "const [showModal, setShowModal] = useState(false);\n  const [showDevPopup, setShowDevPopup] = useState(false);\n  const [loading, setLoading] = useState(false);"
);

// Chunk 2
code = code.replace(
  "ownerName: '',\n    merchantName: '',\n    whatsapp: '',\n    category: 'Kuliner & F&B'",
  "password: '',\n    merchantName: '',\n    whatsapp: '',\n    category: 'Kuliner & F&B'"
);

// Chunk 3
const oldHandler = `  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let cleanWA = formData.whatsapp.replace(/\\D/g, '');
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      if (cleanWA.startsWith('0')) cleanWA = '62' + cleanWA.slice(1);
      else if (cleanWA.startsWith('8')) cleanWA = '62' + cleanWA;
      
      const { data: existingWa } = await supabase
        .from('merchants')
        .select('id')
        .eq('whatsapp', cleanWA)
        .maybeSingle();

      if (existingWa) {
        toast.error("Nomor WhatsApp ini sudah terdaftar. Silakan login untuk melanjutkan.");
        router.push('/auth');
        return;
      }

      const leadData = {
        nama_usaha: formData.merchantName,
        owner_name: formData.ownerName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));

      await supabase.from('leads').insert([
        {
          nama_pemilik: formData.ownerName,
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead'
        }
      ]);
      toast.success("Berhasil! Mengalihkan ke Member Area...");
      setShowModal(false);
      const categoryParam = encodeURIComponent(formData.category.toLowerCase().split(' ')[0] || 'kuliner');
      router.push(\`/member?category=\${categoryParam}\`);
      
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };`;

const newHandler = `  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.category !== "Kuliner & F&B") {
      setShowModal(false);
      setShowDevPopup(true);
      return;
    }

    setLoading(true);

    try {
      let cleanWA = formData.whatsapp.replace(/\\D/g, '');
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      if (cleanWA.startsWith('0')) cleanWA = '62' + cleanWA.slice(1);
      else if (cleanWA.startsWith('8')) cleanWA = '62' + cleanWA;
      
      const { data: existingWa } = await supabase
        .from('merchants')
        .select('id')
        .eq('whatsapp', cleanWA)
        .maybeSingle();

      if (existingWa) {
        toast.error("Nomor WhatsApp ini sudah terdaftar. Silakan login untuk melanjutkan.");
        router.push('/member/login');
        return;
      }

      const leadData = {
        nama_usaha: formData.merchantName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));
      localStorage.setItem('ubos_temp_pass', formData.password);

      await supabase.from('leads').insert([
        {
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead'
        }
      ]);
      
      toast.success("Berhasil! Mengalihkan ke Dashboard UBOS...");
      setShowModal(false);
      router.push(\`/ubos\`);
      
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };`;
code = code.replace(oldHandler, newHandler);

// Chunk 4
const oldInputs = `                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nama Pemilik Usaha</label>
                  <input required type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="Sesuai KTP/Panggilan" className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nama Usaha / Toko</label>
                  <input required type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} placeholder="Nama Brand Anda" className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} className="sm:w-4 sm:h-4" />
                    </div>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="0812xxxx..." className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                  </div>
                </div>`;
const newInputs = `                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nama Usaha / Toko</label>
                  <input required type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} placeholder="Nama Brand Anda" className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Nomor WhatsApp Aktif</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} className="sm:w-4 sm:h-4" />
                    </div>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="0812xxxx..." className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Password Login</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimal 6 karakter" minLength={6} className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-sm sm:text-base" />
                </div>`;
code = code.replace(oldInputs, newInputs);

// Chunk 5
const oldOpts = `                    <option value="Kuliner & F&B">Kuliner & F&B (Warung, Resto, Cafe)</option>
                    <option value="Fotokopi & Percetakan">Fotokopi & Percetakan</option>
                    <option value="Toko & Ritel">Toko & Ritel (Minimarket, Olshop)</option>
                    <option value="Laundry & Jasa">Laundry & Jasa</option>`;
const newOpts = `                    <option value="Kuliner & F&B">Kuliner & F&B</option>
                    <option value="Percetakan">Percetakan</option>
                    <option value="Ritel">Ritel</option>
                    <option value="Jasa / Lainnya">Jasa / Lainnya</option>`;
code = code.replace(oldOpts, newOpts);

// Chunk 6
const oldEnd = `      )}
    </div>
  );
}`;
const newEnd = `      )}

      {/* Dev Popup Modal */}
      {showDevPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative border-[3px] sm:border-4 border-white">
            <button onClick={() => setShowDevPopup(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
              Modul {formData.category} Sedang Dalam Pengembangan 🚀
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              Modul khusus kategori ini sedang kami siapkan untuk pengalaman terbaik Anda. Saat ini Anda dapat mengakses Member Area Logaritma untuk menikmati materi edukasi, modul pendukung, dan support system kami.
            </p>
            <button onClick={() => { setShowDevPopup(false); router.push('/member'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              Masuk ke Member Area <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`;
code = code.replace(oldEnd, newEnd);

fs.writeFileSync('src/app/page.tsx', code);
console.log("Modifications complete.");
