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

    // ambil 5 data penjualan terakhir (recent sales)
    const recentSales = await prisma.order.findMany({
      where: {
        status: "completed",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    
    
  } catch (error) {}
}
