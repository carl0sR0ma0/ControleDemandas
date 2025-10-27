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
  const raw = localStorage.getItem("auth_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function hasPermission(mask: number, permBit: number) {
  return (mask & permBit) === permBit;
}
