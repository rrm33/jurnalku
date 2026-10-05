const fs = require('fs');
let content = fs.readFileSync('src/actions/rpp.js', 'utf8');

const newAction = `
export async function getRppById(id) {
  try {
    return await prisma.rpp.findUnique({
      where: { id: parseInt(id) },
      include: {
        kelas: true,
        mapel: true,
        tugas: true
      }
    });
  } catch (error) {
    console.error("Error getRppById:", error);
    return null;
  }
}
`;

content = content + newAction;
fs.writeFileSync('src/actions/rpp.js', content);
console.log("Added getRppById!");
