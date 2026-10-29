import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!email || !password) {
    throw new Error("Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD in .env");
  }

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Owner",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "OWNER",
    },
  });

  const services = [
    { name: "Exterior Wash", price: 300, durationMin: 20 },
    { name: "Interior Cleaning", price: 500, durationMin: 40 },
    { name: "Full Detail", price: 1200, durationMin: 90 },
  ];
  for (const s of services) {
    await prisma.service.upsert({ where: { name: s.name }, update: {}, create: s });
  }

  console.log("Seeded owner and starter services");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());