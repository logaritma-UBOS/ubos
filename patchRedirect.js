const fs = require('fs');

let authCode = fs.readFileSync('src/auth.ts', 'utf8');

const oldRedirect = `    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return \`\${baseUrl}\${url}\`
      else if (new URL(url).origin === baseUrl) return url
      return \`\${baseUrl}/\`
    }`;

const newRedirect = `    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith("/")) return \`\${baseUrl}\${url}\`
        else if (new URL(url).origin === baseUrl) return url
        return \`\${baseUrl}/\`
      } catch (e) {
        return \`\${baseUrl}/\`
      }
    }`;

authCode = authCode.replace(oldRedirect, newRedirect);

fs.writeFileSync('src/auth.ts', authCode);
console.log("Patched redirect");
