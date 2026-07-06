import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage, imageUrl } from '../lib/api';
import { ApiResponse, DashboardStats } from '../types';

export const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card text-red-600">{getErrorMessage(error)}</div>;

  const stats = [
    { label: 'Total Products', value: data?.totalProducts ?? 0 },
    { label: 'Total Customers', value: data?.totalCustomers ?? 0 },
    { label: 'Total Sales', value: data?.totalSales ?? 0 },
    { label: 'Low Stock Items', value: data?.lowStockProducts.length ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Inventory and sales overview.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="card">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="mb-4 text-lg font-bold">Low Stock Products (Stock &lt; 5)</h2>
        {!data?.lowStockProducts.length ? (
          <p className="text-sm text-slate-500">No low stock products.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-slate-500">
                <tr>
                  <th className="py-2">Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockProducts.map((product) => (
                  <tr key={product._id} className="border-b last:border-0">
                    <td className="py-2"><img src={imageUrl(product.productImage)} className="h-10 w-10 rounded object-cover" /></td>
                    <td className="font-medium">{product.productName}</td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td className="font-semibold text-red-600">{product.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
