import {prisma} from "../../app/lib/prisma";

// Helper function to convert BigInt to Number for JSON serialization
function convertBigIntToNumber(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (typeof obj === "object") {
    const converted = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }

  return obj;
}

// Product Summary Functions using VIEWs
export async function getProductSummary() {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM product_summary_view
      ORDER BY total_revenue DESC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching product summary:", error);
    throw new Error("Failed to fetch product summary");
  }
}

export async function getTopSellingProducts(limit = 5) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM product_summary_view
      WHERE total_sold > 0
      ORDER BY total_sold DESC
      LIMIT ${limit}
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    throw new Error("Failed to fetch top selling products");
  }
}

export async function getLowStockProducts() {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM product_summary_view      WHERE stock_status IN ('Low Stock', 'Out of Stock')
      ORDER BY stock ASC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    throw new Error("Failed to fetch low stock products");
  }
}

export async function getProductsByStockStatus(status) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM product_summary_view
      WHERE stock_status = ${status}      ORDER BY name ASC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching products by stock status:", error);
    throw new Error("Failed to fetch products by stock status");
  }
}

// Revenue Functions using VIEWs
export async function getDailyRevenue(days = 7) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM daily_revenue_view
      WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    throw new Error("Failed to fetch daily revenue");
  }
}

export async function getTodayRevenue() {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM daily_revenue_view
      WHERE date = CURRENT_DATE
      LIMIT 1
    `;

    const todayData = result[0] || {
      date: new Date().toISOString().split("T")[0],
      total_orders: 0,
      completed_orders: 0,
      pending_orders: 0,
      cancelled_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      highest_order: 0,
      lowest_order: 0
    };

    return convertBigIntToNumber(todayData);
  } catch (error) {
    console.error("Error fetching today revenue:", error);
    throw new Error("Failed to fetch today revenue");
  }
}

export async function getRevenueByDateRange(startDate, endDate) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM daily_revenue_view
      WHERE date BETWEEN ${startDate} AND ${endDate}
      ORDER BY date DESC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching revenue by date range:", error);
    throw new Error("Failed to fetch revenue by date range");
  }
}

// Dashboard Summary using VIEWs
export async function getDashboardSummary() {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM dashboard_summary_view
      LIMIT 1
    `;
    return convertBigIntToNumber(result[0]);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw new Error("Failed to fetch dashboard summary");
  }
}

// Category Performance using VIEWs
export async function getCategoryPerformance() {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM category_performance_view
      ORDER BY total_category_revenue DESC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching category performance:", error);
    throw new Error("Failed to fetch category performance");
  }
}

export async function getTopCategories(limit = 5) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM category_performance_view
      WHERE total_category_revenue > 0
      ORDER BY total_category_revenue DESC
      LIMIT ${limit}
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error fetching top categories:", error);
    throw new Error("Failed to fetch top categories");
  }
}

// Utility Functions
export async function searchProducts(searchTerm) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM product_summary_view
      WHERE LOWER(name) LIKE LOWER(${"%" + searchTerm + "%"})
         OR LOWER(description) LIKE LOWER(${"%" + searchTerm + "%"})
      ORDER BY total_revenue DESC
    `;
    return convertBigIntToNumber(result);
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }
}

export async function getProductAnalytics() {
  try {
    const [products, lowStock, outOfStock, topSelling] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM product_summary_view`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM product_summary_view WHERE stock_status = 'Low Stock'`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM product_summary_view WHERE stock_status = 'Out of Stock'`,
      prisma.$queryRaw`SELECT * FROM product_summary_view WHERE total_sold > 0 ORDER BY total_sold DESC LIMIT 3`
    ]);

    return convertBigIntToNumber({
      totalProducts: products[0].count,
      lowStockCount: lowStock[0].count,
      outOfStockCount: outOfStock[0].count,
      topSellingProducts: topSelling
    });
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    throw new Error("Failed to fetch product analytics");
  }
}

export async function getRevenueAnalytics(days = 30) {
  try {
    const [totalRevenue, avgRevenue, recentTrend] = await Promise.all([
      prisma.$queryRaw`
        SELECT SUM(total_revenue) as total 
        FROM daily_revenue_view 
        WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
      `,
      prisma.$queryRaw`
        SELECT AVG(total_revenue) as average 
        FROM daily_revenue_view 
        WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
      `,
      prisma.$queryRaw`
        SELECT * FROM daily_revenue_view 
        WHERE date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY date DESC
      `
    ]);

    return convertBigIntToNumber({
      totalRevenue: totalRevenue[0].total || 0,
      avgDailyRevenue: avgRevenue[0].average || 0,
      recentTrend: recentTrend
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    throw new Error("Failed to fetch revenue analytics");
  }
}
