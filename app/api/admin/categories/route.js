import { NextResponse } from "next/server";
import { prisma } from "/app/lib/prisma";

// GET all cat
export async function GET() {
  try {
    await prisma.$connect();
    // console.log("Database berhasil connect!");

    const count = await prisma.category.count();
    console.log(`Total categories in database: ${count}`);

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    console.log("Categories fetched successfully");

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category._count.products,
      createdAt: category.createdAt,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST category baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    // validasi inputnya
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // apakah category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    // BUAT KATEGORI BARU
    const category = await prisma.category.create({
      data: { name }
    });

    return NextResponse.json({
      ...category,
      productCount: 0
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
} 