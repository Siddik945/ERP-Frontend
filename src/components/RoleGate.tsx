import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { PermissionKey, UserRole } from "../types";

type RoleGateProps = {
  roles?: UserRole[];
  permission?: PermissionKey;
  children: ReactNode;
};

export const RoleGate = ({ roles, permission, children }: RoleGateProps) => {
  const { user } = useAuth();

  if (!user) return null;
  if (permission && !user.permissions?.includes(permission)) return null;
  if (roles?.length && !roles.includes(user.role)) return null;

  return <>{children}</>;
};
