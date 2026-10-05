const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

const oldUseEffect = `  useEffect(() => {
    fetchData();
  }, []);`;

const newUseEffect = `  useEffect(() => {
    const saved = sessionStorage.getItem('rpp_filter_kelas');
    if (saved) setSelectedFilterKelas(saved);
    fetchData();
  }, []);`;
content = content.replace(oldUseEffect, newUseEffect);

// Update select onChange (there are two selects in rpp, one hidden md:block, one w-full)
const oldSelect1 = `            value={selectedFilterKelas}
            onChange={(e) => setSelectedFilterKelas(e.target.value)}
            className="hidden md:block`;

const newSelect1 = `            value={selectedFilterKelas}
            onChange={(e) => {
               setSelectedFilterKelas(e.target.value);
               sessionStorage.setItem('rpp_filter_kelas', e.target.value);
            }}
            className="hidden md:block`;
content = content.replace(oldSelect1, newSelect1);

const oldSelect2 = `          value={selectedFilterKelas}
          onChange={(e) => setSelectedFilterKelas(e.target.value)}
          className="w-full bg-white`;

const newSelect2 = `          value={selectedFilterKelas}
          onChange={(e) => {
             setSelectedFilterKelas(e.target.value);
             sessionStorage.setItem('rpp_filter_kelas', e.target.value);
          }}
          className="w-full bg-white`;
content = content.replace(oldSelect2, newSelect2);

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
console.log("Patched RPP successfully!");
