const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const adapterRegex = /adapter: \{\s*\.\.\.PrismaAdapter\(prisma\),\s*createUser: async \(data\) => \{[\s\S]*?\},?\s*\}/;

const newAdapter = `adapter: {
    ...PrismaAdapter(prisma),
    createUser: async (data) => {
      return prisma.user.create({
        data: {
          ...data,
          passwordHash: "",
        },
      })
    },
    linkAccount: async (account) => {
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
        
        return await prisma.account.create({ data: account });
      } catch (err) {
        console.error("PrismaAdapter linkAccount Error:", err);
        throw err;
      }
    }
  }`;

authCode = authCode.replace(adapterRegex, newAdapter);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched linkAccount in adapter");
