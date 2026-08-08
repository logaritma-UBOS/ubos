const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

// Patch 1: New User Success
const oldNewUserSuccess = `      setShowModal(false);

      const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
      const targetLink = isFnB ? \`/ubos/kuliner/\${slug}\` : '/member';
      setDashboardLink(targetLink);
      setShowWelcomePopup(true);`;

const newNewUserSuccess = `      setShowModal(false);

      // SET WA MEMBER SESSION TO BYPASS LOGIN ON DASHBOARD
      localStorage.setItem('wa_member_session', JSON.stringify({
        no_wa: cleanWA,
        nama_usaha: formData.merchantName,
        kategori: formData.category
      }));

      const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
      const targetLink = isFnB ? \`/ubos/kuliner/\${slug}\` : '/member';
      setDashboardLink(targetLink);
      setShowWelcomePopup(true);`;

pageCode = pageCode.replace(oldNewUserSuccess, newNewUserSuccess);

// Patch 2: Existing User Success (wrong password falls into catch block anyway)
const oldExistingUserSuccess = `      if (!result.isNew) {
        // PENANGANAN USER LAMA (EXISTING USER)
        setShowModal(false);
        toast.success("Login berhasil! Mengalihkan...");
        
        if (result.data?.funnel_destination === 'UBOS' || isFnB) {`;

const newExistingUserSuccess = `      if (!result.isNew) {
        // PENANGANAN USER LAMA (EXISTING USER)
        setShowModal(false);
        toast.success("Login berhasil! Mengalihkan...");
        
        localStorage.setItem('wa_member_session', JSON.stringify({
          no_wa: cleanWA,
          nama_usaha: formData.merchantName,
          kategori: formData.category
        }));

        if (result.data?.funnel_destination === 'UBOS' || isFnB) {`;

pageCode = pageCode.replace(oldExistingUserSuccess, newExistingUserSuccess);

fs.writeFileSync('src/app/page.tsx', pageCode);
console.log('Added session bypass to page.tsx');
