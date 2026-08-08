const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace router.push(`/ubos`) with router.push(`/ubos/kuliner/${slug}`)
// Wait, we need to define slug.
const replacement = `      if (isFnB) {
        toast.success("Berhasil! Mengalihkan ke Dashboard UBOS...");
        const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
        router.push(\`/ubos/kuliner/\${slug}\`);
      } else {`;

pageCode = pageCode.replace(/      if \(isFnB\) \{\s+toast\.success\("Berhasil! Mengalihkan ke Dashboard UBOS\.\.\."\);\s+router\.push\(`\/ubos`\);\s+\} else \{/, replacement);

// There are TWO places where `isFnB` logic exists for router.push(`/ubos`).
// The second one is inside `if (!result.isNew) { ... }`
const replacement2 = `        if (result.data?.funnel_destination === 'UBOS' || isFnB) {
          const slug = formData.merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
          router.push(\`/ubos/kuliner/\${slug}\`);
        } else {`;

pageCode = pageCode.replace(/        if \(result\.data\?\.funnel_destination === 'UBOS' \|\| isFnB\) \{\s+router\.push\(`\/ubos`\);\s+\} else \{/, replacement2);


fs.writeFileSync('src/app/page.tsx', pageCode);
console.log("Updated redirects in page.tsx");
