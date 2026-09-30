"use client"
import { useState } from "react"
import { delegateManualLead } from "@/actions/manualLead"

type Lead = {
    id: string
    name: string
    phone: string
    status: string
    createdAt: Date | string
    source: { name: string; role: string }
    assignedTo?: { name: string } | null
}

export default function LeadPoolWidget({ leads }: { leads: Lead[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [localLeads, setLocalLeads] = useState(leads)
    const [msg, setMsg] = useState({ id: "", text: "", type: "" })

    const handleDelegate = async (leadId: string, leadName: string) => {
        if (!confirm(`Delegasikan "${leadName}" ke Bana sebagai tugas Follow up CALON USER?\n\nTugas baru akan muncul di Checklist Harian Bana hari ini.`)) return
        setLoadingId(leadId)
        const res = await delegateManualLead(leadId)
        setLoadingId(null)
        if (res?.error) {
            setMsg({ id: leadId, text: "Gagal: " + res.error, type: "error" })
        } else {
            setMsg({ id: leadId, text: "✓ Berhasil didelegasikan ke Bana!", type: "success" })
            setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "DELEGATED" } : l))
        }
        setTimeout(() => setMsg({ id: "", text: "", type: "" }), 5000)
    }

    const statusBadge = (status: string) => {
        if (status === "NEW") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Baru</span>
        if (status === "DELEGATED") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase">Didelegasi → Bana</span>
        if (status === "FOLLOWED_UP") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">Di-Follow Up</span>
        if (status === "CONVERTED") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Converted ✓</span>
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{status}</span>
    }

    const roleLabel = (role: string) => {
        if (role === "METHODOLOGY") return "Tony"
        if (role === "DEVELOPER") return "Reza"
        if (role === "OPERATIONS") return "Bana"
        return role
    }

    const newCount = localLeads.filter(l => l.status === "NEW").length

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 lg:p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm lg:text-base">Kolam Prospek (Lead Pool)</h3>
                        <p className="text-xs text-gray-500">Input dari tim lapangan — delegasikan ke Bana untuk di-follow up</p>
                    </div>
                </div>
                {newCount > 0 && (
                    <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">{newCount} Baru</span>
                )}
            </div>

            {localLeads.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                    <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Belum ada lead masuk dari tim. Minta Tony/Reza/Bana input via menu Radar Prospek.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Calon User</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No. WA</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Diinput Oleh</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {localLeads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900 text-sm">{lead.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-gray-700 font-mono">{lead.phone}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                {lead.source.name.charAt(0)}
                                            </span>
                                            {roleLabel(lead.source.role)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {statusBadge(lead.status)}
                                        {msg.id === lead.id && (
                                            <p className={`text-[10px] mt-1 font-semibold ${msg.type === "error" ? "text-red-500" : "text-emerald-600"}`}>{msg.text}</p>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {lead.status === "NEW" ? (
                                            <button
                                                onClick={() => handleDelegate(lead.id, lead.name)}
                                                disabled={loadingId === lead.id}
                                                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                                {loadingId === lead.id ? "Memproses..." : "Delegasi → Bana"}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sudah didelegasi</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
