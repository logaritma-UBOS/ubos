"use client"
import { useState } from "react"
import { bulkAddCustomers } from "@/actions/customerImport"
import { useRouter } from "next/navigation"

export default function ImportContactsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.trim()) return alert("Data tidak boleh kosong")
    
    setIsSubmitting(true)
    try {
      const res = await bulkAddCustomers(data)
      if (res.error) {
        alert(res.error)
      } else {
        alert("Berhasil mengimpor " + res.added + " kontak pelanggan baru! (" + res.skipped + " dilewati karena format salah atau duplikat)")
        setIsOpen(false)
        setData("")
        router.refresh()
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan")
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold rounded-lg text-sm transition-colors shadow-sm ml-2">
        + Import Massal
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Import Pelanggan Massal</h3>
            <p className="text-xs text-gray-500 mb-4">Copy dan Paste (tempel) daftar kontak pelanggan Anda dari Excel atau WhatsApp ke kotak di bawah ini. Format yang didukung: <strong>Nama, Nomor WA</strong> (atau hanya nomor WA saja per baris).</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea 
                  value={data} 
                  onChange={e => setData(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="Budi, 08123456789&#10;Siti, 085175150408&#10;081999888777"
                  rows={8}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm disabled:opacity-50">
                  {isSubmitting ? "Memproses..." : "Import Kontak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
