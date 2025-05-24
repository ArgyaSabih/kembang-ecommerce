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
              products: true
            }
          }
        }
      });
  
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        ...category,
        productCount: category._count.products
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch category" },
        { status: 500 }
      );
    }
  }