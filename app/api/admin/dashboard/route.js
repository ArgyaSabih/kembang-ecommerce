import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    // total revenue dari semua order yang statusnya completed
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: "completed",
      },
    });

    // hitung pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: "pending",
      },
    });
    
    
  } catch (error) {}
}
