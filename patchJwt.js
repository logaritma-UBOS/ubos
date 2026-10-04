const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldJwt = `async jwt({ token, user, account }) {
      const currentDayStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric", month: "numeric", day: "numeric"
      }).format(new Date());

      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.staffBusinessId = (user as any).staffBusinessId || null
        
        // Coba ambil dari DB jika oauth
        if (!(user as any).staffBusinessId) {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
          if (dbUser) {
            token.role = dbUser.role
            token.staffBusinessId = dbUser.staffBusinessId
          }
        }
        
        // Simpan hari login untuk fitur "Wajib login tiap hari" (Reset tengah malam)
        token.loginDateStr = currentDayStr;
      }
      
      // Paksa logout jika:
      // 1. Tanggal login di token berbeda dengan tanggal hari ini (sudah ganti hari)
      // 2. Atau token ini dari sesi lama (sebelum ada fitur loginDateStr)
      if (!token.loginDateStr || token.loginDateStr !== currentDayStr) {
         // Hari berganti atau token tidak valid! Logout otomatis
         return { _expired: true } as any; // Return explicitly expired token
      }
      
      return token
    },`;

const newJwt = `async jwt({ token, user, account }) {
      try {
        const currentDayStr = new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric", month: "numeric", day: "numeric"
        }).format(new Date());

        if (user) {
          token.id = user.id
          token.email = user.email
          token.role = user.role
          token.staffBusinessId = (user as any).staffBusinessId || null
          
          try {
            if (!(user as any).staffBusinessId && user.id) {
              const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
              if (dbUser) {
                token.role = dbUser.role
                token.staffBusinessId = dbUser.staffBusinessId
              }
            }
          } catch (dbErr) {
            console.error("JWT DB Lookup Error:", dbErr);
          }
          
          token.loginDateStr = currentDayStr;
        }
        
        if (!token.loginDateStr || token.loginDateStr !== currentDayStr) {
           return { _expired: true } as any;
        }
        
        return token
      } catch (err) {
        console.error("JWT Callback Fatal Error:", err);
        return token;
      }
    },`;

authCode = authCode.replace(oldJwt, newJwt);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched jwt callback");
