"use client"

import { useState } from "react"

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  
  if (!text) return null;

  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
  
  // Jika teks sangat pendek (hanya 1 paragraf pendek), tampilkan apa adanya
  if (paragraphs.length <= 1 && text.length < 150) {
    return <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed mb-4">{text}</p>
  }

  // Ambil paragraf pertama saja jika belum di-expand
  const previewText = paragraphs[0];

  return (
    <div className="mb-4">
      <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
        {expanded ? text : previewText + (paragraphs.length > 1 || text.length >= 150 ? "..." : "")}
      </p>
      
      {!expanded && (paragraphs.length > 1 || text.length >= 150) && (
        <button 
          onClick={() => setExpanded(true)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1 inline-block"
        >
          Lihat selengkapnya
        </button>
      )}
      
      {expanded && (
        <button 
          onClick={() => setExpanded(false)}
          className="text-slate-500 hover:text-slate-700 text-sm font-semibold mt-2 inline-block"
        >
          Sembunyikan
        </button>
      )}
    </div>
  )
}
