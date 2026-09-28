const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai mengalibrasi zona waktu untuk Tenggat Tugas (Mundur 7 jam)...');
  
  const tugasList = await prisma.tugas.findMany({
    where: { deadline: { not: null } }
  });

  let count = 0;
  for (const t of tugasList) {
    // Kurangi 7 jam agar sesuai dengan UTC murni
    const newDeadline = new Date(t.deadline.getTime() - (7 * 60 * 60 * 1000));
    
    await prisma.tugas.update({
      where: { id: t.id },
      data: { deadline: newDeadline }
    });
    count++;
  }
  
  console.log(`✅ Berhasil mengalibrasi ${count} deadline tugas!`);
}

main()
  .catch(e => {
    console.error('Gagal kalibrasi:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
