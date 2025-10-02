"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const PERMS = {
  AcessarDashboard: 1,       // mesmo bit do backend
  VisualizarDemandas: 2,
  RegistrarDemandas: 4,
  EditarStatus: 8,
  Aprovar: 16,
  GerenciarUsuarios: 32,
};

export function useAuthGuard(requiredPermission?: number) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    const rawUser = localStorage.getItem("auth_user");

    if (!token || !rawUser) {
      router.replace("/"); // volta pro login
      return;
    }

    if (requiredPermission) {
      try {
        const user = JSON.parse(rawUser);
        const has = (user.permissions & requiredPermission) === requiredPermission;
        
        if (!has) router.replace("/"); // sem permissão -> volta
      } catch {
        router.replace("/");
      }
    }
  }, [router, requiredPermission]);
}