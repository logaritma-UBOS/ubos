const fs = require('fs');
const glob = require('glob');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace query strings first
  content = content.replace(/\/auth\?mode=register&category=([^\"'\`]+)/g, '/auth/daftar?category=$1');
  content = content.replace(/\/auth\?mode=register/g, '/auth/daftar');
  content = content.replace(/\/auth\?mode=login/g, '/auth/login');
  
  // Replace string literals '/auth'
  content = content.replace(/['"`]\/auth['"`]/g, (match) => {
    const quote = match[0];
    return quote + '/auth/login' + quote;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
};

const files = glob.sync('src/**/*.tsx');
files.forEach(replaceInFile);
