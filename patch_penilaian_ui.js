const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/penilaian/[id]/page.js', 'utf8');

// 1. Add catatanState
const oldState = `  const [nilaiState, setNilaiState] = useState({});
  const [jawabanState, setJawabanState] = useState({});`;

const newState = `  const [nilaiState, setNilaiState] = useState({});
  const [jawabanState, setJawabanState] = useState({});
  const [catatanState, setCatatanState] = useState({});`;

content = content.replace(oldState, newState);

// 2. Initialize catatanState
const oldInit = `        if (pengumpulan && pengumpulan.nilai !== null) {
          initialNilai[siswa.id] = pengumpulan.nilai.toString();
        } else {
          initialNilai[siswa.id] = "";
        }
        
        if (pengumpulan && pengumpulan.input_jawaban !== null) {
          initialJawaban[siswa.id] = pengumpulan.input_jawaban;
        } else {
          initialJawaban[siswa.id] = "";
        }`;

const newInit = `        if (pengumpulan && pengumpulan.nilai !== null) {
          initialNilai[siswa.id] = pengumpulan.nilai.toString();
        } else {
          initialNilai[siswa.id] = "";
        }
        
        if (pengumpulan && pengumpulan.input_jawaban !== null) {
          initialJawaban[siswa.id] = pengumpulan.input_jawaban;
        } else {
          initialJawaban[siswa.id] = "";
        }
        
        if (pengumpulan && pengumpulan.catatan_guru !== null) {
          initialCatatan[siswa.id] = pengumpulan.catatan_guru;
        } else {
          initialCatatan[siswa.id] = "";
        }`;

content = content.replace(oldInit, `      const initialCatatan = {};\n` + newInit);
content = content.replace(`setJawabanState(initialJawaban);`, `setJawabanState(initialJawaban);\n      setCatatanState(initialCatatan);`);

// 3. Add handleCatatanChange
const oldHandle = `  const handleJawabanChange = (siswaId, value) => {
    setJawabanState(prev => ({ ...prev, [siswaId]: value }));
  };`;

const newHandle = `  const handleJawabanChange = (siswaId, value) => {
    setJawabanState(prev => ({ ...prev, [siswaId]: value }));
  };
  
  const handleCatatanChange = (siswaId, value) => {
    setCatatanState(prev => ({ ...prev, [siswaId]: value }));
  };`;
content = content.replace(oldHandle, newHandle);

// 4. Send catatan in payload
const oldPayload = `        nilai: (nilaiState[sId] === undefined || nilaiState[sId] === "") ? null : parseInt(nilaiState[sId]),
        jawaban: jawabanState[sId] || ""
      };`;
const newPayload = `        nilai: (nilaiState[sId] === undefined || nilaiState[sId] === "") ? null : parseInt(nilaiState[sId]),
        jawaban: jawabanState[sId] || "",
        catatan: catatanState[sId] || ""
      };`;
content = content.replace(oldPayload, newPayload);

// 5. Update the UI to render readonly student answer and a box for catatan
const oldUI = `                    <td className="p-4">
                      <div className="space-y-2">
                        <textarea
                          value={jawabanState[siswa.id] ?? ""}
                          onChange={(e) => handleJawabanChange(siswa.id, e.target.value)}
                          placeholder="Ketik atau edit jawaban siswa..."
                          className="w-full text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 min-h-[60px] max-h-32 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all custom-scrollbar whitespace-pre-wrap"
                        />`;

const newUI = `                    <td className="p-4">
                      <div className="space-y-3">
                        {/* Teks Jawaban Siswa (Read-only) */}
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 min-h-[40px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                           {jawabanState[siswa.id] ? jawabanState[siswa.id] : <span className="italic text-slate-400">Tidak ada teks jawaban.</span>}
                        </div>
                        
                        {/* Input Tanggapan Guru */}
                        <textarea
                          value={catatanState[siswa.id] ?? ""}
                          onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                          placeholder="Beri tanggapan/catatan untuk siswa..."
                          className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-200 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-400"
                        />`;
content = content.replace(oldUI, newUI);

fs.writeFileSync('src/app/beranda/penilaian/[id]/page.js', content);
console.log("Patched UI successfully!");
