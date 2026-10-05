const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

// The file is too big to string replace easily if there are multiple parts.
// Let's use string operations carefully.

// Remove Modal state
content = content.replace(/  \/\/ Modal Form State\n  const \[isOpen, setIsOpen\] = useState\(false\);\n  const fileInputRef = useRef\(null\);\n\n  const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);\n/, '');

// Replace Create button onClick
content = content.replace(
  /onClick=\{\(\) => \{\n\s*setFormData\(\{[\s\S]*?\}\);\n\s*setIsOpen\(true\);\n\s*\}\}/,
  "onClick={() => router.push('/beranda/rpp/form')}"
);

// Replace Edit button onClick
content = content.replace(
  /onClick=\{\(\) => handleEdit\(rpp\)\}/g,
  "onClick={() => router.push(`/beranda/rpp/form?id=\${rpp.id}`)}"
);

// We need to remove handleEdit, handleCheckboxKelas, handleSubmit
// It's safer to find the block and remove it.
const funcBlockRegex = /  const handleEdit = \(rpp\) => \{[\s\S]*?const handleSubmit = async \(e\) => \{[\s\S]*?  \};\n/g;
content = content.replace(funcBlockRegex, '');
// Wait, handleSubmit might be large, let's remove manually or via regex carefully
content = content.replace(/  const handleCheckboxKelas = \(kelasId\) => \{[\s\S]*?  \};\n/g, '');

// Removing the modal HTML
// The modal is usually at the end of the file.
const modalRegex = /      \{\/\* Modal Form RPP \*\/\}\n      \{isOpen && \([\s\S]*?      \)\}\n/g;
content = content.replace(modalRegex, '');

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
console.log("Patched RPP Main successfully!");
