import { http } from "@/lib/http";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  phone?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  profileId?: string | null;
  profileName?: string | null;
  permissions: number;
  demandsCount: number;
};

export type UpdateProfileDto = {
  name?: string;
  phone?: string;
  areaId?: string;
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

export async function getMyProfile() {
  const { data } = await http.get<UserProfile>("/profile/me");
  return data;
}

export async function updateMyProfile(payload: UpdateProfileDto) {
  await http.put("/profile/me", payload);
}

export async function changePassword(payload: ChangePasswordDto) {
  await http.put("/profile/me/password", payload);
}
