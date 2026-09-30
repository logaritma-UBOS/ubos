import { getMayarBalance } from "@/lib/mayar"
import { formatRupiah } from "@/lib/format"

export default async function MayarBalanceWidget() {
    const res = await getMayarBalance();
    
    return (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.17-1.92H8c.11 1.71 1.33 2.75 2.9 3.12V19h2.33v-1.66c1.65-.37 2.83-1.43 2.83-2.99 0-1.97-1.47-2.65-3.75-3.21z"/></svg>
            </div>
            
            <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Saldo Real-Time (Mayar API)
                </p>
                <h3 className="text-4xl font-black mb-2">
                    {res.success ? formatRupiah(res.balance) : "Rp 0"}
                </h3>
                {!res.success && (
                    <p className="text-xs text-red-300 font-medium">⚠️ {res.message}</p>
                )}
                {res.success && (
                    <p className="text-xs text-indigo-200">Terhubung langsung dengan Payment Gateway.</p>
                )}
            </div>
        </div>
    )
}
