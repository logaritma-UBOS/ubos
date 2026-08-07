export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.tokenOverride || process.env.NEXT_PUBLIC_FONNTE_TOKEN || process.env.FONNTE_TOKEN || 'rw47gsoTHcy86wGbxAtW';

    // Mendukung mode SINGLE message maupun BULK message (array of leads)
    const { target, message, leads, messageTemplate } = body;

    if (leads && Array.isArray(leads) && messageTemplate) {
      // MODE BULK / BROADCAST
      const fetchPromises = leads.map(lead => {
        let finalMessage = messageTemplate
          .replace(/{nama_usaha}/g, lead.nama_usaha || 'Bapak/Ibu')
          .replace(/{whatsapp}/g, lead.target || '')
          .replace(/{link_dashboard}/g, lead.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member');
          
        const formData = new URLSearchParams();
        formData.append('target', lead.target);
        formData.append('message', finalMessage);

        return fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { 'Authorization': token },
          body: formData,
        });
      });

      await Promise.all(fetchPromises);
      return NextResponse.json({ success: true, message: 'Broadcast dikirim.' });
      
    } else if (target) {
      // MODE SINGLE (Welcome WA)
      let finalMessage = (message || 'Halo, pendaftaran berhasil!')
        .replace(/{nama_usaha}/g, body.nama_usaha || 'Bapak/Ibu')
        .replace(/{link_dashboard}/g, body.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member');

      const formData = new URLSearchParams();
      formData.append('target', target);
      formData.append('message', finalMessage);

      const fonnteRes = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData,
      });

      const data = await fonnteRes.json();
      if (!fonnteRes.ok || !data.status) {
        throw new Error(data.reason || 'Fonnte API Error');
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });

  } catch (error: any) {
    console.error('Fonnte API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
