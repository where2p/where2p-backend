import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

const dbPath = path.resolve(process.cwd(), 'prisma', 'test.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

execSync(
  `npx prisma db push --schema=prisma/schema.prisma`,
  { stdio: 'ignore', env: { ...process.env, DATABASE_URL: `file:./test.db` } },
);

const prisma = new PrismaClient();

async function seed() {
  const seedDataPath = path.join(__dirname, '..', 'prisma', 'budapest_toilets_lean.json');
  if (fs.existsSync(seedDataPath)) {
    const data = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
    for (const t of data) {
      await prisma.toilet.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          address: t.address,
          postalCode: t.postalCode,
          locationDetails: t.locationDetails ?? null,
          latitude: t.latitude,
          longitude: t.longitude,
          isWheelchairAccessible: t.isWheelchairAccessible ?? false,
          isOpen247: t.isOpen247 ?? false,
          feeHuf: t.feeHuf ?? 0,
          openingHours: t.openingHours ?? null,
          operator: t.operator ?? null,
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
        create: {
          id: t.id,
          name: t.name,
          address: t.address,
          postalCode: t.postalCode,
          locationDetails: t.locationDetails ?? null,
          latitude: t.latitude,
          longitude: t.longitude,
          isWheelchairAccessible: t.isWheelchairAccessible ?? false,
          isOpen247: t.isOpen247 ?? false,
          feeHuf: t.feeHuf ?? 0,
          openingHours: t.openingHours ?? null,
          operator: t.operator ?? null,
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      });
    }
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('demo123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@where2p.hu' },
    update: { role: 'ADMIN', passwordHash: adminHash },
    create: {
      email: 'admin@where2p.hu',
      passwordHash: adminHash,
      displayName: 'Admin',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@where2p.hu' },
    update: { role: 'USER', passwordHash: userHash },
    create: {
      email: 'demo@where2p.hu',
      passwordHash: userHash,
      displayName: 'Demo User',
      role: 'USER',
    },
  });

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('Test setup failed:', e);
  process.exit(1);
});