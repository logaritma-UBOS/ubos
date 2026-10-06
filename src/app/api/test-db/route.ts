import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const email = 'logaritma.tim@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      await prisma.business.deleteMany({ where: { ownerId: user.id } });
      const hash = await bcrypt.hash('adminlog2026', 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash, role: 'SUPER_ADMIN' }
      });
      return NextResponse.json({ success: true, message: 'Cleaned merchant data and set password.' });
    } else {
      const hash = await bcrypt.hash('adminlog2026', 10);
      await prisma.user.create({
        data: {
          email,
          name: 'Tim Logaritma',
          passwordHash: hash,
          role: 'SUPER_ADMIN'
        }
      });
      return NextResponse.json({ success: true, message: 'Created admin user with password.' });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
