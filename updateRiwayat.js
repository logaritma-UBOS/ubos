const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/riwayat/RiwayatClient.tsx', 'utf8');

code = code.replace(/export default function RiwayatClient\(\) \{/, 'export default function RiwayatClient({ plan }: { plan?: string }) {');

const banner = `
      {plan === 'STARTER' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Batas Riwayat 7 Hari</p>
              <p className="text-amber-700 text-xs mt-0.5">Paket Starter hanya menampilkan riwayat mutasi 7 hari terakhir.</p>
            </div>
          </div>
          <Link href="/founder" className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">
            Upgrade PRO
          </Link>
        </div>
      )}
`;

code = code.replace(/<div className="p-4 md:p-8 space-y-6">/, '<div className="p-4 md:p-8 space-y-6">\n' + banner);

fs.writeFileSync('src/app/(dashboard)/riwayat/RiwayatClient.tsx', code);
