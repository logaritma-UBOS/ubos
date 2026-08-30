import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function KonversiPage() {
  const users = await prisma.user.findMany({
    include: {
      businesses: { take: 1 }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const revenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID" }
  });

  const premiumUserIds = new Set(revenues.map(r => r.userId));
  
  const freeUsers = users.filter(u => !premiumUserIds.has(u.id));
  const conversionRate = users.length > 0 ? (premiumUserIds.size / users.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/pilot" className="text-emerald-600 text-sm font-bold mb-6 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-black text-gray-900 mb-6">Optimasi Konversi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Konversi</h3>
            <p className="text-4xl font-black text-emerald-600">{premiumUserIds.size}</p>
            <p className="text-xs text-gray-500 mt-2">User yang telah menjadi VIP</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Conversion Rate</h3>
            <p className="text-4xl font-black text-blue-600">{conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">Dari total {users.length} user terdaftar</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Target Prospek (User Gratis)</h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{freeUsers.length} User</span>
          </div>
          {freeUsers.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Semua user sudah premium!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Nama / Email</th>
                    <th className="px-4 py-3 font-semibold">Bisnis</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {freeUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{u.name || "Tanpa Nama"}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-600">
                        {u.businesses[0]?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}