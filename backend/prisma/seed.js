const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@mendadakoutdoor.com';
  const password = process.env.ADMIN_PASSWORD;
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: { name: 'Admin Mendadak Outdoor', email, password: hashedPassword, role: 'ADMIN' }
  });
  console.log('Admin seeded successfully!');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());