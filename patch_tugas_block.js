const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/form/page.js', 'utf8');

// Find the start of the injected UI block and the end of the broken part
const startIdx = content.indexOf('{formData.ada_tugas && (');

// The end of the broken part is just before the `<div className="pt-6 border-t border-slate-100 flex justify-end gap-3">`
const endIdx = content.indexOf('<div className="pt-6 border-t border-slate-100 flex justify-end gap-3">');

const tugasUINew = `{formData.ada_tugas && (
            <div className="pl-4 border-l-4 border-amber-300 space-y-4 mb-6">
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
                <input type="datetime-local" value={formData.deadline_tugas} onChange={e => setFormData({...formData, deadline_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white" />
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
          )}

          `;

content = content.substring(0, startIdx) + tugasUINew + content.substring(endIdx);
fs.writeFileSync('src/app/beranda/rpp/form/page.js', content);
console.log("Fixed the broken HTML block!");
