const fs = require('fs');
let file = 'src/hooks/useAILogaritmaEngine.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  /let activeMerchantId = merchantId;\s*if \(!activeMerchantId\) \{\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);\s*if \(!user\) return;\s*const \{ data: merchant \} = await supabase\s*\.from\('merchants'\)\s*\.select\('id, kategori_usaha, created_at'\)\s*\.eq\('user_id', user\.id\)\s*\.single\(\);\s*if \(!merchant\) return;\s*activeMerchantId = merchant\.id;\s*\}/,
  \let activeMerchantId = merchantId;
      let activeMerchant = null;
      if (!activeMerchantId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase
          .from('merchants')
          .select('id, kategori_usaha, created_at')
          .eq('user_id', user.id)
          .single();

        if (!merchant) return;
        activeMerchantId = merchant.id;
        activeMerchant = merchant;
      } else {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id, kategori_usaha, created_at')
          .eq('id', activeMerchantId)
          .single();
        activeMerchant = merchant;
      }\
);

c = c.replace(/merchant\?/g, "activeMerchant?");

fs.writeFileSync(file, c);
console.log('Patched useAILogaritmaEngine outer scope');
