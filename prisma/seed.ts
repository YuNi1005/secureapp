import "dotenv/config";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined.",
  );
}

const adminPassword =
  process.env.SEED_ADMIN_PASSWORD;

const userPassword =
  process.env.SEED_USER_PASSWORD;

if (!adminPassword || !userPassword) {
  throw new Error(
    "SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD must be defined.",
  );
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminPasswordHash =
    await bcrypt.hash(adminPassword, 12);

  const userPasswordHash =
    await bcrypt.hash(userPassword, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {
      passwordHash: adminPasswordHash,
      name: "Administrator",
      role: "ADMIN",
    },
    create: {
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: "user@example.com",
    },
    update: {
      passwordHash: userPasswordHash,
      name: "Test User",
      role: "USER",
    },
    create: {
      email: "user@example.com",
      passwordHash: userPasswordHash,
      name: "Test User",
      role: "USER",
    },
  });

  console.log("Seed completed.");
  console.log({
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });