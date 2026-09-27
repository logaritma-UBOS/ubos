"use client"
import { toggleTeamTask, createTeamTask } from "@/actions/crmActions"
import { useState } from "react"

export default function ChecklistHarian({ teamMemberId, tasks }: { teamMemberId: string, tasks: any[] }) {
    const [newTask, setNewTask] = useState("");

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleTeamTask(id, !currentStatus);
    }

    const handleAdd = async (e: any) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        await createTeamTask(teamMemberId, newTask);
        setNewTask("");
    }

    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;

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
                {tasks.map(t => (
                    <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${t.isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                        <input type="checkbox" checked={t.isCompleted} onChange={() => handleToggle(t.id, t.isCompleted)} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0" />
                        <span className={`text-sm font-medium ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.taskName}</span>
                    </label>
                ))}
                {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">Keren! Semua checklist hari ini sudah selesai.</p>}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Ketik tugas baru hari ini..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md active:scale-95 shrink-0">Tambah</button>
            </form>
        </div>
    )
}
