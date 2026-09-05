import { getTeamAnalytics } from "@/actions/pilotAnalytics";
import Link from "next/link";

export const dynamic = "force-dynamic";

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari yang lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam yang lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit yang lalu";
  return Math.floor(seconds) + " detik yang lalu";
}

export default async function PerformaTimPage() {
  const data = await getTeamAnalytics();

  const totalLoginMonth = data.teamMembers.reduce((acc, m) => acc + m.loginMonth, 0);
  const totalActionMonth = data.teamMembers.reduce((acc, m) => acc + m.actionMonth, 0);

  // Cari top performer berdasarkan aktifitas bulan ini
  const topPerformer = [...data.teamMembers].sort((a, b) => b.actionMonth - a.actionMonth)[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-6 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/admin/pilot" className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 mb-2 transition-colors">
              &larr; Kembali ke Dasbor
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performa Tim Internal</h1>
            <p className="text-slate-500 text-sm mt-1">
              Pantau produktivitas dan kontribusi harian dari tim pusat Logaritma.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100 shadow-sm">
                Bulan Ini
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 space-y-8">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-blue-600"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.19 12l-1.47-1.47a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-3.28 4.72a.75.75 0 001.06-1.06l-4.5-4.5a.75.75 0 00-1.06 0l-4.5 4.5a.75.75 0 101.06 1.06L11.25 12.81l2.72 2.72z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Aktivitas (Bulan)</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-slate-900">{totalActionMonth}</h2>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Log tercatat</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-purple-600"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Login (Bulan)</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-slate-900">{totalLoginMonth}</h2>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Sesi akses</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 shadow-md relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-amber-400"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Top Performer</p>
            <h2 className="text-2xl font-black mt-2">{topPerformer?.name?.split(' ')[0] || "Belum Ada"}</h2>
            <p className="text-sm text-blue-100 font-medium mt-1">Kontribusi Terbesar Bulan Ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: TABLE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-lg text-slate-800">Tabel Kinerja & Produktivitas</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Anggota Tim</th>
                      <th className="px-6 py-4 text-center">Tingkat Aktivitas (H | M | B)</th>
                      <th className="px-6 py-4 text-center">Login (H | M | B)</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black shadow-sm">
                              {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.name || "Anonim"}</p>
                              <p className="text-xs font-medium text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 shadow-inner">
                            <span className="w-8 h-8 flex items-center justify-center bg-white text-blue-700 font-bold rounded shadow-sm">{member.actionDay}</span>
                            <span className="w-8 h-8 flex items-center justify-center bg-white text-indigo-700 font-bold rounded shadow-sm ml-1">{member.actionWeek}</span>
                            <span className="w-8 h-8 flex items-center justify-center bg-white text-purple-700 font-bold rounded shadow-sm ml-1">{member.actionMonth}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <span>{member.loginDay}</span>
                            <span className="text-slate-300">/</span>
                            <span>{member.loginWeek}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-700">{member.loginMonth}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                            member.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            member.color === 'blue' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            member.color === 'amber' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {member.status === "AKTIF" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>}
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: TIMELINE */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-800">Aktivitas Terakhir</h3>
              </div>
              <div className="p-6">
                {data.recentActivities && data.recentActivities.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {data.recentActivities.map((act: any, i: number) => (
                      <div key={act.id} className="relative flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full border-[3px] border-white bg-blue-500 shadow ring-1 ring-slate-200 z-10 mt-1 shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-400 mb-1">
                            {timeAgo(new Date(act.createdAt))}
                          </p>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-sm">
                            <p className="text-sm font-semibold text-slate-800 mb-0.5">{act.ownerName}</p>
                            <p className="text-xs font-medium text-blue-600 mb-2">{act.action}</p>
                            {act.details && (
                              <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-100">"{act.details}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-slate-400">Belum ada aktivitas tercatat.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
