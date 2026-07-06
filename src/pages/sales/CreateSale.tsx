import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../../lib/api';
import { ApiResponse, Customer, Product } from '../../types';

type SaleRow = { product: string; quantity: number };

export const CreateSale = () => {
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState('');
  const [rows, setRows] = useState<SaleRow[]>([{ product: '', quantity: 1 }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: customers } = useQuery({
    queryKey: ['customers-for-sale'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Customer[]>>('/customers', { params: { limit: 100 } });
      return res.data.data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-sale'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product[]>>('/products', { params: { limit: 100 } });
      return res.data.data;
    }
  });

  const productMap = useMemo(() => new Map(products?.map((p) => [p._id, p]) || []), [products]);

  const grandTotal = rows.reduce((sum, row) => {
    const product = productMap.get(row.product);
    return sum + (product?.sellingPrice || 0) * Number(row.quantity || 0);
  }, 0);

  const mutation = useMutation({
    mutationFn: async () => api.post('/sales', { customer, products: rows }),
    onSuccess: () => {
      setMessage('Sale created successfully. Stock has been reduced.');
      setError('');
      setRows([{ product: '', quantity: 1 }]);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-for-sale'] });
    },
    onError: (err) => {
      setMessage('');
      setError(getErrorMessage(err));
    }
  });

  const updateRow = (index: number, key: keyof SaleRow, value: string | number) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const validRows = rows.filter((row) => row.product && row.quantity > 0);
    if (!customer) return setError('Please select a customer.');
    if (!validRows.length) return setError('Please select at least one product.');
    setRows(validRows);
    mutation.mutate();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Create Sale</h1>
        <p className="text-sm text-slate-500">Select a customer and multiple products. Total is calculated automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium">Customer</label>
          <select className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} required>
            <option value="">Select customer</option>
            {customers?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Products</h2>
            <button type="button" className="btn-secondary" onClick={() => setRows([...rows, { product: '', quantity: 1 }])}>Add Row</button>
          </div>
          {rows.map((row, index) => {
            const selected = productMap.get(row.product);
            const lineTotal = (selected?.sellingPrice || 0) * Number(row.quantity || 0);
            return (
              <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-[1fr_120px_120px_90px]">
                <select className="input" value={row.product} onChange={(e) => updateRow(index, 'product', e.target.value)}>
                  <option value="">Select product</option>
                  {products?.map((product) => (
                    <option key={product._id} value={product._id} disabled={product.stockQuantity <= 0}>
                      {product.productName} - Stock: {product.stockQuantity} - Price: {product.sellingPrice}
                    </option>
                  ))}
                </select>
                <input className="input" type="number" min="1" value={row.quantity} onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))} />
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">Total: {lineTotal}</div>
                <button type="button" className="btn-danger" onClick={() => setRows(rows.filter((_, i) => i !== index))} disabled={rows.length === 1}>Remove</button>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-slate-900 p-4 text-right text-xl font-bold text-white">Grand Total: {grandTotal}</div>
        <button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create Sale'}</button>
      </form>
    </div>
  );
};
