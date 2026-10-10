const fs = require('fs');
const file = 'src/app/admin/pilot/(dashboard)/users/UsersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variables (Regex)
content = content.replace(
    /const \[selectedIds, setSelectedIds\] = useState<string\[\]>\(\[\]\);\s*const \[isDelegating, setIsDelegating\] = useState\(false\);/,
    `const [selectedIds, setSelectedIds] = useState<string[]>([]);\n    const [isBlasting, setIsBlasting] = useState(false);\n    const [blastProgress, setBlastProgress] = useState(0);\n    const [isDelegating, setIsDelegating] = useState(false);`
);

// Oh wait, did I accidentally duplicate handleMassBlast earlier?
// Let's remove ALL instances of handleMassBlast first!
content = content.replace(/const handleMassBlast = async \(\) => \{[\s\S]*?alert\("Berhasil mem-blast " \+ selectedIds\.length \+ " pesan WA secara otomatis!"\);\n    \}\n/g, '');

const massBlastCode = `
    const handleMassBlast = async () => {
        if (selectedIds.length === 0) return;
        const confirmBlast = confirm("Anda akan mem-blast pesan ke " + selectedIds.length + " user secara otomatis dengan jeda 5-10 detik. Pastikan WhatsApp Anda terhubung. Lanjutkan?");
        if (!confirmBlast) return;

        setIsBlasting(true);
        setBlastProgress(0);

        for (let i = 0; i < selectedIds.length; i++) {
            const userId = selectedIds[i];
            const user = users.find(u => u.id === userId);
            
            if (!canFollowUp(user)) {
                setBlastProgress(i + 1);
                continue;
            }

            if (user && user.phone) {
                setLoadingWa(userId);
                
                const sender = currentUserName ? currentUserName.split(' ')[0] : 'Tim';
                const userName = user.name || 'Pebisnis';
                
                let autoMsg = "Halo kak " + userName + ", saya " + sender + " dari UBOS. ";
                if (user.crmStatus === "PASIF") {
                  autoMsg += "Kami melihat kakak sudah beberapa waktu tidak login ke sistem. Apakah ada kendala atau butuh bantuan kami untuk mengembangkan bisnis kakak hari ini?";
                } else if (user.crmStatus === "NEW") {
                  autoMsg += "Selamat datang di UBOS! Kami siap mendampingi kakak membangun ekosistem bisnis digital. Jika ada pertanyaan, jangan ragu untuk balas pesan ini ya.";
                } else {
                  autoMsg += "Semoga harinya menyenangkan! Kami lihat kakak sangat aktif menggunakan UBOS. Jika butuh panduan fitur atau bantuan lainnya, kabari kami ya.";
                }

                const res = await sendWaBana(user.phone, autoMsg);
                if (!res?.error) {
                    await recordFollowUp(user.id);
                    user.followUpCount = (user.followUpCount || 0) + 1;
                }
                
                setLoadingWa(null);
            }
            
            setBlastProgress(i + 1);
            
            if (i < selectedIds.length - 1) {
                const delayMs = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000); // 5-10s delay
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        setIsBlasting(false);
        setSelectedIds([]);
        alert("Berhasil mem-blast " + selectedIds.length + " pesan WA secara otomatis!");
    }

    const handleFollowUpWA`;

content = content.replace('    const handleFollowUpWA', massBlastCode);

fs.writeFileSync(file, content);
console.log('Fixed states and removed duplicates!');
