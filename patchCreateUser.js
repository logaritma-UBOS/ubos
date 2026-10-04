const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldCreateUser = `    createUser: async (data) => {
      return prisma.user.create({
        data: {
          ...data,
          passwordHash: "",
        },
      })
    },`;

const newCreateUser = `    createUser: async (data) => {
      return prisma.user.create({
        data: {
          id: data.id,
          name: data.name || null,
          email: data.email,
          emailVerified: data.emailVerified || null,
          image: data.image || null,
          passwordHash: "",
        },
      })
    },`;

authCode = authCode.replace(oldCreateUser, newCreateUser);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched createUser fields");
