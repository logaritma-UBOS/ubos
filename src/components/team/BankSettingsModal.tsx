"use client"
import { useState } from "react"
import { updateBankDetails } from "@/actions/teamOs"

export default function BankSettingsModal({ teamMember, onClose }: { teamMember: any, onClose: () => void }) {
    const [bankName, setBankName] = useState(teamMember.bankName || "")
    const [bankAccount, setBankAccount] = useState(teamMember.bankAccount || "")
    const [bankAccountName, setBankAccountName] = useState(teamMember.bankAccountName || "")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData()
        fd.append("bankName", bankName)
        fd.append("bankAccount", bankAccount)
        fd.append("bankAccountName", bankAccountName)
        
        const res = await updateBankDetails(fd)
        setLoading(false)
        if (res?.error) {
            alert(res.error)
        } else {
            alert("Berhasil menyimpan rekening bank!")
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-800">
                <h3 className="text-lg font-black text-slate-900 mb-1">Pengaturan Rekening</h3>
                <p className="text-xs text-slate-500 mb-4">Uang pencairan Mayar akan otomatis ditransfer ke rekening ini.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Bank (Misal: BCA, MANDIRI)</label>
                        <input required type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Rekening</label>
                        <input required type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pemilik Rekening</label>
                        <input required type="text" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold" />
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50">
                            {loading ? "Menyimpan..." : "Simpan Rekening"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
