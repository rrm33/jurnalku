const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/penilaian/[id]/page.js', 'utf8');

const brokenInit = `      const initialNilai = {};
      const initialJawaban = {};
      res.data.siswaList.forEach(siswa => {
        const pengumpulan = siswa.pengumpulanTugas && siswa.pengumpulanTugas.length > 0 ? siswa.pengumpulanTugas[0] : null;
        if (pengumpulan && pengumpulan.nilai !== null) {
          initialNilai[siswa.id] = pengumpulan.nilai.toString();
        } else {
          initialNilai[siswa.id] = "";
        }
        
        if (pengumpulan && pengumpulan.input_jawaban !== null) {
          initialJawaban[siswa.id] = pengumpulan.input_jawaban || "";
        } else {
          initialJawaban[siswa.id] = "";
        }
      });
      setNilaiState(initialNilai);
      setJawabanState(initialJawaban);
      setCatatanState(initialCatatan);`;

const fixedInit = `      const initialNilai = {};
      const initialJawaban = {};
      const initialCatatan = {};
      res.data.siswaList.forEach(siswa => {
        const pengumpulan = siswa.pengumpulanTugas && siswa.pengumpulanTugas.length > 0 ? siswa.pengumpulanTugas[0] : null;
        if (pengumpulan && pengumpulan.nilai !== null) {
          initialNilai[siswa.id] = pengumpulan.nilai.toString();
        } else {
          initialNilai[siswa.id] = "";
        }
        
        if (pengumpulan && pengumpulan.input_jawaban !== null) {
          initialJawaban[siswa.id] = pengumpulan.input_jawaban || "";
        } else {
          initialJawaban[siswa.id] = "";
        }

        if (pengumpulan && pengumpulan.catatan_guru !== null) {
          initialCatatan[siswa.id] = pengumpulan.catatan_guru || "";
        } else {
          initialCatatan[siswa.id] = "";
        }
      });
      setNilaiState(initialNilai);
      setJawabanState(initialJawaban);
      setCatatanState(initialCatatan);`;

content = content.replace(brokenInit, fixedInit);
fs.writeFileSync('src/app/beranda/penilaian/[id]/page.js', content);
console.log("Fixed initialCatatan!");
