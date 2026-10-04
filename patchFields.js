const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldLinkAccount = `return await prisma.account.create({ data: account });`;

const newLinkAccount = `const accountData = {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token || null,
          access_token: account.access_token || null,
          expires_at: account.expires_at || null,
          token_type: account.token_type || null,
          scope: account.scope || null,
          id_token: account.id_token || null,
          session_state: account.session_state || null,
        };
        return await prisma.account.create({ data: accountData });`;

authCode = authCode.replace(oldLinkAccount, newLinkAccount);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched linkAccount fields");
