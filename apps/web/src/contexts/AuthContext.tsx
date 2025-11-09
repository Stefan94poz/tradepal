"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  has_account: boolean;
  metadata?: {
    role?: "buyer" | "seller" | "both";
    company_name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();

    // Set up automatic token refresh every 5 minutes
    const refreshInterval = setInterval(
      () => {
        if (user) {
          refreshUser();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = (await authApi.getMe()) as { customer: User };
      setUser(response.customer);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = (await authApi.login(email, password)) as {
      customer: User;
    };
    setUser(response.customer);

    // Store token in cookie (handled by Medusa Set-Cookie header)
  };

  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    const response = (await authApi.register(userData)) as { customer: User };
    setUser(response.customer);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);

      // Clear token cookie
      if (typeof document !== "undefined") {
        document.cookie =
          "medusa_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  };

  const refreshUser = async () => {
    try {
      const response = (await authApi.getMe()) as { customer: User };
      setUser(response.customer);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
