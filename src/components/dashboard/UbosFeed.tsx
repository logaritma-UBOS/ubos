"use client";
import { useState, useEffect } from "react";

export default function UbosFeed({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [realDonors, setRealDonors] = useState<any[]>([]);
  const [currentDonor, setCurrentDonor] = useState(0);
  const [allDonors, setAllDonors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/user/status")
      .then(r => r.json())
      .then(data => {
        setIsVIP(data.isVIP);
        
        fetch("/api/feed/articles").then(r => r.json()).then(a => {
          // Filter articles based on VIP status
          const filtered = a.filter((item: any) => data.isVIP || item.audience === "ALL");
          setArticles(filtered);
          
          // Fetch real donors for ALL users (so VIPs can see the thank you feed too)
          fetch("/api/feed/donors").then(r => r.json()).then(rd => {
             if (rd && rd.length > 0) {
               setAllDonors(rd);
             }
             setLoading(false);
          }).catch(() => setLoading(false));
        }).catch(() => setLoading(false));
      }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setCurrentDonor((prev) => (prev + 1) % allDonors.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading, allDonors.length]);

  if (loading) return null;

  if (position === "top" && allDonors.length > 0) {
    const donor = allDonors[currentDonor] || allDonors[0];
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 relative mb-6" style={{ perspective: "1000px" }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes flipUp {
            0% { transform: rotateX(-90deg); opacity: 0; }
            100% { transform: rotateX(0deg); opacity: 1; }
          }
          .animate-flip {
            animation: flipUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            transform-origin: bottom center;
          }
        `}} />
        <div className="absolute top-0 right-0 flex items-center">
          {!isVIP && (
            <button 
              onClick={() => window.dispatchEvent(new Event('open-donate-modal'))}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg transition-colors"
            >
              DONASI
            </button>
          )}
          <div className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1">Dukungan Komunitas</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-2">
          <span className="text-xl">🙌</span>
        </div>
        <div className="flex-1 overflow-hidden mt-2" style={{ perspective: "1000px" }}>
          <p className="text-xs text-slate-500 font-bold mb-1">Terima Kasih!</p>
          <p className="text-sm font-medium text-slate-800 animate-flip" key={currentDonor}>
            {donor.name} <span className="text-blue-600 font-bold">berdonasi Rp {donor.amount.toLocaleString('id-ID')}</span>
          </p>
        </div>
      </div>
    );
  }

  if (position === "bottom" && articles.length > 0) {
    return (
      <div className="mt-8">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Info & Panduan UBOS</h3>
        
        {articles.length === 1 ? (
          // Single article
          articles[0].imageUrl ? (
            <div 
              onClick={() => setActiveArticle(articles[0])}
              className="cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative group"
            >
              <img src={articles[0].imageUrl} alt={articles[0].title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className={`text-[10px] font-black px-2 py-1 rounded ${articles[0].audience === 'VIP_ONLY' ? 'bg-amber-500 text-amber-950' : 'bg-blue-600 text-white'}`}>
                  {articles[0].audience === 'VIP_ONLY' ? 'VIP' : 'INFO'}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-5 shadow-lg text-white transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded ${articles[0].audience === 'VIP_ONLY' ? 'bg-amber-500 text-amber-950' : 'bg-blue-500 text-blue-50'}`}>
                  {articles[0].audience === 'VIP_ONLY' ? 'VIP INSIGHT' : 'INFO'}
                </span>
                <span className="text-xs font-medium text-slate-300">{articles[0].category}</span>
              </div>
              <h3 className="font-bold text-lg mb-1 leading-tight">{articles[0].title}</h3>
              <div 
                className={`text-sm text-slate-300 whitespace-pre-line ${expandedId === articles[0].id ? '' : 'line-clamp-2'}`}
                dangerouslySetInnerHTML={{ __html: articles[0].content }}
              />
              <button 
                onClick={() => setExpandedId(expandedId === articles[0].id ? null : articles[0].id)}
                className="mt-4 text-xs font-bold text-indigo-300 hover:text-white transition-colors"
              >
                {expandedId === articles[0].id ? "TUTUP KONTEN \u2191" : "BACA SELENGKAPNYA \u2192"}
              </button>
            </div>
          )
        ) : (
          // Slider for multiple articles
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{__html: `
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}} />
            {articles.map((item) => (
              item.imageUrl ? (
                <div 
                  key={item.id} 
                  onClick={() => setActiveArticle(item)}
                  className="snap-start flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative group flex flex-col w-[38vw] max-w-[280px] md:w-[27%] h-36"
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${item.audience === 'VIP_ONLY' ? 'bg-amber-500 text-amber-950' : 'bg-blue-600 text-white'}`}>
                      {item.audience === 'VIP_ONLY' ? 'VIP' : 'INFO'}
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  key={item.id} 
                  className="snap-start flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg text-white flex flex-col w-[38vw] max-w-[280px] md:w-[27%]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[8px] font-black px-2 py-1 rounded ${item.audience === 'VIP_ONLY' ? 'bg-amber-500 text-amber-950' : 'bg-blue-500 text-blue-50'}`}>
                      {item.audience === 'VIP_ONLY' ? 'VIP' : 'INFO'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 truncate">{item.category}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-2 leading-snug line-clamp-2">{item.title}</h3>
                  <div 
                    className={`text-xs text-slate-300 whitespace-pre-line ${expandedId === item.id ? '' : 'line-clamp-3'} flex-grow`}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                  <button 
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="mt-3 text-[10px] font-bold text-indigo-300 hover:text-white transition-colors text-left"
                  >
                    {expandedId === item.id ? "TUTUP" : "BACA FULL"}
                  </button>
                </div>
              )
            ))}
          </div>
        )}

        {/* Article Modal Overlay */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded ${activeArticle.audience === 'VIP_ONLY' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>
                    {activeArticle.audience === 'VIP_ONLY' ? 'VIP INSIGHT' : 'INFO'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{activeArticle.category}</span>
                </div>
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {activeArticle.imageUrl && (
                  <img src={activeArticle.imageUrl} alt={activeArticle.title} className="w-full h-48 sm:h-64 object-cover" />
                )}
                <div className="p-5 sm:p-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-6">{activeArticle.title}</h2>
                  <div 
                    className="text-slate-700 leading-relaxed text-sm sm:text-base [&>a]:text-blue-600 [&>a:hover]:text-blue-500 [&>a]:font-bold [&>a]:underline whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
