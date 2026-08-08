const fs = require('fs');

let configCode = fs.readFileSync('next.config.ts', 'utf8');

const oldConfig = `  experimental: {
    turbo: {
      resolveAlias: {}
    }
  }`;

const newConfig = `  turbopack: {}`;

if (configCode.includes(oldConfig)) {
  configCode = configCode.replace(oldConfig, newConfig);
  fs.writeFileSync('next.config.ts', configCode);
  console.log("Fixed turbopack key");
} else {
  console.log("Not found");
}
