import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ version: '6f1e330', status: 'deployed' });
}
