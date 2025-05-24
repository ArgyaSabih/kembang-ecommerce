"use client";

import AdminLayout from "@/components/AdminLayout";
import WeeklyRevenueChart from "@/modules/WeeklyRevenueChart";
import { useState, useEffect } from "react";
import {
  BanknotesIcon,
  ShoppingBagIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentSales: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard data: ${res.status}`);
        }
        const data = await res.json();

        setStats({
          totalProducts: data.totalProducts,
          totalCategories: data.totalCategories,
          totalRevenue: data.totalRevenue,
          pendingOrders: data.pendingOrders,
          recentSales: data.recentSales,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // format harga idr
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to the dashboard</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">
                  Total Revenue
                </h2>
                <BanknotesIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatPrice(dashboardData.totalRevenue)}
              </h3>
              <p className="text-green-500 text-sm">+12% from last month</p>
            </div>

            {/* Total Products Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">
                  Total Products
                </h2>
                <ShoppingBagIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.totalProducts}
              </h3>
              <p className="text-green-500 text-sm">+3 new this week</p>
            </div>

            {/* Categories Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">
                  Categories
                </h2>
                <RectangleStackIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.totalCategories}
              </h3>
              <p className="text-sm">no changes</p>
            </div>

            {/* Pending Orders Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 font-medium text-sm">
                  Pending Orders
                </h2>
                <ClipboardDocumentIcon className="size-5 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.pendingOrders}
              </h3>
              <p className="text-orange-500 text-sm">Requires attention</p>
            </div>
          </div>

          {/* Weekly Revenue Chart */}
          <WeeklyRevenueChart />

          {/* Recent Sales Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Recent Sales
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
