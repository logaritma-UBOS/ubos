const fs = require('fs');

let routeCode = fs.readFileSync('src/app/api/leads/signup/route.ts', 'utf8');

// Replace { status: 500 } and { status: 400 } and { status: 401 } with { status: 200 }
routeCode = routeCode.replace(/\{ status: 500 \}/g, '{ status: 200 }');
routeCode = routeCode.replace(/\{ status: 400 \}/g, '{ status: 200 }');
routeCode = routeCode.replace(/\{ status: 401 \}/g, '{ status: 200 }');

fs.writeFileSync('src/app/api/leads/signup/route.ts', routeCode);
console.log("Updated API route to always return 200 OK");
