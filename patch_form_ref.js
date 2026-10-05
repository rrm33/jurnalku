const fs = require('fs');
let content = fs.readFileSync('src/app/beranda-siswa/tugas/[id]/page.js', 'utf8');

const oldForm = `<form onSubmit={handleSubmit} className="space-y-6">`;
const newForm = `<form ref={formRef} onSubmit={handleSubmit} className="space-y-6 scroll-mt-24">`;
content = content.replace(oldForm, newForm);

fs.writeFileSync('src/app/beranda-siswa/tugas/[id]/page.js', content);
console.log("Patched formRef successfully!");
