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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                    Checklist Harian Saya
                </h3>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{completed} / {total} Selesai</span>
            </div>
            
            <div className="space-y-2 mb-4">
                {tasks.map(t => (
                    <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${t.isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                        <input type="checkbox" checked={t.isCompleted} onChange={() => handleToggle(t.id, t.isCompleted)} className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer" />
                        <span className={`text-sm font-medium ${t.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.taskName}</span>
                    </label>
                ))}
                {tasks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada tugas hari ini.</p>}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Tambah target hari ini..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">Tambah</button>
            </form>
        </div>
    )
}
