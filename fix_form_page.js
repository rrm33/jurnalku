const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/form/page.js', 'utf8');

// 1. Add Trash2 import
content = content.replace(/import \{ ArrowLeft, Save, Upload, CheckSquare \} from "lucide-react";/, 'import { ArrowLeft, Save, Upload, CheckSquare, Trash2 } from "lucide-react";');

// 2. Add selectedFile state
content = content.replace(/  const fileInputRef = useRef\(null\);/, '  const [selectedFile, setSelectedFile] = useState(null);');

// 3. Update file input onChange to use state and drop ref logic
content = content.replace(/<input type="file" accept="\.pdf" ref=\{fileInputRef\} className="hidden" id="file_rpp" onChange=\{\(\) => setFormData\(\{\.\.\.formData\}\)\} \/>/, 
  '<input type="file" accept=".pdf" className="hidden" id="file_rpp" onChange={(e) => setSelectedFile(e.target.files[0])} />');

content = content.replace(/\{fileInputRef\.current\?\.files\?\.\[0\] \? fileInputRef\.current\.files\[0\]\.name : formData\.existing_file \? 'File tersimpan: ' \+ formData\.existing_file\.split\('\/'\)\.pop\(\) : 'Belum ada file'\}/,
  "{selectedFile ? selectedFile.name : formData.existing_file ? 'File tersimpan: ' + formData.existing_file.split('/').pop() : 'Belum ada file'}");

// 4. Move useEffect down
const useEffectBlock = `  useEffect(() => {
    fetchData();
  }, [id]);`;
content = content.replace(useEffectBlock + '\n\n', '');
// Place it after fetchData
content = content.replace(/    setLoading\(false\);\n  \};\n/, "    setLoading(false);\n  };\n\n" + useEffectBlock + "\n");

// 5. Update form submit to use selectedFile instead of fileInputRef
content = content.replace(/if \(fileInputRef\.current && fileInputRef\.current\.files\[0\]\) \{[\s\S]*?payload\.append\('file_rpp', fileInputRef\.current\.files\[0\]\);[\s\S]*?\} else if \(formData\.existing_file\)/,
  "if (selectedFile) {\n      payload.append('file_rpp', selectedFile);\n    } else if (formData.existing_file)");

fs.writeFileSync('src/app/beranda/rpp/form/page.js', content);
console.log("Fixed form page!");
