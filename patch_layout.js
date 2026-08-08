const fs = require('fs');

let layoutCode = fs.readFileSync('src/app/layout.tsx', 'utf8');

const swScript = `
        <script dangerouslySetInnerHTML={{
          __html: \`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
          \`
        }} />
`;

if (!layoutCode.includes('registration.unregister()')) {
  // Insert right before </head> or right after <body>
  layoutCode = layoutCode.replace('<body className={`', swScript + '\n        <body className={`');
  fs.writeFileSync('src/app/layout.tsx', layoutCode);
  console.log("Successfully added SW unregister script to layout.tsx");
} else {
  console.log("SW script already exists in layout.tsx");
}
