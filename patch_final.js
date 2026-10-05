const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

// 1. Remove Modal Form State
content = content.replace(/  \/\/ Modal Form State[\s\S]*?  const fileInputRef = useRef\(null\);\n/, '');

// 2. Remove formData
content = content.replace(/  const \[formData, setFormData\] = useState\(\{[\s\S]*?  \}\);\n/, '');

// 3. Remove handleSubmit
content = content.replace(/  const handleSubmit = async \(e\) => \{[\s\S]*?      Swal.fire\('Gagal', res.message, 'error'\);\n    \}\n  \};\n/, '');

// 4. Remove handleCheckboxKelas
content = content.replace(/  const handleCheckboxKelas = \(kelasId\) => \{[\s\S]*?  \};\n/, '');

// 5. Remove handleEdit
content = content.replace(/  const handleEdit = \(rpp\) => \{[\s\S]*?  \};\n/, '');

// 6. Update Button Add (Desktop & Mobile)
content = content.replace(/onClick=\{\(\) => \{\n\s*setFormData\(\{[\s\S]*?\}\);\n\s*setIsOpen\(true\);\n\s*\}\}/g, "onClick={() => router.push('/beranda/rpp/form')}");
content = content.replace(/const handleCreateNew = \(\) => \{\n\s*setFormData\(\{[\s\S]*?\}\);\n\s*setIsOpen\(true\);\n\s*\};/, '');
content = content.replace(/onClick=\{handleCreateNew\}/, "onClick={() => router.push('/beranda/rpp/form')}");

// 7. Update Edit button
content = content.replace(/onClick=\{\(\) => handleEdit\(rpp\)\}/g, "onClick={() => router.push(`/beranda/rpp/form?id=\${rpp.id}`)}");

// 8. Remove Modal DOM carefully using string indexing
const modalStart = content.indexOf('{isOpen && (');
if (modalStart !== -1) {
    const endStr = "      )}\n    </div>\n  );\n}";
    const endIdx = content.indexOf(endStr);
    
    if (endIdx !== -1) {
        content = content.substring(0, modalStart) + "    </div>\n  );\n}";
        console.log("Modal sliced out!");
    } else {
        console.log("Could not find end of modal block");
    }
}

// 9. Remove unused imports
content = content.replace(/import \{ getKelas, getMapel \} from "@\/actions\/master";\n/, '');
content = content.replace(/saveRpp, /, '');

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
console.log("Patched RPP page successfully!");
