const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

content = content.replace(/  const \[isOpen, setIsOpen\] = useState\(false\);\n/g, '');
content = content.replace(/  const fileInputRef = useRef\(null\);\n/g, '');
content = content.replace(/  const \[formData, setFormData\] = useState\(\{[\s\S]*?  \}\);\n/g, '');

const modalStart = content.indexOf('{isOpen && (');
if (modalStart !== -1) {
    // Find the end of this block which is at the end of the file before `    </div>` and `  );`
    // I will just slice it out or use regex.
    content = content.replace(/      \{isOpen && \([\s\S]*?      \)\}\n/g, '');
}

fs.writeFileSync('src/app/beranda/rpp/page.js', content);
console.log("Cleanup complete!");
