import { http } from "@/lib/http";
import type { AuthUser } from "@/types/api";

type LoginResponse = { token: string; user: AuthUser };

export async function login(params: { email: string; password: string }) {
  const { data } = await http.post<LoginResponse>("/auth/login", params);
  return data;
}

