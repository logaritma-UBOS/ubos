const fs = require('fs');
const file = 'src/app/admin/pilot/(dashboard)/users/UsersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add currentUserName to props
content = content.replace('export default function UsersClient({ users, currentUserEmail }: { users: any[], currentUserEmail?: string }) {', 'export default function UsersClient({ users, currentUserEmail, currentUserName }: { users: any[], currentUserEmail?: string, currentUserName?: string }) {');

// Fix copywriting
const oldMsgCode = `        const handleFollowUpWA = async (user: any) => {
        if (!user.phone) return alert("User tidak memiliki nomor WA");
        
        let autoMsg = \`Halo kak ,\`;
        if (user.computedStatus === "PASIF") {
          autoMsg += \` kami dari UBOS melihat kakak sudah lebih dari seminggu tidak login ke sistem. Apakah ada kendala atau butuh bantuan kami?\`;
        } else if (user.computedStatus === "NEW") {
          autoMsg += \` selamat datang di UBOS! Kami siap mendampingi kakak membangun ekosistem bisnis digital.\`;
        } else {
          autoMsg += \` semoga harinya menyenangkan! Kami lihat kakak sangat aktif menggunakan UBOS. Jika butuh upgrade atau bantuan, kabari kami ya.\`;
        }`;

const newMsgCode = `        const handleFollowUpWA = async (user: any) => {
        if (!user.phone) return alert("User tidak memiliki nomor WA");
        
        const sender = currentUserName ? currentUserName.split(' ')[0] : 'Tim';
        const userName = user.name || 'Pebisnis';
        
        let autoMsg = \`Halo kak \${userName}, saya \${sender} dari UBOS. \`;
        if (user.crmStatus === "PASIF") {
          autoMsg += \`Kami melihat kakak sudah beberapa waktu tidak login ke sistem. Apakah ada kendala atau butuh bantuan kami untuk mengembangkan bisnis kakak hari ini?\`;
        } else if (user.crmStatus === "NEW") {
          autoMsg += \`Selamat datang di UBOS! Kami siap mendampingi kakak membangun ekosistem bisnis digital. Jika ada pertanyaan, jangan ragu untuk balas pesan ini ya.\`;
        } else {
          autoMsg += \`Semoga harinya menyenangkan! Kami lihat kakak sangat aktif menggunakan UBOS. Jika butuh panduan fitur atau bantuan lainnya, kabari kami ya.\`;
        }`;

// Replace computedStatus with crmStatus because computedStatus doesn't exist on User object natively in this view, it's computed as crmStatus!
content = content.replace(oldMsgCode, newMsgCode);

fs.writeFileSync(file, content);
console.log('Fixed UsersClient copywriting!');
