export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMerchantRealtimeContext } from '@/lib/copilot-context';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    const apiKeyUbos = process.env.API_KEY_UBOS_KULINER;
    const apiKeyFallback = process.env.GEMINI_API_KEY;
    const apiKey = apiKeyUbos || apiKeyFallback;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const context = await getMerchantRealtimeContext(merchantId, accessToken);
    if (!context) {
      return NextResponse.json({ error: 'Gagal ambil data toko. Pastikan akun Anda sudah punya data merchant di database.' }, { status: 500 });
    }

    const isPercetakan = context.category.toLowerCase().includes('percetakan') || context.category.toLowerCase().includes('fotokopi');

    let systemInstruction = `Anda adalah AI Business Copilot khusus bisnis Kuliner/F&B di Logaritma UBOS. Tugas Anda menganalisis omset, HPP, stok bahan baku, komisi platform delivery (ShopeeFood, GrabFood, GoFood), dan memberikan rekomendasi aksi praktis, cepat, serta berorientasi pada profit harian.

Tugas Anda adalah membaca data spesifik toko berikut dan memberikan analisa serta rekomendasi EKSEKUTIF yang sangat ringkas, tajam, dan bisa langsung dipraktikkan detik ini juga.

Data Toko Saat Ini:
- Nama Toko: ${context.merchantName} (${context.category})
- Target Omzet Harian: Rp ${context.targetDailyRevenue.toLocaleString('id-ID')}
- Omzet Tercapai Hari Ini: Rp ${context.currentRevenueToday.toLocaleString('id-ID')} (${context.achievementPercentage}%)
- Menu Terlaris Hari Ini: ${context.topSellingItems.length > 0 ? context.topSellingItems.join(', ') : 'Belum ada data'}
- Menu Kurang Laku: ${context.slowMovingItems.length > 0 ? context.slowMovingItems.join(', ') : 'Belum ada data'}
- Peringatan HPP (Margin < 35%): ${context.hppAlerts.length > 0 ? context.hppAlerts.join(', ') : 'Aman'}
- Peringatan Stok: ${context.stockAlerts.length > 0 ? context.stockAlerts.join(', ') : 'Aman'}

Strict Instruction: Anda WAJIB menyebutkan data spesifik toko di atas (nama toko, angka nominal rupiah, nama menu/produk asli). DILARANG memberikan jawaban umum/template.

Output Anda HARUS persis mengikuti format ini:

📊 Status Target: [On-Track / Waspada / Darurat] (Pilih salah satu berdasarkan % omzet tercapai. Jika masih 0% tapi ini pagi hari, pilih Waspada. Jika 100% On-Track)

🔍 Analisa Singkat: (Jelaskan 1-2 kalimat mengapa statusnya demikian dengan me-mention angka/menu secara spesifik. Highlight jika ada HPP naik/stok habis)

🚀 Rekomendasi Eksekusi:
1. (Langkah aksi spesifik pertama, misal: Naikkan harga menu X sebesar Y)
2. (Langkah aksi spesifik kedua, misal: Buat promo bundling menu Z)`;

    if (isPercetakan) {
      systemInstruction = `Anda adalah AI Business Copilot khusus bisnis Percetakan & Fotokopi di Logaritma UBOS. Tugas Anda menganalisis omset jasa cetak, penjualan ATK, stok bahan baku (kertas, tinta, banner), efisiensi jam operasional mesin, dan memberikan rekomendasi aksi praktis, cepat, serta berorientasi pada profit harian.

Tugas Anda adalah membaca data spesifik percetakan berikut dan memberikan analisa serta rekomendasi EKSEKUTIF yang sangat ringkas, tajam, dan bisa langsung dipraktikkan detik ini juga.

Data Toko Saat Ini:
- Nama Toko: ${context.merchantName} (${context.category})
- Target Omzet Harian: Rp ${context.targetDailyRevenue.toLocaleString('id-ID')}
- Omzet Tercapai Hari Ini: Rp ${context.currentRevenueToday.toLocaleString('id-ID')} (${context.achievementPercentage}%)
- Layanan/Produk Terlaris Hari Ini: ${context.topSellingItems.length > 0 ? context.topSellingItems.join(', ') : 'Belum ada data'}
- Produk Kurang Laku: ${context.slowMovingItems.length > 0 ? context.slowMovingItems.join(', ') : 'Belum ada data'}
- Peringatan HPP (Margin < 35%): ${context.hppAlerts.length > 0 ? context.hppAlerts.join(', ') : 'Aman'}
- Peringatan Stok (Tinta/Bahan): ${context.stockAlerts.length > 0 ? context.stockAlerts.join(', ') : 'Aman'}

Strict Instruction: Anda WAJIB menyebutkan data spesifik percetakan di atas (nama toko, angka nominal rupiah, nama layanan/produk asli). DILARANG memberikan jawaban umum/template tentang F&B atau GoFood/GrabFood. Fokus pada promosi offline, pesanan partai besar, paket banner/brosur, atau efisiensi mesin cetak.

Output Anda HARUS persis mengikuti format ini:

📊 Status Target: [On-Track / Waspada / Darurat] (Pilih salah satu berdasarkan % omzet tercapai. Jika masih 0% tapi ini pagi hari, pilih Waspada. Jika 100% On-Track)

🔍 Analisa Singkat: (Jelaskan 1-2 kalimat mengapa statusnya demikian dengan me-mention angka/layanan secara spesifik. Highlight jika ada HPP naik/stok bahan kritis)

🚀 Rekomendasi Eksekusi:
1. (Langkah aksi spesifik pertama, misal: Broadcast WA promo cetak brosur/banner)
2. (Langkah aksi spesifik kedua, misal: Tawarkan paket cetak grosir untuk instansi sekitar)`;
    }

    let responseText = "";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction
      });
      const result = await model.generateContent('Berikan analisa Copilot untuk hari ini.');
      responseText = result.response.text();
    } catch (e: any) {
      if (apiKeyUbos && apiKey === apiKeyUbos && apiKeyFallback) {
        console.warn('API Key UBOS Kuliner gagal, fallback ke GEMINI_API_KEY...');
        const genAIFallback = new GoogleGenerativeAI(apiKeyFallback);
        const modelFallback = genAIFallback.getGenerativeModel({
          model: 'gemini-3.6-flash',
          systemInstruction
        });
        const result = await modelFallback.generateContent('Berikan analisa Copilot untuk hari ini.');
        responseText = result.response.text();
      } else {
        throw e;
      }
    }

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error('Copilot Analyze Error Detail:', error?.message || error);
    const msg = error?.message || '';
    const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
    return NextResponse.json({
      error: isQuotaError
        ? 'Kuota API Gemini Anda telah habis (Error 429). Silakan gunakan kunci API baru atau upgrade akun Google AI Studio Anda.'
        : (msg || 'Gagal terhubung ke AI')
    }, { status: 500 });
  }
}
