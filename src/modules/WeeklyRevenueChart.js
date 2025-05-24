"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function WeeklyRevenueChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          throw new Error("Failed to fetch revenue data");
        }
        const data = await res.json();
        const weeklyRevenue = data.weeklyRevenue;

        // Sort dates and get last 7 days
        const dates = Object.keys(weeklyRevenue).sort();
        const values = dates.map((date) => weeklyRevenue[date]);

        setChartData({
          labels: dates,
          datasets: [
            {
              label: "Weekly Revenue",
              data: values,
              borderColor: "#EC4899",
              backgroundColor: "rgba(236, 72, 153, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Weekly Revenue",
        color: "#111827",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
        },
        ticks: {
          callback: function (value) {
            if (isNaN(value)) return "";
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
}
