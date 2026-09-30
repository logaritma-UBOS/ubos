"use client"
import { useState } from "react"
import { addManualLead } from "@/actions/manualLead"

export default function RadarProspekForm() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState({ text: "", type: "" })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !phone.trim()) return
        setLoading(true)
        setMsg({ text: "", type: "" })
        const res = await addManualLead(name.trim(), phone.trim())
        if (res?.error) {
            setMsg({ text: res.error, type: "error" })
        } else {
            setMsg({ text: "✓ Lead berhasil dicatat! Menunggu delegasi dari Baim.", type: "success" })
            setName("")
            setPhone("")
        }
        setLoading(false)
        setTimeout(() => setMsg({ text: "", type: "" }), 6000)
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base">Radar Prospek</h3>
                    <p className="text-xs text-gray-500">Input calon user UBOS yang kamu temukan</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <input
                        required
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nama lengkap calon user..."
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div className="flex-1 relative">
                    <input
                        required
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Nomor WA (cth: 08121234567)"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50 whitespace-nowrap flex items-center gap-2 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {loading ? "Menyimpan..." : "Tambah Lead"}
                </button>
            </form>

            {msg.text && (
                <p className={`mt-3 text-xs font-semibold ${msg.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
                    {msg.text}
                </p>
            )}
        </div>
    )
}
