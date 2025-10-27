import { http } from "@/lib/http";

export type CatalogItem = { code: string; value: number; name: string; description: string; category: string };
export type RolePreset = { role: string; permissions: number };
export type UserRow = { id: string; name: string; email: string; role: string; active: boolean; permissions: number; createdAt: string; isSpecial?: boolean; profile?: string; profileId?: string };

export async function getCatalog() {
  const { data } = await http.get<CatalogItem[]>("/permissions/catalog");
  return data;
}

export async function getRolePresets() {
  const { data } = await http.get<RolePreset[]>("/permissions/roles");
  return data;
}

export async function listUsers() {
  const { data } = await http.get<UserRow[]>("/permissions/users");
  return data;
}

export async function applyRole(userId: string, role: string) {
  await http.post(`/permissions/apply-role/${userId}?role=${encodeURIComponent(role)}`);
}

// Nota: atualização de permissões de usuário é feita via lib/api/users.ts
