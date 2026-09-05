import { getSosmedFeed } from "@/actions/marketing";
import SosmedFeedList from "./SosmedFeedList";

export const dynamic = 'force-dynamic';

export default async function SosmedFeedPage() {
  const feeds = await getSosmedFeed();

  return (
    <div className='p-4 lg:p-8 max-w-5xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-black text-gray-900 mb-2'>FEED SOSIAL MEDIA TIM</h1>
        <p className='text-slate-500'>Pantau semua konten sosial media dari seluruh tim yang sudah berstatus <strong>Selesai</strong>.</p>
      </div>
      <SosmedFeedList initialData={feeds} />
    </div>
  );
}
