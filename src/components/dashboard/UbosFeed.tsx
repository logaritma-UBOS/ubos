"use client";
import { useState, useEffect } from "react";

export default function UbosFeed() {
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  
  // Social Proof Simulation
  const donors = [
    "Toko Mawar berdonasi Rp 50.000",
    "Warung Budi berdonasi Rp 100.000",
    "Kedai Kopi Senja berdonasi Rp 25.000",
    "Ayam Geprek Mas berdonasi Rp 150.000",
    "Berkah Grosir berdonasi Rp 50.000",
    "Toko Plastik Makmur berdonasi Rp 20.000"
  ];
  
  const [currentDonor, setCurrentDonor] = useState(0);

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
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (!isVIP && !loading) {
      const interval = setInterval(() => {
        setCurrentDonor((prev) => (prev + 1) % donors.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVIP, loading]);

  if (loading) return <div className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>;

  if (!isVIP) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-bl-lg">Dukungan Komunitas</div>
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🙌</span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-bold mb-1">Terima Kasih!</p>
          <p className="text-sm font-medium text-slate-800 animate-in slide-in-from-bottom-2 fade-in duration-300" key={currentDonor}>
            {donors[currentDonor]}
          </p>
        </div>
      </div>
    );
  }

  // VIP State - Premium Blog Feed
  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-5 shadow-lg text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-1 rounded">VIP INSIGHT</span>
        <span className="text-xs font-medium text-slate-300">Wawasan Bisnis Premium</span>
      </div>
      <h3 className="font-bold text-lg mb-1 leading-tight">{article?.title || "Wawasan Bisnis"}</h3>
      <p className="text-sm text-slate-300 line-clamp-2">{article?.content || "Memuat..."}</p>
      <button className="mt-4 text-xs font-bold text-indigo-300 hover:text-white transition-colors">BACA SELENGKAPNYA →</button>
    </div>
  );
}
