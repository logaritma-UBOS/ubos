const fs = require('fs');

// --- 1. Fix Margin in src/app/page.tsx ---
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldHeroClass = 'className="pt-5 sm:pt-8 pb-8 sm:pb-12 px-4 sm:px-6 max-w-4xl mx-auto text-center"';
const newHeroClass = 'className="pt-5 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 max-w-4xl mx-auto text-center"';

const oldSectionClass = 'className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-900 text-white relative border-y-8 border-blue-600 overflow-hidden"';
const newSectionClass = 'className="pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 bg-slate-900 text-white relative border-y-8 border-blue-600 overflow-hidden"';

pageCode = pageCode.replace(oldHeroClass, newHeroClass);
pageCode = pageCode.replace(oldSectionClass, newSectionClass);
fs.writeFileSync('src/app/page.tsx', pageCode);

// --- 2. Fix Auth Login in src/app/auth/page.tsx ---
let authCode = fs.readFileSync('src/app/auth/page.tsx', 'utf8');

const oldAuthLogic = `        // Fallback: Jika gagal dan user memasukkan 08..., coba login dengan 08... (legacy support)
        if (signInError && whatsapp.replace(/\\D/g, '').startsWith('0')) {
          const rawWA = whatsapp.replace(/\\D/g, '');
          const legacyDummyEmail = \`\${rawWA}@logaritma.id\`;
          const legacyRes = await supabase.auth.signInWithPassword({ email: legacyDummyEmail, password });
          if (!legacyRes.error) {
            signInError = null;
            data = legacyRes.data;
          }
        }

        if (signInError) throw new Error('Nomor WA atau password salah. Silakan coba lagi.');`;

const newAuthLogic = `        // Fallback: Jika gagal dan user memasukkan 08..., coba login dengan 08... (legacy support)
        if (signInError && whatsapp.replace(/\\D/g, '').startsWith('0')) {
          const rawWA = whatsapp.replace(/\\D/g, '');
          const legacyDummyEmail = \`\${rawWA}@logaritma.id\`;
          const legacyRes = await supabase.auth.signInWithPassword({ email: legacyDummyEmail, password });
          if (!legacyRes.error) {
            signInError = null;
            data = legacyRes.data;
          }
        }

        // Fallback 2: Check leads table (jika user baru daftar via Landing Page tapi belum punya auth account)
        if (signInError) {
          const { data: leadData } = await supabase.from('leads').select('*').eq('no_wa', cleanWA).eq('password_session', password).maybeSingle();
          if (leadData) {
            // Auto-create auth account from lead
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: dummyEmail,
              password,
            });
            
            if (signUpError) throw new Error('Gagal memigrasi akun dari pendaftaran awal: ' + signUpError.message);
            
            if (signUpData.user) {
              await supabase.from('merchants').insert([{
                user_id: signUpData.user.id,
                nama_usaha: leadData.nama_usaha,
                kategori_usaha: leadData.kategori || 'kuliner',
                whatsapp: cleanWA,
              }]);
              
              signInError = null;
              data = signUpData;
            }
          }
        }

        if (signInError) throw new Error('Nomor WA atau password salah. Silakan coba lagi.');`;

authCode = authCode.replace(oldAuthLogic, newAuthLogic);
fs.writeFileSync('src/app/auth/page.tsx', authCode);

console.log("Fixes applied.");
