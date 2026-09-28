require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

async function main() {
  try {
    let dbUrl = "mariadb://root:root@localhost/jurnal_mengajar?socketPath=/Applications/MAMP/tmp/mysql/mysql.sock";
    
    console.log("Trying with socket: ", dbUrl);
    const pool = mariadb.createPool(dbUrl);
    const adapter = new PrismaMariaDb(pool);
    const prisma = new PrismaClient({ adapter });

    await prisma.$queryRaw`SELECT 1`;
    console.log("Connected successfully via Socket!");
  } catch (e) {
    console.error("Connection failed:", e);
  }
}
main();
