import {NextResponse} from "next/server";
import {prisma} from "/app/lib/prisma";

// GET all categories menggunakan traditional query yang lebih reliable
export async function GET() {
  try {
    await prisma.$connect();
    console.log("Database berhasil connect!"); // Gunakan traditional query untuk mendapatkan categories dengan analytics
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            product: {
              include: {
                orderItems: {
                  include: {
                    order: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log("Categories fetched successfully:", categories.length);

    // Hitung analytics untuk setiap category
    const formattedCategories = categories.map((category) => {
      const productCategories = category.products || [];
      const products = productCategories.map((pc) => pc.product);

      // Hitung total stock
      const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);

      // Hitung products dengan status stock
      const outOfStockCount = products.filter((p) => p.stock === 0).length;
      const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

      // Hitung revenue dari completed orders
      let totalRevenue = 0;
      let totalOrders = 0;
      const completedOrderIds = new Set();

      products.forEach((product) => {
        product.orderItems?.forEach((orderItem) => {
          if (orderItem.order?.status === "COMPLETED") {
            totalRevenue += (orderItem.quantity || 0) * (orderItem.price || 0);
            completedOrderIds.add(orderItem.order.id);
          }
        });
      });

      totalOrders = completedOrderIds.size;

      // Hitung average product price
      const avgProductPrice =
        products.length > 0 ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length : 0;

      return {
        id: category.id,
        name: category.name,
        productCount: products.length,
        createdAt: category.createdAt,
        // Analytics data
        totalStock: totalStock,
        outOfStockCount: outOfStockCount,
        lowStockCount: lowStockCount,
        totalRevenue: totalRevenue,
        avgProductPrice: avgProductPrice,
        totalOrders: totalOrders
      };
    });

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error?.message || "Unknown error"
      },
      {status: 500}
    );
  }
}

// POST category baru
export async function POST(request) {
  try {
    const body = await request.json();
    const {name} = body;

    // validasi inputnya
    if (!name || name.trim() === "") {
      return NextResponse.json({error: "Category name is required"}, {status: 400});
    }

    // apakah category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });

    if (existingCategory) {
      return NextResponse.json({error: "Category already exists"}, {status: 409});
    }

    // BUAT KATEGORI BARU
    const category = await prisma.category.create({
      data: {name}
    });

    return NextResponse.json(
      {
        ...category,
        productCount: 0
      },
      {status: 201}
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({error: "Failed to create category"}, {status: 500});
  }
}
