import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const seedPath = path.resolve(__dirname, 'budapest_toilets_lean.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const toilets = JSON.parse(raw) as Array<Record<string, unknown>>;

  let inserted = 0;
  for (const t of toilets) {
    const id = String(t.id);
    const data = {
      id,
      name: String(t.name),
      address: String(t.address),
      postalCode: String(t.postalCode),
      locationDetails: t.locationDetails ? String(t.locationDetails) : null,
      latitude: Number(t.latitude),
      longitude: Number(t.longitude),
      isWheelchairAccessible: Boolean(t.isWheelchairAccessible),
      isOpen247: Boolean(t.isOpen247),
      feeHuf: Number(t.feeHuf) ?? 0,
      openingHours: t.openingHours ? String(t.openingHours) : null,
      operator: t.operator ? String(t.operator) : null,
      status: 'APPROVED',
      reviewedAt: new Date(),
    };

    await prisma.toilet.upsert({
      where: { id },
      update: { ...data },
      create: data,
    });
    inserted += 1;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const demoPassword = await bcrypt.hash('demo123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@where2p.hu' },
    update: { role: 'ADMIN', passwordHash: adminPassword },
    create: {
      email: 'admin@where2p.hu',
      passwordHash: adminPassword,
      displayName: 'Where2P Admin',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@where2p.hu' },
    update: { role: 'USER', passwordHash: demoPassword },
    create: {
      email: 'demo@where2p.hu',
      passwordHash: demoPassword,
      displayName: 'Demo User',
      role: 'USER',
    },
  });

  console.log(`Seed complete: ${inserted} toilets upserted, 2 users ensured.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });