const fs = require('fs');

let client = fs.readFileSync('src/app/(dashboard)/stok/StokClient.tsx', 'utf8');

client = client.replace('<select value={supplierId} onChange={e => {', '<select disabled={!isVIP} className={!isVIP ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""} value={supplierId} onChange={e => {');
client = client.replace('<label className="block text-sm font-bold text-gray-700 mb-1.5">Supplier / Vendor</label>', '<div className="flex justify-between items-center mb-1.5"><label className="block text-sm font-bold text-gray-700">Supplier / Vendor</label>{!isVIP && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Fitur VIP</span>}</div>');

fs.writeFileSync('src/app/(dashboard)/stok/StokClient.tsx', client);
console.log('Fixed StokClient Supplier Modal');
