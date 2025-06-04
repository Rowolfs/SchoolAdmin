const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
  const salt = await bcrypt.genSalt(10);
  const ADMIN = {
    name: "Админ",
    surname: "Админов",
    patronymic: "Админович",
    email: "admin@admin.ru",
    // Find the ADMIN role id dynamically
    roleId: (await prisma.role.findUnique({ where: { name: 'ADMIN' } }))?.id,
    password: await bcrypt.hash(ADMIN_PASSWORD, salt)
  };

  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: {},
    create: ADMIN
  });
  console.log('✅ Seeded admin user');





}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
