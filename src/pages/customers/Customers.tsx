import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '../../lib/api';
import { ApiResponse, Customer } from '../../types';
import { RoleGate } from '../../components/RoleGate';

export const Customers = () => {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Customer[]>>('/customers', { params: { search, limit: 100 } });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/customers', form),
    onSuccess: () => {
      setForm({ name: '', email: '', phone: '', address: '' });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] })
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    createMutation.mutate();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-slate-500">Managers and admins can manage customers. Employees can view them for sales.</p>
      </div>

      <RoleGate roles={['Admin', 'Manager']}>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-bold">Add Customer</h2>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button className="btn-primary" disabled={createMutation.isPending}>Add Customer</button>
        </form>
      </RoleGate>

      <div className="card">
        <input className="input" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? <p>Loading customers...</p> : (
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr><th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data?.map((customer) => (
                <tr key={customer._id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{customer.name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.address || '-'}</td>
                  <td>
                    <RoleGate roles={['Admin', 'Manager']}>
                      <button className="btn-danger" onClick={() => deleteMutation.mutate(customer._id)}>Delete</button>
                    </RoleGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
