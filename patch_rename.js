const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

if (pageCode.includes('/api/leads/register')) {
  pageCode = pageCode.replace('/api/leads/register', '/api/leads/signup');
  fs.writeFileSync('src/app/page.tsx', pageCode);
  console.log("Updated page.tsx to use /api/leads/signup");
} else {
  console.log("Could not find /api/leads/register in page.tsx");
}

let routeCode = fs.readFileSync('src/app/api/leads/signup/route.ts', 'utf8');
if (!routeCode.includes('console.log("SIGNUP API HIT");')) {
  routeCode = routeCode.replace('export async function POST(req: Request) {', 'export async function POST(req: Request) {\n  console.log("SIGNUP API HIT");\n');
  fs.writeFileSync('src/app/api/leads/signup/route.ts', routeCode);
  console.log("Added console log to route.ts");
}
