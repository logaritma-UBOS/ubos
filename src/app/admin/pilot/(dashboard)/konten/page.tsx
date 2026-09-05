export const dynamic = 'force-dynamic'
import KontenClient from './KontenClient';
import { getFeedContents } from '@/actions/marketing';

export default async function KontenPage() {
  const feeds = await getFeedContents("ALL");
  
  return (
    <div className='p-4 lg:p-8 max-w-4xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-black text-gray-900 mb-2'>KONTEN IN-APP</h1>
        <p className='text-slate-500'>Kalender publikasi edukasi dan informasi ke dashboard Tenant.</p>
      </div>
      <KontenClient initialData={feeds} audienceType="ALL" />
    </div>
  );
}
