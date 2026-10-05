const fs = require('fs');
let content = fs.readFileSync('src/app/api/calibrate/route.js', 'utf8');
content = content.replace('import prisma from "@/lib/prisma";', 'import { prisma } from "@/lib/prisma";');
fs.writeFileSync('src/app/api/calibrate/route.js', content);
