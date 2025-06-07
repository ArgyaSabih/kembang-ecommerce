"use client";

import {useMemo} from "react";
import {Line} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WeeklyRevenueChart({weeklyData = [], loading = false}) {
  const chartData = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort by date and extract labels and values
    const sortedData = [...weeklyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric"
      });
    });
    const values = sortedData.map((item) => Number(item.revenue) || 0);

    return {
      labels,
      datasets: [
        {
          label: "Weekly Revenue",
          data: values,
          borderColor: "#EC4899",
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [weeklyData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Weekly Revenue",
        color: "#111827",
        font: {
          size: 16,
          weight: "bold"
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB"
        },
        ticks: {
          callback: function (value) {
            if (isNaN(value)) return "";
            return new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      ) : chartData.labels.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-500 text-sm">No revenue data available</span>
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
}
