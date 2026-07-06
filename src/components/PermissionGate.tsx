import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { PermissionKey } from "../types";

export const PermissionGate = ({
  permission,
  children,
}: {
  permission: PermissionKey;
  children: ReactNode;
}) => {
  const { user } = useAuth();
  if (!user?.permissions?.includes(permission)) return null;
  return <>{children}</>;
};
