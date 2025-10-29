import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  type UpdateProfileDto,
  type ChangePasswordDto,
} from "@/lib/api/profile";

export function useProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileDto) => updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      // Atualiza também o localStorage para refletir mudanças imediatamente
      queryClient.refetchQueries({ queryKey: ["profile", "me"] }).then(() => {
        const profileData = queryClient.getQueryData<any>(["profile", "me"]);
        if (profileData) {
          const currentUser = localStorage.getItem("auth_user");
          if (currentUser) {
            const user = JSON.parse(currentUser);
            localStorage.setItem("auth_user", JSON.stringify({
              ...user,
              name: profileData.name,
            }));
          }
        }
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordDto) => changePassword(payload),
  });
}
