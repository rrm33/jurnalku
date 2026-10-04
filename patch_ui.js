const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

const oldSection = `                {/* Code Editor Section (if enabled) */}
                {currentTugas.gunakan_code_editor ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                     <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-lg relative min-h-[400px]">
                        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                           <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Code Editor (Dart/Flutter)</span>
                           {!editorDisabled && (
                             <button type="button" onClick={handleRunCode} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                               <Play size={12} /> Jalankan
                             </button>
                           )}
                        </div>
                        <textarea
                          value={jawabanText}
                          onChange={(e) => setJawabanText(e.target.value)}
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
                     </div>
                     
                     <div className="flex-1 bg-slate-50 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-inner min-h-[400px] relative">
                        <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-200">
                           <span className="text-xs font-bold text-slate-500">Live Output (DartPad)</span>
                        </div>
                        <iframe 
                          ref={iframeRef}
                          src="https://dartpad.dev/embed-flutter.html?theme=light"
                          className="flex-1 w-full h-full border-0 min-h-[400px]"
                          title="DartPad Engine"
                        />
                     </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Jawaban (Teks)</label>
                    <textarea 
                      rows="5" 
                      value={jawabanText} 
                      onChange={e => setJawabanText(e.target.value)} 
                      disabled={editorDisabled}
                      placeholder="Ketik jawabanmu di sini..." 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none text-sm shadow-inner disabled:opacity-60"
                    ></textarea>
                  </div>
                )}`;

const newSection = `                {/* Jawaban Teks selalu muncul */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Isian Jawaban Siswa (Teks)</label>
                  <textarea 
                    rows="3" 
                    value={jawabanText} 
                    onChange={e => setJawabanText(e.target.value)} 
                    disabled={editorDisabled}
                    placeholder="Ketik penjelasan/jawaban teksmu di sini..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none text-sm shadow-inner disabled:opacity-60"
                  ></textarea>
                </div>

                {/* Code Editor Section (jika tugas koding diaktifkan) */}
                {currentTugas.gunakan_code_editor && (
                  <div className="flex flex-col lg:flex-row gap-6 mt-6 pt-6 border-t border-slate-100">
                     <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-lg relative min-h-[400px]">
                        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                           <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Code Editor (Hanya Ketik Manual)</span>
                           {!editorDisabled && (
                             <button type="button" onClick={handleRunCode} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                               <Play size={12} /> Jalankan
                             </button>
                           )}
                        </div>
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
                     </div>
                     
                     <div className="flex-1 bg-slate-50 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-inner min-h-[400px] relative">
                        <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-200">
                           <span className="text-xs font-bold text-slate-500 flex flex-col">
                              Live Output (Khusus Menampilkan Hasil)
                              <span className="text-[9px] text-slate-400 font-normal">Abaikan tab code jika muncul, khusus lihat hasil di tab UI</span>
                           </span>
                        </div>
                        <iframe 
                          ref={iframeRef}
                          src="https://dartpad.dev/embed-flutter.html?theme=light&run=true&split=100"
                          className="flex-1 w-full h-full border-0 min-h-[400px]"
                          title="DartPad Engine"
                        />
                     </div>
                  </div>
                )}`;

if (content.includes('Code Editor Section')) {
    const newContent = content.replace(oldSection, newSection);
    fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', newContent);
    console.log("Patched successfully!");
} else {
    console.log("Section not found!");
}
