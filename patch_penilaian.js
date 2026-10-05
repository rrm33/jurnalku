const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/penilaian/page.js', 'utf8');

// Update useEffect to read from sessionStorage
const oldUseEffect = `  useEffect(() => {
    fetchData();
  }, []);`;

const newUseEffect = `  useEffect(() => {
    const saved = sessionStorage.getItem('penilaian_filter_kelas');
    if (saved) setSelectedFilterKelas(saved);
    fetchData();
  }, []);`;

content = content.replace(oldUseEffect, newUseEffect);

// Update select onChange
const oldSelect = `<select 
              value={selectedFilterKelas}
              onChange={(e) => setSelectedFilterKelas(e.target.value)}`;

const newSelect = `<select 
              value={selectedFilterKelas}
              onChange={(e) => {
                 setSelectedFilterKelas(e.target.value);
                 sessionStorage.setItem('penilaian_filter_kelas', e.target.value);
              }}`;

content = content.replace(oldSelect, newSelect);

fs.writeFileSync('src/app/beranda/penilaian/page.js', content);
console.log("Patched successfully!");
