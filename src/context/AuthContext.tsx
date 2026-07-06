import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      try {
        const res = await api.get<ApiResponse<User>>('/auth/me');
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
    const authData = res.data.data;
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token && user), loading, login, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
