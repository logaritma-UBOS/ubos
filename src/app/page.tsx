import type { Metadata } from 'next';
import HomepageClient from './HomepageClient';

export const metadata: Metadata = {
  title: 'Logaritma | Dari Target Jadi Langkah',
  description: 'Masukkan target Anda. Logaritma membantu memetakan kebutuhan dan menentukan langkah berikutnya.',
  openGraph: {
    title: 'Logaritma | Dari Target Jadi Langkah',
    description: 'Masukkan target Anda. Logaritma membantu memetakan kebutuhan dan menentukan langkah berikutnya.',
    type: 'website',
    locale: 'id_ID',
    url: 'https://logaritma.id',
    siteName: 'Logaritma',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logaritma | Dari Target Jadi Langkah',
    description: 'Masukkan target Anda. Logaritma membantu memetakan kebutuhan dan menentukan langkah berikutnya.',
  },
};

export default function HomePage() {
  return <HomepageClient />;
}
