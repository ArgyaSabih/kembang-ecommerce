import { prisma } from "/app/lib/prisma";
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

    // Transform the categories structure to match frontend expectations
    const transformedProduct = {
      ...product,
      categories: product.categories.map((item) => item.category),
    };

    return NextResponse.json(transformedProduct);
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
    await prisma.$connect();
    const id = parseInt(await params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, price, stock, description, categories } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Name, price, and stock are required!" },
        { status: 400 }
      );
    }

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

    // Transform the categories structure to match frontend expectations
    const transformedProduct = {
      ...updatedProduct,
      categories: updatedProduct.categories.map((item) => item.category),
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred during product update.";
    const errorCode = error.code || "UNKNOWN_ERROR";
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

//Delete by id
export async function DELETE(request, { params }) {
  //   console.log("Starting delete operation...");

  try {
    const { id } = params;
    const productId = parseInt(id);

    console.log("Product ID to delete:", productId);

    if (isNaN(productId)) {
      console.log("Invalid product ID:", id);
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // check if product exists
    // console.log("Checking if product exists...");
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true,
      },
    });

    if (!existingProduct) {
      console.log("Product not found:", productId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has related orders
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product because it has related orders" },
        { status: 400 }
      );
    }

    console.log("Product found, proceeding with deletion...");

    // Delete related records first (udah pake cascade di prisma dbnya)

    // hapus product
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    console.log("Product deleted successfully:", deletedProduct);

    return NextResponse.json({
      success: true,
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Detailed error:", error);

    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
