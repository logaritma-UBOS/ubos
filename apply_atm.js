const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/page.tsx',
  'src/app/ubos/jasa/[slug]/page.tsx',
  'src/app/ubos/percetakan/[slug]/page.tsx',
  'src/app/ubos/ritel/[slug]/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Add timeFilter state if missing
  if (!content.includes('const [timeFilter, setTimeFilter]')) {
    content = content.replace(
      /const \[showOnboarding, setShowOnboarding\] = useState\(false\);/,
      "const [showOnboarding, setShowOnboarding] = useState(false);\n  const [timeFilter, setTimeFilter] = useState('Hari Ini');"
    );
  }

  // Remove the old Onboarding Modal block completely
  content = content.replace(/\{\/\* Onboarding Modal Step 1 \*\/\}(.|\n)*?(?=\{\/\* Tentukan Target Modal \*\/\})/g, '');

  // Insert Onboarding Widget & Filter Waktu Transaksi just before the Top Stats Grid
  const newWidgetHtml = `
        {/* Onboarding Widget */}
        {showOnboarding && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Target className="text-emerald-500" size={24} /> Langkah Mudah Buka Outlet
                </h3>
                <p className="text-sm text-slate-500 font-medium">Selesaikan pengaturan awal untuk mengaktifkan AI Copilot.</p>
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-sm">
                0/3 Selesai
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowTargetModal(true)}
                className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all border border-slate-100 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Target Profit</p>
                    <p className="text-xs text-slate-500">Tentukan goal bulan ini</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
              </button>
              
              <button 
                onClick={() => router.push(\`/ubos/\${params.category || 'kuliner'}/\${params.slug}/inventory\`)}
                className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all border border-slate-100 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Siapkan Produk</p>
                    <p className="text-xs text-slate-500">Input stok / layanan</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
              </button>

              <button 
                onClick={() => router.push('/settings')}
                className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all border border-slate-100 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Data Outlet</p>
                    <p className="text-xs text-slate-500">Lengkapi profil bisnis</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Waktu Transaksi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Dashboard Penjualan <span className="text-slate-400 font-normal text-sm ml-2 hidden md:inline">Diperbarui {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
          </h2>
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['Hari Ini', '7 Hari', 'Bulan Ini'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={\`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all \${timeFilter === filter ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}\`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Top Stats Grid - 4 Metric Cards */}
`;
  
  // To avoid duplicates if we run this script multiple times, check if it's already there
  if (!content.includes('Langkah Mudah Buka Outlet')) {
    content = content.replace(/\{\/\* 2\. Top Stats Grid - 4 Metric Cards \*\/\}/g, newWidgetHtml);
  }

  fs.writeFileSync(file, content);
  console.log("Updated ATM features in " + file);
}
