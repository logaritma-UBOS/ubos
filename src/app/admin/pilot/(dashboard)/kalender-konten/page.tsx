import { auth } from "@/auth";
import { getSosmedPlans } from "@/actions/marketing";
import SosmedClient from "./SosmedClient";

export const dynamic = 'force-dynamic';

export default async function KalenderKontenPage() {
  const session = await auth();
  const pilotName = session?.user?.name || "Pilot Admin";
  
  const sosmeds = await getSosmedPlans(pilotName);

  return (
    <div className='p-4 lg:p-8 max-w-4xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-black text-gray-900 mb-2'>KALENDER KONTEN (PRIBADI)</h1>
        <p className='text-slate-500'>Perencanaan publikasi sosial media untuk {pilotName}. Konten yang masih berstatus draft atau siap upload hanya bisa dilihat oleh Anda.</p>
      </div>
      <SosmedClient initialData={sosmeds} />
    </div>
  );
}
