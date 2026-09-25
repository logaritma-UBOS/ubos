import AppShell from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function StudioAIPage() {
  const session = await auth();
  let businessName = "Bisnis Anda";
  if (session?.user?.id) {
    const b = await prisma.business.findFirst({ where: { userId: session.user.id } });
    if (b) businessName = b.name;
  }

  return (
    <AppShell businessName={businessName}>
      <div className="bg-[#0f0715] min-h-screen text-white font-poppins rounded-xl overflow-hidden shadow-2xl flex border border-purple-900/30">
        
        {/* INNER SIDEBAR */}
        <div className="w-64 bg-[#140b1c] border-r border-white/5 flex flex-col hidden md:flex shrink-0">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A120.104 120.104 0 001 10.51a1 1 0 00.373 1.411l.857.514a1 1 0 001.37-.367c.72-1.18 1.545-2.28 2.45-3.284v4.966a1 1 0 102 0V9.334a1 1 0 011 0v4.416a1 1 0 102 0V9.334a1 1 0 011 0v8.416a1 1 0 102 0v-8.416a1 1 0 011 0v3.416a1 1 0 102 0v-3.416a1 1 0 011 0v2.416a1 1 0 102 0V10.51a1 1 0 00-1.63-.772A120.088 120.088 0 0011.3 1.046zM13 14a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
            </div>
            <h1 className="font-bold text-lg tracking-wide">StudioPebisnis.ai</h1>
          </div>
          
          <div className="px-4 mb-6">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-6 hide-scrollbar">
            <div>
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Menu</h2>
              <div className="space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-purple-900/40 text-purple-200 rounded-lg text-sm font-medium border border-purple-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Dasbor Utama
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Studio AI
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Strategi Iklan AI
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Audit Performa Iklan
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Library</h2>
              <div className="space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Pembuat Gambar AI
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Penulis Konten AI
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-4 mt-auto">
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A120.104 120.104 0 001 10.51a1 1 0 00.373 1.411l.857.514a1 1 0 001.37-.367c.72-1.18 1.545-2.28 2.45-3.284v4.966a1 1 0 102 0V9.334a1 1 0 011 0v4.416a1 1 0 102 0V9.334a1 1 0 011 0v8.416a1 1 0 102 0v-8.416a1 1 0 011 0v3.416a1 1 0 102 0v-3.416a1 1 0 011 0v2.416a1 1 0 102 0V10.51a1 1 0 00-1.63-.772A120.088 120.088 0 0011.3 1.046zM13 14a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Engine On</p>
                <p className="text-[10px] text-purple-300 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Kampus Pebisnis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] overflow-y-auto hide-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <button className="md:hidden text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="hidden md:block"></div>
            <div className="flex bg-white/10 rounded-full p-1 border border-white/5">
              <button className="px-3 py-1 text-xs font-bold rounded-full bg-white/20 text-white">ID</button>
              <button className="px-3 py-1 text-xs font-bold rounded-full text-gray-400 hover:text-white">EN</button>
            </div>
          </div>

          <div className="px-6 md:px-10 pb-10">
            <p className="text-sm text-gray-400 font-medium mb-1">What's hot</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Trending</h1>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* BIG BANNER */}
              <div className="flex-1 bg-gradient-to-r from-[#f97316] via-[#d946ef] to-[#7e22ce] rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>
                
                <div className="relative z-10">
                  <p className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-widest mb-3">STUDIOPEBISNIS.AI BY KAMPUS PEBISNIS</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8 drop-shadow-sm max-w-xl">
                    ALL IN ONE <br/>MARKETING TOOLS
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-white text-purple-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
                      Start Creating
                    </button>
                    <button className="bg-black/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3 rounded-full hover:bg-black/30 transition-colors">
                      Follow
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS */}
              <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-gray-300 mb-1">Quick Access</h3>
                  
                  <button className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-4 rounded-2xl flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="font-bold text-gray-200">Studio AI</span>
                  </button>
                  
                  <button className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-4 rounded-2xl flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <span className="font-bold text-gray-200">Ad Analyzer</span>
                  </button>
                  
                  <button className="bg-white/5 border border-white/10 hover:bg-white/10 transition-colors p-4 rounded-2xl flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <span className="font-bold text-gray-200">Voice Studio</span>
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#fb923c] to-[#a855f7] rounded-3xl p-6 relative overflow-hidden flex-1 min-h-[140px] shadow-lg flex flex-col justify-end">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <h3 className="font-black text-2xl text-white drop-shadow-sm mb-1">Studio AI</h3>
                  <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">ALL-IN-ONE AI HUB</p>
                </div>
              </div>
            </div>

            {/* AI TOOLS TABLE */}
            <div className="mt-12">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-bold text-white">AI Tools</h3>
                <span className="text-sm text-gray-400 font-medium">10 tools</span>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-center text-gray-500 font-bold">1</td>
                      <td className="p-4 font-bold text-gray-200">Auto Copywriter Pro</td>
                      <td className="p-4 text-gray-400">Content Creation</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">Active</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-center text-gray-500 font-bold">2</td>
                      <td className="p-4 font-bold text-gray-200">Ad Creative Generator</td>
                      <td className="p-4 text-gray-400">Advertising</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">Active</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-center text-gray-500 font-bold">3</td>
                      <td className="p-4 font-bold text-gray-200">Market Trend Analyzer</td>
                      <td className="p-4 text-gray-400">Research</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">Beta</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-center text-gray-500 font-bold">4</td>
                      <td className="p-4 font-bold text-gray-200">Video Script AI</td>
                      <td className="p-4 text-gray-400">Content Creation</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">Active</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}
