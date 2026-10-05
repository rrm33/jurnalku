const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

const oldUI = `                      {hasGrade ? (
                        <div className={\`p-4 \${submission.nilai === 0 ? 'bg-gradient-to-r from-red-100 to-rose-100 border-red-200' : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200'} border rounded-2xl flex flex-col items-center justify-center shadow-sm\`}>
                          <span className={\`font-bold \${submission.nilai === 0 ? 'text-red-800' : 'text-amber-800'} text-xs uppercase tracking-wider mb-1\`}>Nilai Akhir</span>
                          <span className={\`text-5xl font-black \${submission.nilai === 0 ? 'text-red-600' : 'text-amber-600'} drop-shadow-sm\`}>{submission.nilai}</span>
                        </div>
                      ) : submission ? (`;

const newUI = `                      {hasGrade ? (
                        <div className="flex flex-col gap-4">
                          <div className={\`p-4 \${submission.nilai === 0 ? 'bg-gradient-to-r from-red-100 to-rose-100 border-red-200' : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200'} border rounded-2xl flex flex-col items-center justify-center shadow-sm\`}>
                            <span className={\`font-bold \${submission.nilai === 0 ? 'text-red-800' : 'text-amber-800'} text-xs uppercase tracking-wider mb-1\`}>Nilai Akhir</span>
                            <span className={\`text-5xl font-black \${submission.nilai === 0 ? 'text-red-600' : 'text-amber-600'} drop-shadow-sm\`}>{submission.nilai}</span>
                          </div>
                          
                          {submission.catatan_guru && submission.catatan_guru.trim() !== "" && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
                              <span className="font-bold text-blue-800 text-xs uppercase tracking-wider mb-2 block">Tanggapan Guru:</span>
                              <p className="text-sm text-blue-900 whitespace-pre-wrap">{submission.catatan_guru}</p>
                            </div>
                          )}
                        </div>
                      ) : submission ? (`;

content = content.replace(oldUI, newUI);
fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
console.log("Patched Student UI successfully!");
