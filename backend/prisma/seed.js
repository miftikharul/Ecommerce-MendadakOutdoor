const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // 1. Validasi ketat: Wajib mengambil dari .env tanpa nilai cadangan (*fallback*)
  const adminEmail = process.env.ADMIN_USERNAME;
  const adminPasswordPlain = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPasswordPlain) {
    console.error('❌ Error: ADMIN_USERNAME atau ADMIN_PASSWORD belum diatur di file .env!');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPasswordPlain, 10);

  // 2. Upsert admin dengan memperbarui password dan data jika .env berubah
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Super Admin Mendadak Outdoor',
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin Mendadak Outdoor',
      role: 'ADMIN',
    },
  });
  console.log('✅ Akun Admin berhasil disiapkan dan diperbarui.');

  // 3. Seed Kategori Master
  const categories = ['Tenda', 'Aksesoris', 'Celana', 'Kompor', 'Meja', 'Lampu'];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }
  console.log('✅ Kategori master berhasil dimasukkan.');

  // 4. Seed Brand Master
  const brands = ['MobiGarden', 'Naturehike', 'Kailas', 'Eiger', 'Consina'];
  for (const brandName of brands) {
    await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
  }
  console.log('✅ Brand master berhasil dimasukkan.');

  console.log('🎉 Seeding database selesai!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });