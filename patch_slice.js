const fs = require('fs');
let content = fs.readFileSync('src/app/beranda/rpp/page.js', 'utf8');

const modalText = "{isOpen && (";
const startIdx = content.indexOf(modalText);
if (startIdx !== -1) {
    // Find the end of this block. It's usually near the end of the file.
    // The structure is:
    //       {isOpen && (
    //         <div className="fixed ...">
    //           ...
    //         </div>
    //       )}
    //     </div>
    //   );
    // }
    
    // So we can find the matching closing `)}` that precedes the final `    </div>\n  );\n}`
    
    const endStr = "      )}\n    </div>\n  );\n}";
    const endIdx = content.indexOf(endStr);
    
    if (endIdx !== -1) {
        content = content.substring(0, startIdx) + "    </div>\n  );\n}";
        fs.writeFileSync('src/app/beranda/rpp/page.js', content);
        console.log("Sliced out modal successfully!");
    } else {
        console.log("Could not find end of modal block");
    }
}
