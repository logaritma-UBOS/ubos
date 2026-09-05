"use client"

import { useState } from "react"
import { createSosmedPlan, deleteSosmedPlan, editSosmedPlan } from "@/actions/marketing"
import { useRouter } from "next/navigation"

export default function SosmedClient({ initialData }: { initialData: any[] }) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [channel, setChannel] = useState("INSTAGRAM")
  const [postDate, setPostDate] = useState("")
  const [status, setStatus] = useState("DRAFT")
  const [driveUrl, setDriveUrl] = useState("")
  const [postUrl, setPostUrl] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<any>(null)
  
  const router = useRouter()

  const handleCreateOrUpdate = async () => {
    if (!name || !message || !postDate) return alert("Judul, Caption, dan Tanggal wajib diisi")
    setIsLoading(true)
    
    const payload = {
      name, 
      channel, 
      message, 
      startAt: new Date(postDate),
      status,
      driveUrl: status === 'SIAP_UPLOAD' ? driveUrl : undefined,
      postUrl: status === 'SELESAI' ? postUrl : undefined,
    }

    let res;
    if (editingId) {
      res = await editSosmedPlan(editingId, payload)
      if (!res?.error) setEditingId(null)
    } else {
      res = await createSosmedPlan(payload)
    }
    
    if (res?.error) {
      alert("Gagal menyimpan: " + res.error)
      setIsLoading(false)
      return
    }

    resetForm()
    setIsLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus rencana postingan ini?")) return
    setIsLoading(true)
    await deleteSosmedPlan(id)
    setIsLoading(false)
    router.refresh()
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setName(item.name)
    setMessage(item.message)
    setChannel(item.channel)
    setStatus(item.status || "DRAFT")
    setDriveUrl(item.driveUrl || "")
    setPostUrl(item.postUrl || "")
    
    if (item.startAt) {
      const dateObj = new Date(item.startAt)
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 16);
      setPostDate(localISOTime)
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setMessage("")
    setPostDate("")
    setStatus("DRAFT")
    setDriveUrl("")
    setPostUrl("")
  }

  const getPlatformColor = (ch: string) => {
    if (ch === "INSTAGRAM") return "bg-pink-100 text-pink-700 border-pink-200"
    if (ch === "TIKTOK") return "bg-black text-white border-black"
    if (ch === "FACEBOOK") return "bg-blue-100 text-blue-700 border-blue-200"
    if (ch === "WHATSAPP") return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (ch === "THREADS") return "bg-neutral-800 text-white border-neutral-900"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  const getStatusBadge = (st: string) => {
    if (st === "SELESAI") return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-emerald-200">Selesai</span>
    if (st === "SIAP_UPLOAD") return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-amber-200">Siap Upload</span>
    return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-slate-200">Draft</span>
  }

  return (
    <div className="space-y-6 mt-12 border-t border-slate-200 pt-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">KALENDER SOSIAL MEDIA</h1>
        <p className="text-slate-500">Perencanaan konten publikasi sosial media untuk UBOS.</p>
      </div>

      <div className={`p-8 rounded-2xl shadow-sm border transition-colors ${editingId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
          <span>{editingId ? "Edit Jadwal Posting" : "Buat Jadwal Posting Baru"}</span>
          {editingId && (
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full uppercase tracking-widest font-bold">Mode Edit</span>
          )}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Platform</label>
              <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500">
                <option value="INSTAGRAM">Instagram</option>
                <option value="TIKTOK">TikTok</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="THREADS">Threads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tanggal & Waktu</label>
              <input type="datetime-local" value={postDate} onChange={e => setPostDate(e.target.value)} className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status Konten</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500">
                <option value="DRAFT">Draft</option>
                <option value="SIAP_UPLOAD">Siap Upload</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
          </div>
          
          {status === 'SIAP_UPLOAD' && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <label className="block text-sm font-semibold text-amber-900 mb-1">Link Google Drive (Aset Konten)</label>
              <input value={driveUrl} onChange={e => setDriveUrl(e.target.value)} placeholder="https://drive.google.com/..." className="w-full p-2 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          )}

          {status === 'SELESAI' && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <label className="block text-sm font-semibold text-emerald-900 mb-1">Link URL Postingan (IG/TikTok/FB)</label>
              <input value={postUrl} onChange={e => setPostUrl(e.target.value)} placeholder="https://instagram.com/p/..." className="w-full p-2 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">Judul / Topik Postingan</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Carousel Tips AOV..." className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Caption / Teks Konten</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 border rounded-xl min-h-[100px] outline-none focus:ring-2 focus:ring-violet-500" placeholder="Isi caption di sini..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreateOrUpdate} disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">
              {isLoading ? "Menyimpan..." : editingId ? "Perbarui Kalender" : "Tambahkan ke Kalender"}
            </button>
            {editingId && (
              <button onClick={resetForm} disabled={isLoading} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-6 rounded-xl transition-colors">
                Batal Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-transparent">
        <h2 className="text-xl font-bold mb-4 px-1">Papan Kanban (Upcoming)</h2>
        {initialData.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500">Belum ada jadwal postingan.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 items-start snap-x snap-mandatory">
            {[
              { id: 'DRAFT', title: 'DRAFT', bg: 'bg-slate-100/50', border: 'border-slate-200', titleColor: 'text-slate-700' },
              { id: 'SIAP_UPLOAD', title: 'SIAP UPLOAD', bg: 'bg-amber-100/50', border: 'border-amber-200', titleColor: 'text-amber-800' },
              { id: 'SELESAI', title: 'SELESAI', bg: 'bg-emerald-100/50', border: 'border-emerald-200', titleColor: 'text-emerald-800' }
            ].map(col => {
              const colItems = initialData.filter(item => (item.status || 'DRAFT') === col.id);
              return (
                <div key={col.id} className={`flex-shrink-0 w-80 md:w-[32%] snap-start rounded-2xl border ${col.border} ${col.bg} p-3 flex flex-col max-h-[800px]`}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className={`font-black ${col.titleColor}`}>{col.title}</h3>
                    <span className="bg-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{colItems.length}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-1">
                    {colItems.map((item, i) => {
                      const dateObj = new Date(item.startAt)
                      const dateStr = dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      return (
                        <div 
                          key={i} 
                          onClick={() => setActiveItem(item)}
                          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${getPlatformColor(item.channel)}`}>
                              {item.channel}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{dateStr}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">{item.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.message}</p>
                          
                          <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-2">
                            <select 
                              onClick={e => e.stopPropagation()} 
                              onChange={async (e) => {
                                e.stopPropagation();
                                setIsLoading(true);
                                await editSosmedPlan(item.id, { status: e.target.value });
                                setIsLoading(false);
                                router.refresh();
                              }}
                              value={item.status || 'DRAFT'}
                              disabled={isLoading}
                              className="text-[10px] font-bold outline-none border border-slate-200 rounded p-1 cursor-pointer hover:bg-slate-50"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="SIAP_UPLOAD">Siap Upload</option>
                              <option value="SELESAI">Selesai</option>
                            </select>
                            
                            {item.author && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 truncate max-w-[80px]">
                                {item.author}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {colItems.length === 0 && (
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
                        Tidak ada konten
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Item */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200" onClick={() => setActiveItem(null)}>
          <div 
            className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${getPlatformColor(activeItem.channel)}`}>
                  {activeItem.channel}
                </span>
                {getStatusBadge(activeItem.status || 'DRAFT')}
              </div>
              <button onClick={() => setActiveItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 mb-2">{activeItem.name}</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6">
                <span>🗓️ {new Date(activeItem.startAt).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {activeItem.author && <span>👤 {activeItem.author}</span>}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-slate-700">Ubah Status:</span>
                <select 
                  onChange={async (e) => {
                    setIsLoading(true);
                    await editSosmedPlan(activeItem.id, { status: e.target.value });
                    setActiveItem({ ...activeItem, status: e.target.value });
                    setIsLoading(false);
                    router.refresh();
                  }}
                  value={activeItem.status || 'DRAFT'}
                  disabled={isLoading}
                  className="text-xs font-bold outline-none border-2 border-violet-200 rounded-lg p-2 bg-violet-50 text-violet-800 cursor-pointer hover:bg-violet-100 flex-1"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SIAP_UPLOAD">SIAP UPLOAD</option>
                  <option value="SELESAI">SELESAI</option>
                </select>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 whitespace-pre-wrap text-sm text-slate-700">
                {activeItem.message}
              </div>

              {activeItem.status === 'SIAP_UPLOAD' && activeItem.driveUrl && (
                <div className="mb-4">
                  <a href={activeItem.driveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 p-3 rounded-xl transition-colors">
                    📁 Buka Aset di Google Drive
                  </a>
                </div>
              )}

              {activeItem.status === 'SELESAI' && activeItem.postUrl && (
                <div className="mb-4">
                  <a href={activeItem.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 p-3 rounded-xl transition-colors">
                    🔗 Buka Postingan Live
                  </a>
                </div>
              )}
              
              <div className="mt-6 border-t border-slate-200 pt-4 flex gap-3">
                <button 
                  onClick={() => {
                    handleEdit(activeItem);
                    setActiveItem(null);
                  }}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold py-2 rounded-xl transition-colors"
                >
                  Edit Item
                </button>
                <button 
                  onClick={() => {
                    handleDelete(activeItem.id);
                    setActiveItem(null);
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2 rounded-xl transition-colors"
                >
                  Hapus Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
