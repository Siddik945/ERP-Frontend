import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage, imageUrl } from "../../lib/api";
import { ApiResponse, Product } from "../../types";
import { Pagination } from "../../components/Pagination";
import { PermissionGate } from "../../components/PermissionGate";

export const ProductList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", search, page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product[]>>("/products", {
        params: { search, page, limit: 10 },
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-500">
            Search, paginate, add, edit, and delete inventory.
          </p>
        </div>
        <PermissionGate permission="products.create">
          <Link to="/products/create" className="btn-primary text-center">
            Add Product
          </Link>
        </PermissionGate>
      </div>

      <div className="card">
        <input
          className="input"
          placeholder="Search by name, SKU, or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-600">{getErrorMessage(error)}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-2">Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Buy</th>
                <th>Sell</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((product) => (
                <tr key={product._id} className="border-b last:border-0">
                  <td className="py-2">
                    <img
                      src={imageUrl(product.productImage)}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="font-medium">{product.productName}</td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{product.purchasePrice}</td>
                  <td>{product.sellingPrice}</td>
                  <td
                    className={
                      product.stockQuantity < 5
                        ? "font-semibold text-red-600"
                        : ""
                    }
                  >
                    {product.stockQuantity}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <PermissionGate permission="products.update">
                        <Link
                          className="btn-secondary"
                          to={`/products/${product._id}/edit`}
                        >
                          Edit
                        </Link>
                      </PermissionGate>
                      <PermissionGate permission="products.delete">
                        <button
                          className="btn-danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm("Delete this product?"))
                              deleteMutation.mutate(product._id);
                          }}
                        >
                          Delete
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.meta && (
        <Pagination
          page={page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
