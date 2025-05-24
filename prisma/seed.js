import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  try {
    // Hapus data jika ada
    console.log("Cleaning existing data...");
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    console.log("Existing data cleaned");

    // Buat Producst
    console.log("Creating products...");
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Rose Bouquet",
          price: 450000,
          stock: 10,
          description: "Beautiful rose bouquet arrangement",
        },
      }),
      prisma.product.create({
        data: {
          name: "Wedding Flowers",
          price: 2500000,
          stock: 5,
          description: "Complete wedding flower package",
        },
      }),
      prisma.product.create({
        data: {
          name: "Birthday Bundle",
          price: 350000,
          stock: 8,
          description: "Special birthday flower arrangement",
        },
      }),
      prisma.product.create({
        data: {
          name: "Lily Arrangement",
          price: 275000,
          stock: 12,
          description: "Elegant lily flower arrangement",
        },
      }),
      prisma.product.create({
        data: {
          name: "Orchid Collection",
          price: 550000,
          stock: 6,
          description: "Premium orchid collection",
        },
      }),
      prisma.product.create({
        data: {
          name: "Graduation Bouquet",
          price: 300000,
          stock: 10,
          description: "Graduation flower arrangement special for you",
        },
      }),
    ]);

    console.log("Products created:", products.length);

    // Buat orders dengan tanggal saat ini
    console.log("Creating orders...");
    const now = new Date();
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          orderNumber: "BELI-20250524-A1B2",
          customerName: "Marselino Ferdinand",
          customerEmail: "marselino@gugel.com",
          customerPhone: "081234567890",
          totalAmount: 450000,
          status: "completed",
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          items: {
            create: [
              {
                productId: products[0].id, // Rose Bouquet
                quantity: 1,
                price: 450000,
              },
            ],
          },
        },
      }),
      prisma.order.create({
        data: {
          orderNumber: "BELI-20250524-C3D4",
          customerName: "Raisa Deathsquad",
          customerEmail: "raisa@meta.com",
          customerPhone: "081234567891",
          totalAmount: 2500000,
          status: "pending",
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          items: {
            create: [
              {
                productId: products[1].id,
                quantity: 1,
                price: 2500000,
              },
            ],
          },
        },
      }),
      prisma.order.create({
        data: {
          orderNumber: "BELI-20250524-E5F6",
          customerName: "Isyana Sarasvati",
          customerEmail: "isyana@gmail.com",
          customerPhone: "081234567892",
          totalAmount: 350000,
          status: "completed",
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          items: {
            create: [
              {
                productId: products[2].id,
                quantity: 1,
                price: 350000,
              },
            ],
          },
        },
      }),
      prisma.order.create({
        data: {
          orderNumber: "BELI-20250524-G7H8",
          customerName: "Maudy Elekro",
          customerEmail: "maudy@dteti.ugm.ac.id",
          customerPhone: "081234567893",
          totalAmount: 275000,
          status: "completed",
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          items: {
            create: [
              {
                productId: products[3].id,
                quantity: 1,
                price: 275000,
              },
            ],
          },
        },
      }),
      prisma.order.create({
        data: {
          orderNumber: "BELI-20250524-I9J0",
          customerName: "Tulus",
          customerEmail: "tulus@gmail.com",
          customerPhone: "081234567894",
          totalAmount: 550000,
          status: "pending",
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          items: {
            create: [
              {
                productId: products[4].id,
                quantity: 1,
                price: 550000,
              },
            ],
          },
        },
      }),
    ]);

    console.log("Orders created:", orders.length);
    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Failed to seed database:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Cleaning up...");
    await prisma.$disconnect();
    console.log("Prisma disconnected");
  });
