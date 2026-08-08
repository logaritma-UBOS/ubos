const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. ADD STATES
const stateHookPos = pageCode.indexOf('const [loading, setLoading] = useState(false);');
const statesToAdd = `  const [showExistingPopup, setShowExistingPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('');
`;
pageCode = pageCode.slice(0, stateHookPos) + statesToAdd + pageCode.slice(stateHookPos);

// 2. MODIFY existingWa block
const oldExistingWa = `      if (existingWa) {
        toast.error("Nomor WhatsApp ini sudah terdaftar. Silakan login untuk melanjutkan.");
        router.push('/auth');
        return;
      }`;
const newExistingWa = `      if (existingWa) {
        setShowModal(false);
        setShowExistingPopup(true);
        return;
      }`;
pageCode = pageCode.replace(oldExistingWa, newExistingWa);

// 3. MODIFY Error Catch block
const oldErrorCatch = `    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
      if (err.message && err.message.toLowerCase().includes('sudah terdaftar')) {
        setTimeout(() => {
          setShowModal(false);
          router.push('/auth');
        }, 1500);
      }
    } finally {`;
const newErrorCatch = `    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('sudah terdaftar')) {
        setShowModal(false);
        setShowExistingPopup(true);
      } else {
        toast.error(err.message || 'Terjadi kesalahan.');
      }
    } finally {`;
pageCode = pageCode.replace(oldErrorCatch, newErrorCatch);

// 4. MODIFY Success Block (isFnB)
const oldSuccessBlock = `      if (isFnB) {
        toast.success("Berhasil! Mengalihkan ke Dashboard UBOS...");
        const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
        router.push(\`/ubos/kuliner/\${slug}\`);
      } else {
        setShowDevPopup(true);
      }`;
const newSuccessBlock = `      const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
      const targetLink = isFnB ? \`/ubos/kuliner/\${slug}\` : '/member';
      setDashboardLink(targetLink);
      setShowWelcomePopup(true);`;
pageCode = pageCode.replace(oldSuccessBlock, newSuccessBlock);


// 5. ADD POPUPS AT THE END
const oldClosingTag = `    </div>
  );
}`;
const newPopups = `
      {/* Existing User Popup */}
      {showExistingPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative border-[3px] sm:border-4 border-white">
            <button onClick={() => setShowExistingPopup(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
              Nomor Sudah Terdaftar!
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              Silakan login untuk melanjutkan.
            </p>
            <button onClick={() => { setShowExistingPopup(false); router.push('/auth'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              Login UBOS <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-8 text-center relative border-[3px] sm:border-4 border-white">
            <button onClick={() => setShowWelcomePopup(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
              Selamat Bergabung di Logaritma - UBOS!
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8">
              Pendaftaran Anda telah kami terima.
            </p>
            <button onClick={() => { setShowWelcomePopup(false); router.push(dashboardLink); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              Masuk Ke Dashboard UBOS <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`;
pageCode = pageCode.replace(oldClosingTag, newPopups);

fs.writeFileSync('src/app/page.tsx', pageCode);
console.log("Applied popups to page.tsx");
