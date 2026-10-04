const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldLinkAccount = `    linkAccount: async (account) => {
      try {
        if (account.expires_at && typeof account.expires_at === 'number') {
          // Ensure it fits in 32-bit int
          if (account.expires_at > 2147483647) {
            account.expires_at = Math.floor(account.expires_at / 1000);
          }
        }
        
        // Manual linking check to prevent P2002
        const existing = await prisma.account.findUnique({
           where: {
             provider_providerAccountId: {
               provider: account.provider,
               providerAccountId: account.providerAccountId
             }
           }
        });
        if (existing) return existing;
        
        const accountData = {
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
        return await prisma.account.create({ data: accountData });
      } catch (err) {
        console.error("PrismaAdapter linkAccount Error:", err);
        throw err;
      }
    },`;

const newLinkAccount = `    linkAccount: async (account) => {
      try {
        // Safely parse expires_at to integer
        let expiresAtInt = null;
        if (account.expires_at != null) {
          expiresAtInt = typeof account.expires_at === 'string' ? parseInt(account.expires_at, 10) : Number(account.expires_at);
          if (!isNaN(expiresAtInt) && expiresAtInt > 2147483647) {
            expiresAtInt = Math.floor(expiresAtInt / 1000);
          }
        }
        
        // Manual linking check to prevent P2002
        const existing = await prisma.account.findUnique({
           where: {
             provider_providerAccountId: {
               provider: account.provider,
               providerAccountId: account.providerAccountId
             }
           }
        });
        if (existing) return existing as any;
        
        const accountData = {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token || null,
          access_token: account.access_token || null,
          expires_at: isNaN(expiresAtInt as number) ? null : expiresAtInt,
          token_type: account.token_type || null,
          scope: account.scope || null,
          id_token: account.id_token || null,
          session_state: (account.session_state as string) || null,
        };
        
        return await prisma.account.create({ data: accountData }) as any;
      } catch (err) {
        console.error("PrismaAdapter linkAccount Error:", err);
        // Log to support messages so we can see it in DB
        try {
           await prisma.supportMessage.create({
             data: {
               name: "Auth Error",
               email: "error@ubos.logaritma.id",
               message: "linkAccount Error: " + (err instanceof Error ? err.message : String(err))
             }
           })
        } catch(e) {}
        throw err;
      }
    },`;

authCode = authCode.replace(oldLinkAccount, newLinkAccount);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched linkAccount parsing");
