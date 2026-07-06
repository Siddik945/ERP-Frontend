import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../../lib/api';
import { Product } from '../../types';

type ProductFormProps = {
  product?: Product;
};

export const ProductForm = ({ product }: ProductFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    productName: product?.productName || '',
    sku: product?.sku || '',
    category: product?.category || '',
    purchasePrice: product?.purchasePrice?.toString() || '',
    sellingPrice: product?.sellingPrice?.toString() || '',
    stockQuantity: product?.stockQuantity?.toString() || ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);
      if (product) return api.patch(`/products/${product._id}`, data);
      return api.post('/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!product && !image) {
      setError('Product image is required while creating a product.');
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h1>
        <p className="text-sm text-slate-500">Create or update inventory item information.</p>
      </div>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Product Name</label>
          <input className="input" value={form.productName} onChange={(e) => handleChange('productName', e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">SKU</label>
          <input className="input" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <input className="input" value={form.category} onChange={(e) => handleChange('category', e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Purchase Price</label>
          <input className="input" type="number" min="0" value={form.purchasePrice} onChange={(e) => handleChange('purchasePrice', e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Selling Price</label>
          <input className="input" type="number" min="0" value={form.sellingPrice} onChange={(e) => handleChange('sellingPrice', e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock Quantity</label>
          <input className="input" type="number" min="0" value={form.stockQuantity} onChange={(e) => handleChange('stockQuantity', e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Product Image {product ? '(optional)' : '(required)'}</label>
        <input className="input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Product'}</button>
        <button type="button" className="btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
      </div>
    </form>
  );
};
