const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldCreate = `    createUser: async (data) => {
      return prisma.user.create({
        data: {
          id: data.id,
          name: data.name || null,
          email: data.email,
          emailVerified: typeof data.emailVerified === 'boolean' ? (data.emailVerified ? new Date() : null) : (data.emailVerified ? new Date(data.emailVerified) : null),
          image: data.image || null,
          passwordHash: "",
        },
      })
    },`;

const newCreate = `    createUser: async (data) => {
      try {
        return await prisma.user.create({
          data: {
            id: data.id,
            name: data.name || null,
            email: data.email,
            emailVerified: typeof data.emailVerified === 'boolean' ? (data.emailVerified ? new Date() : null) : (data.emailVerified ? new Date(data.emailVerified) : null),
            image: data.image || null,
            passwordHash: "",
          },
        })
      } catch (err) {
        console.error("PrismaAdapter createUser Error:", err);
        throw err;
      }
    },`;

authCode = authCode.replace(oldCreate, newCreate);
fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched createUser try catch");
