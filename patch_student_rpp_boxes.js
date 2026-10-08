const fs = require('fs');
const file = 'src/app/beranda-siswa/tugas/[id]/page.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="flex flex-col gap-6">
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{kbm.tujuan_pembelajaran}</p>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{kbm.aktivitas_pembelajaran}</p>`;

const replacementStr = `<div className="flex flex-col gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{kbm.tujuan_pembelajaran}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{kbm.aktivitas_pembelajaran}</p>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
console.log("Student boxes applied.");
