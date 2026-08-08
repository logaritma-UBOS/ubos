const fs = require('fs');

// PATCH 1: Update WA API to accept dashboard_link
let waRoute = fs.readFileSync('src/app/api/wa/send/route.ts', 'utf8');

// Replace link dashboard logic in MODE SINGLE
const oldSingleLogic = `.replace(/{link_dashboard}/g, body.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member');`;
const newSingleLogic = `.replace(/{link_dashboard}/g, body.dashboard_link || (body.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member'));`;
waRoute = waRoute.replace(oldSingleLogic, newSingleLogic);

// Replace link dashboard logic in MODE BULK
const oldBulkLogic = `.replace(/{link_dashboard}/g, lead.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member');`;
const newBulkLogic = `.replace(/{link_dashboard}/g, lead.dashboard_link || (lead.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member'));`;
waRoute = waRoute.replace(oldBulkLogic, newBulkLogic);

fs.writeFileSync('src/app/api/wa/send/route.ts', waRoute);
console.log("Updated WA route");

// PATCH 2: Update page.tsx redirect and WA payload
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add dashboardLink to payload
const oldWaFetch = `        fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage,
            nama_usaha: formData.merchantName,
            funnel_destination: funnelDest
          })`;

const newWaFetch = `        const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
        const dashboardLink = isFnB ? \`https://logaritma.id/ubos/kuliner/\${slug}\` : 'https://logaritma.id/member';
        
        fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage,
            nama_usaha: formData.merchantName,
            funnel_destination: funnelDest,
            dashboard_link: dashboardLink
          })`;

pageCode = pageCode.replace(oldWaFetch, newWaFetch);

// Update error handling for redirect
const oldErrorCatch = `    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {`;
const newErrorCatch = `    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
      if (err.message && err.message.toLowerCase().includes('sudah terdaftar')) {
        setTimeout(() => {
          setShowModal(false);
          router.push('/auth');
        }, 1500);
      }
    } finally {`;
pageCode = pageCode.replace(oldErrorCatch, newErrorCatch);


fs.writeFileSync('src/app/page.tsx', pageCode);
console.log("Updated page.tsx");
