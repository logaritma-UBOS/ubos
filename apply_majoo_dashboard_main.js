const fs = require('fs');

const file = 'src/app/ubos/[category]/[slug]/page.tsx';

const newDashboardHeader = `
  return (
    <div className="pb-24 md:pb-10 bg-slate-50 min-h-screen">
      
      {/* Tentukan Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowTargetModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
            >
              <AlertCircle size={20} />
            </button>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Target size={120} />
            </div>
            <div className="relative z-10 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Target size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tentukan Target Baru</h2>
                {typeof window !== 'undefined' && localStorage.getItem('targetProfit') ? (
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-xl mb-4 text-sm font-medium border border-amber-200">
                    Target Anda sebelumnya adalah <strong>{formatIDR(parseInt(localStorage.getItem('targetProfit') || '0'))}</strong>.<br/>Yakin ingin mengubah target ini?
                  </div>
                ) : (
                  <p className="text-slate-500 font-medium text-sm mb-4">Tentukan target profit bersih bulanan Anda.</p>
                )}
              </div>
              <div className="relative">
                <CurrencyInput
                  value={targetProfit}
                  onChange={setTargetProfit}
                  icon="Rp"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-2xl text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-center"
                />
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('targetProfit', targetProfit);
                  toast.success('Target berhasil dikunci!');
                  setShowTargetModal(false);
                  window.dispatchEvent(new Event('storage'));
                }}
                className="w-full btn-gradient-primary border-none text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Kunci Target
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-20 space-y-6">
        
        {/* Promo Banner Majoo Style */}
        <div className="w-full bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden relative shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center font-bold text-white text-xs">U</div>
                <span className="font-black text-emerald-600 text-lg tracking-tight">Capital</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">BERANI TUMBUH, MODAL SIAP DUKUNG</h2>
              <p className="text-slate-600 font-medium text-sm mb-4">Hingga 280jt cair &le;2 hari. Pengajuan &plusmn;10mnt, langsung dari Logaritma*</p>
              <button className="text-emerald-600 font-bold text-sm hover:underline">Ajukan Sekarang</button>
            </div>
            <div className="hidden md:block w-1/3 bg-emerald-100 h-full min-h-[160px] relative">
              <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/20 to-transparent"></div>
              {/* Graphic Placeholder */}
            </div>
          </div>
        </div>

        {/* Onboarding Widget Majoo Style */}
        {showOnboarding && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 mb-6">
            {/* Header Green */}
            <div className="bg-emerald-500 p-5 md:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg md:text-xl font-bold">Langkah Mudah Buka Outlet</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="font-bold text-sm">0/3</span>
                <div className="flex-1 md:w-64 h-3 bg-emerald-600/50 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Content Cards */}
            <div className="p-5 md:p-6 pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 -mt-2">
              <button 
                onClick={() => setShowTargetModal(true)}
                className="bg-white p-5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-emerald-500 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-emerald-500" />
                  <span className="font-medium text-slate-700">Siapkan Produk</span>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </button>
              
              <button 
                onClick={() => router.push(\`/ubos/\${params.category || 'kuliner'}/\${params.slug}/inventory\`)}
                className="bg-white p-5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-emerald-500 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-emerald-500" />
                  <span className="font-medium text-slate-700">Informasi Karyawan</span>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </button>

              <button 
                onClick={() => router.push('/settings')}
                className="bg-white p-5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-emerald-500 hover:-translate-y-1 transition-all group mb-6 md:mb-0"
              >
                <div className="flex items-center gap-3">
                  <Store size={20} className="text-emerald-500" />
                  <span className="font-medium text-slate-700">Lengkapi Data Outlet</span>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Penjualan Header & Filter Majoo Style */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-medium text-slate-900 flex items-center gap-2">
                Dashboard Penjualan <AlertCircle size={20} className="text-emerald-500" />
              </h2>
              <p className="text-sm text-slate-500 mt-1">Diperbarui {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}, {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mt-2 border-t border-slate-100 pt-4">
              {/* Segmented Control */}
              <div className="flex rounded-lg border border-slate-200 w-full md:w-auto overflow-hidden">
                {['Harian', 'Mingguan', 'Bulan'].map((filter, idx) => (
                  <button 
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={\`flex-1 md:flex-none px-6 py-2 text-sm font-medium transition-colors \${timeFilter === filter ? 'bg-emerald-500 text-white' : 'text-slate-600 bg-white hover:bg-slate-50'} \${idx !== 0 ? 'border-l border-slate-200' : ''}\`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              {/* Date Picker Dummy */}
              <div className="flex items-center justify-between border border-slate-200 rounded-lg bg-white px-4 py-2 text-sm text-slate-700 w-full md:w-64">
                <span className="cursor-pointer font-bold">&lt;</span>
                <span>15 Agt 26 - 15 Agt 26</span>
                <span className="cursor-pointer font-bold">&gt;</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Stats Grid - 4 Metric Cards */}
`;

let content = fs.readFileSync(file, 'utf8');
// Normalize newlines to \n to avoid CRLF issues
content = content.replace(/\r\n/g, '\n');

const startTarget = '  return (\n    <div className="pb-24 md:pb-10 bg-slate-50 min-h-screen">';
const endTarget = '        {/* 2. Top Stats Grid - 4 Metric Cards */}';

const startIndex = content.indexOf(startTarget);
const endIndex = content.indexOf(endTarget);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newDashboardHeader.trim() + '\n' + content.substring(endIndex + endTarget.length);
  fs.writeFileSync(file, content);
  console.log("Updated Majoo dashboard layout in " + file);
} else {
  console.log("Could not find targets in " + file);
}
