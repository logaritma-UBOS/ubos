const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldAuthorize = `      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.passwordHash) {
          console.log("[AUTH DEBUG] User not found or no password hash for email:", email);
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        console.log("[AUTH DEBUG] Passwords match?", passwordsMatch);

        if (!passwordsMatch) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }`;

const newAuthorize = `      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const email = (credentials.email as string).trim().toLowerCase()
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.passwordHash) {
            console.log("[AUTH DEBUG] User not found or no password hash for email:", email);
            return null
          }

          let passwordsMatch = false;
          try {
            passwordsMatch = await bcrypt.compare(
              credentials.password as string,
              user.passwordHash
            )
          } catch (bcryptErr) {
            console.error("Bcrypt compare error:", bcryptErr);
            return null;
          }

          console.log("[AUTH DEBUG] Passwords match?", passwordsMatch);

          if (!passwordsMatch) return null

          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (err) {
          console.error("Authorize error:", err);
          return null; // Return null instead of throwing to prevent redirect to /api/auth/error
        }
      }`;

authCode = authCode.replace(oldAuthorize, newAuthorize);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched authorize callback");
