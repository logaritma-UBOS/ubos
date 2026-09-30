
"use client"

import { useState } from "react"
import { createIdea } from "@/actions/teamOs"

export default function IdeaRepositoryClient({ ideas, readOnly = false }: { ideas: any[], readOnly?: boolean }) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError("")
    
    const fd = new FormData()
    fd.append("content", content)
    
    const res = await createIdea(fd)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setContent("")
      alert("Formula/Studi Kasus berhasil disimpan ke Repository!")
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-slate-50">
        <h3 className="font-black text-gray-900 text-lg flex items-center gap-2 mb-1">
          <span className="text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </span>
          Repository Studi Kasus & Formula Engine
        </h3>
        <p className="text-sm text-gray-500">
          Bank logika, riset UMKM, dan formula baku yang siap ditarik oleh tim Developer (Reza) dan Marketing (Baim).
        </p>
      </div>

      <div className="p-6 space-y-6">
        {!readOnly && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{error}</div>}
          <textarea
            required
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Ketik studi kasus atau logika sistem baru di sini..."
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-xl transition-all disabled:opacity-50 text-sm flex items-center gap-2"
            >
              {loading ? "Menyimpan..." : "Simpan ke Repository"}
            </button>
          </div>
        </form>
      )}

        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Galeri Formula Terbaru</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-gray-50 border border-gray-200 p-4 rounded-xl relative group">
                <span className="absolute -top-2 -right-2 bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-200 shadow-sm">
                  {new Date(idea.createdAt).toLocaleDateString("id-ID")}
                </span>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">OLEH: {idea.author?.name || "Tony"}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.content}</p>
              </div>
            ))}
            {ideas.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Belum ada formula atau studi kasus yang diunggah.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

