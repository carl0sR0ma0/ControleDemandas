import { http } from "@/lib/http";

export type UserRow = { id: string; name: string; email: string; role: string; active: boolean; createdAt: string; areaId?: string | null; area?: string | null };

export async function listUsers() {
  const { data } = await http.get<UserRow[]>("/users");
  return data;
}

export async function getUser(id: string) {
  const { data } = await http.get<{ id: string; name: string; email: string; role: string; active: boolean; createdAt: string; permissions: number; areaId?: string | null; area?: string | null }>(`/users/${id}`);
  return data;
}

export async function createUser(payload: { name: string; email: string; password: string; phone?: string; role?: string; profileId?: string; areaId?: string; permissionCodes?: string[] }) {
  const { data } = await http.post<{ id: string }>("/users", { role: "Colaborador", ...payload, permissionCodes: payload.permissionCodes ?? [] });
  return data;
}

export async function updateUser(id: string, payload: { name?: string; email?: string; phone?: string; role?: string; active?: boolean; password?: string; profileId?: string; areaId?: string }) {
  await http.put(`/users/${id}`, payload);
}

export async function deleteUser(id: string) {
  await http.delete(`/users/${id}`);
}

export async function updateUserPermissions(id: string, permissionCodes: string[]) {
  await http.put(`/users/${id}/permissions`, { permissionCodes });
}
