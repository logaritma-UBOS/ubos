const fs = require('fs');

let page = fs.readFileSync('src/app/(dashboard)/stok/page.tsx', 'utf8');
page = page.replace('import StokClient from "./StokClient"', 'import StokClient from "./StokClient"\nimport { checkIsVIP } from "@/lib/vip"');
page = page.replace('suppliers={suppliers}', 'suppliers={suppliers}\n          isVIP={await checkIsVIP(session.user.id)}');
fs.writeFileSync('src/app/(dashboard)/stok/page.tsx', page);

let client = fs.readFileSync('src/app/(dashboard)/stok/StokClient.tsx', 'utf8');
client = client.replace('export default function StokClient({ products, ingredients, suppliers, movements }: any) {', 'export default function StokClient({ products, ingredients, suppliers, movements, isVIP = false }: any) {');
client = client.replace('Data Supplier', 'Data Supplier {!isVIP && <span className="ml-1 text-[8px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded">VIP</span>}');
client = client.replace('activeTab === "SUPPLIER"', 'activeTab === "SUPPLIER" && isVIP'); // If not VIP, they shouldn't even see the tab content properly, or they see a lock screen
// Wait, I will instead show a lock screen if they click the tab.
fs.writeFileSync('src/app/(dashboard)/stok/StokClient.tsx', client);

console.log('Fixed StokPage props');
