const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/leger/page.js', 'utf8');

const oldUseEffect = `  useEffect(() => {
    fetchOptions();
  }, []);`;

const newUseEffect = `  useEffect(() => {
    const savedMapel = sessionStorage.getItem('leger_mapel');
    const savedKelas = sessionStorage.getItem('leger_kelas');
    if (savedMapel) setSelectedMapel(savedMapel);
    if (savedKelas) setSelectedKelas(savedKelas);
    fetchOptions();
  }, []);`;
content = content.replace(oldUseEffect, newUseEffect);

// selectedMapel select
const oldSelectMapel = `value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)}`;
const newSelectMapel = `value={selectedMapel} onChange={e => { setSelectedMapel(e.target.value); sessionStorage.setItem('leger_mapel', e.target.value); }}`;
content = content.replace(oldSelectMapel, newSelectMapel);

// selectedKelas select
const oldSelectKelas = `value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}`;
const newSelectKelas = `value={selectedKelas} onChange={e => { setSelectedKelas(e.target.value); sessionStorage.setItem('leger_kelas', e.target.value); }}`;
content = content.replace(oldSelectKelas, newSelectKelas);

fs.writeFileSync('src/app/beranda/leger/page.js', content);
console.log("Patched Leger successfully!");
