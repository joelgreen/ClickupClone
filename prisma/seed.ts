import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "test@flowos.com" },
    update: {},
    create: {
      email: "test@flowos.com",
      name: "Test User",
      password: hashed,
    },
  });
  console.log("Seeded test user: test@flowos.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
