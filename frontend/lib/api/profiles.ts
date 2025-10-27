import { http } from "@/lib/http";

export type ProfileVm = {
  id: string;
  name: string;
  active: boolean;
  permissions: number;
  userCount: number;
  // optional UI customization for badges
  badgeClass?: string;
};

export async function getProfiles() {
  const { data } = await http.get<ProfileVm[]>("/profiles");
  return data;
}

export async function createProfile(payload: { name: string; active?: boolean; permissionCodes?: string[]; badgeClass?: string }) {
  const { data } = await http.post<{ id: string }>("/profiles", {
    name: payload.name,
    active: payload.active ?? true,
    permissionCodes: payload.permissionCodes ?? [],
    badgeClass: payload.badgeClass,
  });
  return data;
}

export async function updateProfile(id: string, payload: { name?: string; active?: boolean; badgeClass?: string }) {
  await http.put(`/profiles/${id}`, payload);
}

export async function setProfilePermissions(id: string, codes: string[]) {
  await http.put(`/profiles/${id}/permissions`, { permissionCodes: codes });
}

export async function deleteProfile(id: string) {
  await http.delete(`/profiles/${id}`);
}

export async function applyProfileToUser(userId: string, profileId: string) {
  const { data } = await http.post<{ id: string; permissions: number }>(`/profiles/apply/${userId}?profileId=${encodeURIComponent(profileId)}`);
  return data;
}
