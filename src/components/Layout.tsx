import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Users,
  LogOut,
  History,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PermissionKey } from "../types";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: PermissionKey;
}[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    href: "/products",
    label: "Products",
    icon: Package,
    permission: "products.view",
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
    permission: "customers.view",
  },
  {
    href: "/sales/create",
    label: "Create Sale",
    icon: ShoppingCart,
    permission: "sales.create",
  },
  {
    href: "/sales/history",
    label: "Sale History",
    icon: History,
    permission: "sales.view",
  },
  {
    href: "/roles",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    permission: "roles.manage",
  },
];

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNavItems = navItems.filter((item) =>
    user?.permissions?.includes(item.permission),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-slate-900">
            Mini ERP
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-slate-600">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="card h-fit">
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
