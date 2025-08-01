import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  const saltOrRounds = 10;
  const hashedPassword = await bcrypt.hash('12345678', saltOrRounds);

  const roles = [
    'CLIENTE',
    'ADMIN',
    'GERENTE',
    'FUNCIONARIO',
    'FINANCEIRO',
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: {
        name: role,
      },
    });
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      username: 'admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      active: true,
      roles: {
        connect: { name: 'ADMIN' },
      },
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
