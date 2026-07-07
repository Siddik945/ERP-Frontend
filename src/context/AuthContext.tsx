import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { loadMe, loginUser, logoutUser } from "../redux/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { User } from "../types";

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
  const dispatch = useAppDispatch();

  const { user, token, loading, initialized } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (token && !initialized) {
      void dispatch(loadMe());
    }
  }, [dispatch, token, initialized]);

  const login = async (email: string, password: string): Promise<void> => {
    await dispatch(
      loginUser({
        email,
        password,
      }),
    ).unwrap();
  };

  const logout = (): void => {
    dispatch(logoutUser());
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
