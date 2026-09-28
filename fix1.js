const fs = require('fs');

let page = fs.readFileSync('src/app/(dashboard)/katalog/produk/[id]/edit/page.tsx', 'utf8');
page = page.replace('import EditProductClient from "./EditProductClient"', 'import EditProductClient from "./EditProductClient"\nimport { checkIsVIP } from "@/lib/vip"');
page = page.replace('return <EditProductClient product={product} suppliers={suppliers} />', 'const isVIP = await checkIsVIP(session.user.id);\n  return <EditProductClient product={product} suppliers={suppliers} isVIP={isVIP} />');
fs.writeFileSync('src/app/(dashboard)/katalog/produk/[id]/edit/page.tsx', page);

let client = fs.readFileSync('src/app/(dashboard)/katalog/produk/[id]/edit/EditProductClient.tsx', 'utf8');
client = client.replace('export default function EditProductClient({ product, suppliers }: { product: any, suppliers: any[] }) {', 'export default function EditProductClient({ product, suppliers, isVIP = false }: { product: any, suppliers: any[], isVIP?: boolean }) {');
client = client.replace('<label className="block text-sm font-bold text-gray-700 mb-1.5">Supplier (Opsional)</label>', '<div className="flex justify-between items-center mb-1.5"><label className="block text-sm font-bold text-gray-700">Supplier (Opsional)</label>{!isVIP && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Fitur VIP</span>}</div>');
client = client.replace('<select name="supplierId" defaultValue={product.supplierId || ""} className="block w-full border', '<select name="supplierId" disabled={!isVIP} defaultValue={product.supplierId || ""} className={`block w-full border ${!isVIP ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""}');
fs.writeFileSync('src/app/(dashboard)/katalog/produk/[id]/edit/EditProductClient.tsx', client);

console.log('Fixed EditProduct');
