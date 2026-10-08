const fs = require('fs');
const file = 'src/app/beranda/rpp/page.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="flex flex-col gap-6 mb-6 mt-4">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{rpp.tujuan_pembelajaran}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{rpp.aktivitas_pembelajaran}</p>`;

const replacementStr = `<div className="flex flex-col gap-4 mb-6 mt-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{rpp.tujuan_pembelajaran}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{rpp.aktivitas_pembelajaran}</p>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
console.log("Teacher boxes applied.");
