import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'UBOS Pilot Dashboard',
    short_name: 'UBOSPilot',
    description: 'Dashboard eksklusif UBOS Pilot untuk owner',
    start_url: '/admin/pilot',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  })
}
