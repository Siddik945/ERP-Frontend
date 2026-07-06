import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const RoleGate = ({ roles, children }: { roles: UserRole[]; children: ReactNode }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
};
