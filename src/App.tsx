import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProductList } from "./pages/products/ProductList";
import { ProductCreate } from "./pages/products/ProductCreate";
import { ProductEdit } from "./pages/products/ProductEdit";
import { Customers } from "./pages/customers/Customers";
import { CreateSale } from "./pages/sales/CreateSale";
import { SaleHistory } from "./pages/sales/SaleHistory";

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductCreate />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales/create" element={<CreateSale />} />
          <Route path="sales/history" element={<SaleHistory />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
