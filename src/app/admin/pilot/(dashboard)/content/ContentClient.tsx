"use client"
import { useState } from "react"
import { sendNotification, createFeed, updateFeed, deleteFeed, toggleFeedStatus } from "@/actions/superAdminActions"

export default function ContentClient({ notifications, feeds }: { notifications: any[], feeds: any[] }) {
    const [isSending, setIsSending] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingFeed, setEditingFeed] = useState<any>(null);

    const handleSendNotif = async (e: any) => {
        e.preventDefault();
        setIsSending(true);
        const fd = new FormData(e.target);
        await sendNotification(fd);
        setIsSending(false);
        e.target.reset();
        alert("Notifikasi Terkirim!");
    }

    const handleSaveFeed = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);
        const fd = new FormData(e.target);
        if (editingFeed) {
            await updateFeed(editingFeed.id, fd);
            alert("Banner berhasil diperbarui!");
        } else {
            await createFeed(fd);
            alert("Banner berhasil dipublish!");
        }
        setIsSaving(false);
        setEditingFeed(null);
        e.target.reset();
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NOTIFICATION MANAGER */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        In-App Notification
                    </h3>
                    <form onSubmit={handleSendNotif} className="space-y-4">
                        <input type="text" name="title" required placeholder="Judul Notifikasi" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        <textarea name="message" required placeholder="Isi pesan (mendukung promo atau pembaruan sistem)..." className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        <input type="url" name="ctaUrl" placeholder="URL Link (Opsional)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        <select name="segment" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                            <option value="ALL">Kirim ke: Semua Pengguna</option>
                            <option value="STARTER_ONLY">Kirim ke: Starter (Gratis) Saja</option>
                            <option value="PRO_BULANAN">Kirim ke: Pro Bulanan Saja</option>
                            <option value="PRO_TAHUNAN">Kirim ke: Pro Tahunan Saja</option>
                            <option value="LIFETIME">Kirim ke: Lifetime Saja</option>
                            <option value="VIP_ONLY">Kirim ke: Pro Tahunan + Lifetime</option>
                            <option value="PAID_ONLY">Kirim ke: Semua Berbayar</option>
                        </select>
                        <button type="submit" disabled={isSending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                            {isSending ? "Mengirim..." : "Kirim Notifikasi"}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Riwayat Notifikasi</p>
                    <div className="space-y-2">
                        {notifications.map((n: any) => (
                            <div key={n.id} className="p-3 bg-gray-50 rounded-lg text-xs">
                                <p className="font-bold text-gray-900">{n.title}</p>
                                <p className="text-gray-500 truncate">{n.message}</p>
                                <p className="text-[10px] text-blue-500 font-bold mt-1">To: {n.segment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BANNER / FEED MANAGER */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Banner & Feed Premium
                        </h3>
                        {editingFeed && (
                            <button onClick={() => setEditingFeed(null)} className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded">
                                Batal Edit
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSaveFeed} className="space-y-4">
                        <input type="text" name="title" defaultValue={editingFeed?.title || ""} required placeholder="Judul Banner/Info" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                        <textarea name="content" defaultValue={editingFeed?.content || ""} placeholder="Isi Konten Banner (Teks / HTML Lengkap)" className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Upload Gambar (Otomatis ke Cloudinary)</label>
                                <input type="file" name="imageFile" accept="image/*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Atau Gunakan URL Gambar Eksisting</label>
                                <input type="url" name="imageUrl" defaultValue={editingFeed?.imageUrl || ""} placeholder="URL Image (Opsional jika sudah upload)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>

                        <input type="url" name="ctaUrl" defaultValue={editingFeed?.ctaUrl || ""} placeholder="CTA Link URL (Tujuan Klik)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                        
                        <select name="audience" defaultValue={editingFeed?.audience || "ALL"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-semibold">
                            <option value="ALL">Tampilkan Untuk: Semua Pengguna</option>
                            <option value="FREE_ONLY">Tampilkan Untuk: Free Member Saja</option>
                            <option value="VIP_ONLY">Tampilkan Untuk: VIP Member Saja</option>
                        </select>
                        <button type="submit" disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                            {isSaving ? (editingFeed ? "Menyimpan Perubahan..." : "Mengunggah...") : (editingFeed ? "Simpan Perubahan Banner" : "Publish Banner Baru")}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Daftar Banner Aktif</p>
                    <div className="space-y-3">
                        {feeds.map((f: any) => (
                            <div key={f.id} className="p-3 border border-gray-100 rounded-lg flex flex-col sm:flex-row gap-3 sm:items-center">
                                {f.imageUrl && <img src={f.imageUrl} className="w-full sm:w-20 h-16 object-cover rounded shadow-sm" alt="" />}
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-900">{f.title}</p>
                                    <p className="text-[10px] text-gray-500">Target: {f.audience === 'VIP_ONLY' ? 'VIP' : f.audience === 'FREE_ONLY' ? 'FREE' : 'ALL'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <button 
                                        onClick={() => toggleFeedStatus(f.id, f.status)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${f.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {f.status === 'PUBLISHED' ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                    <button onClick={() => {
                                        setEditingFeed(f);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                        Edit
                                    </button>
                                    <button onClick={async () => {
                                        if (confirm("Yakin ingin menghapus banner ini permanen?")) {
                                            await deleteFeed(f.id);
                                        }
                                    }} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
