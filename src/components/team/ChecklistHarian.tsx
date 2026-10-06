"use client"
import { toggleTeamTask, createTeamTask } from "@/actions/crmActions"
import { useState, useOptimistic, useTransition } from "react"
import { sendWaBana } from "@/actions/teamOs"

export default function ChecklistHarian({ teamMemberId, tasks, users }: { teamMemberId: string, tasks: any[], users?: any[] }) {
    const [newTask, setNewTask] = useState("");
    const [loadingWa, setLoadingWa] = useState<string | null>(null);

    const [optimisticTasks, toggleOptimisticTask] = useOptimistic(
        tasks,
        (state: any[], taskId: string) => state.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
    );

    const [isPending, startTransition] = useTransition();

    const handleToggle = (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            toggleOptimisticTask(id);
            await toggleTeamTask(id, !currentStatus);
        });
    }

    const handleAdd = async (e: any) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        await createTeamTask(teamMemberId, newTask);
        setNewTask("");
    }

    // Follow-up untuk USER LAMA (sudah terdaftar di UBOS)
    const handleFollowUpFonnte = async (user: any) => {
        if (!user.phone) return alert("User tidak memiliki nomor WA");
        
        let autoMsg = `Halo kak ${user.name || "Pebisnis"},`;
        
        const daysSinceLogin = user.lastLogin ? (new Date().getTime() - new Date(user.lastLogin).getTime()) / (1000 * 3600 * 24) : 999;
        let computedStatus = "PASIF";
        if (daysSinceLogin <= 7) computedStatus = "AKTIF";
        if (!user.lastLogin && (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24) <= 1) computedStatus = "NEW";
        
        if (computedStatus === "PASIF") {
            autoMsg += ` kami dari UBOS melihat kakak sudah lebih dari seminggu tidak login ke sistem. Apakah ada kendala atau butuh bantuan kami?`;
        } else if (computedStatus === "NEW") {
            autoMsg += ` selamat datang di UBOS! Kami siap mendampingi kakak membangun ekosistem bisnis digital.`;
        } else {
            autoMsg += ` semoga harinya menyenangkan! Kami lihat kakak sangat aktif menggunakan UBOS. Jika butuh upgrade atau bantuan, kabari kami ya.`;
        }

        if (!confirm(`Kirim pesan via Fonnte (089662345427)?\n\nPesan:\n${autoMsg}`)) return;

        setLoadingWa(user.id);
        const res = await sendWaBana(user.phone, autoMsg);
        setLoadingWa(null);

        if (res?.error) alert(res.error);
        else alert("Berhasil di-Follow Up via Fonnte!");
    }

    // Follow-up untuk CALON USER (prospek baru, belum terdaftar)
    const handleFollowUpCalonUser = async (taskId: string, name: string, phone: string) => {
        const autoMsg = `Halo kak ${name}! 👋\n\nPerkenalkan, saya dari tim UBOS (Usaha Bisnis Online System) — platform digital yang membantu pemilik usaha mengelola penjualan, stok, dan laporan keuangan dalam satu sistem.\n\nKami mendapat rekomendasi bahwa kakak sedang mengelola usaha dan mungkin butuh sistem yang lebih rapi.\n\nApakah kakak ada 5 menit untuk kami tunjukkan bagaimana UBOS bisa membantu bisnis kakak berkembang lebih cepat? 🚀\n\nGratis coba 14 hari, tanpa kartu kredit.`;
        
        if (!confirm(`Kirim penawaran UBOS ke ${name} via Fonnte?\n\nNo WA: ${phone}\n\nPesan:\n${autoMsg}`)) return;

        setLoadingWa(taskId);
        const res = await sendWaBana(phone, autoMsg);
        setLoadingWa(null);

        if (res?.error) alert(res.error);
        else alert(`Berhasil kirim penawaran UBOS ke ${name} via Fonnte!`);
    }

    const completed = optimisticTasks.filter(t => t.isCompleted).length;
    const total = optimisticTasks.length;

    return (
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm lg:text-base">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    Checklist Harian
                </h3>
                <span className="text-[10px] lg:text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full uppercase tracking-wider">{completed} / {total} Selesai</span>
            </div>
            
            <div className="space-y-2 mb-4">
                {optimisticTasks.map(t => {
                    // Deteksi jenis tugas
                    const isFollowUpUser = users && t.taskName.startsWith("Follow up user: ");
                    const isFollowUpCalonUser = t.taskName.startsWith("Follow up CALON USER: ");
                    
                    let matchedUser = null;
                    let calonUserData: { name: string; phone: string } | null = null;

                    // Cari user lama dari database
                    if (isFollowUpUser && users) {
                        const rawName = t.taskName.replace("Follow up user: ", "");
                        const nameOrEmail = rawName.trim().toLowerCase();
                        matchedUser = users.find(u => {
                            if (!u) return false;
                            const uName = (u.name || "").trim().toLowerCase();
                            const uEmail = (u.email || "").trim().toLowerCase();
                            return uName === nameOrEmail || uEmail === nameOrEmail || rawName === u.name || rawName === u.email;
                        });
                    }

                    // Ekstrak data calon user dari nama tugas
                    if (isFollowUpCalonUser) {
                        const raw = t.taskName.replace("Follow up CALON USER: ", "");
                        // Format: "Nama | 0812xxx" atau hanya "Nama"
                        const parts = raw.split(" | ");
                        calonUserData = {
                            name: parts[0]?.trim() || raw,
                            phone: parts[1]?.trim() || t.phone || ""
                        };
                    }
                    
                    return (
                        <div key={t.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${t.isCompleted ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}>
                            <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                <input type="checkbox" checked={t.isCompleted} onChange={() => handleToggle(t.id, t.isCompleted)} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0" />
                                <div className="min-w-0">
                                    <span className={`text-sm font-medium block ${t.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.taskName}</span>
                                    {/* Label khusus untuk CALON USER */}
                                    {isFollowUpCalonUser && !t.isCompleted && (
                                        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" /></svg>
                                            Calon User — Belum Terdaftar UBOS
                                        </span>
                                    )}
                                </div>
                            </label>
                            
                            {/* Tombol WA untuk USER LAMA */}
                            {matchedUser && (
                                <button 
                                    onClick={() => handleFollowUpFonnte(matchedUser)}
                                    disabled={loadingWa === matchedUser.id || !matchedUser.phone}
                                    className="ml-3 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1 shrink-0"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.898-9.898 0-5.45-4.449-9.898-9.896-9.898-5.45 0-9.898 4.448-9.898 9.898 0 1.956.49 3.633 1.517 5.205l1.011 1.536-1.127 4.12 4.225-1.11.98.555zm11.751-6.195c-.482-1.206-2.42-1.875-3.08-1.875-.662 0-1.066.86-1.166 1.002-.1.14-.144.382-.424.524-.282.14-1.258.463-2.408-.56-.893-.794-1.498-1.77-1.673-2.072-.175-.3-.021-.462.115-.595.127-.123.275-.316.415-.472.138-.158.183-.267.275-.444.092-.178.046-.334-.022-.475-.068-.142-.614-1.478-.84-2.023-.222-.533-.448-.46-.614-.468-.157-.008-.337-.01-.518-.01-.183 0-.48.067-.732.34-.25.27-1.218 1.192-1.218 2.906 0 1.713 1.25 3.37 1.42 3.593.172.223 2.453 3.743 5.94 5.2 3.488 1.458 3.488.971 4.103.902.615-.069 1.98-.808 2.259-1.588.278-.779.278-1.448.194-1.588z"/></svg>
                                    {loadingWa === matchedUser.id ? "..." : "WA Fonnte"}
                                </button>
                            )}

                            {/* Tombol WA untuk CALON USER */}
                            {isFollowUpCalonUser && calonUserData && !t.isCompleted && (
                                <button 
                                    onClick={() => handleFollowUpCalonUser(t.id, calonUserData!.name, calonUserData!.phone)}
                                    disabled={loadingWa === t.id || !calonUserData.phone}
                                    className="ml-3 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1 shrink-0"
                                    title={calonUserData.phone ? `Tawarkan UBOS ke ${calonUserData.name}` : "Nomor WA tidak tersedia"}
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.898-9.898 0-5.45-4.449-9.898-9.896-9.898-5.45 0-9.898 4.448-9.898 9.898 0 1.956.49 3.633 1.517 5.205l1.011 1.536-1.127 4.12 4.225-1.11.98.555zm11.751-6.195c-.482-1.206-2.42-1.875-3.08-1.875-.662 0-1.066.86-1.166 1.002-.1.14-.144.382-.424.524-.282.14-1.258.463-2.408-.56-.893-.794-1.498-1.77-1.673-2.072-.175-.3-.021-.462.115-.595.127-.123.275-.316.415-.472.138-.158.183-.267.275-.444.092-.178.046-.334-.022-.475-.068-.142-.614-1.478-.84-2.023-.222-.533-.448-.46-.614-.468-.157-.008-.337-.01-.518-.01-.183 0-.48.067-.732.34-.25.27-1.218 1.192-1.218 2.906 0 1.713 1.25 3.37 1.42 3.593.172.223 2.453 3.743 5.94 5.2 3.488 1.458 3.488.971 4.103.902.615-.069 1.98-.808 2.259-1.588.278-.779.278-1.448.194-1.588z"/></svg>
                                    {loadingWa === t.id ? "..." : "Tawarkan UBOS"}
                                </button>
                            )}
                        </div>
                    );
                })}
                {optimisticTasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">Keren! Semua checklist hari ini sudah selesai.</p>}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Ketik tugas baru hari ini..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md active:scale-95 shrink-0">Tambah</button>
            </form>
        </div>
    )
}

