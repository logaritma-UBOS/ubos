const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
require('dotenv').config({ path: '.env.local' });
const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const adapter = new PrismaLibSQL(client);
const prisma = new PrismaClient({ adapter });
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'logaritma.tim@gmail.com' } });
  console.log(user);
}
main();
