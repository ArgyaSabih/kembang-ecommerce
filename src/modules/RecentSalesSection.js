import {formatCurrency} from "@/utils/formatCurrency";

export default function RecentSalesSection({recentSales = [], loading = false}) {
  return (
    <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Sales</h2>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : recentSales.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-500">No recent sales found</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{sale.customer}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{sale.product}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{sale.date}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(sale.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.status === "COMPLETED" || sale.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
