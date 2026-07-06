export type UserRole = "Admin" | "Manager" | "Employee";

export type PermissionKey =
  | "dashboard.view"
  | "products.view"
  | "products.create"
  | "products.update"
  | "products.delete"
  | "customers.view"
  | "customers.create"
  | "customers.update"
  | "customers.delete"
  | "sales.create"
  | "sales.view"
  | "users.manage"
  | "roles.manage";

export type PermissionGroup = {
  module: string;
  permissions: {
    key: PermissionKey;
    label: string;
  }[];
};

export type Role = {
  _id: string;
  name: UserRole;
  description?: string;
  permissions: PermissionKey[];
  isSystem: boolean;
};

export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: PermissionKey[];
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
