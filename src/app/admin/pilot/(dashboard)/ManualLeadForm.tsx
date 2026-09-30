"use client";
import { useState } from "react";
import { addManualLead } from "@/actions/manualLead";

export default function ManualLeadForm() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        const res = await addManualLead(name, phone);
        if (res?.error) {
            setMsg({ text: res.error, type: "error" });
        } else {
            setMsg({ text: "Lead berhasil ditambahkan!", type: "success" });
            setName("");
            setPhone("");
        }
        setLoading(false);
        setTimeout(() => setMsg({ text: "", type: "" }), 5000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-3 items-center mb-6 shadow-sm relative">
            <div className="flex-1 w-full relative">
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Nama Lead..." className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500" />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="flex-1 w-full relative">
                <input required type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Nomor WhatsApp (Contoh: 0812...)" className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500" />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <button disabled={loading} type="submit" className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
                {loading ? "Menyimpan..." : "+ Input Database WA"}
            </button>
            {msg.text && (
                <p className={`text-xs absolute -bottom-5 right-4 font-bold ${msg.type==="error"?"text-red-500":"text-emerald-500"}`}>{msg.text}</p>
            )}
        </form>
    );
}

