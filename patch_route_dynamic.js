const fs = require('fs');

let routeCode = fs.readFileSync('src/app/api/leads/signup/route.ts', 'utf8');

if (!routeCode.includes('export const dynamic =')) {
  routeCode = "export const dynamic = 'force-dynamic';\nimport { NextRequest } from 'next/server';\n" + routeCode;
}
routeCode = routeCode.replace('export async function POST(req: Request)', 'export async function POST(req: NextRequest)');

fs.writeFileSync('src/app/api/leads/signup/route.ts', routeCode);
console.log("Updated signup route to use force-dynamic and NextRequest");
