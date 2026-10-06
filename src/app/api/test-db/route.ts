import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;
    const password = body.password;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' });
    
    let passwordsMatch = false;
    try {
      passwordsMatch = await bcrypt.compare(password, user.passwordHash || '');
    } catch (e: any) {
      return NextResponse.json({ error: 'Bcrypt crash', details: e.message });
    }
    
    if (!passwordsMatch) return NextResponse.json({ error: 'Wrong password' });
    
    // Simulate JWT token creation
    let token: any = { id: user.id, email: user.email, role: user.role };
    const currentDayStr = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric', month: 'numeric', day: 'numeric'
    }).format(new Date());
    
    try {
        if (!(user as any).staffBusinessId && user.id) {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
          if (dbUser) {
            token.role = dbUser.role
            token.staffBusinessId = dbUser.staffBusinessId
          }
        }
    } catch (e: any) {
        return NextResponse.json({ error: 'JWT DB crash', details: e.message });
    }
    
    token.loginDateStr = currentDayStr;
    
    return NextResponse.json({ success: true, token });
  } catch (e: any) {
    return NextResponse.json({ error: 'Global crash', stack: e.stack });
  }
}
