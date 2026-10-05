const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

// 1-7. All the state removals
content = content.replace(/  \/\/ Modal Form State[\s\S]*?  const fileInputRef = useRef\(null\);\n/, '');
content = content.replace(/  const \[formData, setFormData\] = useState\(\{[\s\S]*?  \}\);\n/, '');
content = content.replace(/  const handleSubmit = async \(e\) => \{[\s\S]*?      Swal.fire\('Gagal', res.message, 'error'\);\n    \}\n  \};\n/, '');
content = content.replace(/  const handleCheckboxKelas = \(kelasId\) => \{[\s\S]*?  \};\n/, '');
content = content.replace(/  const handleEdit = \(rpp\) => \{[\s\S]*?  \};\n/, '');
content = content.replace(/onClick=\{\(\) => \{\n\s*setFormData\(\{[\s\S]*?\}\);\n\s*setIsOpen\(true\);\n\s*\}\}/g, "onClick={() => router.push('/beranda/rpp/form')}");
content = content.replace(/const handleCreateNew = \(\) => \{\n\s*setFormData\(\{[\s\S]*?\}\);\n\s*setIsOpen\(true\);\n\s*\};/, '');
content = content.replace(/onClick=\{handleCreateNew\}/, "onClick={() => router.push('/beranda/rpp/form')}");
content = content.replace(/onClick=\{\(\) => handleEdit\(rpp\)\}/g, "onClick={() => router.push(`/beranda/rpp/form?id=\${rpp.id}`)}");
content = content.replace(/import \{ getKelas, getMapel \} from "@\/actions\/master";\n/, '');
content = content.replace(/saveRpp, /, '');

const modalStart = content.indexOf('{isOpen && (');
const modalEnd = content.indexOf('{/* File Viewer Modal */}');

if (modalStart !== -1 && modalEnd !== -1) {
    content = content.substring(0, modalStart) + content.substring(modalEnd);
    console.log("Modal removed correctly!");
}

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
