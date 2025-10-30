import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { login as apiLogin } from "@/lib/api/auth";
import type { AuthUser } from "../types/api";

type LoginResponse = { token: string; user: AuthUser };

export function useLogin() {
  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const data = await apiLogin(params);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      return data.user;
    },
  });
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return { user };
}

export function hasPermission(mask: number, permBit: number) {
  return (mask & permBit) === permBit;
}
