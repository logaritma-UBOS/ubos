const fs = require('fs');
const file = 'src/app/admin/pilot/(dashboard)/users/UsersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variables for blasting
const oldState = `    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDelegating, setIsDelegating] = useState(false);`;
const newState = `    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBlasting, setIsBlasting] = useState(false);
    const [blastProgress, setBlastProgress] = useState(0);
    const [isDelegating, setIsDelegating] = useState(false);`;
content = content.replace(oldState, newState);

// 2. Add handleMassBlast function
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

// 3. Update the header buttons
const oldHeader = `{selectedIds.length > 0 && (
                    <button 
                        onClick={handleDelegate}
                        disabled={isDelegating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        Delegasikan ke Bana ({selectedIds.length})
                    </button>
                )}`;
const newHeader = `{selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDelegate}
                            disabled={isDelegating || isBlasting}
                            className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            Delegasikan ({selectedIds.length})
                        </button>
                        <button 
                            onClick={handleMassBlast}
                            disabled={isBlasting || isDelegating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.898-9.898 0-5.45-4.449-9.898-9.896-9.898-5.45 0-9.898 4.448-9.898 9.898 0 1.956.49 3.633 1.517 5.205l1.011 1.536-1.127 4.12 4.225-1.11.98.555zm11.751-6.195c-.482-1.206-2.42-1.875-3.08-1.875-.662 0-1.066.86-1.166 1.002-.1.14-.144.382-.424.524-.282.14-1.258.463-2.408-.56-.893-.794-1.498-1.77-1.673-2.072-.175-.3-.021-.462.115-.595.127-.123.275-.316.415-.472.138-.158.183-.267.275-.444.092-.178.046-.334-.022-.475-.068-.142-.614-1.478-.84-2.023-.222-.533-.448-.46-.614-.468-.157-.008-.337-.01-.518-.01-.183 0-.48.067-.732.34-.25.27-1.218 1.192-1.218 2.906 0 1.713 1.25 3.37 1.42 3.593.172.223 2.453 3.743 5.94 5.2 3.488 1.458 3.488.971 4.103.902.615-.069 1.98-.808 2.259-1.588.278-.779.278-1.448.194-1.588z"/></svg>
                            {isBlasting ? "Blasting (" + blastProgress + "/" + selectedIds.length + ")" : "Blast WA Pribadi (" + selectedIds.length + ")"}
                        </button>
                    </div>
                )}`;
content = content.replace(oldHeader, newHeader);

fs.writeFileSync(file, content);
console.log('Successfully injected Mass WA Blast feature!');
