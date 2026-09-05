import { prisma } from "./src/lib/prisma"; 
async function main() { 
  await prisma.$executeRawUnsafe(`ALTER TABLE OwnerCampaign ADD COLUMN author TEXT;`); 
  console.log("Success"); 
} 
main().catch(e => console.error(e));
