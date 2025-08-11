import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  const saltOrRounds = 10;
  const hashedPassword = await bcrypt.hash('12345678', saltOrRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      userName: 'admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      active: true,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user with id: ${adminUser.userId}`);
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
