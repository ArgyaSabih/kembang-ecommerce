import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// Get product by id
export async function GET(request, { params }) {
  try {
    const id = parseInt(await params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Update product by id dengan PUT
export async function PUT(request, { params }) {
  try {
    const id = parseInt(await params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, price, stock, description, categories } = body;

    // validasi input
    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Name, price, and stock are required!!" },
        { status: 400 }
      );
    }

    // update product dengan data baru
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        categories: {
          deleteMany: {},
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
