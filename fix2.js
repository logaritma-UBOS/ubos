const fs = require('fs');

let page = fs.readFileSync('src/app/(dashboard)/katalog/produk/tambah/page.tsx', 'utf8');
page = page.replace('import TambahProdukClient from "./TambahProdukClient"', 'import TambahProdukClient from "./TambahProdukClient"\nimport { checkIsVIP } from "@/lib/vip"');
page = page.replace('return <TambahProdukClient businessType={business.businessType} />', 'const isVIP = await checkIsVIP(session.user.id);\n  return <TambahProdukClient businessType={business.businessType} isVIP={isVIP} />');
fs.writeFileSync('src/app/(dashboard)/katalog/produk/tambah/page.tsx', page);

let client = fs.readFileSync('src/app/(dashboard)/katalog/produk/tambah/TambahProdukClient.tsx', 'utf8');
client = client.replace('export default function TambahProdukClient({ businessType }: { businessType: string }) {', 'export default function TambahProdukClient({ businessType, isVIP = false }: { businessType: string, isVIP?: boolean }) {');
client = client.replace('<label className="block text-sm font-bold text-gray-700 mb-1.5">Supplier (Opsional)</label>', '<div className="flex justify-between items-center mb-1.5"><label className="block text-sm font-bold text-gray-700">Supplier (Opsional)</label>{!isVIP && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Fitur VIP</span>}</div>');
client = client.replace('<select name="supplierId" className="block w-full border', '<select name="supplierId" disabled={!isVIP} className={`block w-full border ${!isVIP ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""}');
fs.writeFileSync('src/app/(dashboard)/katalog/produk/tambah/TambahProdukClient.tsx', client);

console.log('Fixed TambahProduk');
