import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '../../lib/api';
import { ApiResponse, Product } from '../../types';
import { ProductForm } from './ProductForm';

export const ProductEdit = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id)
  });

  if (isLoading) return <div className="card">Loading product...</div>;
  if (error) return <div className="card text-red-600">{getErrorMessage(error)}</div>;
  if (!data) return <div className="card">Product not found.</div>;

  return <ProductForm product={data} />;
};
