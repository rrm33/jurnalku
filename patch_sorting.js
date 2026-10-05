const fs = require('fs');

// 1. rpp.js
let rppContent = fs.readFileSync('src/actions/rpp.js', 'utf8');
rppContent = rppContent.replace(/orderBy: \{ pertemuan_ke: "desc" \}/g, 'orderBy: { pertemuan_ke: "asc" }');
fs.writeFileSync('src/actions/rpp.js', rppContent);

// 2. penilaian.js
let penContent = fs.readFileSync('src/actions/penilaian.js', 'utf8');
penContent = penContent.replace(/orderBy: \{ id: 'desc' \}/g, 'orderBy: { pertemuan_ke: "asc" }');
fs.writeFileSync('src/actions/penilaian.js', penContent);

// 3. tugas-siswa.js
let tsContent = fs.readFileSync('src/actions/tugas-siswa.js', 'utf8');
tsContent = tsContent.replace(/orderBy: \{ id: "desc" \}/g, 'orderBy: { pertemuan_ke: "asc" }');
fs.writeFileSync('src/actions/tugas-siswa.js', tsContent);

console.log("Patched sorting successfully!");
