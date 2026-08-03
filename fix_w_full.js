const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('page.tsx')) results.push(file);
  });
  return results;
}

const files = walk('src/app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Regex to remove w-full from the specific header class definition
  content = content.replace(/header className="fixed top-0 z-40 bg-primary shadow-md max-w-md md:max-w-none w-full/g, 'header className="fixed top-0 z-40 bg-primary shadow-md max-w-md md:max-w-none');
  
  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
console.log('Done');
