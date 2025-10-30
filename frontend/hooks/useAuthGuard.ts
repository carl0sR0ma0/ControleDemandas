"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const PERMS = {
  AcessarDashboard: 1,       // bit 0 (2^0)
  VisualizarDemandas: 2,     // bit 1 (2^1)
  RegistrarDemandas: 4,      // bit 2 (2^2)
  EditarStatus: 8,           // bit 3 (2^3)
  EditarDemanda: 16,         // bit 4 (2^4)
  NotificarEmail: 32,        // bit 5 (2^5)
  GerenciarUsuarios: 64,     // bit 6 (2^6)
  GerenciarPerfis: 128,      // bit 7 (2^7)
  Configuracoes: 256,        // bit 8 (2^8)
};

/**
 * Hook para verificar se o usuário tem uma permissão específica
 */
export function useHasPermission(requiredPermission: number): boolean {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawUser = localStorage.getItem("auth_user");
    if (!rawUser) {
      setHasPermission(false);
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      const has = (user.permissions & requiredPermission) === requiredPermission;
      setHasPermission(has);
    } catch {
      setHasPermission(false);
    }
  }, [requiredPermission]);

  return hasPermission;
}

export function useAuthGuard(requiredPermission?: number) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    const rawUser = localStorage.getItem("auth_user");

    if (!token || !rawUser) {
      router.replace("/"); // sem sessão -> volta pro login
      return;
    }

    if (requiredPermission) {
      try {
        const user = JSON.parse(rawUser);
        const has = (user.permissions & requiredPermission) === requiredPermission;

        if (!has) router.replace("/home"); // sem permissão -> volta pra home
      } catch {
        router.replace("/");
      }
    }
  }, [router, requiredPermission]);
}