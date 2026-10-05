const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

// 1. Add formRef
const oldState = `  const iframeRef = useRef(null);`;
const newState = `  const iframeRef = useRef(null);
  const formRef = useRef(null);`;
content = content.replace(oldState, newState);

// 2. Remove the overlay
const oldOverlay = `                        <div className="relative flex-1 flex flex-col">
                          {editorDisabled && submission && !isEditing && !hasGrade && (
                            <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                               <span className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-slate-600">Scroll ke bawah dan klik "Edit Jawaban" untuk membuka editor</span>
                            </div>
                          )}
                          <textarea`;

const newOverlay = `                        <div className="relative flex-1 flex flex-col">
                          <textarea`;
content = content.replace(oldOverlay, newOverlay);

// 3. Attach ref to the form section and fix scrollTo
const oldFormHeader = `<h2 className="font-extrabold text-xl md:text-2xl text-slate-800 mb-6 flex items-center gap-2">`;
const newFormHeader = `<div ref={formRef} className="scroll-mt-6"></div>\n                  <h2 className="font-extrabold text-xl md:text-2xl text-slate-800 mb-6 flex items-center gap-2">`;
content = content.replace(oldFormHeader, newFormHeader);

const oldScrollTo = `                                  onClick={() => {
                                    setIsEditing(true);
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                  }}`;
const newScrollTo = `                                  onClick={() => {
                                    setIsEditing(true);
                                    setTimeout(() => {
                                      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                  }}`;
content = content.replace(oldScrollTo, newScrollTo);

fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
console.log("Patched Student UI successfully!");
