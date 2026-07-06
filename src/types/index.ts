export type UserRole = "Admin" | "Manager" | "Employee";

export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Product = {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  productImage: string;
};

export type Customer = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type Sale = {
  _id: string;
  customer: Customer;
  items: {
    product: string;
    productName: string;
    sku: string;
    sellingPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  grandTotal: number;
  createdBy?: User;
  createdAt: string;
  updatedAt?: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: Product[];
};
