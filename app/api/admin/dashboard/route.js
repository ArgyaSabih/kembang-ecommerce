import {prisma} from "/app/lib/prisma";
import {NextResponse} from "next/server";
import {
  getDashboardSummary,
  getTopSellingProducts,
  getDailyRevenue,
  getLowStockProducts,
  getTodayRevenue,
  getProductAnalytics,
  getRevenueAnalytics
} from "../../../../src/lib/database";

export async function GET(request) {
  try {
    console.log("🔄 Fetching dashboard data using VIEWs...");
    // Parallel execution untuk performance optimal dengan VIEWs
    const [summary, topProducts, lowStockProducts, todayRevenue] = await Promise.all([
      getDashboardSummary(),
      getTopSellingProducts(5),
      getLowStockProducts(),
      getTodayRevenue()
    ]);

    // Get weekly revenue dengan traditional query sebagai fallback yang lebih reliable
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyRevenueData = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {gte: weekAgo}
      },
      select: {
        totalAmount: true,
        createdAt: true
      },
      orderBy: {createdAt: "desc"}
    });

    // Fetch recent sales dengan traditional query (tetap diperlukan untuk detail)
    const recentSales = await prisma.order.findMany({
      where: {
        status: "COMPLETED"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }); // Format recent sales
    const formattedRecentSales = recentSales.map((order) => ({
      id: order.id,
      customer: order.customerName,
      product:
        order.items[0]?.product.name + (order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ""),
      date:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString().split("T")[0]
          : new Date(order.createdAt).toISOString().split("T")[0],
      amount: order.totalAmount,
      status: order.status
    })); // Format weekly revenue untuk chart
    const weeklyRevenueFormatted = {};
    const dailyRevenue = {};

    // Group orders by date and calculate daily revenue
    weeklyRevenueData.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += Number(order.totalAmount);
    });

    // Format for chart (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      weeklyRevenueFormatted[dateStr] = dailyRevenue[dateStr] || 0;
    }

    // Format detailed weekly data for charts
    const weeklyRevenueDetails = Object.entries(weeklyRevenueFormatted).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue),
      orders: weeklyRevenueData.filter(
        (order) => new Date(order.createdAt).toISOString().split("T")[0] === date
      ).length,
      avgOrderValue:
        revenue > 0
          ? revenue /
            Math.max(
              1,
              weeklyRevenueData.filter(
                (order) => new Date(order.createdAt).toISOString().split("T")[0] === date
              ).length
            )
          : 0
    }));
    const responseData = {
      // Data dari VIEWs (performance optimized)
      totalProducts: Number(summary.total_products),
      totalCategories: Number(summary.total_categories),
      totalRevenue: Number(summary.month_revenue || 0), // Total revenue bulan ini
      todayRevenue: Number(todayRevenue?.total_revenue || 0),
      weekRevenue: Number(Object.values(weeklyRevenueFormatted).reduce((sum, val) => sum + val, 0)),
      pendingOrders: Number(summary.pending_orders),

      // Stock alerts dari VIEWs
      productsInStock: Number(summary.products_in_stock),
      productsOutOfStock: Number(summary.products_out_of_stock),
      productsLowStock: Number(summary.products_low_stock),
      lowStockProducts: lowStockProducts,

      // Top performers dari VIEWs
      topProducts: topProducts.map((product) => ({
        id: Number(product.id),
        name: product.name,
        totalSold: Number(product.total_sold),
        totalRevenue: Number(product.total_revenue),
        stockStatus: product.stock_status,
        salesPerformance: product.sales_performance
      })),

      // Recent sales (traditional query untuk detail)
      recentSales: formattedRecentSales,

      // Weekly revenue dari simplified calculation
      weeklyRevenue: weeklyRevenueFormatted,
      weeklyRevenueDetails: weeklyRevenueDetails,

      // Metadata
      generatedAt: new Date().toISOString(),
      dataSource: "database_views",
      timestamp: new Date().toISOString()
    };

    console.log("✅ Dashboard data fetched successfully using VIEWs");

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
      }
    });
  } catch (error) {
    console.error("Dashboard API Error (VIEWs approach):", error);

    // Fallback ke traditional approach jika VIEWs gagal
    console.log("⚠️ Falling back to traditional queries...");

    try {
      await prisma.$connect();

      const [totalProducts, totalCategories, totalRevenueAgg, pendingOrders] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.order.aggregate({
          _sum: {totalAmount: true},
          where: {status: "COMPLETED"}
        }),
        prisma.order.count({where: {status: "PENDING"}})
      ]);

      // Fallback response dengan traditional queries
      return NextResponse.json({
        totalProducts,
        totalCategories,
        totalRevenue: totalRevenueAgg._sum.totalAmount || 0,
        pendingOrders,
        recentSales: [],
        weeklyRevenue: {},
        fallback: true,
        error: "VIEWs not available, using fallback data"
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);

      if (error.code === "P1001") {
        return NextResponse.json(
          {
            error: "Cannot connect to database. Please check your .env file and database status."
          },
          {status: 500}
        );
      }
      if (error.code === "P2021") {
        return NextResponse.json(
          {
            error: "Database table missing. Please run `npx prisma db push` or `npx prisma migrate dev`."
          },
          {status: 500}
        );
      }
      return NextResponse.json(
        {
          error: "Failed to fetch dashboard data",
          details: error.message,
          code: error.code || "unknown",
          timestamp: new Date().toISOString()
        },
        {status: 500}
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
