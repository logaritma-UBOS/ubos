const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldCode = `emailVerified: data.emailVerified || null,`;
const newCode = `emailVerified: typeof data.emailVerified === 'boolean' ? (data.emailVerified ? new Date() : null) : (data.emailVerified ? new Date(data.emailVerified) : null),`;

authCode = authCode.replace(oldCode, newCode);
fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched emailVerified");
