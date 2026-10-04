const fs = require('fs');

let pageCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');

pageCode = pageCode.replace(
  `export default function LoginPage() {`,
  `import { Suspense } from 'react';\n\nfunction LoginContent() {`
);

pageCode += `\n\nexport default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-5 sm:px-6 lg:px-8"><div className="sm:mx-auto sm:w-full sm:max-w-md text-center">Memuat...</div></div>}>
      <LoginContent />
    </Suspense>
  )
}\n`;

fs.writeFileSync('src/app/login/page.tsx', pageCode);
console.log("Added Suspense");
