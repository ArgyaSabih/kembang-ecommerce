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

    // mgeformat recent sales
    const formattedRecentSales = recentSales.map((order) => ({
      id: order.id,
      customer: order.customerName,
      product:
        order.items[0]?.product.name +
        (order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ""),
      date: order.createdAt.toISOString().split("T")[0],
      amount: order.totalAmount,
      status: order.status,
    }));

    // pendapatan satu minggu terakhir
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyRevenue = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: sevenDaysAgo, // gte = greater than or equal to
          lte: today, // lte = less than or equal to
        },
      },
      select: {
        totalAmount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

  } catch (error) {}
}
