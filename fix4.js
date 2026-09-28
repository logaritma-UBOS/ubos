const fs = require('fs');

let client = fs.readFileSync('src/app/(dashboard)/stok/StokClient.tsx', 'utf8');

const target = `{activeTab === "SUPPLIER" && (`;
const replacement = `{activeTab === "SUPPLIER" && !isVIP && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-lg mx-auto mt-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Fitur VIP: Manajemen Supplier</h3>
            <p className="text-gray-500 text-sm mb-6">Tingkatkan akun Anda ke VIP untuk mulai mencatat dan mengelola data supplier untuk bisnis Anda.</p>
            <button onClick={() => window.dispatchEvent(new Event("open-donate-modal"))} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-xl w-full hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 transition-all">
              Tingkatkan ke VIP
            </button>
          </div>
        )}
        
        {activeTab === "SUPPLIER" && isVIP && (`;

client = client.replace(target, replacement);

fs.writeFileSync('src/app/(dashboard)/stok/StokClient.tsx', client);
console.log('Fixed StokClient Supplier Tab');
