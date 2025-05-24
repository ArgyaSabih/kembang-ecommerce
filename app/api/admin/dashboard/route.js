import { prisma } from "/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await prisma.$connect();

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
        items: {
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
        status: "completed",
        createdAt: {
          gte: sevenDaysAgo, // gte = greater than or equal to
          lte: today, // lte = less than or equal to
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // pengelompokan berdasarkan hari tanggalnya
    const weeklyRevenueByDay = weeklyRevenue.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
    }, {});

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      recentSales: formattedRecentSales,
      weeklyRevenue: weeklyRevenueByDay,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    if (error.code === "P1001") {
      return NextResponse.json(
        {
          error:
            "Cannot connect to database. Please check your .env file and database status.",
        },
        { status: 500 }
      );
    }
    if (error.code === "P2021") {
      return NextResponse.json(
        {
          error:
            "Database table missing. Please run `npx prisma db push` or `npx prisma migrate dev`.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error.message,
        code: error.code || "unknown",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
