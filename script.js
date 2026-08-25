const fs = require('fs');
let file = 'src/components/BottomNav.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/<Link \n                  key=\{item.name\} \n                  href=\{item.href\}\n                  className="flex flex-col items-center justify-center w-full h-full/g, 
  "<Link \n                  key={item.name} \n                  href={item.href}\n                  prefetch={true}\n                  className=\"flex flex-col items-center justify-center w-full h-full");

c = c.replace(/<Link \n                key=\{item.name\} \n                href=\{item.href\}\n                className=\{\lex flex-col items-center justify-center/g, 
  "<Link \n                key={item.name} \n                href={item.href}\n                prefetch={true}\n                className={lex flex-col items-center justify-center");

c = c.replace(/<Link \n                  key=\{item.href\}\n                  href=\{item.href\}\n                  onClick=\{/g, 
  "<Link \n                  key={item.href}\n                  href={item.href}\n                  prefetch={true}\n                  onClick={");

fs.writeFileSync(file, c);
console.log('Prefetch added to BottomNav');
