import { getRecommendations } from './src/lib/solutions/engine';

const tests = [
  { profesi: 'Pedagang', tujuan: 'Mencapai target', target: '10jt', caraMencapai: 'Belum tahu cara mencapai target' },
  { profesi: 'Konten Kreator', tujuan: 'Jadi terkenal', target: '1M followers', caraMencapai: 'Bikin video tiap hari' },
  { profesi: 'UMKM F&B', tujuan: 'Buka cabang', target: '5 cabang', caraMencapai: 'Meningkatkan omzet' },
  { profesi: 'Retail', tujuan: 'Grosir jalan terus', target: '1000 pelanggan', caraMencapai: 'Digitalisasi bisnis' },
  { profesi: 'Jasa', tujuan: 'Klien bertambah', target: '20 klien bulan ini', caraMencapai: 'Kelola prospek dengan baik' },
];

for (const t of tests) {
  console.log('---');
  console.log('Test:', t.profesi);
  const recs = getRecommendations(t);
  if (recs.length === 0) {
    console.log('Result: Belum cukup data / Tidak ada solusi (PASS)');
  } else {
    console.log('Result: ' + recs.map(r => r.name).join(', '));
  }
}
