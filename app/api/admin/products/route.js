import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// fungsi GET utk semua products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        categories: {
          // relassi categories merujuk ke tabel join ProductCategory
          include: {
            category: true,
          },
        },
      },
    });

    console.log("Products fetched successfully:", products.length);

    // menmformat data produk
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categories: product.categories.map((pc) => pc.category),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Post untuk new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, price, stock, description, categories } = body;

    // validate input
    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Name, price, and stock are required" },
        { status: 400 }
      );
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
                id: categoryId,
              },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
