export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { agent_role } = await req.json();

    if (!agent_role || !['GROWTH', 'OPS', 'FINANCE', 'TECH'].includes(agent_role)) {
      return NextResponse.json({ error: 'Agent role tidak valid.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    let contextData = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Context Gathering based on Role
    if (agent_role === 'GROWTH') {
      const { count: visitorToday } = await supabaseAdmin
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
        
      const { count: totalLeads } = await supabaseAdmin
        .from('merchants')
        .select('*', { count: 'exact', head: true });
        
      const targetLeads = 4100;
      const gap = targetLeads - (totalLeads || 0);

      contextData = `
        - Visitor Hari Ini: ${visitorToday || 0}
        - Total Leads Saat Ini: ${totalLeads || 0}
        - Target Bulanan: ${targetLeads} Leads
        - Gap/Sisa Target: ${gap > 0 ? gap : 'Tercapai'} Leads
      `;
    } else if (agent_role === 'OPS') {
      const in3Days = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
      const { data: merchantsTrial } = await supabaseAdmin
        .from('merchants')
        .select('nama_usaha, trial_ends_at, whatsapp')
        .gte('trial_ends_at', today.toISOString())
        .lte('trial_ends_at', in3Days.toISOString());
        
      const trialList = merchantsTrial?.map(m => `- ${m.nama_usaha} (Selesai trial: ${new Date(m.trial_ends_at).toLocaleDateString('id-ID')})`).join('\n') || 'Tidak ada merchant yang habis masa trial dalam 3 hari ke depan.';

      contextData = `
        Daftar Merchant yang trial-nya akan habis dalam 1-3 hari:
        ${trialList}
      `;
    } else if (agent_role === 'FINANCE') {
      const modalDisetor = 2800000;
      
      const { count: premiumMerchants } = await supabaseAdmin
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true);
        
      const revenue = (premiumMerchants || 0) * 49000;

      const { data: opexData } = await supabaseAdmin
        .from('fixed_monthly_opex')
        .select('amount');
        
      const totalOpex = opexData ? opexData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;
      const netProfit = revenue - totalOpex;

      contextData = `
        - Modal Disetor Saat Ini: Rp${modalDisetor.toLocaleString('id-ID')}
        - Saldo Revenue (Dari ${premiumMerchants || 0} Premium Merchant): Rp${revenue.toLocaleString('id-ID')}
        - Total Tagihan OPEX Berjalan: Rp${totalOpex.toLocaleString('id-ID')}
        - Estimasi Net Profit: Rp${netProfit.toLocaleString('id-ID')}
      `;
    } else if (agent_role === 'TECH') {
      const { data: latestLogs } = await supabaseAdmin
        .from('system_logs')
        .select('error_rate, created_at, logs')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      contextData = `
        - Status Sistem Terakhir (${latestLogs ? new Date(latestLogs.created_at).toLocaleString('id-ID') : 'N/A'}):
        - Error Rate: ${latestLogs?.error_rate || '0'}%
        - Log Ringkas: ${latestLogs?.logs || 'Sistem berjalan normal tanpa kendala.'}
      `;
    }

    const systemInstruction = `Bertindaklah sebagai Konsultan Eksekutif Senior Logaritma. Berikan briefing harian yang sangat to-the-point, berikan 3 langkah aksi konkret hari ini yang bisa dieksekusi oleh tim (Baim, Tony, Reza), dan hindari basa-basi teknis. Format jawaban Anda menggunakan markdown yang rapi dengan bullet points.`;
    const prompt = `Analisis data real-time berikut untuk bidang ${agent_role}:\n\n${contextData}\n\nBerikan laporan singkat dan 3 rencana aksi hari ini.`;

    const modelsToTry = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let aiResponseText = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        aiResponseText = response.text || '';
        if (aiResponseText) break; // Berhasil
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        // Continue to the next model
      }
    }

    if (!aiResponseText) {
      throw lastError || new Error('Semua model AI sedang sibuk atau gagal merespons.');
    }

    return NextResponse.json({
      success: true,
      analysis: aiResponseText
    });

  } catch (error: any) {
    console.error('AI Consultant API Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server AI' }, { status: 500 });
  }
}
