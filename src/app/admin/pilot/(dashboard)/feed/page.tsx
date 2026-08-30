import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const feeds = await prisma.ubosFeedContent.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function createFeed(formData: FormData) {
    "use server";
    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();
    
    if (title && content) {
      await prisma.ubosFeedContent.create({
        data: {
          title,
          content,
          author: "Logaritma Team",
          category: "TIPS"
        }
      });
      revalidatePath("/admin/pilot/feed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/pilot/menu" className="text-indigo-600 text-sm font-bold mb-6 inline-block md:hidden">&larr; Kembali</Link>
        <h1 className="text-3xl font-black text-gray-900 mb-6">Konten Feed Premium</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Buat Wawasan Bisnis Baru</h3>
          <form action={createFeed} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Judul Feed (Singkat)</label>
              <input type="text" name="title" required placeholder="Contoh: Cara Menaikkan AOV" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Isi Konten (Insight / Tips)</label>
              <textarea name="content" required rows={3} placeholder="Tulis wawasan premium di sini..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"></textarea>
            </div>
            <button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors">Posting Feed</button>
          </form>
        </div>

        <h3 className="text-sm font-bold text-gray-800 mb-4">Riwayat Feed Terbit</h3>
        <div className="space-y-4">
          {feeds.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Belum ada feed premium yang diterbitkan.</p>
          ) : (
            feeds.map((f) => (
              <div key={f.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-gray-900">{f.title}</h4>
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{f.category}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{f.content}</p>
                <p className="text-[10px] text-gray-400 font-medium">{new Date(f.createdAt).toLocaleDateString('id-ID')} • Oleh {f.author}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}