const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

const oldButtons = `                           {!editorDisabled ? (
                              <button 
                                type="submit" 
                                disabled={isSubmitting || isDeadlinePast}
                                className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                              >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                           ) : (
                              !isDeadlinePast && (
                                <button
                                  type="button"
                                  onClick={() => setIsEditing(true)}
                                  className="w-full py-3.5 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm flex justify-center items-center gap-2 text-sm"
                                >
                                  Edit Jawaban
                                </button>
                              )
                           )}`;

const newButtons = `                           {!editorDisabled ? (
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setIsEditing(false)}
                                  className="w-1/3 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all shadow-sm flex justify-center items-center text-sm"
                                >
                                  Batal
                                </button>
                                <button 
                                  type="submit" 
                                  disabled={isSubmitting || isDeadlinePast}
                                  className="w-2/3 py-3.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                                >
                                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                              </div>
                           ) : (
                              !isDeadlinePast && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditing(true);
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                  }}
                                  className="w-full py-3.5 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm flex justify-center items-center gap-2 text-sm"
                                >
                                  Edit Jawaban
                                </button>
                              )
                           )}`;

if (content.includes('!editorDisabled ? (')) {
    content = content.replace(oldButtons, newButtons);
    fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
    console.log("Patched buttons successfully!");
} else {
    console.log("Target not found!");
}
