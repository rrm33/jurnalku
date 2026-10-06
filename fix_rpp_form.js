const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/form/page.js', 'utf8');

// 1. Fix state declaration
content = content.replace(/ada_tugas: false,\n\s*gunakan_code_editor: false,\n\s*batas_waktu_tugas: ""/,
`ada_tugas: false,
    judul_tugas: "",
    deskripsi_tugas: "",
    deadline_tugas: "",
    existing_file_tugas: "",
    gunakan_code_editor: false`);

// 2. Add fileTugas input state
content = content.replace(/const \[selectedFile, setSelectedFile\] = useState\(null\);/, 
  'const [selectedFile, setSelectedFile] = useState(null);\n  const [selectedFileTugas, setSelectedFileTugas] = useState(null);');

// 3. Fix data fetch initialization
const fetchOld = `ada_tugas: rpp.is_tugas,
          gunakan_code_editor: tugas ? tugas.gunakan_code_editor : false,
          batas_waktu_tugas: rpp.batas_waktu_tugas ? new Date(rpp.batas_waktu_tugas).toISOString().slice(0, 16) : ""`;
const fetchNew = `ada_tugas: !!tugas,
          judul_tugas: tugas ? tugas.judul : "",
          deskripsi_tugas: tugas ? tugas.deskripsi : "",
          deadline_tugas: tugas && tugas.deadline ? new Date(new Date(tugas.deadline).getTime() + (7 * 60 * 60 * 1000)).toISOString().slice(0, 16) : "",
          existing_file_tugas: tugas ? (tugas.file || "") : "",
          gunakan_code_editor: tugas ? (tugas.gunakan_code_editor || false) : false`;
content = content.replace(fetchOld, fetchNew);

// 4. Fix payload classes & tugas submission
const payloadOld = `    payload.append('kelas_ids', JSON.stringify(formData.kelas_ids));
    payload.append('judul', formData.judul);
    payload.append('tujuan_pembelajaran', formData.tujuan_pembelajaran);
    payload.append('aktivitas_pembelajaran', formData.aktivitas_pembelajaran);
    payload.append('ada_tugas', formData.ada_tugas);
    
    if (formData.ada_tugas) {
      payload.append('gunakan_code_editor', formData.gunakan_code_editor);
      if (formData.batas_waktu_tugas) {
        payload.append('batas_waktu_tugas', formData.batas_waktu_tugas);
      }
    }

    if (selectedFile) {
      payload.append('file_rpp', selectedFile);
    } else if (formData.existing_file) {
      payload.append('existing_file', formData.existing_file);
    }`;

const payloadNew = `    formData.kelas_ids.forEach(id => payload.append('kelas_ids[]', id));
    payload.append('judul', formData.judul);
    payload.append('tujuan_pembelajaran', formData.tujuan_pembelajaran);
    payload.append('aktivitas_pembelajaran', formData.aktivitas_pembelajaran);
    payload.append('ada_tugas', formData.ada_tugas);
    
    if (formData.ada_tugas) {
      payload.append('judul_tugas', formData.judul_tugas);
      payload.append('deskripsi_tugas', formData.deskripsi_tugas);
      if (formData.deadline_tugas) payload.append('deadline_tugas', formData.deadline_tugas);
      payload.append('gunakan_code_editor', formData.gunakan_code_editor);
      if (formData.existing_file_tugas) payload.append('existing_file_tugas', formData.existing_file_tugas);
      if (selectedFileTugas) payload.append('file_tugas', selectedFileTugas);
    }

    if (selectedFile) {
      payload.append('upload_file', selectedFile);
    } else if (formData.existing_file) {
      payload.append('existing_file', formData.existing_file);
    }`;
content = content.replace(payloadOld, payloadNew);

// 5. Replace the UI block for Tugas
// First remove the old one:
const tugasUIOldRegex = /\{formData\.ada_tugas && \([\s\S]*?\}\)/;
const tugasUINew = `{formData.ada_tugas && (
            <div className="pl-4 border-l-4 border-amber-300 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Judul Tugas *</label>
                <input type="text" required={formData.ada_tugas} value={formData.judul_tugas} onChange={e => setFormData({...formData, judul_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Tugas *</label>
                <textarea required={formData.ada_tugas} rows="3" value={formData.deskripsi_tugas} onChange={e => setFormData({...formData, deskripsi_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Batas Waktu Pengumpulan (Opsional)</label>
                <input type="datetime-local" value={formData.deadline_tugas} onChange={e => setFormData({...formData, deadline_tugas: e.target.value})} className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lampiran File Tugas (Opsional)</label>
                <input type="file" accept=".pdf" className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" onChange={e => setSelectedFileTugas(e.target.files[0])} />
                {formData.existing_file_tugas && !selectedFileTugas && (
                  <p className="text-xs text-slate-500 mt-1">File saat ini: {formData.existing_file_tugas.split('/').pop()}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
                  <input type="checkbox" checked={formData.gunakan_code_editor} onChange={e => setFormData({...formData, gunakan_code_editor: e.target.checked})} className="w-4 h-4 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500" />
                  <span className="font-bold text-emerald-800 text-sm">Gunakan Editor Kode (Flutter/Dart)</span>
                </label>
              </div>
            </div>
          )}`;
content = content.replace(tugasUIOldRegex, tugasUINew);

fs.writeFileSync('src/app/beranda/rpp/form/page.js', content);
console.log("Fixed missing tugas logic & payload classes!");
