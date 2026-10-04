const fs = require('fs');
let code = fs.readFileSync('src/app/(dashboard)/riwayat/RiwayatClient.tsx', 'utf8');

const emptyFallback = `                      {sale.saleItems && sale.saleItems.length > 0 ? (
                        sale.saleItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-gray-700"><span className="font-semibold">{item.quantity}x</span> {item.product?.name || "Produk Terhapus"}</p>
                            <p className="text-gray-900 font-semibold">{formatRupiah((item.priceAtSale * item.quantity))}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-1 md:col-span-2 text-center py-4 bg-white border border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-500 italic">Rincian item tidak tersedia untuk transaksi lama ini.</p>
                        </div>
                      )}`;

code = code.replace(
    /\{\s*sale\.saleItems\.map\(\(item, idx\) => \([\s\S]*?\)\)\s*\}/,
    emptyFallback
);

fs.writeFileSync('src/app/(dashboard)/riwayat/RiwayatClient.tsx', code);
console.log("Updated RiwayatClient fallback");
