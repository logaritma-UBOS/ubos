const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/page.tsx',
  'src/app/ubos/jasa/[slug]/page.tsx',
  'src/app/ubos/percetakan/[slug]/page.tsx',
  'src/app/ubos/ritel/[slug]/page.tsx'
];

const targetBannerCode = `
        {/* Target Profit Banner */}
        <div className="w-full bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden relative shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center p-6 md:p-8 gap-4 md:gap-6">
            <div className="flex flex-row items-center gap-4 w-full md:w-auto text-left">
              <div className="w-16 h-16 bg-white rounded-2xl flex shrink-0 items-center justify-center shadow-sm border border-slate-200">
                <Target size={32} className="text-[#4F75FF]" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1 tracking-tight">Capai Target Bulan Ini</h2>
                <p className="text-slate-600 text-sm font-medium">Tentukan target profit bersih dan biarkan AI kami memberikan rekomendasi harian.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowTargetModal(true)}
              className="w-full md:w-auto bg-[#4F75FF] text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:bg-blue-600 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 shrink-0" 
            >
              <Target size={20} />
              TENTUKAN TARGET
            </button>
          </div>
        </div>`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  const startMarker = '{/* Promo Banner Majoo Style */}';
  const endMarker = '{/* Onboarding Widget Majoo Style */}';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + targetBannerCode.trim() + '\n\n        ' + content.substring(endIndex);
    fs.writeFileSync(file, content);
    console.log("Updated Promo Banner to Target Profit Banner in " + file);
  }
}
