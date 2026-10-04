const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

authCode = authCode.replace(
  `return {} as any; // Return empty token`,
  `return { _expired: true } as any; // Return explicitly expired token`
);

authCode = authCode.replace(
  `if (!token || !token.email) {\n        return {} as any;\n      }`,
  `if (!token || !token.email || token._expired) {\n        return { expires: new Date(0).toISOString() } as any;\n      }`
);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched session expiration");
