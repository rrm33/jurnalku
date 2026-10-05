const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

const modalText = "{isOpen && (";
const startIdx = content.indexOf(modalText);
console.log("startIdx:", startIdx);
if (startIdx !== -1) {
    // Just find "    </div>\n  );\n}" from the bottom.
    const lastClosing = content.lastIndexOf("    </div>\n  );\n}");
    console.log("lastClosing:", lastClosing);
    if (lastClosing !== -1) {
       content = content.substring(0, startIdx) + "    </div>\n  );\n}";
       fs.writeFileSync('src/app/beranda/rpp/page.js', content);
       console.log("Sliced!");
    }
}
