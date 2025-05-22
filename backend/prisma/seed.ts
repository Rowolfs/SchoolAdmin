const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const roles = ['ADMIN', 'TEACHER', 'STUDENT'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('✅ Seeded roles');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
