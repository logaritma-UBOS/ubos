import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const feedbacks = await prisma.pilotFeedback.findMany({
    include: { business: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/pilot/menu" className="text-amber-600 text-sm font-bold mb-6 inline-block md:hidden">&larr; Kembali</Link>
        <h1 className="text-3xl font-black text-gray-900 mb-6">Masukan / Saran User</h1>
        
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 text-sm italic">Belum ada masukan dari user.</p>
            </div>
          ) : (
            feedbacks.map((f) => (
              <div key={f.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                      f.category === 'BUG' ? 'bg-red-100 text-red-600' : 
                      f.category === 'FEATURE' ? 'bg-blue-100 text-blue-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {f.category}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Dari: {f.business?.name || "Unknown"} • {new Date(f.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed">{f.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}