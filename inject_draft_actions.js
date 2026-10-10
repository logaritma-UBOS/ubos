const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// The replacement logic:
const draftCardRegex = /<div key=\{i\} onClick=\{\(\) => resumeDraft\(draft\)\} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-emerald-500 active:scale-95 transition-all flex items-center justify-between group">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\)\)\}/;

const newDraftCard = `<div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-500 transition-all group flex flex-col gap-3">
                        <div className="flex items-center justify-between cursor-pointer active:scale-[0.98]" onClick={() => resumeDraft(draft)}>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {draft.draftName}
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(draft.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {draft.saleItems?.length || 0} item
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-600">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(draft.totalAmount)}
                            </div>
                            <div className="text-[10px] font-semibold text-gray-400 mt-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              LANJUTKAN <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          {draft.draftPhone && (
                            <a
                              href={\`https://wa.me/\${draft.draftPhone.replace(/^0/, "62")}?text=\${encodeURIComponent(\`Halo \${draft.draftName}, pesanan Anda masih kami simpan. Apakah ada tambahan atau ingin kami siapkan sekarang?\`)}\`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1ebd5a] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              Follow up WA
                            </a>
                          )}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Apakah Anda yakin ingin membatalkan/menghapus pesanan gantung ini?')) {
                                await deleteDraftSale(draft.clientTransactionId);
                                loadDrafts(); // reload
                              }
                            }}
                            className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            Hapus Pesanan
                          </button>
                        </div>
                      </div>
                    ))}`;

if (code.match(draftCardRegex)) {
  code = code.replace(draftCardRegex, newDraftCard);
  fs.writeFileSync(file, code);
  console.log('Draft List Modal actions successfully updated!');
} else {
  console.log('Regex match failed!');
}
