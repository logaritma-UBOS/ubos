const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
require('dotenv').config({ path: '.env.vercel' });
const bcrypt = require('bcryptjs');

const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const adapter = new PrismaLibSQL(client);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log('1. Checking user logaritma.tim@gmail.com');
        const user = await prisma.user.findUnique({
            where: { email: 'logaritma.tim@gmail.com' }
        });
        
        if (user) {
            console.log('User found:', user.id);
            
            // Delete polluting businesses
            console.log('2. Deleting any merchant businesses attached to this user');
            const deleted = await prisma.business.deleteMany({
                where: { ownerId: user.id }
            });
            console.log('Deleted businesses count:', deleted.count);
            
            // Set password
            console.log('3. Setting adminlog2026 password');
            const hash = await bcrypt.hash('adminlog2026', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    passwordHash: hash,
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('User password and role updated successfully!');
        } else {
            console.log('User not found. NextAuth might not have created them yet.');
            console.log('Creating user manually...');
            const hash = await bcrypt.hash('adminlog2026', 10);
            await prisma.user.create({
                data: {
                    email: 'logaritma.tim@gmail.com',
                    name: 'Tim Logaritma',
                    passwordHash: hash,
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('User created successfully!');
        }
        
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
