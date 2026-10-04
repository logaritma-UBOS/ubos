const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/riwayat/RiwayatClient.tsx', 'utf8');

const original = `{sale.saleItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-gray-700"><span className="font-semibold">{item.quantity}x</span> {item.product.name}</p>
                          <p className="text-gray-900 font-semibold">{formatRupiah((item.priceAtSale * item.quantity))}</p>
                        </div>
                      ))}`;

const emptyFallback = `{sale.saleItems && sale.saleItems.length > 0 ? (
                        sale.saleItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-gray-700"><span className="font-semibold">{item.quantity}x</span> {item.product?.name || "Produk Terhapus"}</p>
                            <p className="text-gray-900 font-semibold">{formatRupiah((item.priceAtSale * item.quantity))}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-1 md:col-span-2 text-center py-4 bg-white border border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-500 italic">Rincian item tidak tersedia untuk transaksi ini.</p>
                        </div>
                      )}`;

code = code.replace(original, emptyFallback);
// Let's also fix the list view truncation at the top of the card
const originalListView = `{sale.saleItems.map(item => \`\${item.quantity}x \${item.product.name}\`).join(', ')}`;
const newListView = `{sale.saleItems && sale.saleItems.length > 0 ? sale.saleItems.map(item => \`\${item.quantity}x \${item.product?.name || "Terhapus"}\`).join(', ') : "Item tidak tersedia"}`;
code = code.replace(originalListView, newListView);

fs.writeFileSync('src/app/(dashboard)/riwayat/RiwayatClient.tsx', code);
console.log("Updated RiwayatClient fallback safely");
