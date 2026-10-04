const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

// Find and remove the manual linking block
const manualLinkRegex = /if \(account\?\.provider === "google" && user\?\.email\) \{[\s\S]*?try \{[\s\S]*?const dbUser = await prisma\.user\.findUnique\(\{ where: \{ email: user\.email \} \}\);[\s\S]*?\} catch \(e\) \{[\s\S]*?console\.error\("Manual link failed:", e\);[\s\S]*?\}[\s\S]*?\}/;

authCode = authCode.replace(manualLinkRegex, '');

fs.writeFileSync('src/auth.ts', authCode);
console.log("Removed manual linking code");
