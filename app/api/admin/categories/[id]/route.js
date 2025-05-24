import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET categori by "id"
export async function GET(request, { params }) {
  try {
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...category,
      productCount: category._count.products,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// UPDATE category by "id" dengan PUT
export async function PUT(request, { params }) {
  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();  
    const { name } = body;

    // memvalidasi input dulu
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // cek apakah ada duplikasi
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: {
          not: categoryId
        }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    return NextResponse.json({
      ...updatedCategory,
      productCount: updatedCategory._count.products
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}