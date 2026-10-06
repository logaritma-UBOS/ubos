import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: { email: session.user.email }
    });

    if (!teamMember) {
      return new Response('User not found in team', { status: 404 });
    }

    const { messages } = await req.json();
    const role = session.user.role || 'OWNER';
    const name = session.user.name || 'Bos';

    let systemPrompt = `Kamu adalah asisten pintar internal UBOS. Bicaralah menggunakan bahasa Indonesia yang santai, profesional, dan sedikit gaul ala startup. Gunakan panggilan "Bos ${name}". Jangan gunakan Markdown kompleks, gunakan plain text sederhana. Kamu dibekali kemampuan mengeksekusi aksi (Function Calling). Jika user meminta melakukan sesuatu yang ada di *tools* mu, langsung panggil tools tersebut tanpa banyak basa-basi, lalu beritahu hasilnya ke user.\n\n`;

    if (role === 'SUPER_ADMIN' || role === 'OWNER') {
      systemPrompt += `Peran kamu saat ini adalah Asisten CEO (Baim). Fokus: memberikan ringkasan performa tim, strategi bisnis *high-level*, dan insight eksekutif. Kamu tahu bahwa Logaritma sedang fokus memperbesar ARR.`;
    } else if (role === 'METHODOLOGY') {
      systemPrompt += `Peran kamu saat ini adalah Asisten Riset & Marketing (Tony). Fokus: membantu menganalisa metrik konversi, ideation konten edukasi, copywriting, dan strategi funnelling. AWAS: Tony punya kewajiban memasukkan lead manual minimal 2 nama & 2 nomor WA setiap harinya. Selalu ingatkan dan langsung eksekusi penambahan lead ke sistem CRM jika dia memberikan nama & nomor.`;
    } else if (role === 'DEVELOPER') {
      systemPrompt += `Peran kamu saat ini adalah Asisten Teknis Senior (Reza). Fokus: membantu mencari solusi kode (Next.js, Prisma, Tailwind, TypeScript), menganalisa *log error*, arsitektur, dan memantau stabilitas server. Berikan kode yang efisien dan minim *bug*.`;
    } else if (role === 'OPERATIONS') {
      systemPrompt += `Peran kamu saat ini adalah Asisten CS & Operasional (Bana). Fokus: membantu menyusun *draft* balasan chat WhatsApp ke pelanggan/leads, menyortir komplain, *follow-up*, dan kelancaran alur operasional.`;
    }

    const today = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date());
    systemPrompt += `\n\nKonteks Tambahan:\n- Waktu saat ini: ${today}\n- Sistem: Next.js App Router, Prisma ORM, Turso (SQLite), Tailwind CSS.`;

    const coreMessages = messages.map((m: any) => ({ role: m.role, content: m.content }));

    const tools: Record<string, any> = {
      tambahTugasHarian: tool({
        description: 'Menambahkan checklist tugas harian baru untuk tim member yang sedang login.',
        parameters: z.object({
          nama_tugas: z.string().describe('Teks nama tugas yang dipesan user (contoh: "Follow up user pro")'),
          urgensi: z.string().optional().describe('Tingkat urgensi (opsional)')
        }),
        execute: async (args: any) => {
          const taskName = args.nama_tugas || "Tugas Baru dari AI";
          const task = await prisma.teamTask.create({
            data: {
              taskName,
              teamMemberId: teamMember.id,
              date: new Date()
            }
          });
          return `Berhasil mencatat tugas "${task.taskName}" ke sistem Checklist.`;
        }
      }),
    };

    if (role === 'METHODOLOGY' || role === 'SUPER_ADMIN') {
      tools.tambahLeadManual = tool({
        description: 'Menambahkan data prospek/lead manual baru ke sistem CRM perusahaan. Wajib digunakan jika pengguna memberikan nama dan nomor telp/WA lead baru.',
        parameters: z.object({
          nama_lead: z.string().describe('Nama lengkap prospek/lead'),
          nomor_wa: z.string().describe('Nomor telepon/WhatsApp lead')
        }),
        execute: async (args: any) => {
          const name = args.nama_lead || "Lead Tanpa Nama";
          const phone = args.nomor_wa || "0000";
          const lead = await prisma.manualLead.create({
            data: {
              name,
              phone,
              sourceId: teamMember.id,
              status: "NEW"
            }
          });
          return `Sip! Berhasil memasukkan lead manual atas nama ${lead.name} (${lead.phone}) ke database CRM.`;
        }
      });
    }

    const result = await generateText({
      model: google('gemini-flash-lite-latest'),
      messages: coreMessages,
      system: systemPrompt,
      tools,
      maxSteps: 5,
    });

    const finalResponse = result.text || "Siap Bos! Perintah eksekusi (Tools) sudah berhasil saya jalankan di latar belakang. Ada lagi yang bisa dibantu?";

    return new Response(finalResponse, { headers: { 'Content-Type': 'text/plain' } });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
