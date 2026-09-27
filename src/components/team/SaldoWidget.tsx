"use client"
import { formatRupiah } from "@/lib/format"

export default function SaldoWidget({ balance, totalEarned, ledgers }: { balance: number, totalEarned: number, ledgers: any[] }) {
    return (
        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white mb-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Saldo Tersedia</p>
                    <h3 className="text-3xl font-black">{formatRupiah(balance)}</h3>
                </div>
                <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-white/10">Tarik Saldo</button>
            </div>
            
            <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Riwayat Royalti Terakhir</p>
                <div className="space-y-2">
                    {ledgers.length === 0 && <p className="text-xs text-gray-500">Belum ada riwayat pemasukan.</p>}
                    {ledgers.map(l => (
                        <div key={l.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-300 truncate max-w-[200px]">{l.description}</span>
                            <span className="font-bold text-emerald-400">+{formatRupiah(l.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
