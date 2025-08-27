import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
        points: 100,
        profileImageUrl: "admin.png",
      },
      {
        name: "User",
        email: "user@example.com",
        password: userPassword,
        role: "user",
        points: 50,
        profileImageUrl: "user.png",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Laptop",
        price: 10000000,
        stock: 5,
        productImageUrl: "laptop.png",
        status: "active",
      },
      {
        name: "Handphone",
        price: 5000000,
        stock: 10,
        productImageUrl: "handphone.png",
        status: "active",
      },
    ],
    skipDuplicates: true,
  });

  const user = await prisma.user.findFirst({ where: { role: "user" } });
  const product = await prisma.product.findFirst();

  if (user && product) {
    await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 2,
        total: product.price * 2,
      },
    });
  }
}

main()
  .then(async () => {
    console.log("✅ Seeding selesai");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
