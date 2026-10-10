const fs = require('fs');
const file = 'src/auth.ts';
let content = fs.readFileSync(file, 'utf8');

const hook = `await logPilotActivityRaw(dbUser?.name || user.name || "Admin", user.email, "Login ke Dasbor Pilot", "Sesi otorisasi kokpit baru saja dimulai via " + (account?.provider === "google" ? "Google" : "Kredensial") + ".");
                
                // NOTIFY VIA WA GATEWAY
                try {
                  const tm = await prisma.teamMember.findUnique({ where: { email: userEmailLower } });
                  if (tm) {
                    const message = \`Laporan Login!\n\nNama: ${tm.name}\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\nStatus: Berhasil masuk ke kokpit UBOS.\`;
                    await fetch(\`http://202.155.94.170:3000/send-message?session=team_${tm.id}\`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: '120363427940625422@g.us', text: message })
                    }).catch(e => console.error("WA Login Notify Error:", e));
                  }
                } catch(e) {}
`;

content = content.replace('await logPilotActivityRaw(dbUser?.name || user.name || "Admin", user.email, "Login ke Dasbor Pilot", "Sesi otorisasi kokpit baru saja dimulai via " + (account?.provider === "google" ? "Google" : "Kredensial") + ".");', hook);

fs.writeFileSync(file, content);
console.log('Login hook added to auth.ts');
