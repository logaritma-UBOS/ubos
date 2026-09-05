import Link from "next/link"
import Image from "next/image"
import ExpandableText from "./ExpandableText"

async function fetchOGImage(url: string) {
  if (!url) return null;
  try {
    const res = await fetch('https://api.microlink.io/?url=' + encodeURIComponent(url), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.image?.url || data?.data?.logo?.url || null;
  } catch (e) {
    return null;
  }
}

export default async function SosmedFeedList({ initialData }: { initialData: any[] }) {
  const getPlatformColor = (ch: string) => {
    if (ch === "INSTAGRAM") return "bg-pink-100 text-pink-700 border-pink-200"
    if (ch === "TIKTOK") return "bg-black text-white border-black"
    if (ch === "FACEBOOK") return "bg-blue-100 text-blue-700 border-blue-200"
    if (ch === "WHATSAPP") return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (ch === "THREADS") return "bg-neutral-800 text-white border-neutral-900"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  const items = await Promise.all(
    initialData.map(async (item) => {
      let ogImage = null;
      if (item.postUrl) {
        ogImage = await fetchOGImage(item.postUrl);
      }
      return { ...item, ogImage };
    })
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          Belum ada postingan yang selesai.
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            
            {/* Header: Author & Platform */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-sm">
                  {(item.author || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.author || "Unknown"}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {new Date(item.startAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider ${getPlatformColor(item.channel)}`}>
                {item.channel}
              </span>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1">
              <h3 className="font-black text-lg text-slate-900 mb-3">{item.name}</h3>
              <ExpandableText text={item.message} />
              
              {/* Link Preview (Thumbnail) */}
              {item.postUrl && item.ogImage && (
                <a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="block mt-4 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity bg-slate-100">
                  <div className="relative w-full aspect-[1.91/1] bg-slate-200 flex items-center justify-center text-slate-400">
                    {/* Menggunakan img standar agar url external apapun bisa jalan tanpa mendaftarkan ke next.config */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.ogImage} alt="Link Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 truncate">{new URL(item.postUrl).hostname}</div>
                  </div>
                </a>
              )}
              
              {item.postUrl && !item.ogImage && (
                <a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Buka Link Postingan
                </a>
              )}
            </div>
            
          </div>
        ))
      )}
    </div>
  )
}
