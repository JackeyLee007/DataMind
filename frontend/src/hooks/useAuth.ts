"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string | null;
}

function getStoredAuth(): { user: User | null; token: string | null } {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  const token = localStorage.getItem("datamind_token");
  const savedUser = localStorage.getItem("datamind_user");

  if (token && savedUser) {
    try {
      const user = JSON.parse(savedUser) as User;
      return { user, token };
    } catch {
      localStorage.removeItem("datamind_token");
      localStorage.removeItem("datamind_user");
    }
  }

  return { user: null, token: null };
}

export function useAuth() {
  const stored = useMemo(() => getStoredAuth(), []);
  const [user, setUser] = useState<User | null>(stored.user);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = user !== null;

  useEffect(() => {
    const checkAuth = async () => {
      const { token } = getStoredAuth();
      if (token) {
        try {
          const result = await api.get<{ user: User }>("/api/auth/me");
          if (result.data) {
            setUser(result.data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: User }>(
      "/api/auth/login",
      { email, password }
    );

    if (result.error) {
      return { success: false, error: result.error };
    }

    const { token, user: authedUser } = result.data!;
    localStorage.setItem("datamind_token", token);
    localStorage.setItem("datamind_user", JSON.stringify(authedUser));
    setUser(authedUser);

    return { success: true };
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await api.post<{ token: string; user: User }>(
        "/api/auth/register",
        { name, email, password }
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      const { token, user: registeredUser } = result.data!;
      localStorage.setItem("datamind_token", token);
      localStorage.setItem("datamind_user", JSON.stringify(registeredUser));
      setUser(registeredUser);

      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("datamind_token");
    localStorage.removeItem("datamind_user");
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
