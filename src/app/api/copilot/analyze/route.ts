import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getMerchantRealtimeContext } from '@/lib/copilot-context';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const context = await getMerchantRealtimeContext(merchantId, accessToken);
    if (!context) {
      return NextResponse.json({ error: 'Gagal ambil data toko. Pastikan akun Anda sudah punya data merchant di database.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `Anda adalah Logaritma AI Copilot, asisten khusus untuk pemilik usaha kuliner.
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Berikan analisa Copilot untuk hari ini.',
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 500,
        temperature: 0.7
      }
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error('Copilot Analyze Error Detail:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Gagal terhubung ke AI' }, { status: 500 });
  }
}
