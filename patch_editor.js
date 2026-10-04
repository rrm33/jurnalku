const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

// 1. Fix editorDisabled boolean cast
content = content.replace(
  'const editorDisabled = isDeadlinePast || (hasGrade) || (submission && !isEditing);',
  'const editorDisabled = Boolean(isDeadlinePast || hasGrade || (submission && !isEditing));'
);

// 2. Always show the RUN button
const oldHeader = `<div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                           <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Code Editor (Hanya Ketik Manual)</span>
                           {!editorDisabled && (
                             <button type="button" onClick={handleRunCode} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                               <Play size={12} /> Jalankan
                             </button>
                           )}
                        </div>`;
const newHeader = `<div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                           <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Code Editor (Hanya Ketik Manual)</span>
                           <button type="button" onClick={handleRunCode} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                             <Play size={12} /> Jalankan
                           </button>
                        </div>`;
content = content.replace(oldHeader, newHeader);

// 3. Add explanation overlay if disabled because of submission
const oldTextarea = `<textarea
                          value={kodeText}
                          onChange={(e) => setKodeText(e.target.value)}
                          onPaste={(e) => {
                             e.preventDefault();
                             Swal.fire("Oops!", "Paste dimatikan. Kamu harus mengetik kode secara manual untuk belajar!", "info");
                          }}
                          disabled={editorDisabled}
                          spellCheck="false"
                          placeholder="// Ketik kode Dart/Flutter kamu di sini..."
                          className="flex-1 w-full p-4 bg-[#1e1e1e] text-emerald-400 font-mono text-sm leading-relaxed outline-none resize-none disabled:opacity-70"
                          style={{ tabSize: 2 }}
                        />`;
const newTextarea = `<div className="relative flex-1 flex flex-col">
                          {editorDisabled && submission && !isEditing && !hasGrade && (
                            <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                               <span className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-slate-600">Scroll ke bawah dan klik "Edit Jawaban" untuk membuka editor</span>
                            </div>
                          )}
                          <textarea
                            value={kodeText}
                            onChange={(e) => setKodeText(e.target.value)}
                            onPaste={(e) => {
                               e.preventDefault();
                               Swal.fire("Oops!", "Paste dimatikan. Kamu harus mengetik kode secara manual untuk belajar!", "info");
                            }}
                            disabled={editorDisabled}
                            spellCheck="false"
                            placeholder="// Ketik kode Dart/Flutter kamu di sini..."
                            className="flex-1 w-full p-4 bg-[#1e1e1e] text-emerald-400 font-mono text-sm leading-relaxed outline-none resize-none disabled:opacity-70"
                            style={{ tabSize: 2 }}
                          />
                        </div>`;
content = content.replace(oldTextarea, newTextarea);

fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
console.log("Patched successfully!");
