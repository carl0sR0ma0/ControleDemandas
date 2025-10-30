"use client";

import { PermissionsManager } from "@/components/permissions-manager"
import { PERMS, useAuthGuard } from "@/hooks/useAuthGuard"

export default function UsersPage() {
  useAuthGuard(PERMS.GerenciarUsuarios);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <PermissionsManager />
      </div>
    </div>
  )
}
