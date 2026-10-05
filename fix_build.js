const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

content = content.replace(/onClick=\{handleCreateNew\}/g, "onClick={() => router.push('/beranda/rpp/form')}");

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
console.log("Fixed missing handleCreateNew ref!");
