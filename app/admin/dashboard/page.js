"use client";

import AdminLayout from "@/components/AdminLayout";
import WeeklyRevenueChart from "@/modules/WeeklyRevenueChart";
import RecentSalesSection from "@/modules/RecentSalesSection";
import {formatCurrency} from "@/utils/formatCurrency";
import {useState, useEffect} from "react";
import {
  BanknotesIcon,
  ShoppingBagIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    pendingOrders: 0,
    productsInStock: 0,
    productsOutOfStock: 0,
    productsLowStock: 0,
    lowStockProducts: [],
    topProducts: [],
    recentSales: [],
    weeklyRevenue: {},
    weeklyRevenueDetails: [],
    analytics: null,
    dataSource: "traditional",
    fallback: false
  });
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard data: ${res.status}`);
        }

        // Check if response has content
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const text = await res.text();
        if (!text.trim()) {
          throw new Error("Server returned empty response");
        }

        const data = JSON.parse(text);
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set fallback data to prevent UI from breaking
        setStats((prev) => ({
          ...prev,
          fallback: true,
          error: error.message
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome to Kembangku Admin Dashboard</p>
          </div>
          <div className="text-sm text-gray-400">
            {stats.dataSource === "database_views" && !stats.fallback && (
              <span className="text-green-600 font-medium">⚡ Powered by Database VIEWs</span>
            )}
            {stats.fallback && <span className="text-orange-600 font-medium">⚠️ Fallback Mode</span>}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <>
          {/* Main Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">Total Revenue</h2>
                <BanknotesIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="text-gray-500 text-sm">All time revenue</p>
            </div>
            {/* Today Revenue Card */}{" "}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">Today&apos;s Revenue</h2>
                <CalendarDaysIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</h3>
              <p className="text-blue-500 text-sm">Today&apos;s earnings</p>
            </div>
            {/* Week Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">This Week</h2>
                <ArrowTrendingUpIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weekRevenue)}</h3>
              <p className="text-green-500 text-sm">Weekly performance</p>
            </div>
            {/* Pending Orders Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">Pending Orders</h2>
                <ClipboardDocumentIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
              <p className={`text-sm ${stats.pendingOrders > 0 ? "text-orange-500" : "text-gray-500"}`}>
                {stats.pendingOrders > 0 ? "Requires attention" : "All orders processed"}
              </p>
            </div>
          </div>
          {/* Inventory Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">Total Products</h2>
                <ShoppingBagIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
              <p className="text-gray-500 text-sm">{stats.totalCategories} categories</p>
            </div>

            {/* In Stock Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">In Stock</h2>
                <RectangleStackIcon className="size-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">{stats.productsInStock}</h3>
              <p className="text-green-500 text-sm">Available products</p>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">Low Stock</h2>
                <ExclamationTriangleIcon className="size-5 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-orange-600">{stats.productsLowStock}</h3>
              <p className="text-orange-500 text-sm">Need restocking</p>
            </div>

            {/* Out of Stock Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">Out of Stock</h2>
                <ExclamationTriangleIcon className="size-5 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">{stats.productsOutOfStock}</h3>
              <p className="text-red-500 text-sm">Urgent attention</p>
            </div>
          </div>{" "}
          {/* Top Selling Products */}
          {stats.topProducts && stats.topProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.topProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">Sold: {product.totalSold} units</p>
                    <p className="text-sm text-green-600">Revenue: {formatCurrency(product.totalRevenue)}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        product.salesPerformance === "High Performance"
                          ? "bg-green-100 text-green-800"
                          : product.salesPerformance === "Good Performance"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.salesPerformance}
                    </span>
                  </div>
                ))}
              </div>{" "}
            </div>
          )}
          {/* Weekly Revenue Chart */}
          <WeeklyRevenueChart weeklyData={stats.weeklyRevenueDetails} loading={isLoading} />
          {/* Recent Sales Section */}
          <RecentSalesSection recentSales={stats.recentSales} loading={isLoading} />
        </>
      )}
    </AdminLayout>
  );
}
