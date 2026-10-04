const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldSignIn = `async signIn({ user, account }) {
      
      

      const ALLOWED_EMAILS = [
        "logaritma.tim@gmail.com",
        "tony@logaritma.id",
        "reza@logaritma.id",
        "bana@logaritma.id",
        "baim@logaritma.id"
      ];
      
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          const userEmailLower = user.email.toLowerCase();
          const isPilot = ALLOWED_EMAILS.includes(userEmailLower);
          
          if (isPilot) {
            const { logPilotActivityRaw } = await import("./lib/pilotAudit");
            await logPilotActivityRaw(dbUser?.name || user.name || "Admin", user.email, "Login ke Dasbor Pilot", "Sesi otorisasi kokpit baru saja dimulai via " + (account?.provider === "google" ? "Google" : "Kredensial") + ".");
          }
          
          if (dbUser) {
              await prisma.user.update({
                  where: { email: user.email },
                  data: { lastLogin: new Date() }
              });
          }
        } catch (e) {
          console.error("Failed to track login:", e);
        }
      }
      return true;
    },`;

const newSignIn = `async signIn({ user, account }) {
      try {
        const ALLOWED_EMAILS = [
          "logaritma.tim@gmail.com",
          "tony@logaritma.id",
          "reza@logaritma.id",
          "bana@logaritma.id",
          "baim@logaritma.id"
        ];
        
        if (user?.email) {
          try {
            const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
            const userEmailLower = user.email.toLowerCase();
            const isPilot = ALLOWED_EMAILS.includes(userEmailLower);
            
            if (isPilot) {
              const { logPilotActivityRaw } = await import("./lib/pilotAudit");
              await logPilotActivityRaw(dbUser?.name || user.name || "Admin", user.email, "Login ke Dasbor Pilot", "Sesi otorisasi kokpit baru saja dimulai via " + (account?.provider === "google" ? "Google" : "Kredensial") + ".");
            }
            
            if (dbUser) {
                await prisma.user.update({
                    where: { email: user.email },
                    data: { lastLogin: new Date() }
                });
            }
          } catch (e) {
            console.error("Failed to track login:", e);
          }
        }
        return true;
      } catch (fatalErr) {
        console.error("Fatal error in signIn callback:", fatalErr);
        return true; // Still allow login even if audit crashes
      }
    },`;

authCode = authCode.replace(oldSignIn, newSignIn);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched signIn callback");
