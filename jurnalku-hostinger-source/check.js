require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  try {
    const prisma = new PrismaClient();
    console.log("Testing connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("Connected successfully!");
  } catch (e) {
    console.error("Connection failed:", e);
  }
}
main();
