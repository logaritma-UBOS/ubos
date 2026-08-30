"use client";
import { useState, useEffect } from "react";

export default function UbosFeed({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [realDonors, setRealDonors] = useState<any[]>([]);
  
  // Fake Donors
  const fakeDonors = [
    { name: "Toko Mawar", amount: 50000 },
    { name: "Warung Budi", amount: 100000 },
    { name: "Kedai Kopi Senja", amount: 25000 },
    { name: "Ayam Geprek Mas", amount: 150000 },
    { name: "Berkah Grosir", amount: 50000 },
    { name: "Toko Plastik Makmur", amount: 20000 },
    { name: "Nasi Padang Sederhana", amount: 75000 },
    { name: "Minimarket Barokah", amount: 200000 },
    { name: "Laundry Kinclong", amount: 35000 },
    { name: "Apotek Sehat", amount: 50000 },
    { name: "Bengkel Motor Jaya", amount: 100000 },
    { name: "Salon Cantik", amount: 25000 },
    { name: "Toko Besi Maju", amount: 150000 },
    { name: "Bakso Urat Solo", amount: 50000 },
    { name: "Percetakan Kilat", amount: 80000 }
  ];
  
  const [currentDonor, setCurrentDonor] = useState(0);
  const [allDonors, setAllDonors] = useState(fakeDonors);

  useEffect(() => {
    fetch("/api/user/status")
      .then(r => r.json())
      .then(data => {
        setIsVIP(data.isVIP);
        if (data.isVIP) {
          fetch("/api/feed/articles").then(r => r.json()).then(a => {
            setArticle(a[0]);
            setLoading(false);
          });
        } else {
          // Fetch real donors
          fetch("/api/feed/donors").then(r => r.json()).then(rd => {
             if (rd && rd.length > 0) {
               const merged = [...rd, ...fakeDonors];
               setAllDonors(merged);
             }
             setLoading(false);
          }).catch(() => {
             setLoading(false);
          });
        }
      });
  }, []);

  useEffect(() => {
    if (!isVIP && !loading) {
      const interval = setInterval(() => {
        setCurrentDonor((prev) => (prev + 1) % allDonors.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVIP, loading, allDonors.length]);

  if (loading) return null;

  if (!isVIP) {
    if (position === "top") {
      const donor = allDonors[currentDonor];
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
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-bl-lg">Dukungan Komunitas</div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🙌</span>
          </div>
          <div className="flex-1 overflow-hidden" style={{ perspective: "1000px" }}>
            <p className="text-xs text-slate-500 font-bold mb-1">Terima Kasih!</p>
            <p className="text-sm font-medium text-slate-800 animate-flip" key={currentDonor}>
              {donor.name} <span className="text-blue-600 font-bold">berdonasi Rp {donor.amount.toLocaleString('id-ID')}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  if (position === "bottom") {
    return (
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-5 shadow-lg text-white transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-1 rounded">VIP INSIGHT</span>
          <span className="text-xs font-medium text-slate-300">Wawasan Bisnis Premium</span>
        </div>
        <h3 className="font-bold text-lg mb-1 leading-tight">{article?.title || "Wawasan Bisnis"}</h3>
        <p className={`text-sm text-slate-300 ${isExpanded ? '' : 'line-clamp-2'} whitespace-pre-line`}>
          {article?.content || "Memuat..."}
        </p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-xs font-bold text-indigo-300 hover:text-white transition-colors"
        >
          {isExpanded ? "TUTUP KONTEN \u2191" : "BACA SELENGKAPNYA \u2192"}
        </button>
      </div>
    );
  }

  return null;
}
