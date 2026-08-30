import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RelationshipPage() {
  const revenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID" },
    orderBy: { createdAt: 'desc' }
  });

  // Ambil data user dari revenue
  const userIds = revenues.map(r => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { businesses: { take: 1 } }
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/pilot" className="text-purple-600 text-sm font-bold mb-6 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-black text-gray-900 mb-6">Customer Relationship (VIP)</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Daftar Pelanggan Premium</h3>
            <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-lg">{revenues.length} Transaksi</span>
          </div>
          {revenues.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Belum ada pelanggan VIP.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">User VIP</th>
                    <th className="px-4 py-3 font-semibold">Nominal Pembayaran</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {revenues.map((r, i) => {
                    const u = userMap.get(r.userId);
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-800">{u?.name || "Tanpa Nama"}</p>
                          <p className="text-xs text-gray-500">{u?.email || r.userId}</p>
                          {u?.businesses[0] && <p className="text-[10px] bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{u.businesses[0].name}</p>}
                        </td>
                        <td className="px-4 py-3 font-black text-purple-600">
                          {formatRupiah(r.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}