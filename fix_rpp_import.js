const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

const importTarget = 'import { getRpps, deleteRpp, toggleStatusRpp, toggleActiveRpp, saveCatatanRpp } from "@/actions/rpp";';
content = content.replace(importTarget, importTarget + '\nimport { getKelas, getMapel } from "@/actions/master";');

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
console.log("Restored getKelas and getMapel imports!");
