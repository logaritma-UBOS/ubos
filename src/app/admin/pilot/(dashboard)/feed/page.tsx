import Link from "next/link";
import KontenClient from "../konten/KontenClient";
import { getFeedContents } from "@/actions/marketing";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const feeds = await getFeedContents("VIP_ONLY");

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/admin/pilot/menu" className="text-indigo-600 text-sm font-bold mb-2 inline-block md:hidden">&larr; Kembali</Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Konten Feed Premium</h1>
          <p className="text-slate-500">Wawasan bisnis premium eksklusif untuk tenant VIP.</p>
        </div>
        
        <KontenClient initialData={feeds} audienceType="VIP_ONLY" />
      </div>
    </div>
  );
}