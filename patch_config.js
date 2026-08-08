const fs = require('fs');

let configCode = fs.readFileSync('next.config.ts', 'utf8');

const newConfig = `import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix Turbopack error when using webpack plugins (like next-pwa)
  experimental: {
    turbo: {
      resolveAlias: {}
    }
  }
};

export default withPWA(nextConfig);
`;

fs.writeFileSync('next.config.ts', newConfig);
console.log("Updated next.config.ts");
