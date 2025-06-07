import {prisma} from "/app/lib/prisma";
import {NextResponse} from "next/server";

// fungsi GET utk semua products menggunakan VIEW untuk performa lebih baik
export async function GET() {
  try {
    // Gunakan product_summary_view untuk mendapatkan data produk dengan analytics
    const productSummaries = await prisma.$queryRaw`
      SELECT * FROM product_summary_view
    `;

    console.log("Products fetched from VIEW successfully:", productSummaries.length);

    // Ambil data kategori untuk setiap produk
    const productsWithCategories = await Promise.all(
      productSummaries.map(async (product) => {
        const categories = await prisma.productCategory.findMany({
          where: {productId: product.id},
          include: {category: true}
        });

        return {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          description: product.description,
          categories: categories.map((pc) => pc.category),
          // Analytics data dari VIEW
          totalSold: Number(product.total_sold),
          totalRevenue: Number(product.total_revenue),
          stockStatus: product.stock_status,
          salesPerformance: product.sales_performance,
          orderCount: Number(product.order_count)
        };
      })
    );

    return NextResponse.json(productsWithCategories);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error?.message || "Unknown error"
      },
      {status: 500}
    );
  }
}

// Post untuk new product
export async function POST(request) {
  try {
    const body = await request.json();
    const {name, price, stock, description, categories} = body;

    // validate input
    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({error: "Name, price, and stock are required"}, {status: 400});
    }

    // buat product dengan kategori
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description: description || "",
        categories: {
          create: categories.map((categoryId) => ({
            category: {
              connect: {
                id: categoryId
              }
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    // Transform the categories structure to match frontend expectations
    const transformedProduct = {
      ...product,
      categories: product.categories.map((item) => item.category)
    };

    return NextResponse.json(transformedProduct, {status: 201});
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({error: "Failed to create product"}, {status: 500});
  }
}
