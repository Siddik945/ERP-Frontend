import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "../../components/Pagination";
import { api, getErrorMessage } from "../../lib/api";
import { ApiResponse, Sale } from "../../types";

const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export const SaleHistory = () => {
  const [page, setPage] = useState(1);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sales", page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Sale[]>>("/sales", {
        params: { page, limit: 10 },
      });
      return res.data;
    },
  });

  const toggleExpanded = (saleId: string) => {
    setExpandedSaleId((current) => (current === saleId ? null : saleId));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sale History</h1>
        <p className="text-sm text-slate-500">
          View previous sales, sold items, quantities, totals, customers, and
          sellers.
        </p>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <p>Loading sale history...</p>
        ) : error ? (
          <p className="text-red-600">{getErrorMessage(error)}</p>
        ) : !data?.data.length ? (
          <p className="text-slate-500">No sales found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Sold By</th>
                <th className="text-right">Grand Total</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((sale) => {
                const isExpanded = expandedSaleId === sale._id;

                return (
                  <tr
                    key={sale._id}
                    className="border-b last:border-0 align-top"
                  >
                    <td className="py-3 whitespace-nowrap">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">
                        {sale.customer?.name || "Unknown customer"}
                      </div>
                      {sale.customer?.phone && (
                        <div className="text-xs text-slate-500">
                          {sale.customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <div>
                        {sale.items.length} product
                        {sale.items.length > 1 ? "s" : ""}
                      </div>
                      {isExpanded && (
                        <div className="mt-3 overflow-hidden rounded-lg border">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500">
                              <tr>
                                <th className="px-3 py-2 text-left">Product</th>
                                <th className="px-3 py-2 text-left">SKU</th>
                                <th className="px-3 py-2 text-right">Price</th>
                                <th className="px-3 py-2 text-right">Qty</th>
                                <th className="px-3 py-2 text-right">
                                  Line Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {sale.items.map((item) => (
                                <tr
                                  key={`${sale._id}-${item.sku}`}
                                  className="border-t"
                                >
                                  <td className="px-3 py-2 font-medium">
                                    {item.productName}
                                  </td>
                                  <td className="px-3 py-2">{item.sku}</td>
                                  <td className="px-3 py-2 text-right">
                                    {item.sellingPrice}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold">
                                    {item.lineTotal}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                    <td className="py-3">{sale.createdBy?.name || "N/A"}</td>
                    <td className="py-3 text-right font-bold">
                      {sale.grandTotal}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="btn-secondary"
                        onClick={() => toggleExpanded(sale._id)}
                      >
                        {isExpanded ? "Hide" : "View"} Details
                      </button>
                    </td>
                  </tr>
                );
              })}
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
